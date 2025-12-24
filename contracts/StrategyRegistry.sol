// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StrategyRegistry
 * @dev Registry for AI trading strategies with performance tracking
 */
contract StrategyRegistry is Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    struct Strategy {
        bytes32 strategyHash;       // Unique identifier
        string name;                // Strategy name
        string description;         // Strategy description
        address creator;            // Address that registered the strategy
        uint256 createdAt;          // Registration timestamp
        bool isActive;              // Whether strategy is currently active
        StrategyPerformance performance;
    }
    
    struct StrategyPerformance {
        uint256 totalTrades;        // Total number of trades executed
        uint256 winningTrades;      // Number of profitable trades
        int256 totalPnL;            // Total profit/loss (scaled by 1e8)
        uint256 lastUpdated;        // Last performance update timestamp
        uint16 sharpeRatio;         // Sharpe ratio (scaled by 100)
        uint16 maxDrawdown;         // Maximum drawdown percentage (scaled by 100)
    }
    
    // ============ State Variables ============
    
    mapping(bytes32 => Strategy) public strategies;
    mapping(address => bytes32[]) public strategiesByCreator;
    
    bytes32[] public allStrategyHashes;
    uint256 public totalStrategies;
    
    // ============ Events ============
    
    event StrategyRegistered(
        bytes32 indexed strategyHash,
        string name,
        address indexed creator,
        uint256 timestamp
    );
    
    event StrategyUpdated(
        bytes32 indexed strategyHash,
        uint256 totalTrades,
        int256 totalPnL
    );
    
    event StrategyStatusChanged(
        bytes32 indexed strategyHash,
        bool isActive
    );
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {}
    
    // ============ Core Functions ============
    
    /**
     * @dev Register a new trading strategy
     */
    function registerStrategy(
        bytes32 _strategyHash,
        string memory _name,
        string memory _description
    ) external nonReentrant {
        require(_strategyHash != bytes32(0), "Invalid strategy hash");
        require(strategies[_strategyHash].createdAt == 0, "Strategy already exists");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        strategies[_strategyHash] = Strategy({
            strategyHash: _strategyHash,
            name: _name,
            description: _description,
            creator: msg.sender,
            createdAt: block.timestamp,
            isActive: true,
            performance: StrategyPerformance({
                totalTrades: 0,
                winningTrades: 0,
                totalPnL: 0,
                lastUpdated: block.timestamp,
                sharpeRatio: 0,
                maxDrawdown: 0
            })
        });
        
        strategiesByCreator[msg.sender].push(_strategyHash);
        allStrategyHashes.push(_strategyHash);
        totalStrategies++;
        
        emit StrategyRegistered(_strategyHash, _name, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Update strategy performance metrics
     */
    function updateStrategyPerformance(
        bytes32 _strategyHash,
        uint256 _totalTrades,
        uint256 _winningTrades,
        int256 _totalPnL,
        uint16 _sharpeRatio,
        uint16 _maxDrawdown
    ) external {
        require(strategies[_strategyHash].createdAt != 0, "Strategy not found");
        require(
            msg.sender == strategies[_strategyHash].creator || msg.sender == owner(),
            "Not authorized"
        );
        require(_winningTrades <= _totalTrades, "Invalid winning trades count");
        
        Strategy storage strategy = strategies[_strategyHash];
        strategy.performance.totalTrades = _totalTrades;
        strategy.performance.winningTrades = _winningTrades;
        strategy.performance.totalPnL = _totalPnL;
        strategy.performance.sharpeRatio = _sharpeRatio;
        strategy.performance.maxDrawdown = _maxDrawdown;
        strategy.performance.lastUpdated = block.timestamp;
        
        emit StrategyUpdated(_strategyHash, _totalTrades, _totalPnL);
    }
    
    /**
     * @dev Toggle strategy active status
     */
    function setStrategyStatus(bytes32 _strategyHash, bool _isActive) external {
        require(strategies[_strategyHash].createdAt != 0, "Strategy not found");
        require(
            msg.sender == strategies[_strategyHash].creator || msg.sender == owner(),
            "Not authorized"
        );
        
        strategies[_strategyHash].isActive = _isActive;
        emit StrategyStatusChanged(_strategyHash, _isActive);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get strategy details
     */
    function getStrategy(bytes32 _strategyHash)
        external
        view
        returns (Strategy memory)
    {
        require(strategies[_strategyHash].createdAt != 0, "Strategy not found");
        return strategies[_strategyHash];
    }
    
    /**
     * @dev Get strategies by creator
     */
    function getStrategiesByCreator(address _creator)
        external
        view
        returns (bytes32[] memory)
    {
        return strategiesByCreator[_creator];
    }
    
    /**
     * @dev Get all strategies (paginated)
     */
    function getAllStrategies(uint256 _offset, uint256 _limit)
        external
        view
        returns (bytes32[] memory)
    {
        require(_offset < allStrategyHashes.length, "Offset out of bounds");
        
        uint256 end = _offset + _limit;
        if (end > allStrategyHashes.length) {
            end = allStrategyHashes.length;
        }
        
        bytes32[] memory result = new bytes32[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = allStrategyHashes[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get performance metrics for a strategy
     */
    function getPerformance(bytes32 _strategyHash)
        external
        view
        returns (StrategyPerformance memory)
    {
        require(strategies[_strategyHash].createdAt != 0, "Strategy not found");
        return strategies[_strategyHash].performance;
    }
    
    /**
     * @dev Calculate win rate for a strategy
     */
    function getWinRate(bytes32 _strategyHash)
        external
        view
        returns (uint16)
    {
        require(strategies[_strategyHash].createdAt != 0, "Strategy not found");
        StrategyPerformance memory perf = strategies[_strategyHash].performance;
        
        if (perf.totalTrades == 0) return 0;
        
        // Return win rate as percentage scaled by 100 (e.g., 8500 = 85.00%)
        return uint16((perf.winningTrades * 10000) / perf.totalTrades);
    }
}
