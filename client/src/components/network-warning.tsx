import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function NetworkWarning() {
  const { wallet, switchNetwork } = useWallet();
  const { toast } = useToast();
  const [switching, setSwitching] = useState(false);

  if (!wallet.isConnected || wallet.isCorrectNetwork) {
    return null;
  }

  const handleSwitchNetwork = async () => {
    setSwitching(true);
    try {
      await switchNetwork();
      toast({
        title: "Network Switched",
        description: "Successfully switched to Chiliz Chain",
      });
    } catch (error) {
      toast({
        title: "Switch Failed",
        description: "Failed to switch network. Please try manually.",
        variant: "destructive",
      });
    } finally {
      setSwitching(false);
    }
  };

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-500" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-orange-800">Wrong Network Detected</h4>
          <p className="text-sm text-orange-700 mt-1">
            Please switch to Chiliz Chain to use this application.
          </p>
        </div>
        <Button 
          onClick={handleSwitchNetwork}
          disabled={switching}
          className="bg-orange-500 hover:bg-orange-600 text-white ml-4"
        >
          {switching ? 'Switching...' : 'Switch Network'}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
