import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'pending' | 'confirmed' | 'failed';
  message: string;
  transactionHash?: string;
  onRetry?: () => void;
}

export function TransactionModal({ 
  isOpen, 
  onClose, 
  status, 
  message, 
  transactionHash,
  onRetry 
}: TransactionModalProps) {
  const getIcon = () => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-16 w-16 text-primary animate-spin" />;
      case 'confirmed':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'pending':
        return 'Processing Transaction';
      case 'confirmed':
        return 'Transaction Confirmed';
      case 'failed':
        return 'Transaction Failed';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={status !== 'pending' ? onClose : undefined}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {getTitle()}
          </h3>
          <p className="text-gray-600 mb-4">{message}</p>
          
          {transactionHash && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-600 mb-1">Transaction Hash:</div>
              <div className="font-mono text-xs text-gray-800 break-all">
                {transactionHash}
              </div>
            </div>
          )}
          
          {status === 'pending' && (
            <p className="text-sm text-gray-500">
              This may take a few moments. Please do not close this window.
            </p>
          )}
          
          {status === 'confirmed' && (
            <Button onClick={onClose} className="mt-4">
              Continue
            </Button>
          )}
          
          {status === 'failed' && (
            <div className="flex space-x-3 mt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {onRetry && (
                <Button onClick={onRetry}>
                  Retry
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
