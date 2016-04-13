# History

---

## 1.0.1
- feat: add ant tool monitor

## 1.0.0 
- deps: upgrade spm-webpack to 1.0.0

## 0.8.3 

- feat: brand new define
- fix: make test
- deps: upgrade spm-webpack to 0.8.1, remove gnode, memory-fs, mime

## 0.8.2 

- deps: upgrade spm-webpack to 0.8.0

## 0.8.1

- fix:  adjust insert scripts position when html file exists doctype

## 0.8.0

- feat: Do not build modules in index page and support 204 status  [#10](https://github.com/spmjs/spm-webpack-server/pull/10)

## 0.7.2

- feat: support server.family

## 0.7.1

- feat: support server.lazy

## 0.7.0

- deps: upgrade spm-webpack to 0.7.0
- deps: upgrade webpack-dev-middleware to 1.2

## 0.6.0

- deps: upgrade spm-webpack to 0.6.0
- refactor: using webpack-dev-middleware directly
- chore: simplify log

## 0.5.3

- fix: outputPath resolve error when is like dist/...

## 0.5.2

- feat: don't serve index.html as default

## 0.5.1

- feat: add spm server http inject feature

## 0.5.0

- deps: upgrade spm-webpack to 0.5.0
- fix: path error when options.cwd != process.cwd()

## 0.4.2

- bugfix: fix pkg logic

## 0.4.1

- feat: pkg can be pass in with arguments

  ## 0.4.0

- deps: upgrade spm-webpack to 0.4.0

## 0.3.4

- feat: add POST support for static middleware
- chore: throw error if port is in use

## 0.3.3

- fix: local path resolve error if have dest config

## 0.3.2

- feat: support hash:true for spm server

## 0.3.1

- fix: cdn hosts unavailable

## 0.3.0

- feat: don't compress by default
- feat: support define plugin

## 0.2.2

- feat: output error message

## 0.2.1

- feat: support devtool config in package.json

## 0.2.0

- feat(middleware): don't flatten path, and prefix idleading if not found
- fix: verbose param don't work
- deps: upgrade spm-webpack to 0.3

## 0.1.2

- deps: upgrade spm-webpack to 0.2, [CHANGELOG](https://github.com/spmjs/spm-webpack/blob/master/HISTORY.md)

## 0.1.1

- fix log.info don't log anything
- fix read html file error with querystring
- fix port params not available
- improve performance

## 0.1.0

First commit
