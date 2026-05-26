// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Game Staking — stake REALM, earn REALM (common GameFi tokenomics)
contract GameStaking is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant REWARDER_ROLE = keccak256("REWARDER_ROLE");

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    uint256 public rewardRate = 1e15; // REALM wei per second (scaled by totalStaked)
    uint256 public constant RATE_PRECISION = 1e18;
    uint256 public totalStaked;

    struct StakeInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 pendingRewards;
        uint256 stakedAt;
    }

    mapping(address => StakeInfo) public stakes;
    uint256 public accRewardPerShare;
    uint256 public lastUpdateTime;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(address admin, address _stakingToken, address _rewardToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REWARDER_ROLE, admin);
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        lastUpdateTime = block.timestamp;
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");
        _updatePool();
        StakeInfo storage info = stakes[msg.sender];
        if (info.amount > 0) {
            info.pendingRewards += _pending(info.amount, info.rewardDebt);
        }
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        info.amount += amount;
        info.rewardDebt = (info.amount * accRewardPerShare) / RATE_PRECISION;
        if (info.stakedAt == 0) info.stakedAt = block.timestamp;
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage info = stakes[msg.sender];
        require(info.amount >= amount, "Insufficient stake");
        _updatePool();
        info.pendingRewards += _pending(info.amount, info.rewardDebt);
        info.amount -= amount;
        info.rewardDebt = (info.amount * accRewardPerShare) / RATE_PRECISION;
        totalStaked -= amount;
        stakingToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        _updatePool();
        StakeInfo storage info = stakes[msg.sender];
        uint256 reward = info.pendingRewards + _pending(info.amount, info.rewardDebt);
        require(reward > 0, "No rewards");
        info.pendingRewards = 0;
        info.rewardDebt = (info.amount * accRewardPerShare) / RATE_PRECISION;
        rewardToken.safeTransfer(msg.sender, reward);
        emit RewardClaimed(msg.sender, reward);
    }

    function pendingReward(address user) external view returns (uint256) {
        StakeInfo memory info = stakes[user];
        uint256 acc = accRewardPerShare;
        if (totalStaked > 0 && block.timestamp > lastUpdateTime) {
            uint256 elapsed = block.timestamp - lastUpdateTime;
            acc += (elapsed * rewardRate * RATE_PRECISION) / totalStaked;
        }
        return info.pendingRewards + _pendingWithAcc(info.amount, info.rewardDebt, acc);
    }

    function fundRewards(uint256 amount) external onlyRole(REWARDER_ROLE) {
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    function _updatePool() internal {
        if (totalStaked == 0) {
            lastUpdateTime = block.timestamp;
            return;
        }
        uint256 elapsed = block.timestamp - lastUpdateTime;
        accRewardPerShare += (elapsed * rewardRate * RATE_PRECISION) / totalStaked;
        lastUpdateTime = block.timestamp;
    }

    function _pending(uint256 amount, uint256 rewardDebt) private view returns (uint256) {
        return _pendingWithAcc(amount, rewardDebt, accRewardPerShare);
    }

    function _pendingWithAcc(uint256 amount, uint256 rewardDebt, uint256 acc) private pure returns (uint256) {
        if (amount == 0) return 0;
        return (amount * acc) / RATE_PRECISION - rewardDebt;
    }
}
