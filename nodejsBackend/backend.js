const http=require("http");
const url = require('url');
const util = require('util');
const mysql=require("mysql");//引入mysql


//编码器
const encoder={
	encode:function(inp){
		return btoa(inp);
	},
	decode:function(inp){
		return atob(inp);
	}
}

//token
let token="admin";

//获取加密后token
function encodeToken(){
	return btoa(token);
}
//检查TOKEN
function checkToken(tk){
	let trtk=encodeToken();
	if(trtk==tk)return true;
	else return false;
}



//连接池创建
const pool=mysql.createPool({
	host: "localhost",
    port: 3306, 
    database: "eduadmsys",
    user: "eduadm",
    password: "eduadm",
	multipleStatements: true//允许多语句执行
});

let frontendUrl="http://localhost:8080";


http.createServer(function (request, response) {
	
    response.setHeader("Access-Control-Allow-Origin",frontendUrl);
    response.setHeader("Access-Control-Allow-Headers","content-type");
    response.setHeader("Access-Control-Allow-Methods","POST,GET");
	

    response.writeHead(200, {'Content-Type': 'application/json'});
	let para=url.parse(request.url, true).query;
	//console.log(para);
	let sql="#";
	
	let tokenCheck=false;
	
	//TOKEN校验
	if(para && para.token){
		let tokenGet=para.token;
		console.log(tokenGet);
		if(!checkToken(tokenGet)){
			response.end(JSON.stringify({'TokenError':"<span style='color:red;'>TOKEN ERROR</span>"}));
		}else{
			tokenCheck=true;
		}
	}
	
	if(para && para.sql && para.sql!=""){
		sql=para.sql;
		sql=encoder.decode(sql);
	}
	console.log(sql);
	
	//从连接池获取连接
	if(tokenCheck)pool.getConnection((err,conn)=>{
		if(err){
			response.end(JSON.stringify(err));
			return;
		}
		//执行sql语句
		conn.query(sql,(err,res)=>{
			let rps="unknow error";
			if(err){
				rps=JSON.stringify(err);
				console.log(rps);
			}else{
				rps=JSON.stringify(res)
			}
			response.end(rps);
			//console.log(rps);
			conn.release();
		});
	});
	
}).listen(8888);


