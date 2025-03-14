# Avail Explorer

Live demo: https://avail-explorer.vercel.app

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: TailwindCSS with shadcn/ui components
- **State Management**: Zustand
- **Blockchain Integration**: Polkadot.js API, SubWallet Connect, Avail SDK
- **Data Fetching**: TanStack Query (React Query)
- **API Communication**: GraphQL with graphql-request

## Prerequisites

- Node.js 18.x or later
- npm
- Avail-compatible wallet (SubWallet, Polkadot.js, etc.)
- Access to Avail Turing Testnet RPC

## Installation

1. Clone the repository:

```bash
git clone https://github.com/deeksharungta/avail-explorer.git
cd avail-explorer
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory with the following variables:

```
NEXT_PUBLIC_APP_ID=your-avail-app-id
NEXT_PUBLIC_AVAIL_TURING_RPC_HTTP=avail-rpc-http-endpoint
NEXT_PUBLIC_AVAIL_TURING_RPC_WS=avail-rpc-ws-endpoint
NEXT_PUBLIC_AVAIL_INDEXER_ENDPOINT=avail-indexer-endpoint
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/             # API routes
│   ├── explorer/        # Explorer pages
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── action/          # Action-related components
│   ├── explorer/        # Explorer-related components
│   ├── layout/          # Layout components
│   ├── transaction/     # Transaction components
│   ├── ui/              # UI components (shadcn/ui)
│   └── wallet/          # Wallet components
├── hooks/               # Custom React hooks
│   ├── account/         # Account-related hooks
│   ├── stats/           # Statistics hooks
│   └── transactions/    # Transaction hooks
├── lib/                 # Utility functions and services
│   ├── api/             # API helper functions
│   ├── config/          # Configuration files
│   ├── services/        # Service utilities (GraphQL, actions)
│   ├── utils.ts         # General utility functions
│   ├── validators/      # Form validators
│   └── wallet/          # Wallet utilities
├── stores/              # Zustand store definitions
└── types/               # TypeScript type definitions
```

## Usage

### Connecting to a Wallet

1. Click on the "Connect Wallet" button in the top-right corner
2. Select your Substrate-compatible wallet
3. Approve the connection request in your wallet extension

### Transferring AVAIL Tokens

1. Ensure your wallet is connected
2. On the Actions page, select "Transfer" from the dropdown
3. Enter the recipient's address and the amount to transfer
4. Click "Submit" and confirm the transaction in your wallet

### Submitting Data to Avail

1. Ensure your wallet is connected
2. On the Actions page, select "Data Submission" from the dropdown
3. Enter the data you want to submit
4. Click "Submit" and confirm the transaction in your wallet

### Viewing Transaction History

The "Recent Actions" section on the main page shows your transaction history, including status, type, and timestamp.
