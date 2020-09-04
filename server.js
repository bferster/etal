
	console.log("Initializing nodeJS server");
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
		let v=req.url.split("/")
		if (v[2] == "people") {
			let f="./meetings/"+v[1]+"-"+v[2]+".csv";
				fs.readFile(f, "utf8", (err, data)=>{
				if (err) {	return console.log(err);  }
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write("people("+JSON.stringify(ParseCSV(data))+")");
				res.end();
				});
			}
	 	});

	server.listen(8001);
	console.log("server initialized on port 8001");


// HELPERS

	function ParseCSV(str) {															// PARSE CSV TO NESTED ARRAYS
		var arr=[];
		var quote=false;  																	// True means we're inside a quoted field
		str=str.replace(/\\r\\n/g,"\n");													// Convert \r\n -> \n
		str=str.replace(/\\n\\r/g,"\n");													// Convert \n\r -> \n
		for (var row=col=c=0;c < str.length;c++) {   										// Iterate over each character, keep track of current row and column (of the returned array)
			var cc=str[c],nc=str[c+1];        												// Current character, next character
			arr[row]=arr[row] || [];             											// Create a new row if necessary
			arr[row][col]= arr[row][col] || '';   											// Create a new column (start with empty string) if necessary
			if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; } 	// If the cur char is ", and we're inside a quoted field, and the next char is also a ", add a " to the current column and skip the next character
			if (cc == '"') { quote = !quote; continue; }        							// If it's just one quotation mark, begin/end quoted field
			if (cc == ',' && !quote) { ++col; continue; }      								// If it's a comma and we're not in a quoted field, move on to the next column
			if (cc == '\n' && !quote) { ++row; col = 0; continue; }     					// If it's a newline and we're not in a quoted field, move on to the next row and move to column 0 of that new row
			arr[row][col] += cc;        													// Otherwise, append the current character to the current column
			}
		return arr;																			// Return nested arrays
		}

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
