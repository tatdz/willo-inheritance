import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/hooks/use-wallet";
import { Header } from "@/components/header";
import { NetworkWarning } from "@/components/network-warning";
import Dashboard from "@/pages/dashboard";
import ManageVaults from "@/pages/manage-vaults";
import CreateVault from "@/pages/create-vault";
import AddAssets from "@/pages/add-assets";
import AddBeneficiaries from "@/pages/add-beneficiaries";
import Assets from "@/pages/assets";
import Documents from "@/pages/documents";
import Beneficiaries from "@/pages/beneficiaries";
import Claims from "@/pages/claims";
import Premium from "@/pages/premium";
import Documentation from "@/pages/documentation";
import FeeStructure from "@/pages/fee-structure";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NetworkWarning />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/vaults" component={ManageVaults} />
          <Route path="/manage-vaults" component={ManageVaults} />
          <Route path="/create-vault" component={CreateVault} />
          <Route path="/add-assets/:vaultId" component={AddAssets} />
          <Route path="/add-beneficiaries/:vaultId" component={AddBeneficiaries} />
          <Route path="/assets" component={Assets} />
          <Route path="/documents" component={Documents} />
          <Route path="/beneficiaries" component={Beneficiaries} />
          <Route path="/claims" component={Claims} />
          <Route path="/premium" component={Premium} />
          <Route path="/docs" component={Documentation} />
          <Route path="/fees" component={FeeStructure} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
