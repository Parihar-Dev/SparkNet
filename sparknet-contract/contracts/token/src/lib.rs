#![no_std]
use soroban_sdk::{contract, contractimpl, token, Address, Env, String};

#[contract]
pub struct Token;

#[contractimpl]
impl Token {
    pub fn initialize(env: Env, admin: Address, decimal: u32, name: String, symbol: String) {
        token::Client::new(&env, &env.current_contract_address()).initialize(
            &admin,
            &decimal,
            &name,
            &symbol,
        );
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        token::Client::new(&env, &env.current_contract_address()).mint(&to, &amount);
    }
}
