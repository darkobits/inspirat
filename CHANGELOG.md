# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.18.0](https://github.com/darkobits/inspirat/compare/v0.17.0...v0.18.0) (2024-06-15)


### ✨ Features

* Add photo timeline. ([695dbb8](https://github.com/darkobits/inspirat/commit/695dbb8362238579107989b90d44f8b3b369d707))


### 🐞 Bug Fixes

* Adjust photo overrides. ([8be393f](https://github.com/darkobits/inspirat/commit/8be393fb250a3dcede993973f657ae9fb774d165))
* Custom image sources generate palette on demand. ([3262148](https://github.com/darkobits/inspirat/commit/326214842555d00187b7106ca8d634877a08972f))
* Improve type checks. ([f9727c5](https://github.com/darkobits/inspirat/commit/f9727c5a8499411e2f64b1b6db489f52afc38807))


### 🏗 Chores

* **deps:** Update dependencies. ([bc4bbf2](https://github.com/darkobits/inspirat/commit/bc4bbf22c074352913ceeeb5a72f0a9e55aa2332))


### 🛠 Refactoring

* Image pre-loading retries with exponential back-off. ([36968cd](https://github.com/darkobits/inspirat/commit/36968cd1d6c2d6d0e4c40aea8d48c8e80aa60014))
* Self-host fonts. ([0fb6fb3](https://github.com/darkobits/inspirat/commit/0fb6fb3824e576567abdd3a6e22d0afe3c29d454))
* Tune animations. ([5b21d77](https://github.com/darkobits/inspirat/commit/5b21d777a86616fa76da7465c25f7bced9e08828))
* Update DevTools. ([f2b3c12](https://github.com/darkobits/inspirat/commit/f2b3c12d5d4ddd6edaf5515a607652c28219c5ab))
* Various improvements. ([c3213c8](https://github.com/darkobits/inspirat/commit/c3213c8118e41d5459c0b2e5cdfb51a8cb04d6ab))


### 🎨 Style

* Various UI tweaks. ([447b0b3](https://github.com/darkobits/inspirat/commit/447b0b375e27be47cbbda5b75575541bf2c8963f))

## [0.17.0](https://github.com/darkobits/inspirat/compare/v0.16.0...v0.17.0) (2024-06-10)


### ✨ Features

* Add `currentPhotoPreloaded` to context. ([482bf43](https://github.com/darkobits/inspirat/commit/482bf434411b50be329056929b5ca87e16e98d7b))
* Implement seasons. ([208a8db](https://github.com/darkobits/inspirat/commit/208a8dbabfeb90cffbcc6cd03e793f2887115ec3))


### 🏗 Chores

* Adjust dev tools timeout. ([cf02c23](https://github.com/darkobits/inspirat/commit/cf02c2385f15746f4d4bee4c9d7a9799669a9a83))
* Disable over-scroll. ([0f22516](https://github.com/darkobits/inspirat/commit/0f22516afea762b62fe87bc26d63c78bb09d485c))


### 🛠 Refactoring

* Offset wraps, stagger low/high quality URL updates. ([e58b1f4](https://github.com/darkobits/inspirat/commit/e58b1f48d8b3c2c79a13eb1a471a8fa2f01923db))
* Partially migrate to Jotai. ([7b9efa0](https://github.com/darkobits/inspirat/commit/7b9efa03b2c47d6d8cd051dddb1f775ae9c371e5))
* Tune shadows. ([365dea6](https://github.com/darkobits/inspirat/commit/365dea60bcc5bcacf7cb94b2ee6df4d631e1aa22))
* Tune styles. ([b66ee50](https://github.com/darkobits/inspirat/commit/b66ee50692e14c506cbac2d8563f9d1050d7c565))
* Tweak animations. ([971d5ca](https://github.com/darkobits/inspirat/commit/971d5caf9d5e80d00d543735c5f00503c64a87f3))
* Wait for images to pre-load. ([9973bbb](https://github.com/darkobits/inspirat/commit/9973bbb54b1a585868bae7f5d07494a130e26ebd))

## [0.16.0](https://github.com/darkobits/inspirat/compare/v0.15.3...v0.16.0) (2024-06-07)


### ✨ Features

* Add `autoprefixer`. ([0b78341](https://github.com/darkobits/inspirat/commit/0b78341557ec163b044639b846653cf98a456f17))
* Add logger. ([e90d0df](https://github.com/darkobits/inspirat/commit/e90d0df7d44bf3e6eef2cd7c06b7ab290a732ce6))


### 🐞 Bug Fixes

* **devtools:** Fix styling transitions, loading indicator. ([650aaf2](https://github.com/darkobits/inspirat/commit/650aaf29bfaf0372b0e7583a618cebc87a9f1e6c))


### 🏗 Chores

* Add debugging for preload image cache. ([edb9353](https://github.com/darkobits/inspirat/commit/edb93538fd5bb0d0a2f5cc0770dba14b9d2570e4))
* **deps:** Migrate to `[@aws-sdk](https://github.com/aws-sdk)`. ([c46465c](https://github.com/darkobits/inspirat/commit/c46465c7099a16bbfd94eb55bba1a3ed31cfd941))
* Misc. cleanup. ([550ece5](https://github.com/darkobits/inspirat/commit/550ece5c02be84a6816f3853e48ea166d3e0e7c8))
* Misc. cleanup. ([a355c57](https://github.com/darkobits/inspirat/commit/a355c579ac06c7b84df3aaea41c4cb1088b89dd5))


### 🛠 Refactoring

* Drop `singleton-hook` in favor of Context, add zoom effect, other improvements. ([92511b0](https://github.com/darkobits/inspirat/commit/92511b06fdc36e8fee0b135475ae707307ad4cff))
* Improve Dev Tools. ([9676f76](https://github.com/darkobits/inspirat/commit/9676f76e2a702895b7ebb80d27a00aad3486aa3b))
* Improve layout on mobile devices. ([b85fa0a](https://github.com/darkobits/inspirat/commit/b85fa0aa04d67e8235f1d65390ead86276cb97b3))
* Storage `createInstance` uses default options. ([e30a30c](https://github.com/darkobits/inspirat/commit/e30a30cb696e341ce885eedbee519a3bbced7381))
* Tune glass effect. ([d0ecf93](https://github.com/darkobits/inspirat/commit/d0ecf934690aca8e70480072c86daf2a9653fae1))
* Tune image preloading behavior. ([8788b59](https://github.com/darkobits/inspirat/commit/8788b59d749a7e02e0d7c32de38a89288a09624b))

## [0.15.3](https://github.com/darkobits/inspirat/compare/v0.15.2...v0.15.3) (2024-06-02)


### 🐞 Bug Fixes

* Roll-back `serverless-kit` update. ([d602f74](https://github.com/darkobits/inspirat/commit/d602f74d49ca70ff346f01ed661cd0fc2812c423))


### 🛠 Refactoring

* Add glass effect. ([7f72796](https://github.com/darkobits/inspirat/commit/7f7279627c5a6e67264c00957a9428e4b9630498))

## [0.15.2](https://github.com/darkobits/inspirat/compare/v0.15.1...v0.15.2) (2024-06-02)


### 🐞 Bug Fixes

* Fix code-splitting. ([3af0b9a](https://github.com/darkobits/inspirat/commit/3af0b9a466d68866ecdbdeaf048a41d5ba7a628b))

## [0.15.1](https://github.com/darkobits/inspirat/compare/v0.15.0...v0.15.1) (2024-06-02)


### 🐞 Bug Fixes

* Fix code-splitting. ([f949766](https://github.com/darkobits/inspirat/commit/f9497661d27c85555e9e2753bade20f4ab178991))

## [0.15.0](https://github.com/darkobits/inspirat/compare/v0.14.1...v0.15.0) (2024-06-02)


### ✨ Features

* Add PWA support. ([2800868](https://github.com/darkobits/inspirat/commit/28008688f68d9ba293446784d63abddad44db62c))


### 🐞 Bug Fixes

* Reference cron function correctly. ([b9d5f76](https://github.com/darkobits/inspirat/commit/b9d5f76f206ac869afaeab8481e6f269701db9f2))


### 🏗 Chores

* Cleanup. ([3b0746a](https://github.com/darkobits/inspirat/commit/3b0746af500023d0bd30adfaeffe08b6f4ef9408))
* **deps:** Update dependencies. ([f5a8224](https://github.com/darkobits/inspirat/commit/f5a8224c45506022861b325615f9ba8a5f124f35))
* **deps:** Update dependencies. ([4f50dcf](https://github.com/darkobits/inspirat/commit/4f50dcf9abc1007cd507ab326825ae184ad71e19))
* **deps:** Update dependencies. ([9e7ede4](https://github.com/darkobits/inspirat/commit/9e7ede4ed3dae90f44037af9ce49ce18ec56876a))
* **deps:** Update dependencies. ([1ceff45](https://github.com/darkobits/inspirat/commit/1ceff456c03ade85800cdbdbfe223e161ca3279c))
* **deps:** Update dependencies. ([d49c483](https://github.com/darkobits/inspirat/commit/d49c4838ae3247857cf3f04f5f65d6e7b5d58483))
* **infra:** Invoke update lambda after deploys. ([181362d](https://github.com/darkobits/inspirat/commit/181362dc67ec66a5eefbc05a0845d06f726c2105))
* **infra:** Only run cron in `production`. ([6eba7bb](https://github.com/darkobits/inspirat/commit/6eba7bba622d2956464d323f408603d561d8057f))
* **infra:** Update infra utils. ([83d3e16](https://github.com/darkobits/inspirat/commit/83d3e16bc05e11507f4686e70775f7cb14433fac))
* Update Node version in CI. ([d4f9a77](https://github.com/darkobits/inspirat/commit/d4f9a77658fda60d6f8db66a08cf1041dc83591e))


### 🛠 Refactoring

* Improve sync-collections. ([756ac73](https://github.com/darkobits/inspirat/commit/756ac73147c53bd06d00192fe95aa65e03be29e4))
* Misc. stylistic updates. ([42928d0](https://github.com/darkobits/inspirat/commit/42928d05d66eaa8ef81316ff50eace63c035af73))
* Update dependencies, reorganize project. ([0b16944](https://github.com/darkobits/inspirat/commit/0b16944864907805a370cdbca14f11289d7f29a8))

## [0.14.1](https://github.com/darkobits/inspirat/compare/v0.14.0...v0.14.1) (2023-02-03)

## [0.14.0](https://github.com/darkobits/inspirat/compare/v0.13.2...v0.14.0) (2023-02-03)


### ✨ Features

* Use LQIP for progressive enchancement. ([98b367c](https://github.com/darkobits/inspirat/commit/98b367ca8ca2c60452d63331a749e2b6a4ba93ea))


### 🐞 Bug Fixes

* Clean up useStorageItem logic. ([199f8f3](https://github.com/darkobits/inspirat/commit/199f8f3bf574db1f451583e0141f52bbcb882b5b))


### 📖 Documentation

* Update README. ([8729cd2](https://github.com/darkobits/inspirat/commit/8729cd2796a3cdb1ba88d8c04a640b12b824a8ed))
* Update README. ([ce5ca25](https://github.com/darkobits/inspirat/commit/ce5ca25c83d9d5c7e1c69a40d21858391fa8b763))


### 🏗 Chores

* **client:** Update dependencies. ([9f708c9](https://github.com/darkobits/inspirat/commit/9f708c96872e7a7cc5fe18d402ae51c80514b824))
* Debugging. ([2c901b3](https://github.com/darkobits/inspirat/commit/2c901b3731d340ec183e9c7fc225f97864e20061))
* **deps:** Update dependencies. ([253d6dd](https://github.com/darkobits/inspirat/commit/253d6dd14384c93438cae3b4d74259999a775339))
* Disable GitHub Actions. ([86aac23](https://github.com/darkobits/inspirat/commit/86aac23d9d30595110647507bf41242e92e94b13))
* **infra:** Add log retention policies. ([296d763](https://github.com/darkobits/inspirat/commit/296d763e1094407e777b55f4034983764585107e))
* Migrate to `serverless-stack`. ([30540e0](https://github.com/darkobits/inspirat/commit/30540e07f6abc0295960f5e00c791e2156c6d9db))
* Misc. backend updates. ([6dbbe53](https://github.com/darkobits/inspirat/commit/6dbbe5325520134fd6310e30aec353c257514f19))
* Misc. client updates. ([1c5b400](https://github.com/darkobits/inspirat/commit/1c5b400e3c7a418b36e536e1eb21515daa1f3b6b))
* Update dependencies. ([a698bf8](https://github.com/darkobits/inspirat/commit/a698bf88fe552c210ef6760e65806060ca82d0ff))
* Update dependencies. ([f5d3820](https://github.com/darkobits/inspirat/commit/f5d38205f07b3159cf7c0dd766b42042b891e959))
* Update to tsx/vite. ([bd84c9c](https://github.com/darkobits/inspirat/commit/bd84c9c2874cbdbd132b8e39773384808ccce24d))
* Use `semantic-release`. ([011ad54](https://github.com/darkobits/inspirat/commit/011ad545992df08232fb32040af6ff966c86a77c))
* **web:** Add preliminary support for seasons. ([f83f148](https://github.com/darkobits/inspirat/commit/f83f1482ed763cbc89432d1ca0ab8cae0b490386))
* **web:** Update overrides. ([09e7dde](https://github.com/darkobits/inspirat/commit/09e7ddeba8005cad26370e78ac02330169a4c625))


### 🛠 Refactoring

* **backend:** Use Webpack Serverless preset. ([c72b028](https://github.com/darkobits/inspirat/commit/c72b0284de5b20e01243d397ef07f9a147cb3b25))
* Reduce hold time for settings. ([095ecb9](https://github.com/darkobits/inspirat/commit/095ecb9fb695dddb341f9e3ad742fddabb8e3459))
* Switch to chance.js. ([d2a2186](https://github.com/darkobits/inspirat/commit/d2a21865fb96b84b557018753bd74adf4bef4319))
* Update dependencies, reorganize code, migrate from Linaria to Vanilla Extract. ([78021e3](https://github.com/darkobits/inspirat/commit/78021e3f00a652fe7e75b6f9f279fc900876459d))
* Update styles. ([8b7450c](https://github.com/darkobits/inspirat/commit/8b7450c59322c40329c142482efe06b7e4e9ec82))
* Update styles. ([1147722](https://github.com/darkobits/inspirat/commit/1147722649c12296e7e050c26d93a38435055659))

### [0.13.2](https://github.com/darkobits/inspirat/compare/v0.13.1...v0.13.2) (2020-12-04)


### 🏗 Chores

* Deploy to Netlify sites via Travis CI. ([c7c0967](https://github.com/darkobits/inspirat/commit/c7c09675b85f4597631a1db983bc32288d73c8b3))
* Improve logging in webpack-utils. ([6b206eb](https://github.com/darkobits/inspirat/commit/6b206eb2e4e8a759d0ca3ff32d92e1586d96ca26))
* Migrate to @darkobits/ts(x). ([9186b78](https://github.com/darkobits/inspirat/commit/9186b7827e7d21e9ab33b821f1b5806e4dbb7c95))
* Update Travis config. ([6ca058e](https://github.com/darkobits/inspirat/commit/6ca058e6a811d6792b25e5dddf940640c8720087))


### 📖 Documentation

* Update README. ([56c8efe](https://github.com/darkobits/inspirat/commit/56c8efe67a42d315ff1d7576914e95ffca4438f1))



### [0.13.1](https://github.com/darkobits/inspirat/compare/v0.13.0...v0.13.1) (2020-11-12)


### Bug Fixes

* Ensure first image always appears immediately. ([42f670a](https://github.com/darkobits/inspirat/commit/42f670a7d5732c78c8b2dea41327954bc2748773))



## [0.13.0](https://github.com/darkobits/inspirat/compare/v0.12.7...v0.13.0) (2020-11-09)


### Features

* **backend:** Add dominant color computation. ([1766d3a](https://github.com/darkobits/inspirat/commit/1766d3a22cdb9c4c508326e6b5b2da684a469294))
* **client:** Improve image rendering, transitions, color-handling, overrides. ([9d2f0dc](https://github.com/darkobits/inspirat/commit/9d2f0dcabeaca66c16673f2dc965ad53d10e820a))


### Bug Fixes

* **client:** Improve image quality settings. ([abc999d](https://github.com/darkobits/inspirat/commit/abc999d83f8f9acd1990bd99ab1fae9bf0178822))



## [0.12.7](https://github.com/darkobits/inspirat/compare/v0.12.6...v0.12.7) (2020-10-23)


### Bug Fixes

* **client:** Add bottom gradient. ([e8ba94b](https://github.com/darkobits/inspirat/commit/e8ba94b3bf4c6dd2b34719d6d7ee35d5f64bf9d0))





## [0.12.6](https://github.com/darkobits/inspirat/compare/v0.12.5...v0.12.6) (2020-10-23)

**Note:** Version bump only for package inspirat





## [0.12.5](https://github.com/darkobits/inspirat/compare/v0.12.4...v0.12.5) (2020-10-23)


### Bug Fixes

* **client:** Extension publisher validates options after determining release eligibility. ([3cecc0b](https://github.com/darkobits/inspirat/commit/3cecc0b553d427386bd1b650f12ab300f0f5d27e))





## [0.12.4](https://github.com/darkobits/inspirat/compare/v0.12.3...v0.12.4) (2020-10-19)

**Note:** Version bump only for package inspirat





## [0.12.3](https://github.com/darkobits/inspirat/compare/v0.12.2...v0.12.3) (2020-10-17)

**Note:** Version bump only for package inspirat





## [0.12.2](https://github.com/darkobits/inspirat/compare/v0.12.1...v0.12.2) (2020-10-17)

**Note:** Version bump only for package inspirat





## [0.12.1](https://github.com/darkobits/inspirat/compare/v0.12.0...v0.12.1) (2020-10-17)

**Note:** Version bump only for package inspirat





# [0.12.0](https://github.com/darkobits/inspirat/compare/v0.11.3...v0.12.0) (2020-10-17)


### Features

* Add Introduction modal. ([647f2a6](https://github.com/darkobits/inspirat/commit/647f2a61ab7f264a8b73553b81607a5260808a0a))





## [0.11.3](https://github.com/darkobits/inspirat/compare/v0.11.2...v0.11.3) (2020-09-05)

**Note:** Version bump only for package inspirat





## [0.11.2](https://github.com/darkobits/inspirat/compare/v0.11.1...v0.11.2) (2020-09-04)


### Bug Fixes

* Settings defaults to closed. ([3ffc996](https://github.com/darkobits/inspirat/commit/3ffc9967f80041417294e8a14648e01d237674a2))





## [0.11.1](https://github.com/darkobits/inspirat/compare/v0.11.0...v0.11.1) (2020-09-04)


### Bug Fixes

* Revert chrome-webstore-upload version. ([0932645](https://github.com/darkobits/inspirat/commit/09326456025f690da05e249d6eeaf594d23d9966))





# [0.11.0](https://github.com/darkobits/inspirat/compare/v0.10.7...v0.11.0) (2020-09-04)


### Bug Fixes

* **publish-script:** Check for credentials only after a publish should happen. ([e8486d3](https://github.com/darkobits/inspirat/commit/e8486d33c7c8b4ed0c47e97a0135d360e2da0ac9))


### Features

* Add 'meta' URL param. ([3687cc7](https://github.com/darkobits/inspirat/commit/3687cc7332b28a2e2499af29c4ca4071d6f8efa0))
* Add Settings modal. ([309e712](https://github.com/darkobits/inspirat/commit/309e712a200a33cd9ffeb5e1a9b22e3c88316f4e))
* Automatically update period. ([d62f935](https://github.com/darkobits/inspirat/commit/d62f9357d83719d96bf0cdd7afe741267e91766c))





## [0.10.7](https://github.com/darkobits/inspirat/compare/v0.10.6...v0.10.7) (2020-06-04)


### Bug Fixes

* Add font-size to ImageMeta. ([aca9ef6](https://github.com/darkobits/inspirat/commit/aca9ef6c8fddd8b9b7bc0dab675301d26303f309))





## [0.10.6](https://github.com/darkobits/inspirat/compare/v0.10.5...v0.10.6) (2020-06-04)

**Note:** Version bump only for package inspirat





## [0.10.5](https://github.com/darkobits/inspirat/compare/v0.10.4...v0.10.5) (2020-06-03)

**Note:** Version bump only for package inspirat





## [0.10.4](https://github.com/darkobits/inspirat/compare/v0.10.3...v0.10.4) (2020-06-02)

**Note:** Version bump only for package inspirat





## [0.10.3](https://github.com/darkobits/inspirat/compare/v0.10.2...v0.10.3) (2020-04-21)


### Bug Fixes

* Use env-ci in extension publisher. ([ac37c63](https://github.com/darkobits/inspirat/commit/ac37c631afed2703773e0c6dbee98f761b64b6ae))
* **client:** Fix grammar in readme. ([3b1ac66](https://github.com/darkobits/inspirat/commit/3b1ac66cd188649de20980609521e8297bb69bf6))





## [0.10.2](https://github.com/darkobits/inspirat/compare/v0.10.1...v0.10.2) (2020-03-26)


### Bug Fixes

* **client:** Use ifDev in useEffect correctly. ([7cbb02f](https://github.com/darkobits/inspirat/commit/7cbb02faeba378d4904423d5b780e6e40a3ee0a9))





## [0.10.1](https://github.com/darkobits/inspirat/compare/v0.10.0...v0.10.1) (2019-04-15)


### Bug Fixes

* Improve development-only logging. ([3937a38](https://github.com/darkobits/inspirat/commit/3937a38))





# [0.10.0](https://github.com/darkobits/inspirat/compare/v0.9.5...v0.10.0) (2019-04-15)


### Bug Fixes

* **Client:** Cache photo ID for remainder of day. ([37d5ea5](https://github.com/darkobits/inspirat/commit/37d5ea5))


### Features

* **Backend:** Add build timestamp header. ([e4566c7](https://github.com/darkobits/inspirat/commit/e4566c7))





## [0.9.5](https://github.com/darkobits/inspirat/compare/v0.9.4...v0.9.5) (2019-03-19)

**Note:** Version bump only for package inspirat





## [0.9.4](https://github.com/darkobits/inspirat/compare/v0.9.3...v0.9.4) (2019-03-18)

**Note:** Version bump only for package inspirat





## [0.9.3](https://github.com/darkobits/inspirat/compare/v0.9.2...v0.9.3) (2018-11-02)

**Note:** Version bump only for package inspirat





## [0.9.2](https://github.com/darkobits/inspirat/compare/v0.9.1...v0.9.2) (2018-10-29)

**Note:** Version bump only for package inspirat





## [0.9.1](https://github.com/darkobits/inspirat/compare/v0.9.0...v0.9.1) (2018-10-21)


### Bug Fixes

* **client:** Fix typing issue. ([e0ad5a2](https://github.com/darkobits/inspirat/commit/e0ad5a2))





# [0.9.0](https://github.com/darkobits/inspirat/compare/v0.8.0...v0.9.0) (2018-10-19)


### Features

* Remember first photo set on a given day. ([4b01dd1](https://github.com/darkobits/inspirat/commit/4b01dd1))
* Use custom domain for backend. ([9e9aecf](https://github.com/darkobits/inspirat/commit/9e9aecf))
* **backend:** Use SQS queue instead of partial records. ([d3f9996](https://github.com/darkobits/inspirat/commit/d3f9996))
* **client:** Improve responsive font sizes. ([7f9d17b](https://github.com/darkobits/inspirat/commit/7f9d17b))





# [0.8.0](https://github.com/darkobits/inspirat/compare/v0.7.1...v0.8.0) (2018-10-12)


### Features

* **backend:** Handle removal of photos from collection. ([5b70520](https://github.com/darkobits/inspirat/commit/5b70520))





## [0.7.1](https://github.com/darkobits/inspirat/compare/v0.7.0...v0.7.1) (2018-10-12)


### Bug Fixes

* Backend sends proper information for attribution links. ([1ab2ab7](https://github.com/darkobits/inspirat/commit/1ab2ab7))





# [0.7.0](https://github.com/darkobits/inspirat/compare/v0.6.0...v0.7.0) (2018-10-10)


### Features

* **client:** Client requests images sized to fit screen. ([82057f0](https://github.com/darkobits/inspirat/commit/82057f0))





# [0.6.0](https://github.com/darkobits/inspirat/compare/v0.5.1...v0.6.0) (2018-10-10)


### Features

* Use Lerna, port backend to Serverless. ([a618ed6](https://github.com/darkobits/inspirat/commit/a618ed6))





# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.5.1"></a>
## [0.5.1](https://github.com/darkobits/frontlawn-website/compare/v0.5.0...v0.5.1) (2018-10-06)



<a name="0.5.0"></a>
# [0.5.0](https://github.com/darkobits/frontlawn-website/compare/v0.4.2...v0.5.0) (2018-10-06)


### Features

* Use days since Unix epoch to cycle through images. ([aaf07f5](https://github.com/darkobits/frontlawn-website/commit/aaf07f5))



<a name="0.4.2"></a>
## [0.4.2](https://github.com/darkobits/frontlawn-website/compare/v0.4.0...v0.4.2) (2018-10-05)


### Bug Fixes

* Add CSP to manifest. ([65b6460](https://github.com/darkobits/frontlawn-website/commit/65b6460))


### Features

* Dynamic title. ([4efda27](https://github.com/darkobits/frontlawn-website/commit/4efda27))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/darkobits/frontlawn-website/compare/v0.4.0...v0.4.1) (2018-10-05)


### Bug Fixes

* Add CSP to manifest. ([65b6460](https://github.com/darkobits/frontlawn-website/commit/65b6460))


### Features

* Dynamic title. ([4efda27](https://github.com/darkobits/frontlawn-website/commit/4efda27))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/darkobits/frontlawn-website/compare/v0.3.0...v0.4.0) (2018-10-05)


### Features

* Add lambda function for tracking downloads. ([2fe3c61](https://github.com/darkobits/frontlawn-website/commit/2fe3c61))
* Deterministically shuffle photo collection based on name. ([9f9bc24](https://github.com/darkobits/frontlawn-website/commit/9f9bc24))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/darkobits/frontlawn-website/compare/v0.2.0...v0.3.0) (2018-10-03)


### Features

* Update in-browser readme. ([378b3f6](https://github.com/darkobits/frontlawn-website/commit/378b3f6))



<a name="0.2.0"></a>
# 0.2.0 (2018-10-03)


### Bug Fixes

* Add Babel polyfill to lambda. ([1399013](https://github.com/darkobits/frontlawn-website/commit/1399013))
* Use .jpg background. ([16a3500](https://github.com/darkobits/frontlawn-website/commit/16a3500))


### Features

* Add CORS header. ([b1d86a8](https://github.com/darkobits/frontlawn-website/commit/b1d86a8))
* Add daily image rotation. ([fe1778c](https://github.com/darkobits/frontlawn-website/commit/fe1778c))
* Add files. ([1724b1c](https://github.com/darkobits/frontlawn-website/commit/1724b1c))
* Add lambda function, dynamic collection. ([88b6794](https://github.com/darkobits/frontlawn-website/commit/88b6794))
* Add pre-loading, minor client tweaks. ([2b78009](https://github.com/darkobits/frontlawn-website/commit/2b78009))
* Cache image data, update in background. ([680e28a](https://github.com/darkobits/frontlawn-website/commit/680e28a))
* Handle pagination. ([6c7ea99](https://github.com/darkobits/frontlawn-website/commit/6c7ea99))
