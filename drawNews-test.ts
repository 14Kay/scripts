/*
 * @Description: 
 * @Author: 14K
 * @Date: 2023-03-19 00:32:38
 * @LastEditTime: 2023-03-19 00:34:26
 * @LastEditors: 14K
 */
import DrawNews from "./drawNews"
(async ()=>{
    const draw = new DrawNews({fontFamily: "C:/Users/14k/Desktop/scripts/MiSans.ttf",outDir: "C:/Users/14k/Desktop/scripts/out",head:{ height: 250}})
    console.log(await draw.draw())
})()