// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TradeVerifier
 * @dev Smart contract for verifying and storing AI trading decisions on-chain
 * @notice This contract creates an immutable audit trail for WAlphaHunter trading system
 */
contract TradeVerifier is Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    struct TradeProof {
        bytes32 tradeHash;          // Keccak256 hash of trade details
        bytes32 aiDecisionHash;     // Keccak256 hash of AI decision
        string symbol;              // Trading pair (e.g., "BTC/USDT")
        uint256 timestamp;          // Block timestamp when proof was submitted
        address submitter;          // Address that submitted the proof
        uint256 price;              // Trade execution price (scaled by 1e8)
        uint256 quantity;           // Trade quantity (scaled by 1e8)
        bool isBuy;                 // true = BUY, false = SELL
        uint16 aiConfidence;        // AI confidence score (0-10000 = 0-100%)
    }
    
    struct AIDecision {
        bytes32 decisionHash;       // Unique hash of the decision
        string reasoning;           // AI reasoning (stored on-chain for transparency)
        uint256 timestamp;          // When the decision was made
        uint16 confidence;          // Confidence score (0-10000)
        bool executed;              // Whether this decision led to a trade
    }
    
    // ============ State Variables ============
    
    mapping(bytes32 => TradeProof) public tradeProofs;
    mapping(bytes32 => AIDecision) public aiDecisions;
    mapping(address => bool) public authorizedSubmitters;
    
    bytes32[] public allTradeHashes;
    bytes32[] public allDecisionHashes;
    
    uint256 public totalTradesRecorded;
    uint256 public totalDecisionsRecorded;
    
    // ============ Events ============
    
    event TradeProofSubmitted(
        bytes32 indexed tradeHash,
        bytes32 indexed aiDecisionHash,
        string symbol,
        uint256 price,
        uint256 quantity,
        bool isBuy,
        uint256 timestamp
    );
    
    event AIDecisionRecorded(
        bytes32 indexed decisionHash,
        uint16 confidence,
        uint256 timestamp
    );
    
    event SubmitterAuthorized(address indexed submitter);
    event SubmitterRevoked(address indexed submitter);
    
    // ============ Modifiers ============
    
    modifier onlyAuthorized() {
        require(
            authorizedSubmitters[msg.sender] || msg.sender == owner(),
            "Not authorized to submit proofs"
        );
        _;
    }
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {
        authorizedSubmitters[msg.sender] = true;
    }
    
    // ============ Core Functions ============
    
    /**
     * @dev Submit a trade proof to the blockchain
     * @param _tradeHash Unique hash identifying the trade
     * @param _aiDecisionHash Hash of the AI decision that led to this trade
     * @param _symbol Trading pair symbol
     * @param _price Execution price (scaled by 1e8)
     * @param _quantity Trade quantity (scaled by 1e8)
     * @param _isBuy True for BUY, false for SELL
     * @param _aiConfidence AI confidence score (0-10000)
     */
    function submitTradeProof(
        bytes32 _tradeHash,
        bytes32 _aiDecisionHash,
        string memory _symbol,
        uint256 _price,
        uint256 _quantity,
        bool _isBuy,
        uint16 _aiConfidence
    ) external onlyAuthorized nonReentrant {
        require(_tradeHash != bytes32(0), "Invalid trade hash");
        require(_aiDecisionHash != bytes32(0), "Invalid AI decision hash");
        require(tradeProofs[_tradeHash].timestamp == 0, "Trade already recorded");
        require(_aiConfidence <= 10000, "Invalid confidence score");
        
        tradeProofs[_tradeHash] = TradeProof({
            tradeHash: _tradeHash,
            aiDecisionHash: _aiDecisionHash,
            symbol: _symbol,
            timestamp: block.timestamp,
            submitter: msg.sender,
            price: _price,
            quantity: _quantity,
            isBuy: _isBuy,
            aiConfidence: _aiConfidence
        });
        
        allTradeHashes.push(_tradeHash);
        totalTradesRecorded++;
        
        // Mark the AI decision as executed
        if (aiDecisions[_aiDecisionHash].timestamp != 0) {
            aiDecisions[_aiDecisionHash].executed = true;
        }
        
        emit TradeProofSubmitted(
            _tradeHash,
            _aiDecisionHash,
            _symbol,
            _price,
            _quantity,
            _isBuy,
            block.timestamp
        );
    }
    
    /**
     * @dev Record an AI decision on-chain
     * @param _decisionHash Unique hash of the decision
     * @param _reasoning AI reasoning text
     * @param _confidence Confidence score (0-10000)
     */
    function recordAIDecision(
        bytes32 _decisionHash,
        string memory _reasoning,
        uint16 _confidence
    ) external onlyAuthorized nonReentrant {
        require(_decisionHash != bytes32(0), "Invalid decision hash");
        require(aiDecisions[_decisionHash].timestamp == 0, "Decision already recorded");
        require(_confidence <= 10000, "Invalid confidence score");
        
        aiDecisions[_decisionHash] = AIDecision({
            decisionHash: _decisionHash,
            reasoning: _reasoning,
            timestamp: block.timestamp,
            confidence: _confidence,
            executed: false
        });
        
        allDecisionHashes.push(_decisionHash);
        totalDecisionsRecorded++;
        
        emit AIDecisionRecorded(_decisionHash, _confidence, block.timestamp);
    }
    
    /**
     * @dev Batch submit multiple trade proofs (gas optimization)
     */
    function batchSubmitTradeProofs(
        bytes32[] memory _tradeHashes,
        bytes32[] memory _aiDecisionHashes,
        string[] memory _symbols,
        uint256[] memory _prices,
        uint256[] memory _quantities,
        bool[] memory _isBuy,
        uint16[] memory _aiConfidences
    ) external onlyAuthorized nonReentrant {
        require(
            _tradeHashes.length == _aiDecisionHashes.length &&
            _tradeHashes.length == _symbols.length &&
            _tradeHashes.length == _prices.length &&
            _tradeHashes.length == _quantities.length &&
            _tradeHashes.length == _isBuy.length &&
            _tradeHashes.length == _aiConfidences.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < _tradeHashes.length; i++) {
            require(_tradeHashes[i] != bytes32(0), "Invalid trade hash");
            require(tradeProofs[_tradeHashes[i]].timestamp == 0, "Trade already recorded");
            require(_aiConfidences[i] <= 10000, "Invalid confidence score");
            
            tradeProofs[_tradeHashes[i]] = TradeProof({
                tradeHash: _tradeHashes[i],
                aiDecisionHash: _aiDecisionHashes[i],
                symbol: _symbols[i],
                timestamp: block.timestamp,
                submitter: msg.sender,
                price: _prices[i],
                quantity: _quantities[i],
                isBuy: _isBuy[i],
                aiConfidence: _aiConfidences[i]
            });
            
            allTradeHashes.push(_tradeHashes[i]);
            totalTradesRecorded++;
            
            emit TradeProofSubmitted(
                _tradeHashes[i],
                _aiDecisionHashes[i],
                _symbols[i],
                _prices[i],
                _quantities[i],
                _isBuy[i],
                block.timestamp
            );
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Verify if a trade proof exists and return its details
     */
    function verifyTradeProof(bytes32 _tradeHash) 
        external 
        view 
        returns (TradeProof memory) 
    {
        require(tradeProofs[_tradeHash].timestamp != 0, "Trade proof not found");
        return tradeProofs[_tradeHash];
    }
    
    /**
     * @dev Get AI decision details
     */
    function getAIDecision(bytes32 _decisionHash)
        external
        view
        returns (AIDecision memory)
    {
        require(aiDecisions[_decisionHash].timestamp != 0, "Decision not found");
        return aiDecisions[_decisionHash];
    }
    
    /**
     * @dev Get all trade hashes (paginated)
     */
    function getTradeHashes(uint256 _offset, uint256 _limit)
        external
        view
        returns (bytes32[] memory)
    {
        require(_offset < allTradeHashes.length, "Offset out of bounds");
        
        uint256 end = _offset + _limit;
        if (end > allTradeHashes.length) {
            end = allTradeHashes.length;
        }
        
        bytes32[] memory result = new bytes32[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = allTradeHashes[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get statistics
     */
    function getStats() external view returns (
        uint256 totalTrades,
        uint256 totalDecisions,
        uint256 totalSubmitters
    ) {
        return (totalTradesRecorded, totalDecisionsRecorded, 0); // submitters count would need separate tracking
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Authorize a new address to submit proofs
     */
    function authorizeSubmitter(address _submitter) external onlyOwner {
        require(_submitter != address(0), "Invalid address");
        authorizedSubmitters[_submitter] = true;
        emit SubmitterAuthorized(_submitter);
    }
    
    /**
     * @dev Revoke authorization from an address
     */
    function revokeSubmitter(address _submitter) external onlyOwner {
        authorizedSubmitters[_submitter] = false;
        emit SubmitterRevoked(_submitter);
    }
    
    /**
     * @dev Check if an address is authorized
     */
    function isAuthorized(address _address) external view returns (bool) {
        return authorizedSubmitters[_address] || _address == owner();
    }
}
