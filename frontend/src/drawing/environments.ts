import type { Environment } from "../data-model";

export const drawEnvironment = (env: Environment, ctx:CanvasRenderingContext2D,height:number,_width:number) => {
  const [root_x,root_y] = [0,height-100];
    const [row_padding,col_padding] = [5,10]

    const font_height = 30;
    ctx.font = `${font_height}px roboto`
    let [offset_x,offset_y] = [col_padding,font_height] 
    
    const drawInt = (env: Environment["intEnv"]) => {
      Object.entries(env).forEach(([key,value]) => {
          ctx.fillStyle = "white";
          const txt = `${key}: ${value}`
          const txt_metrics = ctx.measureText(txt)
        
          ctx.strokeRect(root_x+offset_x,root_y+offset_y,txt_metrics.width,font_height+row_padding)
          ctx.fillText(txt,root_x+offset_x, root_y+offset_y);
          offset_x += txt_metrics.width + col_padding
        })
    }
    
    const drawBool = (env: Environment["boolEnv"]) => {
      Object.entries(env).forEach(([key,value]) => {
          ctx.fillStyle = "white";
          const txt = `${key}: ${value}`
          
          ctx.fillText(txt,root_x+offset_x, root_y+offset_y);
          const metrics = ctx.measureText(txt)
          offset_x += metrics.width + col_padding
        })
    }
    const drawArray = (arrEnv: Environment["arrEnv"]) => {
      ctx.fillStyle = "white";
      Object.entries(arrEnv).forEach(([key,value]) => {
        ctx.fillText(key,root_x+offset_x, root_y+offset_y);
        const metrics = ctx.measureText(key)
        offset_x += metrics.width + col_padding;
        value.forEach((v) => {
          const txt = `| ${v}`
          ctx.fillText(txt,root_x+offset_x, root_y+offset_y);
          const metrics = ctx.measureText(txt)
          offset_x += metrics.width + col_padding
        })
        })
    }

    const newRow = () => {
      offset_x = root_x + col_padding
      offset_y += font_height + row_padding
    }
    drawInt(env.intEnv)
    newRow()
    drawBool(env.boolEnv)
    newRow()
    drawArray(env.arrEnv)
    newRow()
}
