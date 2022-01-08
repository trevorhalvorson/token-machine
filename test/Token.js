const { expect } = require("chai");

describe("Token contract", function () {
  const NAME = "TestToken";
  const SYMBOL = "TEST";
  const CAP = 1000000;
  const INITIAL_SUPPLY = 100000;

  let Token;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("Token");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    hardhatToken = await Token.deploy(
      NAME,
      SYMBOL,
      CAP,
      INITIAL_SUPPLY,
    );

    await hardhatToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });

    it("Should have a total supply of tokens equal to the given cap", async function () {
      expect(await hardhatToken.cap()).to.equal(CAP);
    });

    it("Should assign the initial supply of tokens equal to the owner", async function () {
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        INITIAL_SUPPLY
      );
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens to address", async function () {
      await hardhatToken.mint(addr1.address, 500);
      const addr1Balance = await hardhatToken.balanceOf(
        addr1.address
      );
      expect(addr1Balance).to.equal(500);
    });

    it("Should fail if minter is not owner", async function () {
      const startSupply = await hardhatToken.totalSupply();

      await expect(
        hardhatToken.connect(addr1).mint(addr1.address, 1)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      expect(await hardhatToken.totalSupply()).to.equal(
        startSupply
      );
    });

    it("Should update balances and supply after mints", async function () {
      const startSupply = await hardhatToken.totalSupply();
      const ADDR1_MINT_AMOUNT = 100;
      const ADDR2_MINT_AMOUNT = 1000;

      await hardhatToken.mint(addr1.address, ADDR1_MINT_AMOUNT);
      await hardhatToken.mint(addr2.address, ADDR2_MINT_AMOUNT);

      const addr1Balance = await hardhatToken.balanceOf(
        addr1.address
      );
      expect(addr1Balance).to.equal(ADDR1_MINT_AMOUNT);

      const addr2Balance = await hardhatToken.balanceOf(
        addr2.address
      );
      expect(addr2Balance).to.equal(ADDR2_MINT_AMOUNT);

      expect(await hardhatToken.totalSupply()).to.equal(
        Number(startSupply) + ADDR1_MINT_AMOUNT + ADDR2_MINT_AMOUNT
      );
    });

    it("Should fail if supply hits cap", async function () {
      await expect(
        hardhatToken.mint(addr1.address, CAP + 1)
      ).to.be.revertedWith("ERC20Capped: cap exceeded");
    });
  });
});
