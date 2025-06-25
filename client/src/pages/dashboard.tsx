import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Plus, 
  FolderPlus, 
  FileUp, 
  UserPlus,
  Edit,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { usePortfolioValue } from "@/hooks/use-price";

import { OnboardingFlow } from "@/components/onboarding-flow";
import { DemoVaultStatus } from "@/components/demo-vault-status";
import { VaultEditor } from "@/components/vault-editor";
import { VaultAssetCount, VaultBeneficiaryCount } from "@/components/vault-counts";
import { PortfolioDashboard } from "@/components/portfolio-dashboard";
import { MultiTicker } from "@/components/price-ticker";

import type { Vault as VaultType } from "@shared/schema";

export default function Dashboard() {
  const { wallet } = useWallet();

  const { data: vaults = [], isLoading } = useQuery({
    queryKey: ['/api/vaults'],
    enabled: wallet.isConnected,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });



  if (!wallet.isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="h-16 w-16 bg-gray-300 rounded-lg mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 mb-6">
          Please connect your wallet to access your Willo dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Interactive Onboarding for Demo Wallet */}
      {wallet.address === '0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e' && vaults.length === 0 && (
        <OnboardingFlow />
      )}

      {/* Demo Vault Status (after onboarding) */}
      {wallet.address === '0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e' && vaults.length > 0 && (
        <DemoVaultStatus />
      )}
      




      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/create-vault">
              <Button 
                variant="outline" 
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:border-primary hover:bg-blue-50"
              >
                <Plus className="h-6 w-6 text-primary" />
                <span className="font-medium">Create Vault</span>
              </Button>
            </Link>

            <Link href="/vaults">
              <Button 
                variant="outline" 
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:border-primary hover:bg-blue-50"
              >
                <FolderPlus className="h-6 w-6 text-primary" />
                <span className="font-medium">Manage Vaults</span>
              </Button>
            </Link>

            <Link href="/documents">
              <Button 
                variant="outline" 
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:border-primary hover:bg-blue-50"
              >
                <FileUp className="h-6 w-6 text-primary" />
                <span className="font-medium">Upload Documents</span>
              </Button>
            </Link>

            <Link href="/beneficiaries">
              <Button 
                variant="outline" 
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:border-primary hover:bg-blue-50"
              >
                <UserPlus className="h-6 w-6 text-primary" />
                <span className="font-medium">Manage Beneficiaries</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* My Vaults */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Vaults</CardTitle>
          <Link href="/create-vault">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Vault
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : vaults.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 bg-gray-300 rounded-lg mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Vaults Created
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first inheritance vault to get started.
              </p>
              <Link href="/vaults">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Vault
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {vaults.map((vault: VaultType) => (
                <div 
                  key={vault.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {vault.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {vault.description || 'No description provided'}
                      </p>
                      <div className="flex items-center space-x-4">
                        <Badge 
                          variant={vault.status === 'active' ? 'default' : 'secondary'}
                        >
                          {vault.status === 'active' ? '✓ Active' : '⏱ Pending'}
                        </Badge>
                        <VaultAssetCount vaultId={vault.id} />
                        <VaultBeneficiaryCount vaultId={vault.id} />
                      </div>
                    </div>
                    <VaultEditor vault={vault} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
