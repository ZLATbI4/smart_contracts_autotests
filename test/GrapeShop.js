const { expect } = require("chai")
const { ethers, network} = require("hardhat")

describe("GrapeShop", function(){
    let owner
    let buyer
    let deployedContract
    let grapeCostPerKilo
    const provider = ethers.provider

    beforeEach(async function(){
        [owner, buyer] = await ethers.getSigners()
        const GrapeShopContract = await ethers.getContractFactory("GrapeShop", owner)
        deployedContract = await GrapeShopContract.deploy()
        await deployedContract.deployed()
        grapeCostPerKilo = await deployedContract.GRAPE_COST_PER_KILO()
    })

    it("TEST #1: contract deployed by owner", async function(){
        await expect(await deployedContract.owner()).to.be.equal(owner.address)
    })

    it("TEST 2: should have 0 ether balance default", async function(){
        await expect(await provider.getBalance(deployedContract.address)).to.eq(0)
    })

    it("TEST 3: buyer buy one kilo of grape", async function(){
        const amount = grapeCostPerKilo * 5
        const tx = await deployedContract.connect(buyer).pay({ value: amount})
        await expect(() => tx)
            .to.changeEtherBalances([buyer, deployedContract], [-amount, amount])
    })

    it("TEST 4: buyer can't buy less than kilo", async function(){
        await expect(
            deployedContract.connect(buyer).pay({ value: grapeCostPerKilo - 4})
        ).to.be.revertedWith("You should buy 1 kilo of grape at least!")
    })

    it("TEST 5: buyer can buy only whole kilos of grape", async function(){
        await expect(
            deployedContract.connect(buyer).pay({ value: grapeCostPerKilo + 30})
        ).to.be.revertedWith("You should buy whole kilos!")
    })

    it("TEST 6: paid event emitted after successful payment", async function(){
        const amount = grapeCostPerKilo * 20
        const tx = await deployedContract.connect(buyer).pay({ value: amount})
        const timestamp = (await ethers.provider.getBlock(tx.blockNumber)).timestamp
        await expect(tx)
            .to.emit(deployedContract, "Paid")
            .withArgs(buyer.address, amount, tx.value / grapeCostPerKilo, timestamp);
    })

    it("TEST 7: buyer send money to contract address", async function(){
        const amount = grapeCostPerKilo * 20
        const txData = {
            to: deployedContract.address,
            value: amount
        }
        const tx = await buyer.sendTransaction(txData)
        tx.wait()
        const timestamp = (await ethers.provider.getBlock(tx.blockNumber)).timestamp
        await expect(() => tx)
            .to.changeEtherBalances([buyer, deployedContract], [-amount, amount])
        await expect(tx)
            .to.emit(deployedContract, "Paid")
            .withArgs(buyer.address, amount, tx.value / grapeCostPerKilo, timestamp);
    })

    it("TEST 8: buyer can't withdraw money from contract", async function(){
        const amount = grapeCostPerKilo * 200
        await deployedContract.connect(buyer).pay({ value: amount})
        await expect(
            deployedContract.connect(buyer).withdraw(buyer.address)
        ).to.be.revertedWith("You are not a shop owner!")
    })

    it("TEST 9: owner can withdraw money from contract", async function(){
        await deployedContract.connect(buyer).pay({ value: grapeCostPerKilo * 200})
        await deployedContract.connect(buyer).pay({ value: grapeCostPerKilo * 30})
        const contractBalance = await provider.getBalance(deployedContract.address)
        const tx = await deployedContract.connect(owner).withdraw(owner.address)
        await expect(() => tx)
            .to.changeEtherBalances([owner, deployedContract], [contractBalance, -contractBalance])
    })
})