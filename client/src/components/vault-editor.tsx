import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Edit, 
  Save, 
  X,
  Trash2,
  Plus,
  Users,
  Coins
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Vault, Asset, Beneficiary } from "@shared/schema";

interface VaultEditorProps {
  vault: Vault;
}

export function VaultEditor({ vault }: VaultEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editedVault, setEditedVault] = useState(vault);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assets = [] } = useQuery({
    queryKey: ['/api/assets', vault.id],
    queryFn: () => fetch(`/api/vaults/${vault.id}/assets`).then(r => r.json()),
    enabled: isOpen,
  });

  const { data: beneficiaries = [] } = useQuery({
    queryKey: ['/api/beneficiaries', vault.id],
    queryFn: () => fetch(`/api/vaults/${vault.id}/beneficiaries`).then(r => r.json()),
    enabled: isOpen,
  });

  const updateVaultMutation = useMutation({
    mutationFn: async (data: Partial<Vault>) => {
      return apiRequest('PUT', `/api/vaults/${vault.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vaults'] });
      toast({
        title: "Vault Updated",
        description: "Vault settings have been saved successfully.",
      });
      setIsOpen(false);
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: number) => {
      return apiRequest('DELETE', `/api/assets/${assetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      toast({
        title: "Asset Removed",
        description: "Asset has been removed from the vault.",
      });
    },
  });

  const deleteBeneficiaryMutation = useMutation({
    mutationFn: async (beneficiaryId: number) => {
      return apiRequest('DELETE', `/api/beneficiaries/${beneficiaryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/beneficiaries'] });
      toast({
        title: "Beneficiary Removed",
        description: "Beneficiary has been removed from the vault.",
      });
    },
  });

  const deleteVaultMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/vaults/${vault.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vaults'] });
      setIsOpen(false);
      toast({
        title: "Vault Deleted",
        description: "Vault and all associated data have been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete vault. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateVaultMutation.mutate({
      name: editedVault.name,
      description: editedVault.description,
      inactivityPeriod: editedVault.inactivityPeriod,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vault: {vault.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Vault Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vault Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vault Name
                </label>
                <Input
                  value={editedVault.name}
                  onChange={(e) => setEditedVault({...editedVault, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={editedVault.description || ''}
                  onChange={(e) => setEditedVault({...editedVault, description: e.target.value})}
                  placeholder="Describe this inheritance vault..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inactivity Period (Days)
                </label>
                <Input
                  type="number"
                  value={editedVault.inactivityPeriod}
                  onChange={(e) => setEditedVault({...editedVault, inactivityPeriod: Number(e.target.value)})}
                  min="30"
                  max="3650"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Assets will be transferred after this period of wallet inactivity
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assets Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Assets ({assets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Coins className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No assets added to this vault</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {assets.map((asset: Asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {asset.type}
                          </Badge>
                          <span className="font-medium">{asset.name}</span>
                          {asset.amount && <span className="text-gray-600">({asset.amount})</span>}
                        </div>
                        {asset.notes && (
                          <div className="text-sm text-gray-500 mt-1">{asset.notes}</div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAssetMutation.mutate(asset.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Beneficiaries Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Beneficiaries ({beneficiaries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {beneficiaries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No beneficiaries added to this vault</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Beneficiary
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {beneficiaries.map((beneficiary: Beneficiary) => (
                    <div key={beneficiary.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{beneficiary.name}</div>
                        {beneficiary.relationship && (
                          <div className="text-sm text-gray-600">{beneficiary.relationship}</div>
                        )}
                        <code className="text-xs bg-gray-100 px-1 rounded">
                          {beneficiary.walletAddress.slice(0, 20)}...
                        </code>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBeneficiaryMutation.mutate(beneficiary.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                if (confirm('Are you sure you want to delete this vault? This will permanently delete all assets, beneficiaries, and related data.')) {
                  deleteVaultMutation.mutate();
                }
              }}
              disabled={deleteVaultMutation.isPending}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Vault
            </Button>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateVaultMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateVaultMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}