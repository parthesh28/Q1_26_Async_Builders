use anchor_lang::prelude::*;

declare_id!("57KC1ZXQ3Dgybp4HmmB8fYjjqXHVnzG9w7h4y93zAMR9");

#[program]
pub mod anchor_quadratic_voting_q4_25 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
