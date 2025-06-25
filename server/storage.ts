import { 
  users, vaults, assets, beneficiaries, guardians, documents, claims, subscriptions,
  type User, type InsertUser, type Vault, type InsertVault,
  type Asset, type InsertAsset, type Beneficiary, type InsertBeneficiary,
  type Guardian, type InsertGuardian, type Document, type InsertDocument,
  type Claim, type InsertClaim, type Subscription, type InsertSubscription
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Vaults
  getVaultsByUserId(userId: number): Promise<Vault[]>;
  getVault(id: number): Promise<Vault | undefined>;
  createVault(vault: InsertVault): Promise<Vault>;
  updateVault(id: number, vault: Partial<InsertVault>): Promise<Vault | undefined>;
  deleteVault(id: number): Promise<boolean>;

  // Assets
  getAssetsByVaultId(vaultId: number): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: Partial<InsertAsset>): Promise<Asset | undefined>;
  deleteAsset(id: number): Promise<boolean>;

  // Beneficiaries
  getBeneficiariesByVaultId(vaultId: number): Promise<Beneficiary[]>;
  createBeneficiary(beneficiary: InsertBeneficiary): Promise<Beneficiary>;
  updateBeneficiary(id: number, beneficiary: Partial<InsertBeneficiary>): Promise<Beneficiary | undefined>;
  deleteBeneficiary(id: number): Promise<boolean>;

  // Guardians
  getGuardiansByVaultId(vaultId: number): Promise<Guardian[]>;
  createGuardian(guardian: InsertGuardian): Promise<Guardian>;
  updateGuardian(id: number, guardian: Partial<InsertGuardian>): Promise<Guardian | undefined>;
  deleteGuardian(id: number): Promise<boolean>;

  // Documents
  getDocumentsByVaultId(vaultId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;

  // Claims
  getClaimsByVaultId(vaultId: number): Promise<Claim[]>;
  getClaimsByBeneficiaryAddress(address: string): Promise<Claim[]>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaim(id: number, claim: Partial<InsertClaim>): Promise<Claim | undefined>;

  // Subscriptions
  getSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vaults: Map<number, Vault>;
  private assets: Map<number, Asset>;
  private beneficiaries: Map<number, Beneficiary>;
  private guardians: Map<number, Guardian>;
  private documents: Map<number, Document>;
  private claims: Map<number, Claim>;
  private subscriptions: Map<number, Subscription>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.vaults = new Map();
    this.assets = new Map();
    this.beneficiaries = new Map();
    this.guardians = new Map();
    this.documents = new Map();
    this.claims = new Map();
    this.subscriptions = new Map();
    this.currentId = 1;
    
    // Initialize with demo user to ensure persistence
    this.users.set(1, {
      id: 1,
      username: 'demo_user',
      password: 'demo_password'
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Vaults
  async getVaultsByUserId(userId: number): Promise<Vault[]> {
    return Array.from(this.vaults.values()).filter(vault => vault.userId === userId);
  }

  async getVault(id: number): Promise<Vault | undefined> {
    return this.vaults.get(id);
  }

  async createVault(insertVault: InsertVault): Promise<Vault> {
    const id = this.currentId++;
    const vault: Vault = { 
      ...insertVault, 
      id,
      description: insertVault.description || null,
      inactivityPeriod: insertVault.inactivityPeriod || 180,
      guardianThreshold: insertVault.guardianThreshold || 2,
      status: insertVault.status || 'active',
      createdAt: new Date()
    };
    this.vaults.set(id, vault);
    return vault;
  }

  async updateVault(id: number, vault: Partial<InsertVault>): Promise<Vault | undefined> {
    const existing = this.vaults.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...vault };
    this.vaults.set(id, updated);
    return updated;
  }

  async deleteVault(id: number): Promise<boolean> {
    const exists = this.vaults.has(id);
    if (!exists) return false;
    
    // Also remove associated assets, beneficiaries, guardians, documents, and claims
    Array.from(this.assets.entries()).forEach(([assetId, asset]) => {
      if (asset.vaultId === id) {
        this.assets.delete(assetId);
      }
    });
    
    Array.from(this.beneficiaries.entries()).forEach(([beneficiaryId, beneficiary]) => {
      if (beneficiary.vaultId === id) {
        this.beneficiaries.delete(beneficiaryId);
      }
    });
    
    Array.from(this.guardians.entries()).forEach(([guardianId, guardian]) => {
      if (guardian.vaultId === id) {
        this.guardians.delete(guardianId);
      }
    });
    
    Array.from(this.documents.entries()).forEach(([documentId, document]) => {
      if (document.vaultId === id) {
        this.documents.delete(documentId);
      }
    });
    
    Array.from(this.claims.entries()).forEach(([claimId, claim]) => {
      if (claim.vaultId === id) {
        this.claims.delete(claimId);
      }
    });
    
    this.vaults.delete(id);
    return true;
  }

  // Assets
  async getAssetsByVaultId(vaultId: number): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(asset => asset.vaultId === vaultId);
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const id = this.currentId++;
    const asset: Asset = { 
      ...insertAsset, 
      id,
      metadata: insertAsset.metadata || null,
      walletAddress: insertAsset.walletAddress || null,
      amount: insertAsset.amount || null,
      contractAddress: insertAsset.contractAddress || null,
      tokenId: insertAsset.tokenId || null,
      notes: insertAsset.notes || null,
      createdAt: new Date()
    };
    this.assets.set(id, asset);
    return asset;
  }

  async updateAsset(id: number, asset: Partial<InsertAsset>): Promise<Asset | undefined> {
    const existing = this.assets.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...asset };
    this.assets.set(id, updated);
    return updated;
  }

  async deleteAsset(id: number): Promise<boolean> {
    return this.assets.delete(id);
  }

  // Beneficiaries
  async getBeneficiariesByVaultId(vaultId: number): Promise<Beneficiary[]> {
    return Array.from(this.beneficiaries.values()).filter(beneficiary => beneficiary.vaultId === vaultId);
  }

  async createBeneficiary(insertBeneficiary: InsertBeneficiary): Promise<Beneficiary> {
    const id = this.currentId++;
    const beneficiary: Beneficiary = { 
      ...insertBeneficiary, 
      id,
      relationship: insertBeneficiary.relationship || null,
      allocation: insertBeneficiary.allocation || null,
      createdAt: new Date()
    };
    this.beneficiaries.set(id, beneficiary);
    return beneficiary;
  }

  async updateBeneficiary(id: number, beneficiary: Partial<InsertBeneficiary>): Promise<Beneficiary | undefined> {
    const existing = this.beneficiaries.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...beneficiary };
    this.beneficiaries.set(id, updated);
    return updated;
  }

  async deleteBeneficiary(id: number): Promise<boolean> {
    return this.beneficiaries.delete(id);
  }

  // Guardians
  async getGuardiansByVaultId(vaultId: number): Promise<Guardian[]> {
    return Array.from(this.guardians.values()).filter(guardian => guardian.vaultId === vaultId);
  }

  async createGuardian(insertGuardian: InsertGuardian): Promise<Guardian> {
    const id = this.currentId++;
    const guardian: Guardian = { 
      ...insertGuardian, 
      id,
      email: insertGuardian.email || null,
      createdAt: new Date()
    };
    this.guardians.set(id, guardian);
    return guardian;
  }

  async updateGuardian(id: number, guardian: Partial<InsertGuardian>): Promise<Guardian | undefined> {
    const existing = this.guardians.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...guardian };
    this.guardians.set(id, updated);
    return updated;
  }

  async deleteGuardian(id: number): Promise<boolean> {
    return this.guardians.delete(id);
  }

  // Documents
  async getDocumentsByVaultId(vaultId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(document => document.vaultId === vaultId);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentId++;
    const document: Document = { 
      ...insertDocument, 
      id,
      description: insertDocument.description || null,
      fileSize: insertDocument.fileSize || null,
      mimeType: insertDocument.mimeType || null,
      createdAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Claims
  async getClaimsByVaultId(vaultId: number): Promise<Claim[]> {
    return Array.from(this.claims.values()).filter(claim => claim.vaultId === vaultId);
  }

  async getClaimsByBeneficiaryAddress(address: string): Promise<Claim[]> {
    const beneficiariesByAddress = Array.from(this.beneficiaries.values())
      .filter(b => b.walletAddress.toLowerCase() === address.toLowerCase());
    
    return Array.from(this.claims.values())
      .filter(claim => beneficiariesByAddress.some(b => b.id === claim.beneficiaryId));
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const id = this.currentId++;
    const claim: Claim = { 
      ...insertClaim, 
      id,
      status: insertClaim.status || 'pending',
      guardianApprovals: insertClaim.guardianApprovals || 0,
      createdAt: new Date(),
      claimedAt: null
    };
    this.claims.set(id, claim);
    return claim;
  }

  async updateClaim(id: number, claim: Partial<InsertClaim>): Promise<Claim | undefined> {
    const existing = this.claims.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...claim };
    this.claims.set(id, updated);
    return updated;
  }

  // Subscriptions
  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(sub => sub.userId === userId);
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentId++;
    const subscription: Subscription = { 
      ...insertSubscription, 
      id,
      status: insertSubscription.status || 'active',
      expiresAt: insertSubscription.expiresAt || null,
      createdAt: new Date()
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const existing = this.subscriptions.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...subscription };
    this.subscriptions.set(id, updated);
    return updated;
  }

  // Reset all data for demo purposes
  reset() {
    this.users.clear();
    this.vaults.clear();
    this.assets.clear();
    this.beneficiaries.clear();
    this.guardians.clear();
    this.documents.clear();
    this.claims.clear();
    this.subscriptions.clear();
    this.currentId = 1;
  }
}

export const storage = new MemStorage();


