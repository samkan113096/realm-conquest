// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./GameToken.sol";
import "./GameHero.sol";
import "./GameWeapon.sol";

/// @title Zombie Siege (UUPS Upgradeable) — on-chain P2E zombie combat for Chain Loot
/// @notice Defeat zombies with hero + weapon NFTs to earn LOOT. Upgradeable for future game features.
contract ZombieSiegeUpgradeable is
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    string public constant VERSION = "1.1.0";

    uint256 private _reentrancyStatus;

    GameToken public lootToken;
    GameHero public heroNft;
    GameWeapon public weaponNft;

    uint256 public fightCooldown;
    uint256 public hpRegenPerHour;
    uint256 public minHpToFight;

    struct ZombieTier {
        string name;
        uint256 minPower;
        uint256 reward;
        uint256 hpCost;
    }

    ZombieTier[5] public tiers;

    mapping(address => uint256) public totalKills;
    mapping(address => uint256) public totalLootEarned;
    mapping(uint256 => uint256) public heroLastFight;
    mapping(uint256 => uint256) public heroKillCount;
    mapping(uint256 => uint256) public heroEquippedWeapon;
    mapping(uint256 => uint256) public heroHpStored;
    mapping(uint256 => uint256) public heroHpUpdatedAt;

    event BattleResult(
        address indexed player,
        uint256 indexed heroId,
        uint8 tier,
        bool victory,
        uint256 power,
        uint256 reward,
        uint256 hpRemaining,
        uint256 maxHp
    );
    event WeaponLinked(uint256 indexed heroId, uint256 indexed weaponId);
    event ContractUpgraded(string version);

    modifier nonReentrant() {
        require(_reentrancyStatus == 0, "Reentrant call");
        _reentrancyStatus = 1;
        _;
        _reentrancyStatus = 0;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address admin, address token, address hero, address weapon) public initializer {
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);

        lootToken = GameToken(token);
        heroNft = GameHero(hero);
        weaponNft = GameWeapon(weapon);
        fightCooldown = 30 seconds;
        hpRegenPerHour = 10;
        minHpToFight = 15;

        tiers[0] = ZombieTier("Shambler", 40, 2 ether, 12);
        tiers[1] = ZombieTier("Runner", 70, 5 ether, 18);
        tiers[2] = ZombieTier("Brute", 110, 10 ether, 26);
        tiers[3] = ZombieTier("Elite", 160, 20 ether, 36);
        tiers[4] = ZombieTier("Necromancer", 220, 40 ether, 48);
    }

    function getHeroMaxHp(uint256 heroId) public view returns (uint256) {
        (
            uint8 heroClass,
            uint8 power,
            ,
            uint8 defense,
            ,
            uint8 rarity,
            uint16 nameSeed
        ) = heroNft.heroStats(heroId);
        nameSeed;

        uint256 maxHp = 60 + uint256(defense) * 2 + uint256(power);
        if (heroClass == 3) maxHp += 25;
        if (rarity >= 2) maxHp += 15;
        if (rarity >= 3) maxHp += 25;
        if (rarity == 4) maxHp += 40;
        return maxHp;
    }

    function getHeroHp(uint256 heroId) public view returns (uint256 current, uint256 maxHp) {
        maxHp = getHeroMaxHp(heroId);
        uint256 updatedAt = heroHpUpdatedAt[heroId];
        if (updatedAt == 0) {
            return (maxHp, maxHp);
        }
        current = heroHpStored[heroId];
        uint256 elapsed = block.timestamp - updatedAt;
        current += (elapsed * hpRegenPerHour) / 3600;
        if (current > maxHp) current = maxHp;
    }

    function _syncHeroHp(uint256 heroId) private {
        (uint256 current, ) = getHeroHp(heroId);
        heroHpStored[heroId] = current;
        heroHpUpdatedAt[heroId] = block.timestamp;
    }

    function _applyHpCost(uint256 heroId, uint8 tier) private returns (uint256 remaining) {
        _syncHeroHp(heroId);
        uint256 cost = tiers[tier].hpCost;
        uint256 current = heroHpStored[heroId];
        remaining = cost >= current ? 0 : current - cost;
        heroHpStored[heroId] = remaining;
        heroHpUpdatedAt[heroId] = block.timestamp;
    }

    function equipWeapon(uint256 heroId, uint256 weaponId) external {
        require(heroNft.ownerOf(heroId) == msg.sender, "Not hero owner");
        if (weaponId != 0) {
            require(weaponNft.ownerOf(weaponId) == msg.sender, "Not weapon owner");
        }
        heroEquippedWeapon[heroId] = weaponId;
        emit WeaponLinked(heroId, weaponId);
    }

    function getHeroPower(uint256 heroId) public view returns (uint256) {
        (
            uint8 heroClass,
            uint8 power,
            uint8 speed,
            uint8 defense,
            uint8 luck,
            uint8 rarity,
            uint16 nameSeed
        ) = heroNft.heroStats(heroId);
        nameSeed;

        uint256 total = uint256(power) + uint256(defense) / 2 + uint256(speed) / 3 + uint256(luck) / 5;
        total += _rarityBonus(rarity) + _classBonus(heroClass);

        uint256 weaponId = heroEquippedWeapon[heroId];
        if (weaponId != 0 && weaponNft.ownerOf(weaponId) == heroNft.ownerOf(heroId)) {
            total += weaponNft.bonusDamage(weaponId);
        }
        return total;
    }

    /// @notice Preview LOOT earned on victory (before fight tx)
    function previewReward(uint256 heroId, uint8 tier) external view returns (uint256) {
        require(tier < 5, "Invalid tier");
        return _calcReward(heroId, tier);
    }

    function fight(uint256 heroId, uint8 tier) external nonReentrant returns (bool victory, uint256 reward) {
        require(tier < 5, "Invalid tier");
        require(heroNft.ownerOf(heroId) == msg.sender, "Not hero owner");
        require(block.timestamp >= heroLastFight[heroId] + fightCooldown, "Hero resting");

        (uint256 hpNow, uint256 maxHp) = getHeroHp(heroId);
        require(hpNow >= minHpToFight, "Hero HP too low");
        require(hpNow >= tiers[tier].hpCost, "Not enough HP for tier");

        uint256 power = getHeroPower(heroId);
        require(power >= tiers[tier].minPower, "Hero too weak for this tier");

        uint256 zombiePower = tiers[tier].minPower + 20;
        uint256 roll = uint256(
            keccak256(abi.encodePacked(block.prevrandao, msg.sender, heroId, tier, block.timestamp))
        ) % 100;

        uint256 winChance = _winChance(power, zombiePower);
        victory = roll < winChance;

        heroLastFight[heroId] = block.timestamp;

        if (victory) {
            reward = _calcReward(heroId, tier);
            totalKills[msg.sender]++;
            heroKillCount[heroId]++;
            totalLootEarned[msg.sender] += reward;
            lootToken.mint(msg.sender, reward);
        }

        uint256 hpRemaining = _applyHpCost(heroId, tier);

        emit BattleResult(msg.sender, heroId, tier, victory, power, reward, hpRemaining, maxHp);
    }

    function _calcReward(uint256 heroId, uint8 tier) private view returns (uint256) {
        uint256 reward = tiers[tier].reward;
        uint8 rarity = _heroRarity(heroId);
        if (rarity >= 3) reward = (reward * 120) / 100;
        if (rarity == 4) reward = (reward * 150) / 100;
        return reward;
    }

    function _winChance(uint256 heroPower, uint256 zombiePower) private pure returns (uint256) {
        if (heroPower >= zombiePower * 2) return 90;
        if (heroPower >= zombiePower) return 65 + ((heroPower - zombiePower) * 20) / zombiePower;
        return 25;
    }

    function _heroRarity(uint256 heroId) private view returns (uint8) {
        (, , , , , uint8 rarity, uint16 _ns) = heroNft.heroStats(heroId);
        _ns;
        return rarity;
    }

    function _rarityBonus(uint8 rarity) private pure returns (uint256) {
        if (rarity == 4) return 45;
        if (rarity == 3) return 28;
        if (rarity == 2) return 16;
        if (rarity == 1) return 8;
        return 0;
    }

    function _classBonus(uint8 c) private pure returns (uint256) {
        if (c == 3) return 12;
        if (c == 4) return 10;
        if (c == 0) return 8;
        return 5;
    }

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {
        emit ContractUpgraded(VERSION);
    }

    uint256[35] private __gap;
}
