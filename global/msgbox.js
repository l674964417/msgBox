/***
 osd弹框显示操作:
 	type:  类型
		 0——普通的，显示在视频窗口的中心位置
		 1——特殊的，显示在视频窗口的右上角
		 2——特殊的，表示为T01(小时效果与其他差异较大，单独处理)
	 delayTime: 是否延迟后自动隐藏
		 为数字时，delayTime秒后自动关闭
		 为false时，不会自动关闭
 	delayFunc: 延时结束后关闭该提示框时需要执行的函数
 */

var osdMsgBox = (function(){
	function Constructor() {
		var self = this;
		this.handlePriority = 1;
		var hashBox = [],
			domContainer = document.getElementById("msg_container"),
			domText = document.getElementById("msg_main_context"),
			domBtn = document.getElementById("msg_btn"),
			domOKBtn = document.getElementById("msg_btn_ok"),
			domCancelBtn = document.getElementById("msg_btn_cancel");
		this.create = function (cfg) {
			if (!cfg || !cfg.name) {
				return false;
			}
			for (var i = 0, len = hashBox.length; i < len; i++) {
				if (hashBox[i].name == cfg.name) {
					return false;
				}
			}
			var box = initBox(cfg);
			sortByPriority(box);
			if (hashBox[0]) {
				this.show(hashBox[0].name);
			}
		};
		var initBox = function (cfg) {  //初始化box对象
			var box = {};
			var tipObj = tipStrObj[cfg.name];
			box.name = tipObj.name;
			box.context = cfg.context ? cfg.context : (tipObj.context ? tipObj.context : " ");
			box.priority = cfg.priority ? cfg.priority : (tipObj.priority ? tipObj.priority : 0);
			box.delayTime = cfg.delayTime ? cfg.delayTime : (tipObj.delayTime ? tipObj.delayTime : false);
			box.type = cfg.type ? cfg.type : (tipObj.type ? tipObj.type : 0);
			box.withButton = cfg.withButton ? cfg.withButton : (tipObj.withButton ? tipObj.withButton : false);
			box.okFn = cfg.okFn ? cfg.okFn : function(){};  //确定键执行
			box.cancelFn = cfg.cancelFn ? cfg.cancelFn : function(){self.close(box.name);};  //取消键执行
			box.delayFunc = cfg.delayFunc ? cfg.delayFunc : function(){ };
			//box.showPage = SumaJS.currModuleName ? SumaJS.currModuleName : "";
			box.showPage = "home_page" ? "home_page" : "";
			return box;
		};
		var sortByPriority = function (box) {
			if (hashBox.length >= 1) {
				var i = 0, len = hashBox.length;
				for (; i < len; i++) {
					if (box.priority > hashBox[i].priority) {
						hashBox.splice(i, 0, box);
						break;
					}
				}
				if (i === hashBox.length) {
					hashBox.push(box);
				}
			} else {
				hashBox.push(box);
			}
		};
		this.refreshByPage = function (page) {
			for (var i = 0, len = hashBox.length; i < len; i++) {
				hashBox[i].showPage = page;
			}
			if (hashBox[0]) {
				this.show(hashBox[0].name);
			}
		};
		this.get = function (name) {
			if (!name) {
				return null;
			}
			var temp = hashBox.concat(hashBox);
			for (var i = 0, len = temp.length; i < len; i++) {
				if (temp[i].name === name) {
					return temp[i];
				}
			}
			return null;
		};
		var dealDelay = function (box) {   //用来处理delay功能
			var delayTime = box.delayTime;
			if (delayTime) {
				setTimeout(function () {
					self.close(box.name);
					box.delayFunc();
				}, delayTime * 1000);
			}
		};
		var showButton = function (name, str) {  //判断是否显示按键 显示特殊的T05、T07 ，有按键
			if (name == "T05" || name == "T07") {
				domBtn.style.diaplay = "block";
				domBtn.className = "msg_btn_" + str;
				domOKBtn.className = "msg_btn_ok_" + str;
				domCancelBtn.className = "msg_btn_cancel_" + str;
				self.getFocus();
			} else {
				domBtn.style.display = "none";
			}
		};

		//T01提示框控制
		var domT01Obj = (function(){
			function Constructor(){
				var domT01Home = SumaJS.$("#msgT01_home_container"),
					domT01Epg = SumaJS.$("#msgT01_epg_container"),
					domT01Play = SumaJS.$("#msgT01_playtv_container"),
					domT01HomeText = SumaJS.$("#msgT01_home_context"),
					domT01EpgText = SumaJS.$("#msgT01_epg_context"),
					domT01PlayText = SumaJS.$("#msgT01_playtv_context");
				var hideAll = function(){
					domT01Home.style.display = "none";
					domT01Epg.style.display = "none";
					domT01Play.style.display = "none";
				};
				this.showByPage = function(page, context){
					switch(page){
						case "home_page":
						case "tv_page":
						case "favor_page":
							domT01Home.style.display = "block";
							domT01Epg.style.display = "none";
							domT01Play.style.display = "none";
							domT01HomeText.innerHTML = context;
							break;
						case "epg_page":
							domT01Home.style.display = "none";
							domT01Epg.style.display = "block";
							domT01Play.style.display = "none";
							domT01EpgText.innerHTML = context;
							break;
						case "playtv_page":
							domT01Home.style.display = "none";
							domT01Epg.style.display = "none";
							domT01Play.style.display = "block";
							domT01PlayText.innerHTML = context;
							break;
						default:
							hideAll();
							break;
					}
				};
				this.show = function(name){   //显示T01
					var temp = self.get(name);
					var page = temp.showPage;
					this.showByPage(page,  temp.context);
				};
				this.hide = function(){   //隐藏T01
					hideAll();
				};
			}
			return new Constructor();
		}());

		//右上角的提示框控制
		var domRightObj = (function(){
			function Constructor(){
				var domRightContainer = document.getElementById("msg_rightUp_container"),
					domRightText = document.getElementById("msg_rightUp_context");
				this.show = function(name){
					var temp = self.get(name);
					domRightText.innerHTML = temp.context;
					var page = temp.showPage;
					switch (page) {
						case "home_page":
						case "tv_page":
						case "favor_page":
						case "epg_page":
						case "playtv_page":
							domRightContainer.style.display = "block";
							var str = page.split("_")[0];
							domRightContainer.className = "msg_rightUp_container_" + str;
							domRightText.className = "msg_rightUp_context_" + str;
							break;
						default:
							domRightContainer.style.display = "none";
							break;
					}
				};
				this.hide = function(){
					domRightContainer.style.display = "none";
				};
			}
			return new Constructor();
		}());

		//普通的提示框控制
		var domCommonObj =  (function(){
			function Constructor(){
				this.show = function(name){
					var temp = self.get(name);
					domText.innerHTML = temp.context;
					var page = temp.showPage;
					switch (page) {
						case "home_page":
						case "tv_page":
						case "favor_page":
						case "epg_page":
						case "playtv_page":
							domContainer.style.display = "block";
							var str = page.split("_")[0];
							domContainer.className = "msg_container_" + str;
							domText.className = "msg_main_context_" + str;
							showButton(name, str);
							break;
						default:
							domContainer.style.display = "none";
							break;
					}
				};
				this.hide = function(){
					domContainer.style.display = "none";
				};
			}
			return new Constructor();
		}());


		this.show = function (name) {  //显示弹框  将T01和有弹框的那两个分开 T05, T07
			var temp = this.get(name);
			hideAllType();
			var type = temp.type;
			switch(type){
				case 0:
					domCommonObj.show(name);
					break;
				case 1:
					domRightObj.show(name);
					break;
				case 2:
					domT01Obj.show(name);
					break;
				default:
					break;
			}
			dealDelay(temp);
			return;
		};

		//隐藏这三种类型的提示框
		var hideAllType = function(){
			domT01Obj.hide();
			domRightObj.hide();
			domCommonObj.hide();
		};

		this.close = function (name) {
			if (!name) {return false;}
			if(name == "T05" || name == "T07"){
				this.loseFocus();
			}
			var temp = this.get(name);
			if (!temp) {return false;}
			for (var i = 0, len = hashBox.length; i < len; i++) {
				if (hashBox[i].name == name) {
					hashBox.splice(i, 1);
					if (i == 0) {  //如果关闭的是正在显示的那个
						if (hashBox.length > 0) {
							this.show(hashBox[0].name);
						} else {
							hideAllType();
						}
					}
					return ;
				}
			}
		};
		this.closeAll = function () {

		};
		var getNowBox = function(){  //得到当前正在显示的box
			if(hashBox[0]){
				return hashBox[0];
			}else{
				return null;
			}
		};
		this.keyEventHandler = function(event){
			var keyCode = event.keyCode||event.which;
			var temp = getNowBox();
			if(!temp){return false;}
			switch(keyCode){
				case KEY_ENTER:
					temp.okFn();
					self.close(temp.name);
					return false;
				case KEY_EXIT:
				case KEY_BACK:
					temp.cancelFn();
					return false;
				default:
					return false;
			}
		};
		this.getFocus = function(){
			document.onkeydown = this.keyEventHandler;
		};
		this.loseFocus = function(){
			SumaJS.removeEventHandler("osdMsgBoxKeyEventHandler");
			document.onkeydown = keyEventHandler;
		};
	};
	return new Constructor();
}());


