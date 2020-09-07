
	console.log("Initializing nodeJS server");
	const WebSocket = require('ws');
	const AWS = require("aws-sdk");
	AWS.config.loadFromPath('./config.json');
	var docClient=new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

// WEBSOCKET SERVER

	const webSocketServer = new WebSocket.Server({ port:8080 });

	webSocketServer.on('connection', (webSocket) => {
		console.log("New connect");
		webSocket.myId=-1;
		webSocket.on('message', (message) => {
			console.log('Received:', message);
			if (!message)	return;
			let v=message.split("|");
			if ((webSocket.myId == -1) && (v[0] != "P")) 	webSocket.myId=v[1];
			if (v[0] == "C") 		Chat(v[1],v[2],v[3]);
			else if (v[0] == "L") 	Location(v[1],v[2],v[3]);
			else if (v[0] == "B") 	Broadcast(v[1],v[2]);
			else if (v[0] == "P") 	SendPeople(v[1],webSocket);
			});
		});

	function Broadcast(id, msg)
	{
		let str="B|"+id+"|*|"+msg;
		webSocketServer.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) 	client.send(str);
			});
	}
	
	function SendData(client, data) 
	{
		if (client.readyState === WebSocket.OPEN)	client.send(data);
	}
	
	function Chat(fromId, toId, msg) 
	{
		let str="C|"+toId+"|"+fromId+"|"+msg;
		webSocketServer.clients.forEach((client) => {
			if (client.myId == toId)
				if (client.readyState === WebSocket.OPEN) 
					client.send(str);
			});
	}
	
	function SendPeople(meetingId, client)	
	{
		var params = { TableName : 'people', FilterExpression : 'meeting = :q',ExpressionAttributeValues : {':q' :meetingId }  };
		docClient.scan(params, (err, data)=> {
			if (err) 	{ console.error("Unable to read data: ", JSON.stringify(err, null, 2)); }
			else 		{ console.log("People sent"); SendData(client,"P|"+JSON.stringify(data.Items)); };
		});
	}

	function Location(id, x, y)
	{
		let str="L|"+id+"|"+x+"|"+y;
		webSocketServer.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) 
					client.send(str);
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
	
