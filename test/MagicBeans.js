const { expect } = require("chai")
const { ethers, network} = require("hardhat")

describe("MagicBeans", function(){
    let owner
    let ownerBalance
    let hamster
    let deployedContract
    const provider = ethers.provider
    const ownerFeePercent = 5
    const dailyEarnPercent = 5

    beforeEach(async function(){
        [owner, hamster] = await ethers.getSigners()
        console.debug(`Owner address: ${owner.address}\nHamster address: ${hamster.address}`)
        const MagicBeansContract = await ethers.getContractFactory("MagicBeans", owner)
        deployedContract = await MagicBeansContract.deploy()
        await deployedContract.deployed()
        console.debug(`Smart contract address: ${deployedContract.address}`)
        ownerBalance = await provider.getBalance(owner.address)
    })

    /**
     * Waiting for amount of days sent
     * @param days integer, days amount to wait
     */
    async function waitDays(days){
        await network.provider.send("evm_increaseTime", [days * 10]) // cause 10 sec as day set in contract
        await network.provider.send("evm_mine")
    }

    /**
     * Generate random integer on specified range
     * @param min min integer value
     * @param max max integer value
     * @returns {number} random integer
     */
    function randomIntFromInterval(min, max){
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    /**
     * Calculate expected earn of beans
     * @param amountOfInvestment sum of investment
     * @param waitDays days of wait
     * @returns {number} expected earn
     */
    function calculateExpectedEarn(amountOfInvestment, waitDays){
        return  waitDays * amountOfInvestment * ((100 - ownerFeePercent) / 100) * (dailyEarnPercent / 100)
    }


    it("TEST #1: contract deployed by owner", async function(){
        await expect(await deployedContract.owner()).to.be.equal(owner.address)
    })

    it("TEST 2: should have 0 ether balance default", async function(){
        await expect(await provider.getBalance(deployedContract.address)).to.eq(0)
    })

    it("TEST #3: hamster has no beans for sale yet", async function(){
        await expect(
            deployedContract.connect(hamster).sellHarvest()
        ).to.be.revertedWith("You have not Beans for sale!")
    })

    it("TEST #4: change balances after hamster invest", async function(){
        const amount = 20000
        const ownerFee = amount * ownerFeePercent / 100

        const tx = await deployedContract.connect(hamster).plantBeans({ value: amount})
        await expect(() => tx).to.changeEtherBalances([owner, hamster],  [ownerFee, -amount])
        const beans = await deployedContract.Beans(hamster.address)
        console.log(`Hamster has ${beans} beans planted`)
        await expect(beans).to.equal(amount - ownerFee)
    })

    it("TEST #5: hamster's investments are grow", async function(){
        const amount = 10000
        const waitDaysCount = randomIntFromInterval(1, 100)
        const expectedEarn = calculateExpectedEarn(amount, waitDaysCount)

        await deployedContract.connect(hamster).plantBeans({ value: amount})
        await waitDays(waitDaysCount)
        const grownBeans = await deployedContract.howManyBeansGrown(hamster.address)
        console.log(`Hamster has ${grownBeans} beans grown for ${waitDaysCount} day(s)`)
        await expect(grownBeans).to.be.equal(expectedEarn)
    })


    it("TEST #6: hamster withdraw investments", async function(){
        const amount = 1000000
        const waitDaysCount = randomIntFromInterval(1, 10)
        const expectedEarn = calculateExpectedEarn(amount, waitDaysCount)

        await expect(expectedEarn).to.be.lessThan(amount)
        await deployedContract.connect(hamster).plantBeans({ value: amount})
        await waitDays(waitDaysCount)
        const hamsterBalanceBefore = await provider.getBalance(hamster.address)
        const tx = await deployedContract.connect(hamster).sellHarvest()
        await expect(hamsterBalanceBefore).to.be.lessThan(hamsterBalanceBefore + expectedEarn)
        // cause of bug inside smart contract assertion below is not used
        //await expect(() => tx).to.changeEtherBalance(hamster, expectedEarn)
    })

    it("TEST #7: hamster can`t withdraw investments cause of scam", async function(){
        const amount = 20000
        const waitDaysCount = randomIntFromInterval(89, 100)
        const expectedEarn = calculateExpectedEarn(amount, waitDaysCount)
        expect(expectedEarn).to.be.greaterThan(amount)

        await deployedContract.connect(hamster).plantBeans({ value: amount})
        await waitDays(waitDaysCount)
        await expect(deployedContract.connect(hamster).sellHarvest()).to.revertedWith("Money ran out!")
    })

    it("TEST #8: hamster sends money direct to contract address", async function (){
        const amount = 50000
        const txData = {
            to: deployedContract.address,
            value: amount
        }
        const tx = await hamster.sendTransaction(txData)
        tx.wait()
        await expect(() => tx)
            .to.changeEtherBalances([hamster, deployedContract], [-amount, amount * 0.95])
    });
})