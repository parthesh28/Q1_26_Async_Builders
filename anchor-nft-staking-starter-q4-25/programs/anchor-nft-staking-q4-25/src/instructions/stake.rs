use anchor_lang::prelude::*;
use mpl_core::{
    instructions::AddPluginV1CpiBuilder,
    types::{FreezeDelegate, Plugin, PluginAuthority},
    ID as CORE_PROGRAM_ID,
};

use crate::{
    errors::StakeError,
    state::{StakeAccount, StakeConfig, UserAccount},
};

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub user : Signer<'info>,
    #[account(
        mut,
        constraint = asset.owner == &CORE_PROGRAM_ID @ StakeError::InvalidAssetOwner,
        constraint = !asset.data_is_empty() @ StakeError::AssetNotInitialized
    )]
    pub asset : UncheckedAccount<'info>,
       #[account(
        mut,
        constraint = collection.owner == &CORE_PROGRAM_ID @ StakeError::InvalidAssetOwner,
        constraint = !collection.data_is_empty() @ StakeError::AssetNotInitialized
    )]
    pub collection: UncheckedAccount<'info>,
    pub stake_account : Account<'info, StakeAccount>,
    pub stake_config : Account<'info, StakeConfig>,
    pub user_account : Account<'info, UserAccount>,

}

// impl<'info> Stake<'info> {
//     pub fn stake(&mut self, bumps: &StakeBumps) -> Result<()> {
//TODO
//     }
// }
