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
        // Socios Wallet connection using WalletConnect protocol
        const { createWeb3Modal, defaultWagmiConfig } = await import('@web3modal/wagmi/react');
        const { mainnet, chiliz } = await import('wagmi/chains');
        
        const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';
        
        const metadata = {
          name: 'Willo - Digital Inheritance',
          description: 'Secure digital asset inheritance on Chiliz Chain',
          url: 'https://willo.app',
          icons: ['https://avatars.githubusercontent.com/u/37784886']
        };

        const chains = [chiliz, mainnet] as const;
        const config = defaultWagmiConfig({
          chains,
          projectId,
          metadata,
          enableWalletConnect: true,
          enableInjected: true,
          enableEIP6963: true,
          enableCoinbase: true,
        });

        const modal = createWeb3Modal({
          wagmiConfig: config,
          projectId,
          enableAnalytics: true,
          themeMode: 'light',
          themeVariables: {
            '--w3m-color-mix': '#1E40AF',
            '--w3m-color-mix-strength': 20
          }
        });

        // Wait for Socios wallet connection
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Connection timeout - please try again'));
          }, 30000);

          const checkConnection = () => {
            try {
              const account = config?.state?.connections?.get(
                config?.state?.current || ''
              )?.accounts?.[0];
              
              if (account) {
                clearTimeout(timeout);
                setWallet({
                  isConnected: true,
                  address: account,
                  network: 'Chiliz Chain',
                  balance: '0.0000',
                  isCorrectNetwork: true,
                });
                resolve();
              } else {
                setTimeout(checkConnection, 1000);
              }
            } catch (error) {
              setTimeout(checkConnection, 1000);
            }
          };

          modal.open();
          checkConnection();
        });
          const { contractClient } = await import('@/lib/contract-integration');
          await contractClient.connect(accounts[0] as `0x${string}`);
        } catch (error) {
          console.log('Contract integration not available, using simulation mode');
        }

        // Listen for account changes
        ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            disconnectWallet();
          } else {
            setWallet(prev => ({ ...prev, address: accounts[0] }));
          }
        });

        // Listen for chain changes
        ethereum.on('chainChanged', (chainId: string) => {
          setWallet(prev => ({
            ...prev,
            network: MOCK_NETWORKS[chainId as keyof typeof MOCK_NETWORKS] || 'Unknown Network',
            isCorrectNetwork: chainId === CHILIZ_CHAIN_ID || chainId === CHILIZ_TESTNET_CHAIN_ID,
          }));
        });

      } else if (walletType === 'reown') {
        // Real WalletConnect integration using Reown AppKit
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

          const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
          if (!projectId) {
            throw new Error('WalletConnect Project ID is required. Please set VITE_WALLETCONNECT_PROJECT_ID in your environment variables.');
          }

          // Configure wagmi adapter with proper chain configuration
          const wagmiAdapter = new WagmiAdapter({
            projectId,
            networks: [chilizChain, mainnet, polygon],
            ssr: false
          });

          // Create AppKit with improved metadata
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

          // Set up connection monitoring
          let connectionTimeout: NodeJS.Timeout;
          let checkInterval: NodeJS.Timeout;
          
          const waitForConnection = new Promise<void>((resolve, reject) => {
            connectionTimeout = setTimeout(() => {
              if (checkInterval) clearInterval(checkInterval);
              reject(new Error('Connection timeout after 30 seconds'));
            }, 30000);

            // Monitor connection state changes
            const unsubscribe = modal.subscribeState((state) => {
              if (state.open === false && state.selectedNetworkId) {
                // Modal closed with network selected, likely connected
                clearTimeout(connectionTimeout);
                if (checkInterval) clearInterval(checkInterval);
                
                // Get account from wagmi
                const account = wagmiAdapter.wagmiConfig?.state?.connections?.get(
                  wagmiAdapter.wagmiConfig?.state?.current || ''
                )?.accounts?.[0];
                
                if (account) {
                  setWallet({
                    isConnected: true,
                    address: account,
                    network: state.selectedNetworkId === 88888 ? 'Chiliz Chain' : 'Unknown Network',
                    balance: '0.0000',
                    isCorrectNetwork: state.selectedNetworkId === 88888,
                  });
                  resolve();
                } else {
                  reject(new Error('No account found after connection'));
                }
                unsubscribe();
              }
            });

            // Also check periodically for connection
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

          // Open modal and wait for connection
          modal.open();
          await waitForConnection;

        } catch (error) {
          console.error('Reown connection error:', error);
          throw new Error('Failed to connect via WalletConnect. Please ensure you have the WalletConnect Project ID configured.');
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
        throw new Error('A connection request is already pending. Please check your wallet.');
      }
      
      const message = error?.message || 'Failed to connect wallet. Please try again.';
      throw new Error(message);
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

  const switchNetwork = async () => {
    setIsLoading(true);
    
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        try {
          // Try to switch to Chiliz mainnet first
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CHILIZ_CHAIN_ID }],
          });
        } catch (switchError: any) {
          // If network doesn't exist, add Chiliz mainnet
          if (switchError.code === 4902) {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: CHILIZ_CHAIN_ID,
                chainName: 'Chiliz Chain',
                nativeCurrency: {
                  name: 'Chiliz',
                  symbol: 'CHZ',
                  decimals: 18,
                },
                rpcUrls: ['https://chiliz-rpc.publicnode.com'],
                blockExplorerUrls: ['https://scan.chiliz.com/'],
              }],
            });
          } else {
            // If mainnet switch failed for other reasons, try testnet
            try {
              await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: CHILIZ_TESTNET_CHAIN_ID }],
              });
            } catch (testnetError: any) {
              if (testnetError.code === 4902) {
                await ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: CHILIZ_TESTNET_CHAIN_ID,
                    chainName: 'Chiliz Testnet',
                    nativeCurrency: {
                      name: 'Chiliz',
                      symbol: 'CHZ',
                      decimals: 18,
                    },
                    rpcUrls: ['https://spicy-rpc.chiliz.com/'],
                    blockExplorerUrls: ['https://testnet.chiliscan.com/'],
                  }],
                });
              }
            }
          }
        }
        
        // Update wallet state
        const balance = await ethereum.request({
          method: 'eth_getBalance',
          params: [wallet.address, 'latest']
        });
        
        setWallet(prev => ({
          ...prev,
          network: 'Chiliz Chain',
          balance: (parseInt(balance, 16) / 1e18).toFixed(4),
          isCorrectNetwork: true,
        }));
      } else {
        // Mock network switch for non-MetaMask environments
        setWallet(prev => ({
          ...prev,
          network: 'Chiliz Chain',
          isCorrectNetwork: true,
        }));
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
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

// Extend window type for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}