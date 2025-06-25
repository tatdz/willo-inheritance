import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Clock, 
  Users, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Eye
} from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";

export function DemoVaultStatus() {
  const { wallet } = useWallet();

  if (!wallet.isConnected || wallet.address !== '0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e') {
    return null;
  }

  const vaultData = {
    name: "Family Digital Inheritance Vault",
    status: "Active",
    inactivityPeriod: 365,
    daysRemaining: 365,
    beneficiaries: [
      { name: "Emma Rodriguez", relationship: "Daughter", allocation: "40%" },
      { name: "Michael Rodriguez", relationship: "Son", allocation: "40%" },
      { name: "Sofia Rodriguez", relationship: "Spouse", allocation: "20%" }
    ],
    guardians: [
      { name: "Legal Advisor", email: "advisor@law-firm.com", status: "Active" },
      { name: "Family Friend", email: "guardian@email.com", status: "Active" },
      { name: "Financial Advisor", email: "finance@advisor.com", status: "Active" }
    ],
    documents: [
      { name: "Last Will & Testament", type: "Legal", status: "Verified" },
      { name: "Identity Verification", type: "Identity", status: "Verified" },
      { name: "Asset Instructions", type: "Instructions", status: "Uploaded" }
    ],
    assets: {
      chz: { amount: "1,000", value: "$700" },
      fanTokens: { bar: "50" },
      nfts: [
        "FC Barcelona vs Real Madrid El Clasico Ticket #2024",
        "Paris Saint-Germain Champions League Jersey #10"
      ]
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Vault Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Vault Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">{vaultData.name}</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {vaultData.status}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Inactivity Monitor</span>
              </div>
              <span className="font-medium">{vaultData.daysRemaining} days remaining</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span>Beneficiaries</span>
              </div>
              <span className="font-medium">{vaultData.beneficiaries.length} configured</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-600" />
                <span>Legal Documents</span>
              </div>
              <span className="font-medium">{vaultData.documents.length} uploaded</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm mb-2">
              <span>Vault Security</span>
              <span>100%</span>
            </div>
            <Progress value={100} className="h-2" />
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>All requirements met</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Protected Assets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <div>
                <div className="font-medium">CHZ Tokens</div>
                <div className="text-sm text-gray-600">{vaultData.assets.chz.amount} CHZ</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{vaultData.assets.chz.value}</div>
                <Badge variant="outline" className="text-xs">Cryptocurrency</Badge>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium">Fan Tokens</div>
                <div className="text-sm text-gray-600">{vaultData.assets.fanTokens.bar} BAR</div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">Fan Token</Badge>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">NFT Collection</div>
                <Badge variant="outline" className="text-xs">2 Items</Badge>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                {vaultData.assets.nfts.map((nft, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>{nft}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Beneficiaries Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Beneficiaries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vaultData.beneficiaries.map((beneficiary, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{beneficiary.name}</div>
                  <div className="text-sm text-gray-600">{beneficiary.relationship}</div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">{beneficiary.allocation}</Badge>
                  <div className="text-xs text-gray-500 mt-1">Asset allocation</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security & Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Guardian Threshold</span>
              <Badge variant="outline">2 of 3 required</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Document Verification</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Complete</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Wallet Activity Monitor</span>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600">Active</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full">
              View Detailed Security Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}