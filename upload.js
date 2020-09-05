
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
