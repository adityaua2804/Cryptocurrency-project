const MyCrypto = artifacts.require("MyCrypto");

contract("MyCrypto", (accounts) => {
  const [owner, recipient, spender, other] = accounts;
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
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

    it("should emit Transfer event on deployment", async () => {
      const newToken = await MyCrypto.new(initialSupply);
      const events = await newToken.getPastEvents("Transfer", {
        fromBlock: 0,
        toBlock: "latest",
      });

      assert.equal(events.length, 1, "Should emit one Transfer event");
      assert.equal(events[0].args.from, ZERO_ADDRESS, "From should be zero address");
      assert.equal(events[0].args.to, owner, "To should be deployer");
      assert.equal(
        events[0].args.value.toString(),
        totalSupplyWithDecimals.toString(),
        "Value should be total supply"
      );
    });

    it("should handle zero initial supply", async () => {
      const zeroToken = await MyCrypto.new(0);
      const supply = await zeroToken.totalSupply();
      assert.equal(supply.toString(), "0", "Total supply should be 0");
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

    it("should return true on successful transfer", async () => {
      const result = await token.transfer.call(recipient, transferAmount.toString(), {
        from: owner,
      });
      assert.equal(result, true, "Transfer should return true");
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

    it("should fail when transferring to zero address", async () => {
      try {
        await token.transfer(ZERO_ADDRESS, transferAmount.toString(), { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(
          error.message.includes("Transfer to zero address"),
          "Error should mention zero address"
        );
      }
    });

    it("should allow transfer of zero tokens", async () => {
      const result = await token.transfer(recipient, "0", { from: owner });
      assert.equal(result.logs[0].args.value.toString(), "0", "Should transfer 0 tokens");
    });

    it("should allow transfer to self", async () => {
      const balanceBefore = await token.balanceOf(owner);
      await token.transfer(owner, transferAmount.toString(), { from: owner });
      const balanceAfter = await token.balanceOf(owner);

      assert.equal(
        balanceBefore.toString(),
        balanceAfter.toString(),
        "Balance should remain unchanged"
      );
    });

    it("should allow transfer of entire balance", async () => {
      await token.transfer(recipient, totalSupplyWithDecimals.toString(), { from: owner });

      const ownerBalance = await token.balanceOf(owner);
      const recipientBalance = await token.balanceOf(recipient);

      assert.equal(ownerBalance.toString(), "0", "Owner should have 0 tokens");
      assert.equal(
        recipientBalance.toString(),
        totalSupplyWithDecimals.toString(),
        "Recipient should have all tokens"
      );
    });

    it("should preserve balances on failed transfer", async () => {
      const ownerBalanceBefore = await token.balanceOf(owner);
      const recipientBalanceBefore = await token.balanceOf(recipient);

      try {
        await token.transfer(recipient, (totalSupplyWithDecimals + BigInt(1)).toString(), {
          from: owner,
        });
      } catch (error) {
        // Expected to fail
      }

      const ownerBalanceAfter = await token.balanceOf(owner);
      const recipientBalanceAfter = await token.balanceOf(recipient);

      assert.equal(
        ownerBalanceBefore.toString(),
        ownerBalanceAfter.toString(),
        "Owner balance should be unchanged"
      );
      assert.equal(
        recipientBalanceBefore.toString(),
        recipientBalanceAfter.toString(),
        "Recipient balance should be unchanged"
      );
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

    it("should return true on successful approval", async () => {
      const result = await token.approve.call(spender, approveAmount.toString(), { from: owner });
      assert.equal(result, true, "Approve should return true");
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
      assert.equal(allowance.toString(), newAmount.toString(), "Allowance should be updated");
    });

    it("should fail when approving zero address", async () => {
      try {
        await token.approve(ZERO_ADDRESS, approveAmount.toString(), { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(
          error.message.includes("Approve to zero address"),
          "Error should mention zero address"
        );
      }
    });

    it("should allow approving zero amount", async () => {
      await token.approve(spender, approveAmount.toString(), { from: owner });
      await token.approve(spender, "0", { from: owner });

      const allowance = await token.allowance(owner, spender);
      assert.equal(allowance.toString(), "0", "Allowance should be zero");
    });

    it("should allow approving more than balance", async () => {
      const hugeAmount = (totalSupplyWithDecimals * BigInt(2)).toString();
      await token.approve(spender, hugeAmount, { from: owner });

      const allowance = await token.allowance(owner, spender);
      assert.equal(allowance.toString(), hugeAmount, "Allowance can exceed balance");
    });

    it("should maintain independent allowances for different spenders", async () => {
      const amount1 = BigInt(100) * BigInt(10 ** decimals);
      const amount2 = BigInt(200) * BigInt(10 ** decimals);

      await token.approve(spender, amount1.toString(), { from: owner });
      await token.approve(other, amount2.toString(), { from: owner });

      const allowance1 = await token.allowance(owner, spender);
      const allowance2 = await token.allowance(owner, other);

      assert.equal(allowance1.toString(), amount1.toString(), "Spender allowance should match");
      assert.equal(allowance2.toString(), amount2.toString(), "Other allowance should match");
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

    it("should return true on successful transferFrom", async () => {
      const result = await token.transferFrom.call(owner, recipient, transferAmount.toString(), {
        from: spender,
      });
      assert.equal(result, true, "TransferFrom should return true");
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

    it("should fail when transferring to zero address", async () => {
      try {
        await token.transferFrom(owner, ZERO_ADDRESS, transferAmount.toString(), { from: spender });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(
          error.message.includes("Transfer to zero address"),
          "Error should mention zero address"
        );
      }
    });

    it("should allow transferring entire allowance", async () => {
      await token.transferFrom(owner, recipient, approveAmount.toString(), { from: spender });

      const remainingAllowance = await token.allowance(owner, spender);
      assert.equal(remainingAllowance.toString(), "0", "Allowance should be zero");
    });

    it("should allow spender to transfer to themselves", async () => {
      const spenderBalanceBefore = await token.balanceOf(spender);

      await token.transferFrom(owner, spender, transferAmount.toString(), { from: spender });

      const spenderBalanceAfter = await token.balanceOf(spender);
      assert.equal(
        (BigInt(spenderBalanceAfter.toString()) - BigInt(spenderBalanceBefore.toString())).toString(),
        transferAmount.toString(),
        "Spender should receive tokens"
      );
    });
  });

  describe("IncreaseAllowance", () => {
    const initialAllowance = BigInt(100) * BigInt(10 ** decimals);
    const addedValue = BigInt(50) * BigInt(10 ** decimals);

    it("should increase allowance correctly", async () => {
      await token.approve(spender, initialAllowance.toString(), { from: owner });
      await token.increaseAllowance(spender, addedValue.toString(), { from: owner });

      const allowance = await token.allowance(owner, spender);
      const expectedAllowance = initialAllowance + addedValue;
      assert.equal(allowance.toString(), expectedAllowance.toString(), "Allowance should increase");
    });

    it("should return true on success", async () => {
      const result = await token.increaseAllowance.call(spender, addedValue.toString(), {
        from: owner,
      });
      assert.equal(result, true, "Should return true");
    });

    it("should emit Approval event with new total", async () => {
      await token.approve(spender, initialAllowance.toString(), { from: owner });
      const result = await token.increaseAllowance(spender, addedValue.toString(), { from: owner });

      const expectedTotal = initialAllowance + addedValue;
      assert.equal(result.logs[0].event, "Approval", "Should emit Approval event");
      assert.equal(
        result.logs[0].args.value.toString(),
        expectedTotal.toString(),
        "Should emit new total allowance"
      );
    });

    it("should fail when increasing allowance for zero address", async () => {
      try {
        await token.increaseAllowance(ZERO_ADDRESS, addedValue.toString(), { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(
          error.message.includes("Approve to zero address"),
          "Error should mention zero address"
        );
      }
    });

    it("should work with zero initial allowance", async () => {
      await token.increaseAllowance(spender, addedValue.toString(), { from: owner });

      const allowance = await token.allowance(owner, spender);
      assert.equal(allowance.toString(), addedValue.toString(), "Should set allowance from zero");
    });
  });

  describe("DecreaseAllowance", () => {
    const initialAllowance = BigInt(100) * BigInt(10 ** decimals);
    const subtractedValue = BigInt(50) * BigInt(10 ** decimals);

    beforeEach(async () => {
      await token.approve(spender, initialAllowance.toString(), { from: owner });
    });

    it("should decrease allowance correctly", async () => {
      await token.decreaseAllowance(spender, subtractedValue.toString(), { from: owner });

      const allowance = await token.allowance(owner, spender);
      const expectedAllowance = initialAllowance - subtractedValue;
      assert.equal(allowance.toString(), expectedAllowance.toString(), "Allowance should decrease");
    });

    it("should return true on success", async () => {
      const result = await token.decreaseAllowance.call(spender, subtractedValue.toString(), {
        from: owner,
      });
      assert.equal(result, true, "Should return true");
    });

    it("should emit Approval event with new total", async () => {
      const result = await token.decreaseAllowance(spender, subtractedValue.toString(), {
        from: owner,
      });

      const expectedTotal = initialAllowance - subtractedValue;
      assert.equal(result.logs[0].event, "Approval", "Should emit Approval event");
      assert.equal(
        result.logs[0].args.value.toString(),
        expectedTotal.toString(),
        "Should emit new total allowance"
      );
    });

    it("should fail when decreasing below zero", async () => {
      const tooMuch = (initialAllowance + BigInt(1)).toString();

      try {
        await token.decreaseAllowance(spender, tooMuch, { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(
          error.message.includes("Decreased allowance below zero"),
          "Error should mention below zero"
        );
      }
    });

    it("should fail when decreasing allowance for zero address", async () => {
      try {
        await token.decreaseAllowance(ZERO_ADDRESS, subtractedValue.toString(), { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(
          error.message.includes("Approve to zero address"),
          "Error should mention zero address"
        );
      }
    });

    it("should allow decreasing to zero", async () => {
      await token.decreaseAllowance(spender, initialAllowance.toString(), { from: owner });

      const allowance = await token.allowance(owner, spender);
      assert.equal(allowance.toString(), "0", "Allowance should be zero");
    });
  });

  describe("Invariants", () => {
    it("total supply should remain constant after transfers", async () => {
      const supplyBefore = await token.totalSupply();

      const amount = BigInt(100) * BigInt(10 ** decimals);
      await token.transfer(recipient, amount.toString(), { from: owner });
      await token.transfer(other, amount.toString(), { from: owner });
      await token.transfer(owner, (amount / BigInt(2)).toString(), { from: recipient });

      const supplyAfter = await token.totalSupply();
      assert.equal(supplyBefore.toString(), supplyAfter.toString(), "Total supply should not change");
    });

    it("sum of all balances should equal total supply", async () => {
      const amount1 = BigInt(100) * BigInt(10 ** decimals);
      const amount2 = BigInt(200) * BigInt(10 ** decimals);

      await token.transfer(recipient, amount1.toString(), { from: owner });
      await token.transfer(spender, amount2.toString(), { from: owner });
      await token.transfer(other, amount1.toString(), { from: owner });

      const balanceOwner = BigInt((await token.balanceOf(owner)).toString());
      const balanceRecipient = BigInt((await token.balanceOf(recipient)).toString());
      const balanceSpender = BigInt((await token.balanceOf(spender)).toString());
      const balanceOther = BigInt((await token.balanceOf(other)).toString());

      const totalBalances = balanceOwner + balanceRecipient + balanceSpender + balanceOther;
      const totalSupply = await token.totalSupply();

      assert.equal(
        totalBalances.toString(),
        totalSupply.toString(),
        "Sum of balances should equal total supply"
      );
    });
  });
});
