// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title Chain Loot Weapons — equippable gear for heroes in Zombie Siege
contract GameWeapon is ERC721, ERC721Enumerable, AccessControl {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  // 0=Sword 1=Bow 2=Staff 3=Hammer 4=Dagger
    struct WeaponStats {
        uint8 weaponType;
        uint8 damage;
        uint8 crit;
        uint8 rarity;
        uint16 nameSeed;
    }

    uint256 private _nextTokenId;
    uint256 public constant MAX_SUPPLY = 20_000;
    uint256 public mintPrice = 25 ether;
    address public paymentToken;
    address public treasury;

    mapping(uint256 => WeaponStats) public weaponStats;
    mapping(address => uint256) public mintedCount;
    uint256 public maxPerWallet = 30;

    event WeaponMinted(address indexed player, uint256 tokenId, uint8 weaponType, uint8 rarity);

    constructor(address admin, address _paymentToken, address _treasury)
        ERC721("Chain Loot Weapon", "WLOOT")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        paymentToken = _paymentToken;
        treasury = _treasury;
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    function mintWeapon() external returns (uint256) {
        require(_nextTokenId < MAX_SUPPLY, "Max weapon supply");
        require(mintedCount[msg.sender] < maxPerWallet, "Mint cap");
        require(
            IERC20(paymentToken).transferFrom(msg.sender, treasury, mintPrice),
            "Payment failed"
        );

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        uint8 rarity = _rollRarity(tokenId);
        uint8 wType = uint8(uint256(keccak256(abi.encodePacked(tokenId, msg.sender))) % 5);
        weaponStats[tokenId] = WeaponStats({
            weaponType: wType,
            damage: _statForRarity(rarity, 15, 80),
            crit: _statForRarity(rarity, 5, 35),
            rarity: rarity,
            nameSeed: uint16(uint256(keccak256(abi.encodePacked(tokenId, block.prevrandao, msg.sender))) % 10000)
        });

        mintedCount[msg.sender]++;
        emit WeaponMinted(msg.sender, tokenId, wType, rarity);
        return tokenId;
    }

    function bonusDamage(uint256 tokenId) external view returns (uint256) {
        WeaponStats memory w = weaponStats[tokenId];
        return uint256(w.damage) + _rarityBonus(w.rarity);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        WeaponStats memory w = weaponStats[tokenId];
        return string(
            abi.encodePacked(
                "data:application/json,{",
                '"name":"', _weaponDisplayName(w.nameSeed, w.weaponType, tokenId), '",',
                '"description":"Named WLOOT weapon for Chain Loot Zombie Siege",',
                '"attributes":[',
                '{"trait_type":"Type","value":"', _typeName(w.weaponType), '"},',
                '{"trait_type":"Rarity","value":"', _rarityName(w.rarity), '"},',
                '{"trait_type":"Name Index","value":', uint256(w.nameSeed % 100).toString(), "},",
                '{"trait_type":"Damage","value":', uint256(w.damage).toString(), "},",
                '{"trait_type":"Crit","value":', uint256(w.crit).toString(), "}",
                "]}"
            )
        );
    }

    function _rarityBonus(uint8 rarity) private pure returns (uint256) {
        if (rarity == 4) return 30;
        if (rarity == 3) return 18;
        if (rarity == 2) return 10;
        if (rarity == 1) return 5;
        return 0;
    }

    function _rollRarity(uint256 tokenId) private view returns (uint8) {
        uint256 roll = uint256(keccak256(abi.encodePacked(block.prevrandao, msg.sender, tokenId))) % 100;
        if (roll < 3) return 4;
        if (roll < 10) return 3;
        if (roll < 25) return 2;
        if (roll < 50) return 1;
        return 0;
    }

    function _statForRarity(uint8 rarity, uint8 base, uint8 max_) private pure returns (uint8) {
        uint256 range = max_ - base;
        return uint8(base + (range * (rarity + 1)) / 5);
    }

    function _rarityName(uint8 r) private pure returns (string memory) {
        if (r == 4) return "Legendary";
        if (r == 3) return "Epic";
        if (r == 2) return "Rare";
        if (r == 1) return "Uncommon";
        return "Common";
    }

    function _typeName(uint8 t) private pure returns (string memory) {
        if (t == 4) return "Dagger";
        if (t == 3) return "Hammer";
        if (t == 2) return "Staff";
        if (t == 1) return "Bow";
        return "Sword";
    }

    function _weaponDisplayName(uint16 seed, uint8 wType, uint256 tokenId) private pure returns (string memory) {
        uint256 idx = (uint256(seed) + tokenId * 13 + uint256(wType) * 17) % 100;
        return string(abi.encodePacked(_typeName(wType), " #", tokenId.toString(), " (", idx.toString(), ")"));
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
