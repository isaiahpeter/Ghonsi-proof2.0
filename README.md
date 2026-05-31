# Ghonsi Proof

<div align="center">

![Ghonsi Proof Logo](frontend/public/assets/ghonsi-proof-logos/transparent-png-logo/ghonsi-proof1.png)

**Blockchain-Powered Professional Verification Platform.**

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat&logo=react)](https://reactjs.org/)
[![Solana](https://img.shields.io/badge/Solana-Web3-purple?style=flat&logo=solana)](https://solana.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat&logo=node.js)](https://nodejs.org/)

[Website](https://ghonsiproof.com) • [Documentation](#documentation) • [API Reference](#api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Smart Contract Integration](#smart-contract-integration)
- [Payment Systems](#payment-systems)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

**Ghonsi Proof** is a decentralized platform that revolutionizes professional verification by leveraging blockchain technology. It connects professionals with hirers through a transparent, immutable proof-of-work system built on the Solana blockchain.

The platform enables professionals to:
- Upload and verify their work credentials
- Create immutable blockchain proofs of their achievements
- Showcase their portfolio to potential hirers
- Receive payments through multiple blockchain networks

Hirers can:
- Browse verified professional profiles
- Request custom work proofs
- Make secure payments via Solana or x402 protocol
- Access a marketplace of verified talent

---

## ✨ Key Features

### 🔐 Blockchain Verification
- **Immutable Proofs**: All professional credentials are stored on Solana blockchain
- **Smart Contract Integration**: Automated proof creation and verification via Anchor framework
- **IPFS Storage**: Decentralized file storage using Pinata for proof documents

### 💳 Multi-Chain Payment Support
- **Solana Payments**: Native USDT payments on Solana network
- **x402 Protocol**: Cross-chain payment support (Base network)
- **Wallet Integration**: Support for Phantom, Solflare, and other Solana wallets

### 🤖 AI-Powered Extraction
- **Automated Data Extraction**: Claude AI integration for intelligent document processing
- **OCR Capabilities**: Extract text and data from uploaded proof documents
- **Smart Tagging**: Automatic categorization and metadata generation

### 👥 Dual User Experience
- **Professional Dashboard**: Upload proofs, manage portfolio, track requests
- **Hirer Dashboard**: Browse marketplace, request proofs, manage payments
- **Messaging System**: Direct communication between hirers and professionals

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion and GSAP for engaging interactions
- **Dark Mode Support**: Optimized viewing experience
- **Accessibility**: WCAG compliant components

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 15)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Hirers     │  │ Professionals│  │    Shared    │      │
│  │   Routes     │  │    Routes    │  │   Routes     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
┌───────────────▼──────────┐  ┌──────────▼──────────────┐
│   Backend API (Express)  │  │  Extraction API (Node)  │
│  ┌────────────────────┐  │  │  ┌──────────────────┐   │
│  │  REST Endpoints    │  │  │  │  Claude AI       │   │
│  │  Solana Integration│  │  │  │  OCR Processing  │   │
│  │  x402 Middleware   │  │  │  │  Data Extraction │   │
│  │  Email Service     │  │  │  └──────────────────┘   │
│  └────────────────────┘  │  └─────────────────────────┘
└──────────┬────────────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼────┐  ┌────▼─────┐  ┌──────────┐  ┌──────────┐
│Supabase│  │  Solana  │  │   IPFS   │  │  Brevo   │
│Database│  │Blockchain│  │ (Pinata) │  │  Email   │
└────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.3 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 12, GSAP 3.15, Lenis
- **Blockchain**: 
  - @solana/web3.js 1.98
  - @solana/wallet-adapter-react
  - @solana/spl-token
- **Database**: Supabase Client
- **State Management**: TanStack React Query 5.0
- **Icons**: Lucide React, Font Awesome

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.18
- **Blockchain**: 
  - @coral-xyz/anchor 0.32
  - @solana/web3.js 1.98
- **Database**: Supabase (PostgreSQL)
- **Email**: Brevo API 5.0
- **File Upload**: Multer
- **API Documentation**: Swagger (OpenAPI)

### Extraction API
- **Runtime**: Node.js 18+
- **Framework**: Express 4.18
- **AI**: Anthropic Claude SDK 0.24
- **Utilities**: async-retry, multer

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Linting**: ESLint 9
- **Testing**: Jest, Supertest
- **Environment**: dotenv

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Solana CLI**: (Optional, for blockchain development) ([Install Guide](https://docs.solana.com/cli/install-solana-cli-tools))

### Required Accounts & API Keys

1. **Supabase Account** ([Sign up](https://supabase.com/))
   - Create a new project
   - Get your project URL and anon key

2. **Solana Wallet**
   - Install [Phantom](https://phantom.app/) or [Solflare](https://solflare.com/)
   - Get devnet/mainnet SOL for transactions

3. **Pinata Account** ([Sign up](https://pinata.cloud/))
   - For IPFS file storage
   - Get your JWT token

4. **Brevo Account** ([Sign up](https://www.brevo.com/))
   - For email notifications
   - Get your API key

5. **Anthropic API Key** ([Sign up](https://www.anthropic.com/))
   - For Claude AI integration
   - Get your API key

6. **x402 Setup** (Optional, for cross-chain payments)
   - Configure Base network wallet

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ghonsi-mainnet.git
cd ghonsi-mainnet
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../backend
npm install
```

### 4. Install Extraction API Dependencies

```bash
cd extraction_api
npm install
cd ../..
```

---

## ⚙️ Configuration

### Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# ── Supabase ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# ── Backend API ───────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3001

# ── Extraction API ────────────────────────────────────────────────────────────
NEXT_PUBLIC_EXTRACTION_API_URL=http://localhost:3002

# ── Solana ────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_USDT_MINT=9QR25RvDUtqiTs1ibmVbqrY4V3NgD6VLVtstbwxBdHg
NEXT_PUBLIC_TREASURY_WALLET=your-treasury-wallet-address
NEXT_PUBLIC_PAYMENT_AMOUNT_REQUEST=150000
NEXT_PUBLIC_PAYMENT_AMOUNT_UPLOAD=200000

# ── Pinata IPFS ───────────────────────────────────────────────────────────────
NEXT_PUBLIC_PINATA_JWT=your-pinata-jwt-token

# ── x402 Payments ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_X402_FACILITATOR_URL=https://x402.org/facilitator
NEXT_PUBLIC_X402_NETWORK=base
NEXT_PUBLIC_X402_ASSET=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# ── AI API ────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_AI_API_KEY=your-anthropic-api-key
```

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd ../backend
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# ── Supabase ──────────────────────────────────────────────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ── Solana ────────────────────────────────────────────────────────────────────
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_BACKEND_PRIVATE_KEY=[1,2,3,...]  # Your wallet private key as array
PROGRAM_ID=your-deployed-program-id
TREASURY_WALLET=your-solana-wallet-public-key

# ── Brevo Email ───────────────────────────────────────────────────────────────
BREVO_API_KEY=your-brevo-api-key

# ── OpenAI ────────────────────────────────────────────────────────────────────
OPENAI_API_KEY=sk-your-openai-key

# ── x402 Payments ─────────────────────────────────────────────────────────────
X402_PAY_TO_ADDRESS=0xYourWalletAddress
X402_DEFAULT_AMOUNT=1000
X402_NETWORK=base
X402_ASSET=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
X402_FACILITATOR_URL=https://x402.org/facilitator

# ── Extraction API ────────────────────────────────────────────────────────────
EXTRACTION_API_URL=http://localhost:3002

# ── Security ──────────────────────────────────────────────────────────────────
MIGRATION_SECRET=your-secret-key-here

# ── Server ────────────────────────────────────────────────────────────────────
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Extraction API Environment Variables

Create a `.env` file in the `backend/extraction_api` directory:

```bash
cd extraction_api
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3002
ANTHROPIC_API_KEY=your-anthropic-api-key
```

---

## 🏃 Running the Application

### Development Mode

You'll need **three terminal windows** to run all services:

#### Terminal 1: Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at: **http://localhost:3000**

#### Terminal 2: Backend API

```bash
cd backend
npm run dev
```

The backend API will be available at: **http://localhost:3001**

API Documentation (Swagger): **http://localhost:3001/api-docs**

#### Terminal 3: Extraction API

```bash
cd backend/extraction_api
npm run dev
```

The extraction API will be available at: **http://localhost:3002**

### Production Mode

#### Build Frontend

```bash
cd frontend
npm run build
npm start
```

#### Run Backend

```bash
cd backend
npm start
```

#### Run Extraction API

```bash
cd backend/extraction_api
npm start
```

### Background Worker (Optional)

For processing background jobs:

```bash
cd backend
npm run worker
```

---

## 📁 Project Structure

```
ghonsi-mainnet/
├── frontend/                      # Next.js frontend application
│   ├── public/                    # Static assets
│   │   └── assets/               # Images, logos, videos
│   │       ├── ghonsi-home-motion/
│   │       ├── ghonsi-proof-logos/
│   │       ├── partners-logo/
│   │       ├── reviewers-image/
│   │       └── team/
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── (hirers)/        # Hirer-specific routes
│   │   │   │   └── hirers/
│   │   │   │       ├── dashboard/
│   │   │   │       ├── messages/
│   │   │   │       ├── profile/
│   │   │   │       └── requests/
│   │   │   ├── (professionals)/  # Professional-specific routes
│   │   │   │   └── professionals/
│   │   │   │       ├── dashboard/
│   │   │   │       ├── messages/
│   │   │   │       ├── profile/
│   │   │   │       └── upload-proof/
│   │   │   ├── (shared)/        # Shared routes
│   │   │   │   ├── about/
│   │   │   │   ├── contact/
│   │   │   │   ├── faq/
│   │   │   │   ├── faucet/
│   │   │   │   ├── login/
│   │   │   │   ├── marketplace/
│   │   │   │   ├── message/
│   │   │   │   ├── policy/
│   │   │   │   ├── terms/
│   │   │   │   └── user-type/
│   │   │   ├── auth/            # Authentication callbacks
│   │   │   ├── globals.css      # Global styles
│   │   │   ├── layout.js        # Root layout
│   │   │   └── page.js          # Home page
│   │   ├── components/          # React components
│   │   │   ├── layout/          # Layout components (Navbar, Footer)
│   │   │   ├── ui/              # Reusable UI components
│   │   │   └── ...
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility libraries
│   │   │   └── supabaseClient.js
│   │   └── utils/               # Helper functions
│   │       └── supabaseAuth.js
│   ├── .env.local.example       # Environment variables template
│   ├── AGENTS.md                # Agent coding guide
│   ├── CLAUDE.md                # Claude AI integration docs
│   ├── next.config.mjs          # Next.js configuration
│   ├── package.json             # Frontend dependencies
│   ├── postcss.config.mjs       # PostCSS configuration
│   └── tailwind.config.js       # Tailwind CSS configuration
│
├── backend/                      # Express backend API
│   ├── extraction_api/          # AI-powered extraction service
│   │   ├── src/
│   │   │   ├── ocr.js          # OCR processing
│   │   │   ├── prompts.js      # Claude AI prompts
│   │   │   └── routes.js       # API routes
│   │   ├── .env.example        # Environment template
│   │   ├── package.json        # Dependencies
│   │   ├── requirements.txt    # Python dependencies (if any)
│   │   └── server.js           # Extraction API server
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   │   ├── solanaPaymentConfig.js
│   │   │   ├── swagger.js      # API documentation config
│   │   │   └── x402Config.js
│   │   └── middleware/         # Express middleware
│   │       ├── solanaPaymentMiddleware.js
│   │       └── x402Middleware.js
│   ├── .env.example            # Environment template
│   ├── brevoEmail.js           # Email service integration
│   ├── package.json            # Backend dependencies
│   ├── server.js               # Main API server
│   └── worker.js               # Background job processor
│
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

---

## 📚 API Documentation

### Backend API Endpoints

The backend API runs on `http://localhost:3001` and provides the following endpoints:

#### Authentication & Users
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

#### Proofs
- `GET /api/proofs` - List all proofs
- `GET /api/proofs/:id` - Get specific proof
- `POST /api/proofs` - Create new proof (with Solana transaction)
- `PUT /api/proofs/:id` - Update proof
- `DELETE /api/proofs/:id` - Delete proof

#### Requests
- `GET /api/requests` - List proof requests
- `POST /api/requests` - Create new request
- `PUT /api/requests/:id` - Update request status
- `DELETE /api/requests/:id` - Cancel request

#### Messages
- `GET /api/messages` - Get user messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read

#### Payments
- `POST /api/payments/solana` - Process Solana payment
- `POST /api/payments/x402` - Process x402 payment
- `GET /api/payments/:id` - Get payment status

#### Smart Tags
- `GET /api/tags` - List available tags
- `POST /api/tags` - Create custom tag

### Extraction API Endpoints

The extraction API runs on `http://localhost:3002`:

- `POST /api/extract` - Extract data from uploaded document
  - Accepts: multipart/form-data with file
  - Returns: Extracted structured data
- `GET /api/debug` - Check API health and environment

### Swagger Documentation

Interactive API documentation is available at:
**http://localhost:3001/api-docs**

---

## ⛓️ Smart Contract Integration

### Solana Program

The platform uses an Anchor-based Solana program for proof management:

#### Program Features
- **Proof Creation**: Store proof metadata on-chain
- **Proof Verification**: Validate proof authenticity
- **Payment Processing**: Handle USDT payments
- **PDA Derivation**: Deterministic proof account addresses

#### Key Functions

```javascript
// Derive Proof PDA
const [proofPda] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("proof"),
    ownerPublicKey.toBuffer(),
    Buffer.from(proofId)
  ],
  programId
);

// Create Proof Transaction
const tx = await program.methods
  .createProof(proofId, metadata)
  .accounts({
    proof: proofPda,
    owner: ownerPublicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

#### Program Deployment

1. Build the program:
```bash
anchor build
```

2. Deploy to devnet:
```bash
anchor deploy --provider.cluster devnet
```

3. Update `PROGRAM_ID` in environment variables

---

## 💰 Payment Systems

### Solana Payments

**Token**: USDT (SPL Token)
**Network**: Solana Devnet/Mainnet

#### Payment Flow
1. User connects Solana wallet (Phantom/Solflare)
2. Frontend creates payment transaction
3. User approves transaction in wallet
4. Backend verifies transaction on-chain
5. Service is activated upon confirmation

#### Payment Amounts
- **Proof Request**: 0.15 USDT (150,000 lamports)
- **Proof Upload**: 0.20 USDT (200,000 lamports)

### x402 Protocol Payments

**Network**: Base (Ethereum L2)
**Token**: USDC

#### Payment Flow
1. User initiates x402 payment
2. Middleware validates payment request
3. Payment processed through x402 facilitator
4. Backend receives payment confirmation
5. Service is activated

---

## 🔧 Development Guide

### Code Style & Conventions

#### Frontend (Next.js)
- Use `'use client'` directive for client components
- Import alias: `@/` for `src/` directory
- Use `next/link` for navigation (not react-router)
- Use `next/image` for images
- All environment variables must have `NEXT_PUBLIC_` prefix

#### Backend (Express)
- Use async/await for asynchronous operations
- Implement proper error handling middleware
- Use environment variables for configuration
- Follow RESTful API conventions

### Adding New Features

#### 1. Add a New Page (Frontend)

```bash
# For shared pages
mkdir -p frontend/src/app/(shared)/new-page
touch frontend/src/app/(shared)/new-page/page.js

# For professional pages
mkdir -p frontend/src/app/(professionals)/professionals/new-page
touch frontend/src/app/(professionals)/professionals/new-page/page.js
```

#### 2. Add a New API Endpoint (Backend)

```javascript
// In backend/server.js
app.post('/api/new-endpoint', async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
```

#### 3. Add Swagger Documentation

```javascript
/**
 * @swagger
 * /api/new-endpoint:
 *   post:
 *     summary: Description of endpoint
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
```

### Database Schema (Supabase)

#### Key Tables

**users**
- `id` (uuid, primary key)
- `email` (text, unique)
- `user_type` (text: 'professional' | 'hirer')
- `wallet_address` (text)
- `created_at` (timestamp)

**proofs**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `title` (text)
- `description` (text)
- `ipfs_hash` (text)
- `blockchain_tx` (text)
- `status` (text)
- `created_at` (timestamp)

**requests**
- `id` (uuid, primary key)
- `hirer_id` (uuid, foreign key)
- `professional_id` (uuid, foreign key)
- `description` (text)
- `status` (text)
- `payment_tx` (text)
- `created_at` (timestamp)

**messages**
- `id` (uuid, primary key)
- `sender_id` (uuid, foreign key)
- `receiver_id` (uuid, foreign key)
- `content` (text)
- `read` (boolean)
- `created_at` (timestamp)

### Testing

#### Run Backend Tests

```bash
cd backend
npm test
```

#### Run Frontend Tests

```bash
cd frontend
npm test
```

---

## 🚢 Deployment

### Frontend Deployment (Vercel)

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com/)
   - Import your GitHub repository
   - Select the `frontend` directory as root

2. **Configure Environment Variables**
   - Add all `NEXT_PUBLIC_*` variables from `.env.local`

3. **Deploy**
   - Vercel will automatically build and deploy
   - Custom domain: Configure in Vercel dashboard

### Backend Deployment (Railway/Render/Heroku)

#### Using Railway

1. **Create New Project**
   - Go to [Railway](https://railway.app/)
   - Create new project from GitHub repo

2. **Configure Service**
   - Root directory: `backend`
   - Start command: `npm start`
   - Add environment variables

3. **Deploy**
   - Railway will automatically deploy on push

#### Using Render

1. **Create Web Service**
   - Go to [Render](https://render.com/)
   - Create new Web Service

2. **Configure**
   - Build command: `npm install`
   - Start command: `npm start`
   - Root directory: `backend`

3. **Add Environment Variables**
   - Add all variables from `.env.example`

### Extraction API Deployment

Deploy separately as a microservice:

1. **Create New Service**
   - Root directory: `backend/extraction_api`
   - Start command: `npm start`

2. **Update Environment**
   - Set `EXTRACTION_API_URL` in main backend to deployed URL

### Database (Supabase)

Supabase is already cloud-hosted. No additional deployment needed.

### Domain Configuration

1. **Frontend**: Point your domain to Vercel
2. **Backend**: Point API subdomain (api.yourdomain.com) to backend service
3. **Update CORS**: Add production domain to allowed origins

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards

- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

### Pull Request Process

1. Update README.md with details of changes if needed
2. Update the API documentation if you add/modify endpoints
3. Ensure all tests pass
4. Request review from maintainers

---

## 🐛 Troubleshooting

### Common Issues

#### Frontend won't start
```bash
# Clear Next.js cache
rm -rf frontend/.next
cd frontend && npm install
npm run dev
```

#### Backend connection errors
- Check if all environment variables are set
- Verify Supabase credentials
- Ensure ports 3001 and 3002 are not in use

#### Solana wallet connection issues
- Make sure you're on the correct network (devnet/mainnet)
- Check if wallet extension is installed and unlocked
- Verify RPC URL is accessible

#### Payment failures
- Ensure wallet has sufficient balance
- Check if treasury wallet address is correct
- Verify token mint address matches network

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Godwin** - Developer
- **Nie** - Developer
- **Nofiu** - Developer
- **Progress** - Developer
- **Prosper** - Developer
- **Success** - Developer

---

## 📞 Support

- **Website**: [https://ghonsiproof.com](https://ghonsiproof.com)
- **Email**: support@ghonsiproof.com
- **Documentation**: [API Docs](http://localhost:3001/api-docs)

---

## 🙏 Acknowledgments

- [Solana Foundation](https://solana.com/) - Blockchain infrastructure
- [Anchor Framework](https://www.anchor-lang.com/) - Smart contract development
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Anthropic](https://www.anthropic.com/) - Claude AI integration
- [Vercel](https://vercel.com/) - Hosting platform

---

<div align="center">

**Built with ❤️ by the Ghonsi Team**

[⬆ Back to Top](#ghonsi-proof)

</div>
