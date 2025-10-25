#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, 
    panic_with_error,
    token, 
    Address, Env, Map, String, Vec,
};

// --- Data Structures ---
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Provider {
    pub id: Address,         
    pub gpu_model: String,   
    pub price_per_hour: u128, 
    pub registered_at: u64,  
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Rental {
    pub id: u64,             
    pub consumer: Address,   
    pub provider: Address,   
    pub start_time: u64,     
    pub end_time: u64,       
    pub duration_hours: u64, 
    pub total_cost: u128,    
    pub is_active: bool,     
    pub job_complete: bool,  
    pub is_paid: bool,       
}

// --- Storage Keys ---
#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,           
    Providers,       
    Rentals,         
    NextRentalId,    
    TokenAddress,    
}

// --- Contract Errors ---
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,         
    ProviderNotFound = 4,
    RentalNotFound = 5,
    InvalidDuration = 6,      
    InsufficientFunds = 7,    // Not used in tests, but good to keep
    RentalNotActive = 8,
    RentalAlreadyCompleted = 9,
    CallerNotConsumer = 10,
    MathOverflow = 11,
    PriceMustBePositive = 12,
}

#[contract]
pub struct SparkNetContract;

// --- Contract Implementation ---
#[contractimpl]
impl SparkNetContract {
    
    // ... (initialize, register, get_providers, rent_gpu are all the same) ...

    pub fn initialize(env: Env, admin: Address, token_address: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, ContractError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenAddress, &token_address);
        env.storage().instance().set(&DataKey::Providers, &Map::<Address, Provider>::new(&env));
        env.storage().instance().set(&DataKey::Rentals, &Map::<u64, Rental>::new(&env));
        env.storage().instance().set(&DataKey::NextRentalId, &0u64);
    }

    pub fn register(
        env: Env, 
        provider_address: Address, 
        gpu_model: String, 
        price_per_hour: u128
    ) -> Provider { 
        provider_address.require_auth();

        if price_per_hour == 0 {
            panic_with_error!(&env, ContractError::PriceMustBePositive);
        }

        let mut providers = Self::get_providers_map(&env);
        let new_provider = Provider {
            id: provider_address.clone(),
            gpu_model,
            price_per_hour,
            registered_at: env.ledger().timestamp(),
        };

        providers.set(provider_address, new_provider.clone());
        env.storage().instance().set(&DataKey::Providers, &providers);
        new_provider 
    }

    pub fn get_providers(env: Env) -> Vec<Provider> {
        let providers_map = Self::get_providers_map(&env);
        providers_map.values()
    }

    pub fn rent_gpu(
        env: Env,
        consumer_address: Address,
        provider_address: Address,
        duration_hours: u64,
    ) -> Rental {
        consumer_address.require_auth();

        if duration_hours == 0 {
            panic_with_error!(&env, ContractError::InvalidDuration);
        }

        let providers = Self::get_providers_map(&env);
        let provider = providers.get(provider_address.clone())
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::ProviderNotFound));

        let total_cost = provider.price_per_hour
            .checked_mul(duration_hours as u128)
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::MathOverflow));
        
        let token_address = Self::get_token_address(&env);
        let token_client = token::Client::new(&env, &token_address);
        
        token_client.transfer(
            &consumer_address, 
            &env.current_contract_address(), 
            &(total_cost as i128)
        );

        let start_time = env.ledger().timestamp();
        let duration_seconds = duration_hours.checked_mul(3600).unwrap();
        let end_time = start_time.checked_add(duration_seconds).unwrap();

        let mut rentals = Self::get_rentals_map(&env);
        let rental_id = Self::get_and_increment_next_rental_id(&env);

        let new_rental = Rental {
            id: rental_id,
            consumer: consumer_address,
            provider: provider_address,
            start_time,
            end_time,
            duration_hours,
            total_cost,
            is_active: true,
            job_complete: false,
            is_paid: false,
        };

        rentals.set(rental_id, new_rental.clone());
        env.storage().instance().set(&DataKey::Rentals, &rentals);

        new_rental
    }

    // --- NEW ---
    /// Marks a rental as complete and releases payment to the provider.
    ///
    /// # Arguments
    /// * `consumer_address` - The wallet address of the consumer (must be the caller).
    /// * `rental_id` - The ID of the rental to complete.
    ///
    /// # Panics
    /// * If `consumer_address` is not authorized.
    /// * If `rental_id` is not found.
    /// * If the caller is not the consumer for this rental.
    /// * If the rental is already completed/paid.
    pub fn complete_job(
        env: Env,
        consumer_address: Address,
        rental_id: u64,
    ) -> Rental {
        // 1. Authorize consumer
        consumer_address.require_auth();

        // 2. Get rental from storage
        let mut rentals = Self::get_rentals_map(&env);
        let mut rental = rentals.get(rental_id)
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::RentalNotFound));

        // 3. Verify caller is the consumer
        if rental.consumer != consumer_address {
            panic_with_error!(&env, ContractError::CallerNotConsumer);
        }

        // 4. Check if already completed
        if rental.job_complete || rental.is_paid {
            panic_with_error!(&env, ContractError::RentalAlreadyCompleted);
        }

        // (Optional check: ensure job is still active)
        // if !rental.is_active {
        //     panic_with_error!(&env, ContractError::RentalNotActive);
        // }

        // 5. Release payment from escrow (Contract -> Provider)
        let token_address = Self::get_token_address(&env);
        let token_client = token::Client::new(&env, &token_address);

        token_client.transfer(
            &env.current_contract_address(), // From: this contract
            &rental.provider,                // To: the provider
            &(rental.total_cost as i128)     // Amount
        );

        // 6. Update rental state
        rental.is_active = false;
        rental.job_complete = true;
        rental.is_paid = true;

        // 7. Save and return
        rentals.set(rental_id, rental.clone());
        env.storage().instance().set(&DataKey::Rentals, &rentals);
        
        rental
    }


    // --- View Functions for Rentals ---
    // (Same as before)
    pub fn get_rental_by_id(env: Env, rental_id: u64) -> Rental {
        Self::get_rentals_map(&env)
            .get(rental_id)
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::RentalNotFound))
    }

    pub fn get_rentals_for_consumer(env: Env, consumer_address: Address) -> Vec<Rental> {
        let mut result_vec = Vec::new(&env);
        for rental in Self::get_rentals_map(&env).values() {
            if rental.consumer == consumer_address {
                result_vec.push_back(rental);
            }
        }
        result_vec
    }

    pub fn get_rentals_for_provider(env: Env, provider_address: Address) -> Vec<Rental> {
        let mut result_vec = Vec::new(&env);
        for rental in Self::get_rentals_map(&env).values() {
            if rental.provider == provider_address {
                result_vec.push_back(rental);
            }
        }
        result_vec
    }


    // --- Helper Functions ---
    // (Same as before)
    fn get_providers_map(env: &Env) -> Map<Address, Provider> {
        env.storage().instance().get(&DataKey::Providers).unwrap_or_else(|| Map::new(env))
    }
    
    fn get_rentals_map(env: &Env) -> Map<u64, Rental> {
        env.storage().instance().get(&DataKey::Rentals).unwrap_or_else(|| Map::new(env))
    }

    fn get_and_increment_next_rental_id(env: &Env) -> u64 {
        let current_id = env.storage().instance().get(&DataKey::NextRentalId).unwrap_or(0u64); 
        let next_id = current_id.checked_add(1).unwrap_or_else(|| panic_with_error!(env, ContractError::MathOverflow));
        env.storage().instance().set(&DataKey::NextRentalId, &next_id);
        current_id
    }

    fn get_token_address(env: &Env) -> Address {
        env.storage().instance().get(&DataKey::TokenAddress)
            .unwrap_or_else(|| panic_with_error!(env, ContractError::NotInitialized))
    }
}
