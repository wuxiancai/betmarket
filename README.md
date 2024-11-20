# BetMarket - Blockchain Betting Platform

A modern, decentralized betting platform built with Next.js, Web3, and smart contracts.

## Features

- MetaMask wallet integration
- Real-time blockchain data display
- Multi-tag betting system
- Automatic fund distribution via smart contracts
- Real-time block height and hash display
- Predicted next block time
- Live bet amount tracking per tag

## Tech Stack

- Frontend: Next.js, Chakra UI, TypeScript
- Blockchain: Web3.js, Ethers.js
- Smart Contracts: Solidity
- Styling: Emotion

## Prerequisites

- Node.js (v16 or higher)
- MetaMask wallet extension
- Yarn or npm package manager

## Deployment Instructions

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/betmarket.git
cd betmarket
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Start the development server:
```bash
yarn dev
# or
npm run dev
```

4. Open http://localhost:3000 in your browser

### Production Deployment

1. Build the application:
```bash
yarn build
# or
npm run build
```

2. Start the production server:
```bash
yarn start
# or
npm start
```

### Smart Contract Deployment

1. Install Hardhat (if not already installed):
```bash
npm install --save-dev hardhat
```

2. Configure your `.env` file with:
```
PRIVATE_KEY=your_private_key
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

3. Deploy the smart contract:
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

4. Update the contract address in your frontend configuration.

### Environment Variables

Create a `.env.local` file in the root directory with:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_INFURA_ID=your_infura_id
```

### Cloud Deployment (e.g., Vercel)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy with automatic CI/CD

## Security Considerations

- Never commit `.env` files or private keys
- Use environment variables for sensitive data
- Implement proper error handling for MetaMask transactions
- Follow smart contract security best practices

## Maintenance

- Regularly update dependencies
- Monitor smart contract gas usage
- Keep track of MetaMask and Web3 API changes
- Backup deployment keys and environment variables securely

## Support

For issues and feature requests, please create an issue in the GitHub repository.
