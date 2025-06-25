// React hooks for real-time price tracking
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { priceOracle, type PriceData } from '@/lib/price-oracle';

export function usePrice(symbol: string, enabled: boolean = true) {
  const [realtimePrice, setRealtimePrice] = useState<PriceData | null>(null);

  // Initial price fetch with caching
  const { data: initialPrice, isLoading, error } = useQuery({
    queryKey: ['price', symbol],
    queryFn: () => priceOracle.getPrice(symbol),
    enabled,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute as backup
  });

  // Real-time subscription
  useEffect(() => {
    if (!enabled || !symbol) return;

    const unsubscribe = priceOracle.subscribe(symbol, (priceData) => {
      setRealtimePrice(priceData);
    });

    return unsubscribe;
  }, [symbol, enabled]);

  // Use real-time price if available, otherwise fall back to initial fetch
  const currentPrice = realtimePrice || initialPrice;

  return {
    price: currentPrice,
    isLoading: isLoading && !currentPrice,
    error,
    isRealtime: !!realtimePrice
  };
}

export function usePrices(symbols: string[], enabled: boolean = true) {
  const queryClient = useQueryClient();
  const [realtimePrices, setRealtimePrices] = useState<Map<string, PriceData>>(new Map());

  // Initial prices fetch
  const { data: initialPrices, isLoading, error } = useQuery({
    queryKey: ['prices', symbols.sort()],
    queryFn: () => priceOracle.getPrices(symbols),
    enabled: enabled && symbols.length > 0,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Real-time subscriptions
  useEffect(() => {
    if (!enabled || symbols.length === 0) return;

    const unsubscribers = symbols.map(symbol => 
      priceOracle.subscribe(symbol, (priceData) => {
        setRealtimePrices(prev => new Map(prev.set(symbol, priceData)));
        
        // Update individual price queries
        queryClient.setQueryData(['price', symbol], priceData);
      })
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [symbols, enabled, queryClient]);

  // Merge real-time and initial data
  const currentPrices = symbols.map(symbol => {
    const realtimePrice = realtimePrices.get(symbol);
    const initialPrice = initialPrices?.find(p => p.symbol === symbol);
    return realtimePrice || initialPrice;
  }).filter(Boolean) as PriceData[];

  return {
    prices: currentPrices,
    isLoading: isLoading && currentPrices.length === 0,
    error,
    hasRealtimeData: realtimePrices.size > 0
  };
}

export function usePortfolioValue(
  assets: Array<{ symbol: string; amount: string }>,
  enabled: boolean = true
) {
  const queryClient = useQueryClient();
  const [portfolio, setPortfolio] = useState<{
    totalValue: number;
    breakdown: Array<{ symbol: string; amount: string; price: number; value: number; change24h: number }>;
    totalChange24h: number;
  } | null>(null);

  // Extract unique symbols
  const symbols = [...new Set(assets.map(asset => asset.symbol))];

  // Subscribe to price updates for all symbols
  const { prices } = usePrices(symbols, enabled);

  // Calculate portfolio value when prices change
  const calculatePortfolio = useCallback(async () => {
    if (!enabled || assets.length === 0) return;

    try {
      const portfolioData = await priceOracle.getPortfolioValue(assets);
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Failed to calculate portfolio value:', error);
    }
  }, [assets, enabled]);

  // Recalculate when assets or prices change
  useEffect(() => {
    calculatePortfolio();
  }, [calculatePortfolio, prices]);

  return {
    portfolio,
    isLoading: !portfolio && enabled,
    refresh: calculatePortfolio
  };
}

export function usePriceHistory(symbol: string, timeframe: '1h' | '24h' | '7d' = '24h') {
  // Note: This would require a more advanced API for historical data
  // For now, we'll return mock data structure
  const { data, isLoading, error } = useQuery({
    queryKey: ['price-history', symbol, timeframe],
    queryFn: async () => {
      // In a real implementation, this would fetch historical price data
      // For now, return mock data points
      const points = timeframe === '1h' ? 60 : timeframe === '24h' ? 24 : 7;
      const currentPrice = await priceOracle.getPrice(symbol);
      
      return Array.from({ length: points }, (_, i) => ({
        timestamp: Date.now() - (points - i) * (timeframe === '1h' ? 60000 : timeframe === '24h' ? 3600000 : 86400000),
        price: currentPrice.price * (0.95 + Math.random() * 0.1) // Simulated variance
      }));
    },
    enabled: !!symbol,
    staleTime: 300000, // 5 minutes
  });

  return {
    history: data || [],
    isLoading,
    error
  };
}

// Hook for currency conversion
export function useCurrencyConverter() {
  const convertToCHZ = useCallback(async (symbol: string, amount: number) => {
    return priceOracle.convertToCHZ(symbol, amount);
  }, []);

  const convertToUSD = useCallback(async (symbol: string, amount: number) => {
    return priceOracle.convertToUSD(symbol, amount);
  }, []);

  return {
    convertToCHZ,
    convertToUSD
  };
}