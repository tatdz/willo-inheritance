import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { TransactionModal } from "@/components/transaction-modal";
import { simulateTransaction } from "@/lib/web3-utils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Gift, 
  CheckCircle, 
  Clock, 
  Download,
  AlertCircle,
  Info,
  Bitcoin,
  Image as ImageIcon,
  Coins
} from "lucide-react";
import type { Claim } from "@shared/schema";

interface ClaimWithDetails extends Claim {
  vaultName: string;
  ownerName: string;
  assets: {
    type: string;
    name: string;
    amount: string;
    usdValue: string;
  }[];
}

export default function Claims() {
  const [transactionModal, setTransactionModal] = useState<{
    isOpen: boolean;
    status: 'pending' | 'confirmed' | 'failed';
    message: string;
    hash?: string;
  }>({ isOpen: false, status: 'pending', message: '' });

  const { wallet } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch claims data from API
  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['/api/claims', wallet.address],
    queryFn: async (): Promise<ClaimWithDetails[]> => {
      if (!wallet.isConnected) return [];
      
      const response = await fetch(`/api/claims?beneficiaryAddress=${wallet.address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch claims');
      }
      
      return response.json();
    },
    enabled: wallet.isConnected,
  });

  const claimAssetsMutation = useMutation({
    mutationFn: async (claimId: number) => {
      // Simulate blockchain transaction for claiming assets
      const txResult = await simulateTransaction('claimAsset', { claimId });
      
      // Update claim status in backend
      const response = await apiRequest('PATCH', `/api/claims/${claimId}`, {
        status: 'claimed',
        claimedAt: new Date().toISOString(),
      });
      
      return { claim: await response.json(), transaction: txResult };
    },
    onSuccess: ({ claim, transaction }) => {
      setTransactionModal({
        isOpen: true,
        status: 'confirmed',
        message: 'Assets claimed successfully! They have been transferred to your wallet.',
        hash: transaction.hash,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/claims'] });
      
      setTimeout(() => {
        setTransactionModal({ isOpen: false, status: 'pending', message: '' });
      }, 5000);
    },
    onError: (error) => {
      setTransactionModal({
        isOpen: true,
        status: 'failed',
        message: 'Failed to claim assets. Please try again.',
      });
      
      toast({
        title: "Claim Failed",
        description: "Failed to claim assets. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClaimAssets = (claimId: number) => {
    setTransactionModal({
      isOpen: true,
      status: 'pending',
      message: 'Processing asset claim transaction...',
    });

    claimAssetsMutation.mutate(claimId);
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'crypto':
        return <Bitcoin className="h-5 w-5 text-orange-500" />;
      case 'nft':
        return <ImageIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <Coins className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready to Claim
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending Approval
          </Badge>
        );
      case 'claimed':
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Claimed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 mb-6">
          Please connect your wallet to view and claim available inheritance assets.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Inheritance Claims</CardTitle>
            <p className="text-gray-600">View and claim available inheritance assets</p>
          </CardHeader>
        </Card>

        {/* Information Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You can claim inheritance assets when the inactivity period has been exceeded and 
            legal documentation has been verified.
          </AlertDescription>
        </Alert>

        {/* Available Claims */}
        <Card>
          <CardHeader>
            <CardTitle>Available Claims</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : claims.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Claims Available
                </h3>
                <p className="text-gray-600">
                  You don't have any inheritance claims ready at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {claims.map((claim) => (
                  <div key={claim.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {claim.vaultName}
                        </h4>
                        <p className="text-gray-600">From: {claim.ownerName}</p>
                      </div>
                      {getStatusBadge(claim.status)}
                    </div>

                    {claim.status === 'approved' && (
                      <>
                        {/* Trigger Conditions Met */}
                        <div className="mb-6">
                          <h5 className="font-medium text-gray-900 mb-3">
                            Inheritance Conditions Met:
                          </h5>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                              <span className="text-gray-700">
                                Inactivity period exceeded (180 days)
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                              <span className="text-gray-700">
                                Legal documentation verified
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Assets to Claim */}
                        <div className="mb-6">
                          <h5 className="font-medium text-gray-900 mb-3">
                            Your Allocated Assets:
                          </h5>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            {claim.assets.map((asset, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center">
                                  {getAssetIcon(asset.type)}
                                  <span className="font-medium text-gray-900 ml-3">
                                    {asset.name}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-gray-900">
                                    {asset.amount}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {asset.usdValue}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Claim Actions */}
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">
                              Transaction fee: <span className="font-medium">0.02 CHZ</span>
                            </p>
                          </div>
                          <div className="space-x-3">
                            <Button variant="outline">
                              View Details
                            </Button>
                            <Button 
                              onClick={() => handleClaimAssets(claim.id)}
                              disabled={claimAssetsMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {claimAssetsMutation.isPending ? 'Claiming...' : 'Claim Assets'}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {claim.status === 'pending' && (
                      <div className="mt-4">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            This claim is pending verification. You will be notified when 
                            the inheritance conditions have been met.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {claim.status === 'claimed' && (
                      <div className="mt-4">
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Assets have been successfully claimed and transferred to your wallet
                            on {claim.claimedAt ? new Date(claim.claimedAt).toLocaleDateString() : 'N/A'}.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Claim History */}
        <Card>
          <CardHeader>
            <CardTitle>Claim History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Previous Claims
              </h3>
              <p className="text-gray-600">
                Your claim history will appear here once you start claiming assets.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <TransactionModal 
        isOpen={transactionModal.isOpen}
        onClose={() => setTransactionModal({ isOpen: false, status: 'pending', message: '' })}
        status={transactionModal.status}
        message={transactionModal.message}
        transactionHash={transactionModal.hash}
        onRetry={() => {
          // Retry logic would go here
          setTransactionModal({ isOpen: false, status: 'pending', message: '' });
        }}
      />
    </>
  );
}
