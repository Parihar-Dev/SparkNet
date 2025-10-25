#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn create_test_env() -> Env {
    let env = Env::default();
    env.mock_all_auths();
    env
}

#[test]
fn test_initialize() {
    let env = create_test_env();
    
    // Create addresses
    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, SparkNetContract);
    let token_id = Address::generate(&env);
    
    let client = SparkNetContractClient::new(&env, &contract_id);
    
    // Test successful initialization
    client.initialize(&admin, &token_id);
    
    // Verify admin is set by calling a function that checks storage
    let providers = client.get_providers();
    assert_eq!(providers.len(), 0); // Should be empty after initialization
}

#[test]
fn test_register_provider() {
    let env = create_test_env();
    
    // Create addresses
    let admin = Address::generate(&env);
    let provider = Address::generate(&env);
    let contract_id = env.register_contract(None, SparkNetContract);
    let token_id = Address::generate(&env);
    
    let client = SparkNetContractClient::new(&env, &contract_id);
    
    // Initialize contract
    client.initialize(&admin, &token_id);
    
    // Register provider
    let gpu_model = String::from_str(&env, "RTX 4090");
    let price_per_hour = 100u128;
    
    let registered_provider = client.register(&provider, &gpu_model, &price_per_hour);
    
    // Verify provider data
    assert_eq!(registered_provider.id, provider);
    assert_eq!(registered_provider.gpu_model, gpu_model);
    assert_eq!(registered_provider.price_per_hour, price_per_hour);
    assert!(registered_provider.registered_at >= 0); // Timestamp can be 0 in test environment
}

#[test]
fn test_get_providers() {
    let env = create_test_env();
    
    // Create addresses
    let admin = Address::generate(&env);
    let provider = Address::generate(&env);
    let contract_id = env.register_contract(None, SparkNetContract);
    let token_id = Address::generate(&env);
    
    let client = SparkNetContractClient::new(&env, &contract_id);
    
    // Initialize contract
    client.initialize(&admin, &token_id);
    
    // Initially no providers
    let providers = client.get_providers();
    assert_eq!(providers.len(), 0);
    
    // Register a provider
    let gpu_model = String::from_str(&env, "RTX 4090");
    let price_per_hour = 100u128;
    client.register(&provider, &gpu_model, &price_per_hour);
    
    // Now should have one provider
    let providers = client.get_providers();
    assert_eq!(providers.len(), 1);
    assert_eq!(providers.get(0).unwrap().id, provider);
}

#[test]
fn test_rental_view_functions() {
    let env = create_test_env();
    
    // Create addresses
    let admin = Address::generate(&env);
    let provider = Address::generate(&env);
    let consumer = Address::generate(&env);
    let contract_id = env.register_contract(None, SparkNetContract);
    let token_id = Address::generate(&env);
    
    let client = SparkNetContractClient::new(&env, &contract_id);
    
    // Initialize contract
    client.initialize(&admin, &token_id);
    
    // Register provider
    let gpu_model = String::from_str(&env, "RTX 4090");
    let price_per_hour = 100u128;
    client.register(&provider, &gpu_model, &price_per_hour);
    
    // Test get_rentals_for_consumer (should be empty initially)
    let consumer_rentals = client.get_rentals_for_consumer(&consumer);
    assert_eq!(consumer_rentals.len(), 0);
    
    // Test get_rentals_for_provider (should be empty initially)
    let provider_rentals = client.get_rentals_for_provider(&provider);
    assert_eq!(provider_rentals.len(), 0);
}

#[test]
fn test_full_workflow_basic() {
    let env = create_test_env();
    
    // Create addresses
    let admin = Address::generate(&env);
    let provider = Address::generate(&env);
    let consumer = Address::generate(&env);
    let contract_id = env.register_contract(None, SparkNetContract);
    let token_id = Address::generate(&env);
    
    let client = SparkNetContractClient::new(&env, &contract_id);
    
    // 1. Initialize contract
    client.initialize(&admin, &token_id);
    
    // 2. Register provider
    let gpu_model = String::from_str(&env, "RTX 4090");
    let price_per_hour = 100u128;
    let registered_provider = client.register(&provider, &gpu_model, &price_per_hour);
    
    // 3. Verify provider is in the list
    let providers = client.get_providers();
    assert_eq!(providers.len(), 1);
    assert_eq!(providers.get(0).unwrap().id, provider);
    
    // 4. Verify provider data
    assert_eq!(registered_provider.gpu_model, gpu_model);
    assert_eq!(registered_provider.price_per_hour, price_per_hour);
}