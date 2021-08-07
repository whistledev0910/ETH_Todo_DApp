// eslint-disable-next-line no-undef
var TodoList = artifacts.require("./TodoList.sol");

module.exports = function (deployer) {
  deployer.deploy(TodoList);
};
