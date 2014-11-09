(function () {
    function Annular (options) {
        this.opts = {
            targetDom: document.body,
            lineWidth: 20,
            width: 0,
            fcolor: '#5ab1ef',
            unfcolor: '#ccc',
            value: {
                total: 100,
                finished: 0
            }

        };
        lib.extend(this.opts, options);
    }

    Annular.prototype = {
        render: function () {
            var opts = this.opts;
            var width = opts.width
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

                ctx.lineWidth = opts.lineWidth;
                ctx.strokeStyle = opts.fcolor;
                var startAngle = -(Math.PI / 2);
                var finishedRate = opts.value.finished / opts.value.total;
                if (finishedRate === 1) {
                    ctx.beginPath(); 
                    ctx.arc(50, 50, 40, 0, Math.PI*2, true);
                    ctx.stroke();
                    ctx.closePath();
                } else {
                    var finishedEndAngle = startAngle - Math.PI * 2 * finishedRate;
                    //开始绘制finished进度
                    ctx.beginPath(); 
                    ctx.arc(50, 50, 40, startAngle, finishedEndAngle, true);
                    
                    ctx.stroke();
                    // 开始绘制unfinished进度
                    ctx.beginPath();
                    ctx.strokeStyle = opts.unfcolor; 
                    ctx.arc(50, 50, 40, finishedEndAngle, startAngle, true);
                    ctx.stroke();
                    //结束绘制
                    ctx.closePath();
                }
                
            } else {
                //TODO something when browser don't surpport canvas
            }
            
        },
        setValue: function (total, finished) {
            lib.extend(this.opts, {
                value: {
                    total: total,
                    finished: finished
                }
            });
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