use soroban_sdk::{contracttype, Address, BytesN, String, Vec};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum EscrowState {
    Initialized = 0,
    Funded = 1,
    InProgress = 2,
    Disputed = 3,
    Completed = 4,
    Cancelled = 5,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum MilestoneStatus {
    Pending = 0,
    Submitted = 1,
    Approved = 2,
    Disputed = 3,
    Refunded = 4,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    pub id: u32,
    pub description_hash: BytesN<32>,
    pub amount_stroops: i128,
    pub status: MilestoneStatus,
    pub submission_ref: Option<String>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MilestoneInput {
    pub id: u32,
    pub description_hash: BytesN<32>,
    pub amount_stroops: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowConfig {
    pub client: Address,
    pub freelancer: Address,
    pub native_token_address: Address,
    pub total_xlm_stroops: i128,
    pub milestones: Vec<Milestone>,
    pub current_milestone_index: u32,
    pub state: EscrowState,
    pub proposal_split_bps: Option<u32>,
    pub proposal_proposer: Option<Address>,
}

#[contracttype]
pub enum DataKey {
    Config,
}
