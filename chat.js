class Chat  {																					

	constructor()   																		// CONSTRUCTOR
	{
		this.chats=[];																				// Holds chats
		this.curChat=-1;																			// Who I'm chatting with																			
		this.speedTimer=null;																		// Speed meeting timer
		this.speedSecs=0;																			// Seconds in a speed meeting
		this.queue=[];																				// Contact queue
		this.recognition=null;																		// TTS/STT
		this.VoiceInit((s)=> { 																		// Init TTS/STT
			$("[id^=co-revText]").each(function() { 												// For each input
				let v=$(this).val();																// Get value of input																		
				if (v) v+=" ";																		// Add a space if something there
				$(this).val(v+s);																	// Set text
				})
			});				
	}

	SpeedMeeting(maxTime)																			// START/STOP SPEED MEETING																				
	{
		let i,o,bar,id,_this=this,str;
		this.speedTimer=null;																		// Speed meeting timer
		GetNextPerson();																			// Get next available person

		function GetNextPerson() {																	// GET NEXT PERSON
			bar=[];
			for (i=0;i<app.people.length;++i) {														// For each person
				o=app.people[i];																	// Point at them
				if ((i != app.myId) && (o.stats == "S"+app.curFloor) && !o.met) bar.push(i); 		// Add if in a speed meeting, not me and not already met
				}
			if (bar.length) {																		// If people in speed meeting
				id=ShuffleArray(bar)[0]																// Get random person
				app.people[id].met=1;																// Set person as met
				let fid=app.people[app.myId].id;													// From id (me)
				let tid=app.people[id].id															// To id
				app.sced.ShowLink(`japp.htm?/~${app.meetingId}~${fid}~${tid}`);						// Run video
				app.ws.send(`C|${fid}|${tid}|speedmeet`);											// Send chat message to start
				_this.speedSecs=0;																	// Start second
				app.ArrangePeople();																// Arrange people in meeting
				
				_this.speedTimer=setInterval(()=>{													// Set timer
					_this.speedSecs++;																// Add to count	
					if (_this.speedSecs == maxTime-10) {											// If close to end
						$("#co-popupDiv").remove();													// Kill old one, if any
						if (document.fullscreenElement)	document.exitFullscreen();					// Force non-full screen 
						str=`<div id="co-popupDiv" class="co-popup">
						There are 10 seconds left in this meeting<br><br>
						<div class="co-bsg" id="co-extMeet">Extend?</div></div>`;
						$("body").append(str);														// Add popup to body
						$("#co-popupDiv").fadeIn(500).delay(9000).fadeOut(500)						// Animate in and out		
						$("#co-extMeet").on("click",()=>{											// ON EXTEND
							_this.speedSecs=0;														// Start over
							$("#co-popupDiv").remove();												// Remove popup
							Sound('ding');															// Ding
							});
						}
					if (_this.speedSecs > maxTime) {												// If done with this persson
						app.ArrangePeople();														// Arrange people in meeting
						clearTimeout(_this.speedTimer);												// Clear timer
						app.ws.send(`C|${fid}|${tid}|speedclose`);									// Send chat message to close
						GetNextPerson();															// Get next person
						}
					},1000);																		// Every second
				}
			else app.CloseAll(3);																	// Quit
			}
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
					<img id="co-qi-${i}" style="width:40px;min-height:40px"	src="${app.people[this.queue[i].id].pic}"></div>
					<b>${app.people[this.queue[i].id].firstName} ${app.people[this.queue[i].id].lastName}</b></br>
					<i>${this.queue[i].msg}</i>
					<img src="img/deletebut.png" id="co-qd-${i}" style="float:right;cursor:pointer;margin:-8px 8px 0 0"></div></div>`
				}
			str+=`</div><div style="font-size:11px;color:#bb0000;float:right;margin-top:-12px;cursor:pointer" 
				id="co-reReg"><b>Change my name tag</b></div>"
				<div style="position:absolute;left:141px; top:${flip ? "-10" : "323"}px; width:0;height:0; 
				${flip ? "transform: rotate(180deg)" : ""};border-style:solid; border-width: 14px 8px 0 8px;
				border-color: #fff transparent transparent transparent"></div>
			</div>`;
		$("body").append(str.replace(/\t|\n|\r/g,""));
		$("#co-reReg").on("click", ()=> { new Register(app.myId) });								// ON RE-REGISTER CLICK

		$("[id^=co-qd-]").on("click",(e)=>{															// ON DELETE CLICK
			let i=e.target.id.substr(6)-0;															// Get index
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
		if (o.web)	o.web=o.web.replace(/^www\./i,"//www.");										// For Header on www
		let str=`<div id='co-card' class='co-card' style='left:${x}px;top:${y}px'>
			<img style="float:right;cursor:pointer" src="img/closedot.png" onclick="$('#co-card').remove()">
			<b style='font-size:20px;margin-left:16px'>${o.firstName ? o.firstName : ""} ${o.lastName ? o.lastName : ""}</b>
			<p><div><b>${o.title ? o.title : ""}${o.title ? " | " : ""}${o.org ? o.org: ""}</b></div>
			<div>${o.city ? o.city : ""}${o.city ? ", " : ""}${o.statecon ? o.statecon : ""}</div>
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
						<a href="${o.web.replace(/^www\./i,"//www.")}" target="_blank">Website</a></div>`;
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
		let i,s,ox,oy,flip=false;
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
			if (this.chats[i].id == id) {															// If it's whom I'm chatting with
				s=LinkableURL(this.chats[i].msg);													// Get message
				$("#co-textDiv").append(`<div class="co-text${this.chats[i].dir ? "S" : "R"}">${s}</div><br>`);	// Add message
				}
			}
			
		$("#co-textDiv").scrollTop(10000);															// Scroll to bottom
		$("#co-talkBut").on("click", ()=>{this.Listen("")});										// Start STT
		
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
				$("#co-textDiv").append("<div class='co-textS'>"+LinkableURL(s)+"</div>");			// Add to display 
				let fid=app.people[app.myId].id;													// From id (me)
				let tid=app.people[id].id															// To id
				app.ws.send(`C|${fid}|${tid}|${s}`);												// Send chat message
				app.chat.chats.push({ dir:1, id:id, msg:s});										// Archive
				$("#co-textDiv").scrollTop(10000);													// Scroll to bottom
				}
			$("#co-revText").val("");																// Clear input
			}	

		}
	
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BULLETIN BOARD
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	GetBulletinBoard(id, floatId)																// GET BULLETIN BOARD MARKUP
	{
		let c="";
		if (floatId != undefined) {																	// If called from button
			let r=RegExp("bulletinboard:"+floatId,"i");												// Turn into regex
			for (id=0;id<app.sced.schedule.length;++id) 											// For each event
				if (app.sced.schedule[id].link && app.sced.schedule[id].link.match(r)) 				// Got one
					break;		
				if (id == app.sced.schedule.length) return "";										// Not found
				}
		let content=app.sced.schedule[id].content;													// Point at JSON msg data
		if (content) {																				// If data
			content=content.replace(/<p>|<\/p>/ig,"");												// Remove <p>'s
			content=content.replace(/\&quot;/ig,"\"");												// Restore quotes
			content=content.replace(/\&apos;/ig,"'");												// Restore apos
			let data=JSON.parse(content);															// Objectify
			c=this.SetBulletinMarkup(id, data);														// Get markup			
			}
		$('#co-floatBB').remove();																	// Remove old one	
		let str=`<div id="co-bull-${id}" class="co-bulletin">${c}</div>														
		<div style="position:absolute;top:calc(100% - 34px);left:0;width:100%">
			<input id="co-revText-${id}" placeholder="Type here or speak" class='co-is' style='width:calc(100% - 65px);outline:none;'
			onchange="app.chat.AddToBulletin('${id}')">			
			<img id="co-talkBut-${id}" src="img/talkbut.png" style="vertical-align:-7px;margin-left:-16px;cursor:pointer" 
			onclick="app.chat.Listen('-${id}')">
			<img src='img/sendtext.png' style='vertical-align:-7px;margin-left:12px;cursor:pointer'
			onclick="app.chat.AddToBulletin('${id}')">
		</div>`;
		if (floatId != undefined) {																	// If called from button
			c=`<div id="co-floatBB" class="co-card" style="left:calc(50% - 150px);top:20%;height:400px;border-radius:18px">
			<b>Message Board</b>
			<img style="float:right;cursor:pointer" src="img/closedot.png" onclick="$('#co-floatBB').remove()">
			${str}</div>`;
			$("body").append(c.replace(/\t|\n|\r/g,""));												// Add BB
			$("#co-bull-"+id).css({ margin:"4px 0 0 -4px" });											// Move box
			$("#co-floatBB").draggable();
			return;
			}
		return str.replace(/\t|\n|\r/g,"");																// Return markup
	}

	AddToBulletin(id, msg)																			// ADD MESSAGE TO BULLETIN BOARD
	{
		msg=msg ? msg : $("#co-revText-"+id).val();														// Get text from msg or textbox
			if (msg) app.ws.send(`BB|${app.sced.schedule[id].id}|${app.myId}|${msg}`);					// Send message to server
		$("#co-revText-"+id).val("");																	// Clear input
	}

	SetBulletinMarkup(id, data)																		// SET BULLETIN BOARD MARKUP	
	{
		let i,o,str="";
		for (i=0;i<data.length;++i) {																	// For each message
			o=data[i];
			if (!app.people[o.id])	continue;															// Point at it
			str+=`<p id="co-bullMsg-${id}" style="cursor:pointer" onclick="app.chat.ShowCard(${o.id})">
			<b>${app.people[o.id].firstName} ${app.people[o.id].lastName}: </b>${o.msg}</p>`;			// Add message
			}
		$("#co-bull-"+id).html(str);																	// Return markup	
		$("#co-bull-"+id).scrollTop(10000);																// Scroll to bottom
		return str;																						// Return markup
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
			this.recognition.onend=(e)=> { 																// On end, restore button
				$("[id^=co-talkBut]").each(function() { $(this).prop("src","img/talkbut.png"); })		// For each input
				this.listening=false; 																	// Not listening
				;}	
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

	Listen(id)																						// TURN ON SPEECH RECOGNITIOM
	{
		if (this.listening)	return;																		// Quit if already started
		try { this.recognition.start(); this.listening=true; } catch(e) { trace("Voice error",e) };		// Start recognition
		$("#co-talkBut"+id).prop("src","img/intalkbut.png");											// Talking but
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
