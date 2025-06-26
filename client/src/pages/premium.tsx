import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { TransactionModal } from "@/components/transaction-modal";
import { simulateTransaction } from "@/lib/web3-utils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Crown, 
  Check, 
  Star,
  Zap,
  Shield,
  Globe,
  BarChart3,
  Palette,
  Headphones
} from "lucide-react";
import type { Subscription } from "@shared/schema";

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    priceChz: null,
    description: 'Perfect for getting started',
    features: [
      '1 Vault maximum',
      'Basic asset types',
      '5 Beneficiaries max',
      'Standard document storage',
      'Community support',
    ],
    limitations: [
      'Limited to 1 vault',
      'Basic asset types only',
      'No multi-signature support',
      'Standard support',
    ],
    buttonText: 'Current Plan',
    buttonVariant: 'outline' as const,
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '50 CHZ',
    priceChz: 50,
    priceUsd: '$6.25',
    description: 'For serious inheritance planning',
    features: [
      '5 Vaults maximum',
      'All asset types',
      'Unlimited beneficiaries',
      'Enhanced document storage (50MB)',
      'Multi-signature support',
      'Priority support',
      'Advanced inheritance rules',
      'Email notifications',
    ],
    limitations: [],
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'default' as const,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '150 CHZ',
    priceChz: 150,
    priceUsd: '$18.75',
    description: 'For institutions and families',
    features: [
      'Unlimited vaults',
      'Cross-chain support',
      'Advanced analytics',
      'Custom inheritance rules',
      'White-label solution',
      '24/7 dedicated support',
      'Enhanced document storage (500MB)',
      'Custom integrations',
      'Legal consultation',
      'Audit reports',
    ],
    limitations: [],
    buttonText: 'Upgrade to Enterprise',
    buttonVariant: 'default' as const,
    popular: false,
  },
];

const FEATURE_ICONS = {
  'vault': Crown,
  'assets': Zap,
  'beneficiaries': Shield,
  'storage': Globe,
  'analytics': BarChart3,
  'support': Headphones,
  'custom': Palette,
};

export default function Premium() {
  const [transactionModal, setTransactionModal] = useState<{
    isOpen: boolean;
    status: 'pending' | 'confirmed' | 'failed';
    message: string;
    hash?: string;
  }>({ isOpen: false, status: 'pending', message: '' });

  const { wallet } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscription } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: wallet.isConnected,
  });

  const upgradeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const plan = PLANS.find(p => p.id === planId);
      if (!plan || !plan.priceChz) throw new Error('Invalid plan');

      if (!wallet.isConnected) {
        throw new Error('Wallet not connected');
      }

      // Import contract client and connect wallet
      const { contractClient } = await import('@/lib/contract-integration');
      await contractClient.connect(wallet.address as `0x${string}`);
      
      // Execute blockchain transaction for subscription payment
      const txResult = await contractClient.purchaseSubscription(
        planId === 'pro' ? 'pro' : 'enterprise'
      );
      
      // Update subscription in backend
      const response = await apiRequest('POST', '/api/subscription', {
        plan: planId,
        status: 'active',
        transactionHash: txResult,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });
      
      return { 
        subscription: await response.json(), 
        transaction: { hash: txResult, status: 'confirmed' as const }
      };
    },
    onSuccess: ({ subscription, transaction }) => {
      setTransactionModal({
        isOpen: true,
        status: 'confirmed',
        message: 'Subscription upgraded successfully! Enjoy your new premium features.',
        hash: transaction.hash,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      
      setTimeout(() => {
        setTransactionModal({ isOpen: false, status: 'pending', message: '' });
      }, 3000);
    },
    onError: (error: any) => {
      console.error('Upgrade error:', error);
      
      setTransactionModal({
        isOpen: true,
        status: 'failed',
        message: error.message || 'Failed to upgrade subscription. Please try again.',
      });
      
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to upgrade subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = (planId: string) => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to upgrade your subscription.",
        variant: "destructive",
      });
      return;
    }

    const plan = PLANS.find(p => p.id === planId);
    if (!plan || !plan.priceChz) return;

    setTransactionModal({
      isOpen: true,
      status: 'pending',
      message: `Processing subscription payment of ${plan.priceChz} CHZ...`,
    });

    upgradeMutation.mutate(planId);
  };

  const currentPlan = (subscription as any)?.plan || 'basic';

  if (!wallet.isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <Crown className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 mb-6">
          Please connect your wallet to view and manage your subscription.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="h-6 w-6 mr-2 text-primary" />
              Premium Features
            </CardTitle>
            <p className="text-gray-600">
              Unlock advanced functionality for your digital inheritance vaults
            </p>
          </CardHeader>
        </Card>

        {/* Current Plan Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Current Plan: <span className="text-primary capitalize">{currentPlan}</span>
                </h3>
                <p className="text-gray-600">
                  {currentPlan === 'basic' 
                    ? 'You have access to basic vault functionality' 
                    : 'You have access to premium features'}
                </p>
                {(subscription as any)?.expiresAt && (
                  <p className="text-sm text-gray-500 mt-1">
                    Expires: {new Date((subscription as any).expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Badge 
                variant={currentPlan === 'basic' ? 'outline' : 'default'}
                className={currentPlan !== 'basic' ? 'bg-primary text-white' : ''}
              >
                {currentPlan === 'basic' ? 'Free Plan' : 'Premium Active'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const canUpgrade = currentPlan === 'basic' && plan.id !== 'basic';
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${
                  plan.popular ? 'border-2 border-primary shadow-lg' : ''
                } ${isCurrentPlan ? 'bg-gray-50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    {plan.priceUsd && (
                      <div className="text-sm text-gray-600 mt-1">{plan.priceUsd}/month</div>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Limitations:</h4>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="text-sm text-gray-500">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <Button 
                      variant={isCurrentPlan ? 'outline' : plan.buttonVariant}
                      className={`w-full ${
                        plan.popular && !isCurrentPlan ? 'bg-primary hover:bg-blue-700' : ''
                      } ${isCurrentPlan ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      disabled={isCurrentPlan || upgradeMutation.isPending}
                      onClick={() => {
                        if (plan.id !== 'basic' && !isCurrentPlan) {
                          handleUpgrade(plan.id);
                        }
                      }}
                    >
                      {isCurrentPlan ? 'Current Plan' : 
                       upgradeMutation.isPending ? 'Processing...' : 
                       plan.buttonText}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">Basic</th>
                    <th className="text-center py-3 px-4">Pro</th>
                    <th className="text-center py-3 px-4">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Number of Vaults</td>
                    <td className="text-center py-3 px-4">1</td>
                    <td className="text-center py-3 px-4">5</td>
                    <td className="text-center py-3 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Asset Types</td>
                    <td className="text-center py-3 px-4">Basic</td>
                    <td className="text-center py-3 px-4">All</td>
                    <td className="text-center py-3 px-4">All + Custom</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Beneficiaries</td>
                    <td className="text-center py-3 px-4">5</td>
                    <td className="text-center py-3 px-4">Unlimited</td>
                    <td className="text-center py-3 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Document Storage</td>
                    <td className="text-center py-3 px-4">10MB</td>
                    <td className="text-center py-3 px-4">50MB</td>
                    <td className="text-center py-3 px-4">500MB</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Multi-signature</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">✅</td>
                    <td className="text-center py-3 px-4">✅</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Cross-chain Support</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">✅</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Support Level</td>
                    <td className="text-center py-3 px-4">Community</td>
                    <td className="text-center py-3 px-4">Priority</td>
                    <td className="text-center py-3 px-4">24/7 Dedicated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                How does billing work?
              </h4>
              <p className="text-gray-600 text-sm">
                Billing is done monthly in CHZ tokens. Your subscription automatically renews 
                unless canceled. You can upgrade or downgrade at any time.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Can I cancel my subscription?
              </h4>
              <p className="text-gray-600 text-sm">
                Yes, you can cancel your subscription at any time. You'll continue to have 
                access to premium features until the end of your billing period.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                What happens to my data if I downgrade?
              </h4>
              <p className="text-gray-600 text-sm">
                Your data is never deleted. If you exceed the limits of a lower plan, 
                you'll have read-only access until you upgrade again or remove excess data.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Do you offer discounts for annual payments?
              </h4>
              <p className="text-gray-600 text-sm">
                Yes! Annual subscriptions receive a 20% discount. Contact our support team 
                for enterprise annual pricing.
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
