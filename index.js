    function Clipper(dom, data) {
        var nod = document.createElement('style'),
            str = '#cut-container{width: 100%;height: 100%;position: relative;background: #FFF;overflow: hidden!important;}#cut-container .maskTB{width: 100%;height: 50px;background: #000;opacity: 0.5;filter: alpha(opacity=50);position: absolute;left: 0;z-index: 10}#cut-container .maskT{top: 0;}#cut-container .maskB{bottom: 0;}#cut-container .maskLR{position: absolute;background: #000;opacity: 0.5;filter: alpha(opacity=50);height: 200px;width: 50px;top: 50px;z-index: 10;}#cut-container .maskL{left: 0;}#cut-container .maskR{right: 0;}#cut-container img{position: absolute;cursor: move;display: block;}';
            nod.type='text/css';
        if(nod.styleSheet){
            nod.styleSheet.cssText = str;  
        } else {  
            nod.innerHTML = str;
        }
        dom.append(nod);
        //裁剪容器
        this.$container = dom;
        var container = this.$container;
        //容器宽高
        dom.width(data.containerWidth).height(data.containerHeight);
        var html = '<div id="cut-container" class="container" >' +
                        '<div node-type="border" class="maskTB maskT"></div>' +
                        '<div node-type="border" class="maskTB maskB"></div>' +
                        '<div node-type="border" class="maskLR maskL"></div>' +
                        '<div node-type="border" class="maskLR maskR"></div>' +
                        '<img id="cut-img" src="' + data.url + '">' +
                    '</div>';
        container.append(html);
        //裁剪图片
        this.$Clipper = this.$container.find('img');
        var Clipper = this.$Clipper;
        //是否移动
        this.moving = false;
        //裁剪边框宽度
        this.borderWidth = (this.$container.width() - data.cutWidth) / 2;
        this.borderHeight = (this.$container.height() - data.cutHeight) / 2;
        //放大倍数
        this.scale = 0;
        //剪裁尺寸
        this.cutWidth = data.cutWidth;
        this.cutHeight = data.cutHeight;
        var _this = this;
        this.$Clipper.load(function () {
            //初始化图片位置
            $(this).css({
                left: (container.width() - Clipper.width()) / 2 + 'px',
                top: (container.height() - Clipper.height()) / 2 + 'px'
            });
            //图片原始尺寸
            _this.initialWidth = _this.$Clipper.width();
            _this.initialHeight = _this.$Clipper.height();
            //图片原始位置
            _this.initialX = parseFloat(_this.$Clipper.css('left'));
            _this.initialY = parseFloat(_this.$Clipper.css('top'));
        });
        
        this.$Clipper.mousedown(function (e) {
            var _this = $(this);
            var e = e || window.event;
            moving = true;
            var imgX = e.clientX - _this.offset().left;
            var imgY = e.clientY - _this.offset().top;
            _this.mousemove(function (e) {
                if (moving) {
                    var e = e || window.event;
                    //禁用默认事件
                    if (e.preventDefault) {
                        e.preventDefault();
                        e.stopPropagation();
                    } else {
                        e.returnValue = false;
                        e.cancelBubble = true;
                    }
                    $(this).css({
                        left: e.clientX - container.offset().left - imgX + 'px',
                        top: e.clientY - container.offset().top - imgY + 'px'
                    });
                }
            });
        });
        this.$Clipper.mouseup(function () {
            moving = false;
        });
        this.$container.find('div[node-type="border"]').mouseover(function () {
            moving = false;
        });
        var borderWidth = this.borderWidth;
        var borderHeight = this.borderHeight;
        //遮罩
        dom.find('.maskTB').height(borderHeight);
        dom.find('.maskLR').width(borderWidth).height(data.cutHeight).css('top', borderHeight + 'px');

    }

    Clipper.prototype.bigger = function () {
        this.scale += 1;
        var deltaX = parseFloat(this.$Clipper.css('left')) - this.initialX;
        var deltaY = parseFloat(this.$Clipper.css('top')) - this.initialY;
        this.$Clipper.width(this.initialWidth * (1 + this.scale * 0.1));
        this.$Clipper.height(this.initialHeight * (1 + this.scale * 0.1));
        this.$Clipper.css({
            left: this.initialX - (this.$Clipper.width() - this.initialWidth * (1 + (this.scale - 1) * 0.1)) / 2 + deltaX + 'px',
            top: this.initialY - (this.$Clipper.height() - this.initialHeight * (1 + (this.scale - 1) * 0.1)) / 2 + deltaY + 'px'
        });
    }

    Clipper.prototype.smaller = function () {
        this.scale -= 1;
        var deltaX = parseFloat(this.$Clipper.css('left')) - this.initialX;
        var deltaY = parseFloat(this.$Clipper.css('top')) - this.initialY;
        this.$Clipper.width(this.initialWidth * (1 + this.scale * 0.1));
        this.$Clipper.height(this.initialHeight * (1 + this.scale * 0.1));
        this.$Clipper.css({
            left: this.initialX - (this.$Clipper.width() - this.initialWidth * (1 + (this.scale + 1) * 0.1)) / 2 + deltaX + 'px',
            top: this.initialY - (this.$Clipper.height() - this.initialHeight * (1 + (this.scale + 1) * 0.1)) / 2 + deltaY + 'px'
        });
    }

    Clipper.prototype.cut = function (fn) {
        var url = this.$Clipper.attr('src');
        var ltPosX = parseFloat(- (this.$Clipper.offset().left - this.$container.offset().left - this.borderWidth));
        var ltPosY = parseFloat(- (this.$Clipper.offset().top - this.$container.offset().top - this.borderWidth));
        var multiple = 1 + this.scale * 0.1;
        var _this = this;
        $.ajax({
            type: "GET",
            url: "http://10.10.69.41/image/clip",
            data: {
                imageUrl: url,
                zoom: multiple,
                startX: ltPosX,
                startY: ltPosY,
                targetWidth: _this.cutWidth,
                targetHeight: _this.cutHeight,
                colorNum: 1
            },
            dataType: 'jsonp',
            success: function(data) {
                if (data.message === 'OK') {
                    fn(data.data);
                }
            }
        });
    }