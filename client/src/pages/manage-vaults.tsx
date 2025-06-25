import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { VaultEditor } from "@/components/vault-editor";
import { VaultAssetCount, VaultBeneficiaryCount } from "@/components/vault-counts";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Vault as VaultIcon
} from "lucide-react";
import type { Vault } from "@shared/schema";

export default function ManageVaults() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newVault, setNewVault] = useState({
    name: '',
    description: '',
    walletAddress: '',
    inactivityPeriod: 180
  });
  const { wallet } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vaults = [], isLoading } = useQuery({
    queryKey: ['/api/vaults'],
    enabled: wallet.isConnected,
  });

  const createVaultMutation = useMutation({
    mutationFn: async (data: typeof newVault) => {
      return apiRequest('POST', '/api/vaults', {
        ...data,
        walletAddress: data.walletAddress || wallet.address
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vaults'] });
      setCreateDialogOpen(false);
      setNewVault({ name: '', description: '', walletAddress: '', inactivityPeriod: 180 });
      toast({ title: "Vault created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create vault", variant: "destructive" });
    },
  });

  const deleteVaultMutation = useMutation({
    mutationFn: async (vaultId: number) => {
      return apiRequest('DELETE', `/api/vaults/${vaultId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vaults'] });
      toast({ title: "Vault deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete vault", variant: "destructive" });
    },
  });

  if (!wallet.isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <VaultIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 mb-6">
          Please connect your wallet to manage your inheritance vaults.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Vaults</h1>
          <p className="text-gray-600 mt-2">Create and manage your inheritance vaults</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Vault
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Vault</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="vault-name">Vault Name</Label>
                <Input
                  id="vault-name"
                  placeholder="Enter vault name"
                  value={newVault.name}
                  onChange={(e) => setNewVault({ ...newVault, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="vault-description">Description</Label>
                <Textarea
                  id="vault-description"
                  placeholder="Describe this inheritance vault"
                  value={newVault.description}
                  onChange={(e) => setNewVault({ ...newVault, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="wallet-address">Wallet Address (optional)</Label>
                <Input
                  id="wallet-address"
                  placeholder={`Default: ${wallet.address}`}
                  value={newVault.walletAddress}
                  onChange={(e) => setNewVault({ ...newVault, walletAddress: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="inactivity-period">Inactivity Period (days)</Label>
                <Input
                  id="inactivity-period"
                  type="number"
                  min="30"
                  max="3650"
                  value={newVault.inactivityPeriod}
                  onChange={(e) => setNewVault({ ...newVault, inactivityPeriod: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createVaultMutation.mutate(newVault)}
                  disabled={createVaultMutation.isPending || !newVault.name}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Vault
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vaults List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Vaults ({vaults.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : vaults.length === 0 ? (
            <div className="text-center py-12">
              <VaultIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Vaults Created
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first inheritance vault to get started.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Vault
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {vaults.map((vault: Vault) => (
                <div 
                  key={vault.id} 
                  className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {vault.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {vault.description || 'No description provided'}
                          </p>
                          <div className="text-xs text-gray-500">
                            <div>Wallet: {vault.walletAddress}</div>
                            <div>Inactivity Period: {vault.inactivityPeriod} days</div>
                          </div>
                        </div>
                        <Badge 
                          variant={vault.status === 'active' ? 'default' : 'secondary'}
                        >
                          {vault.status === 'active' ? '✓ Active' : '⏱ Pending'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <VaultAssetCount vaultId={vault.id} />
                        <VaultBeneficiaryCount vaultId={vault.id} />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <VaultEditor vault={vault} />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${vault.name}"? This will permanently delete all assets, beneficiaries, and related data. This action cannot be undone.`)) {
                            deleteVaultMutation.mutate(vault.id);
                          }
                        }}
                        disabled={deleteVaultMutation.isPending}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        title="Delete Vault"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deleteVaultMutation.isPending ? '...' : ''}
                      </Button>
                    </div>
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