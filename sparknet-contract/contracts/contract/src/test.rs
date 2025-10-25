#![cfg(test)]

use super::*;
use soroban_sdk::{vec, Env, String, Address, testutils::Address as _};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, SparkNetContract);
    let client = SparkNetContractClient::new(&env, &contract_id);

    // Create test addresses
    let admin = Address::generate(&env);
    let token_address = Address::generate(&env);

    // Initialize the contract
    client.initialize(&admin, &token_address);

    // Verify initialization by checking if we can get providers (should be empty)
    let providers = client.get_providers();
    assert_eq!(providers.len(), 0);
}

#[test]
fn test_register_provider() {
    let env = Env::default();
    let contract_id = env.register_contract(None, SparkNetContract);
    let client = SparkNetContractClient::new(&env, &contract_id);

    // Create test addresses
    let admin = Address::generate(&env);
    let token_address = Address::generate(&env);
    let provider = Address::generate(&env);

    // Initialize the contract
    client.initialize(&admin, &token_address);

    // Register a provider
    let gpu_model = String::from_str(&env, "RTX 4090");
    let price_per_hour = 1000u128;

    let provider_info = client.register(&provider, &gpu_model, &price_per_hour);
    
    assert_eq!(provider_info.id, provider);
    assert_eq!(provider_info.gpu_model, gpu_model);
    assert_eq!(provider_info.price_per_hour, price_per_hour);
}

#[test]
#[should_panic(expected = "ContractError(AlreadyInitialized)")]
fn test_initialize_twice() {
    let env = Env::default();
    let contract_id = env.register_contract(None, SparkNetContract);
    let client = SparkNetContractClient::new(&env, &contract_id);

    // Create test addresses
    let admin = Address::generate(&env);
    let token_address = Address::generate(&env);

    // Initialize the contract
    client.initialize(&admin, &token_address);

    // Try to initialize again - should panic
    client.initialize(&admin, &token_address);
}

#[test]
#[should_panic(expected = "ContractError(PriceMustBePositive)")]
fn test_register_provider_zero_price() {
    let env = Env::default();
    let contract_id = env.register_contract(None, SparkNetContract);
    let client = SparkNetContractClient::new(&env, &contract_id);

    // Create test addresses
    let admin = Address::generate(&env);
    let token_address = Address::generate(&env);
    let provider = Address::generate(&env);

    // Initialize the contract
    client.initialize(&admin, &token_address);

    // Try to register with zero price - should panic
    let gpu_model = String::from_str(&env, "RTX 4090");
    let price_per_hour = 0u128;

    client.register(&provider, &gpu_model, &price_per_hour);
}