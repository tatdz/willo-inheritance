import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertVaultSchema, insertAssetSchema, insertBeneficiarySchema, 
  insertGuardianSchema, insertDocumentSchema, insertClaimSchema,
  insertSubscriptionSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user ID for demo (in real app this would come from authentication)
  const MOCK_USER_ID = 1;
  
  // Demo user is initialized in MemStorage constructor

  // Vaults
  app.get("/api/vaults", async (req, res) => {
    try {
      const vaults = await storage.getVaultsByUserId(MOCK_USER_ID);
      res.json(vaults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vaults" });
    }
  });

  app.post("/api/vaults", async (req, res) => {
    try {
      const vaultData = insertVaultSchema.parse({ ...req.body, userId: MOCK_USER_ID });
      const vault = await storage.createVault(vaultData);
      
      // Add a small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 100));
      
      res.json(vault);
    } catch (error) {
      res.status(400).json({ message: "Invalid vault data", error });
    }
  });

  app.get("/api/vaults/:id", async (req, res) => {
    try {
      const vault = await storage.getVault(parseInt(req.params.id));
      if (!vault) {
        return res.status(404).json({ message: "Vault not found" });
      }
      res.json(vault);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vault" });
    }
  });

  app.patch("/api/vaults/:id", async (req, res) => {
    try {
      const vault = await storage.updateVault(parseInt(req.params.id), req.body);
      if (!vault) {
        return res.status(404).json({ message: "Vault not found" });
      }
      res.json(vault);
    } catch (error) {
      res.status(500).json({ message: "Failed to update vault" });
    }
  });

  app.delete("/api/vaults/:id", async (req, res) => {
    try {
      const success = await storage.deleteVault(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Vault not found" });
      }
      res.json({ message: "Vault deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vault" });
    }
  });

  app.put("/api/vaults/:id", async (req, res) => {
    try {
      const vaultId = parseInt(req.params.id);
      const vault = await storage.updateVault(vaultId, req.body);
      if (!vault) {
        return res.status(404).json({ message: "Vault not found" });
      }
      res.json(vault);
    } catch (error) {
      res.status(500).json({ message: "Failed to update vault" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard-stats", async (req, res) => {
    try {
      const vaults = await storage.getVaultsByUserId(MOCK_USER_ID);
      let totalAssets = 0;
      let totalBeneficiaries = 0;
      let totalAssetValue = 0;

      for (const vault of vaults) {
        const assets = await storage.getAssetsByVaultId(vault.id);
        const beneficiaries = await storage.getBeneficiariesByVaultId(vault.id);
        
        totalAssets += assets.length;
        totalBeneficiaries += beneficiaries.length;
        
        // Calculate asset values
        assets.forEach((asset) => {
          if (asset.type === 'crypto' && asset.amount) {
            const amount = parseFloat(asset.amount);
            if (asset.name === 'CHZ') {
              totalAssetValue += amount * 0.7; // $0.70 per CHZ
            } else if (asset.name === 'BAR') {
              totalAssetValue += amount * 2.5; // $2.50 per BAR token
            } else {
              totalAssetValue += amount * 1; // Default $1 for other tokens
            }
          } else if (asset.type === 'nft') {
            totalAssetValue += 500; // $500 estimated value per NFT
          }
        });
      }

      res.json({
        activeVaults: vaults.filter(v => v.status === 'active').length,
        totalAssets: Math.round(totalAssetValue),
        beneficiaries: totalBeneficiaries,
        assetsCount: totalAssets,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Assets
  app.get("/api/vaults/:vaultId/assets", async (req, res) => {
    try {
      const assets = await storage.getAssetsByVaultId(parseInt(req.params.vaultId));
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.post("/api/vaults/:vaultId/assets", async (req, res) => {
    try {
      const assetData = insertAssetSchema.parse({ 
        ...req.body, 
        vaultId: parseInt(req.params.vaultId) 
      });
      const asset = await storage.createAsset(assetData);
      res.json(asset);
    } catch (error) {
      res.status(400).json({ message: "Invalid asset data", error });
    }
  });

  app.patch("/api/assets/:id", async (req, res) => {
    try {
      const asset = await storage.updateAsset(parseInt(req.params.id), req.body);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Failed to update asset" });
    }
  });

  app.delete("/api/assets/:id", async (req, res) => {
    try {
      const success = await storage.deleteAsset(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json({ message: "Asset deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  app.delete("/api/assets/:id", async (req, res) => {
    try {
      const success = await storage.deleteAsset(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json({ message: "Asset deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Beneficiaries
  app.get("/api/vaults/:vaultId/beneficiaries", async (req, res) => {
    try {
      const beneficiaries = await storage.getBeneficiariesByVaultId(parseInt(req.params.vaultId));
      res.json(beneficiaries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch beneficiaries" });
    }
  });

  app.post("/api/vaults/:vaultId/beneficiaries", async (req, res) => {
    try {
      const beneficiaryData = insertBeneficiarySchema.parse({ 
        ...req.body, 
        vaultId: parseInt(req.params.vaultId) 
      });
      const beneficiary = await storage.createBeneficiary(beneficiaryData);
      res.json(beneficiary);
    } catch (error) {
      res.status(400).json({ message: "Invalid beneficiary data", error });
    }
  });

  app.patch("/api/beneficiaries/:id", async (req, res) => {
    try {
      const beneficiary = await storage.updateBeneficiary(parseInt(req.params.id), req.body);
      if (!beneficiary) {
        return res.status(404).json({ message: "Beneficiary not found" });
      }
      res.json(beneficiary);
    } catch (error) {
      res.status(500).json({ message: "Failed to update beneficiary" });
    }
  });

  app.delete("/api/beneficiaries/:id", async (req, res) => {
    try {
      const success = await storage.deleteBeneficiary(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Beneficiary not found" });
      }
      res.json({ message: "Beneficiary deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete beneficiary" });
    }
  });

  app.delete("/api/beneficiaries/:id", async (req, res) => {
    try {
      const success = await storage.deleteBeneficiary(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Beneficiary not found" });
      }
      res.json({ message: "Beneficiary deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete beneficiary" });
    }
  });

  // Guardians
  app.get("/api/vaults/:vaultId/guardians", async (req, res) => {
    try {
      const guardians = await storage.getGuardiansByVaultId(parseInt(req.params.vaultId));
      res.json(guardians);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guardians" });
    }
  });

  app.post("/api/vaults/:vaultId/guardians", async (req, res) => {
    try {
      const guardianData = insertGuardianSchema.parse({ 
        ...req.body, 
        vaultId: parseInt(req.params.vaultId) 
      });
      const guardian = await storage.createGuardian(guardianData);
      res.json(guardian);
    } catch (error) {
      res.status(400).json({ message: "Invalid guardian data", error });
    }
  });

  // Documents
  app.get("/api/vaults/:vaultId/documents", async (req, res) => {
    try {
      const documents = await storage.getDocumentsByVaultId(parseInt(req.params.vaultId));
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/vaults/:vaultId/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse({ 
        ...req.body, 
        vaultId: parseInt(req.params.vaultId) 
      });
      const document = await storage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      res.status(400).json({ message: "Invalid document data", error });
    }
  });

  // Claims
  app.get("/api/claims", async (req, res) => {
    try {
      const beneficiaryAddress = req.query.beneficiaryAddress as string;
      if (!beneficiaryAddress) {
        return res.status(400).json({ message: "Beneficiary address is required" });
      }
      
      // For demo purposes, create and store claims for demo wallet
      if (beneficiaryAddress === '0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e') {
        const vaults = await storage.getVaultsByUserId(MOCK_USER_ID);
        if (vaults.length > 0) {
          const vault = vaults[0];
          const assets = await storage.getAssetsByVaultId(vault.id);
          const beneficiaries = await storage.getBeneficiariesByVaultId(vault.id);
          
          // Check if claim already exists
          let existingClaims = await storage.getClaimsByVaultId(vault.id);
          
          if (existingClaims.length === 0 && beneficiaries.length > 0) {
            // Create a claim for the first beneficiary
            const newClaim = await storage.createClaim({
              vaultId: vault.id,
              beneficiaryId: beneficiaries[0].id,
              status: 'approved',
              triggerType: 'inactivity'
            });
            existingClaims = [newClaim];
          }
          
          // Transform claims to include additional data
          const claimsWithDetails = existingClaims.map(claim => ({
            ...claim,
            vaultName: vault.name,
            ownerName: 'Demo Vault Owner',
            assets: assets.map(asset => ({
              type: asset.type,
              name: asset.name,
              amount: asset.metadata?.amount || '1.0',
              usdValue: asset.metadata?.usdValue || '$100'
            }))
          }));
          
          return res.json(claimsWithDetails);
        }
      }
      
      const claims = await storage.getClaimsByBeneficiaryAddress(beneficiaryAddress);
      res.json(claims);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch claims" });
    }
  });

  app.post("/api/claims", async (req, res) => {
    try {
      const claimData = insertClaimSchema.parse(req.body);
      const claim = await storage.createClaim(claimData);
      res.json(claim);
    } catch (error) {
      res.status(400).json({ message: "Invalid claim data", error });
    }
  });

  app.patch("/api/claims/:id", async (req, res) => {
    try {
      const claim = await storage.updateClaim(parseInt(req.params.id), req.body);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      res.json(claim);
    } catch (error) {
      res.status(500).json({ message: "Failed to update claim" });
    }
  });

  // Subscriptions
  app.get("/api/subscription", async (req, res) => {
    try {
      const subscription = await storage.getSubscriptionByUserId(MOCK_USER_ID);
      res.json(subscription || { plan: "basic", status: "active" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.post("/api/subscription", async (req, res) => {
    try {
      const subscriptionData = insertSubscriptionSchema.parse({ 
        ...req.body, 
        userId: MOCK_USER_ID 
      });
      const subscription = await storage.createSubscription(subscriptionData);
      res.json(subscription);
    } catch (error) {
      res.status(400).json({ message: "Invalid subscription data", error });
    }
  });

  // Mock file upload endpoint for IPFS simulation
  app.post("/api/upload", async (req, res) => {
    try {
      // Simulate IPFS upload
      const mockIpfsHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      setTimeout(() => {
        res.json({ 
          ipfsHash: mockIpfsHash,
          fileSize: Math.floor(Math.random() * 1000000) + 100000,
          message: "File uploaded successfully to IPFS"
        });
      }, 2000); // Simulate upload delay
    } catch (error) {
      res.status(500).json({ message: "Upload failed" });
    }
  });

  // Mock blockchain transaction endpoints
  app.post("/api/blockchain/create-vault", async (req, res) => {
    try {
      // Simulate blockchain transaction
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      
      setTimeout(() => {
        res.json({ 
          transactionHash: mockTxHash,
          status: "confirmed",
          gasUsed: "21000",
          fee: "0.001 CHZ"
        });
      }, 3000);
    } catch (error) {
      res.status(500).json({ message: "Transaction failed" });
    }
  });

  app.post("/api/blockchain/claim-assets", async (req, res) => {
    try {
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      
      setTimeout(() => {
        res.json({ 
          transactionHash: mockTxHash,
          status: "confirmed",
          gasUsed: "45000",
          fee: "0.002 CHZ"
        });
      }, 4000);
    } catch (error) {
      res.status(500).json({ message: "Claim transaction failed" });
    }
  });

  // Subscription endpoints
  app.get("/api/subscription", async (req, res) => {
    try {
      // For demo purposes, return mock subscription data
      const userId = 1; // Mock user ID
      const subscription = await storage.getSubscriptionByUserId(userId);
      
      if (!subscription) {
        return res.json({ plan: 'basic', status: 'active' });
      }
      
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.post("/api/subscription", async (req, res) => {
    try {
      const { plan, status, transactionHash, expiresAt } = req.body;
      
      if (!plan || !status) {
        return res.status(400).json({ message: "Plan and status are required" });
      }

      const userId = 1; // Mock user ID
      
      // Check if subscription exists
      const existingSubscription = await storage.getSubscriptionByUserId(userId);
      
      let subscription;
      if (existingSubscription) {
        subscription = await storage.updateSubscription(existingSubscription.id, {
          plan,
          status,
          transactionHash,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined
        });
      } else {
        subscription = await storage.createSubscription({
          userId,
          plan,
          status,
          transactionHash,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined
        });
      }

      res.json(subscription);
    } catch (error) {
      console.error('Subscription error:', error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Reset endpoint for demo purposes
  app.post("/api/reset", async (req, res) => {
    try {
      storage.reset();
      res.json({ message: "Demo data reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset demo data" });
    }
  });

  // Price API endpoints for testing
  app.get("/api/prices/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      
      // Mock price data for development
      const mockPrices: Record<string, any> = {
        'CHZ': { price: 0.125, change24h: 2.34, volume24h: 15420000, marketCap: 850000000 },
        'BAR': { price: 2.45, change24h: -1.23, volume24h: 2340000, marketCap: 245000000 },
        'PSG': { price: 1.85, change24h: 3.45, volume24h: 1980000, marketCap: 185000000 },
        'JUV': { price: 1.92, change24h: 0.78, volume24h: 1650000, marketCap: 192000000 },
        'ACM': { price: 1.78, change24h: -0.45, volume24h: 1230000, marketCap: 178000000 }
      };

      const priceData = mockPrices[symbol.toUpperCase()];
      if (!priceData) {
        return res.status(404).json({ message: "Token not found" });
      }

      res.json({
        symbol: symbol.toUpperCase(),
        ...priceData,
        lastUpdated: Date.now()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch price data" });
    }
  });

  app.get("/api/prices", async (req, res) => {
    try {
      const symbols = req.query.symbols as string;
      if (!symbols) {
        return res.status(400).json({ message: "Symbols parameter required" });
      }

      const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
      const mockPrices: Record<string, any> = {
        'CHZ': { price: 0.125, change24h: 2.34, volume24h: 15420000, marketCap: 850000000 },
        'BAR': { price: 2.45, change24h: -1.23, volume24h: 2340000, marketCap: 245000000 },
        'PSG': { price: 1.85, change24h: 3.45, volume24h: 1980000, marketCap: 185000000 },
        'JUV': { price: 1.92, change24h: 0.78, volume24h: 1650000, marketCap: 192000000 },
        'ACM': { price: 1.78, change24h: -0.45, volume24h: 1230000, marketCap: 178000000 }
      };

      const results = symbolList.map(symbol => {
        const priceData = mockPrices[symbol];
        return priceData ? {
          symbol,
          ...priceData,
          lastUpdated: Date.now()
        } : null;
      }).filter(Boolean);

      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch price data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
