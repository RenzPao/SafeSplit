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
        client: Address,
        freelancer: Address,
        arbiter: Address,
        native_token: Address,
        milestones: Vec<MilestoneInput>,
        arbiter_fee_bps: u32,
    ) -> Result<(), Error> {
        if e.storage().instance().has(&DataKey::Config) {
            return Err(Error::AlreadyInitialized);
        }

        if client == freelancer || client == arbiter || freelancer == arbiter {
            return Err(Error::DuplicateAddresses);
        }

        if arbiter_fee_bps > 10000 {
            return Err(Error::BpsLimitExceeded);
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
            arbiter,
            native_token_address: native_token,
            total_xlm_stroops,
            arbiter_fee_bps,
            milestones: milestone_vec,
            current_milestone_index: 0,
            state: EscrowState::Initialized,
        };

        e.storage().instance().set(&DataKey::Config, &config);

        e.events().publish(
            (Symbol::new(&e, "initialize"), config.client.clone(), config.freelancer.clone()),
            config.total_xlm_stroops,
        );

        Ok(())
    }

    pub fn deposit_xlm(e: Env, client: Address) -> Result<(), Error> {
        client.require_auth();

        let mut config: EscrowConfig = e
            .storage()
            .instance()
            .get(&DataKey::Config)
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
        e.storage().instance().set(&DataKey::Config, &config);

        e.events().publish(
            (Symbol::new(&e, "deposit_xlm"), client),
            config.total_xlm_stroops,
        );

        Ok(())
    }

    pub fn submit_milestone(
        e: Env,
        freelancer: Address,
        milestone_id: u32,
        submission_ref: String,
    ) -> Result<(), Error> {
        freelancer.require_auth();

        let mut config: EscrowConfig = e
            .storage()
            .instance()
            .get(&DataKey::Config)
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
        e.storage().instance().set(&DataKey::Config, &config);

        e.events().publish(
            (Symbol::new(&e, "submit_milestone"), freelancer, milestone_id),
            (),
        );

        Ok(())
    }

    pub fn approve_milestone(e: Env, client: Address, milestone_id: u32) -> Result<(), Error> {
        client.require_auth();

        let mut config: EscrowConfig = e
            .storage()
            .instance()
            .get(&DataKey::Config)
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
        e.storage().instance().set(&DataKey::Config, &config);

        e.events().publish(
            (Symbol::new(&e, "approve_milestone"), client, milestone_id),
            milestone.amount_stroops,
        );

        Ok(())
    }

    pub fn raise_dispute(
        e: Env,
        caller: Address,
        milestone_id: u32,
        reason_hash: BytesN<32>,
    ) -> Result<(), Error> {
        caller.require_auth();

        let mut config: EscrowConfig = e
            .storage()
            .instance()
            .get(&DataKey::Config)
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
        e.storage().instance().set(&DataKey::Config, &config);

        e.events().publish(
            (Symbol::new(&e, "raise_dispute"), caller, milestone_id),
            reason_hash,
        );

        Ok(())
    }

    pub fn resolve_dispute(
        e: Env,
        arbiter: Address,
        milestone_id: u32,
        client_split_bps: u32,
    ) -> Result<(), Error> {
        arbiter.require_auth();

        let mut config: EscrowConfig = e
            .storage()
            .instance()
            .get(&DataKey::Config)
            .ok_or(Error::NotInitialized)?;

        if arbiter != config.arbiter {
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

        let mut milestones = config.milestones;
        let mut milestone = milestones.get(milestone_id).ok_or(Error::MilestoneNotFound)?;

        if milestone.status != MilestoneStatus::Disputed {
            return Err(Error::MilestoneNotDisputed);
        }

        let total_amount = milestone.amount_stroops;

        let arbiter_fee = total_amount
            .checked_mul(config.arbiter_fee_bps as i128)
            .ok_or(Error::Overflow)?
            .checked_div(10000)
            .ok_or(Error::Overflow)?;

        let remaining_amount = total_amount
            .checked_sub(arbiter_fee)
            .ok_or(Error::Overflow)?;

        let client_amount = remaining_amount
            .checked_mul(client_split_bps as i128)
            .ok_or(Error::Overflow)?
            .checked_div(10000)
            .ok_or(Error::Overflow)?;

        let freelancer_amount = remaining_amount
            .checked_sub(client_amount)
            .ok_or(Error::Overflow)?;

        let token_client = token::Client::new(&e, &config.native_token_address);
        let contract_address = e.current_contract_address();

        if arbiter_fee > 0 {
            token_client.transfer(&contract_address, &config.arbiter, &arbiter_fee);
        }
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

        config.milestones = milestones;
        e.storage().instance().set(&DataKey::Config, &config);

        e.events().publish(
            (Symbol::new(&e, "resolve_dispute"), arbiter, milestone_id),
            (client_amount, freelancer_amount),
        );

        Ok(())
    }

    pub fn cancel_and_refund(e: Env, client: Address) -> Result<(), Error> {
        client.require_auth();

        let mut config: EscrowConfig = e
            .storage()
            .instance()
            .get(&DataKey::Config)
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
        e.storage().instance().set(&DataKey::Config, &config);

        e.events().publish(
            (Symbol::new(&e, "cancel_and_refund"), client),
            config.total_xlm_stroops,
        );

        Ok(())
    }
}
