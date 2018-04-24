var AppBridge;
var AppAgent = 'KibDemo';
if(isOpenByCustomApp()){
    AppBridge = kibSdk();
}else{
    AppBridge = new virtualJsTransactionManager();
}
//事务管理器
function jsTransactionManager() {
    this.jsBridge = null,
    this.senderTransactions = {},
    this.webServicePool = {},
    this.initialDataFromNative = null;//接收页面初始化的回调
    this.init = function(){//初始化
        var that = this;
        setupWebViewJavascriptBridge(function(bridge){
                                     that.jsBridge = bridge;
                                     that.didInited&that.didInited()
                                     })
    }
    this.didInited = function(){//初始化完成
//        //注册handler,等待app调用
        var that = this;
        this.jsBridge.registerHandler('submitFromApp',function(data, responseCallback) {
                    var obj = eval("("+data+")");
                    var matchPath = obj['url'];
                    var id = obj['id'];
                    var param = obj['param'];
                    var response = null;
                    if(matchPath.startsWith('webService://',0) && obj){
                        var handlePath = matchPath;
                        handlePath = handlePath.replace(/webService:\/\//, "");
                        var strArry = handlePath.split("/");
                        if(strArry.length<2){
                            return
                        }
                        var component = strArry[0];
                        var module = strArry[1];

                        var handle = that.webServicePool[component];

                        if(handle){
                          response = handle(module,param,responseCallback)
                        }
                    }
                    if (response) {
                      responseCallback(response)
                    }
          })

        //页面初始化数据请求
        if(this.initialDataFromNative){
            this.call('KIBSdk://sdkReservedComponent/requestInitialData',"",this.initialDataFromNative);
        }
    }
    this.requestInitialData = function(callback){//向原生请求页面初始化数据
        this.initialDataFromNative = callback;
    };
    this.call = function(matchPath,param,invokeCallback){//向原生通讯
        var jsonParam = this.formatDispatchParam(matchPath,param);
          var thatInvokeCallBack = invokeCallback;
        var that = this;
        this.jsBridge.callHandler('submitFromWeb',jsonParam,function(responseData){
//                                  that.onTransactionSuccess(responseData)
                                  var json = eval("("+responseData+")")
                                  
                                  thatInvokeCallBack(json.param);
                                  });
        return new perform();
    }
    this.listen = function(component,invokeCallback){
        if(invokeCallback){
            this.webServicePool[component] = invokeCallback;
        }
    }
    this.onTransactionSuccess = function(data){
        var json = eval("("+data+")")
        var transaction = this.getTransactionById(json.id);
        transaction.invokeCallbackByName(json.param)
    }
    this.addTransaction = function(id,matchPath,param,invokeCallback){
        var transaction = new  jsTransaction();
        transaction.transacitionId = id;
        transaction.matchPath = matchPath;
        transaction.param = param;
        transaction.invokeCallbackByName = invokeCallback;
        this.senderTransactions[id] = transaction;
    }
    this.formatDispatchParam = function(matchPath,param){
        var json = eval("("+"{}"+")");
        json["url"] = matchPath;
        json["params"] = param;
        return json
    }

}

function kibSdk(){
    var jsTm = new jsTransactionManager();
    jsTm.init();
    return jsTm;
}

function isOpenByCustomApp(){
    let a = (navigator.userAgent==AppAgent);
    return a;
}

function perform(){
    this.wp= function(invocation){
        if(invocation && !isOpenByCustomApp()){
            invocation();
        }
    }
}
//init bridge of it's platform
function setupWebViewJavascriptBridge(callback) {
    if(window.WebViewJavascriptBridge) {
        return callback(WebViewJavascriptBridge);
    }
    if(window.WVJBCallbacks) {
        return window.WVJBCallbacks.push(callback);
    }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'https://__bridge_loaded__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function() {
               document.documentElement.removeChild(WVJBIframe)
               }, 0)
    if (!window.WebViewJavascriptBridge){
        document.addEventListener(
                                  'WebViewJavascriptBridgeReady'
                                  , function() {
                                  callback(WebViewJavascriptBridge)
                                  },false);
    }
}

//事务实体
function jsTransaction(){
    this.transacitionId = null;//事务id
    this.matchPath = null;//url 包含信息：schema,component,module
    this.param = null;//参数
    this.invokeCallback = null;//回调
}

//生成uuid
function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "";

    var uuid = s.join("");
    return uuid;
}

//虚拟事务管理器
function virtualJsTransactionManager() {
    this.jsBridge = null,
    this.callTransactions = [],
    this.initialDataFromNative = null;
    this.init = function(){

    }
    this.didInited = function(){
    }
    this.requestInitialData = function(callback){
    };
    this.call = function(matchPath,param,invokeCallback){
        return new perform();
    }
    this.listen = function(component,invokeCallback){
      
    }
    this.onTransactionSuccess = function(data){
    }
    this.addTransaction = function(id,matchPath,param,invokeCallback){
    }
    this.getTransactionById = function(id){
    }
    this.formatDispatchParam = function(transactionId,matchPath,param){
    }
}
