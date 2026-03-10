const MyCrypto = artifacts.require("MyCrypto");

module.exports = function (deployer) {
  // We are deploying the contract and giving you an initial supply of 10,000 tokens.
  // You can change the 10000 to any number you want!
  deployer.deploy(MyCrypto, 10000);
};