import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { chiliz, mainnet } from 'wagmi/chains';

export interface WalletState {
  isConnected: boolean;
  address: string;
  network: string;
  balance: string;
  isCorrectNetwork: boolean;
}

interface WalletContextType {
  wallet: WalletState;
  connectWallet: (walletType: 'metamask' | 'demo' | 'reown') => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const CHILIZ_CHAIN_ID = '0x15b38'; // 88888 in hex

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: '',
    network: '',
    balance: '0.00',
    isCorrectNetwork: false
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize WalletConnect for Reown wallet option
  const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';
  const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks: [chiliz, mainnet],
    ssr: false
  });

  let appKit: any = null;

  const initializeAppKit = async () => {
    if (!appKit) {
      appKit = createAppKit({
        adapters: [wagmiAdapter],
        networks: [chiliz, mainnet],
        projectId,
        metadata: {
          name: 'Willo - Digital Inheritance Vault',
          description: 'Secure digital inheritance platform for cryptocurrency and digital assets',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://willo.app',
          icons: [
            typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : 'https://willo.app/favicon.ico'
          ]
        }
      });
    }
    return appKit;
  };

  const connectWallet = async (walletType: 'metamask' | 'demo' | 'reown') => {
    setIsLoading(true);
    try {
      if (walletType === 'demo') {
        // Demo wallet connection
        setWallet({
          isConnected: true,
          address: '0x1234567890123456789012345678901234567890',
          network: 'Chiliz Chain',
          balance: '1,250.50',
          isCorrectNetwork: true
        });
        localStorage.setItem('walletType', 'demo');
        return;
      }

      if (walletType === 'metamask') {
        // MetaMask connection
        if (typeof window === 'undefined' || !window.ethereum) {
          throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
        }

        try {
          // Request account access
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          
          if (accounts.length === 0) {
            throw new Error('No accounts found. Please unlock MetaMask.');
          }

          const address = accounts[0];
          
          // Get network info
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const isChilizChain = chainId === CHILIZ_CHAIN_ID;
          
          // Get balance
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
          });
          
          const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
          
          setWallet({
            isConnected: true,
            address,
            network: isChilizChain ? 'Chiliz Chain' : 'Unknown Network',
            balance: balanceInEth.toFixed(4),
            isCorrectNetwork: isChilizChain
          });
          
          localStorage.setItem('walletType', 'metamask');
          
          // If not on Chiliz Chain, try to switch
          if (!isChilizChain) {
            await switchNetwork();
          }
          
          return;
        } catch (error: any) {
          console.error('MetaMask connection failed:', error);
          if (error.code === 4001) {
            throw new Error('Connection rejected. Please approve the connection request.');
          }
          throw new Error('Failed to connect to MetaMask. Please try again.');
        }
      }

      if (walletType === 'reown') {
        // WalletConnect connection
        try {
          const modal = await initializeAppKit();
          modal.open();
          
          // Wait for connection to establish
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Connection timeout. Please try again.'));
            }, 30000);

            const checkConnection = setInterval(() => {
              const config = wagmiAdapter.wagmiConfig;
              const account = config?.state?.current;
              
              if (account && config?.state?.connections?.get(account)?.accounts?.[0]) {
                clearTimeout(timeout);
                clearInterval(checkConnection);
                
                const address = config.state.connections.get(account).accounts[0];
                const chainId = config.state.connections.get(account).chainId;
                
                setWallet({
                  isConnected: true,
                  address,
                  network: chainId === 88888 ? 'Chiliz Chain' : 'Unknown',
                  balance: '0.00',
                  isCorrectNetwork: chainId === 88888
                });
                
                localStorage.setItem('walletType', 'reown');
                resolve(true);
              }
            }, 1000);
          });
          
          return;
        } catch (error) {
          console.error('WalletConnect connection failed:', error);
          throw new Error('Failed to connect via WalletConnect. Please try again.');
        }
      }

      throw new Error('Wallet connection failed');
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const switchNetwork = async () => {
    try {
      const walletType = localStorage.getItem('walletType');
      
      if (walletType === 'demo') {
        // Demo wallet is always on correct network
        setWallet(prev => ({ ...prev, isCorrectNetwork: true, network: 'Chiliz Chain' }));
        return;
      }

      if (walletType === 'metamask') {
        // MetaMask network switching
        if (!window.ethereum) {
          throw new Error('MetaMask is not available');
        }

        try {
          // Try to switch to Chiliz Chain
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CHILIZ_CHAIN_ID }],
          });
          
          setWallet(prev => ({ ...prev, isCorrectNetwork: true, network: 'Chiliz Chain' }));
        } catch (switchError: any) {
          // If chain doesn't exist, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: CHILIZ_CHAIN_ID,
                  chainName: 'Chiliz Chain',
                  nativeCurrency: {
                    name: 'CHZ',
                    symbol: 'CHZ',
                    decimals: 18,
                  },
                  rpcUrls: ['https://rpc.chiliz.com'],
                  blockExplorerUrls: ['https://scan.chiliz.com'],
                }],
              });
              
              setWallet(prev => ({ ...prev, isCorrectNetwork: true, network: 'Chiliz Chain' }));
            } catch (addError) {
              console.error('Failed to add Chiliz Chain:', addError);
              throw new Error('Failed to add Chiliz Chain to MetaMask');
            }
          } else {
            throw new Error('Failed to switch to Chiliz Chain');
          }
        }
        return;
      }

      if (walletType === 'reown') {
        // For WalletConnect wallets, we can't programmatically switch networks
        throw new Error('Please switch to Chiliz Chain manually in your wallet.');
      }

      throw new Error('Network switching not supported for this wallet type');
    } catch (error) {
      console.error('Network switch error:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: '',
      network: '',
      balance: '0.00',
      isCorrectNetwork: false
    });
    localStorage.removeItem('walletType');
    
    // Disconnect from WalletConnect if connected
    const walletType = localStorage.getItem('walletType');
    if (walletType === 'reown' && appKit) {
      appKit.disconnect();
    }
  };

  useEffect(() => {
    // Try to restore wallet connection on page load
    const walletType = localStorage.getItem('walletType');
    if (walletType === 'demo') {
      setWallet({
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
        network: 'Chiliz Chain',
        balance: '1,250.50',
        isCorrectNetwork: true
      });
    } else if (walletType === 'metamask') {
      // Check if MetaMask is still connected
      if (window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts.length > 0) {
              connectWallet('metamask').catch(console.error);
            }
          })
          .catch(console.error);
      }
    } else if (walletType === 'reown') {
      // Check if WalletConnect is still connected
      initializeAppKit().then(() => {
        const config = wagmiAdapter.wagmiConfig;
        const account = config?.state?.current;
        
        if (account && config?.state?.connections?.get(account)?.accounts?.[0]) {
          const address = config.state.connections.get(account).accounts[0];
          const chainId = config.state.connections.get(account).chainId;
          
          setWallet({
            isConnected: true,
            address,
            network: chainId === 88888 ? 'Chiliz Chain' : 'Unknown',
            balance: '0.00',
            isCorrectNetwork: chainId === 88888
          });
        }
      });
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    const walletType = localStorage.getItem('walletType');
    
    if (walletType === 'metamask' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== wallet.address) {
          connectWallet('metamask').catch(console.error);
        }
      };

      const handleChainChanged = (chainId: string) => {
        const isChilizChain = chainId === CHILIZ_CHAIN_ID;
        setWallet(prev => ({
          ...prev,
          network: isChilizChain ? 'Chiliz Chain' : 'Unknown Network',
          isCorrectNetwork: isChilizChain
        }));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [wallet.isConnected, wallet.address]);

  return (
    <WalletContext.Provider value={{
      wallet,
      connectWallet,
      disconnectWallet,
      switchNetwork,
      isLoading
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

// Extend window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}