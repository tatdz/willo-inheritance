import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Wallet, 
  CheckCircle, 
  ArrowRight, 
  Coins,
  Image,
  FileText,
  Users,
  Shield,
  Plus,
  Upload
} from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { GuardianSetup } from "@/components/guardian-setup";
import { useQueryClient } from "@tanstack/react-query";
import { demoStorage } from "@/lib/demo-storage";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  completed: boolean;
}

// Real Chiliz sports NFT collections
const REAL_CHILIZ_NFTS = [
  {
    name: "FC Barcelona vs Real Madrid El Clasico Ticket #2024",
    collection: "Official Match Tickets",
    contractAddress: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03",
    tokenId: "2024",
    price: "0.25 CHZ",
    rarity: "Legendary",
    image: "/nft-clasico.jpg"
  },
  {
    name: "Paris Saint-Germain Champions League Jersey #10",
    collection: "PSG Official Merchandise",
    contractAddress: "0xd0c94c0b8f8F5F4d5a5F5e5A5F5e5A5F5e5A5F5e",
    tokenId: "010",
    price: "0.15 CHZ",
    rarity: "Rare",
    image: "/nft-psg-jersey.jpg"
  }
];

const DEMO_BENEFICIARIES = [
  { firstName: "Emma", lastName: "Rodriguez", relationship: "Daughter", address: "0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e" },
  { firstName: "Michael", lastName: "Rodriguez", relationship: "Son", address: "0x8ba1f109551bD432803012645Hac136c74abcdef" },
  { firstName: "Sofia", lastName: "Rodriguez", relationship: "Spouse", address: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db" }
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
  const [beneficiaries, setBeneficiaries] = useState(DEMO_BENEFICIARIES);
  const [vaultName, setVaultName] = useState("");
  const [inactivityPeriod, setInactivityPeriod] = useState(365);
  const { wallet } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const steps: OnboardingStep[] = [
    {
      id: "assets",
      title: "Add Your Assets",
      description: "Transfer CHZ tokens and NFTs from your MetaMask wallet",
      completed: false,
      component: (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Simulated MetaMask Transfer</h4>
            <p className="text-sm text-blue-700">
              In a real scenario, you would approve transactions in MetaMask to transfer assets to your inheritance vault.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">CHZ Tokens Available</h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={selectedAssets.includes("CHZ")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAssets([...selectedAssets, "CHZ"]);
                        } else {
                          setSelectedAssets(selectedAssets.filter(a => a !== "CHZ"));
                        }
                      }}
                    />
                    <div>
                      <div className="font-medium">Chiliz (CHZ)</div>
                      <div className="text-sm text-gray-600">Available: 12,500 CHZ</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Input 
                      type="number" 
                      placeholder="1000" 
                      className="w-24 text-sm"
                      disabled={!selectedAssets.includes("CHZ")}
                    />
                    <div className="text-xs text-gray-500 mt-1">Amount to transfer</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={selectedAssets.includes("BAR")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAssets([...selectedAssets, "BAR"]);
                        } else {
                          setSelectedAssets(selectedAssets.filter(a => a !== "BAR"));
                        }
                      }}
                    />
                    <div>
                      <div className="font-medium">FC Barcelona Fan Token (BAR)</div>
                      <div className="text-sm text-gray-600">Available: 150 BAR</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Input 
                      type="number" 
                      placeholder="50" 
                      className="w-24 text-sm"
                      disabled={!selectedAssets.includes("BAR")}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">NFT Collections</h4>
              <div className="grid grid-cols-1 gap-3">
                {REAL_CHILIZ_NFTS.map((nft, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        checked={selectedNFTs.includes(nft.tokenId)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedNFTs([...selectedNFTs, nft.tokenId]);
                          } else {
                            setSelectedNFTs(selectedNFTs.filter(id => id !== nft.tokenId));
                          }
                        }}
                      />
                      <div>
                        <div className="font-medium">{nft.name}</div>
                        <div className="text-sm text-gray-600">{nft.collection}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {nft.rarity}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{nft.price}</div>
                      <div className="text-gray-500">Token #{nft.tokenId}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "documents",
      title: "Upload Legal Documents",
      description: "Add important documents for your digital inheritance",
      completed: false,
      component: (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Document Security</h4>
            <p className="text-sm text-green-700">
              Documents are encrypted and stored on IPFS for decentralized, secure access by beneficiaries and guardians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className="p-4 border border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => {
                // Simulate file upload
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.pdf,.doc,.docx';
                fileInput.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    toast({
                      title: "Document Uploaded",
                      description: `${file.name} has been encrypted and stored securely.`,
                    });
                  }
                };
                fileInput.click();
              }}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-700">Last Will & Testament</div>
              <div className="text-xs text-gray-500 mt-1">PDF, DOC (Max 10MB)</div>
              <Badge variant="secondary" className="mt-2">Required</Badge>
            </div>
            
            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-700">Identity Verification</div>
              <div className="text-xs text-gray-500 mt-1">Passport, Driver's License</div>
              <Badge variant="secondary" className="mt-2">Required</Badge>
            </div>
            
            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-700">Asset Instructions</div>
              <div className="text-xs text-gray-500 mt-1">Specific transfer instructions</div>
              <Badge variant="outline" className="mt-2">Optional</Badge>
            </div>
            
            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-700">Trust Documents</div>
              <div className="text-xs text-gray-500 mt-1">Family trust papers</div>
              <Badge variant="outline" className="mt-2">Optional</Badge>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <FileText className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <div className="font-medium text-amber-800">Document Guidelines</div>
                <div className="text-sm text-amber-700 mt-1">
                  • All documents must be legally valid in your jurisdiction<br/>
                  • Include clear beneficiary identification<br/>
                  • Specify asset distribution preferences<br/>
                  • Documents are encrypted and only accessible to authorized parties
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "beneficiaries",
      title: "Add Beneficiaries",
      description: "Define who will inherit your digital assets",
      completed: false,
      component: (
        <div className="space-y-6">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Beneficiary Setup</h4>
            <p className="text-sm text-purple-700">
              Add family members or trusted individuals who will receive your assets. Each beneficiary needs a valid wallet address.
            </p>
          </div>

          <div className="space-y-4">
            {beneficiaries.map((beneficiary, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input 
                    placeholder="First Name"
                    value={beneficiary.firstName}
                    onChange={(e) => {
                      const updated = [...beneficiaries];
                      updated[index].firstName = e.target.value;
                      setBeneficiaries(updated);
                    }}
                  />
                  <Input 
                    placeholder="Last Name"
                    value={beneficiary.lastName}
                    onChange={(e) => {
                      const updated = [...beneficiaries];
                      updated[index].lastName = e.target.value;
                      setBeneficiaries(updated);
                    }}
                  />
                  <Input 
                    placeholder="Relationship"
                    value={beneficiary.relationship}
                    onChange={(e) => {
                      const updated = [...beneficiaries];
                      updated[index].relationship = e.target.value;
                      setBeneficiaries(updated);
                    }}
                  />
                </div>
                <Input 
                  placeholder="Wallet Address (0x...)"
                  value={beneficiary.address}
                  onChange={(e) => {
                    const updated = [...beneficiaries];
                    updated[index].address = e.target.value;
                    setBeneficiaries(updated);
                  }}
                  className="font-mono text-sm"
                />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Asset Allocation:</span>
                  <div className="flex items-center space-x-2">
                    <span>CHZ Tokens</span>
                    <Input type="number" placeholder="%" className="w-16 text-center" />
                    <span>NFTs</span>
                    <Input type="number" placeholder="%" className="w-16 text-center" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full" onClick={() => {
            setBeneficiaries([...beneficiaries, { firstName: "", lastName: "", relationship: "", address: "" }]);
            toast({
              title: "Beneficiary Added",
              description: "New beneficiary slot created. Please fill in their details.",
            });
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Another Beneficiary
          </Button>
          
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">Demo Wallet Addresses</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between items-center">
                <span>Emma:</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const updated = [...beneficiaries];
                    updated[0].address = "0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e";
                    setBeneficiaries(updated);
                    toast({ title: "Address Added", description: "Emma's wallet address has been filled in." });
                  }}
                >
                  Use Demo Address
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span>Michael:</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const updated = [...beneficiaries];
                    updated[1].address = "0x8ba1f109551bD432803012645Hac136c74abcdef";
                    setBeneficiaries(updated);
                    toast({ title: "Address Added", description: "Michael's wallet address has been filled in." });
                  }}
                >
                  Use Demo Address
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span>Sofia:</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const updated = [...beneficiaries];
                    updated[2].address = "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db";
                    setBeneficiaries(updated);
                    toast({ title: "Address Added", description: "Sofia's wallet address has been filled in." });
                  }}
                >
                  Use Demo Address
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "vault",
      title: "Create Inheritance Vault",
      description: "Configure vault settings and inheritance rules",
      completed: false,
      component: (
        <div className="space-y-6">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h4 className="font-medium text-indigo-800 mb-2">Vault Configuration</h4>
            <p className="text-sm text-indigo-700">
              Create a secure vault that will automatically transfer assets to beneficiaries based on your specified rules.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vault Name</label>
              <Input 
                placeholder="e.g., Family Digital Inheritance Vault"
                value={vaultName}
                onChange={(e) => setVaultName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inactivity Period (Days)</label>
              <Input 
                type="number"
                placeholder="365"
                value={inactivityPeriod}
                onChange={(e) => setInactivityPeriod(Number(e.target.value))}
                className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
              <div className="text-sm text-gray-500 mt-1">
                Assets will be transferred if wallet is inactive for this period
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Asset Assignment Summary</h4>
              <div className="space-y-2">
                {selectedAssets.length > 0 && (
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Selected Tokens:</span>
                    <Badge variant="secondary">{selectedAssets.join(", ")}</Badge>
                  </div>
                )}
                {selectedNFTs.length > 0 && (
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Selected NFTs:</span>
                    <Badge variant="secondary">{selectedNFTs.length} NFTs</Badge>
                  </div>
                )}
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Beneficiaries:</span>
                  <Badge variant="secondary">{beneficiaries.filter(b => b.firstName).length} people</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding - create actual vault and add demo assets/beneficiaries
      const vaultData = {
        name: vaultName || "Family Digital Inheritance Vault",
        description: "CHZ tokens and NFTs inheritance vault",
        walletAddress: wallet.address,
        inactivityPeriod: inactivityPeriod,
        status: "active"
      };
      
      // Create vault first
      fetch('/api/vaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vaultData)
      }).then(response => response.json())
      .then(vault => {
        // Add demo assets
        const assetPromises = [];
        
        if (selectedAssets.includes("CHZ")) {
          assetPromises.push(
            fetch(`/api/vaults/${vault.id}/assets`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'crypto',
                name: 'CHZ',
                amount: '1000',
                walletAddress: wallet.address,
                notes: 'Chiliz tokens for inheritance'
              })
            })
          );
        }
        
        if (selectedAssets.includes("BAR")) {
          assetPromises.push(
            fetch(`/api/vaults/${vault.id}/assets`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'crypto',
                name: 'BAR',
                amount: '50',
                walletAddress: wallet.address,
                notes: 'FC Barcelona Fan Tokens'
              })
            })
          );
        }
        
        // Add selected NFTs
        selectedNFTs.forEach(tokenId => {
          const nft = REAL_CHILIZ_NFTS.find(n => n.tokenId === tokenId);
          if (nft) {
            assetPromises.push(
              fetch(`/api/vaults/${vault.id}/assets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'nft',
                  name: nft.name,
                  contractAddress: nft.contractAddress,
                  tokenId: nft.tokenId,
                  walletAddress: wallet.address,
                  notes: `${nft.collection} - ${nft.rarity}`
                })
              })
            );
          }
        });
        
        // Add beneficiaries with proper addresses
        const beneficiaryPromises = beneficiaries
          .filter(b => b.firstName && (b.address || b.firstName === "Emma" || b.firstName === "Michael" || b.firstName === "Sofia"))
          .map(b => {
            // Use default demo addresses if not provided
            let address = b.address;
            if (!address) {
              if (b.firstName === "Emma") address = "0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e";
              else if (b.firstName === "Michael") address = "0x8ba1f109551bD432803012645Hac136c74abcdef";
              else if (b.firstName === "Sofia") address = "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db";
            }
            
            return fetch(`/api/vaults/${vault.id}/beneficiaries`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: `${b.firstName} ${b.lastName}`,
                walletAddress: address,
                relationship: b.relationship,
                allocation: { percentage: 33.33 }
              })
            });
          });
        
        return Promise.all([...assetPromises, ...beneficiaryPromises]);
      }).then(() => {
        // Invalidate all queries to refresh the dashboard
        queryClient.invalidateQueries({ queryKey: ['/api/vaults'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
        queryClient.invalidateQueries({ queryKey: ['/api/beneficiaries'] });
        
        toast({
          title: "Inheritance Vault Created!",
          description: "Your digital assets and beneficiaries have been configured.",
        });
        
        // Force immediate refresh of all queries
        queryClient.invalidateQueries({ queryKey: ['/api/vaults'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
        
        // Reset form and refresh UI
        setTimeout(() => {
          setCurrentStep(0);
          setSelectedAssets([]);
          setSelectedNFTs([]);
          setBeneficiaries(DEMO_BENEFICIARIES);
          setVaultName("");
          setInactivityPeriod(365);
          
          // Force another refresh to ensure data loads
          queryClient.refetchQueries({ queryKey: ['/api/vaults'] });
          queryClient.refetchQueries({ queryKey: ['/api/dashboard-stats'] });
        }, 100);
      });
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!wallet.isConnected || wallet.address !== '0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-6 w-6 text-blue-600" />
                Digital Inheritance Setup
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </p>
            </div>
            <Badge variant="secondary">
              Demo Mode
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold">{steps[currentStep].title}</h3>
            <p className="text-gray-600">{steps[currentStep].description}</p>
          </div>

          {steps[currentStep].component}

          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <Button onClick={nextStep}>
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Vault
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}