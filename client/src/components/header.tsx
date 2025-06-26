import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Wallet, ChevronDown } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { WalletModal } from "./wallet-modal";
import { WilloLogo } from "./willo-logo";
import { formatAddress } from "@/lib/web3-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [location] = useLocation();
  const { wallet, disconnectWallet } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', id: 'dashboard' },
    { name: 'Vaults', href: '/vaults', id: 'vaults' },
    { name: 'Assets', href: '/assets', id: 'assets' },
    { name: 'Beneficiaries', href: '/beneficiaries', id: 'beneficiaries' },
    { name: 'Documents', href: '/documents', id: 'documents' },
    { name: 'Claims', href: '/claims', id: 'claims' },
    { name: 'Premium', href: '/premium', id: 'premium' },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <WilloLogo size="md" className="mr-3" />
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-gray-900">Willo</h1>
                  <p className="text-xs text-gray-500 leading-tight">Programmable digital inheritance</p>
                </div>
              </div>
              <nav className="hidden md:ml-10 md:flex space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`px-1 pb-4 text-sm font-medium border-b-2 transition-colors ${
                      isActiveRoute(item.href)
                        ? 'text-primary border-primary'
                        : 'text-gray-500 hover:text-gray-700 border-transparent'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {/* Network Status */}
              {wallet.isConnected && (
                <Badge
                  variant={wallet.isCorrectNetwork ? "default" : "destructive"}
                  className="hidden md:flex"
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    wallet.isCorrectNetwork ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  {wallet.network || 'Unknown Network'}
                </Badge>
              )}
              
              {/* Documentation Link */}
              <Link href="/docs">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  📚 Docs
                </Button>
              </Link>
              
              {/* Wallet Connection */}
              {wallet.isConnected ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4" />
                      <span>{formatAddress(wallet.address)}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="flex flex-col items-start p-3">
                      <div className="font-medium">Connected Wallet</div>
                      <div className="text-sm text-gray-500">{wallet.address}</div>
                      <div className="text-sm text-gray-500">Balance: {wallet.balance} CHZ</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={disconnectWallet}>
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => setShowWalletModal(true)}
                  className="bg-primary hover:bg-blue-700"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <WalletModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
      />
    </>
  );
}
