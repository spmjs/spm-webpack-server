> anyproxy的测试用例不会写~

测试方法：

```
cd test/fixtures/anyproxy

../../../cli.js --proxy rule__anyproxy.js
```

浏览器中配置anyproxy的HTTP代理：127.0.0.1 端口8001

访问：http://jianyu.alipay.net:8000/a.js

会发现原来的`console.log('a.js');`变成了`console.log('b.js');`
