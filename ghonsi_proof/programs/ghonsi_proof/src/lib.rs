use anchor_lang::prelude::*;

declare_id!("CFerqKEGdrVfUrC1GDSRTsPpW9DjrQtqJnYycSNjQb3i");

pub const PROOF_SEED: &[u8] = b"proof";

// ============================================================================
// PROGRAM
// ============================================================================

#[program]
pub mod ghonsi_proof {
    use super::*;

    // --------------------------------------------------------------------------
    // Admin setup
    // --------------------------------------------------------------------------

    /// One-time setup. Stores the primary admin and initialises the authority PDA.
    /// collection_mint param kept for ABI compatibility but no longer used for
    /// NFT minting — stored as a spare field in case it's needed later.
    pub fn initialize(ctx: Context<Initialize>, collection_mint: Pubkey) -> Result<()> {
        let authority = &mut ctx.accounts.program_authority;
        authority.primary_admin = ctx.accounts.admin.key();
        authority.admin_count = 1;
        authority.admins[0] = ctx.accounts.admin.key();
        authority.collection_mint = collection_mint;
        authority.paused = false;

        msg!(
            "Initialized. Primary admin: {}",
            ctx.accounts.admin.key(),
        );
        Ok(())
    }

    /// Transfer primary-admin seat to a new address.
    /// Clears the secondary-admin list so the new owner starts fresh.
    pub fn reset_authority(ctx: Context<ResetAuthority>, new_admin: Pubkey) -> Result<()> {
        let authority = &mut ctx.accounts.program_authority;
        require_keys_eq!(
            ctx.accounts.admin.key(),
            authority.primary_admin,
            ErrorCode::Unauthorized
        );
        authority.primary_admin = new_admin;
        authority.admin_count = 1;
        authority.admins = [Pubkey::default(); 10];
        authority.admins[0] = new_admin;
        msg!("Authority reset. New primary admin: {}", new_admin);
        Ok(())
    }

    pub fn add_admin(ctx: Context<ManageAdmin>, new_admin: Pubkey) -> Result<()> {
        let authority = &mut ctx.accounts.program_authority;
        require_keys_eq!(
            ctx.accounts.admin.key(),
            authority.primary_admin,
            ErrorCode::Unauthorized
        );
        require!(authority.admin_count < 10, ErrorCode::MaxAdminsReached);
        for i in 0..authority.admin_count {
            require_keys_neq!(
                authority.admins[i as usize],
                new_admin,
                ErrorCode::AlreadyAdmin
            );
        }
        let idx = authority.admin_count as usize;
        authority.admins[idx] = new_admin;
        authority.admin_count += 1;
        msg!("Admin added: {}", new_admin);
        Ok(())
    }

    pub fn remove_admin(ctx: Context<ManageAdmin>, admin_to_remove: Pubkey) -> Result<()> {
        let authority = &mut ctx.accounts.program_authority;
        require_keys_eq!(
            ctx.accounts.admin.key(),
            authority.primary_admin,
            ErrorCode::Unauthorized
        );
        require_keys_neq!(
            admin_to_remove,
            authority.primary_admin,
            ErrorCode::CannotRemovePrimaryAdmin
        );
        let mut found = None;
        for i in 0..authority.admin_count {
            if authority.admins[i as usize] == admin_to_remove {
                found = Some(i);
                break;
            }
        }
        require!(found.is_some(), ErrorCode::AdminNotFound);
        let idx = found.unwrap() as usize;
        let count = authority.admin_count as usize;
        for i in idx..(count - 1) {
            authority.admins[i] = authority.admins[i + 1];
        }
        authority.admin_count -= 1;
        msg!("Admin removed: {}", admin_to_remove);
        Ok(())
    }

    // --------------------------------------------------------------------------
    // Global controls (primary admin only via PrimaryAdminAction)
    // --------------------------------------------------------------------------

    /// Update the stored collection_mint field (kept for future use).
    pub fn set_collection(
        ctx: Context<PrimaryAdminAction>,
        new_collection_mint: Pubkey,
    ) -> Result<()> {
        ctx.accounts.program_authority.collection_mint = new_collection_mint;
        msg!("Collection mint updated: {}", new_collection_mint);
        Ok(())
    }

    /// Emergency pause / unpause. Blocks submit_proof, verify_proof, reject_proof
    /// while active. Admin setup instructions are intentionally not blocked so
    /// you can still respond to incidents.
    pub fn set_paused(ctx: Context<PrimaryAdminAction>, paused: bool) -> Result<()> {
        ctx.accounts.program_authority.paused = paused;
        msg!("Program paused: {}", paused);
        Ok(())
    }

    // --------------------------------------------------------------------------
    // Core proof lifecycle
    // --------------------------------------------------------------------------

    /// Owner submits a proof PDA and pays rent themselves.
    /// Admin co-signs to verify the submission is authorised.
    ///
    /// What lives on-chain (public, permanent):
    ///   owner, ipfs_cid (raw IPFS CID / future Arweave TX ID), status, timestamps, verified_by
    ///
    /// What stays off-chain (Supabase + Pinata):
    ///   proof_name, proof_type, summary  → Supabase
    ///   full IPFS URL                    → Supabase file_ipfs_url column
    ///   rejection_reason                 → Supabase + program log
    ///   uploaded file                    → Pinata/IPFS, gated by your request system
    pub fn submit_proof(
        ctx: Context<SubmitProof>,
        proof_id: String,
        ipfs_cid: String,
    ) -> Result<()> {
        require!(!ctx.accounts.program_authority.paused, ErrorCode::ProgramPaused);

        // Any admin (not just primary) can submit
        let authority = &ctx.accounts.program_authority;
        let caller = ctx.accounts.admin.key();
        let is_admin = (0..authority.admin_count)
            .any(|i| authority.admins[i as usize] == caller);
        require!(is_admin, ErrorCode::Unauthorized);

        require!(proof_id.len() <= 32, ErrorCode::IdTooLong);
        require!(ipfs_cid.len() <= 59, ErrorCode::CidTooLong);

        let clock = Clock::get()?;
        let proof = &mut ctx.accounts.proof;
        proof.owner = ctx.accounts.owner.key();
        proof.ipfs_cid = ipfs_cid;
        proof.status = ProofStatus::Pending;
        proof.submission_date = clock.unix_timestamp;
        proof.verification_date = 0;
        proof.verified_by = Pubkey::default();
        proof.bump = ctx.bumps.proof;

        msg!("Proof submitted for owner: {}", proof.owner);
        Ok(())
    }

    pub fn verify_proof(ctx: Context<AdminProofAction>) -> Result<()> {
        require!(!ctx.accounts.program_authority.paused, ErrorCode::ProgramPaused);

        let authority = &ctx.accounts.program_authority;
        let caller = ctx.accounts.admin.key();
        let is_admin = (0..authority.admin_count)
            .any(|i| authority.admins[i as usize] == caller);
        require!(is_admin, ErrorCode::Unauthorized);

        let clock = Clock::get()?;
        let proof = &mut ctx.accounts.proof;
        require!(
            proof.status == ProofStatus::Pending,
            ErrorCode::ProofAlreadyProcessed
        );
        proof.status = ProofStatus::Verified;
        proof.verification_date = clock.unix_timestamp;
        proof.verified_by = ctx.accounts.admin.key();
        msg!("Proof verified for owner: {} by {}", proof.owner, ctx.accounts.admin.key());
        Ok(())
    }

    /// reason is logged as a program event only — not stored on-chain.
    pub fn reject_proof(ctx: Context<AdminProofAction>, reason: String) -> Result<()> {
        require!(!ctx.accounts.program_authority.paused, ErrorCode::ProgramPaused);
        require!(reason.len() <= 200, ErrorCode::ReasonTooLong);

        let authority = &ctx.accounts.program_authority;
        let caller = ctx.accounts.admin.key();
        let is_admin = (0..authority.admin_count)
            .any(|i| authority.admins[i as usize] == caller);
        require!(is_admin, ErrorCode::Unauthorized);

        let clock = Clock::get()?;
        let proof = &mut ctx.accounts.proof;
        require!(
            proof.status == ProofStatus::Pending,
            ErrorCode::ProofAlreadyProcessed
        );
        proof.status = ProofStatus::Rejected;
        proof.verification_date = clock.unix_timestamp;
        proof.verified_by = ctx.accounts.admin.key();

        // Reason emitted as log only — your backend reads it from tx logs and
        // saves it to Supabase. Zero rent cost, same auditability.
        msg!("Proof rejected for owner: {} by {} | reason: {}", proof.owner, ctx.accounts.admin.key(), reason);
        Ok(())
    }

    /// Primary admin revokes any proof regardless of current status.
    /// No token to thaw — just updates the PDA status.
    pub fn revoke_proof(ctx: Context<RevokeProof>) -> Result<()> {
        let authority = &ctx.accounts.program_authority;
        require_keys_eq!(
            ctx.accounts.admin.key(),
            authority.primary_admin,
            ErrorCode::Unauthorized
        );

        let clock = Clock::get()?;
        let proof = &mut ctx.accounts.proof;
        proof.status = ProofStatus::Revoked;
        proof.verification_date = clock.unix_timestamp;
        proof.verified_by = ctx.accounts.admin.key();

        msg!("Proof revoked for owner: {} by primary admin", proof.owner);
        Ok(())
    }

    /// Owner reclaims rent from a Rejected or Revoked proof.
    /// Anchor's `close = owner` constraint sweeps the lamports automatically.
    pub fn close_proof(ctx: Context<CloseProof>) -> Result<()> {
        require!(
            ctx.accounts.proof.status == ProofStatus::Rejected
                || ctx.accounts.proof.status == ProofStatus::Revoked,
            ErrorCode::CannotCloseActiveProof
        );
        msg!("Proof PDA closed for owner: {}", ctx.accounts.proof.owner);
        Ok(())
    }
}

// ============================================================================
// ACCOUNTS
// ============================================================================

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + ProgramAuthority::SPACE,
        seeds = [b"program_authority"],
        bump,
    )]
    pub program_authority: Account<'info, ProgramAuthority>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResetAuthority<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut, seeds = [b"program_authority"], bump)]
    pub program_authority: Account<'info, ProgramAuthority>,
}

#[derive(Accounts)]
pub struct ManageAdmin<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut, seeds = [b"program_authority"], bump)]
    pub program_authority: Account<'info, ProgramAuthority>,

    pub system_program: Program<'info, System>,
}

/// Shared context for primary-admin-only controls (set_collection, set_paused).
#[derive(Accounts)]
pub struct PrimaryAdminAction<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"program_authority"],
        bump,
        constraint = admin.key() == program_authority.primary_admin @ ErrorCode::Unauthorized,
    )]
    pub program_authority: Account<'info, ProgramAuthority>,
}

#[derive(Accounts)]
#[instruction(proof_id: String)]
pub struct SubmitProof<'info> {
    /// The owner — pays rent and co-signs to prove wallet ownership and consent.
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + Proof::INIT_SPACE,
        seeds = [PROOF_SEED, owner.key().as_ref(), proof_id.as_bytes()],
        bump,
    )]
    pub proof: Account<'info, Proof>,

    #[account(seeds = [b"program_authority"], bump)]
    pub program_authority: Account<'info, ProgramAuthority>,

    /// Admin co-signs to authorise the submission. Pays nothing.
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Shared context for verify_proof and reject_proof.
#[derive(Accounts)]
pub struct AdminProofAction<'info> {
    #[account(mut)]
    pub proof: Account<'info, Proof>,

    pub admin: Signer<'info>,

    #[account(seeds = [b"program_authority"], bump)]
    pub program_authority: Account<'info, ProgramAuthority>,
}

#[derive(Accounts)]
pub struct RevokeProof<'info> {
    #[account(mut)]
    pub proof: Account<'info, Proof>,

    /// Must be primary admin — validated in instruction body.
    pub admin: Signer<'info>,

    #[account(seeds = [b"program_authority"], bump)]
    pub program_authority: Account<'info, ProgramAuthority>,
}

#[derive(Accounts)]
pub struct CloseProof<'info> {
    /// `has_one = owner` ensures only the real owner can close.
    /// `close = owner` sweeps lamports back to owner after the ix.
    #[account(
        mut,
        has_one = owner,
        close = owner,
    )]
    pub proof: Account<'info, Proof>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

// ============================================================================
// STATE
// ============================================================================

/// What lives on-chain — the minimal public trust record.
///
/// Bytes breakdown:
///   owner:              32
///   ipfs_cid:         4+59 = 63   (raw IPFS CID or future Arweave TX ID, max 59 chars)
///   status:              1
///   submission_date:     8
///   verification_date:   8
///   verified_by:        32
///   bump:                1
///   ─────────────────────
///   Total:            ~145 bytes  (+8 discriminator = 153)
///
/// NOT stored on-chain (privacy model):
///   proof_name, proof_type  → Supabase
///   full IPFS URL           → Supabase file_ipfs_url column
///   work_description        → Supabase summary column (behind request gate)
///   rejection_reason        → Supabase + program log (emitted by reject_proof)
#[account]
#[derive(InitSpace)]
pub struct Proof {
    pub owner: Pubkey,
    #[max_len(59)]
    pub ipfs_cid: String,
    pub status: ProofStatus,
    pub submission_date: i64,
    pub verification_date: i64,
    pub verified_by: Pubkey,
    pub bump: u8,
}

#[account]
pub struct ProgramAuthority {
    pub primary_admin: Pubkey,   // 32
    pub admin_count: u8,         //  1
    pub admins: [Pubkey; 10],    // 320
    pub collection_mint: Pubkey, // 32  (kept for future use)
    pub paused: bool,            //  1
                                 // total: 386 bytes
}

impl ProgramAuthority {
    pub const SPACE: usize = 32 + 1 + (32 * 10) + 32 + 1; // 386
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum ProofStatus {
    Pending,
    Verified,
    Rejected,
    Revoked,
}

impl Default for ProofStatus {
    fn default() -> Self {
        ProofStatus::Pending
    }
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("Proof ID too long (max 32 characters)")]
    IdTooLong,
    #[msg("IPFS CID too long (max 59 characters)")]
    CidTooLong,
    #[msg("Rejection reason too long (max 200 characters)")]
    ReasonTooLong,
    #[msg("Unauthorized: caller is not an admin or not the primary admin")]
    Unauthorized,
    #[msg("Proof has already been verified or rejected")]
    ProofAlreadyProcessed,
    #[msg("Maximum number of admins reached (10)")]
    MaxAdminsReached,
    #[msg("This address is already an admin")]
    AlreadyAdmin,
    #[msg("Admin not found")]
    AdminNotFound,
    #[msg("Cannot remove the primary admin")]
    CannotRemovePrimaryAdmin,
    #[msg("Program is currently paused")]
    ProgramPaused,
    #[msg("Collection mint does not match the one stored in program authority")]
    InvalidCollectionMint,
    #[msg("Can only close a Rejected or Revoked proof")]
    CannotCloseActiveProof,
}