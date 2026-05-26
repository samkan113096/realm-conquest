// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title Chain Loot Hero NFTs — on-chain stats, class, rarity, weapon slot
contract GameHero is ERC721, ERC721Enumerable, AccessControl {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  // Rarity: 0=Common 1=Uncommon 2=Rare 3=Epic 4=Legendary
    struct HeroStats {
        uint8 heroClass; // 0=Warrior 1=Ranger 2=Mage 3=Tank 4=Assassin
        uint8 power;
        uint8 speed;
        uint8 defense;
        uint8 luck;
        uint8 rarity;
        uint16 nameSeed;
    }

    uint256 private _nextTokenId;
    uint256 public constant MAX_SUPPLY = 10_000;
    uint256 public mintPrice = 50 ether;
    address public paymentToken;
    address public treasury;

    mapping(uint256 => HeroStats) public heroStats;
    mapping(address => uint256) public mintedCount;
    uint256 public maxPerWallet = 20;

    event HeroMinted(address indexed player, uint256 tokenId, uint8 heroClass, uint8 rarity);

    constructor(address admin, address _paymentToken, address _treasury)
        ERC721("Chain Loot Hero", "CLOOT")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        paymentToken = _paymentToken;
        treasury = _treasury;
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    function mintHero() external returns (uint256) {
        require(_nextTokenId < MAX_SUPPLY, "Max hero supply reached");
        require(mintedCount[msg.sender] < maxPerWallet, "Mint cap reached");
        require(
            IERC20(paymentToken).transferFrom(msg.sender, treasury, mintPrice),
            "Payment failed"
        );

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        uint8 rarity = _rollRarity(tokenId);
        uint8 heroClass = _rollClass(tokenId);
        heroStats[tokenId] = HeroStats({
            heroClass: heroClass,
            power: _statForRarity(rarity, 35, 95),
            speed: _statForRarity(rarity, 30, 90),
            defense: _statForRarity(rarity, 25, 85),
            luck: _statForRarity(rarity, 10, 60),
            rarity: rarity,
            nameSeed: uint16(uint256(keccak256(abi.encodePacked(tokenId, block.prevrandao))) % 10000)
        });

        mintedCount[msg.sender]++;
        emit HeroMinted(msg.sender, tokenId, heroClass, rarity);
        return tokenId;
    }

    function combatPower(uint256 tokenId) external view returns (uint256) {
        HeroStats memory s = heroStats[tokenId];
        return uint256(s.power) + uint256(s.defense) / 2 + uint256(s.speed) / 3 + _rarityBonus(s.rarity);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        HeroStats memory s = heroStats[tokenId];
        return string(
            abi.encodePacked(
                "data:application/json,{",
                '"name":"', _heroDisplayName(s.nameSeed, s.heroClass, tokenId), '",',
                '"description":"Named CLOOT hero for Chain Loot Zombie Siege",',
                '"attributes":[',
                '{"trait_type":"Class","value":"', _className(s.heroClass), '"},',
                '{"trait_type":"Rarity","value":"', _rarityName(s.rarity), '"},',
                '{"trait_type":"Name Index","value":', uint256((uint256(s.nameSeed) + tokenId * 7) % 50).toString(), "},",
                '{"trait_type":"Power","value":', uint256(s.power).toString(), "},",
                '{"trait_type":"Speed","value":', uint256(s.speed).toString(), "},",
                '{"trait_type":"Defense","value":', uint256(s.defense).toString(), "},",
                '{"trait_type":"Luck","value":', uint256(s.luck).toString(), "}",
                "]}"
            )
        );
    }

    function _rarityBonus(uint8 rarity) private pure returns (uint256) {
        if (rarity == 4) return 40;
        if (rarity == 3) return 25;
        if (rarity == 2) return 15;
        if (rarity == 1) return 8;
        return 0;
    }

    function _rollRarity(uint256 tokenId) private view returns (uint8) {
        uint256 roll = uint256(keccak256(abi.encodePacked(block.prevrandao, msg.sender, tokenId))) % 100;
        if (roll < 2) return 4;
        if (roll < 8) return 3;
        if (roll < 20) return 2;
        if (roll < 45) return 1;
        return 0;
    }

    function _rollClass(uint256 tokenId) private view returns (uint8) {
        return uint8(uint256(keccak256(abi.encodePacked(tokenId, msg.sender, block.timestamp))) % 5);
    }

    function _statForRarity(uint8 rarity, uint8 base, uint8 max_) private pure returns (uint8) {
        uint256 range = max_ - base;
        uint256 bonus = (range * (rarity + 1)) / 5;
        return uint8(base + bonus);
    }

    function _rarityName(uint8 r) private pure returns (string memory) {
        if (r == 4) return "Legendary";
        if (r == 3) return "Epic";
        if (r == 2) return "Rare";
        if (r == 1) return "Uncommon";
        return "Common";
    }

    function _className(uint8 c) private pure returns (string memory) {
        if (c == 4) return "Assassin";
        if (c == 3) return "Tank";
        if (c == 2) return "Mage";
        if (c == 1) return "Ranger";
        return "Warrior";
    }

    function _heroDisplayName(uint16 seed, uint8 heroClass, uint256 tokenId) private pure returns (string memory) {
        uint256 idx = (uint256(seed) + tokenId * 7) % 50;
        return string(abi.encodePacked("Hero #", tokenId.toString(), " (", idx.toString(), ")"));
    }

    function _heroName(uint16 seed, uint8 heroClass) private pure returns (string memory) {
        string[5] memory prefixes = ["Iron", "Shadow", "Storm", "Crystal", "Void"];
        string[5] memory suffixes = ["blade", "walker", "heart", "fang", "warden"];
        return string(abi.encodePacked(prefixes[seed % 5], suffixes[(seed / 5 + heroClass) % 5]));
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
}
