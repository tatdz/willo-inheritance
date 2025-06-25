import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Code2, 
  Users, 
  Shield, 
  Rocket,
  ExternalLink,
  Github,
  MessageCircle
} from "lucide-react";

export default function Documentation() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const resources = [
    {
      title: "GitHub Repository",
      description: "View source code and contribute",
      icon: <Github className="h-4 w-4" />,
      href: "https://github.com/tatdz/willo-inheritance",
      external: true
    },
    {
      title: "GitHub Issues",
      description: "Report bugs and request features",
      icon: <MessageCircle className="h-4 w-4" />,
      href: "https://github.com/tatdz/willo-inheritance/issues",
      external: true
    },
    {
      title: "Full Documentation",
      description: "Complete README with all details",
      icon: <BookOpen className="h-4 w-4" />,
      href: "https://github.com/tatdz/willo-inheritance#readme",
      external: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Willo Documentation
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Everything you need to know about using Willo for secure digital inheritance 
          on the Chiliz blockchain
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="outline">v1.0.0</Badge>
          <Badge variant="outline">Chiliz Chain</Badge>
          <Badge variant="outline">React + TypeScript</Badge>
        </div>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">For Users</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li>1. Connect your wallet (MetaMask, WalletConnect, or Demo)</li>
                <li>2. Create your first inheritance vault</li>
                <li>3. Add your CHZ tokens, Fan Tokens, and NFTs</li>
                <li>4. Designate beneficiaries with allocation percentages</li>
                <li>5. Upload important documents and instructions</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">For Developers</h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono">
                <div># Clone and setup</div>
                <div>git clone https://github.com/tatdz/willo-inheritance.git</div>
                <div>npm install</div>
                <div>npm run dev</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">🔐 Secure Vault Management</h4>
              <p className="text-sm text-gray-600">Create multiple inheritance vaults with customizable security settings</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">💰 Multi-Asset Support</h4>
              <p className="text-sm text-gray-600">CHZ tokens, Fan Tokens (BAR, PSG, JUV, ACM), NFTs, and digital assets</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">👥 Beneficiary System</h4>
              <p className="text-sm text-gray-600">Designate multiple beneficiaries with configurable allocation percentages</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">⏰ Smart Inheritance</h4>
              <p className="text-sm text-gray-600">Automated asset transfer after user-defined inactivity periods</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">📄 Document Storage</h4>
              <p className="text-sm text-gray-600">Decentralized storage for wills, trusts, and legal documents</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">📊 Portfolio Tracking</h4>
              <p className="text-sm text-gray-600">Real-time asset valuation and portfolio overview</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Frontend</h4>
              <div className="space-y-1 text-sm">
                <div>• React 18 with TypeScript</div>
                <div>• Wouter for routing</div>
                <div>• TanStack Query</div>
                <div>• Tailwind CSS + Shadcn/UI</div>
                <div>• Vite build tool</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Backend</h4>
              <div className="space-y-1 text-sm">
                <div>• Node.js + Express</div>
                <div>• Drizzle ORM</div>
                <div>• PostgreSQL database</div>
                <div>• Session management</div>
                <div>• RESTful API design</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Blockchain</h4>
              <div className="space-y-1 text-sm">
                <div>• Wagmi/Viem integration</div>
                <div>• Chiliz Chain support</div>
                <div>• Multi-wallet compatibility</div>
                <div>• IPFS document storage</div>
                <div>• Smart contract interaction</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Guide */}
      <Card id="user-guide">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
            <ol className="space-y-2 text-sm">
              <li><strong>1. Connect Your Wallet</strong> - Choose MetaMask, WalletConnect, or Demo wallet</li>
              <li><strong>2. Create Your First Vault</strong> - Set name, description, and inactivity period (30-3650 days)</li>
              <li><strong>3. Add Assets</strong> - Include CHZ tokens, Fan Tokens (BAR, PSG, JUV, ACM), and NFTs</li>
              <li><strong>4. Designate Beneficiaries</strong> - Add names, emails, wallet addresses, and allocation percentages</li>
              <li><strong>5. Upload Documents</strong> - Store wills, trusts, and important instructions</li>
            </ol>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Managing Vaults</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Vault Settings</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Edit vault name and description</li>
                  <li>• Adjust inactivity period (30-3650 days)</li>
                  <li>• Monitor vault status (Active/Inactive)</li>
                  <li>• Delete vaults if needed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Asset Management</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Add multiple asset types</li>
                  <li>• Edit asset details and amounts</li>
                  <li>• Remove assets from vaults</li>
                  <li>• Track real-time values</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Inheritance Process</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                When your wallet remains inactive for the specified period, beneficiaries can claim their inheritance.
                The system automatically transfers assets to designated wallet addresses based on allocation percentages.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">How to Claim Assets</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">For Beneficiaries</h4>
                <ol className="space-y-2 text-sm">
                  <li><strong>1. Visit the Claims Page</strong> - Navigate to the Claims section in the app</li>
                  <li><strong>2. Connect Your Wallet</strong> - Use the same wallet address designated in the vault</li>
                  <li><strong>3. View Available Claims</strong> - See all vaults where you're listed as a beneficiary</li>
                  <li><strong>4. Check Vault Status</strong> - Claims are only available after the inactivity period expires</li>
                  <li><strong>5. Submit Claim Request</strong> - Click "Claim Assets" for eligible vaults</li>
                  <li><strong>6. Confirm Transaction</strong> - Approve the blockchain transaction to receive your assets</li>
                </ol>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">Important Notes</h4>
                <ul className="space-y-1 text-sm text-amber-700">
                  <li>• Claims can only be made after the vault's inactivity period has expired</li>
                  <li>• You must use the exact wallet address specified in the vault</li>
                  <li>• Assets are distributed according to the allocation percentages set by the vault owner</li>
                  <li>• Once claimed, assets are permanently transferred to your wallet</li>
                  <li>• Gas fees may apply for blockchain transactions</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Claim Status Types</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-600">Pending</div>
                    <div className="text-gray-500">Vault is still active, waiting for inactivity period</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="font-medium text-green-600">Available</div>
                    <div className="text-green-500">Ready to claim - inactivity period expired</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="font-medium text-blue-600">Completed</div>
                    <div className="text-blue-500">Assets already transferred to your wallet</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Guide */}
      <Card id="developer-guide">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Developer Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Setup Instructions</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono space-y-1">
              <div># Clone repository</div>
              <div>git clone https://github.com/tatdz/willo-inheritance.git</div>
              <div>cd willo-inheritance</div>
              <div></div>
              <div># Install dependencies</div>
              <div>npm install</div>
              <div></div>
              <div># Setup environment</div>
              <div>cp .env.example .env</div>
              <div># Configure DATABASE_URL and other variables</div>
              <div></div>
              <div># Start development server</div>
              <div>npm run dev</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">API Endpoints</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Vault Management</h4>
                <div className="text-sm space-y-1 font-mono bg-gray-50 p-3 rounded">
                  <div>GET /api/vaults</div>
                  <div>POST /api/vaults</div>
                  <div>PATCH /api/vaults/:id</div>
                  <div>DELETE /api/vaults/:id</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Asset Management</h4>
                <div className="text-sm space-y-1 font-mono bg-gray-50 p-3 rounded">
                  <div>GET /api/vaults/:id/assets</div>
                  <div>POST /api/vaults/:id/assets</div>
                  <div>PATCH /api/assets/:id</div>
                  <div>DELETE /api/assets/:id</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Database Schema</h3>
            <div className="text-sm">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Core Tables</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• users - User accounts</li>
                    <li>• vaults - Inheritance vaults</li>
                    <li>• assets - Digital assets</li>
                    <li>• beneficiaries - Inheritors</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Relationships</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Users → Vaults (1:many)</li>
                    <li>• Vaults → Assets (1:many)</li>
                    <li>• Vaults → Beneficiaries (1:many)</li>
                    <li>• Vaults → Claims (1:many)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Storage</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• PostgreSQL database</li>
                    <li>• Drizzle ORM</li>
                    <li>• Type-safe operations</li>
                    <li>• Migration support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap */}
      <Card id="roadmap">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="text-lg font-semibold">Phase 1: Core Platform (Completed)</h3>
            </div>
            <ul className="space-y-1 text-sm text-gray-600 ml-5">
              <li>✅ Vault creation and management</li>
              <li>✅ Asset tracking and management</li>
              <li>✅ Beneficiary designation system</li>
              <li>✅ Basic claims processing</li>
              <li>✅ Wallet integration (MetaMask, Demo, WalletConnect)</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h3 className="text-lg font-semibold">Phase 2: Enhanced Features (In Progress)</h3>
            </div>
            <ul className="space-y-1 text-sm text-gray-600 ml-5">
              <li>🔄 Real-time asset price feeds</li>
              <li>🔄 Advanced document management</li>
              <li>🔄 Multi-signature vault security</li>
              <li>🔄 Mobile application</li>
              <li>🔄 Email notifications for beneficiaries</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <h3 className="text-lg font-semibold">Phase 3: Advanced Integration (Planned)</h3>
            </div>
            <ul className="space-y-1 text-sm text-gray-600 ml-5">
              <li>📋 DeFi protocol integration</li>
              <li>📋 Cross-chain asset support</li>
              <li>📋 Legal framework integration</li>
              <li>📋 Enterprise features</li>
              <li>📋 API marketplace</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Resources & Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <Button
                key={resource.title}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2"
                onClick={() => window.open(resource.href, '_blank')}
              >
                <div className="flex items-center gap-2">
                  {resource.icon}
                  <span className="font-medium">{resource.title}</span>
                  {resource.external && <ExternalLink className="h-3 w-3" />}
                </div>
                <span className="text-sm text-gray-600">{resource.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Need Help?
          </h3>
          <p className="text-blue-700 mb-4">
            Our community is here to help you get the most out of Willo
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => window.open('https://github.com/tatdz/willo-inheritance/discussions', '_blank')}>
              Join Discussions
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('https://github.com/tatdz/willo-inheritance/issues', '_blank')}
            >
              Report Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}