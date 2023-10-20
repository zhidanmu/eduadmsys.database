function $(id){
	return document.getElementById(id);
}

let backendUrl="http://localhost:8888/";

//传输sql到后端并获得执行结果
async function execSQL(sql,url=backendUrl){
	sql=encodeURI(sql);
	console.log(sql);
	let response = await fetch(url+"?sql="+sql);
	let data = await response.json();
	return data;
}


//表格相关数据
const tables={
	names:[],//记录所有表表名
	columns:{},//记录所有表列信息
	//清除表名和列信息
	clear:function(){
		tables.names=[];
		tables.columns={};
	},
	//初始化
	init:async function(){
		tables.clear();
		await tables.getNames();
		await tables.getColumns();
		console.log(tables.names);
		console.log(tables.columns);
	},
	//获取表名
	getNames:async function(){
		let data=await execSQL('SHOW TABLES;');
		for(let t in data){
			for(let i in data[t]){
				tables.names.push(data[t][i]);
			}
		}
	},
	//根据表名获取列信息
	getColumns:async function(){
		for(let i in tables.names){
			let tname=tables.names[i];
			let res=await execSQL("SHOW columns FROM "+tname+";");	
			tables.columns[tname]=res;
		}
	}
}

//左侧表格选择界面
const tableview={
	elem:$("tableview"),
	items:[],
	//生成表格项
	tableitem:function(tname){
		let dv=document.createElement('div');
		dv.innerHTML=tname;
		dv.classList.add("tablesitem");
				
		dv.ondblclick=async function(){
			tableview.items.forEach((it)=>{
				it.style.color="black";
				it.style.borderColor="black";
			});
			dv.style.color="orange";
			dv.style.borderColor="orange";
			let data=await execSQL("SELECT * FROM "+tname+";");
			//console.log(data);
			
			revert.set(dv.onclick);
			assist.clear();
			assist.nowtable=tname;
			
			resultview.show.table(data,'true');
			
		}
		tableview.elem.appendChild(dv);
	},
	//获取所有表格项
	getTablesItems:function(){
		tableview.items=tableview.elem.querySelectorAll(".tablesitem");
	},
	//初始化
	init:async function(){
		await tables.init();
		let names=tables.names;
		let tableitem=tableview.tableitem;
		tableview.elem.innerHTML="";
		for(let i in names){
			tableitem(names[i]);
		}
		tableview.getTablesItems();
	}
}

tableview.init();

//结果显示页面
const resultview={
	elem:$("resultview"),
	clear:function(){
		resultview.elem.innerHTML=""
	},
	//展示结果
	show:{
		//展示表格
		table:function(data,editable='false'){
			sqlview.clear();
			resultview.clear();
			let table=document.createElement('table');
			table.border='1';
			
			table.setAttribute('contenteditable',editable);
			table.style.textAlign="center";
			
			if(data[0]){
				let ky=Object.keys(data[0]);
				let thd=document.createElement('thead');
				let trd=document.createElement('tr');
				thd.appendChild(trd);
				assist.column=[];
				for(let k in ky){
					let th=document.createElement('th');
					th.innerHTML=ky[k];
					trd.appendChild(th);
					
					assist.column.push(ky[k]);
					
				}
				if(editable=='true'){
					let th=document.createElement('th');
					th.innerHTML="OPERATION";
					trd.appendChild(th);
				}
				thd.setAttribute('contenteditable','false');
				table.appendChild(thd);
				
				let tb=document.createElement('tbody');
				for(let i in data){
					let tr=document.createElement('tr');
					let col=data[i];
					
					tr.dataset.predata=JSON.stringify(col);
					
					for(let j in col){
						let td=document.createElement('td');
						td.dataset.column=j;
						td.innerHTML=col[j];
						tr.appendChild(td);
					}
					
					
					if(editable=='true'){
						let td=document.createElement('td');
						//更新功能添加begin
						let ubt=document.createElement('button');
						ubt.classList.add('opbtn');
						ubt.innerHTML="UPDATE";
						ubt.style.color='green';
						ubt.onclick=function(){
							let appendsql="UPDATE "+assist.nowtable;
							appendsql+=" SET ";
							
							let rowdata=resultview.getRow(tr)
							let tmp=[];
							for(let k in rowdata){
								tmp.push("`"+k+"`='"+rowdata[k]+"'");
							}
							appendsql+=tmp.join(',');
							
							appendsql+=" WHERE ";
							let predata=JSON.parse(tr.dataset.predata);
							assist.removeNull(predata);
							let temp=[];
							for(let k in predata){
								temp.push("`"+k+"`='"+predata[k]+"'");
							}
							appendsql+=temp.join(' AND ');
							appendsql+=";";
							sqlview.append(appendsql);
							tr.dataset.predata=JSON.stringify(rowdata);
							tr.style.color="green";
						};
						td.appendChild(ubt);
						//更新功能添加end
						
						
						//删除功能添加begin
						let dbt=document.createElement('button');
						dbt.classList.add('opbtn');
						dbt.innerHTML="DELETE";
						dbt.style.color='red';
						dbt.onclick=function(){
							let appendsql="DELETE FROM "+assist.nowtable+" WHERE ";
							let predata=JSON.parse(tr.dataset.predata);
							assist.removeNull(predata);
							let temp=[];
							for(let k in predata){
								temp.push("`"+k+"`='"+predata[k]+"'");
							}
							appendsql+=temp.join(' AND ');
							appendsql+=";";
							sqlview.append(appendsql);
							tb.removeChild(tr);
						};
						td.appendChild(dbt);
						//删除功能添加end
						
						td.setAttribute('contenteditable','false');
						tr.appendChild(td);
					}
					
					tb.appendChild(tr);
				}
				table.appendChild(tb);
			}else if(JSON.stringify(assist.column)!='[]'){
				let ky=assist.column;
				let thd=document.createElement('thead');
				let trd=document.createElement('tr');
				thd.appendChild(trd);
				for(let k in ky){
					let th=document.createElement('th');
					th.innerHTML=ky[k];
					trd.appendChild(th);
				}
				if(editable=='true'){
					let th=document.createElement('th');
					th.innerHTML="OPERATION";
					trd.appendChild(th);
				}
				thd.setAttribute('contenteditable','false');
				table.appendChild(thd);
				
				let tb=document.createElement('tbody');
				table.appendChild(tb);
			}
			resultview.elem.appendChild(table);
		},
		//展示json对象
		str:function(obj){
			resultview.clear();
			let ct="";
			for(let k in obj){
				ct+=k+":"+obj[k];
				ct+="<br><br>";
			}
			resultview.elem.innerHTML=ct;
		},
		//自动判断
		auto:function(data,editable='false'){
			if(Array.isArray(data)){
				resultview.show.table(data,editable);
			}else{
				resultview.show.str(data);
			}
		}
	},
	//获得一行的数据
	getRow:function(trelem){
		let itms=trelem.querySelectorAll('td');
		let res={};
		for(let i in itms){
			let td=itms[i];
			if(td.dataset && td.dataset.column && td.innerHTML && td.innerHTML!='' && td.innerHTML!='null'){
				res[td.dataset.column]=td.innerHTML;
			}
		}
		return res;
	}
}





//sql命令页面
const sqlview={
	elem:$('sqlview'),
	clear:function(){
		sqlview.elem.innerHTML="";
	},
	//执行sql语句
	apply:async function(){
		let sql=sqlview.elem.innerText;
		if(sql){
			sql=sql.replaceAll('\n',' ');//去除回车
			sql=sql.replaceAll('\t',' ');//去除tab
			sql=sql.replaceAll(/\s+/g, ' ');//多个空格变一个
			
			let data=await execSQL(sql);
			resultview.show.auto(data);
			
			tableview.items.forEach((it)=>{
				it.style.color="black";
				it.style.borderColor="black";
			});
		}
	},
	//初始化
	init:function(){
		$('sqlstart').onclick=()=>{
			$('popupview').style.display='flex';
		};
		$('sqlapply').onclick=()=>{
			sqlview.apply();
			$('popupview').style.display='none';
		};
		$('sqlcancel').onclick=()=>{
			$('popupview').style.display='none';
		};
		$('sqlclear').onclick=()=>{
			sqlview.clear();
		};
	},
	//追加语句
	append:function(sql){
		let txtnode=document.createTextNode(sql);
		sqlview.elem.appendChild(txtnode);
		sqlview.elem.appendChild(document.createElement('br'));
		return txtnode;
	},
	//去除textnode
	remove:function(txtnode){
		//console.log(txtnode);
		let nextnode=txtnode.nextSibling;
		txtnode.parentNode.removeChild(txtnode);
		if(nextnode && nextnode.nodeName=='BR'){
			console.log(nextnode.nodeName);
			nextnode.parentNode.removeChild(nextnode);
		}
	}
}

sqlview.init();

//REVERT功能
const revert={
	set:function(func){
		if(func){
			$('revert').onclick=function(){
				func();
			}
		}
	}
}

//辅助编辑功能
const assist={
	nowtable:"",//操作表名
	column:[],//记录列
	addrow:[],//新增的行
	//增加
	add:function(){
		let table=resultview.elem.querySelector('table');
		if(!table || !table.getAttribute('contenteditable') || table.getAttribute('contenteditable')!='true' ){
			return;
		}
		let tbody=table.querySelector('tbody');
		if(!tbody||JSON.stringify(assist.column)=="[]"){
			return;
		}
		
		let tr=document.createElement('tr');
		tr.style.color='purple';
		let column=assist.column;
		for(let k in column){
			let attr=column[k];
			let td=document.createElement('td');
			td.dataset.column=attr;
			tr.append(td);
		}
		
		//删除添加
		let td=document.createElement('td');
		let dbt=document.createElement('button');
		dbt.classList.add('opbtn');
		dbt.innerHTML="DELETE";
		dbt.style.color='red';
		dbt.onclick=function(){
			let idx=-1;
			let addrow=assist.addrow;
			for(let i in addrow){
				if(addrow[i]['dv']==tr){
					idx=i;
					break;
				}
			}
			
			if(idx!=-1){
				let tnode=addrow[idx]['txtnode'];
				if(tnode&&tnode!=null&&tnode!=''&&tnode!='null'&&tnode!=undefined){
					sqlview.remove(tnode);
				}
				assist.addrow.splice(idx,1);
			}
			tbody.removeChild(tr);
		};
		td.appendChild(dbt);
		tr.append(td);
		
		tbody.appendChild(tr);
		assist.addrow.push({'dv':tr,'txtnode':null});
	},
	//应用
	apply:function(){
		let addrow=assist.addrow;
		for(let i in addrow){
			let dv=addrow[i]['dv'];
			let data=resultview.getRow(dv);
			console.log(data);
			if(data && JSON.stringify(data)!='{}'){
				appendsql="REPLACE INTO "+assist.nowtable;
				appendsql+="(`";
				appendsql+=Object.keys(data).join("`,`");		
				appendsql+="`) VALUES (";
				appendsql+=Object.values(data).join(",")
				appendsql+=")";
				appendsql+=';';
				let txtnode=sqlview.append(appendsql);
				
				let idx=-1;
				for(let p in addrow){
					if(addrow[p]['dv']==dv){
						idx=p;
						break;
					}
				}
				
				if(idx!=-1){
					let tnode=addrow[idx]['txtnode'];
					if(tnode&&tnode!=null&&tnode!=''&&tnode!='null'){
						sqlview.remove(tnode);
					}
					addrow[idx]['txtnode']=txtnode;
				}else{
					addrow.push({'dv':dv,'txtnode':txtnode});
				}
			}
		}
	},
	//过滤器
	filter:function(){
		let column=assist.column;
		let filtercondition=$('filtercondition');
		let addcondition=$('addcondition');
		filtercondition.innerHTML='';
		addcondition.innerHTML='';
		for(let i in column){
			let btn=document.createElement('button');
			btn.innerHTML="`"+column[i]+'`';
			btn.classList.add('opbtn');
			btn.onclick=function(){
				let dv=document.createElement('div');
				dv.classList.add('info');
				dv.classList.add('bfinline');
				dv.dataset.info="`"+column[i]+'`';
				dv.setAttribute('contenteditable','true');
				filtercondition.appendChild(dv);		
			};
			addcondition.appendChild(btn);
		}
		
	},
	//执行过滤
	filterStart:async function(op){
		sqlview.innerHTML='';
		sql="SELECT * FROM "+assist.nowtable;
		
		let dvs=$('filtercondition').querySelectorAll('div');
		let tmp=[];
		for(let i in dvs){
			let dv=dvs[i];
			if(dv.innerText&&dv.innerText!=''){
				let cdt=" "+dv.dataset.info+dv.innerText+" ";
				tmp.push(cdt);
			}
		}
		if(JSON.stringify(tmp)!='[]'){
			sql+=" WHERE ";
			sql+=tmp.join(op);
		}
		sql+=";";
		sqlview.append(sql);
		let data=await execSQL(sql);
		resultview.show.auto(data,'true');
		
		if(JSON.stringify(tmp)!='[]'){
			let tps=document.createElement('div');
			let tpsct="FILTER:'"+op+"'<br>"+tmp.join('<br>');
			tps.innerHTML=tpsct;
			resultview.elem.appendChild(tps);
		}
		$('popupview2').style.display='none';
		
		revert.set(()=>{
			resultview.show.auto(data,'true');
			if(JSON.stringify(tmp)!='[]'){
				let tps=document.createElement('div');
				let tpsct="FILTER:'"+op+"'<br>"+tmp.join('<br>');
				tps.innerHTML=tpsct;
				resultview.elem.appendChild(tps);
			}
		});
		
	},	
	//清空
	clear:function(){
		assist.nowtable="";
		assist.column=[];
		assist.addrow=[];
	},
	//初始化
	init:function(){
		assist.clear();
		$('apply').onclick=function(){
			assist.apply();
			$('sqlstart').onclick();
		};
		$('add').onclick=function(){
			assist.add();
			resultview.elem.scrollTo(0,resultview.elem.scrollHeight);
		};
		$('filter').onclick=function(){
			if(assist.nowtable!=""){
				assist.filter();
				$('popupview2').style.display='flex';
			}
		};
		
		$('filtercancel').onclick=function(){
			$('popupview2').style.display='none';
		};
		
		$('filterand').onclick=function(){
			assist.filterStart('AND');
		};
		
		$('filteror').onclick=function(){
			assist.filterStart('OR');
		};
	},
	//去除object中value为null的项
	removeNull:function(obj){
		for(let t in obj){
			let v=obj[t];
			if(v==null||v==''||v==undefined){
				delete obj[t];
			}
		}
	}
}

assist.init();















