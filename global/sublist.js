/*************************************************************************
 *********************列表数据接口介绍*****************
 **传入参数介绍**
 *items:						列表数据源,数组类型 (*必填)
 *type:							列表切换方式：1-翻页,2(默认)-焦点处于最前(最后)延时弹出前(后)一项,3-焦点处于最前(最后)马上弹出前(后)一项,4-焦点保持在列表中间
 *pageSize:						列表页面显示个数 (*必填)
 *uiObj:						列表UI元素 (*必填)
 *delayTime:					移动延时时间(默认600),单位毫秒,仅当type为2时有效
 * index:                       指定焦点在初始时放在 数据items[index] 上
 *********************************************
 ***方法介绍***
 **自定义**
 *showData:						推送当前页面数据(subItems, uiObj, lastFocusPos, focusPos, isUpdate) (*必填)
 *onSelect:						推送当前被选元素(item,index)
 *onFocusLeaveSubList           当sublist对象调用focusLeaveSubList时，调用此回调函数(subItems, uiObj, focusPos）
 **已定义**
 *select						选中元素,会调用自定义方法onSelect
 *setType:						设置列表切换方式
 *getItems:						获取列表数据源
 *getItem:						获取当前列表焦点选中数据元素
 *getSubItems:					获取当前页数据
 *getStartIndex:				获取当前列表页面起始索引
 *getFocusPos:					获取焦点所在列表位置
 *getIndex:						获取焦点对应的索引
 *getPageIndex:					获得当前页码(当type=1时返回值准确)
 *setFocusPos:					设置焦点位置
 *setIndex:						设置列表焦点索引
 *up,down,pageUp,pageDown:		对列表进行向上、向下、向上翻页、向下翻页操作
 *upDate:						更新页面显示内容
 *resetData:					更新列表数据,创建一个列表后只有调用该方法数据才能正常显示(传入参数可为空)
 *refresh:						重新获取当前页数据
 *setDelayTime:					设置移动延时时间单位毫秒,仅当type为2时有效
 *isFocusAtLastItem             判断焦点是否在最后一个item上
 *isFocusAtLastItemOfCurrentPage 判断焦点是否在当前页的最后一个item上，只有type=1有效，其他类型均返回值总为false
 *********************************************
 **内部属性**
 *isUpdate:						当前页面数据是否也更新(1-有更新,0-无更新)
 *maxStartIndex:				列表最大可能的起始索引
 *maxFocusPos:					页面最大可能的焦点位置
 *lastStartIndex:				先前起始索引
 *lastFocusPos:					先前焦点位置
 **************************************************************************/
function SubList(cfg){
	this.items = typeof cfg.items != "undefined" ? cfg.items : [];	
	this.type = typeof cfg.type != "undefined" ? cfg.type : 2;
	this.pageSize = typeof cfg.pageSize != "undefined" ? cfg.pageSize : this.items.length;
	this.uiObj = typeof cfg.uiObj != "undefined" ? cfg.uiObj : null;		
	this.delayTime = typeof cfg.delayTime != "undefined" ? cfg.delayTime : 600;
	this.delayTimer = -1;
	this.isUpdate = true;
	this.lastStartIndex = 0;
	this.index = typeof cfg.index != "undefined" ? cfg.index : 0;
	this.startIndex = 0;	
	this.focusPos = 0;
	this.lastFocusPos = -1;
	this.subItems = [];
	this.maxStartIndex = 0;
	this.maxFocusPos = 0;
	
	this.showData = typeof cfg.showData != "undefined" ? cfg.showData 
						: function(){};
    this.onFocusLeaveSubList = typeof cfg.onFocusLeaveSubList != "undefined" ? cfg.onFocusLeaveSubList
        : function(){};
	
	this.setType = function(type){
		 this.type = type;
		 switch(type){
			case 1:
				this.maxStartIndex = Math.floor(this.items.length / this.pageSize) * this.pageSize;	
				this.maxStartIndex = this.items.length % this.pageSize == 0 ? this.maxStartIndex - this.pageSize : this.maxStartIndex;	
			 	break;
			case 2:
			case 3:
				this.maxStartIndex = this.items.length - this.pageSize > 0 ? this.items.length - this.pageSize : 0;
				break;
			default:
				break;	
		 }
		 this.maxFocusPos = Math.min(this.pageSize, this.items.length) - 1;
	};
	
	this.onSelect = typeof cfg.onSelect != "undefined" ? cfg.onSelect : function(item){};

	this.getItems = function(){
		return this.items;
	};
	
	this.getItem = function(){
		return this.items[this.index];
	};

	this.getSubItems = function(){
		return this.subItems;
	};
	
	this.getStartIndex = function(){
		return this.startIndex;
	};
	
	this.getFocusPos = function(){
		return this.focusPos;
	};
	
	this.setFocusPos = function(focusPos){
		focusPos = focusPos < 0 ? 0 : focusPos;
		focusPos = focusPos > this.maxFocusPos ? this.maxFocusPos : focusPos;		
		this.focusPos = focusPos;
		this.upDate();	
	};	
	
	this.getIndex = function(){
		return this.index;
	};
	this.getPageIndex = function(){
		return Math.floor(this.index/this.pageSize)+1;
	};
    this.isFocusAtLastItem = function(){
        return this.getIndex() == (this.items.length - 1);
    };

    this.isFocusAtLastItemOfCurrentPage = function(){
        if(this.type != 1){
            return false;
        }
        if(this.isFocusAtLastItem()){
            return true;
        }else if(this.getIndex() == 0){
            return false;
        }else if( (this.getIndex()+1) % this.pageSize == 0){
            return true;
        }else{
            return false;
        }
    };
	
	this.setIndex = function(index){
		if(index < 0 || index >= this.items.length){this.index = 0;}
		this.index = index;
		switch(this.type){
			case 1:
				this.startIndex = Math.floor(this.index / this.pageSize) * this.pageSize;
				this.startIndex = this.startIndex > this.maxStartIndex ? this.maxStartIndex : this.startIndex;
				this.focusPos = this.index - this.startIndex;
				break;
			case 2:
			case 3:
				if(this.index <= this.maxStartIndex){
					if(this.index < this.startIndex){
					this.startIndex = this.index;
					} else if(this.index - this.startIndex >=this.pageSize){
						this.startIndex = this.index-this.pageSize+1;
					}
					this.focusPos = this.index - this.startIndex;
				}else{
					this.startIndex = this.maxStartIndex;
					this.focusPos = this.index - this.maxStartIndex;		
				}		
				/*if(this.startIndex > 0 && this.focusPos == 0){
					this.startIndex--;
					this.focusPos++;
				}else if(this.focusPos == this.maxFocusPos && this.startIndex < this.maxStartIndex){
					this.focusPos--;
					this.startIndex++;				
				}*/		
				break;
			case 4:
				this.focusPos = Math.floor(this.pageSize/2);
				this.startIndex = this.index - this.focusPos;
				this.startIndex = this.startIndex < 0 ? this.items.length + this.startIndex : this.startIndex;
				break;
			case 5:
				//this.focusPos = Math.floor(this.pageSize/2);
				//this.startIndex = this.index - 5;
				//this.startIndex = this.startIndex < 0 ? this.items.length + this.startIndex : this.startIndex;

				this.focusPos = Math.floor(this.maxFocusPos/2);
				this.startIndex = this.index - this.focusPos;
				//this.startIndex = this.index - 5;
				this.startIndex = this.startIndex < 0 ? this.items.length + this.startIndex : this.startIndex;

				break;
			default:
				break;
		}
	};	
	
	this.setDelayTime = function(delayTime){
		this.delayTime = delayTime;
	};
	
	this.up = function(){
		switch(this.type){
			case 1:
				this.focusPos--;
				if(this.focusPos == -1){
					if(this.startIndex == 0){
						this.startIndex = this.maxStartIndex;
						this.focusPos = this.items.length - this.maxStartIndex - 1;
					}else{
						this.startIndex -= this.pageSize;
						this.focusPos = this.pageSize - 1;
					}
				}
				break;
			case 2:
				this.focusPos--;
				if(this.focusPos == -1){
					if(this.startIndex == 0){
						this.startIndex = this.maxStartIndex;
						this.focusPos = this.maxFocusPos;
					}else{
						this.startIndex--;
						this.focusPos = 0;
					}
				}
				clearTimeout(this.delayTimer);
				if(this.focusPos == 0 && this.startIndex > 0){
					var self = this;
					self.delayTimer = setTimeout(
						function(){
							if(self.focusPos == self.maxFocusPos || self.startIndex == 0){
								return;
							}					
							self.focusPos++;
							self.startIndex--;
							self.upDate();
						},
						self.delayTime
					);
				}							
				break;
			case 3:
				this.focusPos--;
				if(this.focusPos == -1){
					if(this.startIndex == 0){
						this.startIndex = this.maxStartIndex;
						this.focusPos = this.maxFocusPos;
					}else{
						this.startIndex--;
						this.focusPos = 0;
					}
				}
				if(this.focusPos == 0 && this.startIndex > 0){				
					this.focusPos++;
					this.startIndex--;
				}					
				break;
			case 4:
				this.startIndex--;
				this.startIndex = this.startIndex < 0 ? this.items.length + this.startIndex : this.startIndex;
				break;
				break;
			case 5:
				/*if(this.focusPos == 4){
					this.startIndex--;							
					this.startIndex = this.startIndex < 0 ? this.items.length + this.startIndex : this.startIndex;
				}else{
					this.focusPos--;								
				}*/
				if(this.focusPos == (Math.floor(this.maxFocusPos/2)-1)){
					this.startIndex--;
					this.startIndex = this.startIndex < 0 ? this.items.length + this.startIndex : this.startIndex;
				}else{
					this.focusPos--;
				}
				break;	
			default:
				break;
		}
		this.upDate();
	};
	
	this.down = function(){
		switch(this.type){
			case 1:
				this.focusPos++;
				if(this.focusPos == this.maxFocusPos+1){
					if(this.startIndex == this.maxStartIndex){
						this.startIndex = 0;
						this.focusPos = 0;
					}else{
						this.startIndex += this.pageSize;
						this.focusPos = 0;
					}
				}else if(this.startIndex == this.maxStartIndex && this.focusPos == this.items.length%this.pageSize){
					this.startIndex = 0;
					this.focusPos = 0;					
				}
				break;
			case 2:
				this.focusPos++;
				if(this.focusPos == this.maxFocusPos+1){
					if(this.startIndex == this.maxStartIndex){
						this.startIndex = 0;
						this.focusPos = 0;
					}else{
						this.startIndex++;
						this.focusPos = this.maxFocusPos;
					}
				}
				clearTimeout(this.delayTimer);
				if(this.focusPos == this.maxFocusPos && this.startIndex < this.maxStartIndex){
					var self = this;
					self.delayTimer = setTimeout(
						function(){
							if(self.focusPos == 0 || self.startIndex == self.maxStartIndex){
								return;
							}
							self.focusPos--;
							self.startIndex++;
							self.upDate();
						},
						self.delayTime
					);
				}			
				break;
			case 3:
				this.focusPos++;
				if(this.focusPos == this.maxFocusPos+1){
					if(this.startIndex == this.maxStartIndex){
						this.startIndex = 0;
						this.focusPos = 0;
					}else{
						this.startIndex++;
						this.focusPos = this.maxFocusPos;
					}
				}
				if(this.focusPos == this.maxFocusPos && this.startIndex < this.maxStartIndex){
					this.focusPos--;
					this.startIndex++;
				}			
				break;
			case 4:
				this.startIndex++;
				this.startIndex = this.startIndex >= this.items.length ? this.startIndex - this.items.length : this.startIndex;
				break;
			case 5:				
				/*if(this.focusPos == 6){
					this.startIndex++;
				this.startIndex = this.startIndex >= this.items.length ? this.startIndex - this.items.length : this.startIndex;
				}else{
					this.focusPos++;										
				}	*/
				if(this.focusPos == (Math.floor(this.maxFocusPos/2)+1)){
					this.startIndex++;
				this.startIndex = this.startIndex >= this.items.length ? this.startIndex - this.items.length : this.startIndex;
				}else{
					this.focusPos++;
				}
				break;
			default:
				break;
		}
		this.upDate();		
	};
	
	this.pageUp = function(){
		this.startIndex -= this.pageSize;
		if(this.type <= 3){
		if(this.startIndex == -this.pageSize){
			this.startIndex = this.maxStartIndex;
			if(this.type == 1){
				var temp = this.items.length - this.maxStartIndex - 1;
				this.focusPos = this.focusPos > temp ? temp : this.focusPos;
			}else{
				this.focusPos = this.focusPos == 0 ? 1 : this.focusPos;
			}
		}else if(this.startIndex < 0 && this.type != 1){
			this.startIndex = 0;
		}else if((this.startIndex == this.maxStartIndex - this.pageSize) && this.focusPos == this.maxFocusPos && this.type != 1){
			this.focusPos = this.maxFocusPos - 1;
		}
		}else if(this.type == 4){
			this.startIndex = this.startIndex < 0 ? this.items.length + this.startIndex : this.startIndex;
		}
		else if(this.type == 5){
			this.startIndex = this.startIndex < 0 ? this.items.length + this.startIndex : this.startIndex;
		}
		this.upDate();
	};
	
	this.pageDown = function(){
		this.startIndex += this.pageSize;
		if(this.type <= 3){
		if(this.startIndex == this.maxStartIndex && this.type == 1){
			var temp = this.items.length - this.maxStartIndex - 1;
			this.focusPos = this.focusPos > temp ? temp : this.focusPos;			
		}
		if(this.startIndex == this.maxStartIndex + this.pageSize){
			this.startIndex = 0;
			if(this.type == 1){
				var temp = this.items.length - this.maxStartIndex - 1;
				this.focusPos = this.focusPos > temp ? temp : this.focusPos;
			}else{
				this.focusPos = this.focusPos == this.maxFocusPos ? this.maxFocusPos-1 : this.focusPos;
			}			
		}else if(this.startIndex > this.maxStartIndex && this.type != 1){
			this.startIndex = this.maxStartIndex;
		}else if(this.startIndex == this.pageSize && this.type != 1){
			this.focusPos = 1;
		}
		}else if(this.type == 4){
			this.startIndex = this.startIndex >= this.items.length ? this.startIndex - this.items.length : this.startIndex;
		}
		else if(this.type == 5){
			this.startIndex = this.startIndex >= this.items.length ? this.startIndex - this.items.length : this.startIndex;
		}
		this.upDate();		
	};
	
	this.upDate = function(){
		this.subItems = this.items.slice(this.startIndex, this.startIndex+this.pageSize);
		if(this.subItems.length<this.pageSize && this.type == 4){
			var temp = this.items.slice(0, this.pageSize-this.subItems.length);
			this.subItems = this.subItems.concat(temp);
		}
		if(this.subItems.length<this.pageSize && this.type == 5){						
			var temp = this.items.slice(0, this.pageSize-this.subItems.length);
			this.subItems = this.subItems.concat(temp);
		}
		if(!this.isUpdate){
			this.isUpdate = this.lastStartIndex == this.startIndex ? false : true;
		}
		this.lastStartIndex = this.startIndex;
		this.index = this.startIndex + this.focusPos;
		this.index = this.index >= this.items.length ? this.index - this.items.length : this.index;
		if(this.startIndex == -1 || this.items.length == 0){this.focusPos = -1; this.index = -1; this.subItems = null;}
		this.showData(this.subItems, this.uiObj, this.lastFocusPos, this.focusPos, this.isUpdate);
		this.lastFocusPos = this.focusPos;
		this.isUpdate = false;
	};

    this.focusLeaveSubList = function(){
        this.onFocusLeaveSubList(this.subItems, this.uiObj, this.focusPos);
    };
	
	this.select = function(){
		this.onSelect(this.items[this.index],this.index);
	};
	
	this.resetData = function(cfg){
		if(cfg){
			this.items = typeof cfg.items != "undefined" ? cfg.items : this.items;
			this.index = typeof cfg.index != "undefined" ? cfg.index : this.index;
			this.delayTime = typeof cfg.delayTime != "undefined" ? cfg.delayTime : this.delayTime;
		}

		this.setType(this.type);	
		this.isUpdate = true;
		this.setIndex(this.index);
		this.upDate();
	};
	
	this.refresh = function(){
		this.isUpdate = true;
		this.upDate();
	};
}