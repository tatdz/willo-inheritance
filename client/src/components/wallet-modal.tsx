import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectWallet, isLoading } = useWallet();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<'socios' | 'demo' | 'reown' | null>(null);

  const handleConnect = async (walletType: 'socios' | 'demo' | 'reown') => {
    setConnecting(walletType);
    try {
      await connectWallet(walletType);
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${walletType === 'socios' ? 'Socios Wallet' : walletType === 'demo' ? 'Demo Wallet' : 'Reown Wallet'}`,
      });
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to connect wallet. Please try again.';
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Connect Wallet</DialogTitle>
          <DialogDescription className="text-center">
            Choose your preferred wallet to connect to Willo
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-sm text-gray-600 mb-4">
            Choose your wallet to connect to the Chiliz network.
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              Connect with Socios wallet to access your fan tokens and CHZ balance.
            </p>
          </div>
          <Button
            onClick={() => handleConnect('socios')}
            disabled={isLoading}
            className="w-full flex items-center justify-start p-4 h-auto border border-gray-200 hover:border-primary hover:bg-blue-50 text-gray-900 bg-white"
            variant="outline"
          >
            {connecting === 'socios' ? (
              <Loader2 className="h-6 w-6 mr-4 animate-spin" />
            ) : (
              <div className="w-6 h-6 mr-4 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
            )}
            <div className="text-left">
              <div className="font-medium">Socios Wallet</div>
              <div className="text-sm text-gray-500">
                Connect using Socios mobile app
              </div>
            </div>
          </Button>
          
          <Button
            onClick={() => handleConnect('reown')}
            disabled={isLoading}
            className="w-full flex items-center justify-start p-4 h-auto border border-gray-200 hover:border-primary hover:bg-blue-50 text-gray-900 bg-white"
            variant="outline"
          >
            {connecting === 'reown' ? (
              <Loader2 className="h-6 w-6 mr-4 animate-spin" />
            ) : (
              <div className="w-6 h-6 mr-4 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">R</span>
              </div>
            )}
            <div className="text-left">
              <div className="font-medium">Reown Wallet</div>
              <div className="text-sm text-gray-500">Connect using WalletConnect protocol</div>
            </div>
          </Button>

          <Button
            onClick={() => handleConnect('demo')}
            disabled={isLoading}
            className="w-full flex items-center justify-start p-4 h-auto border border-gray-200 hover:border-primary hover:bg-blue-50 text-gray-900 bg-white"
            variant="outline"
          >
            {connecting === 'demo' ? (
              <Loader2 className="h-6 w-6 mr-4 animate-spin" />
            ) : (
              <div className="w-6 h-6 mr-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">D</span>
              </div>
            )}
            <div className="text-left">
              <div className="font-medium">Demo Wallet</div>
              <div className="text-sm text-gray-500">Try the app with simulated data</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
