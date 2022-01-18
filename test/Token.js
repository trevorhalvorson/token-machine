const { expect } = require("chai");

const decimals = "000000000000000000";

describe("Token contract", function () {
  const NAME = "TestToken";
  const SYMBOL = "TEST";
  const CAP = "1000000000";
  const INITIAL_SUPPLY = "1000000";

  let Token;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("Token");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    hardhatToken = await Token.deploy(NAME, SYMBOL, CAP, INITIAL_SUPPLY);

    await hardhatToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });

    it("Should have a total supply of tokens equal to the given cap", async function () {
      expect(await hardhatToken.cap()).to.equal(
        ethers.BigNumber.from(CAP + decimals)
      );
    });

    it("Should assign the initial supply of tokens equal to the owner", async function () {
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        INITIAL_SUPPLY + decimals
      );
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens to address", async function () {
      const mint = "500";
      await hardhatToken.mint(addr1.address, Number(mint));
      expect(await hardhatToken.balanceOf(addr1.address)).to.equal(
        mint + decimals
      );
    });

    it("Should fail if minter is not owner", async function () {
      const startSupply = await hardhatToken.totalSupply();

      await expect(
        hardhatToken.connect(addr1).mint(addr1.address, 1)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      expect(await hardhatToken.totalSupply()).to.equal(startSupply);
    });

    it("Should update balances and supply after mints", async function () {
      const startSupply = await hardhatToken.totalSupply();
      const ADDR1_MINT_AMOUNT = "100";
      const ADDR2_MINT_AMOUNT = "1000";

      await hardhatToken.mint(addr1.address, Number(ADDR1_MINT_AMOUNT));
      await hardhatToken.mint(addr2.address, Number(ADDR2_MINT_AMOUNT));

      expect(await hardhatToken.balanceOf(addr1.address)).to.equal(
        ADDR1_MINT_AMOUNT + decimals
      );

      expect(await hardhatToken.balanceOf(addr2.address)).to.equal(
        ADDR2_MINT_AMOUNT + decimals
      );

      expect(await hardhatToken.totalSupply()).to.equal(
        startSupply
          .add(ethers.BigNumber.from(ADDR1_MINT_AMOUNT + decimals))
          .add(ethers.BigNumber.from(ADDR2_MINT_AMOUNT + decimals))
      );
    });

    it("Should fail if supply hits cap", async function () {
      await expect(
        hardhatToken.mint(addr1.address, CAP + 1)
      ).to.be.revertedWith("ERC20Capped: cap exceeded");
    });
  });

  describe("Transfers", function () {
    it("Should allow addresses to transfer tokens", async function () {
      const MINT_AMOUNT = 100;
      const TRANSFER_AMOUNT = 50;
      await hardhatToken.mint(addr1.address, MINT_AMOUNT);
      await hardhatToken
        .connect(addr1)
        .transfer(addr2.address, TRANSFER_AMOUNT.toString() + decimals);

      expect(await hardhatToken.balanceOf(addr1.address)).to.equal(
        ethers.BigNumber.from(
          (MINT_AMOUNT - TRANSFER_AMOUNT).toString() + decimals
        )
      );

      expect(await hardhatToken.balanceOf(addr2.address)).to.equal(
        ethers.BigNumber.from(TRANSFER_AMOUNT.toString() + decimals)
      );
    });

    it("Should not allow addresses to transfer more tokens greater than their balance", async function () {
      const MINT_AMOUNT = 100;
      const TRANSFER_AMOUNT = 500;
      await hardhatToken.mint(addr1.address, MINT_AMOUNT);

      await expect(
        hardhatToken
          .connect(addr1)
          .transfer(addr2.address, TRANSFER_AMOUNT.toString() + decimals)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("Burn", function () {
    it("Should allow addresses to burn tokens", async function () {
      const MINT_AMOUNT = 100;
      const BURN_AMOUNT = 50;
      const startSupply = await hardhatToken.totalSupply();

      await hardhatToken.mint(addr1.address, MINT_AMOUNT);
      await hardhatToken.connect(addr1).burn(BURN_AMOUNT.toString() + decimals);

      expect(await hardhatToken.balanceOf(addr1.address)).to.equal(
        ethers.BigNumber.from((MINT_AMOUNT - BURN_AMOUNT).toString() + decimals)
      );

      expect(await hardhatToken.totalSupply()).to.equal(
        startSupply
          .add(ethers.BigNumber.from(MINT_AMOUNT + decimals))
          .sub(ethers.BigNumber.from(BURN_AMOUNT + decimals))
      );
    });

    it("Should not allow addresses to burn more tokens than they have", async function () {
      const MINT_AMOUNT = 100;
      const BURN_AMOUNT = 500;
      await hardhatToken.mint(addr1.address, MINT_AMOUNT);

      await expect(
        hardhatToken.connect(addr1).burn(BURN_AMOUNT.toString() + decimals)
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });

    it("Should not allow addresses to burn others' tokens", async function () {
      const MINT_AMOUNT = 100;
      const BURN_AMOUNT = 50;
      await hardhatToken.mint(addr1.address, MINT_AMOUNT);

      await expect(
        hardhatToken
          .connect(addr2)
          .burnFrom(addr1.address, BURN_AMOUNT.toString() + decimals)
      ).to.be.revertedWith("ERC20: burn amount exceeds allowance");
    });
  });
});
