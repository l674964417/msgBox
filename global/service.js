function getEle(id){
	return document.getElementById(id);
}
function debug(str){
	getEle("debug").innerHTML += "=============="+str+"<br/>";
}
function clear(){
	getEle("debug").innerHTML = "";
}

var tipStrObj = {
	"T01": {
		name: "T01",
		priority:900,
		type: 2,
		showPage:"",
		withButton: false,
		delayTime: false,
		context:"T01 信号中断，可能是以下情况造成:</br>" +
		"1、遇到雨雪或大雾天气，天气好转后即可恢复</br>" +
		"2、卫星天线锅面积是否有积水、积雪;</br>" +
		"3、春分、秋分前后受太阳对卫星的影响，中午有时会无法收看;</br>" +
		"4、天线歪了或天线前方有遮挡物;</br>" +
		"5、天线至机顶盒的信号线损坏或接头出现松动。</br>" +
		"若检查后仍无法恢复，请与安装维修人员联系</br>"
	},
	"T02": {
		name: "T02",
		priority:2300,
		type: 0,
		showPage:"",
		withButton: 2,
		delayTime: false,
		context:"T02 当前频道暂无节目，请收看其它频道"
	},
	"T03": {
		name: "T03",
		priority: 110,
		type: 0,
		showPage:"",
		title:"",
		withButton: false,
		delayTime: 2,
		context:"T03 错误的频道号，请重新输入"
	},
	"T04": {
		name: "T04",
		priority:200,
		type: 0,
		showPage:"",
		withButton: false,
		delayTime: 2,
		context:"T04 频道有更新"
	},
	"T05":{
		name: "T05",
		priority:300,
		type: 0,
		showPage:"",
		withButton: true,
		delayTime: 5,
		context:"T05 已有频道更新，选”确认“立即自动进行搜索更新，选“返回”下次开机时自动进行搜索更新"
	},
	"T06":{
		name: "T06",
		priority:400,
		type: 0,
		showPage:"",
		title:"",
		withButton: false,
		delayTime: 2,
		context:"已有新版本软件，将自动进行升级，请勿断电，以免损坏设备"
	},
	"T07":{
		name: "T07",
		priority:500,
		type: 0,
		showPage:"",
		withButton: true,
		delayTime: 5,
		context:"已有新版本软件，选“确认”立即进行升级，选“返回”待下次开机时进行升级"
	},
	"T08":{
		name: "T08",
		priority:1100,
		type: 0,
		showPage:"",
		title:"",
		withButton: false,
		delayTime: false,
		context:"频道列表为空，请重新开机"
	},
	"T09":{
		name: "T09",
		priority:1000,
		type: 0,
		showPage:"",
		delayTime: false,
		withButton: false,
		context:"T09 地面数字电视节目信号中断，请检查线路连接或联系本地地面数字电视播出部门"
	},
	"T10": {
		name: "T10",
		priority:2300,
		type: 0,
		showPage:"",
		withButton: false,
		delayTime: false,
		context:"T10 地面数字电视当前频道暂无节目，请收看其他频道或联系本地地面数字电视播出部门"
	},
	"E102": {
		name: "E102",
		priority:2250,
		type: 0,
		showPage:"",
		title:"",
		withButton: false,
		cardIsShow:"NO",
		delayTime: false,
		context:"E102 系统错误"
	},
	"E103": {
		name: "E103",
		priority:2250,
		type: 0,
		showPage:"",
		withButton: false,
		delayTime: false,
		context:"E103 系统错误"
	},
	"E104":{
		name: "E03",
		priority:2250,
		type: 0,
		showPage:"",
		title:"",
		withButton: false,
		delayTime: false,
		context:"E104 节目解密失败"
	},
	"E105": {
		name: "E04",
		priority:2250,
		type:0,
		showPage:"",
		withButton: false,
		delayTime: false,
		context:"E105 节目解密失败"
	},
	"E109": {
		name: "E05",
		priority:2250,
		type:0,
		showPage:"",
		withButton: false,
		delayTime: false,
		context:"E109 观看级别不够"
	},
	"E125":{
		name: "E06",
		priority:2250,
		type: 0,
		showPage:"",
		title:"",
		withButton: false,
		delayTime: false,
		context:"E125 授权丢失，请保持开机并耐心等待，或进入999频道并按照提示进行操作"
	},
	"E126": {
		name: "E126",
		priority:2250,
		type: 0,
		showPage:"",
		withButton: false,
		delayTime: false,
		context:"E126 对不起，综合接收解码器未授权，请与安装维修人员或客服中心联系 Tel:4006008640"
	},
	"E137": {
		name: "E137",
		priority:2250,
		type: 1,
		showPage:"",
		title:"",
		withButton: false,
		delayTime: false,
		context:"E137 位置信息改变，请与安装维修人员或客服中心联系 Tel:4006008640"
	},
	"E138": {
		name: "E138",
		priority:2250,
		type: 1,
		showPage:"",
		withButton: false,
		delayTime: false,
		context:"无位置信息，请与安装维修人员或客服中心联系 Tel:4006008640"
	},
	"E139":{
		name: "E139",
		priority:2250,
		type: 1,
		showPage:"",
		withButton: false,
		delayTime: false,
		context:"E139 位置信息改变，请与安装维修人员或客服中心联系 Tel:4006008640"
	},
	"E140": {
		name: "E140",
		priority:2250,
		type: 1,
		showPage:"",
		title:"",
		withButton: false,
		delayTime: false,
		context:"无位置信息，请与安装维修人员或客服中心联系 Tel:4006008640"
	},
	"E142": {
		name: "E142",
		priority:2250,
		type: 1,
		showPage:"",
		withButton: false,
		delayTime: 2,
		context:"E142 综合接收解码器处于移机状态，将自动重启进行安装流程！"
	},
	"E146": {
		name: "E146",
		priority:2250,
		type: 0,
		showPage:"",
		withButton: false,
		delayTime: false,
		context:"E146 系统错误"
	},
	"E147": {
		name: "E147",
		priority:2250,
		type: 0,
		showPage:"",
		withButton: false,
		delayTime: false,
		context:"E147 位置锁定模块错误"
	},
	"E148": {
		name: "E148",
		priority:2250,
		type: 0,
		showPage:"",
		title:"",
		withButton: false,
		delayTime: false,
		context:"E148 系统错误"
	}

};







