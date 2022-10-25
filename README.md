# Auto-tests for various smart-contracts
[![After push/merge tests run](https://github.com/ZLATbI4/smart_contracts_autotests/actions/workflows/after-push-build.yml/badge.svg)](https://github.com/ZLATbI4/smart_contracts_autotests/actions/workflows/after-push-build.yml)
[![Nightly tests run](https://github.com/ZLATbI4/smart_contracts_autotests/actions/workflows/nightly-build.yml/badge.svg)](https://github.com/ZLATbI4/smart_contracts_autotests/actions/workflows/nightly-build.yml)

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
