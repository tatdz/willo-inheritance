// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title WilloVault
 * @dev Digital inheritance vault for sports fan tokens and digital assets on Chiliz Chain
 */
contract WilloVault is ReentrancyGuard, Ownable {
    struct Vault {
        address owner;
        string name;
        uint256 inactivityPeriod; // in seconds
        uint256 lastActivity;
        bool isActive;
        address[] beneficiaries;
        uint256[] beneficiaryShares; // percentages out of 10000 (100.00%)
        address[] guardians;
        uint256 requiredGuardianApprovals;
        bool claimInitiated;
        uint256 claimInitiatedAt;
        uint256 totalValue; // estimated total value in CHZ
    }

    struct Asset {
        address tokenContract;
        uint256 tokenId; // 0 for ERC20 tokens
        uint256 amount;
        string assetType; // "ERC20", "ERC721", "FAN_TOKEN"
        string metadata;
    }

    struct Subscription {
        address user;
        uint256 plan; // 0=basic, 1=pro, 2=enterprise
        uint256 expiresAt;
        bool isActive;
    }

    mapping(uint256 => Vault) public vaults;
    mapping(uint256 => Asset[]) public vaultAssets;
    mapping(uint256 => mapping(address => bool)) public guardianApprovals;
    mapping(address => Subscription) public subscriptions;
    mapping(address => uint256[]) public userVaults;
    
    uint256 public nextVaultId = 1;
    uint256 public platformFeePercentage = 250; // 2.5%
    address public feeCollector;
    
    // Subscription pricing in CHZ (18 decimals)
    uint256 public constant PRO_PRICE = 50 * 10**18; // 50 CHZ
    uint256 public constant ENTERPRISE_PRICE = 150 * 10**18; // 150 CHZ
    
    event VaultCreated(uint256 indexed vaultId, address indexed owner, string name);
    event AssetAdded(uint256 indexed vaultId, address tokenContract, uint256 amount);
    event BeneficiaryAdded(uint256 indexed vaultId, address beneficiary, uint256 share);
    event ClaimInitiated(uint256 indexed vaultId, address indexed beneficiary);
    event ClaimExecuted(uint256 indexed vaultId, address indexed beneficiary, uint256 amount);
    event SubscriptionPurchased(address indexed user, uint256 plan, uint256 expiresAt);
    event ActivityRecorded(uint256 indexed vaultId, address indexed user);

    constructor() {
        feeCollector = msg.sender;
    }

    modifier onlyVaultOwner(uint256 vaultId) {
        require(vaults[vaultId].owner == msg.sender, "Not vault owner");
        _;
    }

    modifier vaultExists(uint256 vaultId) {
        require(vaults[vaultId].owner != address(0), "Vault does not exist");
        _;
    }

    /**
     * @dev Create a new inheritance vault
     */
    function createVault(
        string memory name,
        uint256 inactivityPeriod,
        address[] memory beneficiaries,
        uint256[] memory shares,
        address[] memory guardians,
        uint256 requiredApprovals
    ) external payable nonReentrant returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(beneficiaries.length == shares.length, "Mismatched arrays");
        require(beneficiaries.length > 0, "No beneficiaries");
        require(guardians.length >= requiredApprovals, "Not enough guardians");
        require(inactivityPeriod >= 30 days, "Minimum 30 days inactivity");
        
        // Check subscription limits
        Subscription memory sub = subscriptions[msg.sender];
        uint256 userVaultCount = userVaults[msg.sender].length;
        
        if (sub.plan == 0) { // Basic plan
            require(userVaultCount == 0, "Basic plan: 1 vault limit");
        } else if (sub.plan == 1) { // Pro plan
            require(userVaultCount < 5, "Pro plan: 5 vault limit");
        }
        // Enterprise has no limit
        
        // Validate shares total 100%
        uint256 totalShares = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            totalShares += shares[i];
        }
        require(totalShares == 10000, "Shares must total 100%");

        uint256 vaultId = nextVaultId++;
        
        Vault storage vault = vaults[vaultId];
        vault.owner = msg.sender;
        vault.name = name;
        vault.inactivityPeriod = inactivityPeriod;
        vault.lastActivity = block.timestamp;
        vault.isActive = true;
        vault.beneficiaries = beneficiaries;
        vault.beneficiaryShares = shares;
        vault.guardians = guardians;
        vault.requiredGuardianApprovals = requiredApprovals;
        
        userVaults[msg.sender].push(vaultId);
        
        // Platform fee for vault creation
        if (msg.value > 0) {
            payable(feeCollector).transfer(msg.value);
        }
        
        emit VaultCreated(vaultId, msg.sender, name);
        return vaultId;
    }

    /**
     * @dev Add CHZ to vault
     */
    function addCHZ(uint256 vaultId) external payable onlyVaultOwner(vaultId) vaultExists(vaultId) {
        require(msg.value > 0, "Must send CHZ");
        
        Asset memory asset = Asset({
            tokenContract: address(0), // Native CHZ
            tokenId: 0,
            amount: msg.value,
            assetType: "CHZ",
            metadata: "Native CHZ token"
        });
        
        vaultAssets[vaultId].push(asset);
        vaults[vaultId].lastActivity = block.timestamp;
        vaults[vaultId].totalValue += msg.value;
        
        emit AssetAdded(vaultId, address(0), msg.value);
        emit ActivityRecorded(vaultId, msg.sender);
    }

    /**
     * @dev Add ERC20 fan tokens to vault
     */
    function addFanToken(
        uint256 vaultId,
        address tokenContract,
        uint256 amount,
        string memory metadata
    ) external onlyVaultOwner(vaultId) vaultExists(vaultId) {
        require(tokenContract != address(0), "Invalid token contract");
        require(amount > 0, "Amount must be positive");
        
        IERC20 token = IERC20(tokenContract);
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        Asset memory asset = Asset({
            tokenContract: tokenContract,
            tokenId: 0,
            amount: amount,
            assetType: "FAN_TOKEN",
            metadata: metadata
        });
        
        vaultAssets[vaultId].push(asset);
        vaults[vaultId].lastActivity = block.timestamp;
        
        emit AssetAdded(vaultId, tokenContract, amount);
        emit ActivityRecorded(vaultId, msg.sender);
    }

    /**
     * @dev Record user activity to reset inactivity timer
     */
    function recordActivity(uint256 vaultId) external onlyVaultOwner(vaultId) vaultExists(vaultId) {
        vaults[vaultId].lastActivity = block.timestamp;
        emit ActivityRecorded(vaultId, msg.sender);
    }

    /**
     * @dev Purchase subscription
     */
    function purchaseSubscription(uint256 plan) external payable nonReentrant {
        require(plan == 1 || plan == 2, "Invalid plan"); // 1=Pro, 2=Enterprise
        
        uint256 price = plan == 1 ? PRO_PRICE : ENTERPRISE_PRICE;
        require(msg.value >= price, "Insufficient payment");
        
        // Refund excess
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        // Transfer payment to fee collector
        payable(feeCollector).transfer(price);
        
        subscriptions[msg.sender] = Subscription({
            user: msg.sender,
            plan: plan,
            expiresAt: block.timestamp + 30 days,
            isActive: true
        });
        
        emit SubscriptionPurchased(msg.sender, plan, block.timestamp + 30 days);
    }

    /**
     * @dev Initiate claim process (can be called by beneficiaries)
     */
    function initiateClaim(uint256 vaultId) external vaultExists(vaultId) {
        Vault storage vault = vaults[vaultId];
        require(!vault.claimInitiated, "Claim already initiated");
        require(block.timestamp >= vault.lastActivity + vault.inactivityPeriod, "Inactivity period not met");
        
        // Check if caller is a beneficiary
        bool isBeneficiary = false;
        for (uint256 i = 0; i < vault.beneficiaries.length; i++) {
            if (vault.beneficiaries[i] == msg.sender) {
                isBeneficiary = true;
                break;
            }
        }
        require(isBeneficiary, "Not a beneficiary");
        
        vault.claimInitiated = true;
        vault.claimInitiatedAt = block.timestamp;
        
        emit ClaimInitiated(vaultId, msg.sender);
    }

    /**
     * @dev Guardian approval for claim
     */
    function approveClaimAsGuardian(uint256 vaultId) external vaultExists(vaultId) {
        Vault storage vault = vaults[vaultId];
        require(vault.claimInitiated, "No claim initiated");
        
        // Check if caller is a guardian
        bool isGuardian = false;
        for (uint256 i = 0; i < vault.guardians.length; i++) {
            if (vault.guardians[i] == msg.sender) {
                isGuardian = true;
                break;
            }
        }
        require(isGuardian, "Not a guardian");
        require(!guardianApprovals[vaultId][msg.sender], "Already approved");
        
        guardianApprovals[vaultId][msg.sender] = true;
    }

    /**
     * @dev Execute claim after guardian approvals
     */
    function executeClaim(uint256 vaultId) external vaultExists(vaultId) nonReentrant {
        Vault storage vault = vaults[vaultId];
        require(vault.claimInitiated, "No claim initiated");
        require(block.timestamp >= vault.claimInitiatedAt + 7 days, "Waiting period not complete");
        
        // Count guardian approvals
        uint256 approvals = 0;
        for (uint256 i = 0; i < vault.guardians.length; i++) {
            if (guardianApprovals[vaultId][vault.guardians[i]]) {
                approvals++;
            }
        }
        require(approvals >= vault.requiredGuardianApprovals, "Insufficient guardian approvals");
        
        // Check if caller is a beneficiary
        uint256 beneficiaryIndex = type(uint256).max;
        for (uint256 i = 0; i < vault.beneficiaries.length; i++) {
            if (vault.beneficiaries[i] == msg.sender) {
                beneficiaryIndex = i;
                break;
            }
        }
        require(beneficiaryIndex != type(uint256).max, "Not a beneficiary");
        
        // Calculate beneficiary's share
        uint256 beneficiaryShare = vault.beneficiaryShares[beneficiaryIndex];
        
        // Transfer assets
        Asset[] storage assets = vaultAssets[vaultId];
        for (uint256 i = 0; i < assets.length; i++) {
            Asset storage asset = assets[i];
            uint256 amount = (asset.amount * beneficiaryShare) / 10000;
            
            if (asset.tokenContract == address(0)) {
                // CHZ transfer
                if (amount > 0) {
                    uint256 fee = (amount * platformFeePercentage) / 10000;
                    uint256 netAmount = amount - fee;
                    
                    payable(msg.sender).transfer(netAmount);
                    payable(feeCollector).transfer(fee);
                }
            } else {
                // ERC20 token transfer
                if (amount > 0) {
                    IERC20 token = IERC20(asset.tokenContract);
                    require(token.transfer(msg.sender, amount), "Token transfer failed");
                }
            }
            
            asset.amount -= amount;
        }
        
        emit ClaimExecuted(vaultId, msg.sender, beneficiaryShare);
    }

    /**
     * @dev Get vault details
     */
    function getVault(uint256 vaultId) external view returns (
        address owner,
        string memory name,
        uint256 inactivityPeriod,
        uint256 lastActivity,
        bool isActive,
        bool claimInitiated,
        uint256 totalValue
    ) {
        Vault storage vault = vaults[vaultId];
        return (
            vault.owner,
            vault.name,
            vault.inactivityPeriod,
            vault.lastActivity,
            vault.isActive,
            vault.claimInitiated,
            vault.totalValue
        );
    }

    /**
     * @dev Get vault assets
     */
    function getVaultAssets(uint256 vaultId) external view returns (Asset[] memory) {
        return vaultAssets[vaultId];
    }

    /**
     * @dev Get user's vaults
     */
    function getUserVaults(address user) external view returns (uint256[] memory) {
        return userVaults[user];
    }

    /**
     * @dev Check if inactivity period has passed
     */
    function isInactivityPeriodMet(uint256 vaultId) external view returns (bool) {
        Vault storage vault = vaults[vaultId];
        return block.timestamp >= vault.lastActivity + vault.inactivityPeriod;
    }

    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = newFee;
    }

    /**
     * @dev Update fee collector
     */
    function updateFeeCollector(address newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid address");
        feeCollector = newCollector;
    }

    /**
     * @dev Emergency pause for vault owner
     */
    function pauseVault(uint256 vaultId) external onlyVaultOwner(vaultId) {
        vaults[vaultId].isActive = false;
    }

    /**
     * @dev Unpause vault
     */
    function unpauseVault(uint256 vaultId) external onlyVaultOwner(vaultId) {
        vaults[vaultId].isActive = true;
        vaults[vaultId].lastActivity = block.timestamp; // Reset activity
    }
}