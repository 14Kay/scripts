/*
 * @Description: 图片转字符图片
 * @Author: 14K
 * @Date: 2023-04-27 22:29:18
 * @LastEditTime: 2023-04-28 00:12:14
 * @LastEditors: 14K
 */
import { writeFileSync } from 'fs';
import { createCanvas, loadImage } from 'canvas';
import  type { Canvas, CanvasRenderingContext2D} from 'canvas';

interface CharArt {
  color: string;
  char: string;
  x: number;
  y: number;
  size: number;
}
async function convertToCharArt(imageUrl: string) {
  const image = await loadImage(imageUrl);
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const charArt = canvasToCharArt(canvas, context);
  const buffer = charArtToPNG(charArt, canvas);
  return writeFileSync('char-art-out.png', buffer);
}

function canvasToCharArt(canvas: Canvas,context: CanvasRenderingContext2D): CharArt[] {

  // 定义字符宽度和高度,默认是一排显示50个字符，字大小自动调整
  let charWidth = canvas.width/50;
  if(charWidth <= 6) charWidth = 6
  const chars = "小叶子傻逼";
  const cols = Math.floor(canvas.width / charWidth);
  const rows = Math.floor(canvas.height / charWidth);
  const charList = []
   for (let x = 0; x < cols; x++) {
    let index = 0
    for (let y = 0; y < rows; y++) {
      const charX = x * charWidth;
      const charY = y * charWidth;
      // 计算平均颜色
      let red = 0;
      let green = 0;
      let blue = 0;
      let count = 0;
      for (let i = 0; i < charWidth; i++) {
        for (let j = 0; j < charWidth; j++) {
          const pixelData = context.getImageData(charX + i, charY + j, 1, 1).data;
          red += pixelData[0];
          green += pixelData[1];
          blue += pixelData[2];
          count++;
        }
      }
      red = Math.floor(red / count);
      green = Math.floor(green / count);
      blue = Math.floor(blue / count);
      charList.push({
          color: `rgb(${red}, ${green}, ${blue})`,
          char: chars[index],
          x: charX,
          y: charY + charWidth,
          size: charWidth
      })
      index++
      if(index >= chars.length) index = 0
    }
  }
  return charList
}

function charArtToPNG(charArt: CharArt[], imageCanvas: Canvas): Buffer {
  const canvas = createCanvas(imageCanvas.width, imageCanvas.height);
  const context = canvas.getContext('2d');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  charArt.forEach((item: CharArt) => {
    context.fillStyle = item.color;
    context.font = `${item.size}px 微软雅黑`;
    context.fillText(item.char, item.x, item.y);
  });

  return canvas.toBuffer('image/png');
}