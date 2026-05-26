// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./GameToken.sol";

/// @title LOOT Airdrop — admin-managed allocations for community campaigns
/// @notice Admin registers EOA → amount; distribute via push (airdrop) or pull (claim).
contract LootAirdrop is AccessControl, ReentrancyGuard {
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    GameToken public immutable lootToken;

    mapping(address => uint256) public allocation;
    mapping(address => bool) public delivered;

    event AllocationSet(address indexed recipient, uint256 amount);
    event AllocationsBatchSet(uint256 count);
    event AirdropDelivered(address indexed recipient, uint256 amount);
    event AllocationCleared(address indexed recipient);

    constructor(address admin, address token) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DISTRIBUTOR_ROLE, admin);
        lootToken = GameToken(token);
    }

    /// @notice Register LOOT allocation for one wallet (wei, 18 decimals)
    function setAllocation(address recipient, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(recipient != address(0), "Zero address");
        allocation[recipient] = amount;
        emit AllocationSet(recipient, amount);
    }

    /// @notice Batch-register allocations for a campaign list
    function setAllocations(address[] calldata recipients, uint256[] calldata amounts)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(recipients.length == amounts.length, "Length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Zero address");
            allocation[recipients[i]] = amounts[i];
            emit AllocationSet(recipients[i], amounts[i]);
        }
        emit AllocationsBatchSet(recipients.length);
    }

    /// @notice Admin push — mint LOOT to recipient from their allocation
    function airdrop(address recipient) external onlyRole(DISTRIBUTOR_ROLE) nonReentrant {
        _deliver(recipient);
    }

    /// @notice Admin push batch
    function airdropBatch(address[] calldata recipients) external onlyRole(DISTRIBUTOR_ROLE) nonReentrant {
        for (uint256 i = 0; i < recipients.length; i++) {
            _deliver(recipients[i]);
        }
    }

    /// @notice Recipient pull — claim during an active campaign window
    function claim() external nonReentrant {
        _deliver(msg.sender);
    }

    function clearAllocation(address recipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        allocation[recipient] = 0;
        emit AllocationCleared(recipient);
    }

    function pending(address recipient) external view returns (uint256) {
        if (delivered[recipient]) return 0;
        return allocation[recipient];
    }

    function _deliver(address recipient) private {
        require(!delivered[recipient], "Already delivered");
        uint256 amount = allocation[recipient];
        require(amount > 0, "No allocation");
        delivered[recipient] = true;
        allocation[recipient] = 0;
        lootToken.mint(recipient, amount);
        emit AirdropDelivered(recipient, amount);
    }
}
