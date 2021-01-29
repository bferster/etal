class Chat  {																					

	constructor()   																		// CONSTRUCTOR
	{
		this.chats=[];																				// Holds chats
		this.curChat=-1;																			// Who I'm chatting with																			
		this.queue=[];																				// Contact queue
		this.recognition=null;																		// TTS/STT
		this.VoiceInit((s)=> { 																		// Iniy TTS/STT
			let v=$("#co-revText").val();															// Get current input value
			if (v) v+=" ";																			// Add a space if something there
			$("#co-revText").val(v+s)
			});				
	}

	ShowQueue()																					// SHOW QUEUE DOT
	{
		let i,flip=false;
        $("#co-card").remove();     																// Card                                                                
		this.curChat=-1;																			// Not chatting with anyone
		let x=$("#co-AvMe").css("left").replace("px","")-150+avSize/2;								// Get my pos x
		let y=$("#co-AvMe").css("top").replace("px","")-326-12;										// Y
		if (y < 12) flip=true,y=y-0+avSize+326+24;													// Flip it
		if (x < 12)	x=12;																			// Too far left
		if (x > app.bx-312)	x=app.bx-312;															// Too far right
		let str=`<div id='co-card' class='co-qlist' style='left:${x}px;top:${y}px'>
			<img style="float:right;cursor:pointer;margin-top:5px" src="img/closedot.png" onclick="$('#co-card').remove()">
			<b style='font-size:18px'>Missed messages</b><hr><br>
			<div style="overflow-x:hidden;overflow-y:auto;height:calc(100% - 50px)">`;
			for (i=0;i<this.queue.length;++i) {
				str+=`<div id="co-qv-${i}" style="vertical-align:top">
				<div style="float:left;text-align:left;width:100%">
					<div style="float:left;width:40px;height:40px;overflow:hidden;border-radius:64px;margin:0 8px 16px 4px;border:1px solid #999">
					<img id="co-qi-${i}" style="width:40px"	src="${app.people[this.queue[i].id].pic}"></div>
					<b>${app.people[this.queue[i].id].firstName} ${app.people[this.queue[i].id].lastName}</b></br>
					<i>${this.queue[i].msg}</i>
					<img src="img/deletebut.png" id="co-qd-${i}" style="float:right;cursor:pointer;margin:-8px 8px 0 0"></div></div>`
				}
			str+="</div>"
			str+=`<div style="position:absolute;left:141px; top:${flip ? "-10" : "323"}px; width:0;height:0; 
				${flip ? "transform: rotate(180deg)" : ""};border-style:solid; border-width: 14px 8px 0 8px;
				border-color: #fff transparent transparent transparent"></div>
			</div>`;
		$("body").append(str.replace(/\t|\n|\r/g,""));

		$("[id^=co-qd-]").on("click",(e)=>{															// ON DELETE CLICK
			let i=e.target.id.substr(6)-0;															// Get index
			let targetId="co-Av-"+i;																// Recreate id
			$("#co-qv-"+i).remove();																// Kill it
			this.queue.splice(i,1);																	// Remove it
			Sound("delete");																		// Delete sound
			if (this.queue.length) 	$("#co-queue").text(this.queue.length);							// Update count
			else 					$("#co-queue").hide();											// Remove	
			this.ShowQueue();																		// Reshow
			});

		$("[id^=co-qi-]").on("click",(e)=>{															// ON AVATAR CLICK
			let id=e.target.id.substr(6)-0;															// Get id
			this.Chat(this.queue[id].id);															// Show card
			});
	}

	ShowCard(id)																				// SHOW BUSINESS CARD
	{
		let x=$("#co-Ap-"+id).offset().left-175+avSize/2;;											// Center X on avatar 
		let y=$("#co-Ap-"+id).offset().top-200+12;													// Y atop avatar
		$("#co-chat").remove();                                                                     // Close chat if open
        $("#co-card").remove();     																// Card                                                                
		this.curChat=-1;																			// Not chatting with anyone
		let flip=false;																				// Position above avatar
		if (y < 12) flip=true,y=(y-0+avSize+200);													// Flip to bottom
		if (x < 12)	x=12;																			// Too far left
		if (x > app.bx-362)	x=app.bx-362;															// Too far right
		let o=app.people[id];																		// Point at person
		let str=`<div id='co-card' class='co-card' style='left:${x}px;top:${y}px'>
			<img style="float:right;cursor:pointer" src="img/closedot.png" onclick="$('#co-card').remove()">
			<b style='font-size:24px'>${o.firstName ? o.firstName : ""} ${o.lastName ? o.lastName : ""}</b>
			<p><b>${o.title ? o.title : ""} | ${o.org ? o.org: ""}</b></p><p>
			${o.ints ? "Interests: "+o.ints : ""}
			</p><p style="position:absolute;left:24px;bottom:0">`;
			if (o.li) {																				// If a LI site
				o.li=o.li.replace(/www\./,"");														// Remove www.
				o.li=o.li.replace(/https:\/\//,"");													// Remove http
				o.li=o.li.replace(/linkedin.com\//,"");												// Domain
				o.li=o.li.replace(/in\//,"");														// Folder
				str+=`<a href="https://linkedin.com/in/${o.li}" target="_blank">
					<img style="cursor:pointer"src="img/LI-Logo.png" height="14px"></a>`;
				}
			if (o.web)	str+=`<div style="color:#000099;float:right;margin-top:14px">
						<a href="${o.web}" target="_blank">Website</a></div>`;
			str+=`</p><div id="co-chatBut" style="position:absolute; left:154px; bottom:10px; cursor:pointer;
				border-radius:30px;width:36px;background-color:#2d6ab3; color:#fff; height:28px; padding-top:8px; font-size:13px">
				chat</div> &nbsp;&nbsp
				<div style="position:absolute;left:166px; top:${flip ? "-10" : "171"}px; width:0;height:0; 
				${flip ? "transform: rotate(180deg)" : ""};
				border-style:solid; border-width: 14px 8px 0 8px;
    			border-color: #fff transparent transparent transparent;"></div>
			</div>`;
		$("body").append(str.replace(/\t|\n|\r/g,""));												// Add dialog
		$("#co-chatBut").on("click",()=>{ this.Chat(id)} );											// ON CHAT BUTTON CLICK
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CHAT
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Chat(id, target, nx, ny)																	// CHAT CLIENT
	{
		let i,ox,oy,flip=false;
		$("#co-chat").remove();                                                                     // Close chat if open
        $("#co-card").remove();     																// Card                                                                
		if (target == "here") {			ox=nx;	oy=ny; }											// Hover over x/y
		else if (target == "infoDesk"){ ox=$("#co-infoDesk").offset().left-2;	oy=$("#co-infoDesk").offset().top-4; }	// Infodesk																// If an info desk query
		else {							ox=$("#co-Ap-"+id).offset().left;		oy=$("#co-Ap-"+id).offset().top; } 		// Person						
		let x=ox-119+avSize/2;																		// Center X on avatar 
		let y=oy-360;																				// Y atop avatar
		if (y < 12) flip=true,y=(y-0+avSize+370);													// Flip it
		if (x < 12)	x=12;																			// Too far left
		if (x > app.bx-312)	x=app.bx-312;															// Too far right

		let o=app.people[id];																		// Point at person
		this.curChat=id;																			// Set curChat
		let str=`<div id='co-chat' class='co-chat' style='left:${x}px;top:${y}px'>
			<img style="float:right;cursor:pointer" src="img/closedot.png" onclick="$('#co-chat').remove()">
			<b>Chat with ${app.people[id].firstName}</b><hr style="margin:8px 32px">
			<div style="text-align:left">
                Send <img id="co-zoomBut" src="img/zoomblue.png" style="width:24px;cursor:pointer;vertical-align:-6px"> invite
                <select id="co-canned" class="co-is" style="float:right;width:90px">
                    <option>Canned</option>
                    <option>OK</option>
					<option>Sure</option>
                    <option>I'll get back with you</option>
                    <option>Maybe later</option>
                    <option>Do you want to video chat?</option>
                    <option>My email is ${app.people[app.myId].email}</option>                
                </select>
            </div>  
			<div id="co-textDiv" style="height:218px;overflow-x:hidden;overflow-y:auto;margin-top:8px;border:1px solid #999;border-radius:6px;padding:4px 4px"></div>														
			<div style="position:absolute;top:312px;left:12px">
				<input  id="co-revText" placeholder="Type here or speak" class='co-is' style='width:182px;outline:none;'>			
				<img id='co-talkBut'src='img/talkbut.png' style='vertical-align:-7px;margin-left:-16px;cursor:pointer'>
				<img id='co-revTextBut'src='img/sendtext.png' style='vertical-align:-7px;margin-left:12px;cursor:pointer'>
				</div>	
			<div style="position:absolute;left:112px; top:${flip ? "-10" : "343"}px; width:0;height:0; 
				${flip ? "transform: rotate(180deg)" : ""};
				border-style:solid; border-width: 14px 8px 0 8px;
    			border-color: #fff transparent transparent transparent;"></div>
			</div>`;
		$("body").append(str.replace(/\t|\n|\r/g,""));												// Add chatbox
		
		$("#co-revText").focus();																	// Focus on input

		$("#co-canned").on("change", ()=>{                                                          // ON CANNED RESPONSE
            sendChat($("#co-canned").val())                                                         // Send reponse
            $("#co-canned").prop("selectedIndex",0);                                                // Reset select
            });

 		for (i=0;i<this.chats.length;++i) {															// For each chat in archive
			if (this.chats[i].id == id) 															// If it's whom I'm chatting with
				$("#co-textDiv").append(`<div class="co-text${this.chats[i].dir ? "S" : "R"}">${this.chats[i].msg}</div><br>`);	// Add message
			}
		$("#co-textDiv").scrollTop(10000);															// Scroll to bottom
		$("#co-talkBut").on("click", ()=>{this.Listen()});											// Start STT
		
		for (i=0;i<this.queue.length;++i) {															// For item in message box
			if (this.queue[i].id == id) 															// If it's whom I'm chatting with
				this.queue.splice(i,1);																// Remove it
			if (this.queue.length) 			$("#co-queue").text(this.queue.length);					// Update count
			else 							$("#co-queue").hide();									// Remove	
			}
	
		$("#co-revText").on("change",   ()=>{ sendChat(); });										// ON TEXT ENTER
		$("#co-revTextBut").on("click", ()=>{ sendChat(); });										// ON SEND CLICK 
		$("#co-zoomBut").on("click", ()=>{ 															// ON VIDEO CHAT BUT CLICK
			let link=`japp.htm?/~${app.meetingId}~${app.people[app.myId].firstName}${app.myId}`;	// Link
			let str=`<div onclick="app.sced.ShowLink('${link}','true')">
			Click <img src="img/zoomblue.png" style="width:24px;cursor:pointer;vertical-align:-6px"> to join`;
			sendChat(str);																			// Invite
			app.sced.ShowLink(link,true);																// Start chatting
			})					
	
		function sendChat(msg) {																	// TEXT CHATTING
			let s=msg ? msg : $("#co-revText").val();												// Get text fron msg or textbox
			if (s) {																				// If something there
				$("#co-textDiv").append("<div class='co-textS'>"+s+"</div>");						// Add to display 
				let fid=app.people[app.myId].id;													// From id (me)
				let tid=app.people[id].id															// To id
				app.ws.send(`C|${fid}|${tid}|${s}`);												// Send chat message
				app.chat.chats.push({ dir:1, id:id, msg:s});										// Archive
				$("#co-textDiv").scrollTop(10000);													// Scroll to bottom
				}
			$("#co-revText").val("");																// Clear input
			}	
		}
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VOICE INPUT
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	VoiceInit(callback)
	{	
		let i;
		try {																							// Try
			var SpeechRecognition=SpeechRecognition || webkitSpeechRecognition;							// Browser compatibility
			this.recognition=new SpeechRecognition();													// Init STT
			this.recognition.continuous=false;															// Continual recognition off
			this.recognition.lang="en-US";																// US English
			this.recognition.interimResults=true
			this.recognition.onend=(e)=> { $("#co-talkBut").prop("src","img/talkbut.png"); this.listening=false; };	// On end, restore button
			this.hasRecognition=true;																	// Has speechrecognition capabilities														
			let mac=(navigator.platform == "MacIntel");													// A mac?
			this.femaleVoice=mac ? 0 : 1;																// Female voice
			this.maleVoice=mac ? 1 : 0;																	// Male voice
			this.voices=[];																				// New array

			speechSynthesis.onvoiceschanged=()=> {														// React to voice init
				this.voices=[];																			// Clear list
				speechSynthesis.getVoices().forEach((voice)=> {											// For each voice
					if (voice.lang == "en-US")						this.voices.push(voice);			// Just look at English
					if (voice.name.match(/Microsoft David/i))		this.voices.push(voice),this.maleVoice=this.voices.length-1;	// Male voice
					if (voice.name.match(/Microsoft Zira/i))		this.voices.push(voice),this.femaleVoice=this.voices.length-1;	// Female voice
					if (voice.name.match(/Alex/i))					this.voices.push(voice),this.maleVoice=this.voices.length-1;	// Mac male voice
					if (voice.name.match(/Samantha/i))				this.voices.push(voice),this.femaleVoice=this.voices.length-1;	// Mac female voice
					});
				};

			this.recognition.onresult=(e)=> { 															// On some speech recognized
				for (i=e.resultIndex;i<e.results.length;++i) {											// For each result
					if (e.results[i].isFinal)															// If final
						callback(e.results[i][0].transcript);											// Send text to callback
					}
				};
		} catch(e) { trace("Voice error",e) };															// On error
	}

	Listen()																						// TURN ON SPEECH RECOGNITIOM
	{
		if (this.listening)	return;																		// Quit if already started
		try { this.recognition.start(); this.listening=true; } catch(e) { trace("Voice error",e) };		// Start recognition
		$("#co-talkBut").prop("src","img/intalkbut.png");												// Talking but
	}

	Speak(msg, who="female")
	{
		try {																							// Try
			let tts=new SpeechSynthesisUtterance();														// Init TTS
			if (who == "male")	tts.voice=this.voices[this.maleVoice];									// Set male voice
			else 				tts.voice=this.voices[this.femaleVoice];								// Set female voice
			tts.text=msg;																				// Set text
			speechSynthesis.speak(tts);																	// Speak
			} catch(e) { trace("TTS error",e) };														// On error
	}

	
} // Class closure