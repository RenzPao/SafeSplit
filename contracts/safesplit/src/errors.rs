use soroban_sdk::contracterror;

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidState = 3,
    NotAuthorized = 4,
    MilestoneNotFound = 5,
    InvalidMilestoneSequence = 6,
    MilestoneNotPending = 7,
    MilestoneNotSubmitted = 8,
    MilestoneNotDisputed = 9,
    InvalidMilestoneSplit = 10,
    DuplicateAddresses = 11,
    CannotCancel = 12,
    TotalStroopsMismatch = 13,
    Overflow = 14,
    BpsLimitExceeded = 15,
}
