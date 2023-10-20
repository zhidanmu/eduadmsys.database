const http=require("http");
const url = require('url');
const util = require('util');
const mysql=require("mysql");//引入mysql

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
	console.log(para);
	let sql="#";
	if(para && para.sql && para.sql!="")sql=para.sql;
	
	//console.log(sql);
	
	//从连接池获取连接
	pool.getConnection((err,conn)=>{
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