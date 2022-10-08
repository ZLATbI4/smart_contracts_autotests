#!/bin/bash

npm cache clean # clear all node caches
npm install # install all stuff from package.json
npx hardhat clean # clean hardhat compiled artifacts
npx hardhat compile # compile smart-contracts
npx hardhat coverage # run tests and show coverage