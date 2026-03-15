import type { Environment } from "../data-model";

export const generateEnvironmentDrawables = (env: Environment, ctx:CanvasRenderingContext2D,height:number,_width:number, root: Vec2D = new Vec2D(0,600)):DrawableElement[] => {
    const [row_padding,col_padding] = [4,10]

    const font_height = 20;
    ctx.font = `${font_height}px roboto`
    const drawInt = (env: Environment["intEnv"], root: Vec2D) => {
      return Object.entries(env).reduce<[DrawableElement | null, DrawableElement[]]>(([prev,acc], [key,value]) => {
        let pos = prev ? prev.position.translateX(prev.size.X()+col_padding) : root
          const obj = new IntVar(key,value,pos,ctx);
          acc.push(obj)
          return [obj,acc]
        }, [null,[]])
    }
    
    const drawBool = (env: Environment["boolEnv"],root:Vec2D) => {
      return Object.entries(env).reduce<[DrawableElement | null, DrawableElement[]]>(([prev,acc], [key,value]) => {
        let pos = prev ? prev.position.translateX(prev.size.X()+col_padding) : root
          const val = new BoolVar(key,value,pos,ctx);
          acc.push(val)
          return [val,acc];
        }, [null,[]])
    }
    const drawArray = (arrEnv: Environment["arrEnv"],root:Vec2D) => {
      return Object.entries(arrEnv).reduce<[DrawableElement | null,DrawableElement[]]>(([prev,acc],[key,value]) => {
        const list = new ArrayList(key, [], prev ? prev.position.translateX(prev.size.X()+col_padding) : root.translateX(col_padding), ctx)
        let elements = value.map(value => new ArrayElement(value, new Vec2D(0,0),ctx))
        list.setElements(elements)
        acc.push(list)
        return [list,acc]
        }, [null,[]])
    }

    let [last_element,ints] = drawInt(env.intEnv, root)
    let res = drawBool(env.boolEnv, last_element?.top_right || root)
    last_element = res[0] || last_element
    let bools = res[1]
    res = drawArray(env.arrEnv, last_element?.top_right || root)
    let arrayLists = res[1]
    let objs = [...ints,...bools,...arrayLists]
    if (env.parentEnv) return objs.concat(generateEnvironmentDrawables(env.parentEnv,ctx,height,_width,root.translateY(last_element ? last_element.size.Y()+row_padding : 0)))
    return objs
}

class Vec2D {
  private x;
  public X = () => this.x;
  private y;
  public Y = () => this.y;

  translate = (v: Vec2D) =>  new Vec2D(this.x + v.X(), this.y + v.Y())
  translateX = (v_x: number) =>  new Vec2D(this.x + v_x, this.y)
  translateY = (v_y: number) =>  new Vec2D(this.x, this.y + v_y)
  subtract = (b:Vec2D) => new Vec2D(this.x + (-b.X()), this.y+ (-b.Y()))
  scale = (scalar:number) => new Vec2D(this.X() * scalar, this.Y() * scalar)
  norm = () => Math.sqrt(this.x**2+this.y**2);
  unit = () => {
    const norm = this.norm()
    return new Vec2D(this.x / norm, this.y / norm)
  }
  slerp = (destination: Vec2D, progress: number) => {
      let a_to_b = destination.subtract(this);
        return this.translate(a_to_b.scale(progress)); 
    }

  constructor(x:number,y:number) {
    this.x = x
    this.y = y
  }
}

abstract class DrawableElement {
  size: Vec2D
  position: Vec2D
  top_left: Vec2D
  top_right: Vec2D
  bot_right: Vec2D
  bot_left: Vec2D
  abstract draw: () => void
  setPosition: (vec:Vec2D) => void = (vec) => {
    this.position = vec;
    this.top_left = this.position
    this.top_right = this.top_left.translateX(this.size.X())
    this.bot_right = this.top_right.translateY(-this.size.Y())
    this.bot_left = this.bot_right.translateX(-this.size.X())
  }

  constructor(position:Vec2D,size:Vec2D) {
    this.size = size
    this.position = position
    this.top_left = this.position
    this.top_right = this.top_left.translateX(this.size.X())
    this.bot_right = this.top_right.translateY(-this.size.Y())
    this.bot_left = this.bot_right.translateX(-this.size.X())
  }
}


class IntVar extends DrawableElement {
  draw: () => void;
  constructor(label: string,value: number, pos: Vec2D, ctx: CanvasRenderingContext2D) {
    const [top_pad,right_pad,bot_pad,left_pad] = [4,10,4,10]
    const font_height = 20;
    const txt = `${label}: ${value}`
    const txt_width = ctx.measureText(txt).width

    ctx.font = `${font_height}px roboto`
    const size = new Vec2D(txt_width+left_pad + right_pad,font_height+top_pad + bot_pad)
    super(pos,size);
    
    this.draw = () => {
      ctx.beginPath()
      ctx.fillStyle = "blue"
      ctx.textBaseline = "top"
      ctx.roundRect(this.position.X(),this.position.Y(),this.size.X(),this.size.Y(),5)
      ctx.fill()
      ctx.fillStyle = "white";
      ctx.fillText(txt,this.position.X()+left_pad, this.position.Y() + top_pad);
      ctx.closePath()
    }
  }
}

class BoolVar extends DrawableElement {
  draw: () => void;
  constructor(label: string,value: boolean, pos: Vec2D, ctx: CanvasRenderingContext2D) {
    const [top_pad,right_pad,bot_pad,left_pad] = [4,10,4,10]
    const font_height = 20;
    const txt = `${label}: ${value}`
    const txt_width = ctx.measureText(txt).width

    ctx.font = `${font_height}px roboto`
    const size = new Vec2D(txt_width+left_pad + right_pad,font_height+top_pad + bot_pad)
    super(pos,size);
    
    this.draw = () => {
      ctx.beginPath()
      ctx.fillStyle = "green"
      ctx.textBaseline = "top"
      ctx.roundRect(this.position.X(),this.position.Y(),this.size.X(),this.size.Y(),5)
      ctx.fill()
      ctx.fillStyle = "white";
      ctx.fillText(txt,this.position.X()+left_pad, this.position.Y() + top_pad);
      ctx.closePath()
    }
  }
}

class ArrayElement extends DrawableElement {
  draw: () => void;
  constructor(value: number, pos: Vec2D, ctx: CanvasRenderingContext2D) {
    const [top_pad,right_pad,bot_pad,left_pad] = [4,10,4,10]
    const font_height = 20;
    ctx.font = `${font_height}px roboto`
    const txt = `$${value}`
    const txt_width = ctx.measureText(txt).width

    const size = new Vec2D(txt_width+left_pad + right_pad,font_height+top_pad + bot_pad)
    super(pos,size);
    
    this.draw = () => {
      ctx.beginPath()
      ctx.fillStyle = "#303030"
      const txt = `${value}`
      ctx.roundRect(this.position.X(),this.position.Y(),this.size.X(),this.size.Y(),5)
      ctx.fill()
      ctx.fillStyle = "white"
      ctx.fillText(txt,this.position.X()+left_pad, this.position.Y()+top_pad);
      ctx.closePath()
    }
  }
}

class ArrayList extends DrawableElement {
  elements: ArrayElement[];
  draw: () => void;
  setElements: (elements: ArrayElement[]) => void;

  constructor(label: string, elements: ArrayElement[], pos: Vec2D, ctx: CanvasRenderingContext2D) {
    const [top_pad,right_pad,bot_pad,left_pad] = [4,10,4,10]
    const element_spacing = 4
    const font_height = 20;
    const txt = `$${label}`
    const label_width = ctx.measureText(txt).width + right_pad
    
    ctx.font = `${font_height}px roboto`
    const size = new Vec2D(label_width + left_pad + right_pad + elements.reduce<number>((sum,element) => sum += element.size.X(), 0),font_height+top_pad + bot_pad)
    super(pos,size);
    this.elements = elements;
    
    this.draw = () => {
      ctx.beginPath()
      ctx.roundRect(this.position.X(),this.position.Y(),this.size.X(),this.size.Y(),5)
      ctx.fillStyle = "gray"
      ctx.fill()
      ctx.fillStyle = "white";
      ctx.fillText(label,this.position.X()+left_pad, this.position.Y()+top_pad);
      ctx.closePath()
      this.elements.forEach(e => e.draw())
    }
    
    this.setElements = (elements) => {
      this.elements = elements
      this.size = new Vec2D(label_width + left_pad + element_spacing + this.elements.reduce<number>((sum,element) => sum += element.size.X() + element_spacing, 0),font_height+top_pad + bot_pad)
      this.elements.reduce<ArrayElement | null>((prev,current) => {
        let pos = prev ? prev.top_right.translateX(element_spacing) : this.top_left.translateX(label_width+element_spacing)
        current.setPosition(pos);
        return current
      }, null)
    }
  }
}