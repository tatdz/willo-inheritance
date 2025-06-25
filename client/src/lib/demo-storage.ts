// Demo storage utility for persisting data across sessions
interface DemoData {
  vaults: any[];
  assets: Record<number, any[]>;
  beneficiaries: Record<number, any[]>;
  stats: {
    activeVaults: number;
    totalAssets: number;
    beneficiaries: number;
    assetsCount: number;
  };
  timestamp: number;
}

const DEMO_STORAGE_KEY = 'willo_demo_data';
const DEMO_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e';

export const demoStorage = {
  save(data: Partial<DemoData>) {
    const existing = this.load();
    const updated = {
      ...existing,
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updated));
  },

  load(): DemoData {
    try {
      const stored = localStorage.getItem(DEMO_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Check if data is less than 24 hours old
        const isValid = Date.now() - data.timestamp < 24 * 60 * 60 * 1000;
        if (isValid) {
          return data;
        }
      }
    } catch (error) {
      console.log('Demo storage load error:', error);
    }
    
    return {
      vaults: [],
      assets: {},
      beneficiaries: {},
      stats: {
        activeVaults: 0,
        totalAssets: 0,
        beneficiaries: 0,
        assetsCount: 0,
      },
      timestamp: Date.now()
    };
  },

  clear() {
    localStorage.removeItem(DEMO_STORAGE_KEY);
  },

  isDemoWallet(address: string): boolean {
    return address === DEMO_WALLET_ADDRESS;
  },

  saveVault(vault: any) {
    const data = this.load();
    const existingIndex = data.vaults.findIndex(v => v.id === vault.id);
    if (existingIndex >= 0) {
      data.vaults[existingIndex] = vault;
    } else {
      data.vaults.push(vault);
    }
    this.save({ vaults: data.vaults });
  },

  saveAssets(vaultId: number, assets: any[]) {
    const data = this.load();
    data.assets[vaultId] = assets;
    this.save({ assets: data.assets });
  },

  saveBeneficiaries(vaultId: number, beneficiaries: any[]) {
    const data = this.load();
    data.beneficiaries[vaultId] = beneficiaries;
    this.save({ beneficiaries: data.beneficiaries });
  },

  getVaults(): any[] {
    return this.load().vaults;
  },

  getAssets(vaultId: number): any[] {
    return this.load().assets[vaultId] || [];
  },

  getBeneficiaries(vaultId: number): any[] {
    return this.load().beneficiaries[vaultId] || [];
  },

  saveStats(stats: any) {
    const data = this.load();
    data.stats = stats;
    this.save({ stats: data.stats });
  },

  getStats() {
    return this.load().stats;
  },

  updateStats() {
    const data = this.load();
    let totalAssetValue = 0;
    let totalAssets = 0;
    let totalBeneficiaries = 0;
    
    for (const vault of data.vaults) {
      const assets = data.assets[vault.id] || [];
      const beneficiaries = data.beneficiaries[vault.id] || [];
      
      totalAssets += assets.length;
      totalBeneficiaries += beneficiaries.length;
      
      assets.forEach(asset => {
        if (asset.metadata?.value) {
          totalAssetValue += parseFloat(asset.metadata.value);
        }
        // Add default values for known assets
        if (asset.name === 'CHZ' && asset.amount) {
          totalAssetValue += parseFloat(asset.amount) * 0.1; // $0.1 per CHZ
        }
        if (asset.name === 'BAR' && asset.amount) {
          totalAssetValue += parseFloat(asset.amount) * 2.5; // $2.5 per BAR
        }
      });
    }
    
    const stats = {
      activeVaults: data.vaults.length,
      totalAssets: Math.round(totalAssetValue),
      beneficiaries: totalBeneficiaries,
      assetsCount: totalAssets,
    };
    
    this.saveStats(stats);
    return stats;
  }
};