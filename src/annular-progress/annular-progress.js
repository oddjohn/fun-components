(function (global) {
    function Annular (options) {
        this.opts = {
            targetDom: document.body,
            lineWidth: 20,
            width: 0,
            fcolor: '#5ab1ef',
            unfcolor: '#ccc',
            max: 100,
            value: 0,
            textColor: null,
            fontSize: 20,
            fontStyle: 'normal',
            fontFamily: 'Arial',
            fontWeight: 'Bold',
            textFormatter: null
        };
        lib.extend(this.opts, options);
    }

    function renderText (ctx, opts) {
        var o = opts;
        var position = o.width / 2;
        ctx.font = o.fontStyle + ' ' + o.fontWeight + ' ' + o.fontSize + 'px ' + o.fontFamily;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = o.textColor || o.fcolor;
        var showText = '';
        if (typeof o.textFormatter === 'function') {
            showText = o.textFormatter(o.max, o.value);
        } else {
            showText =  Math.round(o.value / o.max * 100) + '%';
        }
        
        ctx.fillText(showText, position, position);
    }
    Annular.prototype = {
        render: function () {
            var opts = this.opts;
            var width = opts.width;
            var position = width / 2;
            var canvas, ctx;
            if (this.getCanvas()) {
                canvas = this.getCanvas();
            } else {
                canvas = document.createElement('canvas');
                canvas.id = this.id = lib.getGUID();
                canvas.width = canvas.height = width;
                var wrapper = typeof opts.targetDom === 'string'
                            ? document.getElementById(opts.targetDom)
                            : opts.targetDom;
                wrapper.innerHTML = '';
                wrapper.appendChild(canvas);
                global.G_vmlCanvasManager && global.G_vmlCanvasManager.initElement(canvas);
            } 
            
            if (canvas.getContext) {
                ctx = canvas.getContext('2d');
                //清空canvas现有内容。
                ctx.clearRect(0, 0, width, width);
                

                ctx.lineWidth = opts.lineWidth;
                ctx.strokeStyle = opts.fcolor;
                
                var startAngle = -(Math.PI / 2);
                var valueRate = opts.value / opts.max;
                // var radius = (width - opts.lineWidth) / 2;
                //内圆半径
                var r = width / 2 - opts.lineWidth;
                //外圆半径
                var radius = width / 2;

                if (valueRate === 1) {
                    ctx.beginPath();
                    ctx.arc(position, position, radius, 0, Math.PI*2, true);
                    ctx.arc(position, position, r, 0, Math.PI*2, true);
                    ctx.fill();
                    ctx.closePath();
                } else {
                    var valueEndAngle = startAngle - Math.PI * 2 * valueRate;
                    //开始绘制value进度
                    ctx.beginPath();
                    ctx.fillStyle = opts.fcolor;
                    ctx.arc(position, position, radius, startAngle, valueEndAngle, true);
                    ctx.lineTo(position, position);
                    ctx.fill();
                    // ctx.closePath();
                    // 开始绘制unvalue进度
                    ctx.beginPath();
                    ctx.fillStyle = opts.unfcolor; 
                    ctx.arc(position, position, radius, valueEndAngle, startAngle, true);
                    ctx.lineTo(position, position);
                    ctx.fill();
                    // ctx.closePath();


                    ctx.beginPath();
                    ctx.arc(position, position, r, 0, Math.PI*2, true);
                    ctx.fillStyle = '#fff';
                    ctx.fill();
                    //结束绘制
                    ctx.closePath();

                    //excanvas fillText扩展
                    if (!ctx.fillText) {
                        lib.extend(ctx, {
                            measureText: function(textToDraw) {  
                                var hiddenSpan = document.createElement('span');  
                                hiddenSpan.style.font = this.font;  
                                hiddenSpan.innerHTML = textToDraw;  
                                var bodyNode = document.getElementsByTagName('body')[0];  
                                bodyNode.appendChild(hiddenSpan);  
                                var width = hiddenSpan.offsetWidth;  
                                bodyNode.removeChild(hiddenSpan);
                                return {'width' : width};
                            },
                            
                            fillText: function(textToDraw, x, y) {  
                                var vmlStr = [];
                                if (!this.textHeight) {
                                    var textHeightStr = this.font.split(' ')[2];
                                    this.textHeight = +textHeightStr.replace('px', '') + 2;
                                }
                                var textWidth = this.measureText(textToDraw).width; 
                                vmlStr.push('<g_vml_:shape style="font:' + this.font + ';',  
                                              ' color:' + this.fillStyle + ';',  
                                              ' position:absolute;',  
                                              ' left:' + (x - textWidth / 2) + 'px;',  
                                              ' top:' + (y - this.textHeight / 2) + 'px;',  
                                              ' width:' + textWidth + 'px;',  
                                              ' height:' + this.textHeight + 'px;"',  
                                              ' ><g_vml_:textbox inset="0,0,0,0">' + textToDraw,  
                                              ' </g_vml_:textbox>',  
                                              '</g_vml_:shape>'); 
                              
                                this.element_.insertAdjacentHTML('BeforeEnd', vmlStr.join(''));  
                            }
                        });
                    }
                    //绘制文本
                    renderText(ctx, opts);
                }
                
            } else {
                //TODO something when browser don't surpport canvas
            }
            
        },
        setOptions: function (options) {
            lib.extend(this.opts, options);
            this.render();
        },
        getCanvas: function () {
            return document.getElementById(this.id);
        }
    };


    var lib = {};

    var counter = 0x641005;

    lib.extend = function (target, source) {
        for (var i = 1, len = arguments.length; i < len; i++) {
            source = arguments[i];

            if (!source) {
                continue;
            }

            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
        }

        return target;
    };
    lib.getGUID = function () {
        return 'an-' + counter++;
    };

    var annular = function (options) {
        return new Annular(options);
    };

    if (typeof define === 'function') {
        define('annular', [], function () {
            return annular;
        });
    } else {
        global.annular = annular;
    }

})(window);