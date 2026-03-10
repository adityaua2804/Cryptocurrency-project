const MyCrypto = artifacts.require("MyCrypto");

contract("MyCrypto", (accounts) => {
  const [owner, recipient, spender] = accounts;
  const initialSupply = 10000;
  const decimals = 18;
  const totalSupplyWithDecimals = BigInt(initialSupply) * BigInt(10 ** decimals);

  let token;

  beforeEach(async () => {
    token = await MyCrypto.new(initialSupply);
  });

  describe("Deployment", () => {
    it("should set the correct token name", async () => {
      const name = await token.name();
      assert.equal(name, "MyLabCoin", "Token name should be MyLabCoin");
    });

    it("should set the correct token symbol", async () => {
      const symbol = await token.symbol();
      assert.equal(symbol, "MLC", "Token symbol should be MLC");
    });

    it("should set the correct decimals", async () => {
      const dec = await token.decimals();
      assert.equal(dec.toNumber(), 18, "Decimals should be 18");
    });

    it("should set the correct total supply", async () => {
      const supply = await token.totalSupply();
      assert.equal(
        supply.toString(),
        totalSupplyWithDecimals.toString(),
        "Total supply should match initial supply with decimals"
      );
    });

    it("should assign total supply to deployer", async () => {
      const ownerBalance = await token.balanceOf(owner);
      assert.equal(
        ownerBalance.toString(),
        totalSupplyWithDecimals.toString(),
        "Owner should have all tokens"
      );
    });
  });

  describe("Transfer", () => {
    const transferAmount = BigInt(100) * BigInt(10 ** decimals);

    it("should transfer tokens between accounts", async () => {
      await token.transfer(recipient, transferAmount.toString(), { from: owner });

      const recipientBalance = await token.balanceOf(recipient);
      assert.equal(
        recipientBalance.toString(),
        transferAmount.toString(),
        "Recipient should receive tokens"
      );

      const ownerBalance = await token.balanceOf(owner);
      const expectedOwnerBalance = totalSupplyWithDecimals - transferAmount;
      assert.equal(
        ownerBalance.toString(),
        expectedOwnerBalance.toString(),
        "Owner balance should decrease"
      );
    });

    it("should emit Transfer event", async () => {
      const result = await token.transfer(recipient, transferAmount.toString(), { from: owner });

      assert.equal(result.logs.length, 1, "Should emit one event");
      assert.equal(result.logs[0].event, "Transfer", "Should be Transfer event");
      assert.equal(result.logs[0].args.from, owner, "From should be owner");
      assert.equal(result.logs[0].args.to, recipient, "To should be recipient");
      assert.equal(
        result.logs[0].args.value.toString(),
        transferAmount.toString(),
        "Value should match"
      );
    });

    it("should fail when sender has insufficient balance", async () => {
      const largeAmount = (totalSupplyWithDecimals + BigInt(1)).toString();

      try {
        await token.transfer(recipient, largeAmount, { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(
          error.message.includes("Insufficient balance"),
          "Error should mention insufficient balance"
        );
      }
    });
  });

  describe("Approve", () => {
    const approveAmount = BigInt(500) * BigInt(10 ** decimals);

    it("should approve tokens for spender", async () => {
      await token.approve(spender, approveAmount.toString(), { from: owner });

      const allowance = await token.allowance(owner, spender);
      assert.equal(
        allowance.toString(),
        approveAmount.toString(),
        "Allowance should be set correctly"
      );
    });

    it("should emit Approval event", async () => {
      const result = await token.approve(spender, approveAmount.toString(), { from: owner });

      assert.equal(result.logs.length, 1, "Should emit one event");
      assert.equal(result.logs[0].event, "Approval", "Should be Approval event");
      assert.equal(result.logs[0].args.owner, owner, "Owner should match");
      assert.equal(result.logs[0].args.spender, spender, "Spender should match");
      assert.equal(
        result.logs[0].args.value.toString(),
        approveAmount.toString(),
        "Value should match"
      );
    });

    it("should update allowance on re-approval", async () => {
      await token.approve(spender, approveAmount.toString(), { from: owner });

      const newAmount = BigInt(200) * BigInt(10 ** decimals);
      await token.approve(spender, newAmount.toString(), { from: owner });

      const allowance = await token.allowance(owner, spender);
      assert.equal(
        allowance.toString(),
        newAmount.toString(),
        "Allowance should be updated"
      );
    });
  });

  describe("TransferFrom", () => {
    const approveAmount = BigInt(500) * BigInt(10 ** decimals);
    const transferAmount = BigInt(100) * BigInt(10 ** decimals);

    beforeEach(async () => {
      await token.approve(spender, approveAmount.toString(), { from: owner });
    });

    it("should transfer tokens on behalf of owner", async () => {
      await token.transferFrom(owner, recipient, transferAmount.toString(), { from: spender });

      const recipientBalance = await token.balanceOf(recipient);
      assert.equal(
        recipientBalance.toString(),
        transferAmount.toString(),
        "Recipient should receive tokens"
      );
    });

    it("should decrease allowance after transferFrom", async () => {
      await token.transferFrom(owner, recipient, transferAmount.toString(), { from: spender });

      const remainingAllowance = await token.allowance(owner, spender);
      const expectedAllowance = approveAmount - transferAmount;
      assert.equal(
        remainingAllowance.toString(),
        expectedAllowance.toString(),
        "Allowance should decrease"
      );
    });

    it("should emit Transfer event", async () => {
      const result = await token.transferFrom(owner, recipient, transferAmount.toString(), {
        from: spender,
      });

      assert.equal(result.logs.length, 1, "Should emit one event");
      assert.equal(result.logs[0].event, "Transfer", "Should be Transfer event");
      assert.equal(result.logs[0].args.from, owner, "From should be owner");
      assert.equal(result.logs[0].args.to, recipient, "To should be recipient");
    });

    it("should fail when allowance is exceeded", async () => {
      const largeAmount = (approveAmount + BigInt(1)).toString();

      try {
        await token.transferFrom(owner, recipient, largeAmount, { from: spender });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(
          error.message.includes("Allowance exceeded"),
          "Error should mention allowance exceeded"
        );
      }
    });

    it("should fail when owner has insufficient balance", async () => {
      // Approve more than owner has
      const hugeAmount = (totalSupplyWithDecimals + BigInt(1)).toString();
      await token.approve(spender, hugeAmount, { from: owner });

      try {
        await token.transferFrom(owner, recipient, hugeAmount, { from: spender });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(
          error.message.includes("Insufficient balance"),
          "Error should mention insufficient balance"
        );
      }
    });
  });
});
