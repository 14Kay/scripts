/*
 * @Description: qq音乐刷时长
 * @Author: 14K
 * @Date: 2023-04-12 14:19:48
 * @LastEditTime: 2023-04-12 14:32:04
 * @LastEditors: 14K
 */
import axios from "axios";
import zlib from "zlib"
import * as crypto from "crypto";

/**
 * @description: 
 * @param {number} time 单位秒，单次最大支持2999，多了无效
 * @param {number} uin
 * @return {*}
 */
async function postQQmusicTime(time: number = 1800, uin: number = 619113277) {
    const optime = Math.ceil(new Date().getTime()/1000);
    const secret = 'gk2$Lh-&l4#!4iow';
    const str = String(optime) + String(time) + String(uin) + secret;
    const md5 = crypto.createHash('md5').update(str).digest('hex').toUpperCase();
    const data = `
    <?xml version="1.0" encoding="UTF-8"?>
    <root>
        <ct>11</ct><cv>12020008</cv>
        <item 
            cmd="1" 
            optime="${optime}" 
            QQ="${uin}" 
            time="${time}" 
            timekey="${md5}"/>
    </root>`
    const compressedData = zlib.gzipSync(Buffer.from(data));
    const headers = {
        "User-Agent": "QQMusic/12020008",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    await axios.post("https://stat6.y.qq.com/android/fcgi-bin/imusic_tj",compressedData,{ headers })
}

postQQmusicTime()