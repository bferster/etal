class Schedule  {																					

	constructor()   																				// CONSTRUCTOR
	{
		this.curFloor=0;																				// Current floor
		this.curEvent=0;																				// Current event
		this.curDay=1;
		this.curUndo=0;																					// Undo counter
		this.undos=[];																					// Holds undos
	}

	EditSchedule(data)																					// MAKE SCHEDULE EDITOR
	{
		let i,o={ day:"0", start:"*", end:"*", bar:"0", floor:"", desc:"", link:"", content:"" };
		if (data) {
			this.curFloor=this.curEvent=0;																	// ResetS
			this.curDay=1;
			app.schedule=data;																				// Set data
			this.curUndo=0;																					// Reset undos
			this.Do();																						// Set 1st undo
			}
		if (!app.schedule.length)	app.schedule.push(o);													// Need day 0
		for (i=0;i<app.schedule.length;++i)																	// For each event
			if (app.schedule[i].day == 0)	o=app.schedule[i];												// Set val if 0
		let str=`<br><div id="scedGrid" style="display:inline-block;overflow:auto;padding-right:12px;
				height:calc(100vh - 190px);max-width:calc(100% - 380px)"></div>
					<div style="display:inline-block;vertical-align:top;padding:12px">
						<table>
							<tr><td colspan="4"><b>Day</b>&nbsp;&nbsp;<select id="scDay" class="co-is" style="width:50px;font-size:13px"></select>
							&nbsp;&nbsp;&nbsp;<b>Floor</b>&nbsp;&nbsp;<select id="scFloor" class="co-is" style="width:50px;font-size:13px"></select>
							&nbsp;&nbsp;&nbsp;&nbsp;<div id="scAddEvent" class="co-bs">Add new event</div></td></tr>
							<tr><td colspan="4"><hr></td></tr>
							<tr><td>Start date&nbsp;</td><td colspan="4"><input type="text" id="scStart" class="co-is" style="width:85px" value="${o.start}">
							&nbsp;&nbsp;&nbsp;End&nbsp;&nbsp;<input type="text" id="scEnd" class="co-is" style="width:85px" value="${o.end}"></td></tr>
							<tr><td>Time zone</td><td colspan=2><input type="text" id="scZone" class="co-is" style="width:85px" value="${o.bar}"></select></td></tr>
						<table>
						<br>
						<div id="scprop"></div>
					</div>
				</div>`;
		$("#scheduleEditor").html(str.replace(/\t|\n|\r/g,""));
		
		$("#scFloor").empty();																				// Clear floor select
		$("#scDay").empty();																				// Clear day select
		for (i=0;i<app.venue.length;++i)	$("#scFloor").append(`<option>${i}</option>`);					// Add floor to select
		for (i=1;i<10;++i)	$("#scDay").append(`<option>${i}</option>`);									// For each day, add to select
		$("#scFloor").prop("selectedIndex",this.curFloor);													// Set floor select	
		$("#scDay").prop("selectedIndex",this.curDay-1);													// Set day

		$("#scFloor").on("change",()=>{																		// ON FLOOR CHANGE
				this.curFloor=$("#scFloor").prop("selectedIndex"); 											// Set floor			
				this.EditSchedule(); 																		// Re-edit
				});	
		$("#scDay").on("change",()=>{																		// ON DAY CHANGE
				this.curDay=$("#scDay").prop("selectedIndex")+1; 											// Set day
				this.EditSchedule(); 																		// Re-edit
				});	
		$("#scStart").on("change",()=>{ this.Do(); o.start=$("#scStart").val(); });							// ON START CHANGE
		$("#scEnd").on("change",()=>  { this.Do(); o.end=$("#scEnd").val(); });								// ON END CHANGE
		$("#scZone").on("change",()=> { this.Do(); o.bar=$("#scZone").val(); });							// ON ZONE CHANGE
		$("#scAddEvent").on("click",()=> {																	// ON ADD EVENT
			let o={ day:this.curDay, start:"*", end:"*", bar:"0", room:"0", floor:this.curFloor, desc:"", link:"", content:"" };
			this.curEvent=app.schedule.length;																// Set new number
			app.schedule.push(o);																			// Add new event
			this.DrawSchedule();																			// Draw schedule grid
			this.ShowEventDetails(this.curEvent);															// Redraw event
			Sound("ding");																					// Ding
			});
		this.DrawSchedule();																					// Draw schedule		
	}

	DrawSchedule()																						// DRAW THE SCHEDULE GRID
	{
		let i,j,x,y,o,s;
		$("#popupDiv").remove();																			// Kill popup
		$("#scprop").html("");																				// Clear details
		let rooms=app.venue[this.curFloor];																	// Point to rooms
		let nr=rooms.length;

		let str=`<div id="co-sgrid" class="co-sgrid">`;														// Add grid
		for (i=0;i<nr;++i) {																				// For each hour
			str+=`<div style="grid-column-start:${i+1};grid-column-end:${i+2};
				grid-row-start:0;grid-row-end:1;text-align:center;">
				<b>${i}<br>${("<br>"+rooms[i].title).replace(/\*/,"")}</b>
			</div>`;								
			}
		for (i=0;i<19;++i) {																				// For each hour
			s=i+6;
			if (s < 10)	s="0"+s;																			// Pad
			str+=`<div class="co-slot" style="grid-column-start:0;grid-column-end:1;width:60px;
				grid-row-start:${i*4};grid-row-end:${i*4+1}">${s}:00</div>`;								
			}
		str+=`</div>`;
		$("#scedGrid").html(str.replace(/\t|\n|\r/g,""));													// Add grid
		$("#co-sgrid").css("grid-template-columns","repeat("+nr+",150px)");									// Columns
	
		for (i=0;i<app.schedule.length;++i) {																// For each event
			if (((app.schedule[i].day == this.curDay) || (app.schedule[i].day == "*")) &&	(app.schedule[i].floor == this.curFloor))	// Today or any day
			this.DrawEvent(i);																				// Draw it
			}
	
		$("[id^=co-ev-]").on("click",(e)=>{																	// ON EVENT CLICK
			if ($("#editorDiv").css("display") == "none") this.ShowEventDetails(e.target.id.substr(6)); 	// Show details if editor is closed
			else										  Sound("delete");									// Error	
			});			
	}

	ShowEventDetails(num)																				// SHOW EVENT DETAILS
	{
		let col="#ccc",title="";
		let o=app.schedule[num];																			// Point at event
		this.curEvent=num;																					// This is the event being edited
		$("[id^=co-ev-]").css("opacity",.33);		$("#co-ev-"+num).css("opacity",.66);					// Hilite current event
		if (o.room && app.venue[this.curFloor][o.room]) {													// A valid room
			if (app.venue[this.curFloor][o.room].rug)	col=app.venue[this.curFloor][o.room].rug;			// Set color
			if (app.venue[this.curFloor][o.room].title && (o.room > 0)) title=app.venue[this.curFloor][o.room].title;	// Set title
			}
		
		let str=`<b>EVENT DETAILS:</b><hr><br><table>
		<tr><td>Day</td><td><input type="text" id="evvDY-${num}" class="co-is" style="width:50px" value="${o.day}"></td></tr>
		<tr><td>Floor</td><td><input type="text" id="evvDF-${num}" class="co-is" style="width:50px"  value="${o.floor}"></td>
		<td>Room</td><td><input type="text" id="evvDR-${num}" class="co-is" style="width:50px"  value="${o.room}"></td></tr>
		<tr><td>Start</td><td><input type="text" id="evvDS-${num}" class="co-is" style="width:50px"  value="${o.start}"></td>
		<td>Duration</td><td><input type="text" id="evvDE-${num}" class="co-is" style="width:50px"  value="${o.end}"></td></tr>
		<tr><td>Link</td><td colspan='3'><input type="text" id="evvDL-${num}" class="co-is" style="width:240px" value="${o.link ? o.link : ""}"></td></tr>
		<tr><td>Desc</td><td colspan='3'><input type="text" id="evvDD-${num}" class="co-is" style="width:240px" value="${o.desc ? o.desc : ""}"></td></tr>
		<tr><td>Coffeebar&nbsp;</td><td><input type="checkbox" id="evvDB-${num}"${o.bar > 0 ? " checked": ""}></td><tr>
		<tr><td colspan="4" style="padding-top:8px;text-align:center"><div id="ev-EditH-${num}" class="co-bs">Edit content HTML</div></td></td></tr>
		<tr><td colspan="4"><div id="scedDetCon" style="background-color:${col};text-align:center;color:#fff;
		width:320px;padding:8px;margin-top:8px">
		${title.charAt(0) != "*" ? title+"<br><br>" : ""}${o.content ? o.content : ""}</div></td></tr>
		<td colspan="4" style="text-align:center"><br><img id="ev-Delete" src="img/deletebut.png" style="width:12px;cursor:pointer"></tr>
		</table>`;
		$("#scprop").html(str.replace(/\t|\n|\r/g,""));

		$("[id^=evvD]").on("change",(e)=>{																	// ON EVENT ITEM CHANGE
			this.Do();																						// Undo
			let t=e.target.id.charAt(4);																	// Get type																
			let id=e.target.id.substr(6);																	// Get id
			if (t == "Y")		o.day=$("#"+e.target.id).val();												// Get vals
			else if (t == "F")	o.floor=$("#"+e.target.id).val();												
			else if (t == "R")	o.room=$("#"+e.target.id).val();												
			else if (t == "S")	o.start=$("#"+e.target.id).val();												
			else if (t == "E")	o.end=$("#"+e.target.id).val();												
			else if (t == "L")	o.link=$("#"+e.target.id).val();												
			else if (t == "D")	o.desc=$("#"+e.target.id).val();												
			else if (t == "B")	o.bar=$("#"+e.target.id).prop("checked") ? "1" : "0";												
			this.DrawSchedule();																			// Redraw schedule grid
			this.ShowEventDetails(this.curEvent);															// Rerdaw event
			});

		$("#ev-Delete").on("click",()=>{																	// ON DELETE EVENT
			ConfirmBox("Are you sure?","",()=>{ 															// Ask if sure
				app.schedule.splice(this.curEvent,1);														// Kill it
				Sound("delete");																			// Delete sound
				this.DrawSchedule();																		// Redraw schedule grid
				});
		});

	$("#scedDetCon").on("dblclick",()=>{	$("#ev-EditH-"+num).trigger("click");	});						// ON DOUBLE-CLICK CONTENT

	$("[id^=ev-EditH-]").on("click",(e)=>{																	// ON EDIT HTML
		let num=e.target.id.substr(9);																		// Get id num
		let rn=app.schedule[num].room;																		// Get room number
		let fn=app.schedule[num].floor;																		// Get floor number
		let r=app.venue[fn][rn];																			// Point at room
		let p=app.venue[fn][0].params;																		// Point at params
		let w=($("body").width()/p.cols)*Math.max(1,Math.abs(r.ce-r.cs));									// Width
		let h=($("body").height()/p.rows)*Math.max(1,Math.abs(r.re-r.rs));									// Height
		$("#editorDiv").show();																				// Show editor
		CKEDITOR.instances.editor1.resize(w,0);																// Set size, less content
		let t=CKEDITOR.instances.editor1.container.$.clientHeight;											// Get toolbar height
		CKEDITOR.instances.editor1.resize(w,h+t);															// Set size
		CKEDITOR.instances.editor1.setData(app.schedule[num].content);										// Set editor
		CKEDITOR.instances.editor1.document.getBody().setStyle("background-color",col);						// Set color
		CKEDITOR.instances.editor1.document.getBody().setStyle("background-color",col);						// Set color
		});
	}

	DrawEvent(num)
	{
		let o=app.schedule[num];																			// Point at event
		let s=timeToMins(o.start)/15-24;																	// Set start
		if (o.start == "*")	s=480/15-24;																	// All day
		else if (o.start == "!") s=1080/15
		let e=s+timeToMins(o.end)/15;																		// End
		if (o.end == "*")	e=s+720/15;																		// All day
		let str=`<div id="co-ev-${num}" style="grid-column-start:${o.room-0+1};grid-column-end:${o.room-0+2};grid-row-start:${s};grid-row-end:${e};
		cursor:pointer;overflow:hidden;font-size:11px;border-radius:8px;
		text-align:center;color:#fff;border:1px solid #999;background-color:#004eff;opacity:.33;padding:6px">
		${o.desc ? o.desc : ""}</div>`;
		$("#co-sgrid").append(str)
	
		$("#co-ev-"+num).draggable({ containment:"parent", grid:[154,12], distance:16, stop:(e,ui)=>{		// ON DRAG EVENT
			if (o.start == "!") return;																		// Not for away events
			this.Do();																						// Undo
			if (ui.originalPosition.left != ui.position.left) 												// Moved room
				o.room=Math.floor(($("#co-ev-"+num).position().left-66)/154);								// Get new room
			if (ui.originalPosition.top != ui.position.top) {												// Moved start
				let s=(Math.floor(($("#co-ev-"+num).position().top-$("#co-sgrid").position().top)/12)+24)*15;// Get new start
				o.start=Math.floor(s/60)+":";																// Set hours
				if (!(s%60)) o.start+="00";																	// No minutes
				else		 o.start+=s%60;																	// Minutes
				}
			this.ShowEventDetails(num);																		// Show
			} 
			});

		function timeToMins(time) {
			if (!time)	return 0;																			// Invalid time
			let mins=time.replace(/\D/g,"");																// Only digits
			if (mins.length < 3) mins+="00";																// Only hour spec'd, add minutes
			if (mins.length < 4) mins="0"+mins;																// Add leading 0 to hours
			return mins.substr(0,2)*60+mins.substr(2,0)*1;													// Get minutes
			}
		}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UNDO
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Do()																						// SAVE DO ACTION
	{
		let i;
		this.undos[this.curUndo]=JSON.parse(JSON.stringify(app.schedule));							// Add to undos
		this.curUndo++;																				// Advance index
		for (i=0;i<this.undos.length-this.curUndo;++i)	this.undos.pop();							// Remove ones beyond this point		
	}

	Undo()																						// UNDO SAVED ACTION
	{
		if (!this.curUndo) {  Sound("delete");	return;	}											// No undos to un-do
		this.curUndo--;																				// Dec index
		app.schedule=JSON.parse(JSON.stringify(this.undos[this.curUndo]));							// Save state
		this.EditSchedule();																		// Redraw
		this.ShowEventDetails(this.curEvent);														// Rerdaw event
		Sound("ding");																				// Acknowledge
	}

	Redo()																						// REDO UNDO ACTION
	{
		let o;
		if (this.curUndo >= this.undos.length) 		return false;									// No redos to re-do
		if (this.curUndo == this.undos.length-1)	o=JSON.parse(JSON.stringify(app.schedule));		// If on last one, redo is current state
		else										o=this.undos[this.curUndo+1];					// Point at saved state and advance index
		this.curUndo++;																				// Inc index
		app.schedule=JSON.parse(JSON.stringify(o));													// Restore venue
		this.EditSchedule();																		// Redraw
		this.ShowEventDetails(this.curEvent);														// Rerdaw event
		Sound("ding");																				// Acknowledge
		return true;																				// Worked
	}


} // Class closure