(function(){
    function jQuery (selector){
        return new jQuery.prototype.init(selector);

    }
    jQuery.prototype.init = function(selector){  //init初始化的意思选出dom标签并且包装好
        //id class
        this.length = 0;
        if(selector == null){   //undefined 一致
            return this;
        }
        if(typeof selector == 'string' && selector.indexOf('.') != -1){
            var dom = document.getElementsByClassName( selector.slice(1) );
        }else if( typeof selector == 'string' && selector.indexOf('#') != -1 ){
            var dom = document.getElementById( selector.slice(1) )
        }
        // if(selector instanceof Element){
        //     this[0] = selector;
        //     this.length++;
        // }
        if(selector instanceof Element || dom.length == undefined){
            this[0] = dom || selector;
            this.length++
        } else{
            for(var i = 0;i < dom.length;i++){
                this[i] = dom[i];
                this.length++
            }
        }

    }

    jQuery.prototype.css = function (config){
        for(var i = 0;i< this.length;i++){
            for(attr in config){
                this[i].style[attr] = config[attr];
            }
        }
        return this; //链式操作
    }




    jQuery.prototype.pushStack = function (dom) {
        if(dom.constructor != jQuery){
            
            dom = jQuery(dom);
        }
        dom.prevObject = this;
        return dom;
    }



    jQuery.prototype.get = function (num) {
        if(num == null){
            return [].slice.call(this,0);
        }else{
            if(num >= 0){
                return this[num];
            }else{
                return this[num + this.length]
            }
        }
    }


    jQuery.prototype.eq = function (num) {
        var dom = num != null ? (num >= 0 ? this[num] :this[num + this.length]) : null;
       return  this.pushStack(dom);
        
    }


//重要考点里面包含栈
    jQuery.prototype.add = function (selector) {
        var curObj = jQuery(selector);
        var baseObj = this;
        var newObj = jQuery();
        for(var i =0;i<curObj.length;i++){
            newObj[ newObj.length++] = curObj[i];

        }
        for(var i =0;i< baseObj.length;i++){
            newObj[ newObj.length++] =  baseObj[i];

        }
       
        this.pushStack(newObj);

        return newObj;
    }
    jQuery.prototype.end = function () {
        return this.prevObject;
    }




    //
    jQuery.prototype.myOn = function (type,handle){
        for(var i = 0; i<this.length;i++){
            if(!this[i].cacheEvent){
                this[i].cacheEvent = {};
            }
            if(!this[i].cacheEvent[type]){
                this[i].cacheEvent[type] = [handle];
            }else{
                this[i].cacheEvent[type].push(handle);
            }
        }
    }
    jQuery.prototype.myTrigger = function (type) {
        var params = arguments.length > 1 ? [].slice.call(arguments,1) : [];
        for(var i = 0;i < this.length;i++){
            if(this[i].cacheEvent[type]){
                this[i].cacheEvent[type].forEach(function (ele, index){
                    ele.apply(self,params)
                });
            }
        }
    }


    jQuery.prototype.myQueue = function (type, handle){
       
        var queueObj = this;
        var queueName = arguments[0] || 'fx';
        var addFunc = arguments[1] || null;
        var len = arguments.length;  
        //获取队列
        if(len == 1){
            return  queueObj[0][queueName] ;
        }
        //添加队列
        queueObj[0][queueName] == undefined ? queueObj[0][queueName] = [addFunc] : queueObj[0][queueName].push(addFunc);

        return this;

    }  
    jQuery.prototype.myDequeue = function (type) {
        var self = this;
        var queueName = arguments[0] || 'fx';
        var queueArr = this.myQueue(queueName);
        var currFunc =  queueArr.shift();
        if(currFunc == undefined){
            return 
        }
        var next = function () {
            self.myDequeue(queueName);
        }
        currFunc(next);
        return this;

    }

    jQuery.prototype.myDelay = function (duration){
        var queueArr = this[0]['fx'];
        queueArr.push(function (next) {
            setTimeout(function(){
                next()
            },duration)
        })
        return this;
    }


        jQuery.prototype.myAnimate = function (json,callback) {

            var len = this.length;
            var self = this;
            var baseFunc = function (next) {
                var times = 0;
                for(var i= 0;i<len;i++){
                    startMove(self[i],json,function(){
                        times ++;
                        if(times == len){
                            callback && callback();
                            next();
                        }
                    });
                }
            }


            this.myQueue('fx',baseFunc);

            if(this.myQueue('fx').length == 1){
                this.myDequeue('fx');
            }


            function getstyle(dom,attr){
                if(window.getComputedStyle){
                    return window.getComputedStyle(dom,null)[attr];
                }else{
                    return dom.currrentStyle[attr];
                }
            }
            function startMove (dom,obj,callback){
                clearInterval(dom.timer);
                 var timer = null;
                    var speed = null;
                    var icur = null;
                   
                  
                
                    dom.timer = setInterval(function(){
                        var Bblock = true;
                        for( var attr in obj){
                            if(attr == 'opacity'){
                                icur = parseFloat(getstyle(dom,attr)) * 100;
                            }else{
                                icur = parseInt(getstyle(dom,attr));  
                            }
                            speed = ( obj[attr] - icur)/7;
                            speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
                            if(attr == 'opacity'){
                                dom.style.opacity = (icur + speed)/100
                            }else{
                                dom.style[attr] = icur + speed + 'px';
                            }
                            if(icur != obj[attr]){
                                Bblock = false;
                            }
                            }
                            if(Bblock){
                            clearInterval(dom.timer);
                            typeof callback == 'function' && callback();
                        }
                    },30);
                }
                return this;
        }





            jQuery.myCallbacks = function () {
                var options = argunments[0] || '';
                var list = [];
                var fireIndex = 0;

                //记录是否被fire过
                var fired = false;

                //实际参数列表
                var args = [];

                var fire = function () {
                    for(;fireIndex < list.length;fireIndex++){
                        list[fireIndex].apply(window,args);
                    }
                    if(options.indexOf('once') != -1){
                        list = [];
                        fireIndex = 0;
                    }
                }

                return {
                    add : function(func){
                        list.push(func);
                        if(options.indexOf('memory') != -1 && fired){
                            fire();
                        }
                        return this;
                    },
                    fire:function(){
                        fireIndex = 0;
                        args = arguments;
                        fire = true;
                        fire();
                    }
                }
            }




            jQuery.myDeferred = function () {
                //3 个call
                var arr = [
                    [
                        jQuery.myCallbacks('once memory'),'done','resolve'
                    ],
                    [
                        jQuery.myCallbacks('once memory'),'fail','reject'
                    ],
                    [
                        jQuery.myCallbacks('once memory'),'progress','notify'
                    ]
                ]
                    var pendding = true;
                    var deferred = {};
                for(var i = 0;i<arrCallbacks.length;i++){
                    deferred[arr[i][1]] = (function (index){
                        return function (func) {
                            arr[index][1].add(func)
                        }
                    })(i);
                }


                deferred[arr[i][2]] =(function (index) {
                    return  function () {
                        var args = arguments;
                        if(pendding) {
                            arr[index][0].fire.apply(window,args);
                            arr[index][2] =='resolve' || arr[index][2] == 'reject' ? pendding = false:'';
                        }
                    }
                })(i)

                return DeferredPermissionRequest;
            }


    jQuery.prototype.init.prototype = jQuery.prototype;


    window.$ = window.jQuery = jQuery;   //闭包
})();