/*
 * @Description: 
 * @Author: 14K
 * @Date: 2023-03-15 18:07:10
 * @LastEditTime: 2023-03-21 00:39:39
 * @LastEditors: 14K
 */

import axios from "axios";
import md5 from "md5";
import dotenv from "dotenv"

(async ()=>{
    dotenv.config()
    const date = new Date().getTime();
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
        "vid": "XMzc1NDEyMDQ3Ng=="
    }
    const buff = Buffer.from(JSON.stringify(data), 'utf-8');
    const msg = buff.toString('base64');
    const salt = "MkmC9SoIw6xCkSKHhJ7b5D2r51kBiREr";
    const sign_md5 = md5(msg + salt)
    const submitData = {
        "pid": 0,
        "ctype": 10004,
        "sver": "3.1.0",
        "cver": "v1.0",
        "ctime": date,
        "guid": "AazCFyI3emMCAavZXueivoUD",
        "vid": "XMzc1NDEyMDQ3Ng==",
        "mat": 4,
        "mcount": 0,
        "type": 1,
        "msg": msg,
        "sign": sign_md5
    };
    const sign = md5(process.env.TOKEN + "&" + date + "&" + 24679788 + "&" + JSON.stringify(submitData))
    const url = `https://acs.youku.com/h5/mopen.youku.danmu.list/1.0/?jsv=2.7.0&appKey=24679788&t=${date}&sign=${sign}&api=mopen.youku.danmu.list&v=1.0&type=originaljson&dataType=jsonp&timeout=20000&jsonpIncPrefix=utility`
    const res = await axios.post(url,"data="+JSON.stringify(submitData),{
        headers:{
            Cookie: process.env.COOKIE,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
        }
    })
    console.log(res.data)
})()