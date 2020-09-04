
	console.log("Initializing NodeJS");
	const WebSocket = require('ws');
	const http=require('http');
    const fs=require('fs');
    const url=require('url');

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
		
	const server=http.createServer((req, res)=>{
		if (req.url === "/shit") {
			res.write("Hi my");
			res.end();
			}
	 	});

	server.listen(8001);
	console.log("server initialized on port 8001");