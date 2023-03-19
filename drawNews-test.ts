/*
 * @Description: 
 * @Author: 14K
 * @Date: 2023-03-19 00:32:38
 * @LastEditTime: 2023-03-19 13:12:58
 * @LastEditors: 14K
 */
import DrawNews from "./drawNews"
(async ()=>{
    // const draw = new DrawNews({fontFamily: "C:/Users/61911/Desktop/scripts/MiSans.ttf",outDir: "C:/Users/61911/Desktop/scripts/out",head:{ height: 50}, width: 400})
    // console.log(await draw.draw())

    // const draw2 = new DrawNews({fontFamily: "C:/Users/61911/Desktop/scripts/MiSans.ttf",outType: "buffer",head:{ height: 250}})
    // console.log(await draw2.draw())

    // const draw3 = new DrawNews({fontFamily: "C:/Users/61911/Desktop/scripts/MiSans.ttf",outDir: "C:/Users/61911/Desktop/scripts/out"})
    // console.log(await draw3.draw())
    const draw4 = new DrawNews({fontFamily: "C:/Users/61911/Desktop/scripts/MiSans.ttf",outDir: "C:/Users/61911/Desktop/scripts/out",
    head:{
        height: 250,
        bgColor: "#f28e16"
    },
    bgColor: "#f6f6f6"
})
    console.log(await draw4.draw())
})()
