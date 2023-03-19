/*
 * @Description: 坑了个大爹了，放Linux 画不出文字，找了一晚上bug 结果发现是`textBaseline`的锅
 * @Author: 14K
 * @Date: 2023-03-19 00:32:38
 * @LastEditTime: 2023-03-19 12:49:33
 * @LastEditors: 14K
 */
import axios from "axios"
import { Canvas, FontLibrary,CanvasRenderingContext2D } from "skia-canvas"
import fs from "fs"
import path from "path"

interface Base{
    fontSize?: number
    color?: string
    fontFamily?: string
    height?: number
    bgColor?: string
}
interface Config{
    width?: number
    padding?: number
    content?: Base
    head?: Base
    insidePadding?: number
    bgColor?: string
    textPadding?: number
    newsListMarginTop?: number
    fontFamily: string
    outDir?: string
    outType?: "file" | "buffer" | "base64"
}
export default class DrawNews {
    width: number = 750 // 图片宽度
    newsList: string[][] = []
    canvas: any = new Canvas(this.width,5000)
    ctx: CanvasRenderingContext2D = this.canvas.getContext("2d")
    bgColor: string = ""
    textHeight: number = 24
   
    padding: number = 25; // 内边距
    insidePadding: number = 25 //文字内边距
    textPadding: number = 10; // 多行文字上下边距
    newsListMarginTop: number = 20; // 多条新闻上边距
    top: number = this.padding + this.insidePadding
    outDir: string
    fontFamily: string = ``
    outType: "file" | "buffer" | "base64"
    content: Base = {
        color: "#333333",
        fontSize: 24,
        fontFamily: ""
    }
    head: Base = {
        color: "#ffffff",
        fontSize: 24,
        fontFamily: "",
        height: 250,
        bgColor: "#ec9bad"
    }
    weekday: string[] = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
    dateString: string
    url: string = "https://www.zhihu.com/api/v4/columns/c_1261258401923026944/items?limit=1"
    constructor({
        width = 750,
        padding = 25,
        insidePadding = 25,
        textPadding = 10,
        newsListMarginTop = 20,
        bgColor = "#e6e6e6",
        fontFamily = "",
        outType = "file",
        outDir = __dirname,
        content = {
            fontFamily :"",
            color :"#333333",
            fontSize: 24,
        },
        head = {
            fontFamily :"",
            color :"#ffffff",
            fontSize: 100,
            bgColor: "#ec9bad",
            height: 0,
        },
    }: Config) {
        if(!fontFamily || !fs.existsSync(fontFamily)){
            throw new Error(`没有在路径 '${fontFamily}' 找到字体`)
        }
        if(!fs.existsSync(outDir) && outType == "file"){
            throw new Error(`不是有效的输出路径`)
        }
        this.fontFamily = fontFamily
        this.width = width
        this.padding = padding
        this.insidePadding = insidePadding
        this.textPadding = textPadding
        this.newsListMarginTop = newsListMarginTop
        this.outType = outType
        this.outDir = outDir
        this.content = {...{
            fontFamily :"",
            color :"#333333",
            fontSize: 24,
        },...content}

        this.head = {...{
            fontFamily :"",
            color :"#ffffff",
            fontSize: 100,
            bgColor: "#ec9bad",
            height: 0,
        },...head}
        this.bgColor = bgColor
        
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        this.dateString = year + "-" + month + '-' + day;
    }
    drawHead(){
        let height = this.head.height || 0
        const fontSize = this.head.fontSize || 100
        if(height < fontSize){
            height = fontSize + 50
        }
        this.ctx.fillStyle = this.head.bgColor || "#ec9bad"
        const rectWith = this.width - this.padding * 2 - this.insidePadding * 2
        this.ctx.fillRect(this.padding + this.insidePadding,this.padding + this.insidePadding,rectWith,height)
        const ctx = this.ctx
        for(let i = 0; i < Math.ceil(rectWith/50);i++){
            ctx.beginPath()
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 0.1;
            ctx.moveTo(this.padding + this.insidePadding + 50 * i, this.padding + this.insidePadding)
            ctx.lineTo(this.padding + this.insidePadding + 50 * i, this.padding + this.insidePadding + height)
            ctx.closePath()
            ctx.stroke()
        }
        for(let i = 0; i < Math.ceil(height/50);i++){
            ctx.beginPath()
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 0.1;
            ctx.moveTo(this.padding + this.insidePadding, this.padding + this.insidePadding + 50 * i)
            ctx.lineTo(this.padding + this.insidePadding + rectWith, this.padding + this.insidePadding + 50 * i)
            ctx.closePath()
            ctx.stroke()
        }
        // 画星期
        this.ctx.font = `${this.head.fontSize}px "font"`
        const weekday = this.weekday[new Date().getDay()]
        this.ctx.textAlign = "center"
        this.ctx.fillStyle  = this.head.color || "#ffffff";
        this.ctx.textBaseline = "middle"
        const middle = this.padding + this.insidePadding+ height /2
        this.ctx.fillText(weekday, this.width/2, middle)

        // 画右下角日期
        this.ctx.font = `24px "font"`
        this.ctx.textAlign = "right"
        this.ctx.textBaseline = "bottom"
        this.ctx.fillText(this.dateString, this.width - this.padding - this.insidePadding - 14, this.insidePadding + height + this.padding - 14)
        // 完事之后更新新的高度
        this.top += height + this.insidePadding
    }
    async draw() {
        await FontLibrary.use("font", this.fontFamily)
        if(this.head.height){
            this.drawHead()
        }
        this.ctx.font = `${this.content.fontSize}px "font"`
        this.ctx.fillStyle  = this.content.color || "#333333";
        this.ctx.textBaseline = 'top'
        this.ctx.textAlign = "left"

        await this.getNewsList()
        this.drawText()

        // 剪裁高度
        const resultCanvas: any = new Canvas(this.width, this.top + this.insidePadding)
        const ctx = resultCanvas.getContext("2d");
        ctx.fillStyle = this.bgColor

        await ctx.fillRect(0,0,this.width,this.top + this.insidePadding)
        await ctx.drawImage(this.canvas, 0, 0);
        ctx.strokeStyle = "#999";
        ctx.strokeRect(this.padding, this.padding,this.width - this.padding * 2, this.top - this.padding * 2 + this.insidePadding)
        if(this.outType == "file"){
            await resultCanvas.saveAs(path.join(this.outDir,`${this.dateString}.png`), {density: 1})
            return Promise.resolve(path.join(this.outDir,`${this.dateString}.png`))
        }else if(this.outType == "buffer"){
            return resultCanvas.toBufferSync('png')
        }else{
            return resultCanvas.toBufferSync('png').toString('base64')
        }
    }
    async getNewsList() {
        const res = await axios.get(this.url)
        const newsContent = res.data.data[0].content
        for (let i = 1; i <= 15; i++) {
            let news = i+"、"+newsContent.split(`${i}、`)[1].split("</p>")[0]
            news = news.replace(/&#34;/g,`"`)
            const textList = this.getWrapText(news)
            this.newsList.push(textList)
        }
    }
    // 计算换行文本 
    getWrapText(text = ""): string[] {
        const maxWidth = this.width - this.padding * 2 - this.insidePadding * 2
        const txtList = [];
        let str = "";
        for (let i = 0, len = text.length; i < len; i++) {
            str += text.charAt(i);
            if (this.ctx.measureText(str).width > maxWidth) {
                txtList.push(str.substring(0, str.length - 1))
                str = ""
                i--
            }
        }
        txtList.push(str)
        return txtList;
    }
    drawText(){
        for(let index = 0;index< this.newsList.length;index++){
            for(let index2 = 0; index2 < this.newsList[index].length;index2++){
                const text = this.newsList[index][index2]
                const fix = this.ctx.measureText(text).actualBoundingBoxAscent + this.ctx.measureText(text).actualBoundingBoxDescent;
                this.textHeight = fix
                this.ctx.fillText(text, this.padding + this.insidePadding , this.top )
                this.top += fix + this.textPadding
            }
            this.top += this.newsListMarginTop
        }
    }
}