class Register  {																					

	constructor(person)   																		// CONSTRUCTOR
	{
		app.reg=this;																				// Set context
		this.person=person;																			// Save person's data
		this.cameraStream=null;																		// Camera data
		this.Draw();																				// Draw form
	}

	Draw()
	{
		let str=`<div style="text-align:center;font-size:16px">
			<img src="img/logo.png" alt="" style="width:150px"><br><br>
			<div style="font-size:24px"><b>Please fill out your name tag!</b><br><br></div>
			<table style="display:inline-block;border-spacing:4px;text-align:left">
				<tr><td>First name&nbsp;</td><td><input class='co-is' style="width:150px" type='text' id='firstName' placeholder='required'></td>
				<td>Last name</td><td><input class='co-is' style="width:150px" type='text' id='lastName' placeholder='required'></td></tr>
				<tr><td>Title</td><td><input class='co-is' style="width:150px" type='text' id='title'>&nbsp;&nbsp;&nbsp;&nbsp;</td>
				<td>Organization&nbsp;</td><td><input class='co-is' style="width:150px"type='text' id='org'></td></tr>
				<tr><td>City</td><td><input class='co-is' style="width:150px" type='text' id='city'>&nbsp;&nbsp;&nbsp;&nbsp;</td>
				<td>State/Country&nbsp;</td><td><input class='co-is' style="width:150px"type='text' id='statecon'></td></tr>
				<tr><td>Linked-In</td><td><input class='co-is' style="width:150px" type='text' id='li'></td>
				<td>Website</td><td><input class='co-is' style="width:150px"type='text' id='web'></td></tr>
				<tr><td>Interests</td><td><input class='co-is' style="width:150px" type='text' id='ints'></td></tr>
				<tr><td colspan='4'><p><hr></p></td></tr>
				<tr><td colspan='2' style="text-align:center;vertical-align:top">
				<b>Add a picture for your icon</b><br><br>
				<div class="co-bsg" id="co-regCam" onclick='app.reg.StartStreaming()'>From your webcam</div>
				<p style="margin:4px 0;color:#777"><i>or</i></p>
				<div class='co-bsg' id='co-regLoad' onclick=''>From your computer</div>
				<p style="margin:4px 0;color:#777"><i>or</i></p>
				<input class='co-is' style="width:150px;text-align:center" type='text' id='co-regPic' placeholder="Type the full URL here">
				</td>
					<td colspan='2' style='text-align:center'>
					<div id="streamBox" style="overflow:hidden;width:240px;height:180px;display:inline-block;border:1px solid #999">
						<div id="coRegSnapShot"><img id="regSnapimg" width="240" src="${this.person.pic ? this.person.pic : "img/avyou.png"}"></div>
						<video id="stream" width="240" height="180"></video>
					</div>
					<canvas id="coRegCapture" width="240" height="180" style="display:none;overflow:hidden"></canvas>
					</div><div>
				</td></tr>
				<tr><td colspan='4'><p><hr></p></td></tr>
				</table>
			<br><div class='co-bsg' id='co-regSend' style="font-size:24px;padding-bottom:6px">
			<b>&nbsp;&nbsp;Join the meeting!&nbsp;&nbsp;</b></div>
			<input type="file" id="co-regUpload" style="display:none">
		</div>`;

	$("#splashDiv").css("margin-top","24px");														// Shrink margin
	$("#splashDiv").html(str.replace(/\t|\n|\r/g,""));												// Add registration form
	$("#lastName").val(this.person.lastName ? this.person.lastName: ""); 							// Last
	$("#title").val(this.person.title ? this.person.title: ""); 									// Title
	$("#org").val(this.person.org ? this.person.org: ""); 											// Org
	$("#city").val(this.person.city ? this.person.city: ""); 										// City
	$("#statecon").val(this.person.statecon ? this.person.statecon: ""); 							// State
	$("#li").val(this.person.li ? this.person.li: ""); 												// Li
	$("#web").val(this.person.web ? this.person.web: ""); 											// Web
	$("#ints").val(this.person.ints ? this.person.ints: ""); 										// Ints

	$("#co-regSend").on("click",()=>{ this.Send() });												// ON SEND
	$("#co-regLoad").on("click",()=>{ $("#co-regUpload").trigger("click") })						// ON ADD IMAGE	
	$("#co-regUpload").on("change",(e)=>{															// ON IMAGE UPLOAD
		let myReader=new FileReader();																// Alloc reader
		$("#co-regPic").val("");																	// Clear typed entry
		myReader.onloadend=(e)=>{ regSnapimg.src=myReader.result; }									// When loaded
		myReader.readAsDataURL(e.target.files[0]);													// Load file		
		});
	}
	
	Send()																						// REGISTER THEM
	{
		if (!$("#firstName").val()) { Popup("First name is required!"); return; }					// Required
		if (!$("#lastName").val()) 	{ Popup("Last name is required!");  return; }

		this.person.firstName=$("#firstName").val();												// First name
		this.person.lastName=$("#lastName").val(); 													// Last
		this.person.title=$("#title").val() ? $("#title").val() : "";								// Title
		this.person.org=$("#org").val() ? $("#org").val() : "";										// Org
		this.person.city=$("#city").val() ? $("#city").val() : "";									// City
		this.person.statecon=$("#statecon").val() ? $("#statecon").val() : "";						// State/country
		this.person.li=$("#li").val() ? $("#li").val() : "";										// LinkedIn
		this.person.web=$("#web").val() ? $("#web").val() : "";										// Web
		this.person.ints=$("#ints").val() ? $("#ints").val() : "";									// It

		if (this.cameraStream)	this.StartStreaming();												// If streaming, capture image

		if (!$("#co-regPic").val() && (regSnapimg.src.length > 100)) {								// Not directly spec'd and nothing loaded
			let s=this.person.meeting+"/"+this.person.email+".png";									// Make up file name
			app.ws.send("IMG|"+s+"|"+regSnapimg.src);												// Send base64 to server
			this.person.pic="https://etalimages.s3.amazonaws.com/"+s;								// Get AWS S3 url
			}
		else this.person.pic=$("#co-regPic").val();													// Set pic
		app.ws.send("MP|"+this.person.id+"|"+JSON.stringify(this.person));							// Update server record
		app.JoinMeeting(this.person.id);															// Join meeting
	}

	StartStreaming() 
	{
		if (this.cameraStream) {
			$("#co-regCam").text("From your webcam");
			$("#co-regCam").css("background-color","#999")
			var ctx=coRegCapture.getContext('2d');
			ctx.drawImage(stream, 0, 0, 240, 180 );
			regSnapimg.src=coRegCapture.toDataURL("image/png" );
			$("#coRegCapture").hide();
			$("#coRegSnapShot").show();
			$("#stream").hide();
			this.cameraStream.getTracks()[0].stop();
			stream.load();
			this.cameraStream=null;
			$("#co-regPic").val("");
			return;	
			}
	
		$("#co-regCam").text("Click here to take picture");
		$("#co-regCam").css("background-color","#009900")
		let mediaSupport = 'mediaDevices' in navigator;
		$("#stream").show();
		$("#coRegSnapShot").hide();
		if (mediaSupport && null == this.cameraStream ) {
			navigator.mediaDevices.getUserMedia( { video: true } )
			.then( (mediaStream)=> {
				this.cameraStream = mediaStream;
				stream.srcObject = mediaStream;
				stream.play();
				})
			.catch( function( err ) {
				$("#coRegCapture").hide();
				$("#coRegSnapShot").show();
				$("#stream").hide();
					console.log( "Unable to access camera: " + err );
				});
		}
	}

} // CLASS CLOSURE