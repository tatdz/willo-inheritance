import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bitcoin, 
  Image, 
  TrendingUp, 
  Globe, 
  Cloud, 
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import type { Asset, Vault } from "@shared/schema";

const assetSchema = z.object({
  vaultId: z.number(),
  type: z.enum(['crypto', 'nft', 'defi', 'domain', 'digital']),
  name: z.string().min(1, "Asset name is required"),
  amount: z.string().optional(),
  walletAddress: z.string().optional(),
  contractAddress: z.string().optional(),
  tokenId: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.any().optional(),
});

type AssetForm = z.infer<typeof assetSchema>;

const ASSET_TYPES = [
  { id: 'crypto', name: 'Cryptocurrency', icon: Bitcoin, description: 'ETH, CHZ, tokens' },
  { id: 'nft', name: 'NFTs', icon: Image, description: 'Digital art, collectibles' },
  { id: 'defi', name: 'DeFi Positions', icon: TrendingUp, description: 'Staked assets, LP shares' },
  { id: 'domain', name: 'Domain Names', icon: Globe, description: 'Web domains, ENS names' },
  { id: 'digital', name: 'Digital Assets', icon: Cloud, description: 'Online accounts, data' },
];

const CRYPTO_TOKENS = [
  { symbol: 'CHZ', name: 'Chiliz', balance: '12,500' },
  { symbol: 'BAR', name: 'FC Barcelona Fan Token', balance: '150' },
  { symbol: 'PSG', name: 'Paris Saint-Germain Fan Token', balance: '200' },
  { symbol: 'JUV', name: 'Juventus Fan Token', balance: '100' },
  { symbol: 'ACM', name: 'AC Milan Fan Token', balance: '75' },
  { symbol: 'ETH', name: 'Ethereum', balance: '0.5' },
  { symbol: 'USDC', name: 'USD Coin', balance: '1,000' },
];

const DEMO_NFTS = [
  { 
    name: 'Rare Messi Trading Card #001', 
    collection: 'Sports Legends', 
    tokenId: '001',
    contractAddress: '0x1234...5678',
    image: '/assets/nft-messi.jpg'
  },
  { 
    name: 'Rare Ronaldo Trading Card #007', 
    collection: 'Sports Legends', 
    tokenId: '007',
    contractAddress: '0x1234...5678',
    image: '/assets/nft-ronaldo.jpg'
  },
  { 
    name: 'VIP Camp Nou Access Pass', 
    collection: 'Stadium Passes', 
    tokenId: '100',
    contractAddress: '0x5678...9abc',
    image: '/assets/nft-stadium.jpg'
  },
  { 
    name: 'Limited Edition PSG Jersey #10', 
    collection: 'Team Jerseys', 
    tokenId: '010',
    contractAddress: '0x9abc...def0',
    image: '/assets/nft-jersey.jpg'
  }
];

// Asset card component with real-time pricing
function AssetCard({ asset }: { asset: Asset }) {
  const { price } = usePrice(asset.name, true);
  const assetValue = price ? parseFloat(asset.amount) * price.price : 0;

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-blue-100">
              {asset.type === 'crypto' && <Coins className="h-5 w-5 text-blue-600" />}
              {asset.type === 'nft' && <Palette className="h-5 w-5 text-purple-600" />}
              {asset.type === 'fan_token' && <Trophy className="h-5 w-5 text-orange-600" />}
            </div>
            <div>
              <h4 className="font-semibold">{asset.name}</h4>
              <p className="text-sm text-gray-600">{asset.amount} {asset.type === 'crypto' ? asset.name : 'tokens'}</p>
              {price && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm font-medium">${assetValue.toFixed(2)}</span>
                  <PriceTicker symbol={asset.name} compact showChange className="text-xs" />
                </div>
              )}
              {asset.metadata && (
                <p className="text-xs text-gray-500 mt-1">{asset.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {asset.type === 'crypto' ? 'Cryptocurrency' : 
               asset.type === 'nft' ? 'NFT' : 'Fan Token'}
            </Badge>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {asset.walletAddress && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Wallet Address:</span>
              <div className="flex items-center space-x-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {asset.walletAddress.slice(0, 6)}...{asset.walletAddress.slice(-4)}
                </code>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Assets() {
  const [selectedAssetType, setSelectedAssetType] = useState<string>('crypto');
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { wallet } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vaults = [] } = useQuery({
    queryKey: ['/api/vaults'],
    enabled: wallet.isConnected,
    queryFn: async () => {
      if (demoStorage.isDemoWallet(wallet.address)) {
        const serverVaults = await fetch('/api/vaults').then(r => r.json());
        const localVaults = demoStorage.getVaults();
        const allVaults = [...serverVaults];
        localVaults.forEach(localVault => {
          const exists = allVaults.find(v => v.id === localVault.id || v.name === localVault.name);
          if (!exists) {
            allVaults.push(localVault);
          }
        });
        return allVaults;
      }
      return fetch('/api/vaults').then(r => r.json());
    },
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['/api/assets', selectedVaultId],
    queryFn: () => selectedVaultId ? 
      fetch(`/api/vaults/${selectedVaultId}/assets`).then(r => r.json()) : 
      [],
    enabled: !!selectedVaultId,
  });

  const form = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      type: 'crypto',
      name: '',
      amount: '',
      walletAddress: '',
      contractAddress: '',
      tokenId: '',
      notes: '',
    },
  });

  const addAssetMutation = useMutation({
    mutationFn: async (data: AssetForm) => {
      const response = await apiRequest('POST', `/api/vaults/${data.vaultId}/assets`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      toast({
        title: "Asset Added",
        description: "Asset has been successfully registered to the vault.",
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Failed to Add Asset",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: number) => {
      await apiRequest('DELETE', `/api/assets/${assetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      toast({
        title: "Asset Removed",
        description: "Asset has been removed from the vault.",
      });
    },
  });

  const onSubmit = (data: AssetForm) => {
    if (!selectedVaultId) {
      toast({
        title: "No Vault Selected",
        description: "Please select a vault first.",
        variant: "destructive",
      });
      return;
    }

    addAssetMutation.mutate({
      ...data,
      vaultId: selectedVaultId,
    });
  };

  const getAssetIcon = (type: string) => {
    const assetType = ASSET_TYPES.find(t => t.id === type);
    const IconComponent = assetType?.icon || Cloud;
    return <IconComponent className="h-5 w-5" />;
  };

  const getAssetTypeColor = (type: string) => {
    const colors = {
      crypto: 'bg-orange-100 text-orange-800',
      nft: 'bg-purple-100 text-purple-800',
      defi: 'bg-green-100 text-green-800',
      domain: 'bg-blue-100 text-blue-800',
      digital: 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || colors.digital;
  };

  if (!wallet.isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <Cloud className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 mb-6">
          Please connect your wallet to manage your digital assets.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Demo Portfolio Display - Updated with transferred assets */}
      {wallet.isConnected && wallet.address === '0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e' && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              Demo Portfolio - Assets in Inheritance Vault
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">CHZ Tokens</h4>
                <p className="text-2xl font-bold text-green-600">1,000 CHZ</p>
                <p className="text-sm text-gray-500">≈ $700 USD (in vault)</p>
                <div className="text-xs text-blue-600 mt-1">Remaining: 11,500 CHZ</div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Fan Tokens</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>BAR</span><span className="font-medium text-green-600">50 (in vault)</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>PSG</span><span>200 (wallet)</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>JUV</span><span>100 (wallet)</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">NFTs in Vault</h4>
                <p className="text-xl font-bold text-purple-600">2 NFTs</p>
                <div className="text-xs text-purple-600 mt-1">
                  • El Clasico Ticket #2024<br/>
                  • PSG Jersey #10
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Vault Active:</strong> Assets transferred and protected with inheritance rules. Beneficiaries configured with guardian approval system.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vault Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Vault</CardTitle>
          <p className="text-gray-600">Choose which vault to manage assets for</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vaults.map((vault: Vault) => (
              <Button
                key={vault.id}
                variant={selectedVaultId === vault.id ? "default" : "outline"}
                className="h-auto p-4 justify-start"
                onClick={() => setSelectedVaultId(vault.id)}
              >
                <div className="text-left">
                  <div className="font-medium">{vault.name}</div>
                  <div className="text-sm opacity-70">
                    {vault.description || 'No description'}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedVaultId && (
        <>
          {/* Asset Type Selection */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Asset Management</CardTitle>
                <p className="text-gray-600">Register and manage your digital assets</p>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Asset</DialogTitle>
                  </DialogHeader>
                  
                  {/* Asset Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Asset Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {ASSET_TYPES.map((type) => (
                        <Button
                          key={type.id}
                          type="button"
                          variant={selectedAssetType === type.id ? "default" : "outline"}
                          className="h-auto p-3 flex flex-col items-center space-y-2"
                          onClick={() => {
                            setSelectedAssetType(type.id);
                            form.setValue('type', type.id as any);
                          }}
                        >
                          <type.icon className="h-5 w-5" />
                          <div className="text-center">
                            <div className="text-xs font-medium">{type.name}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {/* Crypto Form */}
                      {selectedAssetType === 'crypto' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Token/Coin *</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select token" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {CRYPTO_TOKENS.map((token) => (
                                        <SelectItem key={token.symbol} value={token.symbol}>
                                          <div className="flex justify-between w-full">
                                            <span>{token.name} ({token.symbol})</span>
                                            {wallet.address === '0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e' && (
                                              <span className="text-green-600 font-medium">{token.balance}</span>
                                            )}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Amount</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.000001"
                                      placeholder="0.00"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="walletAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Wallet Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="0x..." {...field} />
                                </FormControl>
                                <FormDescription>
                                  The wallet address containing this asset
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {/* NFT Form */}
                      {selectedAssetType === 'nft' && (
                        <>
                          {wallet.address === '0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e' && (
                            <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                              <h4 className="font-medium text-purple-800 mb-2">Demo NFT Collection</h4>
                              <div className="grid grid-cols-1 gap-2 text-sm">
                                {DEMO_NFTS.map((nft, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                                    <span className="font-medium">{nft.name}</span>
                                    <span className="text-purple-600">{nft.collection}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>NFT Collection/Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Rare Messi Trading Card #001" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="contractAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contract Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="0x..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="tokenId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Token ID</FormLabel>
                                  <FormControl>
                                    <Input placeholder="1234" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </>
                      )}

                      {/* Domain Form */}
                      {selectedAssetType === 'domain' && (
                        <>
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Domain Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Additional information about this asset"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={addAssetMutation.isPending}>
                          {addAssetMutation.isPending ? 'Adding...' : 'Add Asset'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
          </Card>

          {/* Assets List */}
          <Card>
            <CardHeader>
              <CardTitle>Registered Assets</CardTitle>
            </CardHeader>
            <CardContent>
              {assets.length === 0 ? (
                <div className="text-center py-12">
                  <Cloud className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Assets Registered
                  </h3>
                  <p className="text-gray-600">
                    Add your first digital asset to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assets.map((asset: Asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getAssetIcon(asset.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{asset.name}</h3>
                            <Badge className={getAssetTypeColor(asset.type)}>
                              {asset.type.toUpperCase()}
                            </Badge>
                          </div>
                          {asset.amount && (
                            <p className="text-sm text-gray-600">
                              Amount: {asset.amount}
                            </p>
                          )}
                          {asset.walletAddress && (
                            <p className="text-sm text-gray-600 font-mono">
                              {asset.walletAddress.substring(0, 10)}...{asset.walletAddress.substring(asset.walletAddress.length - 8)}
                            </p>
                          )}
                          {asset.notes && (
                            <p className="text-sm text-gray-500 mt-1">{asset.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAssetMutation.mutate(asset.id)}
                          disabled={deleteAssetMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
