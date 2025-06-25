import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { isValidAddress, formatAddress } from "@/lib/web3-utils";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Plus,
  Trash2,
  Edit,
  User
} from "lucide-react";
import type { Beneficiary, Guardian, Vault } from "@shared/schema";

const beneficiarySchema = z.object({
  vaultId: z.number(),
  name: z.string().min(1, "Beneficiary name is required"),
  walletAddress: z.string().refine(isValidAddress, "Invalid wallet address"),
  relationship: z.string().optional(),
  allocation: z.any().optional(),
  inheritanceRules: z.object({
    inactivityPeriod: z.number().min(30, "Minimum 30 days").default(365), // days
    assetTypes: z.array(z.string()).default([]), // specific assets to inherit
    percentage: z.number().min(0).max(100).default(100), // percentage of specified assets
    conditions: z.string().optional(), // special conditions
  }).optional(),
});

const guardianSchema = z.object({
  vaultId: z.number(),
  name: z.string().min(1, "Guardian name is required"),
  walletAddress: z.string().refine(isValidAddress, "Invalid wallet address"),
  email: z.string().email("Invalid email address").optional(),
});

type BeneficiaryForm = z.infer<typeof beneficiarySchema>;
type GuardianForm = z.infer<typeof guardianSchema>;

export default function Beneficiaries() {
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("beneficiaries");
  const [isBeneficiaryDialogOpen, setIsBeneficiaryDialogOpen] = useState(false);
  const [isGuardianDialogOpen, setIsGuardianDialogOpen] = useState(false);
  const [showInheritanceRules, setShowInheritanceRules] = useState(false);

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

  const { data: beneficiaries = [] } = useQuery({
    queryKey: ['/api/beneficiaries', selectedVaultId],
    queryFn: () => selectedVaultId ? 
      fetch(`/api/vaults/${selectedVaultId}/beneficiaries`).then(r => r.json()) : 
      [],
    enabled: !!selectedVaultId,
  });

  const { data: guardians = [] } = useQuery({
    queryKey: ['/api/guardians', selectedVaultId],
    queryFn: () => selectedVaultId ? 
      fetch(`/api/vaults/${selectedVaultId}/guardians`).then(r => r.json()) : 
      [],
    enabled: !!selectedVaultId,
  });

  const beneficiaryForm = useForm<BeneficiaryForm>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      name: '',
      walletAddress: '',
      relationship: '',
      allocation: {},
    },
  });

  const guardianForm = useForm<GuardianForm>({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      name: '',
      walletAddress: '',
      email: '',
    },
  });

  const addBeneficiaryMutation = useMutation({
    mutationFn: async (data: BeneficiaryForm) => {
      const response = await apiRequest('POST', `/api/vaults/${data.vaultId}/beneficiaries`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/beneficiaries'] });
      toast({
        title: "Beneficiary Added",
        description: "Beneficiary has been successfully added to the vault.",
      });
      setIsBeneficiaryDialogOpen(false);
      beneficiaryForm.reset();
    },
    onError: () => {
      toast({
        title: "Failed to Add Beneficiary",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const addGuardianMutation = useMutation({
    mutationFn: async (data: GuardianForm) => {
      const response = await apiRequest('POST', `/api/vaults/${data.vaultId}/guardians`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guardians'] });
      toast({
        title: "Guardian Added",
        description: "Guardian has been successfully added to the vault.",
      });
      setIsGuardianDialogOpen(false);
      guardianForm.reset();
    },
    onError: () => {
      toast({
        title: "Failed to Add Guardian",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteBeneficiaryMutation = useMutation({
    mutationFn: async (beneficiaryId: number) => {
      await apiRequest('DELETE', `/api/beneficiaries/${beneficiaryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/beneficiaries'] });
      toast({
        title: "Beneficiary Removed",
        description: "Beneficiary has been removed from the vault.",
      });
    },
  });

  const deleteGuardianMutation = useMutation({
    mutationFn: async (guardianId: number) => {
      await apiRequest('DELETE', `/api/guardians/${guardianId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guardians'] });
      toast({
        title: "Guardian Removed",
        description: "Guardian has been removed from the vault.",
      });
    },
  });

  const onBeneficiarySubmit = (data: BeneficiaryForm) => {
    if (!selectedVaultId) {
      toast({
        title: "No Vault Selected",
        description: "Please select a vault first.",
        variant: "destructive",
      });
      return;
    }

    addBeneficiaryMutation.mutate({
      ...data,
      vaultId: selectedVaultId,
    });
  };

  const onGuardianSubmit = (data: GuardianForm) => {
    if (!selectedVaultId) {
      toast({
        title: "No Vault Selected",
        description: "Please select a vault first.",
        variant: "destructive",
      });
      return;
    }

    addGuardianMutation.mutate({
      ...data,
      vaultId: selectedVaultId,
    });
  };

  if (!wallet.isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 mb-6">
          Please connect your wallet to manage beneficiaries and guardians.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Vault Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Vault</CardTitle>
          <p className="text-gray-600">Choose which vault to manage beneficiaries and guardians for</p>
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
        <Card>
          <CardHeader>
            <CardTitle>Manage Beneficiaries & Guardians</CardTitle>
            <p className="text-gray-600">
              Configure who will inherit your assets and who can approve inheritance claims
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
                <TabsTrigger value="guardians">Guardians</TabsTrigger>
              </TabsList>

              {/* Beneficiaries Tab */}
              <TabsContent value="beneficiaries" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Beneficiaries</h3>
                  <Dialog open={isBeneficiaryDialogOpen} onOpenChange={setIsBeneficiaryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Beneficiary
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Beneficiary</DialogTitle>
                      </DialogHeader>
                      
                      <Form {...beneficiaryForm}>
                        <form onSubmit={beneficiaryForm.handleSubmit(onBeneficiarySubmit)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={beneficiaryForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Sarah Johnson" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={beneficiaryForm.control}
                              name="relationship"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Relationship</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Daughter, Son, Spouse" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={beneficiaryForm.control}
                            name="walletAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Wallet Address *</FormLabel>
                                <FormControl>
                                  <Input placeholder="0x..." {...field} />
                                </FormControl>
                                <FormDescription>
                                  The beneficiary's wallet address for receiving assets
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Inheritance Rules Section */}
                          <div className="border-t pt-4 mt-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900">Inheritance Rules</h4>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowInheritanceRules(!showInheritanceRules)}
                              >
                                {showInheritanceRules ? 'Hide' : 'Configure'} Rules
                              </Button>
                            </div>
                            
                            {showInheritanceRules && (
                              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Inactivity Period (days)
                                    </label>
                                    <Input
                                      type="number"
                                      min="30"
                                      max="3650"
                                      defaultValue="365"
                                      placeholder="365"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      Assets transfer after this many days of inactivity
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Asset Allocation %
                                    </label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="100"
                                      defaultValue="100"
                                      placeholder="100"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      Percentage of assets to inherit
                                    </p>
                                  </div>
                                </div>
                                
                                {wallet.address === '0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e' && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Specific Assets (Demo Portfolio)
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked className="rounded" />
                                        <span>CHZ Tokens (12,500)</span>
                                      </label>
                                      <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked className="rounded" />
                                        <span>BAR Tokens (150)</span>
                                      </label>
                                      <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded" />
                                        <span>PSG Tokens (200)</span>
                                      </label>
                                      <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded" />
                                        <span>Sports NFTs (4)</span>
                                      </label>
                                    </div>
                                  </div>
                                )}
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Special Conditions
                                  </label>
                                  <textarea
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                    rows={2}
                                    placeholder="e.g., Only if beneficiary is over 18 years old"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end space-x-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsBeneficiaryDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={addBeneficiaryMutation.isPending}>
                              {addBeneficiaryMutation.isPending ? 'Adding...' : 'Add Beneficiary'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                {beneficiaries.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Beneficiaries Added
                    </h3>
                    <p className="text-gray-600">
                      Add beneficiaries who will inherit your digital assets.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {beneficiaries.map((beneficiary: Beneficiary) => (
                      <div
                        key={beneficiary.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{beneficiary.name}</h4>
                                {beneficiary.relationship && (
                                  <p className="text-sm text-gray-600">{beneficiary.relationship}</p>
                                )}
                              </div>
                            </div>
                            <div className="ml-13">
                              <p className="text-sm text-gray-700 mb-2 font-mono">
                                {formatAddress(beneficiary.walletAddress)}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">
                                  Active Beneficiary
                                </Badge>
                                {wallet.address === '0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e' && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    CHZ + NFTs Assigned
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteBeneficiaryMutation.mutate(beneficiary.id)}
                              disabled={deleteBeneficiaryMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Guardians Tab */}
              <TabsContent value="guardians" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Guardians</h3>
                  <Dialog open={isGuardianDialogOpen} onOpenChange={setIsGuardianDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Guardian
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Guardian</DialogTitle>
                      </DialogHeader>
                      
                      <Form {...guardianForm}>
                        <form onSubmit={guardianForm.handleSubmit(onGuardianSubmit)} className="space-y-4">
                          <FormField
                            control={guardianForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Guardian Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., John Smith" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={guardianForm.control}
                            name="walletAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Wallet Address *</FormLabel>
                                <FormControl>
                                  <Input placeholder="0x..." {...field} />
                                </FormControl>
                                <FormDescription>
                                  The guardian's wallet address for approval transactions
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={guardianForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="guardian@example.com" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Optional: for notifications about inheritance claims
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex justify-end space-x-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsGuardianDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={addGuardianMutation.isPending}>
                              {addGuardianMutation.isPending ? 'Adding...' : 'Add Guardian'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                {guardians.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Guardians Added
                    </h3>
                    <p className="text-gray-600">
                      Add trusted guardians who can approve inheritance claims.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {guardians.map((guardian: Guardian) => (
                      <div
                        key={guardian.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mr-3">
                                <Shield className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{guardian.name}</h4>
                                {guardian.email && (
                                  <p className="text-sm text-gray-600">{guardian.email}</p>
                                )}
                              </div>
                            </div>
                            <div className="ml-13">
                              <p className="text-sm text-gray-700 mb-2 font-mono">
                                {formatAddress(guardian.walletAddress)}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-green-700 border-green-200">
                                  Trusted Guardian
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteGuardianMutation.mutate(guardian.id)}
                              disabled={deleteGuardianMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
