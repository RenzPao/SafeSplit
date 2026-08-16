#![no_std]
use soroban_sdk::{contract, contractimpl, token, Address, BytesN, Env, String, Symbol, Vec};

mod errors;
mod types;

#[cfg(test)]
mod test;

use errors::Error;
use types::{DataKey, EscrowConfig, EscrowState, Milestone, MilestoneInput, MilestoneStatus};

#[contract]
pub struct SafeSplitContract;

#[contractimpl]
impl SafeSplitContract {
    pub fn initialize(
        e: Env,
        escrow_id: String,
        client: Address,
        freelancer: Address,
        native_token: Address,
        milestones: Vec<MilestoneInput>,
    ) -> Result<(), Error> {
        if e.storage().instance().has(&DataKey::Escrow(escrow_id.clone())) {
            return Err(Error::AlreadyInitialized);
        }

        if client == freelancer {
            return Err(Error::DuplicateAddresses);
        }

        let mut total_xlm_stroops: i128 = 0;
        let mut milestone_vec = Vec::new(&e);

        for i in 0..milestones.len() {
            let input = milestones.get(i).ok_or(Error::MilestoneNotFound)?;
            if input.id != i {
                return Err(Error::InvalidMilestoneSequence);
            }
            total_xlm_stroops = total_xlm_stroops
                .checked_add(input.amount_stroops)
                .ok_or(Error::Overflow)?;

            milestone_vec.push_back(Milestone {
                id: input.id,
                description_hash: input.description_hash,
                amount_stroops: input.amount_stroops,
                status: MilestoneStatus::Pending,
                submission_ref: None,
            });
        }

        let config = EscrowConfig {
            client,
            freelancer,
            native_token_address: native_token,
            total_xlm_stroops,
            milestones: milestone_vec,
            current_milestone_index: 0,
            state: EscrowState::Initialized,
            proposal_split_bps: None,
            proposal_proposer: None,
        };

        e.storage().instance().set(&DataKey::Escrow(escrow_id.clone()), &config);

        e.events().publish(
            (Symbol::new(&e, "initialize"), config.client.clone(), config.freelancer.clone()),
            config.total_xlm_stroops,
        );

        Ok(())
    }

    pub fn deposit_xlm(e: Env, escrow_id: String, client: Address) -> Result<(), Error> {
        client.require_auth();

        let mut config: EscrowConfig = e
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id.clone()))
            .ok_or(Error::NotInitialized)?;

        if config.state != EscrowState::Initialized {
            return Err(Error::InvalidState);
        }

        if client != config.client {
            return Err(Error::NotAuthorized);
        }

        let contract_address = e.current_contract_address();
        let token_client = token::Client::new(&e, &config.native_token_address);
        token_client.transfer(&client, &contract_address, &config.total_xlm_stroops);

        config.state = EscrowState::Funded;
        e.storage().instance().set(&DataKey::Escrow(escrow_id.clone()), &config);

        e.events().publish(
            (Symbol::new(&e, "deposit_xlm"), client),
            config.total_xlm_stroops,
        );

        Ok(())
    }

    pub fn submit_milestone(
        e: Env,
        escrow_id: String,
        freelancer: Address,
        milestone_id: u32,
        submission_ref: String,
    ) -> Result<(), Error> {
        freelancer.require_auth();

        let mut config: EscrowConfig = e
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id.clone()))
            .ok_or(Error::NotInitialized)?;

        if freelancer != config.freelancer {
            return Err(Error::NotAuthorized);
        }

        if config.state != EscrowState::Funded && config.state != EscrowState::InProgress {
            return Err(Error::InvalidState);
        }

        if milestone_id != config.current_milestone_index {
            return Err(Error::InvalidMilestoneSequence);
        }

        let mut milestones = config.milestones;
        let mut milestone = milestones.get(milestone_id).ok_or(Error::MilestoneNotFound)?;

        if milestone.status != MilestoneStatus::Pending {
            return Err(Error::MilestoneNotPending);
        }

        milestone.status = MilestoneStatus::Submitted;
        milestone.submission_ref = Some(submission_ref);
        milestones.set(milestone_id, milestone);

        config.milestones = milestones;
        config.state = EscrowState::InProgress;
        e.storage().instance().set(&DataKey::Escrow(escrow_id.clone()), &config);

        e.events().publish(
            (Symbol::new(&e, "submit_milestone"), freelancer, milestone_id),
            (),
        );

        Ok(())
    }

    pub fn approve_milestone(e: Env, escrow_id: String, client: Address, milestone_id: u32) -> Result<(), Error> {
        client.require_auth();

        let mut config: EscrowConfig = e
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id.clone()))
            .ok_or(Error::NotInitialized)?;

        if client != config.client {
            return Err(Error::NotAuthorized);
        }

        if config.state != EscrowState::InProgress && config.state != EscrowState::Funded {
            return Err(Error::InvalidState);
        }

        if milestone_id != config.current_milestone_index {
            return Err(Error::InvalidMilestoneSequence);
        }

        let mut milestones = config.milestones;
        let mut milestone = milestones.get(milestone_id).ok_or(Error::MilestoneNotFound)?;

        if milestone.status != MilestoneStatus::Submitted {
            return Err(Error::MilestoneNotSubmitted);
        }

        milestone.status = MilestoneStatus::Approved;
        milestones.set(milestone_id, milestone.clone());

        let freelancer = config.freelancer.clone();
        let token_client = token::Client::new(&e, &config.native_token_address);
        token_client.transfer(&e.current_contract_address(), &freelancer, &milestone.amount_stroops);

        config.current_milestone_index += 1;
        if config.current_milestone_index == milestones.len() {
            config.state = EscrowState::Completed;
        } else {
            config.state = EscrowState::InProgress;
        }

        config.milestones = milestones;
        e.storage().instance().set(&DataKey::Escrow(escrow_id.clone()), &config);

        e.events().publish(
            (Symbol::new(&e, "approve_milestone"), client, milestone_id),
            milestone.amount_stroops,
        );

        Ok(())
    }

    pub fn raise_dispute(
        e: Env,
        escrow_id: String,
        caller: Address,
        milestone_id: u32,
        reason_hash: BytesN<32>,
    ) -> Result<(), Error> {
        caller.require_auth();

        let mut config: EscrowConfig = e
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id.clone()))
            .ok_or(Error::NotInitialized)?;

        if caller != config.client && caller != config.freelancer {
            return Err(Error::NotAuthorized);
        }

        if config.state != EscrowState::InProgress {
            return Err(Error::InvalidState);
        }

        if milestone_id != config.current_milestone_index {
            return Err(Error::InvalidMilestoneSequence);
        }

        let mut milestones = config.milestones;
        let mut milestone = milestones.get(milestone_id).ok_or(Error::MilestoneNotFound)?;

        if milestone.status != MilestoneStatus::Submitted {
            return Err(Error::MilestoneNotSubmitted);
        }

        milestone.status = MilestoneStatus::Disputed;
        milestones.set(milestone_id, milestone);

        config.milestones = milestones;
        config.state = EscrowState::Disputed;
        e.storage().instance().set(&DataKey::Escrow(escrow_id.clone()), &config);

        e.events().publish(
            (Symbol::new(&e, "raise_dispute"), caller, milestone_id),
            reason_hash,
        );

        Ok(())
    }

    pub fn propose_settlement(
        e: Env,
        escrow_id: String,
        proposer: Address,
        milestone_id: u32,
        client_split_bps: u32,
    ) -> Result<(), Error> {
        proposer.require_auth();

        let mut config: EscrowConfig = e
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id.clone()))
            .ok_or(Error::NotInitialized)?;

        if proposer != config.client && proposer != config.freelancer {
            return Err(Error::NotAuthorized);
        }

        if config.state != EscrowState::Disputed {
            return Err(Error::InvalidState);
        }

        if milestone_id != config.current_milestone_index {
            return Err(Error::InvalidMilestoneSequence);
        }

        if client_split_bps > 10000 {
            return Err(Error::InvalidMilestoneSplit);
        }

        let milestones = config.milestones.clone();
        let milestone = milestones.get(milestone_id).ok_or(Error::MilestoneNotFound)?;

        if milestone.status != MilestoneStatus::Disputed {
            return Err(Error::MilestoneNotDisputed);
        }

        config.proposal_split_bps = Some(client_split_bps);
        config.proposal_proposer = Some(proposer.clone());
        e.storage().instance().set(&DataKey::Escrow(escrow_id.clone()), &config);

        e.events().publish(
            (Symbol::new(&e, "propose_settlement"), proposer, milestone_id),
            client_split_bps,
        );

        Ok(())
    }

    pub fn accept_settlement(
        e: Env,
        escrow_id: String,
        accepter: Address,
        milestone_id: u32,
    ) -> Result<(), Error> {
        accepter.require_auth();

        let mut config: EscrowConfig = e
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id.clone()))
            .ok_or(Error::NotInitialized)?;

        if accepter != config.client && accepter != config.freelancer {
            return Err(Error::NotAuthorized);
        }

        if config.state != EscrowState::Disputed {
            return Err(Error::InvalidState);
        }

        if milestone_id != config.current_milestone_index {
            return Err(Error::InvalidMilestoneSequence);
        }

        let proposal_proposer = config.proposal_proposer.clone().ok_or(Error::NotAuthorized)?;
        if accepter == proposal_proposer {
            return Err(Error::NotAuthorized);
        }

        let client_split_bps = config.proposal_split_bps.ok_or(Error::NotAuthorized)?;

        let mut milestones = config.milestones;
        let mut milestone = milestones.get(milestone_id).ok_or(Error::MilestoneNotFound)?;

        if milestone.status != MilestoneStatus::Disputed {
            return Err(Error::MilestoneNotDisputed);
        }

        let total_amount = milestone.amount_stroops;

        let client_amount = total_amount
            .checked_mul(client_split_bps as i128)
            .ok_or(Error::Overflow)?
            .checked_div(10000)
            .ok_or(Error::Overflow)?;

        let freelancer_amount = total_amount
            .checked_sub(client_amount)
            .ok_or(Error::Overflow)?;

        let token_client = token::Client::new(&e, &config.native_token_address);
        let contract_address = e.current_contract_address();

        if client_amount > 0 {
            token_client.transfer(&contract_address, &config.client, &client_amount);
        }
        if freelancer_amount > 0 {
            token_client.transfer(&contract_address, &config.freelancer, &freelancer_amount);
        }

        if client_split_bps == 10000 {
            milestone.status = MilestoneStatus::Refunded;
        } else {
            milestone.status = MilestoneStatus::Approved;
        }
        milestones.set(milestone_id, milestone);

        config.current_milestone_index += 1;
        if config.current_milestone_index == milestones.len() {
            config.state = EscrowState::Completed;
        } else {
            config.state = EscrowState::InProgress;
        }

        config.proposal_split_bps = None;
        config.proposal_proposer = None;
        config.milestones = milestones;
        e.storage().instance().set(&DataKey::Escrow(escrow_id.clone()), &config);

        e.events().publish(
            (Symbol::new(&e, "accept_settlement"), accepter, milestone_id),
            (client_amount, freelancer_amount),
        );

        Ok(())
    }

    pub fn cancel_and_refund(e: Env, escrow_id: String, client: Address) -> Result<(), Error> {
        client.require_auth();

        let mut config: EscrowConfig = e
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id.clone()))
            .ok_or(Error::NotInitialized)?;

        if client != config.client {
            return Err(Error::NotAuthorized);
        }

        if config.state != EscrowState::Funded && config.state != EscrowState::Initialized {
            return Err(Error::InvalidState);
        }

        for i in 0..config.milestones.len() {
            let milestone = config.milestones.get(i).ok_or(Error::MilestoneNotFound)?;
            if milestone.status != MilestoneStatus::Pending {
                return Err(Error::CannotCancel);
            }
        }

        if config.state == EscrowState::Funded {
            let token_client = token::Client::new(&e, &config.native_token_address);
            token_client.transfer(&e.current_contract_address(), &config.client, &config.total_xlm_stroops);
        }

        config.state = EscrowState::Cancelled;
        e.storage().instance().set(&DataKey::Escrow(escrow_id.clone()), &config);

        e.events().publish(
            (Symbol::new(&e, "cancel_and_refund"), client),
            config.total_xlm_stroops,
        );

        Ok(())
    }

    pub fn init_admin(e: Env, admin: Address) -> Result<(), Error> {
        if e.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        e.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    pub fn upgrade(e: Env, new_wasm_hash: BytesN<32>) -> Result<(), Error> {
        let admin: Address = e
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;

        admin.require_auth();

        e.deployer().update_current_contract_wasm(new_wasm_hash);

        Ok(())
    }
}
