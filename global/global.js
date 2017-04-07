

/**************SumaJS基类**************/
var SumaJS = {
	pageModule: {},								//页面模块
	registerModule: null,						//注册页面模块
	loadModule: null,							//载入页面
	lastModuleName: "",							//先前页面模块名称
	currModuleName: "",							//当前页面模块名称
	currentPageObj: null,						//当前页面
	$: null,									//获取html元素
	readFile: null,								//读取文件
	saveFile: null,								//保存文件
	isDebug: true,								//是否开启机顶盒打印
	debug: null,								//机顶盒打印
	ajax: null,									//ajax请求
	msgBox:null,								//弹出框对象
	showMsgBox:null,							//显示弹出框
	dateFormat: null,							//参数格式"yyyy-MM-dd hh:mm:ss w"
	showDateTime: null,							//时间显示
	registerEventHandler: null,					//注册事件
	removeEventHandler: null,					//移除事件
	serviceInfoJson: null,						//配置表文件(json)
	allServices: [],							//所有频道信息
//	currentService: null,						//当前频道信息
	eventHandlerManager: new EventHandlerManager(),			//按键事件管理
	globalPlayer: null,							//视频播放器
	createPlayer: function(){this.globalPlayer = new Player();},		
	stbFrontPanel: null,							//机顶盒前面板显示
    isChromeBrowser:null,                                 //是否为chrome浏览器
    changeBodyBgColor:null
};

SumaJS.changeBodyBgColor = function(color){
    var bodys = SumaJS.$("body");
    for(var i=0;i<bodys.length;i++){
        bodys[i].style.backgroundColor = color;
    }
}
//是否为chrome浏览器
SumaJS.isChromeBrowser = function(){
    var ua = navigator.userAgent;
    if(!ua){
        return false;
    }
    return ua.indexOf("Chrome") > -1 || ua.indexOf("Safari") > -1;
};
//机顶盒打印
SumaJS.debug = function(str){
	if (!this.isDebug){return;}
	if (typeof Utility != "undefined" && typeof Utility.println != "undefined") {
		Utility.println(str);
	} else if (typeof RocME != "undefined" && typeof RocME.debug != "undefined") {
		RocME.debug(str);
	} else if (typeof console != "undefined") {
		console.debug(str);
	}
};
SumaJS.debugE = function(str){
    SumaJS.debug("error:"+str);
};
//注册页面模块
SumaJS.registerModule = function(pageName, page){
	if(!pageName || typeof page != "object"){return false;}
	SumaJS.debug("registerModule " + pageName);
	this.pageModule[pageName] = page;
	return true;	
};
//载入页面
SumaJS.loadModule = function(pageName){
	if(!pageName){return false;}	
	SumaJS.debug("loadModule " + pageName);
	if(this.pageModule[pageName]){
		SumaJS.debug("release "+this.currModuleName+" start at time:"+(new Date()).getTime())
		if(this.currentPageObj){
			this.currentPageObj.onDestroy();
			for(var i in this.currentPageObj){
				this.currentPageObj[i] = null;
			}
			this.currentPageObj = null;
		}
		SumaJS.debug("release "+this.currModuleName+" end at time:"+(new Date()).getTime());
		this.lastModuleName = this.currModuleName;
		this.currModuleName = pageName;
		this.currentPageObj = new Page(this.pageModule[pageName]);
		SumaJS.debug("oncreate "+this.currModuleName+" start at time:"+(new Date()).getTime());
		this.currentPageObj.onCreate();
		SumaJS.debug("oncreate "+this.currModuleName+" end at time:"+(new Date()).getTime());
		this.currentPageObj.onStart();
		SumaJS.debug("onstart "+this.currModuleName+" end at time:"+(new Date()).getTime());
		return true;
	}
	return false;
};
SumaJS.showMsgBox = function(cfg){
	if(!SumaJS.msgBox){
		var box = new MessageBox();
		SumaJS.msgBox = box;
		SumaJS.registerKeyEventHandler("messageBox", box);	
	}
	SumaJS.msgBox.createBox(cfg);	
};

SumaJS.closeMsgBox = function(boxName){
	if(SumaJS.msgBox){
		SumaJS.msgBox.removeMsg(boxName);	
	}
};

//获取html元素
SumaJS.$ = function(param){
	if(typeof param != "string"){return null;}
	param = param.split(" ");
	var result = document;
	for(var i=0;  i<param.length; i++){
		switch(param[i][0]){
			case ".":		//classname
				result = result.getElementsByClassName(param[i].substr(1));
				break;
			case "#":		//ID
				result = result.getElementById(param[i].substr(1));
				break;
			default:		//tagname
				result = result.getElementsByTagName(param[i]);
				break;
		}
	}
	return result;
};
//读取文件
SumaJS.readFile = function(filePath, type){
	if(!filePath){return null;}
	var type = type || "string";
	
	var fileHandle = FileSystem.getFile(filePath);
	if(fileHandle == -1){
		return null;
	}else if(fileHandle == 0){
		return null;
	}
	
	var ret = fileHandle.open(1);
	if(ret == 0){return null;}
	
	var n = 0;
	do{
		ret = fileHandle.readAllfile();
		n++;
	}while(ret==0 && n<3)
	
	if(ret == 0){return null;}
		
	var result;
	if(type == "json"){
		try {
			result = JSON.parse(ret);
		} catch(e) {		
			return null;
		}
	}else{
		result = ret;
	}
	
	ret = fileHandle.close();
	if(ret == -1){return null;}
	
	ret = FileSystem.killObject(fileHandle);
	if(ret == 0){return null;}
		
	return result;	
};
//保存文件
SumaJS.saveFile = function(filePath, data){
	if(!filePath || !data){return false;}
	if(typeof data == "object"){
		data = JSON.stringify(data);
	}
	
	var fileHandle = FileSystem.createFile();
	var ret = fileHandle.open(1);
	if(ret == 0){return false;}	
	ret = fileHandle.writeFile(data);
	if(ret == 0){return false;}		
	ret = fileHandle.close();
	if(ret == -1){return false;}	
	
	var dirObj = FileSystem.createDirectory(filePath.substring(0, filePath.lastIndexOf('/')));
	if(dirObj == 0){return false;}
	ret = fileHandle.saveAs(filePath);
	if(ret == -1){
		return false;
	}else if(ret == 0){
		return false;
	}	
	ret = FileSystem.killObject(fileHandle);
	if(ret == 0){return false;}
	if(typeof dirObj == "object"){
		ret = FileSystem.killObject(dirObj);
		if(ret == 0){return false;}
	}	
		
	return true;	
};
//ajax请求
SumaJS.ajax = function(params){
	var url = params.url;
	var method = params.method || "GET";
	var data = params.data || "";
	var async = params.async !== false;
	var success = params.success || function(){};
	var failed = params.failed || function(){};
	var maskId = typeof params.maskId != "undefined" ? params.maskId : parseInt((new Date()).getTime()+""+parseInt(Math.random()*1000));
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		SumaJS.debug("@@@readyState="+xmlHttp.readyState);
		if (xmlHttp.readyState == 4) {// 已收到响应
			SumaJS.debug("@@@status="+xmlHttp.status);
			if (xmlHttp.status == 200 ) {// 请求成功
				success(xmlHttp);
			}else{
				if(xmlHttp.responseText && xmlHttp.responseText.length>0){
					success(xmlHttp);
				}else{
					failed(xmlHttp);
				}
			}
		}
	};
	xmlHttp.maskId = maskId;

	xmlHttp.open(method, url, async);

	if (method.toLowerCase() == "post") {
		xmlHttp.setRequestHeader("Content-Type", "application/json");
		xmlHttp.send(data);
	} else {
		xmlHttp.send(null);
	}
	return xmlHttp;	
};
//参数格式"yyyy-MM-dd hh:mm:ss w"
SumaJS.dateFormat = function(dateObj, format) {
	var weekDays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
	var date = {
		"M+" : dateObj.getMonth() + 1,
		"d+" : dateObj.getDate(),
		"h+" : dateObj.getHours(),
		"m+" : dateObj.getMinutes(),
		"s+" : dateObj.getSeconds(),
		"w" : weekDays[dateObj.getDay()],
		"S+" : dateObj.getMilliseconds()
	};
	if (/(y+)/i.test(format)) {
		format = format.replace(RegExp.$1, (dateObj.getFullYear() + '').substr(4 - RegExp.$1.length));
	}
	for (var k in date) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
		}
	}
	return format;
};
//时间显示
SumaJS.showDateTime = function (dateId, timeId, weekId) {
	var date = new Date();
	if (date.getFullYear() < 1971) {
		return false;
	}//时间获取错误就不显示
	if(dateId){
	//	this.$("#"+dateId).innerHTML = this.dateFormat(date, "MM") + "月" + this.dateFormat(date, "dd") + "日";
		this.$("#"+dateId).innerHTML = this.dateFormat(date, "yyyy/MM/dd");
	}
	if(timeId){
		this.$("#"+timeId).innerHTML = this.dateFormat(date, "hh:mm");
	}
	if(weekId){
		this.$("#"+weekId).innerHTML = this.dateFormat(date, "w");
	}
};
//另一种时间显示
SumaJS.showDateTime2 = function (id) {
	var date = new Date();
	if (date.getFullYear() < 1971) {
		return false;
	}//时间获取错误就不显示
	var str = "";
	str += this.dateFormat(date, "yyyy") + "年"+this.dateFormat(date, "MM") + "月" + this.dateFormat(date, "dd") + "日";
	str += "&nbsp&nbsp" + this.dateFormat(date, "w");
	str += "&nbsp&nbsp" +this.dateFormat(date, "hh:mm");
	
	this.$("#"+id).innerHTML = str;
};
SumaJS.padString = function(str,replaceChar,length){
	var str = ""+str;
	for( var i = str.length; i < length; i++) {
		str = replaceChar + str;
	}
	return str;
}
//注册按键事件
SumaJS.registerKeyEventHandler = function(name, handlerObj){
	if(!name || !handlerObj){return false;}
	this.eventHandlerManager.addKeyHandler(name, handlerObj);
};

//注册系统事件
SumaJS.registerSystemEventHandler = function(name, handlerObj){
	if(!name || !handlerObj){return false;}
	this.eventHandlerManager.addSystemHandler(name, handlerObj);
};
//移除事件
SumaJS.removeEventHandler = function(name){
	if(!name){return false;}
	this.debug("removeEventHandler " + name);
	this.eventHandlerManager.clearHandler(name);
	return true;
};


//机顶盒前面板显示
SumaJS.stbFrontPanel = {
	clear : function(){
	},
	displayDate:function(){
	},
	displayText:function(str){
		SysSetting.panelDisplayText(str);
	}	
};
/**************SumaJS基类END**************/
/************Page**********/
function Page(params) {
	this.createFunc = params.onCreate;
	this.startFunc = params.onStart;
	this.destroyFunc = function(){params.onDestroy();params=null;};
	this.timerManager = new TimerManager();
    this.otherFunc = null;//特殊需要添加
};
Page.prototype.onCreate = function () {
	this.createFunc();
};
Page.prototype.onStart = function () {
	this.startFunc();
};
Page.prototype.onDestroy = function () {
	this.timerManager.clearAll();
	this.destroyFunc();
};
/************Page end**********/

/*****************timer管理*****************/
function TimerTask(callback, time) {
	var t = window.setTimeout(callback, time);
	this.clear = function () {
		window.clearTimeout(t);
	};
};

function IntervalTask(callback, time) {
	var t = window.setInterval(callback, time);
	this.clear = function () {
		window.clearInterval(t);
	};	
}

function TimerManager() {
	this.timerPool = {};
	this.add = function (name, timerObj) {
		if (this.timerPool[name]) {
			this.timerPool[name].clear();
		}
		this.timerPool[name] = timerObj;
	};

	this.get = function (name) {
		var timer = null;
		if (this.timerPool[name]) {
			timer = this.timerPool[name];
		}
		return timer;
	};

	this.clearTimer = function (name) {
		var timer = this.get(name);
		if (timer) {
			timer.clear();
			delete this.timerPool[name];
		}
	};

	this.clearAll = function () {
		for (var i in this.timerPool) {
			this.timerPool[i].clear();
		}
		this.timerPool = {};
	};
}
/*****************timer管理 end*************/


/*****************页面事件管理******************/
function EventHandlerManager() {
	this.handlerPool = {};
	this.keyHandlerNames = [];
	this.systemHandlerNames = []

	this.addKeyHandler = function (name, handlerObj) {
        //FIXME:20151020 by jianghao 根据目前的代码来看，都是后注册的handler先处理键值，所以如果重复了要先clear掉
        this.clearHandler(name);
		if(!this.handlerPool[name]){
			if( typeof (handlerObj.handlePriority) == "undefined"){
				SumaJS.debug("registerKeyEventHandler " + name +" failed because handlePriority is needed");
				return false;
			}
			var i=0;
			for(;i<this.keyHandlerNames.length;i++){
				if(handlerObj.handlePriority >= this.getHandler(this.keyHandlerNames[i]).handlePriority){
			SumaJS.debug("registerKeyEventHandler " + name);
			this.handlerPool[name] = handlerObj;
					this.keyHandlerNames.splice(i,0,name);
					break;
				}
			}
			if(i == this.keyHandlerNames.length ){
				SumaJS.debug("registerKeyEventHandler " + name);
				this.handlerPool[name] = handlerObj;
				this.keyHandlerNames.push(name);
			}
			//SumaJS.debug("this.keyHandlerNames ="+this.keyHandlerNames);
		}
	};

	this.addSystemHandler = function (name, handlerObj) {
		if(!this.handlerPool[name]){
			if( typeof (handlerObj.handlePriority) == "undefined"){
				SumaJS.debug("registerSystemEventHandler " + name +" failed because handlePriority is needed");
				return false;
			}
			var i=0;
			for(;i<this.systemHandlerNames.length;i++){
				if(handlerObj.handlePriority >= this.getHandler(this.systemHandlerNames[i]).handlePriority){
			SumaJS.debug("registerSystemEventHandler " + name);
			this.handlerPool[name] = handlerObj;
					this.systemHandlerNames.splice(i,0,name);
					break;
				}
			}
			if(i == this.systemHandlerNames.length ){
				SumaJS.debug("registerSystemEventHandler " + name);
				this.handlerPool[name] = handlerObj;
				this.systemHandlerNames.push(name);
			}
			//SumaJS.debug("this.systemHandlerNames ="+this.systemHandlerNames);
		}
	};

	this.getHandler = function (name) {
		var handler = null;
		if (this.handlerPool[name]) {
			handler = this.handlerPool[name];
		}
		return handler;
	};

	this.getKeyHandlerNames = function(){
		var temp = [];
		/*之所以要把数组拷贝，是因为在一次按键分发处理过程中，可能会有clearHandler的动作，从而导致this.keyHandlerNames的长度发生改变，
		从而出现下标索引元素不能达到预期元素的问题*/
		for(var i = 0;i< this.keyHandlerNames.length;i++){
			temp.push(this.keyHandlerNames[i]);
		}
		return temp;
	};

	this.getSystemHandlerNames = function(){
		var temp = [];
		for(var i = 0;i< this.systemHandlerNames.length;i++){
			temp.push(this.systemHandlerNames[i]);
		}
		return temp;
	};

	this.getAll = function () {
		return this.handlerPool;
	};

	this.clearHandler = function (name) {
		delete this.handlerPool[name];
		for(var i=0;i<this.keyHandlerNames.length;i++){
			if(this.keyHandlerNames[i]==name){
				this.keyHandlerNames.splice(i,1);
				break;
			}
		}
		for(var i=0;i<this.systemHandlerNames.length;i++){
			if(this.systemHandlerNames[i]==name){
				this.systemHandlerNames.splice(i,1);
				break;
			}
		}
	};

	this.clearAllKeyHandler = function () {
		for(var i=0;i<this.keyHandlerNames.length;i++){
			delete this.handlerPool[this.keyHandlerNames[i]];
		}
		this.keyHandlerNames = [];
	};

	this.clearAllSystemHandler = function(){
		for(var i=0;i<this.systemHandlerNames.length;i++){
			delete this.handlerPool[this.systemHandlerNames[i]];
		}
		this.systemHandlerNames = [];
	};
}



//按键事件处理
document.onkeydown = function(event){//原来是onkeypress
	var keyCode = event.keyCode||event.which;
	SumaJS.debug("keyCode = " + keyCode);

	//按键处理
	if(SumaJS){
		var handlerNameArray = SumaJS.eventHandlerManager.getKeyHandlerNames();
		for(var i=0; i<handlerNameArray.length; i++){	//按键冒泡
			SumaJS.debug("event control name="+handlerNameArray[i]);
			var handlerObj = SumaJS.eventHandlerManager.getHandler(handlerNameArray[i]);
			if(handlerObj && !handlerObj.keyEventHandler(event)){   //区分按键事件和消息事件
				return false;
			}
		}
	}
};

//系统事件处理
document.onsystemevent = function(event){
	var keyCode = event.keyCode||event.which;
	SumaJS.debug("system keyCode = " + keyCode);

	//系统事件
	if(SumaJS){
		var handlerNameArray = SumaJS.eventHandlerManager.getSystemHandlerNames();
		for(var i=0; i<handlerNameArray.length; i++){	//按键冒泡
			var handlerObj = SumaJS.eventHandlerManager.getHandler(handlerNameArray[i]);
			if(handlerObj && !handlerObj.sysEventHandler(event)){  //区分按键事件和消息事件
				return false;
			}

		}
	}
};
/*****************页面事件管理 end**************/

//文字跑马灯
function displayScrollText(text, width, fontSize, fontWeight) {
	var calculateWidthId = document.createElement("div");
	calculateWidthId.style.visibility = "hidden";
	calculateWidthId.style.display = "inline";
	calculateWidthId.style.whiteSpace = "nowrap";
	calculateWidthId.innerHTML = text;
	document.body.appendChild(calculateWidthId);
	calculateWidthId.style.fontSize = fontSize + "px";
	if(fontWeight){
		calculateWidthId.style.fontWeight = fontWeight + "";
	}else{
		calculateWidthId.style.fontWeight = "normal";
	}
	if (calculateWidthId.offsetWidth > width) {
		return "<marquee style='width:" + width + "px;'>" + text + "</marquee>";
	} else {
		return text;
	}
}


