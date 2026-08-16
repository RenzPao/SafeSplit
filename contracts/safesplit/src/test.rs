#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, token, Address, BytesN, Env, String, Vec};
use crate::types::MilestoneInput;

#[test]
fn test_escrow_happy_path() {
    let e = Env::default();
    e.mock_all_auths();

    let client = Address::generate(&e);
    let freelancer = Address::generate(&e);

    // Register Native Token (using testutils token)
    let token_admin = Address::generate(&e);
    let token_address = e.register_stellar_asset_contract_v2(token_admin.clone()).address();
    let token_client = token::Client::new(&e, &token_address);
    let token_admin_client = token::StellarAssetClient::new(&e, &token_address);

    // Register SafeSplit contract
    let contract_id = e.register(SafeSplitContract, ());
    let client_escrow = SafeSplitContractClient::new(&e, &contract_id);

    // Create Milestone inputs
    let mut milestones = Vec::new(&e);
    milestones.push_back(MilestoneInput {
        id: 0,
        description_hash: BytesN::from_array(&e, &[1; 32]),
        amount_stroops: 100_000_000, // 10 XLM
    });
    milestones.push_back(MilestoneInput {
        id: 1,
        description_hash: BytesN::from_array(&e, &[2; 32]),
        amount_stroops: 200_000_000, // 20 XLM
    });

    // Initialize escrow
    client_escrow.initialize(&client, &freelancer, &token_address, &milestones);

    // Mint tokens to client
    token_admin_client.mint(&client, &300_000_000);
    assert_eq!(token_client.balance(&client), 300_000_000);

    // Deposit
    client_escrow.deposit_xlm(&client);
    assert_eq!(token_client.balance(&client), 0);
    assert_eq!(token_client.balance(&contract_id), 300_000_000);

    // Submit milestone 0
    let submission_ref = String::from_str(&e, "ipfs://QmbWqxBEKC3P8t8us47oSgw7iZui187tiRwcE9ZCo1G3iE");
    client_escrow.submit_milestone(&freelancer, &0, &submission_ref);

    // Approve milestone 0
    client_escrow.approve_milestone(&client, &0);
    assert_eq!(token_client.balance(&freelancer), 100_000_000);
    assert_eq!(token_client.balance(&contract_id), 200_000_000);

    // Submit milestone 1
    client_escrow.submit_milestone(&freelancer, &1, &submission_ref);

    // Approve milestone 1
    client_escrow.approve_milestone(&client, &1);
    assert_eq!(token_client.balance(&freelancer), 300_000_000);
    assert_eq!(token_client.balance(&contract_id), 0);
}

#[test]
fn test_escrow_dispute_and_resolution() {
    let e = Env::default();
    e.mock_all_auths();

    let client = Address::generate(&e);
    let freelancer = Address::generate(&e);

    // Register Native Token (using testutils token)
    let token_admin = Address::generate(&e);
    let token_address = e.register_stellar_asset_contract_v2(token_admin.clone()).address();
    let token_client = token::Client::new(&e, &token_address);
    let token_admin_client = token::StellarAssetClient::new(&e, &token_address);

    // Register SafeSplit contract
    let contract_id = e.register(SafeSplitContract, ());
    let client_escrow = SafeSplitContractClient::new(&e, &contract_id);

    // Create Milestone inputs
    let mut milestones = Vec::new(&e);
    milestones.push_back(MilestoneInput {
        id: 0,
        description_hash: BytesN::from_array(&e, &[1; 32]),
        amount_stroops: 100_000_000, // 10 XLM
    });

    // Initialize, mint, and deposit
    client_escrow.initialize(&client, &freelancer, &token_address, &milestones);
    token_admin_client.mint(&client, &100_000_000);
    client_escrow.deposit_xlm(&client);

    // Submit milestone 0
    let submission_ref = String::from_str(&e, "ipfs://QmbWqxBEKC3P8t8us47oSgw7iZui187tiRwcE9ZCo1G3iE");
    client_escrow.submit_milestone(&freelancer, &0, &submission_ref);

    // Raise dispute
    let reason_hash = BytesN::from_array(&e, &[9; 32]);
    client_escrow.raise_dispute(&client, &0, &reason_hash);

    // Propose split (60% to client)
    client_escrow.propose_settlement(&client, &0, &6000);

    // Accept split (by freelancer)
    client_escrow.accept_settlement(&freelancer, &0);

    assert_eq!(token_client.balance(&client), 60_000_000);
    assert_eq!(token_client.balance(&freelancer), 40_000_000);
    assert_eq!(token_client.balance(&contract_id), 0);
}

#[test]
fn test_escrow_cancel_and_refund() {
    let e = Env::default();
    e.mock_all_auths();

    let client = Address::generate(&e);
    let freelancer = Address::generate(&e);

    // Register Native Token
    let token_admin = Address::generate(&e);
    let token_address = e.register_stellar_asset_contract_v2(token_admin.clone()).address();
    let token_client = token::Client::new(&e, &token_address);
    let token_admin_client = token::StellarAssetClient::new(&e, &token_address);

    // Register SafeSplit contract
    let contract_id = e.register(SafeSplitContract, ());
    let client_escrow = SafeSplitContractClient::new(&e, &contract_id);

    // Create Milestone inputs
    let mut milestones = Vec::new(&e);
    milestones.push_back(MilestoneInput {
        id: 0,
        description_hash: BytesN::from_array(&e, &[1; 32]),
        amount_stroops: 100_000_000, // 10 XLM
    });

    client_escrow.initialize(&client, &freelancer, &token_address, &milestones);
    token_admin_client.mint(&client, &100_000_000);
    client_escrow.deposit_xlm(&client);

    // Cancel before submission
    client_escrow.cancel_and_refund(&client);

    assert_eq!(token_client.balance(&client), 100_000_000);
    assert_eq!(token_client.balance(&contract_id), 0);
}


#[test]
fn test_escrow_upgrade() {
    let e = Env::default();
    e.mock_all_auths();

    let client = Address::generate(&e);
    let freelancer = Address::generate(&e);

    // Register Native Token
    let token_admin = Address::generate(&e);
    let token_address = e.register_stellar_asset_contract_v2(token_admin.clone()).address();

    // Register SafeSplit contract
    let contract_id = e.register(SafeSplitContract, ());
    let client_escrow = SafeSplitContractClient::new(&e, &contract_id);

    // Create Milestone inputs
    let mut milestones = Vec::new(&e);
    milestones.push_back(MilestoneInput {
        id: 0,
        description_hash: BytesN::from_array(&e, &[1; 32]),
        amount_stroops: 100_000_000,
    });

    client_escrow.initialize(&client, &freelancer, &token_address, &milestones);

    // Upload actual compiled wasm bytes to environment to register a valid hash
    const WASM: &[u8] = include_bytes!("../target/wasm32-unknown-unknown/release/safesplit.wasm");
    let dummy_wasm = soroban_sdk::Bytes::from_slice(&e, WASM);
    let new_wasm_hash = e.deployer().upload_contract_wasm(dummy_wasm);

    // Try upgrading with client auth
    client_escrow.upgrade(&new_wasm_hash);
}
