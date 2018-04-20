/**
 * Created by pekko1215 on 2017/07/16.
 */
var colordata = {
    DEFAULT_B:{
        color:0xcccccc,
        alpha:0.5
    },
    DEFAULT_F: {
        color:0xffffff,
        alpha:0.5
    },
    RED_B:{
        color:0xff0000,
        alpha:0.3
    },
    LINE_F:{
        color:0xcccccc,
        alpha:0.5
    },
    SYOTO_B:{
        color:0x444444,
        alpha:0.5
    },
    SYOTO_F:{
        color:0x666666,
        alpha:0.5
    }
}

var flashdata = {
    default:{
        back:Array(3).fill(Array(3).fill(colordata.DEFAULT_B)),
        front:Array(3).fill(Array(3).fill(colordata.DEFAULT_F))
    },
    redtest:{
        back:Array(3).fill(Array(3).fill(colordata.RED_B)),
        front:Array(3).fill(Array(3).fill(colordata.RED_B))
    }
}

var flashAnimetion = {
    fall:function(obj,callback){
        var backcolor = obj.back;
        var frontcolor = obj.front;
        var timer = obj.timer;
        var arr = obj.arr || [1,1,1]
        var animation = ReelFlashAnimation();
        var flasher = new ReelFlash(slotmodule.lastFlash);
        flasher.setFrontColor(frontcolor);
        flasher.setBackColor(backcolor)
        flasher.timer = 1;
        animation.push(flasher);
        for(var i=0;i<3;i++){
            flasher = flasher.copy();
            flasher.timer = timer;
            var matrix = [];
            matrix.push(...Array(i+1).fill(arr));
            flasher.drawFront(matrix);
            flasher.drawBack(matrix);
            animation.push(flasher);
        }
        animation.flash()
        return animation.prom
    }
}

function replaceMatrix(base, matrix, front, back) {
    var out = JSON.parse(JSON.stringify(base));
    matrix.forEach(function(m, i) {
        m.forEach(function(g, j) {
            if (g == 1) {
                front && (out.front[i][j] = front);
                back && (out.back[i][j] = back);
            }
        })
    })
    return out
}

function ReelFlash(back){
    back = back||flashdata.default;
    this.matrix = JSON.parse(JSON.stringify(back))
    this.timer=30;
}
ReelFlash.prototype.setFrontColor = function(color){
    this.frontColor = color;
}
ReelFlash.prototype.setBackColor = function(color){
    this.backColor = color;
}
ReelFlash.prototype.drawFront = function(matrix){
    if(this.frontColor === undefined){throw "No Select Front Color"}
    var color = JSON.parse(JSON.stringify(this.frontColor));
    matrix.forEach((arr,x)=>{
        arr.forEach((v,y)=>{
            this.matrix.front[x][y] = v?color:this.matrix.front[x][y]
        })
    })
}
ReelFlash.prototype.drawBack = function(matrix){
    if(this.backColor === undefined){throw "No Select Back Color"}
    var color = JSON.parse(JSON.stringify(this.backColor));
    matrix.forEach((arr,x)=>{
        arr.forEach((v,y)=>{
            this.matrix.back[x][y] = v?color:this.matrix.back[x][y]
        })
    })
}

ReelFlash.prototype.resetFront = function(){
    if(this.frontColor === undefined){throw "No Select Front Color"}
    var color = JSON.parse(JSON.stringify(this.frontColor));
    this.matrix.forEach((arr,x)=>{
        arr.forEach((v,y)=>{
            this.matrix.front[x][y] = color;
        })
    })
}
ReelFlash.prototype.resetBack = function(){
    if(this.backColor === undefined){throw "No Select Back Color"}
    var color = JSON.parse(JSON.stringify(this.backColor));
    this.matrix.forEach((arr,x)=>{
        arr.forEach((v,y)=>{
            this.matrix.back[x][y] = color;
        })
    })
}
ReelFlash.prototype.copy = function(){
    var ret = JSON.parse(JSON.stringify(this));
    ret.__proto__ = this.__proto__;
    return ret;
}

ReelFlash.prototype.flash = function(){
    return slotmodule.setFlash(this.matrix,this.timer);
}

function ReelFlashAnimation(){
    var arr = [];
    arr.prom = Promise.resolve();
    arr.stopper = false;
    arr.flash = ()=>{
        arr.forEach((flash)=>{
            arr.prom = flash.flash();
        })
    }
    arr.loop = ()=>{
        arr.flash();
        arr.prom.then(()=>{
            arr.loop();
        })
    }
    arr.stop = ()=>{
        arr.stopper = true;
    }
    arr.prom.catch(()=>{
        arr.stopper = false;
        arr.prom = Promise.resolve();
    })
    return arr;
}