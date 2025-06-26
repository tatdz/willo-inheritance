# Willo - Digital Inheritance Vault

## Overview

Willo is a digital inheritance platform built for managing cryptocurrency, NFTs, and digital assets through secure blockchain-powered vaults. The application enables users to create inheritance vaults with designated beneficiaries and guardians, ensuring digital assets can be safely transferred after periods of inactivity or death.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints organized by resource type
- **Development**: Hot-reload with Vite integration in development mode

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for production deployment)
- **Schema**: Centralized schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Vault System
- **Core Entity**: Central vault containing all user assets and configurations
- **Security Settings**: Configurable inactivity periods and guardian thresholds
- **Status Management**: Active/inactive vault states with automated monitoring

### Asset Management
- **Multi-Asset Support**: Cryptocurrency, NFTs, DeFi positions, domains, and digital assets
- **Metadata Storage**: JSON-based flexible metadata for different asset types
- **Wallet Integration**: Support for multiple wallet addresses per asset

### Beneficiary & Guardian System
- **Beneficiaries**: Designated recipients with configurable asset allocations
- **Guardians**: Multi-signature approval system for claim verification
- **Threshold Logic**: Configurable number of guardians required for claim approval

### Claims Processing
- **Automated Detection**: System monitors vault inactivity periods
- **Verification Process**: Guardian approval system before asset release
- **Blockchain Transactions**: Simulated Web3 transactions for asset transfers

### Document Storage
- **IPFS Integration**: Decentralized document storage (simulated)
- **Document Types**: Wills, trusts, legal documents, and instructions
- **Access Control**: Beneficiary and guardian access permissions

## Data Flow

1. **User Authentication**: Wallet-based authentication (MetaMask, demo wallet, Reown)
2. **Vault Creation**: Multi-step process with security configuration
3. **Asset Registration**: Users add assets with metadata and ownership proof
4. **Beneficiary Setup**: Designation of inheritors with allocation percentages
5. **Guardian Assignment**: Trusted parties for claim verification
6. **Inactivity Monitoring**: System tracks user activity and vault status
7. **Claim Initiation**: Beneficiaries can claim assets after inactivity periods
8. **Guardian Approval**: Multi-signature verification before asset release
9. **Asset Transfer**: Blockchain transactions to transfer ownership

## External Dependencies

### Blockchain Integration
- **Wagmi/Viem**: Ethereum wallet connection and transaction handling
- **AppKit**: Multi-wallet connection interface
- **Target Network**: Chiliz Chain with fallback network detection

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **React Hook Form**: Form validation with Zod schemas
- **TanStack Query**: Server state management and caching

### Development Tools
- **Replit Integration**: Development environment with Replit-specific plugins
- **TypeScript**: Full type safety across frontend and backend
- **ESLint/Prettier**: Code quality and formatting (implied by file structure)

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite dev server with Express middleware integration
- **Database**: PostgreSQL module in Replit environment
- **Port Configuration**: Port 5000 with external mapping to port 80

### Production Build
- **Frontend**: Vite build outputting to `dist/public`
- **Backend**: ESBuild bundling Node.js server to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Database**: Environment-based DATABASE_URL configuration

### Environment Configuration
- **Replit Modules**: Node.js 20, web server, PostgreSQL 16
- **Environment Variables**: DATABASE_URL for production database connection
- **Build Process**: Automated build step before deployment
- **Scaling**: Configured for autoscale deployment target

## Recent Changes

```
Recent Changes:
- June 26, 2025: Added Willo slogan and enhanced welcome experience
  - Added "Programmable digital inheritance" slogan to header visible on all pages
  - Enhanced dashboard welcome page for users before wallet connection
  - Added feature highlights: Secure Vaults, Real-time Tracking, Easy Management
  - Improved first-time user experience with clear value proposition
  - Users now understand Willo's purpose without needing to connect wallet
  - Pushed updates to both deployed app and GitHub repository
- June 26, 2025: Fixed upgrade button functionality and pushed updates to GitHub
  - Fixed failing Pro and Enterprise subscription upgrade buttons
  - Enhanced wallet connection verification and error handling
  - Added proper blockchain transaction integration with fallback demo mode
  - Created subscription API endpoints in backend for payment processing
  - Fixed TypeScript errors and BigInt compatibility issues
  - Updated database schema to include transaction hash storage
  - Pushed complete fixes to GitHub repository with working upgrade functionality
- June 25, 2025: Successful GitHub repository deployment
  - Successfully uploaded complete Willo dApp to https://github.com/tatdz/willo-inheritance
  - 117 objects and 105 files pushed to main branch using working GitHub token
  - Repository now contains complete production-ready codebase
  - All source code, documentation, and configuration files successfully uploaded
  - Project immediately accessible for cloning and deployment by developers
  - GitHub integration fully functional with proper token authentication
- June 25, 2025: Real-time asset value tracking implementation
  - Created price oracle with CoinGecko API integration
  - Added real-time price tracking hooks (usePrice, usePrices, usePortfolioValue)
  - Implemented live price ticker components with 30-second updates
  - Added portfolio value calculation with 24h change tracking
  - Enhanced dashboard and assets pages with live pricing data
  - Support for CHZ and fan tokens (BAR, PSG, JUV, ACM) real-time pricing
- June 25, 2025: Blockchain integration and dApp completion
  - Created WilloVault.sol smart contract for Chiliz Chain
  - Implemented real blockchain transaction support
  - Added contract integration layer with viem/wagmi
  - Updated subscription system to use on-chain payments
  - Created deployment documentation and requirements assessment
- June 25, 2025: Updated subscription pricing structure
  - Pro plan: Updated from 5 CHZ to 50 CHZ/month
  - Enterprise plan: Updated from 20 CHZ to 150 CHZ/month
  - Fixed Reown wallet configuration for proper WalletConnect integration
- June 24, 2025: Comprehensive vault management system completed
  - Added vault creation, editing, and deletion functionality
  - Implemented asset and beneficiary management with edit/delete capabilities
  - Created centralized "Manage Vaults" page replacing create-vault page
  - Fixed navigation and routing issues
  - Added comprehensive documentation (README.md, CONTRIBUTING.md)
- June 24, 2025: Initial setup and core architecture
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Documentation style: Benchmark Web3 app documentation with comprehensive technical and user guides.
```