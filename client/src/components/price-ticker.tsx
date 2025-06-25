// Real-time price ticker component
import { usePrice, usePrices } from '@/hooks/use-price';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceTickerProps {
  symbol: string;
  showChange?: boolean;
  showVolume?: boolean;
  compact?: boolean;
  className?: string;
}

export function PriceTicker({ 
  symbol, 
  showChange = true, 
  showVolume = false, 
  compact = false,
  className 
}: PriceTickerProps) {
  const { price, isLoading, isRealtime } = usePrice(symbol);

  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  if (!price) {
    return (
      <div className={cn("text-gray-500", className)}>
        Price unavailable
      </div>
    );
  }

  const isPositive = price.change24h >= 0;
  const isNeutral = price.change24h === 0;

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const changeColor = isNeutral ? 'text-gray-500' : isPositive ? 'text-green-600' : 'text-red-600';

  if (compact) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <span className="font-medium">${price.price.toFixed(4)}</span>
        {showChange && (
          <div className={cn("flex items-center space-x-1", changeColor)}>
            <TrendIcon className="h-3 w-3" />
            <span className="text-sm">{Math.abs(price.change24h).toFixed(2)}%</span>
          </div>
        )}
        {isRealtime && <Wifi className="h-3 w-3 text-green-500" />}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-lg">{symbol}</h3>
            {isRealtime ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-500">
                <WifiOff className="h-3 w-3 mr-1" />
                Cached
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${price.price.toFixed(4)}</div>
            <div className="text-xs text-gray-500">
              Updated: {new Date(price.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {showChange && (
          <div className={cn("flex items-center space-x-2", changeColor)}>
            <TrendIcon className="h-4 w-4" />
            <span className="font-medium">
              {isPositive ? '+' : ''}{price.change24h.toFixed(2)}%
            </span>
            <span className="text-sm text-gray-500">24h</span>
          </div>
        )}

        {showVolume && price.volume24h && (
          <div className="mt-2 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Volume 24h:</span>
              <span className="font-medium">${price.volume24h.toLocaleString()}</span>
            </div>
            {price.marketCap && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Market Cap:</span>
                <span className="font-medium">${price.marketCap.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MultiTickerProps {
  symbols: string[];
  className?: string;
}

export function MultiTicker({ symbols, className }: MultiTickerProps) {
  const { prices, isLoading, hasRealtimeData } = usePrices(symbols);

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
        {symbols.map(symbol => (
          <div key={symbol} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Market Prices</h3>
        <Badge variant={hasRealtimeData ? "default" : "outline"}>
          {hasRealtimeData ? (
            <>
              <Wifi className="h-3 w-3 mr-1" />
              Live Data
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 mr-1" />
              Cached
            </>
          )}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {prices.map(price => (
          <Card key={price.symbol}>
            <CardContent className="p-3">
              <div className="text-center">
                <div className="font-semibold text-sm mb-1">{price.symbol}</div>
                <div className="text-lg font-bold">${price.price.toFixed(4)}</div>
                <div className={cn(
                  "text-xs flex items-center justify-center mt-1",
                  price.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {price.change24h >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(price.change24h).toFixed(2)}%
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';

export function PriceAlert({ 
  symbol, 
  targetPrice, 
  condition = 'above' 
}: { 
  symbol: string; 
  targetPrice: number; 
  condition: 'above' | 'below';
}) {
  const { price } = usePrice(symbol);
  const [alerted, setAlerted] = useState(false);

  useEffect(() => {
    if (!price || alerted) return;

    const shouldAlert = condition === 'above' 
      ? price.price >= targetPrice 
      : price.price <= targetPrice;

    if (shouldAlert) {
      setAlerted(true);
      // In a real app, this would trigger a notification
      console.log(`Price alert: ${symbol} is ${condition} $${targetPrice}`);
    }
  }, [price, targetPrice, condition, symbol, alerted]);

  return null; // This is a utility component, no UI
}