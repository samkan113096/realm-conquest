const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Chain Loot GameFi", function () {
  let token, hero, weapon, siege, staking, rewards, airdrop;
  let admin, player;

  beforeEach(async function () {
    [admin, player] = await ethers.getSigners();

    const GameToken = await ethers.getContractFactory("GameToken");
    token = await GameToken.deploy(admin.address);

    const GameHero = await ethers.getContractFactory("GameHero");
    hero = await GameHero.deploy(admin.address, await token.getAddress(), admin.address);

    const GameWeapon = await ethers.getContractFactory("GameWeapon");
    weapon = await GameWeapon.deploy(admin.address, await token.getAddress(), admin.address);

    const ZombieSiegeUpgradeable = await ethers.getContractFactory("ZombieSiegeUpgradeable");
    siege = await upgrades.deployProxy(
      ZombieSiegeUpgradeable,
      [admin.address, await token.getAddress(), await hero.getAddress(), await weapon.getAddress()],
      { kind: "uups", initializer: "initialize" }
    );
    await siege.waitForDeployment();

    const GameStaking = await ethers.getContractFactory("GameStaking");
    staking = await GameStaking.deploy(admin.address, await token.getAddress(), await token.getAddress());

    const GameRewards = await ethers.getContractFactory("GameRewards");
    rewards = await GameRewards.deploy(admin.address, await token.getAddress());

    const LootAirdrop = await ethers.getContractFactory("LootAirdrop");
    airdrop = await LootAirdrop.deploy(admin.address, await token.getAddress());

    const MINTER = await token.MINTER_ROLE();
    await token.grantRole(MINTER, await airdrop.getAddress());
    await token.grantRole(MINTER, await staking.getAddress());
    await token.grantRole(MINTER, await siege.getAddress());
    await token.transfer(player.address, ethers.parseEther("1000"));
  });

  it("mints hero with rarity stats", async function () {
    await token.connect(player).approve(await hero.getAddress(), ethers.parseEther("50"));
    await hero.connect(player).mintHero();
    expect(await hero.balanceOf(player.address)).to.equal(1);
    const stats = await hero.heroStats(0);
    expect(stats.rarity).to.be.lte(4);
    expect(await hero.totalMinted()).to.equal(1);
  });

  it("mints weapon and equips for combat power", async function () {
    await token.connect(player).approve(await hero.getAddress(), ethers.parseEther("50"));
    await hero.connect(player).mintHero();
    await token.connect(player).approve(await weapon.getAddress(), ethers.parseEther("25"));
    await weapon.connect(player).mintWeapon();
    await siege.connect(player).equipWeapon(0, 0);
    const power = await siege.getHeroPower(0);
    expect(power).to.be.gt(40);
  });

  it("fights zombie on-chain and mints LOOT on victory", async function () {
    await token.connect(player).approve(await hero.getAddress(), ethers.parseEther("50"));
    await hero.connect(player).mintHero();
    const preview = await siege.previewReward(0, 0);
    expect(preview).to.equal(ethers.parseEther("2"));

    const [hpBefore] = await siege.getHeroHp(0);
    const balBefore = await token.balanceOf(player.address);
    await siege.connect(player).fight(0, 0);
    const [hpAfter] = await siege.getHeroHp(0);
    expect(hpAfter).to.be.lt(hpBefore);
    const balAfter = await token.balanceOf(player.address);
    expect(balAfter).to.be.gte(balBefore);
  });

  it("UUPS proxy is upgradeable by admin", async function () {
    const proxyAddr = await siege.getAddress();
    const Factory = await ethers.getContractFactory("ZombieSiegeUpgradeable");
    const upgraded = await upgrades.upgradeProxy(proxyAddr, Factory, {
      kind: "uups",
      redeployImplementation: "always",
    });
    await upgraded.waitForDeployment();
    expect(await upgraded.VERSION()).to.equal("1.1.0");
    expect(await upgraded.fightCooldown()).to.equal(30n);
    expect(await upgraded.hpRegenPerHour()).to.equal(10n);
  });

  it("drains hero HP after every fight and regen over time", async function () {
    await token.connect(player).approve(await hero.getAddress(), ethers.parseEther("50"));
    await hero.connect(player).mintHero();

    const [hpFull] = await siege.getHeroHp(0);
    const maxHp = await siege.getHeroMaxHp(0);
    expect(hpFull).to.equal(maxHp);

    await siege.connect(player).fight(0, 0);
    const [hpAfter] = await siege.getHeroHp(0);
    expect(hpAfter).to.be.lt(hpFull);

    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine");
    const [hpRegen] = await siege.getHeroHp(0);
    expect(hpRegen).to.be.gt(hpAfter);
  });

  it("blocks fight when hero HP is too low", async function () {
    await token.connect(player).approve(await hero.getAddress(), ethers.parseEther("50"));
    await hero.connect(player).mintHero();

    for (let i = 0; i < 30; i++) {
      const [cur] = await siege.getHeroHp(0);
      if (cur < 15n) break;
      try {
        await siege.connect(player).fight(0, 0);
      } catch {
        break;
      }
      await ethers.provider.send("evm_increaseTime", [31]);
      await ethers.provider.send("evm_mine");
    }

    await expect(siege.connect(player).fight(0, 0)).to.be.revertedWith("Hero HP too low");
  });

  it("admin airdrop delivers LOOT once per address", async function () {
    const amount = ethers.parseEther("250");
    const balBefore = await token.balanceOf(player.address);
    await airdrop.setAllocation(player.address, amount);
    await airdrop.airdrop(player.address);
    expect(await token.balanceOf(player.address)).to.equal(balBefore + amount);
    await expect(airdrop.airdrop(player.address)).to.be.revertedWith("Already delivered");
  });

  it("recipient can claim allocated LOOT", async function () {
    const signers = await ethers.getSigners();
    const recipient = signers[5];
    await airdrop.setAllocation(recipient.address, ethers.parseEther("100"));
    await airdrop.connect(recipient).claim();
    expect(await token.balanceOf(recipient.address)).to.equal(ethers.parseEther("100"));
  });

  it("stakes and claims rewards", async function () {
    await token.connect(player).approve(await staking.getAddress(), ethers.parseEther("100"));
    await token.connect(admin).approve(await staking.getAddress(), ethers.parseEther("10000"));
    await staking.connect(admin).fundRewards(ethers.parseEther("10000"));
    await staking.connect(player).stake(ethers.parseEther("100"));
    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine");
    await staking.connect(player).claimRewards();
    expect(await token.balanceOf(player.address)).to.be.gt(ethers.parseEther("900"));
  });

  it("marketplace lists and buys hero NFT", async function () {
    const GameMarketplace = await ethers.getContractFactory("GameMarketplace");
    const market = await GameMarketplace.deploy(await token.getAddress(), admin.address);

    await token.connect(player).approve(await hero.getAddress(), ethers.parseEther("50"));
    await hero.connect(player).mintHero();

    const price = ethers.parseEther("80");
    await hero.connect(player).setApprovalForAll(await market.getAddress(), true);
    await market.connect(player).list(await hero.getAddress(), 0, price);

    const listing = await market.listings(0);
    expect(listing.active).to.equal(true);

    const [, buyer] = await ethers.getSigners();
    await token.transfer(buyer.address, ethers.parseEther("200"));
    await token.connect(buyer).approve(await market.getAddress(), price);
    await market.connect(buyer).buy(0);

    expect(await hero.ownerOf(0)).to.equal(buyer.address);
  });

  it("weapon mint stores nameSeed", async function () {
    await token.connect(player).approve(await weapon.getAddress(), ethers.parseEther("25"));
    await weapon.connect(player).mintWeapon();
    const stats = await weapon.weaponStats(0);
    expect(stats.nameSeed).to.be.lte(9999);
    expect(await token.symbol()).to.equal("LOOT");
  });
});
