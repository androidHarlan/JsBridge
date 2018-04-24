var jsTransactionManagers = kibSdk();
function kibSdk(){
    var jsTm = new jsTransactionManager();
    jsTm.init();
    return jsTm;
}
//事务实体
function jsTransaction(){
	this.transacitionId = null;//事务id
	this.matchPath = null;//url 包含信息：schema,component,module
	this.param = null;//参数
	this.invokeCallback = null;//回调
}
//事务管理器
function jsTransactionManager() {
    this.jsBridge = null,
	this.jsTransactions = [],
    this.initialDataFromNative = null;//接收页面初始化的回调
    this.init = function(){//初始化
        var that = this;
        setupWebViewJavascriptBridge(function(bridge){
          that.jsBridge = bridge;
          that.didInited&that.didInited()
         })
    }
    this.didInited = function(){//初始化完成
        if(this.initialDataFromNative){
            this.call("KIBSdk://sdkReservedComponent/requestInitialData","",this.initialDataFromNative);
        }
    }
    this.requestInitialData = function(callback){//向原生请求页面初始化数据
        this.initialDataFromNative = callback;
    };
	this.call = function(matchPath,param,invokeCallback){//向原生通讯
		var id = uuid()
		this.addTransaction(id,matchPath,param,invokeCallback)
		var jsonParam = this.formatDispatchParam(id,matchPath,param);
        var that = this;
		this.jsBridge.callHandler("submitFromWeb",jsonParam,function(responseData){
			that.onTransactionSuccess(responseData)
		});
	}
	this.onTransactionSuccess = function(data){
		var json = eval("("+data+")")
		var transaction = this.getTransactionById(json.id);
		transaction.invokeCallbackByName(json.param)
	}
	this.addTransaction = function(id,matchPath,param,invokeCallback){
		var jsTransactions = new  jsTransaction();
		jsTransactions.transacitionId = id;
		jsTransactions.matchPath = matchPath;
		jsTransactions.param = param;
		jsTransactions.invokeCallbackByName = invokeCallback;
		this.jsTransactions.push(jsTransactions)
	}
	this.getTransactionById = function(id){
		for (var i = 0 ;i<this.jsTransactions.length;i++) {
			var transaction = this.jsTransactions[i]
			if(transaction.transacitionId==id){
				return transaction;
			}
		}
		return null;
	}
	this.formatDispatchParam = function(transactionId,matchPath,param){
		var json = eval("("+"{'header':''}"+")");
		json["url"] = matchPath;
		json["id"] = transactionId;
		json["params"] = param;
		return json
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
