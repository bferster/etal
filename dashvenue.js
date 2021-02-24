class Venue {																					

	constructor()   																				// CONSTRUCTOR
	{
		this.curRoom=0;																					// Current room
		this.curFloor=0;																				// Current floor
		this.curUndo=0;																					// Undo counter
		this.undos=[];																					// Holds undos
	}

	EditVenue(data)																						// MAKE VENUE EDITOR
	{
		let i;
		if (data) {																							// If new data
			this.curFloor=this.curFloor=0;																	// Start fresh							
			app.venue=[];																					// Fresh array
			data.sort((a,b)=>{ return (a.floor-0 > b.floor-0) ? 1 : -1 });									// Sort by floor
			for (i=0;i<data.length;++i) {																	// For each room
				if (!app.venue[data[i].floor])	app.venue[data[i].floor]=[];								// Create new array if empty
				app.venue[data[i].floor].push(data[i]);														// Add room to floor
				}	
			for (i=0;i<app.venue.length;++i) 																// For each floor
				if (app.venue[i])	
					app.venue[i].sort((a,b)=>{ return (a.room-0 > b.room-0) ? 1 : -1 });						// Sort by room
			this.curUndo=0;																					// Reset undos
			this.Do();																						// Set 1st undo
			}
		if (!app.venue[0]) app.venue[this.curFloor]=[];														// Add floor														
		if (!app.venue[this.curFloor][0]) 		 app.venue[this.curFloor][0]={ title:"*Hallway", rug:"#ccc", cs:1, ce:2, rs:1, re:2,room:0, floor:0 };	// Init if blank
		if (!app.venue[this.curFloor][0].params) app.venue[this.curFloor][0].params={ rows:4, cols:4, gap:0, avSize:36 };	// Init if blank
		let d=app.venue[this.curFloor][0].params;
		let r=app.venue[this.curFloor][this.curRoom];
		let str=`<div style="margin-top:12px">
			<datalist id="palette">
			<option value="#ffffff"><option value="#cccccc"><option value="#999999"/><option value="#666666"><option value="#000000"/>
		    <option value="#d8c4ae"><option value="#a2733f"/><option value="#cc4c39"/><option value="#58aab4"/><option value="#5b66cb"/>
			<option value="#6e9456"/><option value="#ba57ad"/>
			${localStorage.getItem("palette-"+app.meetingId)}</datalist>										
			<div class="co-venue">
				<table>
				<tr style="vertical-align:4px"><td><b>CURRENT&nbsp;FLOOR&nbsp;</b><br><br></td><td><select id="evFloor" class="co-is" style="width:110px;font-size:13px"></select></td></tr>
				<tr><td>Background color</td><td><input class='co-is' style='width:70px' type='text' id='ev-bcol' value='${(d.bcol ? d.bcol : "#ffffff")}'>
				<div id='ev-bcolc' class='co-colChip' style='background-color:${(d.bcol ?d.bcol : "#ffffff")}'></td></tr>	
				<tr><td>Number columns&nbsp; </td><td><input class='co-is' type='text' id='ev-cols' value='${(d.cols ? d.cols : 10)}'></td></tr>	
				<tr><td>Number rows</td><td><input class='co-is' type='text' id='ev-rows' value='${(d.rows ? d.rows : 3)}'></td></tr>	
				<tr><td>Grid gap</td><td><input class='co-is' type='text' id='ev-gap' value='${(d.gap ? d.gap : 0)}'></td></tr>	
				<tr><td>Avatar size</td><td><input class='co-is' type='text' id='ev-avs' value='${(d.avSize ? d.avSize : 36)}'></td></tr>	
				<tr><td>Video room</td><td><select id="evVideo" class="co-is" style="width:110px"></select></td></tr>
				<tr><td>Templates</td><td><select id="evTemp" class="co-is" style="width:110px">
				<option>Choose</option><option>Load public</option><option>Load local CSV</option><option>Save local CSV</option></select></td></tr>
				<tr><td colspan='2'>&nbsp;</td></tr>	
				<tr><td><div id='evAddFloor' class='co-bs'>Add floor</div></td><td><img id='evDelFloor' src='img/deletebut2.png' style='float:right;cursor:pointer'></td></tr>	
				<tr><td colspan='2'><br><hr><br></td></tr>	
				<tr style="vertical-align:4px"><td><b>CURRENT ROOM</b><br><br></td><td><select id="evRoom" class="co-is" style="width:110px;font-size:13px"></select></td></tr>
				<tr><td>Room color</td><td><input class='co-is' style='width:70px' type='text' id='ev-rug' value='${(r.rug ? r.rug : "#ffffff")}'>
				<div id='ev-rugc' class='co-colChip' style='background-color:${(r.rug ? r.rug : "#ffffff")}'></td></tr>	
				<tr><td>Room title</td><td><input class='co-is' type='text' id='ev-title' value='${(r.title ? r.title : "")}'></td></tr>	
				<tr><td>Room CSS</td><td><textArea class='co-is' type='text' id='ev-css'>${(r.css ? r.css : "")}</textArea></td></tr>	
				<tr><td>Portal</td><td><input class='co-is' type='text' id='ev-por' value='${(r.portal ? r.portal : "")}'></td></tr>	
				<tr><td>Room number</td><td><input class='co-is' type='text' id='ev-room' value='${r.room}'></td></tr>	
				<tr><td colspan='2'>&nbsp;</td></tr>	
				<tr><td><div id='evAddRoom' class='co-bs'>Add room</div></td><td><img id='evDelRoom' src='img/deletebut2.png' style='float:right;cursor:pointer'></td></tr>	
				</table>
			
		</div>
		<div id="gridHolder" style="display:inline-block;width:calc(100% - 288px)"></div></div>`;
		$("#venueEditor").html(str.replace(/\t|\n|\r/g,""));
		d.bcol=$("#ev-bcol").val();																			// Bg color
		d.cols=$("#ev-cols").val();																			// Get columns value
		d.rows=$("#ev-rows").val();																			// Rows
		d.gap=$("#ev-gap").val();																			// Gap
		d.avSize=$("#ev-avs").val();																		// Avatar size 
		r.portal=$("#ev-por").val();																		// Portal
		r.rug=$("#ev-rug").val();																			// Room rug
		r.room=$("#ev-room").val();																			// Room number
		r.css=$("#ev-css").val();																			// Room style
		r.title=$("#ev-title").val();																		// Room title
		this.DrawVenue();																					// Draw venue grid

		$("#ev-rug").on("change",()=>{  $("#ev-rugc").css("background-color",$("#ev-rug").val()) });		// Chip follows color field
		$("#ev-bcol").on("change",()=>{ $("#ev-bcolc").css("background-color",$("#ev-bcol").val()) });		// Field
		$("#ev-rugc").on("click",()=>{  ColorPicker("#ev-rug") });											// Advanced color
		$("#ev-bcolc").on("click",()=>{ ColorPicker("#ev-bcol") });											// Advanced 

		$("#evAddRoom").on("click",()=>{																	// ON ADD ROOM
			this.Do();																						// Set do 
			this.curRoom=app.venue[this.curFloor].length;													// Set new current room
			let o={ cs:1, ce:2, rs:1, re:2, rug:"#cccccc", title:"Change!", floor: this.curFloor, room:this.curRoom };
			app.venue[this.curFloor].push(o);																// Add room
			Sound("ding");																					// Ding
			this.EditVenue();																				// Redraw
			});
		$("#evAddFloor").on("click",()=>{																	// ON ADD FLOOR
			this.Do();																						// Set do 
			this.curFloor=app.venue.length;																	// Set new current floor
			let o=[{ cs:1, ce:2, rs:1, re:2, rug:"#cccccc", title:"*Hallway", floor: this.curFloor, room:0, params:{ rows:4, cols:4, gap:0 } }];
			app.venue.push(o);																				// Add floor
			Sound("ding");																					// Ding
			this.EditVenue();																				// Redraw
			});
		$("#evDelRoom").on("click",()=>{																	// ON DELETE ROOM
			this.Do();																						// Set do 
			if (!this.curRoom)	PopUp("You can't delete the hallway!");										// Warn
			else				ConfirmBox("Are you sure?","",()=>{ 										// Ask if sure
												app.venue[this.curFloor].splice(this.curRoom,1);			// Kill room
												Sound("delete");											// Delete sound
												this.curRoom=0;												// Room to 0
												this.EditVenue();											// Redraw
												});
			});
		$("#evDelFloor").on("click",()=>{																	// ON DELETE ROOM
			this.Do();																						// Set do 
			if (!this.curFloor)	PopUp("You can't delete the first floor!");									// Warn
			else				ConfirmBox("Are you sure?","",()=>{ 										// Ask if sure
												app.venue.splice(this.curFloor,1);							// Kill floor
												Sound("delete");											// Delete sound
												this.curRoom=0;												// Room to 0
												this.curFloor=0;											// Floor to 0
												this.EditVenue();											// Redraw
												});
			});
		$("#evFloor").on("change",()=>{	this.curFloor=$("#evFloor").prop("selectedIndex"); 					// On floor change
												this.curRoom=0;												// Room to 0
												this.EditVenue(); 
												$("#evVideo").prop("selectedIndex",0);
												$("#evRoom").prop("selectedIndex",0)
												});	
		$("#co-tempFile").on("change",(e)=>{ 																// ON FILEREAD
			ReadFile(e,"floor","venue")																		// Read file
			$("#co-tempFile").val("");																		// Keep from triggering twice
			});								
		$("#evRoom").on("change",()=>{	d.room=this.curRoom=$("#evRoom").prop("selectedIndex"); this.EditVenue();}) // On room change
		$("#evTemp").on("change",()=>{																		// ON TEMPLATE PICK
			let opt=$("#evTemp").prop("selectedIndex");														// Get option
			let fields=["floor","room","rug","title","rs","ce","cs","re","params","portal","css"];			// Fields
			if (opt == 2) 	$("#co-tempFile").trigger("click");												// From local CSV file
			else if (opt == 3) {																			// If save to local CSV
				let d=JSON.parse(JSON.stringify(app.venue[this.curFloor]));									// Clone floor
				if (d[0].params) d[0].params=JSON.stringify(d[0].params);									// Stringify params object
				let str=Papa.unparse(d,{ header:true, skipEmptyLines:true, columns:fields });				// Make CSV using lib
				SaveTextAsFile("*"+this.curFloor+"-"+app.meetingId+"-vTemp.csv",str);						// Save csv																	// Write file	
				}
			$("#evTemp").prop("selectedIndex","Choose");													// Clear select
			this.EditVenue();																				// Draw venue grid
			})
		$("#evVideo").on("change",()=>{	d.vRoom=$("#evVideo").prop("selectedIndex"); this.EditVenue(); })	// On room change
		$("[id^=ev-]").on("change",(e)=>{																	// On param change
			this.Do();																						// Set do 
			d.bcol=$("#ev-bcol").val();																		// Background color
			d.cols=$("#ev-cols").val();																		// Get columns value
			d.rows=$("#ev-rows").val();																		// Rows
			d.gap=$("#ev-gap").val();																		// Gap
			d.avSize=$("#ev-avs").val();																	// Avatar size
			r.portal=$("#ev-por").val();																	// Portal
			r.rug=$("#ev-rug").val();																		// Room rug
			r.room=$("#ev-room").val();																		// Room number
			r.css=$("#ev-css").val();																		// Room style
			r.title=$("#ev-title").val();																	// Room title
			this.DrawVenue();																				// Draw venue grid
			});
	}	
	
	DrawVenue()																							// DRAW THE VENUE GRID
	{
		let i,j,x,y,o,s;
		let d=app.venue[this.curFloor][0].params;
		$("#popupDiv").remove();																			// Kill popup
		$("#evRoom").empty();																				// Clear room select
		$("#evFloor").empty();																				// Clear floor select
		$("#evVideo").empty();																				// Clear floor select
		for (i=0;i<app.venue.length;++i)																	// For each floor
			$("#evFloor").append(`<option>${i}</option>`);													// Add to select
		for (i=0;i<app.venue[this.curFloor].length;++i) {													// For each title
			s=app.venue[this.curFloor][i].title;															// Get title
			$("#evVideo").append(`<option>${app.venue[this.curFloor][i].room+". "+s}</option>`);			// Add to select
			}
		for (i=0;i<app.venue[this.curFloor].length;++i) {													// For each title
			s=app.venue[this.curFloor][i].title;															// Get title
			$("#evRoom").append(`<option>${app.venue[this.curFloor][i].room+". "+s}</option>`);				// Add to select
			}
		$("#evFloor").prop("selectedIndex",this.curFloor);													// Set floor select	
		$("#evRoom").prop("selectedIndex",this.curRoom);													// Room	
		$("#evVideo").prop("selectedIndex",d.vRoom);														// Video room
		let str=`<div id="co-grid" class="co-grid">`;														// Add grid
		for (i=1;i<=d.rows;++i)																				// For each row
				for (j=1;j<=d.cols;++j)																		// For each col
					str+=`<div id="co-r${j}-${i}" class="co-room"><br>${i}-${j}</div>`;						// Add div
		str+=`</div>`;
		$("#gridHolder").html(str.replace(/\t|\n|\r/g,""));													// Add grid
		$("#co-grid").css("grid-template-columns","repeat("+d.cols+", 1fr)");								// Columns
		$("#co-grid").css("grid-gap",d.gap+"px");															// Gap
		$("#co-grid").css("background-color",d.bcol);														// Bg color

		for (i=0;i<app.venue[this.curFloor].length;++i) {													// For each room
			o=app.venue[this.curFloor][i];																	// Point at it
			o.cs=o.cs-0; o.rs=o.rs-0; o.rs=o.rs-0; o.re=o.re-0;												// Ints
			if (o.rs == o.re) o.re++;																		// Expand to at least 1 cell
			if (o.cs == o.ce) o.ce++;																		// Expand
			for (y=o.cs;y<o.ce;++y)																			// For each column
				for (x=o.rs;x<o.re;++x)																		// For each row
					$(`#co-r${y}-${x}`).css("background-color",o.rug);										// Set color
			}
	
		$("[id^=co-r]").on("click",(e)=>{																	// ON ROOM CLICK
			let v=e.currentTarget.id.substr(4).split("-");													// Get col/row
			for (i=0;i<app.venue[this.curFloor].length;++i) {												// For each room
				o=app.venue[this.curFloor][i];																// Point at it
				if ((v[0]-0 >= o.cs-0) && (v[0]-0 < o.ce-0) && (v[1]-0 >= o.rs-0) && (v[1]-0 < o.re-0)) {	// In room
					this.curRoom=i;																			// Set room
					this.EditVenue();																		// Redraw
					break;
					}												
				}
			});
		
		this.DrawRoom();																					// Draw room overlay																	
	}

	DrawRoom()
	{
		let r=app.venue[this.curFloor][this.curRoom];														// Get room
		let p=app.venue[this.curFloor][0].params;															// Get params						
		let gap=p.gap-0;																					// Get gap							
		if (r.rs == r.re) r.re++;																			// Expand to at least 1 cell
		if (r.cs == r.ce) r.ce++;																			// Expand
		$("#popupDiv").remove();																			// Kill popup

		let l=290;
		let t=$("#co-tab").position().top+24;
		let cw=$("#co-r1-1").width()+gap-0+2;
		let ch=$("#co-r1-1").height()+gap-0+2;
		let x=l+(r.cs-1)*cw;
		let y=t+(r.rs-1)*ch;
		let w=cw*(r.ce-r.cs)-gap-3;
		let h=ch*(r.re-r.rs)-gap-4;
		let str=`<div id="co-room" style="text-align:center;color:#fff;border:2px dashed #000;position:absolute;cursor:pointer;background-color:${r.rug};
		left:${x}px;top:${y}px;width:${w}px;height:${h}px;${r.css ? r.css : ""}"></div>`
		$("#gridHolder").append(str)
		$("#co-room").html(r.room+". "+r.title);
		$("#co-room").draggable({	stop:()=>{ setPos(); }, 
								  	containment:[ l,t+46,8000,8000],
									grid: [ cw, ch ]
		 							});
		$("#co-room").resizable({ stop:()=>{ setPos(); }});
	
		function setPos()
		{
			app.ven.Do();
			let x1=$("#co-room").offset().left-l;
			let x2=x1+$("#co-room").width()+gap;
			r.cs=Math.max(1,Math.min(Math.floor(x1/cw+1),p.cols-0+1));
			r.ce=Math.max(1,Math.min(Math.floor(x2/cw+1),p.cols-0+1));
			let y1=$("#co-room").offset().top-t-24;
			let y2=y1+$("#co-room").height()+gap;
			r.rs=Math.max(1,Math.min(Math.floor(y1/ch+1),p.rows-0+1));
			r.re=Math.max(1,Math.min(Math.floor(y2/ch+1),p.rows-0+1));
			app.ven.DrawVenue();
		}
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UNDO
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Do()																						// SAVE DO ACTION
	{
		let i;
		this.undos[this.curUndo]=JSON.parse(JSON.stringify(app.venue));								// Add to undos
		this.curUndo++;																				// Advance index
		for (i=0;i<this.undos.length-this.curUndo;++i)	this.undos.pop();							// Remove ones beyond this point		
	}

	Undo()																						// UNDO SAVED ACTION
	{
		if (!this.curUndo) {  Sound("delete");	return;	}											// No undos to un-do
		this.curUndo--;																				// Dec index
		app.venue=JSON.parse(JSON.stringify(this.undos[this.curUndo]));								// Save state
		this.EditVenue();																			// Redraw
		Sound("ding");																				// Acknowledge
	}

	Redo()																						// REDO UNDO ACTION
	{
		let o;
		if (this.curUndo >= this.undos.length) 		return false;									// No redos to re-do
		if (this.curUndo == this.undos.length-1)	o=JSON.parse(JSON.stringify(app.venue));		// If on last one, redo is current state
		else										o=this.undos[this.curUndo+1];					// Point at saved state and advance index
		this.curUndo++;																				// Inc index
		app.venue=JSON.parse(JSON.stringify(o));													// Restore venue
		this.EditVenue();																			// Redraw
		Sound("ding");																				// Acknowledge
		return true;																				// Worked
	}

} // Class closure