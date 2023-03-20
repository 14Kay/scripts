---
title: WEB端优酷视频弹幕API分析
date: '2023-03-20'
tags: ['逆向', '影视', '弹幕', 'Node.js']
cover: https://gchat.qpic.cn/gchatpic_new/619113277/2634877448-2334349852-3CC21616F9F1FE4C92AF07F7CA3DB7B8/0?term=3&is_origin=0
draft: false
summary: '在视频网站上，一边看视频一边发弹幕已经是网友的习惯。而基本所有视频网站都会对弹幕API进行加密，让我们不`那么容易`拿到API.本篇笔记会对当前日期下WEB端的API进行分析'
---

## 接口查找

随便打开一个视频，在打开视频弹幕开关前提下，复制一条弹幕在`f12`搜索 即可成功找到目标接口

```url
https://acs.youku.com/h5/mopen.youku.danmu.list/1.0/?jsv=2.7.0&appKey=24679788&t=1679323597930&sign=84635b0345195b950f8b4c41188833df&api=mopen.youku.danmu.list&v=1.0&type=originaljson&dataType=jsonp&timeout=20000&jsonpIncPrefix=utility
```

## 数据分析

上述只是接口部分，还需要拿到POST提交的数据包

复制POST数据包如下:

```form
data=%7B%22pid%22%3A0%2C%22ctype%22%3A10004%2C%22sver%22%3A%223.1.0%22%2C%22cver%22%3A%22v1.0%22%2C%22ctime%22%3A1679323597929%2C%22guid%22%3A%22AazCFyI3emMCAavZXueivoUD%22%2C%22vid%22%3A%22XNTkzOTY5NDEyNA%3D%3D%22%2C%22mat%22%3A21%2C%22mcount%22%3A1%2C%22type%22%3A1%2C%22msg%22%3A%22eyJjdGltZSI6MTY3OTMyMzU5NzkyOSwiY3R5cGUiOjEwMDA0LCJjdmVyIjoidjEuMCIsImd1aWQiOiJBYXpDRnlJM2VtTUNBYXZaWHVlaXZvVUQiLCJtYXQiOjIxLCJtY291bnQiOjEsInBpZCI6MCwic3ZlciI6IjMuMS4wIiwidHlwZSI6MSwidmlkIjoiWE5Ua3pPVFk1TkRFeU5BPT0ifQ%3D%3D%22%2C%22sign%22%3A%22c4c8fc0d3391fff4ec20695e1512be63%22%7D
```

通过urlencode解码可得json明文:

```json
{
	"pid": 0,
	"ctype": 10004,
	"sver": "3.1.0",
	"cver": "v1.0",
	"ctime": 1679323597929,
	"guid": "AazCFyI3emMCAavZXueivoUD",
	"vid": "XNTkzOTY5NDEyNA==",
	"mat": 21,
	"mcount": 1,
	"type": 1,
	"msg": "eyJjdGltZSI6MTY3OTMyMzU5NzkyOSwiY3R5cGUiOjEwMDA0LCJjdmVyIjoidjEuMCIsImd1aWQiOiJBYXpDRnlJM2VtTUNBYXZaWHVlaXZvVUQiLCJtYXQiOjIxLCJtY291bnQiOjEsInBpZCI6MCwic3ZlciI6IjMuMS4wIiwidHlwZSI6MSwidmlkIjoiWE5Ua3pPVFk1TkRFeU5BPT0ifQ==",
	"sign": "c4c8fc0d3391fff4ec20695e1512be63"
}
```

需要的数据已经全拿到了，下面进行分析

### URL参数分析

```json
    {
        jsv: 2.7.0
        appKey: 24679788
        t: 1679323597930
        sign: 84635b0345195b950f8b4c41188833df
        api: mopen.youku.danmu.list
        v: v.1.0
        type: originaljson
        dataType: jsonp
        timeout: 20000
        jsonpIncPrefix: utility
    }
```

需要更改的参数有：
- sign: 签名
- t: 时间戳

t一眼时间戳，sign 大约是md5 继续翻文档

https://g.alicdn.com/youku-node/pc-playpage/1.3.38/scripts/lib.js

发现其中
```js
if (i.H5Request === !0) {
    var n = "//" + (i.prefix ? i.prefix + "." : "") + (i.subDomain ? i.subDomain + "." : "") + i.mainDomain +
        "/h5/" + t.api.toLowerCase() + "/" + t.v.toLowerCase() + "/",
        r = t.appKey || ("waptest" === i.subDomain ? "4272" : "12574478"),
        a = (new Date).getTime(),
        o = s(i.token + "&" + a + "&" + r + "&" + t.data),
        l = {
            appKey: r,
            t: a,
            sign: o
        },
        u = {
            data: t.data,
            ua: t.ua
        };
    Object.keys(t).forEach(function (e) {
        "undefined" == typeof l[e] && "undefined" == typeof u[e] && (l[e] = t[e])
    }), i.getJSONP ? l.type = "jsonp" : i.getOriginalJSONP ? l.type = "originaljsonp" : (i.getJSON || i
        .postJSON) && (l.type = "originaljson"), i.querystring = l, i.postdata = u, i.path = n
}
```
得到sign的加密算法：
```
o = s(i.token + "&" + a + "&" + r + "&" + t.data)
```

- i.token: 是cookie 中`m_h5_tk`前半部分
- a: 时间戳
- r: 当前appKey
- t.data: 就是上面POST参数

发现要固定POST参数,所以我们回过头去分析POST参数
```json
{
	"pid": 0,
	"ctype": 10004,
	"sver": "3.1.0",
	"cver": "v1.0",
	"ctime": 1679323597929,
	"guid": "AazCFyI3emMCAavZXueivoUD",
	"vid": "XNTkzOTY5NDEyNA==",
	"mat": 21,
	"mcount": 1,
	"type": 1,
	"msg": "eyJjdGltZSI6MTY3OTMyMzU5NzkyOSwiY3R5cGUiOjEwMDA0LCJjdmVyIjoidjEuMCIsImd1aWQiOiJBYXpDRnlJM2VtTUNBYXZaWHVlaXZvVUQiLCJtYXQiOjIxLCJtY291bnQiOjEsInBpZCI6MCwic3ZlciI6IjMuMS4wIiwidHlwZSI6MSwidmlkIjoiWE5Ua3pPVFk1TkRFeU5BPT0ifQ==",
	"sign": "c4c8fc0d3391fff4ec20695e1512be63"
}
```
- ctime: 时间戳
- mat: 视频某分钟的全部弹幕
- msg: 通过base64解码得知，是母数据层
- vid: 当前播放电视/电影的ID

msg的base64解码:
```string
{"ctime":1679323597929,"ctype":10004,"cver":"v1.0","guid":"AazCFyI3emMCAavZXueivoUD","mat":21,"mcount":1,"pid":0,"sver":"3.1.0","type":1,"vid":"XNTkzOTY5NDEyNA=="}
```
其它基本不需要改

所以现在的思路如下：
1. 组装`ctime`,`ctype`,`cver`,`guid`,`mat`,`mcount`,`pid`,`sver`,`type`,`vid`参数。(注意参数的先后顺序不可动)
2. 用组装的参数 通过base64编码得到所需参数`msg`
3. 用`msg`通过 md5(msg + salt)得到所需参数`sign`

    - salt 为 `MkmC9SoIw6xCkSKHhJ7b5D2r51kBiREr`

全部代码如下:
```ts
    const date = new Date().getTime();
    const salt = "MkmC9SoIw6xCkSKHhJ7b5D2r51kBiREr";
    const data = {
        "ctime": date,
        "ctype": 10004,
        "cver": "v1.0",
        "guid": "AazCFyI3emMCAavZXueivoUD",
        "mat": 3,
        "mcount": 1,
        "pid": 0,
        "sver": "3.1.0",
        "type": 1,
        "vid": "XNTkzOTY5NDEyNA=="
    }
    const buff = Buffer.from(JSON.stringify(data), 'utf-8');
    const msg = buff.toString('base64');
    const sign_md5 = md5(msg + salt)
    const postData = {
        "pid": 0,
        "ctype": 10004,
        "sver": "3.1.0",
        "cver": "v1.0",
        "ctime": date,
        "guid": "AazCFyI3emMCAavZXueivoUD",
        "vid": "XNTkzOTY5NDEyNA==",
        "mat": 3,
        "mcount": 0,
        "type": 1,
        "msg": msg,
        "sign": sign_md5
    };
    const sign = md5('a2e722dcaaaeda20635fef62a0265b45' + "&" + date + "&" + 24679788 + "&" + JSON.stringify(postData))
    const res = await axios.post(url,"data="+JSON.stringify(postData),{
        headers:{
            Cookie: Cookie,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
        }
    })
```
