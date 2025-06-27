import { useState, useEffect, createContext, useContext, ReactNode } from "react";

export interface WalletState {
  isConnected: boolean;
  address: string;
  network: string;
  balance: string;
  isCorrectNetwork: boolean;
}

interface WalletContextType {
  wallet: WalletState;
  connectWallet: (walletType: 'socios' | 'demo' | 'reown') => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const CHILIZ_CHAIN_ID = '0x15B38'; // Chiliz mainnet chain ID
const CHILIZ_TESTNET_CHAIN_ID = '0x1500B'; // Chiliz testnet chain ID
const MOCK_NETWORKS = {
  '0x1': 'Ethereum Mainnet',
  '0x15B38': 'Chiliz Chain',
  '0x1500B': 'Chiliz Testnet',
  '0x5': 'Goerli Testnet',
  '0x89': 'Polygon',
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: '',
    network: '',
    balance: '0',
    isCorrectNetwork: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check if wallet is already connected on page load
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const ethereum = (window as any).ethereum;
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          const chainId = await ethereum.request({ method: 'eth_chainId' });
          const balance = await ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          });
          
          setWallet({
            isConnected: true,
            address: accounts[0],
            network: MOCK_NETWORKS[chainId as keyof typeof MOCK_NETWORKS] || 'Unknown Network',
            balance: (parseInt(balance, 16) / 1e18).toFixed(4),
            isCorrectNetwork: chainId === CHILIZ_CHAIN_ID || chainId === CHILIZ_TESTNET_CHAIN_ID,
          });
        }
      } catch (error) {
        console.log('No existing wallet connection found:', error);
      }
    }
  };

  const connectWallet = async (walletType: 'socios' | 'demo' | 'reown'): Promise<void> => {
    setIsLoading(true);
    
    try {
      if (walletType === 'socios') {
        // Socios wallet connection using the existing Reown implementation 
        // but targeted specifically for Socios wallet via WalletConnect
        try {
          const { createAppKit, wagmiAdapter } = await import('@reown/appkit/react');
          const { chiliz, mainnet } = await import('wagmi/chains');

          const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

          const networks = [chiliz, mainnet];
          const wagmiConfig = wagmiAdapter.wagmiConfig;

          const modal = createAppKit({
            adapters: [wagmiAdapter],
            networks,
            metadata: {
              name: 'Willo - Socios Wallet Integration',
              description: 'Connect your Socios wallet to access fan tokens and CHZ for digital inheritance',
              url: 'https://willo.app',
              icons: ['https://avatars.githubusercontent.com/u/37784886']
            },
            projectId,
            features: {
              analytics: true,
            },
          });

          const waitForConnection = new Promise<void>((resolve, reject) => {
            const connectionTimeout = setTimeout(() => {
              reject(new Error('Connection timeout. Please open your Socios app and scan the QR code.'));
            }, 45000);

            let checkInterval: NodeJS.Timeout;
            const unsubscribe = modal.subscribeState((state) => {
              if (state.open === false && wagmiConfig?.state?.current) {
                clearTimeout(connectionTimeout);
                clearInterval(checkInterval);
                resolve();
                unsubscribe();
              }
            });

            checkInterval = setInterval(() => {
              try {
                const config = wagmiAdapter.wagmiConfig;
                const account = config?.state?.connections?.get(
                  config?.state?.current || ''
                )?.accounts?.[0];
                
                if (account) {
                  clearTimeout(connectionTimeout);
                  clearInterval(checkInterval);
                  setWallet({
                    isConnected: true,
                    address: account,
                    network: 'Chiliz Chain',
                    balance: '0.0000',
                    isCorrectNetwork: true,
                  });
                  resolve();
                  unsubscribe();
                }
              } catch (error) {
                // Continue checking
              }
            }, 2000);
          });

          modal.open();
          await waitForConnection;

        } catch (error) {
          console.error('Socios wallet connection error:', error);
          throw new Error('Failed to connect Socios wallet. Please ensure you have the Socios app installed and try scanning the QR code.');
        }

      } else if (walletType === 'reown') {
        // Reown WalletConnect integration
        try {
          const { createAppKit } = await import('@reown/appkit');
          const { WagmiAdapter } = await import('@reown/appkit-adapter-wagmi');
          const { mainnet, polygon } = await import('viem/chains');
          
          // Define Chiliz chain
          const chilizChain = {
            id: 88888,
            name: 'Chiliz Chain',
            nativeCurrency: {
              decimals: 18,
              name: 'Chiliz',
              symbol: 'CHZ',
            },
            rpcUrls: {
              default: { http: ['https://chiliz-rpc.publicnode.com'] },
              public: { http: ['https://chiliz-rpc.publicnode.com'] },
            },
            blockExplorers: {
              default: { name: 'ChilizScan', url: 'https://scan.chiliz.com' },
            },
            testnet: false,
          } as const;

          const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

          // Configure wagmi adapter
          const wagmiAdapter = new WagmiAdapter({
            projectId,
            networks: [chilizChain, mainnet, polygon],
            ssr: false
          });

          // Create AppKit
          const modal = createAppKit({
            adapters: [wagmiAdapter],
            networks: [chilizChain, mainnet, polygon],
            projectId,
            metadata: {
              name: 'Willo - Digital Inheritance Vault',
              description: 'Secure digital inheritance platform for cryptocurrency and digital assets',
              url: typeof window !== 'undefined' ? window.location.origin : 'https://willo.app',
              icons: [
                typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : 'https://willo.app/favicon.ico'
              ]
            },
            features: {
              analytics: true,
              email: false,
              socials: [],
              emailShowWallets: true
            }
          });

          // Wait for connection
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Connection timeout after 30 seconds'));
            }, 30000);

            const unsubscribe = modal.subscribeState((state) => {
              if (state.open === false && state.selectedNetworkId) {
                const account = wagmiAdapter.wagmiConfig?.state?.connections?.get(
                  wagmiAdapter.wagmiConfig?.state?.current || ''
                )?.accounts?.[0];
                
                if (account) {
                  clearTimeout(timeout);
                  setWallet({
                    isConnected: true,
                    address: account,
                    network: state.selectedNetworkId === 88888 ? 'Chiliz Chain' : 'Unknown Network',
                    balance: '0.0000',
                    isCorrectNetwork: state.selectedNetworkId === 88888,
                  });
                  resolve();
                  unsubscribe();
                }
              }
            });

            modal.open();
          });

        } catch (error) {
          console.error('Reown connection error:', error);
          throw new Error('Failed to connect via WalletConnect. Please try again.');
        }

      } else if (walletType === 'demo') {
        // Demo wallet connection - simulates realistic CHZ wallet with fan tokens and NFTs
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setWallet({
          isConnected: true,
          address: '0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e',
          network: 'Chiliz Chain',
          balance: '12,500.0000',
          isCorrectNetwork: true,
        });
        
        // Log simulated portfolio for demo purposes
        console.log('🚀 Demo Wallet Connected - Simulated Portfolio:');
        console.log('💰 CHZ Balance: 12,500 CHZ ($8,750)');
        console.log('🏆 Fan Tokens:');
        console.log('  - FC Barcelona (BAR): 150 tokens');
        console.log('  - Paris Saint-Germain (PSG): 200 tokens'); 
        console.log('  - Juventus (JUV): 100 tokens');
        console.log('  - AC Milan (ACM): 75 tokens');
        console.log('🎨 NFT Collections:');
        console.log('  - 3 Rare Sports Trading Cards');
        console.log('  - 2 VIP Stadium Access Passes');
        console.log('  - 1 Limited Edition Team Jersey NFT');
      } else {
        throw new Error('Unknown wallet type');
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      
      // Handle specific error codes
      if (error.code === 4001) {
        throw new Error('Connection rejected. Please approve the connection request in your wallet.');
      } else if (error.code === -32002) {
        throw new Error('Connection request already pending. Please check your wallet app.');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Connection timeout. Please try again.');
      } else {
        throw new Error(error.message || 'Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: '',
      network: '',
      balance: '0',
      isCorrectNetwork: false,
    });
  };

  const switchNetwork = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CHILIZ_CHAIN_ID }],
        });
        
        setWallet(prev => ({ ...prev, isCorrectNetwork: true, network: 'Chiliz Chain' }));
      }
    } catch (error: any) {
      // If the chain hasn't been added to the user's wallet, add it
      if (error.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: CHILIZ_CHAIN_ID,
              chainName: 'Chiliz Chain',
              nativeCurrency: {
                name: 'Chiliz',
                symbol: 'CHZ',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.chiliz.com'],
              blockExplorerUrls: ['https://scan.chiliz.com/'],
            }],
          });
          setWallet(prev => ({ ...prev, isCorrectNetwork: true, network: 'Chiliz Chain' }));
        } catch (addError) {
          throw new Error('Failed to add Chiliz network to wallet');
        }
      } else {
        throw new Error('Failed to switch network');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WalletContext.Provider value={{
      wallet,
      connectWallet,
      disconnectWallet,
      switchNetwork,
      isLoading,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Extend window interface for ethereum object
declare global {
  interface Window {
    ethereum?: any;
  }
}