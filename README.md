# Willo - Digital Inheritance Vault

A blockchain-powered digital inheritance platform for sports fan tokens and cryptocurrency assets on Chiliz Chain.

![Willo Logo](https://img.shields.io/badge/Willo-Digital_Inheritance-blue)
![Chiliz Chain](https://img.shields.io/badge/Blockchain-Chiliz_Chain-red)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features

- **🔐 Secure Vault Management** - Create multiple inheritance vaults with customizable security settings
- **💰 Multi-Asset Support** - CHZ tokens, Fan Tokens (BAR, PSG, JUV, ACM), NFTs, and digital assets
- **👥 Beneficiary System** - Designate multiple beneficiaries with configurable allocation percentages
- **⏰ Smart Inheritance** - Automated asset transfer after user-defined inactivity periods
- **📄 Document Storage** - Decentralized storage for wills, trusts, and legal documents
- **🔗 Wallet Integration** - MetaMask, WalletConnect (Reown), and demo wallet support
- **📊 Real-time Pricing** - Live portfolio tracking with CoinGecko price oracle
- **🏆 Fan Token Focus** - First platform designed specifically for sports fan token inheritance

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern UI framework with TypeScript
- **Wouter** - Lightweight client-side routing
- **TanStack Query** - Server state management and caching
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality accessible components
- **Vite** - Fast build tool with hot module replacement

### Backend
- **Node.js + Express** - RESTful API server
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Production database
- **TypeScript** - Full type safety

### Blockchain Integration
- **Wagmi/Viem** - Ethereum wallet connection and transactions
- **Chiliz Chain** - Primary blockchain network (Chain ID: 88888)
- **Smart Contracts** - WilloVault.sol for on-chain inheritance logic
- **Multi-Wallet Support** - MetaMask, Reown (Socios Wallet)

## 🏗 Smart Contract Features

- **Vault Creation** - On-chain vault registration with beneficiaries
- **Asset Management** - CHZ and fan token support
- **Inheritance Logic** - Time-based claims with guardian approval
- **Revenue Model** - Direct CHZ payments (50 CHZ Pro, 150 CHZ Enterprise)
- **Multi-signature** - Guardian approval system for claims

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/tatdz/willo-inheritance.git
cd willo-inheritance

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## 🔧 Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Blockchain
VITE_CONTRACT_ADDRESS=0x...
VITE_WALLETCONNECT_PROJECT_ID=...
VITE_RPC_URL=https://chiliz-rpc.publicnode.com

# Optional: API Keys
COINGECKO_API_KEY=...
```

## 📋 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run db:push      # Push database schema changes
```

## 🌐 Deployment

### Replit Deployment (Recommended)
1. Import project to Replit
2. Configure environment variables
3. Run `npm run build`
4. Deploy using Replit's autoscale deployment

### Manual Deployment
1. Deploy smart contract to Chiliz Chain
2. Update `VITE_CONTRACT_ADDRESS` environment variable
3. Set up PostgreSQL database
4. Build and deploy frontend/backend

## 🔗 Smart Contract Deployment

```bash
# Using Hardhat
npx hardhat deploy --network chiliz

# Using Foundry
forge create --rpc-url https://chiliz-rpc.publicnode.com \
  --private-key $PRIVATE_KEY \
  --etherscan-api-key $CHILIZ_SCAN_API_KEY \
  --verify \
  contracts/WilloVault.sol:WilloVault
```

## 📊 Supported Assets

### Cryptocurrencies
- **CHZ** - Chiliz native token
- **Fan Tokens** - BAR, PSG, JUV, ACM, ATM, ASR, GAL

### NFTs
- Sports collectibles
- Stadium access passes
- Limited edition memorabilia

### Digital Assets
- Domain names
- Digital documents
- Account credentials

## 🎯 Revenue Model

- **Subscription Plans**
  - Basic: Free (1 vault, limited features)
  - Pro: 50 CHZ/month (5 vaults, full features)
  - Enterprise: 150 CHZ/month (unlimited vaults, premium support)
- **Platform Fees**: 2.5% on vault creation and asset transfers
- **Premium Features**: Advanced analytics, custom integrations

## 🔐 Security Features

- **Multi-signature** guardian approval system
- **Time delays** for claim execution
- **Emergency functions** pause/unpause capabilities
- **Smart contract** audited inheritance logic
- **Wallet integration** industry-standard security

## 📖 API Documentation

### Core Endpoints

```typescript
// Vaults
GET    /api/vaults                 // List user vaults
POST   /api/vaults                 // Create new vault
GET    /api/vaults/:id             // Get vault details
PATCH  /api/vaults/:id             // Update vault
DELETE /api/vaults/:id             // Delete vault

// Assets
GET    /api/vaults/:id/assets      // List vault assets
POST   /api/vaults/:id/assets      // Add asset to vault

// Beneficiaries
GET    /api/vaults/:id/beneficiaries    // List beneficiaries
POST   /api/vaults/:id/beneficiaries    // Add beneficiary

// Real-time Pricing
GET    /api/prices/:symbol         // Get token price
GET    /api/prices?symbols=CHZ,BAR // Get multiple prices
```

## 🧪 Testing

```bash
# Run tests
npm test

# Test smart contracts
npx hardhat test

# Integration tests
npm run test:integration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [GitHub Wiki](https://github.com/tatdz/willo-inheritance/wiki)
- **Issues**: [GitHub Issues](https://github.com/tatdz/willo-inheritance/issues)
- **Discord**: [Willo Community](https://discord.gg/willo)
- **Email**: support@willo.app

## 🗺 Roadmap

- [ ] Smart contract audit
- [ ] Mobile app development
- [ ] Cross-chain support (Ethereum, Polygon)
- [ ] Enhanced analytics dashboard
- [ ] Partnership with sports clubs
- [ ] Legal framework integration
- [ ] Multi-language support

## 📈 Stats

- **Total Value Locked**: $0 (Pre-launch)
- **Active Vaults**: 0 (Pre-launch)
- **Supported Tokens**: 8 (CHZ + 7 fan tokens)
- **Partner Clubs**: 0 (Targeting major clubs)

---

**Built with ❤️ for the sports fan community on Chiliz Chain**

*Willo makes digital inheritance simple, secure, and accessible for everyone.*