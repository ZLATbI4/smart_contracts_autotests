# Auto-tests for various smart-contracts
[![Run tests in Docker](https://github.com/ZLATbI4/smart_contracts_autotests/actions/workflows/docker-build.yml/badge.svg)](https://github.com/ZLATbI4/smart_contracts_autotests/actions/workflows/docker-build.yml)

### How to run tests?

**By shell:**

```shell
npm test
```

**Or via docker:**

```shell
docker build -t soltests .
docker run soltests
```