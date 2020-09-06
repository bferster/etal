
	console.log("Initializing nodeJS server");
	const WebSocket = require('ws');
	const AWS = require("aws-sdk");
	AWS.config.loadFromPath('./config.json');
	var docClient=new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

// WEBSOCKET SERVER

	const webSocketServer = new WebSocket.Server({ port:8080 });

	webSocketServer.on('connection', (webSocket) => {
		console.log("New connect");
		webSocket.myId=0;
		webSocket.on('message', (message) => {
			console.log('Received:', message);
			if (!message)	return;
			let v=message.split("|");
			if (!webSocket.myId) 	webSocket.myId=v[1];
			if (v[0] == "C") 		Chat(v[1],v[2],v[3]);
			else if (v[0] == "B") 	Broadcast(v[1],v[2]);
			else if (v[0] == "P") 	SendPeople(v[1],v[2]);
			});
		});

	function Broadcast(id, msg)
	{
		let str="C|"+id+"|*|"+msg;
		webSocketServer.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) 	client.send(str);
			});
	}
	
	function Send(id, data) 
	{
		webSocketServer.clients.forEach((client) => {
			if (client.myId == id)
				if (client.readyState === WebSocket.OPEN) 
					client.send(data);
			});
		}
	
	function Chat(fromId,toId, msg) 
	{
		let str="C|"+toId+"|"+fromId+"|"+msg;
		trace(fromId, toId, msg) 
		webSocketServer.clients.forEach((client) => {
			if (client.myId == toId)
				if (client.readyState === WebSocket.OPEN) 
					client.send(str);
			});
		}
	
	function SendPeople(id)	
	{
		var params = { TableName : 'people', FilterExpression : 'meeting = :q',ExpressionAttributeValues : {':q' :id.split("~")[0]}  };
		docClient.scan(params, (err, data)=> {
			if (err) 	{ console.error("Unable to read data: ", JSON.stringify(err, null, 2)); }
			else 		{ console.log("People sent to "+id); Send(id,"P|"+JSON.stringify(data.Items)); };
		});
	
	}



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
	