
	console.log("Initializing Loader");
	const AWS = require("aws-sdk");
	AWS.config.loadFromPath('./config.json');


/*

// PEOPLE

	var params2={ TableName: 'people', Item: { "id":1 , data:"data"}};
	
	docClient.put(params2, (err, data)=> {
        if (err) 	{ console.error("Unable to write data: ", JSON.stringify(err, null, 2)); }
        else 	 	{ console.log("PutItem succeeded"); }
		});

*/

// HELPERS

function InitFromJSON(cells)																							// INIT APP DATA FROM GDOCS JSON FILE
{
	let i,v,col,row,con,o,s=[];
	for (i=0;i<cells.length;++i) {																				// For each cell
		trace(cells)
		o=cells[i];																								// Point at it
		col=o.gs$cell.col-1; 	row=o.gs$cell.row-1;															// Get cell coords
		con=o.content.$t;																						// Get content
		if (!con) 				continue;																		// Skip blank cells
		if (!s[row])			s[row]=["","","","",""];														// Add new row if not there already
		if (col < 5)			s[row][col]=con;																// Add cell to array
		}
	for (i=1;i<s.length;++i) {																					// For each line
		v=s[i];																									// Point atfields
		if (!v) continue;																						// Skip blank lines
		trace(v)
		}																						
	}




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
