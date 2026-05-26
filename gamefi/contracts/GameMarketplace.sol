// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title NFT Marketplace — fixed-price listings (OpenSea-style simplified)
contract GameMarketplace is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    IERC20 public immutable paymentToken;
    address public treasury;
    uint256 public feeBps = 250; // 2.5% marketplace fee

    uint256 public nextListingId;
    mapping(uint256 => Listing) public listings;

    event Listed(uint256 indexed listingId, address indexed seller, address nft, uint256 tokenId, uint256 price);
    event Sold(uint256 indexed listingId, address indexed buyer, uint256 price);
    event Cancelled(uint256 indexed listingId);

    constructor(address _paymentToken, address _treasury) {
        paymentToken = IERC20(_paymentToken);
        treasury = _treasury;
    }

    function list(address nftContract, uint256 tokenId, uint256 price) external returns (uint256) {
        require(price > 0, "Zero price");
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        uint256 id = nextListingId++;
        listings[id] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });
        emit Listed(id, msg.sender, nftContract, tokenId, price);
        return id;
    }

    function buy(uint256 listingId) external nonReentrant {
        Listing storage l = listings[listingId];
        require(l.active, "Not active");

        l.active = false;
        uint256 fee = (l.price * feeBps) / 10000;
        uint256 sellerProceeds = l.price - fee;

        paymentToken.safeTransferFrom(msg.sender, l.seller, sellerProceeds);
        paymentToken.safeTransferFrom(msg.sender, treasury, fee);
        IERC721(l.nftContract).transferFrom(address(this), msg.sender, l.tokenId);

        emit Sold(listingId, msg.sender, l.price);
    }

    function cancel(uint256 listingId) external {
        Listing storage l = listings[listingId];
        require(l.active && l.seller == msg.sender, "Not seller");
        l.active = false;
        IERC721(l.nftContract).transferFrom(address(this), msg.sender, l.tokenId);
        emit Cancelled(listingId);
    }
}
