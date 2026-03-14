import type { Environment } from "../data-model";

export const drawEnvironment = (env: Environment, ctx:CanvasRenderingContext2D,height:number,_width:number, [root_x,root_y] = [0,height-100]) => {
    const [row_padding,col_padding] = [4,10]

    const font_height = 20;
    ctx.font = `${font_height}px roboto`
    let [offset_x,offset_y] = [col_padding,font_height] 
    
    const drawInt = (env: Environment["intEnv"]) => {
      Object.entries(env).forEach(([key,value]) => {
          ctx.beginPath()
          ctx.fillStyle = "blue"
          ctx.textBaseline = "top"
          const txt = `${key}: ${value}`
          const txt_metrics = ctx.measureText(txt)
          ctx.roundRect(root_x+offset_x,root_y+offset_y,txt_metrics.width+col_padding*2,font_height+row_padding*2,5)
          ctx.fill()
          ctx.fillStyle = "white";
          ctx.fillText(txt,root_x+offset_x+col_padding, root_y+offset_y+row_padding);
          ctx.closePath()
          offset_x += txt_metrics.width + col_padding*3
        })
    }
    
    const drawBool = (env: Environment["boolEnv"]) => {
      Object.entries(env).forEach(([key,value]) => {
          ctx.beginPath()
          ctx.fillStyle = "green"
          ctx.textBaseline = "top"
          const txt = `${key}: ${value}`
          const txt_metrics = ctx.measureText(txt)
          ctx.roundRect(root_x+offset_x,root_y+offset_y,txt_metrics.width+col_padding*2,font_height+row_padding*2,5)
          ctx.fill()
          ctx.fillStyle = "white";
          ctx.fillText(txt,root_x+offset_x+col_padding, root_y+offset_y+row_padding);
          ctx.closePath()
          offset_x += txt_metrics.width + col_padding*3
        })
    }
    const drawArray = (arrEnv: Environment["arrEnv"]) => {

      const measureArrayTextWidth = (label: string,array: number[]): number => {
        let sum = ctx.measureText(label).width + col_padding
        array.forEach((num) => sum += ctx.measureText(`| ${num}`).width + col_padding) 
        return sum;
      }

      Object.entries(arrEnv).forEach(([key,value]) => {
        ctx.beginPath()
        const label_txt_width = ctx.measureText(key).width
        const full_txt_width = measureArrayTextWidth(key,value)
        ctx.roundRect(root_x+offset_x,root_y+offset_y,full_txt_width+col_padding*2,font_height+row_padding*2,5)
        ctx.fillStyle = "gray"
        ctx.fill()
        ctx.fillStyle = "white";
        ctx.fillText(key,root_x+offset_x+col_padding, root_y+offset_y+row_padding);
        offset_x += label_txt_width + col_padding*2;
        value.forEach((v) => {
          const txt = `| ${v}`
          ctx.fillText(txt,root_x+offset_x, root_y+offset_y+row_padding);
          const metrics = ctx.measureText(txt)
          offset_x += metrics.width + col_padding
        })
        ctx.closePath()
        })
    }

    const newRow = () => {
      offset_x = root_x + col_padding
      offset_y += font_height + row_padding
    }

    drawInt(env.intEnv)
    drawBool(env.boolEnv)
    drawArray(env.arrEnv)
    newRow()
    if (env.parentEnv) drawEnvironment(env.parentEnv,ctx,height,_width,[root_x,root_y+offset_y+row_padding])
}
