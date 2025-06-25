// Web3 utility functions for blockchain interactions

export interface ContractConfig {
  address: string;
  abi: any[];
  rpcUrl: string;
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  fee?: string;
}

export interface AssetPrice {
  symbol: string;
  price: number;
  change24h: number;
}

// Mock contract configuration - in real app this would be loaded from environment
export const CONTRACT_CONFIG: ContractConfig = {
  address: import.meta.env.VITE_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890',
  abi: [], // Contract ABI would be loaded here
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://chiliz-rpc.publicnode.com',
};

// Real blockchain transaction using smart contract
export async function executeTransaction(
  type: 'createVault' | 'addAsset' | 'claimAsset' | 'uploadDocument' | 'purchaseSubscription',
  params?: any
): Promise<TransactionResult> {
  try {
    const { contractClient } = await import('./contract-integration');
    
    let hash: string;
    
    switch (type) {
      case 'createVault':
        const result = await contractClient.createVault(params);
        hash = result.hash;
        break;
        
      case 'addAsset':
        if (params.assetType === 'CHZ') {
          hash = await contractClient.addCHZToVault(params.vaultId, params.amount);
        } else if (params.assetType === 'FAN_TOKEN') {
          hash = await contractClient.addFanTokenToVault({
            vaultId: params.vaultId,
            tokenSymbol: params.tokenSymbol,
            amount: params.amount,
            metadata: params.metadata
          });
        } else {
          throw new Error('Unsupported asset type');
        }
        break;
        
      case 'purchaseSubscription':
        hash = await contractClient.purchaseSubscription(params.plan);
        break;
        
      case 'claimAsset':
        hash = await contractClient.initiateClaim(params.vaultId);
        break;
        
      default:
        throw new Error('Unsupported transaction type');
    }

    return {
      hash,
      status: 'pending',
    };
    
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// Backward compatibility
export async function simulateTransaction(
  type: 'createVault' | 'addAsset' | 'claimAsset' | 'uploadDocument',
  params?: any
): Promise<TransactionResult> {
  // Check if we have a real contract deployed
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  
  if (contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
    // Use real blockchain transaction
    return executeTransaction(type, params);
  } else {
    // Fall back to simulation for development
    return new Promise((resolve) => {
      const mockHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      
      const delay = type === 'createVault' ? 3000 : 
                    type === 'claimAsset' ? 4000 : 2000;
      
      setTimeout(() => {
        resolve({
          hash: mockHash,
          status: 'confirmed',
          gasUsed: Math.floor(Math.random() * 50000 + 21000).toString(),
          fee: (Math.random() * 0.01 + 0.001).toFixed(6) + ' CHZ',
        });
      }, delay);
    });
  }
}

// Simulate gas estimation
export async function estimateGas(
  method: string,
  params?: any
): Promise<{ gasLimit: string; gasPrice: string; estimatedFee: string }> {
  try {
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    
    if (contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
      // Use real gas estimation
      const { contractClient } = await import('./contract-integration');
      return await contractClient.estimateGas(method, params);
    } else {
      // Fall back to mock estimation
      const gasLimit = Math.floor(Math.random() * 100000 + 50000).toString();
      const gasPrice = Math.floor(Math.random() * 20 + 10).toString(); // Gwei
      const estimatedFee = (parseInt(gasLimit) * parseInt(gasPrice) / 1e9).toFixed(6);
      
      return {
        gasLimit,
        gasPrice: gasPrice + ' Gwei',
        estimatedFee: estimatedFee + ' CHZ',
      };
    }
  } catch (error) {
    console.error('Gas estimation failed:', error);
    // Return fallback values
    return {
      gasLimit: '100000',
      gasPrice: '15 Gwei',
      estimatedFee: '0.0015 CHZ',
    };
  }
}

// Mock asset price data
export async function getAssetPrices(symbols: string[]): Promise<AssetPrice[]> {
  const mockPrices: Record<string, AssetPrice> = {
    ETH: { symbol: 'ETH', price: 2500, change24h: 2.5 },
    CHZ: { symbol: 'CHZ', price: 0.125, change24h: -1.2 },
    BTC: { symbol: 'BTC', price: 45000, change24h: 1.8 },
    USDC: { symbol: 'USDC', price: 1.00, change24h: 0.1 },
  };
  
  return symbols.map(symbol => mockPrices[symbol] || {
    symbol,
    price: Math.random() * 1000,
    change24h: (Math.random() - 0.5) * 10,
  });
}

// Validate Ethereum address
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Format address for display
export function formatAddress(address: string, chars: number = 6): string {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

// Convert Wei to Ether
export function weiToEther(wei: string): string {
  const ether = parseInt(wei, 16) / 1e18;
  return ether.toFixed(6);
}

// Convert Ether to Wei
export function etherToWei(ether: string): string {
  const wei = parseFloat(ether) * 1e18;
  return '0x' + wei.toString(16);
}

// Simulate IPFS upload
export async function uploadToIPFS(file: File): Promise<{ hash: string; url: string }> {
  return new Promise((resolve) => {
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    setTimeout(() => {
      resolve({
        hash: mockHash,
        url: `https://ipfs.io/ipfs/${mockHash}`,
      });
    }, 2000);
  });
}

// Network configuration
export const NETWORKS = {
  chiliz: {
    chainId: '0x15B38',
    name: 'Chiliz Chain',
    currency: 'CHZ',
    rpcUrl: 'https://chiliz-rpc.publicnode.com',
    blockExplorer: 'https://chiliscan.com/',
  },
  ethereum: {
    chainId: '0x1',
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
    blockExplorer: 'https://etherscan.io/',
  },
  polygon: {
    chainId: '0x89',
    name: 'Polygon',
    currency: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com/',
  },
};
