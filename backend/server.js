require('dotenv').config(); // must be first — before any config/middleware imports
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const anchor = require('@coral-xyz/anchor');
const { sendEmail } = require('./brevoEmail');
const { solanaPaymentMiddleware, createSolanaPaymentMiddleware } = require('./src/middleware/solanaPaymentMiddleware');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./src/config/swagger');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use('/api/v1', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());

// ───────────────────────
// Swagger UI — interactive API docs at /api-docs
// ───────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Ghonsi Proof API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
}));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
const fs = require('fs').promises;
const path = require('path');
const JOBS_FILE = path.join(__dirname, 'jobs.json');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ───────────────────────
// Market data (crawlers) API under /api/v1
// ───────────────────────
const { router: marketRouter, setSupabaseClient } = require('./src/routes/market');
setSupabaseClient(supabase);
app.use('/api/v1', marketRouter);

// Start the Ghonsi scheduler (ESM dynamic import)
(async () => {
  try {
    const { startScheduler } = await import('./ghonsi-data-intelligence/src/scheduler/index.js');
    startScheduler();
    console.log('Ghonsi scheduler started.');
  } catch (err) {
    console.error('Failed to start scheduler:', err);
  }
})();



/**
 * @swagger
 * /health:

 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 *                 message: { type: string, example: Ghonsi Proof API }
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ghonsi Proof API' });
});

// ───────────────────────
// OTP EMAIL SENDING (Brevo)
// ───────────────────────

/**
 * @swagger
 * /api/send-otp:
 *   post:
 *     tags: [OTP]
 *     summary: Send OTP verification email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string, example: '123456' }
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Missing email or otp
 *       500:
 *         description: Email service error
 */
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    if (!process.env.BREVO_API_KEY) {
      console.error('[OTP] BREVO_API_KEY not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    console.log(`[OTP] Attempting to send OTP to ${email}`);

    await sendEmail({
      to: email,
      subject: 'Your Ghonsi Proof Verification Code',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #C19A4A;">Verify Your Email</h2>
          <p>Your verification code is:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #C19A4A; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #666;">This code will expire in <strong>5 minutes</strong>.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    });

    console.log(`[OTP] Successfully sent to ${email}`);
    res.json({ success: true, message: 'OTP sent successfully' });

  } catch (error) {
    console.error('[OTP] Error sending email:', error);
    console.error('[OTP] Error details:', error.response?.body || error.message);
    res.status(500).json({
      error: 'Failed to send OTP email',
      details: error.response?.body?.message || error.message
    });
  }
});

// ───────────────────────
// Shared helpers
// ───────────────────────

/** Load and validate the backend admin keypair from env */
const getAdminKeypair = () => {
  const raw = process.env.SOLANA_BACKEND_PRIVATE_KEY;
  if (!raw) throw new Error('SOLANA_BACKEND_PRIVATE_KEY not configured');
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
};

/** Build an Anchor program instance signed by the admin keypair */
const getProgram = (connection, adminKeypair) => {
  const idl = require('./ghonsi_proof.json');
  const programId = new PublicKey(process.env.PROGRAM_ID || idl.address);
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(adminKeypair),
    { commitment: 'confirmed' }
  );
  anchor.setProvider(provider);
  return { program: new anchor.Program(idl, provider), programId };
};

/**
 * Derive the proof PDA using the new PDA-only seed:
 * [b"proof", owner_pubkey, proof_id_bytes]
 *
 * NOTE: Old NFT-based proofs used [b"proof", owner_pubkey, mint_pubkey].
 * New proofs use proof_id as the third seed — no mint needed.
 */
const deriveProofPda = (ownerPublicKey, proofId, programId) => {
  const [proofPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('proof'), ownerPublicKey.toBuffer(), Buffer.from(proofId)],
    programId
  );
  return proofPda;
};

/** Derive the program authority PDA */
const deriveProgramAuthorityPda = (programId) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('program_authority')],
    programId
  );
  return pda;
};

// ───────────────────────
// POST /api/prepare-mint
//
// PDA-ONLY version — no NFT, no token mint, no Metaplex.
// Builds the submit_proof transaction, partially signs it with the admin
// keypair, then returns it as a base64 string.
// The frontend deserialises it, adds the owner signature, and submits.
//
// Input shape: { ownerWallet, proofId, title, description, proofType, ipfsUri }
// NOTE: description stays off-chain in Supabase only — never passed on-chain.
// ───────────────────────
/**
 * @swagger
 * /api/prepare-mint:
 *   post:
 *     tags: [Proofs]
 *     summary: Build a partially-signed Solana transaction for PDA-only proof minting
 *     description: |
 *       Builds the submit_proof transaction, partially signs it with the admin keypair,
 *       and returns a base64-encoded transaction. The frontend adds the owner signature and submits.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ownerWallet, proofId, title, description, proofType, ipfsUri]
 *             properties:
 *               ownerWallet: { type: string, description: Solana wallet address }
 *               proofId: { type: string, maxLength: 32 }
 *               title: { type: string, maxLength: 64 }
 *               description: { type: string, maxLength: 500 }
 *               proofType: { type: string }
 *               ipfsUri: { type: string, maxLength: 200 }
 *     responses:
 *       200:
 *         description: Partially signed transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 transaction: { type: string, description: Base64-encoded transaction }
 *                 proofPda: { type: string }
 *       400:
 *         description: Missing or invalid fields
 *       500:
 *         description: Server error
 */
app.post("/api/prepare-mint", async (req, res) => {
  try {
    // LOG EVERYTHING WE RECEIVE
    console.log('═══════════════════════════════════════');
    console.log('[prepare-mint] REQUEST RECEIVED');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Keys in body:', Object.keys(req.body));
    console.log('═══════════════════════════════════════');

    const { ownerWallet, proofId, title, description, proofType, ipfsUri } = req.body;

    // DETAILED FIELD CHECK
    const fields = {
      ownerWallet: ownerWallet || 'MISSING',
      proofId: proofId || 'MISSING',
      title: title || 'MISSING',
      description: description || 'MISSING',
      proofType: proofType || 'MISSING',
      ipfsUri: ipfsUri || 'MISSING'
    };

    console.log('[prepare-mint] Field check:', fields);

    const missing = Object.entries(fields)
      .filter(([key, value]) => value === 'MISSING')
      .map(([key]) => key);

    if (missing.length > 0) {
      console.error('[prepare-mint] ❌ MISSING FIELDS:', missing);
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
        received: fields
      });
    }

    console.log('[prepare-mint] ✅ All fields present, proceeding...');

    // Validate lengths
    if (proofId.length > 32) return res.status(400).json({ success: false, error: 'proofId max 32 characters' });
    if (title.length > 64) return res.status(400).json({ success: false, error: 'title max 64 characters' });
    if (ipfsUri.length > 200) return res.status(400).json({ success: false, error: 'ipfsUri max 200 characters' });

    const adminKeypair = getAdminKeypair();
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    const { program, programId } = getProgram(connection, adminKeypair);

    const ownerPublicKey = new PublicKey(ownerWallet);
    const proofPda = deriveProofPda(ownerPublicKey, proofId, programId);
    const programAuthorityPda = deriveProgramAuthorityPda(programId);

    const tx = await program.methods
      .submitProof(proofId, ipfsUri)
      .accounts({
        owner: ownerPublicKey,
        proof: proofPda,
        programAuthority: programAuthorityPda,
        admin: adminKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .transaction();

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = ownerPublicKey; // owner pays rent (payer-is-signer)
    tx.partialSign(adminKeypair);

    const serialized = tx.serialize({ requireAllSignatures: false });
    const base64 = serialized.toString('base64');

    console.log('[prepare-mint] ✅ SUCCESS - Transaction prepared');

    res.json({
      success: true,
      transaction: base64,
      proofPda: proofPda.toString(),
    });

  } catch (error) {
    console.error('[prepare-mint] ❌ ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ───────────────────────
// POST /api/submit-proof  (admin-only direct submission, no owner co-sign)
//
// Used for the mainnet migration script — re-issues devnet proofs on mainnet
// without requiring users to sign. Admin signs everything.
// ───────────────────────
/**
 * @swagger
 * /api/submit-proof:
 *   post:
 *     tags: [Proofs]
 *     summary: Admin-only direct proof submission on-chain
 *     description: Used for mainnet migration — admin signs everything, no owner co-sign needed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [proofId, title, description, proofType, ipfsUri, walletAddress]
 *             properties:
 *               proofId: { type: string, maxLength: 32 }
 *               title: { type: string, maxLength: 64 }
 *               description: { type: string, maxLength: 500 }
 *               proofType: { type: string }
 *               ipfsUri: { type: string, maxLength: 200 }
 *               walletAddress: { type: string }
 *     responses:
 *       200:
 *         description: Proof submitted on-chain
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 tx: { type: string, description: Transaction hash }
 *                 proofPda: { type: string }
 *       400:
 *         description: Missing or invalid fields
 *       500:
 *         description: Server error
 */
app.post('/api/submit-proof', async (req, res) => {
  try {
    const { proofId, title, description, proofType, ipfsUri, walletAddress } = req.body;

    if (!proofId || !title || !description || !proofType || !ipfsUri || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (proofId.length > 32) return res.status(400).json({ error: 'proofId max 32 characters' });
    if (title.length > 64) return res.status(400).json({ error: 'title max 64 characters' });
    if (ipfsUri.length > 200) return res.status(400).json({ error: 'ipfsUri max 200 characters' });
    if (description.length > 500) return res.status(400).json({ error: 'description max 500 characters' });

    console.log('[server] submit-proof (admin direct):', proofId);

    const adminKeypair = getAdminKeypair();
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    const { program, programId } = getProgram(connection, adminKeypair);

    const ownerPublicKey = new PublicKey(walletAddress);
    const proofPda = deriveProofPda(ownerPublicKey, proofId, programId);
    const programAuthorityPda = deriveProgramAuthorityPda(programId);

    // 4 args — description stays off-chain in Supabase
    const tx = await program.methods
      .submitProof(proofId, ipfsUri)
      .accounts({
        owner: ownerPublicKey,
        proof: proofPda,
        programAuthority: programAuthorityPda,
        admin: adminKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      // NOTE: owner does not sign here — admin handles everything
      // This is intentional for the migration flow
      .signers([adminKeypair])
      .rpc();

    console.log('[server] submit-proof tx:', tx);
    res.json({ success: true, tx, proofPda: proofPda.toString() });

  } catch (error) {
    console.error('[server] submit-proof error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ───────────────────────
// POST /api/migrate-to-mainnet
//
// ONE-TIME migration endpoint. Run this when launching to mainnet.
// Reads all verified proofs from the database and re-issues them on-chain
// using submit_proof. Admin pays for everything. Users do nothing.
//
// Protect this route — only call it from a trusted admin script or with
// a secret header. Never expose it publicly.
//
// Usage: POST /api/migrate-to-mainnet
//        Headers: { "x-migration-secret": "your-secret-here" }
// ───────────────────────
/**
 * @swagger
 * /api/migrate-to-mainnet:
 *   post:
 *     tags: [Migration]
 *     summary: Batch migrate verified proofs to mainnet (admin only)
 *     description: |
 *       One-time migration endpoint. Reads all verified proofs from Supabase and
 *       re-issues them on Solana mainnet. Protected by x-migration-secret header.
 *     parameters:
 *       - name: x-migration-secret
 *         in: header
 *         required: true
 *         schema: { type: string }
 *         description: Migration secret from .env
 *     responses:
 *       200:
 *         description: Migration results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 migrated: { type: integer }
 *                 failed: { type: integer }
 *                 results: { type: array, items: { type: object } }
 *                 errors: { type: array, items: { type: object } }
 *       401:
 *         description: Unauthorized
 */
app.post('/api/migrate-to-mainnet', async (req, res) => {
  // Basic protection — set MIGRATION_SECRET in your .env
  const secret = req.headers['x-migration-secret'];
  if (!secret || secret !== process.env.MIGRATION_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('[migrate] Starting mainnet migration...');

    const adminKeypair = getAdminKeypair();
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );
    const { program, programId } = getProgram(connection, adminKeypair);

    // Fetch all verified proofs from the database that haven't been
    // migrated to mainnet yet (no mainnet_tx field set)
    const { data: proofs, error: fetchError } = await supabase
      .from('proofs')
      .select('id, proof_name, proof_type, summary, metadata_ipfs_url, users(wallet_address)')
      .eq('status', 'verified')
      .is('mainnet_tx', null); // only proofs not yet on mainnet

    if (fetchError) throw fetchError;

    console.log(`[migrate] Found ${proofs.length} verified proofs to migrate`);

    const results = [];
    const errors = [];

    for (const proof of proofs) {
      try {
        const walletAddress = proof.users?.wallet_address;
        if (!walletAddress) {
          errors.push({ id: proof.id, error: 'No wallet address' });
          continue;
        }

        // Build a safe proof_id from the DB id (max 32 chars)
        const proofId = String(proof.id).slice(0, 32);
        const title = (proof.proof_name || 'Proof').slice(0, 64);
        const ipfsUri = (proof.metadata_ipfs_url || '').slice(0, 200);
        const proofType = (proof.proof_type || 'general').slice(0, 32);
        // NOTE: summary (description) is NOT passed on-chain — it lives in
        // Supabase only. The migration only needs to anchor the public record.

        const ownerPublicKey = new PublicKey(walletAddress);
        const proofPda = deriveProofPda(ownerPublicKey, proofId, programId);
        const programAuthorityPda = deriveProgramAuthorityPda(programId);

        // 4 args — description stays off-chain in Supabase
        const tx = await program.methods
          .submitProof(proofId, ipfsUri)
          .accounts({
            owner: ownerPublicKey,
            proof: proofPda,
            programAuthority: programAuthorityPda,
            admin: adminKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([adminKeypair])
          .rpc();

        // Save the mainnet tx hash back to the database
        await supabase
          .from('proofs')
          .update({ mainnet_tx: tx, mainnet_pda: proofPda.toString() })
          .eq('id', proof.id);

        console.log(`[migrate] ✓ Proof ${proof.id} migrated. Tx: ${tx}`);
        results.push({ id: proof.id, tx, proofPda: proofPda.toString() });

        // Small delay between transactions to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));

      } catch (err) {
        console.error(`[migrate] ✗ Proof ${proof.id} failed:`, err.message);
        errors.push({ id: proof.id, error: err.message });
      }
    }

    console.log(`[migrate] Done. ${results.length} migrated, ${errors.length} failed.`);
    res.json({ success: true, migrated: results.length, failed: errors.length, results, errors });

  } catch (error) {
    console.error('[migrate] Migration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ───────────────────────
// SMART TAGS EXTRACTION
// ───────────────────────

/**
 * @swagger
 * /api/proofs/{proofId}/smart-tags:
 *   post:
 *     tags: [Proofs]
 *     summary: Extract and save smart tags for a proof
 *     description: |
 *       Uses AI to extract relevant tags (skills, technologies, expertise) from proof content
 *       and saves them to the proofs table for better categorization and search.
 *     parameters:
 *       - name: proofId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [proofName, proofType, summary]
 *             properties:
 *               proofName: { type: string }
 *               proofType: { type: string }
 *               summary: { type: string }
 *               extractedData: { type: object }
 *     responses:
 *       200:
 *         description: Smart tags extracted and saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 tags: { type: array, items: { type: string } }
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
app.post('/api/proofs/:proofId/smart-tags', async (req, res) => {
  try {
    const { proofId } = req.params;
    const { proofName, proofType, summary, extractedData } = req.body;

    if (!proofName || !proofType || !summary) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    console.log(`[smart-tags] Extracting tags for proof ${proofId}`);

    let smartTags = [];

    // Use OpenAI if available for intelligent tag extraction
    if (OPENAI_API_KEY) {
      try {
        const prompt = `Extract relevant skill tags, technologies, and expertise areas from this proof.
Proof Name: ${proofName}
Proof Type: ${proofType}
Summary: ${summary}
${extractedData ? `\nExtracted Data: ${JSON.stringify(extractedData)}` : ''}

Return ONLY a JSON array of 3-10 relevant tags (e.g., ["React", "TypeScript", "Web Development"]). Be specific and use standard technology/skill names.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a skill extraction assistant. Extract relevant technology and skill tags from proof descriptions. Return only valid JSON arrays.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 200
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0].message.content.trim();
          try {
            smartTags = JSON.parse(content);
            console.log(`[smart-tags] AI extracted ${smartTags.length} tags`);
          } catch (e) {
            console.warn('[smart-tags] Failed to parse AI response, using fallback');
          }
        }
      } catch (error) {
        console.warn('[smart-tags] OpenAI extraction failed, using fallback:', error.message);
      }
    }

    // Fallback: Extract tags from proof type and text analysis
    if (smartTags.length === 0) {
      const text = `${proofName} ${summary} ${JSON.stringify(extractedData || {})}`.toLowerCase();

      // Common technology keywords
      const techKeywords = [
        'react', 'vue', 'angular', 'javascript', 'typescript', 'python', 'java', 'c++', 'c#',
        'node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'php',
        'mongodb', 'postgresql', 'mysql', 'redis', 'graphql', 'rest api',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd',
        'machine learning', 'ai', 'data science', 'blockchain', 'solana', 'ethereum',
        'ui/ux', 'figma', 'photoshop', 'illustrator', 'design',
        'agile', 'scrum', 'project management', 'leadership',
        'web development', 'mobile development', 'frontend', 'backend', 'fullstack'
      ];

      smartTags = techKeywords.filter(keyword => text.includes(keyword));

      // Add proof type as a tag
      if (proofType && !smartTags.includes(proofType)) {
        smartTags.unshift(proofType);
      }

      // Limit to 10 tags
      smartTags = smartTags.slice(0, 10);
      console.log(`[smart-tags] Fallback extracted ${smartTags.length} tags`);
    }

    // Save tags to database
    const { error: updateError } = await supabase
      .from('proofs')
      .update({ smart_tags: smartTags })
      .eq('id', proofId);

    if (updateError) {
      console.error('[smart-tags] Database update error:', updateError);
      throw updateError;
    }

    console.log(`[smart-tags] Successfully saved ${smartTags.length} tags for proof ${proofId}`);
    res.json({ success: true, tags: smartTags });

  } catch (error) {
    console.error('[smart-tags] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/proofs/search-by-tags:
 *   post:
 *     tags: [Proofs]
 *     summary: Search proofs by smart tags
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tags]
 *             properties:
 *               tags: { type: array, items: { type: string } }
 *               matchAll: { type: boolean, description: 'If true, proof must have ALL tags. If false, ANY tag matches.' }
 *     responses:
 *       200:
 *         description: Matching proofs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array }
 */
app.post('/api/proofs/search-by-tags', async (req, res) => {
  try {
    const { tags, matchAll = false } = req.body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ success: false, error: 'Tags array is required' });
    }

    let query = supabase
      .from('proofs')
      .select('*')
      .eq('status', 'verified');

    if (matchAll) {
      // Proof must contain ALL tags
      query = query.contains('smart_tags', tags);
    } else {
      // Proof must contain ANY of the tags
      query = query.overlaps('smart_tags', tags);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('[smart-tags] Search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ───────────────────────
// MESSAGES
// ───────────────────────

/**
 * @swagger
 * /api/messages:
 *   post:
 *     tags: [Messages]
 *     summary: Send a portfolio request message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sender_id, receiver_id, portfolio_id, message]
 *             properties:
 *               sender_id: { type: string }
 *               receiver_id: { type: string, format: uuid }
 *               portfolio_id: { type: string, format: uuid }
 *               message: { type: string }
 *               sender_name: { type: string }
 *               sender_email: { type: string, format: email }
 *               type: { type: string }
 *     responses:
 *       201:
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Message' }
 *       400:
 *         description: Missing required fields
 */
app.post('/api/messages', async (req, res) => {
  try {
    const { sender_id, receiver_id, portfolio_id, message, sender_name, sender_email, type } = req.body;
    if (!sender_id || !receiver_id || !portfolio_id || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_id, receiver_id, portfolio_id, message, sender_name, sender_email, type, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/messages/{userId}:
 *   get:
 *     tags: [Messages]
 *     summary: Get messages for a user
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Message' }
 */
app.get('/api/messages/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', req.params.userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/messages/{messageId}/read:
 *   patch:
 *     tags: [Messages]
 *     summary: Mark a message as read
 *     parameters:
 *       - name: messageId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Message updated
 */
app.patch('/api/messages/:messageId/read', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', req.params.messageId)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/messages/{messageId}:
 *   delete:
 *     tags: [Messages]
 *     summary: Delete a message
 *     parameters:
 *       - name: messageId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Message deleted
 */
app.delete('/api/messages/:messageId', async (req, res) => {
  try {
    const { error } = await supabase.from('messages').delete().eq('id', req.params.messageId);
    if (error) throw error;
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/messages/{messageId}/respond:
 *   patch:
 *     tags: [Messages]
 *     summary: Respond to a message (accept/reject)
 *     parameters:
 *       - name: messageId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [accepted, rejected] }
 *     responses:
 *       200:
 *         description: Response recorded
 */
app.patch('/api/messages/:messageId/respond', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ status: req.body.status, read: true })
      .eq('id', req.params.messageId)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ───────────────────────
// PREMIUM GIGS (Solana USDT Payment-Gated)
//
// These routes require a Solana USDT micro-payment before
// the client can access the premium content. The middleware returns HTTP 402
// with payment instructions if no valid payment header is present.
//
// Usage:
//   - Default pricing:  solanaPaymentMiddleware
//   - Custom pricing:   createSolanaPaymentMiddleware({ amount: '5000', description: '...' })
// ───────────────────────

/**
 * @swagger
 * /api/gigs/premium/{id}:
 *   get:
 *     tags: [Premium]
 *     summary: Get a premium gig (x402 payment required)
 *     description: |
 *       Requires a Solana USDT micro-payment. See middleware for amount.
 *       If no valid `X-PAYMENT` header is provided, returns HTTP 402 with payment instructions.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *       - $ref: '#/components/parameters/PaymentHeader'
 *     responses:
 *       200:
 *         description: Premium gig data (after payment verification)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: object }
 *                 payment: { type: object, description: x402 verification result }
 *       402:
 *         description: Payment required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/x402PaymentRequired'
 *       404:
 *         description: Gig not found
 */
app.get('/api/gigs/premium/:id', solanaPaymentMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabase
        .from('gigs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ success: false, error: 'Premium gig not found' });
        }
        throw error;
      }

      return res.json({
        success: true,
        data,
        payment: req.solanaPayment,
      });
    }

    return res.status(503).json({ success: false, error: 'Database not configured' });
  } catch (error) {
    console.error('GET /api/gigs/premium/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ───────────────────────
// ADDITIONAL SOLANA USDT PAYMENT-GATED ROUTES
// ───────────────────────

/**
 * @swagger
 * /api/profiles/premium/{id}:
 *   get:
 *     tags: [Premium]
 *     summary: Get premium profile data (x402 payment required)
 *     description: |
 *       Access detailed profile analytics and metrics.
 *       Requires 0.001 USDC payment on Base.
 */
app.get('/api/profiles/premium/:id', solanaPaymentMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, proofs(*)')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ success: false, error: 'Profile not found' });
        }
        throw error;
      }

      // Add analytics data
      const premiumData = {
        ...data,
        analytics: {
          totalProofs: data.proofs?.length || 0,
          verifiedProofs: data.proofs?.filter(p => p.status === 'verified').length || 0,
          lastActive: data.proofs?.[0]?.created_at,
        },
      };

      return res.json({
        success: true,
        data: premiumData,
        payment: req.solanaPayment,
      });
    }

    return res.status(503).json({ success: false, error: 'Database not configured' });
  } catch (error) {
    console.error('GET /api/profiles/premium/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/reports/revenue:
 *   get:
 *     tags: [Premium]
 *     summary: Get revenue reports (x402 payment required)
 *     description: |
 *       Access revenue analytics and reporting.
 *       Requires 0.005 USDC payment on Base.
 */
app.get('/api/reports/revenue', createSolanaPaymentMiddleware({
  amount: '5000',
  description: 'Revenue reports access',
}), async (req, res) => {
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabase
        .from('proofs')
        .select('*, users(wallet_address)')
        .eq('status', 'verified');

      if (error) throw error;

      // Calculate revenue metrics
      const totalProofs = data.length;
      const revenue = totalProofs * 0.001; // 0.001 USDC per proof

      return res.json({
        success: true,
        data: {
          totalProofs,
          estimatedRevenue: revenue,
          currency: 'USDC',
          period: 'all-time',
        },
        payment: req.solanaPayment,
      });
    }

    return res.status(503).json({ success: false, error: 'Database not configured' });
  } catch (error) {
    console.error('GET /api/reports/revenue error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/ai/premium:
 *   post:
 *     tags: [Premium]
 *     summary: Premium AI features (x402 payment required)
 *     description: |
 *       Access advanced AI-powered features via OpenAI GPT-4.
 *       Requires 0.002 USDC payment on Base.
 */
app.post('/api/ai/premium', createSolanaPaymentMiddleware({
  amount: '2000',
  description: 'Premium AI features',
}), async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    if (!OPENAI_API_KEY) {
      return res.status(503).json({ success: false, error: 'AI service not configured' });
    }

    // Call OpenAI API for premium AI features
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a premium AI assistant with advanced capabilities. Provide detailed, accurate, and professional responses.'
          },
          {
            role: 'user',
            content: context ? `Context: ${context}\n\nPrompt: ${prompt}` : prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('[AI Premium] OpenAI API error:', errorData);
      return res.status(502).json({ success: false, error: 'AI service error' });
    }

    const aiData = await openaiResponse.json();
    const aiResponse = aiData.choices[0].message.content;

    res.json({
      success: true,
      data: {
        response: aiResponse,
        model: aiData.model,
        usage: aiData.usage,
      },
      payment: req.solanaPayment,
    });
  } catch (error) {
    console.error('POST /api/ai/premium error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});



/**
 * @swagger
 * /api/extraction/premium:
 *   post:
 *     tags: [Premium]
 *     summary: Premium document extraction (x402 payment required)
 *     description: |
 *       Access advanced document extraction with higher limits via Extraction API.
 *       Requires 0.01 USDC payment on Base.
 */
app.post('/api/extraction/premium', createSolanaPaymentMiddleware({
  amount: '10000',
  description: 'Premium document extraction (higher limits)',
}), async (req, res) => {
  try {
    const { documentUrl, extractionType } = req.body;

    if (!documentUrl) {
      return res.status(400).json({ success: false, error: 'documentUrl is required' });
    }

    const extractionApiUrl = process.env.EXTRACTION_API_URL || 'http://localhost:3000';

    // Fetch the document from the provided URL
    const docResponse = await fetch(documentUrl);
    if (!docResponse.ok) {
      return res.status(400).json({ success: false, error: 'Failed to fetch document from URL' });
    }

    const buffer = Buffer.from(await docResponse.arrayBuffer());

    // Create form data for the extraction API using Node.js native FormData
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'application/pdf' });
    formData.append('file', blob, 'document.pdf');
    formData.append('proof_type', extractionType || 'certificate');

    const extractResponse = await fetch(`${extractionApiUrl}/api/extract`, {
      method: 'POST',
      body: formData,
    });

    if (!extractResponse.ok) {
      const errorText = await extractResponse.text();
      console.error('[Extraction Premium] Extraction API error:', errorText);
      return res.status(502).json({ success: false, error: 'Extraction service error' });
    }

    const extractionResult = await extractResponse.json();

    res.json({
      success: true,
      data: {
        extracted: extractionResult.extracted_data,
        validationHash: extractionResult.validation_hash,
        needsReview: extractionResult.needs_review,
        flaggedFields: extractionResult.flagged_fields,
      },
      payment: req.solanaPayment,
    });
  } catch (error) {
    console.error('POST /api/extraction/premium error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ───────────────────────
// DEVNET FAUCET (never expose on mainnet)
// ───────────────────────
app.post('/api/devnet/faucet', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Faucet disabled on mainnet' });
  }
  const { walletAddress, amount = 5 } = req.body;
  if (!walletAddress) return res.status(400).json({ error: 'walletAddress required' });

  const { execSync } = require('child_process');
  const mint = process.env.USDT_MINT;
  if (!mint) return res.status(500).json({ error: 'USDT_MINT not configured' });

  try {
    // Create ATA if it doesn't exist (ignore error if already exists)
    try {
      execSync(`spl-token create-account ${mint} --owner ${walletAddress} --url devnet 2>/dev/null`);
    } catch (_) { /* ATA already exists — fine */ }

    execSync(`spl-token mint ${mint} ${amount} --recipient-owner ${walletAddress} --url devnet`);
    res.json({ success: true, message: `${amount} test USDT sent to ${walletAddress.slice(0, 8)}...` });
  } catch (err) {
    console.error('[faucet] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/devnet/usdt-balance', async (req, res) => {
  const { wallet } = req.query;
  if (!wallet) return res.status(400).json({ error: 'wallet query param required' });

  const { execSync } = require('child_process');
  const mint = process.env.USDT_MINT;
  if (!mint) return res.status(500).json({ error: 'USDT_MINT not configured' });

  try {
    const out = execSync(
      `spl-token balance ${mint} --owner ${wallet} --url devnet 2>/dev/null`
    ).toString().trim();
    const balance = parseFloat(out) || 0;
    res.json({ success: true, balance, wallet });
  } catch (_) {
    // Wallet has no ATA for this token — balance is 0
    res.json({ success: true, balance: 0, wallet });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ───────────────────────
// JOBS API (lightweight): stores to Supabase when possible, falls back to backend/jobs.json
// ───────────────────────

const readJobsFile = async () => {
  try {
    const raw = await fs.readFile(JOBS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(JOBS_FILE, JSON.stringify([]));
      return [];
    }
    throw err;
  }
};

const writeJobsFile = async (jobs) => {
  await fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2));
};

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     tags: [Jobs]
 *     summary: List all jobs
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Job' }
 */
app.get('/api/jobs', async (req, res) => {
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data, error } = await supabase.from('jobs').select('*').order('posted_at', { ascending: false });
        if (!error) return res.json({ success: true, data });
      } catch (e) {
        console.warn('Supabase jobs read failed, falling back to file store', e.message);
      }
    }

    const jobs = await readJobsFile();
    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error('GET /api/jobs error', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     tags: [Jobs]
 *     summary: Create a new job listing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               requirements: { type: string }
 *               budget: { type: number }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Job created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Job' }
 */
app.post('/api/jobs', async (req, res) => {
  try {
    const payload = req.body;
    const job = {
      ...payload,
      id: String(Date.now()),
      posted_at: new Date().toISOString(),
      applicants: payload.applicants || []
    };

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data, error } = await supabase.from('jobs').insert([job]).select().single();
        if (!error) return res.status(201).json({ success: true, data });
      } catch (e) {
        console.warn('Supabase insert failed, falling back to file store', e.message);
      }
    }

    const jobs = await readJobsFile();
    jobs.unshift(job);
    await writeJobsFile(jobs);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error('POST /api/jobs error', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/jobs/{jobId}/apply:
 *   post:
 *     tags: [Jobs]
 *     summary: Apply to a job
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter: { type: string }
 *               resume: { type: string }
 *               profile: { type: string }
 *     responses:
 *       201:
 *         description: Application submitted
 *       404:
 *         description: Job not found
 */
app.post('/api/jobs/:jobId/apply', async (req, res) => {
  try {
    const { jobId } = req.params;
    const applicant = { id: String(Date.now()), status: 'applied', applied_at: new Date().toISOString(), ...req.body };

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).limit(1).single();
        if (job) {
          const applicants = job.applicants || [];
          applicants.push(applicant);
          const { data, error } = await supabase.from('jobs').update({ applicants }).eq('id', jobId).select().single();
          if (!error) return res.status(201).json({ success: true, data: applicant });
        }
      } catch (e) {
        console.warn('Supabase apply failed, falling back to file store', e.message);
      }
    }

    const jobs = await readJobsFile();
    const idx = jobs.findIndex(j => String(j.id) === String(jobId));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Job not found' });
    jobs[idx].applicants = jobs[idx].applicants || [];
    jobs[idx].applicants.push(applicant);
    await writeJobsFile(jobs);
    res.status(201).json({ success: true, data: applicant });
  } catch (error) {
    console.error('POST /api/jobs/:jobId/apply error', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/jobs/{jobId}/applicants:
 *   get:
 *     tags: [Jobs]
 *     summary: List applicants for a job
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of applicants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Applicant' }
 *       404:
 *         description: Job not found
 */
app.get('/api/jobs/:jobId/applicants', async (req, res) => {
  try {
    const { jobId } = req.params;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data: job, error } = await supabase.from('jobs').select('applicants').eq('id', jobId).limit(1).single();
        if (!error) return res.json({ success: true, data: job?.applicants || [] });
      } catch (e) {
        console.warn('Supabase applicants read failed, falling back to file store', e.message);
      }
    }
    const jobs = await readJobsFile();
    const job = jobs.find(j => String(j.id) === String(jobId));
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    res.json({ success: true, data: job.applicants || [] });
  } catch (error) {
    console.error('GET /api/jobs/:jobId/applicants error', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/jobs/{jobId}/applicants/{applicantId}:
 *   patch:
 *     tags: [Jobs]
 *     summary: Update applicant status
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *       - name: applicantId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [applied, accepted, rejected] }
 *     responses:
 *       200:
 *         description: Applicant status updated
 *       400:
 *         description: Missing status
 *       404:
 *         description: Job or applicant not found
 */
app.patch('/api/jobs/:jobId/applicants/:applicantId', async (req, res) => {
  try {
    const { jobId, applicantId } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'Missing status' });

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data: job } = await supabase.from('jobs').select('applicants').eq('id', jobId).limit(1).single();
        if (job) {
          const applicants = (job.applicants || []).map(a => a.id === applicantId ? { ...a, status } : a);
          const { data, error } = await supabase.from('jobs').update({ applicants }).eq('id', jobId).select().single();
          if (!error) return res.json({ success: true, data });
        }
      } catch (e) {
        console.warn('Supabase applicant update failed, falling back to file store', e.message);
      }
    }

    const jobs = await readJobsFile();
    const job = jobs.find(j => String(j.id) === String(jobId));
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    job.applicants = job.applicants || [];
    const a = job.applicants.find(x => String(x.id) === String(applicantId));
    if (!a) return res.status(404).json({ success: false, error: 'Applicant not found' });
    a.status = status;
    await writeJobsFile(jobs);
    res.json({ success: true, data: a });
  } catch (error) {
    console.error('PATCH /api/jobs/:jobId/applicants/:applicantId error', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/jobs/{jobId}/ai-match:
 *   post:
 *     tags: [Jobs]
 *     summary: AI-powered applicant matching
 *     description: Uses OpenAI (or heuristic fallback) to score applicants against job requirements.
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Scored applicants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       applicantId: { type: string }
 *                       score: { type: integer, minimum: 0, maximum: 100 }
 *                       reasons: { type: string }
 *       404:
 *         description: Job not found
 */
app.post('/api/jobs/:jobId/ai-match', async (req, res) => {
  try {
    const { jobId } = req.params;
    let job;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data } = await supabase.from('jobs').select('*').eq('id', jobId).limit(1).single();
        job = data;
      } catch (e) { /* ignore */ }
    }
    if (!job) {
      const jobs = await readJobsFile();
      job = jobs.find(j => String(j.id) === String(jobId));
    }
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    const applicants = job.applicants || [];

    // If OpenAI key available, call the API for a structured scoring
    if (OPENAI_API_KEY) {
      try {
        const prompt = `You are a job-matching assistant. Given the job and applicants, return a JSON array of objects: { applicantId, score, reasons } where score is 0-100.
Job: ${JSON.stringify(job)}
Applicants: ${JSON.stringify(applicants)}\n\nRespond with only valid JSON.`;

        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a job-matching assistant that scores applicants 0-100 relative to the job requirements.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 800
          })
        });
        const body = await resp.json();
        const assistant = body?.choices?.[0]?.message?.content;
        let parsed = null;
        try { parsed = JSON.parse(assistant); } catch (e) { /* fallthrough */ }
        if (parsed) return res.json({ success: true, data: parsed });
        // fallback if parsing fails
      } catch (e) {
        console.warn('OpenAI call failed, falling back to heuristic', e.message);
      }
    }

    // Heuristic fallback scoring
    const reqText = ((job.requirements || '') + ' ' + (job.description || '')).toLowerCase();
    const keywords = (job.tags || []).concat((job.requirements || '').split(/[,\n]/)).map(s => s.trim()).filter(Boolean);
    const results = applicants.map(a => {
      const text = ((a.coverLetter || '') + ' ' + (a.resume || '') + ' ' + (a.profile || '')).toLowerCase();
      let score = 0;
      keywords.forEach(k => { if (k && text.includes(k.toLowerCase())) score += 10; });
      if (a.resume) score += 10;
      score = Math.min(100, Math.round((score / (Math.max(1, keywords.length) * 10)) * 100));
      return { applicantId: a.id, score, reasons: `Matched: ${keywords.filter(k => text.includes(k.toLowerCase())).join(', ')}` };
    });

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('POST /api/jobs/:jobId/ai-match error', error);
    res.status(500).json({ success: false, error: error.message });
  }
});