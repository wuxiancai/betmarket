// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BetMarket is Ownable, ReentrancyGuard {
    IERC20 public usdtToken;
    
    struct Bet {
        address user;
        uint256 amount;
        uint256 timestamp;
    }
    
    // Mapping from hash value (0-15 in hex) to bets
    mapping(bytes1 => Bet[]) public bets;
    // Mapping to track total amount bet on each hash value
    mapping(bytes1 => uint256) public tagTotalAmount;
    // Platform fee percentage (0.1% = 1)
    uint256 public constant PLATFORM_FEE = 1;
    uint256 public constant DENOMINATOR = 1000;
    
    event BetPlaced(address indexed user, bytes1 indexed hashValue, uint256 amount);
    event WinningsDistributed(bytes1 indexed hashValue, uint256 totalAmount);
    event FundsWithdrawn(address indexed user, uint256 amount);
    
    constructor(address _usdtToken) {
        usdtToken = IERC20(_usdtToken);
    }
    
    function placeBet(bytes1 hashValue, uint256 amount) external nonReentrant {
        require(uint8(hashValue) < 16, "Invalid hash value");
        require(amount > 0, "Amount must be greater than 0");
        require(
            usdtToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        bets[hashValue].push(Bet({
            user: msg.sender,
            amount: amount,
            timestamp: block.timestamp
        }));
        
        tagTotalAmount[hashValue] += amount;
        
        emit BetPlaced(msg.sender, hashValue, amount);
    }
    
    function distributePrizes(bytes1 winningHash) external onlyOwner nonReentrant {
        require(uint8(winningHash) < 16, "Invalid hash value");
        
        uint256 totalLostAmount = 0;
        // Calculate total lost amount
        for(uint8 i = 0; i < 16; i++) {
            bytes1 currentHash = bytes1(i);
            if(currentHash != winningHash) {
                totalLostAmount += tagTotalAmount[currentHash];
            }
        }
        
        uint256 winningPool = totalLostAmount * (DENOMINATOR - PLATFORM_FEE) / DENOMINATOR;
        uint256 platformFee = totalLostAmount - winningPool;
        
        // Distribute winnings
        if(tagTotalAmount[winningHash] > 0) {
            Bet[] memory winningBets = bets[winningHash];
            for(uint256 i = 0; i < winningBets.length; i++) {
                uint256 share = (winningBets[i].amount * winningPool) / tagTotalAmount[winningHash];
                uint256 totalWin = winningBets[i].amount + share;
                require(
                    usdtToken.transfer(winningBets[i].user, totalWin),
                    "Transfer failed"
                );
            }
        }
        
        // Transfer platform fee
        if(platformFee > 0) {
            require(
                usdtToken.transfer(owner(), platformFee),
                "Platform fee transfer failed"
            );
        }
        
        // Clear bet data
        for(uint8 i = 0; i < 16; i++) {
            bytes1 currentHash = bytes1(i);
            delete bets[currentHash];
            tagTotalAmount[currentHash] = 0;
        }
        
        emit WinningsDistributed(winningHash, winningPool);
    }
    
    function getTagBets(bytes1 hashValue) external view returns (Bet[] memory) {
        require(uint8(hashValue) < 16, "Invalid hash value");
        return bets[hashValue];
    }
    
    function getTagTotalAmount(bytes1 hashValue) external view returns (uint256) {
        require(uint8(hashValue) < 16, "Invalid hash value");
        return tagTotalAmount[hashValue];
    }
    
    // Emergency withdraw function
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        require(
            usdtToken.transfer(owner(), balance),
            "Transfer failed"
        );
        emit FundsWithdrawn(owner(), balance);
    }
}
