// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./GameToken.sol";

/// @title Play-to-Earn Rewards — signed score claims (Gala/Immutable-style oracle pattern)
contract GameRewards is AccessControl, ReentrancyGuard {
    using ECDSA for bytes32;

    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");

    GameToken public immutable realmToken;

  // gameId => player => lastTouchpoint (prevent replay)
    mapping(uint8 => mapping(address => uint256)) public lastClaimNonce;

    // gameId => base reward multiplier
    mapping(uint8 => uint256) public gameMultipliers;

    uint256 public dailyClaimCap = 1000 ether;
    mapping(address => mapping(uint256 => uint256)) public dailyClaimed; // user => day => amount

    event RewardClaimed(address indexed player, uint8 gameId, uint256 score, uint256 reward);

    constructor(address admin, address token) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(SIGNER_ROLE, admin);
        realmToken = GameToken(token);
        // 0=web strategy, 1=pc arcade, 2=mobile brawler
        gameMultipliers[0] = 1 ether;
        gameMultipliers[1] = 2 ether;
        gameMultipliers[2] = 3 ether;
    }

    struct Claim {
        address player;
        uint8 gameId;
        uint256 score;
        uint256 nonce;
        uint256 deadline;
    }

    /// @notice Claim P2E rewards with off-chain score attestation
    function claimPlayReward(
        uint8 gameId,
        uint256 score,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external nonReentrant {
        require(block.timestamp <= deadline, "Expired");
        require(nonce > lastClaimNonce[gameId][msg.sender], "Invalid nonce");
        require(gameId <= 2, "Unknown game");

        bytes32 hash = MessageHashUtils.toEthSignedMessageHash(
            keccak256(abi.encode(msg.sender, gameId, score, nonce, deadline))
        );
        address signer = hash.recover(signature);
        require(hasRole(SIGNER_ROLE, signer), "Invalid signature");

        uint256 reward = _scoreToReward(gameId, score);
        _enforceDailyCap(msg.sender, reward);

        lastClaimNonce[gameId][msg.sender] = nonce;
        realmToken.mint(msg.sender, reward);
        emit RewardClaimed(msg.sender, gameId, score, reward);
    }

    function _scoreToReward(uint8 gameId, uint256 score) private view returns (uint256) {
        // sqrt curve prevents whale farming (common anti-bot pattern)
        uint256 base = _sqrt(score) * gameMultipliers[gameId] / 1e9;
        return base > 500 ether ? 500 ether : base; // per-claim cap
    }

    function _enforceDailyCap(address user, uint256 amount) private {
        uint256 day = block.timestamp / 1 days;
        require(dailyClaimed[user][day] + amount <= dailyClaimCap, "Daily cap reached");
        dailyClaimed[user][day] += amount;
    }

    function _sqrt(uint256 x) private pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}
