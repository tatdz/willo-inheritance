// Real-time price oracle for CHZ and fan tokens
interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: number;
  marketCap?: number;
  volume24h?: number;
}

interface PriceCache {
  [symbol: string]: {
    data: PriceData;
    timestamp: number;
  };
}

class PriceOracle {
  private cache: PriceCache = {};
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private subscribers: Map<string, Set<(price: PriceData) => void>> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  // CoinGecko API endpoints
  private readonly COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
  private readonly CHILIZ_ID = 'chiliz';
  
  // Fan token CoinGecko IDs
  private readonly TOKEN_IDS = {
    'CHZ': 'chiliz',
    'BAR': 'fc-barcelona-fan-token',
    'PSG': 'paris-saint-germain-fan-token',
    'JUV': 'juventus-fan-token',
    'ACM': 'ac-milan-fan-token',
    'ATM': 'atletico-madrid',
    'ASR': 'as-roma-fan-token',
    'GAL': 'galatasaray-fan-token'
  };

  async getPrice(symbol: string): Promise<PriceData> {
    const cached = this.cache[symbol];
    const now = Date.now();

    // Return cached data if still valid
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const tokenId = this.TOKEN_IDS[symbol as keyof typeof this.TOKEN_IDS];
      if (!tokenId) {
        throw new Error(`Unsupported token: ${symbol}`);
      }

      // Try CoinGecko first, fallback to local API
      let response: Response;
      try {
        response = await fetch(
          `${this.COINGECKO_BASE}/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
        );
      } catch (error) {
        // Fallback to local API for development
        response = await fetch(`/api/prices/${symbol}`);
      }

      if (!response.ok) {
        throw new Error(`Price API error: ${response.status}`);
      }

      const data = await response.json();
      const tokenData = data[tokenId];

      if (!tokenData) {
        throw new Error(`No price data for ${symbol}`);
      }

      const priceData: PriceData = {
        symbol,
        price: tokenData.usd,
        change24h: tokenData.usd_24h_change || 0,
        lastUpdated: now,
        marketCap: tokenData.usd_market_cap,
        volume24h: tokenData.usd_24h_vol
      };

      // Cache the result
      this.cache[symbol] = {
        data: priceData,
        timestamp: now
      };

      // Notify subscribers
      this.notifySubscribers(symbol, priceData);

      return priceData;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      
      // Return cached data if available, even if expired
      if (cached) {
        return cached.data;
      }

      // Fallback prices for development
      return this.getFallbackPrice(symbol);
    }
  }

  async getPrices(symbols: string[]): Promise<PriceData[]> {
    const promises = symbols.map(symbol => this.getPrice(symbol));
    return Promise.all(promises);
  }

  async getPortfolioValue(assets: Array<{ symbol: string; amount: string }>): Promise<{
    totalValue: number;
    breakdown: Array<{ symbol: string; amount: string; price: number; value: number; change24h: number }>;
    totalChange24h: number;
  }> {
    const symbols = [...new Set(assets.map(asset => asset.symbol))];
    const prices = await this.getPrices(symbols);
    const priceMap = new Map(prices.map(p => [p.symbol, p]));

    let totalValue = 0;
    let totalValue24hAgo = 0;
    const breakdown = assets.map(asset => {
      const price = priceMap.get(asset.symbol);
      if (!price) {
        return {
          symbol: asset.symbol,
          amount: asset.amount,
          price: 0,
          value: 0,
          change24h: 0
        };
      }

      const amount = parseFloat(asset.amount);
      const currentValue = amount * price.price;
      const price24hAgo = price.price / (1 + price.change24h / 100);
      const value24hAgo = amount * price24hAgo;

      totalValue += currentValue;
      totalValue24hAgo += value24hAgo;

      return {
        symbol: asset.symbol,
        amount: asset.amount,
        price: price.price,
        value: currentValue,
        change24h: price.change24h
      };
    });

    const totalChange24h = totalValue24hAgo > 0 ? 
      ((totalValue - totalValue24hAgo) / totalValue24hAgo) * 100 : 0;

    return {
      totalValue,
      breakdown,
      totalChange24h
    };
  }

  subscribe(symbol: string, callback: (price: PriceData) => void): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol)!.add(callback);

    // Start polling for this symbol if not already started
    if (!this.intervals.has(symbol)) {
      const interval = setInterval(() => {
        this.getPrice(symbol);
      }, this.CACHE_DURATION);
      this.intervals.set(symbol, interval);
    }

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(symbol);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          // Stop polling if no more subscribers
          const interval = this.intervals.get(symbol);
          if (interval) {
            clearInterval(interval);
            this.intervals.delete(symbol);
          }
          this.subscribers.delete(symbol);
        }
      }
    };
  }

  private notifySubscribers(symbol: string, priceData: PriceData) {
    const subscribers = this.subscribers.get(symbol);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(priceData);
        } catch (error) {
          console.error('Error in price subscriber callback:', error);
        }
      });
    }
  }

  private getFallbackPrice(symbol: string): PriceData {
    const fallbackPrices: { [key: string]: number } = {
      'CHZ': 0.125,
      'BAR': 2.45,
      'PSG': 1.85,
      'JUV': 1.92,
      'ACM': 1.78,
      'ATM': 2.12,
      'ASR': 1.65,
      'GAL': 1.58
    };

    return {
      symbol,
      price: fallbackPrices[symbol] || 0,
      change24h: (Math.random() - 0.5) * 10, // Random change for demo
      lastUpdated: Date.now()
    };
  }

  // Get CHZ equivalent value
  async convertToCHZ(symbol: string, amount: number): Promise<number> {
    if (symbol === 'CHZ') return amount;

    const [tokenPrice, chzPrice] = await Promise.all([
      this.getPrice(symbol),
      this.getPrice('CHZ')
    ]);

    return (amount * tokenPrice.price) / chzPrice.price;
  }

  // Get USD value
  async convertToUSD(symbol: string, amount: number): Promise<number> {
    const price = await this.getPrice(symbol);
    return amount * price.price;
  }

  // Clear all caches and stop all intervals
  destroy() {
    this.cache = {};
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.subscribers.clear();
  }
}

export const priceOracle = new PriceOracle();
export type { PriceData };