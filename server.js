
	console.log("Initializing nodeJS server");
	const WebSocket = require('ws');
	const AWS = require("aws-sdk");
	AWS.config.loadFromPath('./config.json');

// PEOPLE

	var docClient=new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
	var params={ TableName: 'people', Key: { "meeting": 2 }};
	
/*	docClient.get(params, (err, data)=> {
		if (err) 	{ console.log("Error", err); } 
		else 		{ console.log("Success", data.Item); };
		});
*/
	var params2={ TableName: 'people', Item: { "id":1 , data:"data"}};
	
	docClient.put(params2, (err, data)=> {
        if (err) 	{ console.error("Unable to write data: ", JSON.stringify(err, null, 2)); }
        else 	 	{ console.log("PutItem succeeded"); }
		});


// WEBSOCKET SERVER

	const webSocketServer = new WebSocket.Server({ port:8080 });
	
	webSocketServer.on('connection', (webSocket) => {
		console.log("Initializing websocket server on port 8080");
		webSocket.on('message', (message) => {
			console.log('Received:', message);
			broadcast(message);
			});
		});

	function broadcast(data) {
		webSocketServer.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
			client.send(data);
			}
			});
		}

// HTTP SERVER
		
/*		const http=require('http');
		const server=http.createServer((req, res)=>{
		let v=req.url.split("/")
		trace(v,req.url)
		if (v[2] == "people") {
			let f="./meetings/"+v[1]+"-"+v[2]+".csv";
				fs.readFile(f, "utf8", (err, data)=>{
				if (err) {	return console.log(err);  }
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write("PEOPLE("+JSON.stringify(ParseCSV(data))+")");
				res.end();
				});
			}
	 	});

	server.listen(8001);
*/
	console.log("server initialized on port 8001");


// HELPERS

	function trace(msg, p1, p2, p3, p4)									
	{
		if (p4 != undefined)
			console.log(msg,p1,p2,p3,p4);
		else if (p3 != undefined)
			console.log(msg,p1,p2,p3);
		else if (p2 != undefined)
			console.log(msg,p1,p2);
		else if (p1 != undefined)
			console.log(msg,p1);
		else
			console.log(msg);
	}
