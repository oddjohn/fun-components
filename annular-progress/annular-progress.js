(function () {
    function Annular (options) {
        this.opts = {
            targetDom: document.body,
            lineWidth: 20,
            width: 0,
            fcolor: '#5ab1ef',
            unfcolor: '#ccc',
            total: 100,
            finished: 0,
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
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = o.textColor || o.fcolor;
        var showText = '';
        if (typeof o.textFormatter == 'function') {
            showText = o.textFormatter(o.total, o.finished);
        } else {
            showText =  Math.round(o.finished / o.total * 100) + '%';
        }
        
        ctx.fillText(showText, position, position);
    }
    Annular.prototype = {
        render: function () {
            var opts = this.opts;
            var width = opts.width;
            var position = width / 2;
            var canvas;
            if (this.getCanvas()) {
                canvas = this.getCanvas();
            } else {
                canvas = document.createElement('canvas');
                canvas.id = this.id = lib.getGUID();
                canvas.width = canvas.height = width;
                var wrapper = typeof opts.targetDom == 'string'
                            ? document.getElementById(opts.targetDom)
                            : opts.targetDom;
                wrapper.appendChild(canvas);
            } 
            
            if (canvas.getContext) {
                var ctx = canvas.getContext('2d');
                //清空canvas现有内容。
                ctx.clearRect(0, 0, width, width);
                //绘制文本
                renderText(ctx, opts);

                ctx.lineWidth = opts.lineWidth;
                ctx.strokeStyle = opts.fcolor;
                var startAngle = -(Math.PI / 2);
                var finishedRate = opts.finished / opts.total;
                var radius = (width - opts.lineWidth) / 2;

                if (finishedRate === 1) {
                    ctx.beginPath(); 
                    ctx.arc(position, position, radius, 0, Math.PI*2, true);
                    ctx.stroke();
                    ctx.closePath();
                } else {
                    var finishedEndAngle = startAngle - Math.PI * 2 * finishedRate;
                    //开始绘制finished进度
                    ctx.beginPath(); 
                    ctx.arc(position, position, radius, startAngle, finishedEndAngle, true);
                    
                    ctx.stroke();
                    // 开始绘制unfinished进度
                    ctx.beginPath();
                    ctx.strokeStyle = opts.unfcolor; 
                    ctx.arc(position, position, radius, finishedEndAngle, startAngle, true);
                    ctx.stroke();
                    //结束绘制
                    ctx.closePath();
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

    window.annular = function (options) {
        return new Annular(options);
    };
    return annular;
})(window)