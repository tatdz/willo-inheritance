// Portfolio dashboard with real-time pricing
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Wallet, BarChart3 } from "lucide-react";
import { usePortfolioValue, usePrices } from "@/hooks/use-price";
import { MultiTicker } from "@/components/price-ticker";

interface PortfolioDashboardProps {
  assets: Array<{ symbol: string; amount: string }>;
  className?: string;
}

export function PortfolioDashboard({ assets, className }: PortfolioDashboardProps) {
  const { portfolio, isLoading } = usePortfolioValue(assets, assets.length > 0);
  const symbols = [...new Set(assets.map(a => a.symbol))];
  const { prices } = usePrices(symbols, symbols.length > 0);

  if (isLoading || !portfolio) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Total Portfolio Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio.totalValue.toFixed(2)}</div>
            <div className={`text-xs flex items-center ${
              portfolio.totalChange24h >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {portfolio.totalChange24h >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {portfolio.totalChange24h >= 0 ? '+' : ''}{portfolio.totalChange24h.toFixed(2)}% (24h)
            </div>
          </CardContent>
        </Card>

        {/* Total Assets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.breakdown.length}</div>
            <p className="text-xs text-muted-foreground">Across all tokens</p>
          </CardContent>
        </Card>

        {/* Best Performer */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {(() => {
              const bestAsset = portfolio.breakdown.reduce((best, current) => 
                current.change24h > best.change24h ? current : best
              );
              return (
                <>
                  <div className="text-2xl font-bold">{bestAsset.symbol}</div>
                  <div className="text-xs text-green-600">
                    +{bestAsset.change24h.toFixed(2)}% (24h)
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* Asset Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Types</CardTitle>
            <Badge variant="outline">{symbols.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{symbols.length}</div>
            <p className="text-xs text-muted-foreground">Different tokens</p>
          </CardContent>
        </Card>
      </div>

      {/* Asset Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Asset Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolio.breakdown.map((asset, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="font-medium">{asset.symbol}</div>
                  <Badge variant="outline">{asset.amount} tokens</Badge>
                </div>
                <div className="text-right">
                  <div className="font-medium">${asset.value.toFixed(2)}</div>
                  <div className={`text-xs ${
                    asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Price Ticker */}
      <MultiTicker symbols={symbols} />
    </div>
  );
}