import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const vaults = pgTable("vaults", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  walletAddress: text("wallet_address").notNull(),
  inactivityPeriod: integer("inactivity_period").notNull().default(180),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  vaultId: integer("vault_id").notNull(),
  type: text("type").notNull(), // 'crypto', 'nft', 'defi', 'domain', 'digital'
  name: text("name").notNull(),
  amount: decimal("amount"),
  walletAddress: text("wallet_address"),
  contractAddress: text("contract_address"),
  tokenId: text("token_id"),
  metadata: json("metadata"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const beneficiaries = pgTable("beneficiaries", {
  id: serial("id").primaryKey(),
  vaultId: integer("vault_id").notNull(),
  name: text("name").notNull(),
  walletAddress: text("wallet_address").notNull(),
  relationship: text("relationship"),
  allocation: json("allocation"), // JSON object with asset allocations
  createdAt: timestamp("created_at").defaultNow(),
});

export const guardians = pgTable("guardians", {
  id: serial("id").primaryKey(),
  vaultId: integer("vault_id").notNull(),
  name: text("name").notNull(),
  walletAddress: text("wallet_address").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  vaultId: integer("vault_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  ipfsHash: text("ipfs_hash").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  vaultId: integer("vault_id").notNull(),
  beneficiaryId: integer("beneficiary_id").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'claimed'
  triggerType: text("trigger_type").notNull(),
  guardianApprovals: integer("guardian_approvals").default(0),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  plan: text("plan").notNull(), // 'basic', 'pro', 'enterprise'
  status: text("status").notNull().default("active"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertVaultSchema = createInsertSchema(vaults).omit({
  id: true,
  createdAt: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
});

export const insertBeneficiarySchema = createInsertSchema(beneficiaries).omit({
  id: true,
  createdAt: true,
});

export const insertGuardianSchema = createInsertSchema(guardians).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  createdAt: true,
  claimedAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertVault = z.infer<typeof insertVaultSchema>;
export type Vault = typeof vaults.$inferSelect;

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;

export type InsertBeneficiary = z.infer<typeof insertBeneficiarySchema>;
export type Beneficiary = typeof beneficiaries.$inferSelect;

export type InsertGuardian = z.infer<typeof insertGuardianSchema>;
export type Guardian = typeof guardians.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claims.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
