


var groupListObj = new function(){ //分组列表对象
	var self = this;
	var cfg = {
		items:[],
		type: 2,
		pageSize: 30,
		uiObj: {
			nameArray: SumaJS.$("#bg li")
		},
		showData: function(subItems, uiObj, lastFocusPos, focusPos, isUpdate){
			if (!subItems) {
				for (var i = 0; i < uiObj.nameArray.length; ++i) {
					uiObj.nameArray[i].innerHTML = "";
				}
			} else {
				if(isUpdate){

				}
				else if(lastFocusPos > -1){
					self.lostStyle(lastFocusPos);
				}
				if(focusPos > -1){
					self.setStyleOnFocus(focusPos);
				}
			}
		},
		onSelect:function(item){

		}
	};
	this.listObj = new SubList(cfg);
	this.initial = function(){
		SumaJS.debug("groupListObj initial entered");
		var len = this.listObj.uiObj.nameArray.length;
		var dataArr = [];
		for(var i=0;i<len;i++){
			dataArr.push({});
		}
		this.listObj.resetData({index:0, items:dataArr});
	};
	this.setStyleOnFocus = function(pos){  //获焦时样式设置
		self.listObj.uiObj.nameArray[pos].style.border = "5px solid red";
	};
	this.lostStyle = function(pos){  //失焦时的样式变化
		self.listObj.uiObj.nameArray[pos].style.border="";
	};
};
groupListObj.initial();

	
function keyEventHandler(event) {
		var key = event.which;
		console.log(key);
		switch (key) {
			case KEY_UP:
				groupListObj.listObj.up();
				break;
			case KEY_DOWN:
				groupListObj.listObj.down();
				break;
			case KEY_BACK:
				window.location = "192.166.65.165";
				break;
			case KEY_YELLOW:
				window.location.reload();
				break;
			case KEY_ENTER:
				enterDeal();
				break;
			case 32:  //空格键
				osdMsgBox.refreshByPage("home_page");
				break;
			case 188: // "<"按键
				osdMsgBox.refreshByPage("epg_page");
				break;
			case 190:  // ">"按键
			 	osdMsgBox.refreshByPage("playtv_page");
				break;
			default:
			  return true;
		}
		return false;
	}
	
document.onkeydown = keyEventHandler;
function enterDeal(){
	var index = groupListObj.listObj.getIndex();
	switch(index){
		case 0:
			osdMsgBox.create({name: "T02"});
			return false;
		case 1:
			osdMsgBox.close("T02");
			return false;
		case 2:
			osdMsgBox.create({name: "T03"});
			return false;
		case 3:
			osdMsgBox.close("T03");
			return false;
		case 4:
			osdMsgBox.create({name: "T01"});
			return false;
		case 5:
			osdMsgBox.close("T01");
			return false;
		case 6:
			var cfg = {
				name: "T05",
				okFn: function(){
					alert("ok enter");
				},
				delayFunc: function(){
					alert("延时关闭后执行");
				}
			};
			osdMsgBox.create(cfg);
			return false;
		case 7:
			osdMsgBox.close("T05");
			return false;
        case 8:
            osdMsgBox.create({name: "E137"});
            return false;
        case 9:
            osdMsgBox.close("E137");
            return false;
		default:
			return false;
	}
}

