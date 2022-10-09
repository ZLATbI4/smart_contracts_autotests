// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

contract GrapeShop {
    address public owner;
    uint8 public constant GRAPE_COST_PER_KILO = 200;

    constructor() {
        owner = msg.sender;
    }

    function withdraw(address payable _to) external {
        require(msg.sender == owner, "You are not a shop owner!");
        _to.transfer(address(this).balance);
    }

    event Paid(address indexed _from, uint _amount, uint _grapeAmount, uint _timestamp);

    function pay() public payable{
        uint grapeAmount = calculateGrapeAmount();
        emit Paid(msg.sender, msg.value, grapeAmount, block.timestamp);
    }

    function calculateGrapeAmount() private returns(uint) {
        require(msg.value >= GRAPE_COST_PER_KILO, "You should buy 1 kilo of grape at least!");
        require(msg.value % GRAPE_COST_PER_KILO == 0, "You should buy whole kilos!");
        return msg.value / GRAPE_COST_PER_KILO;
    }

    receive() external payable {
        pay();
    }
}
