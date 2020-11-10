class Schedule  {																					

	constructor()   																		// CONSTRUCTOR
	{
		this.meetingStart="";																	// Meeting start
		this.now=0;																				// Now for meeting
		this.schedule=[];																		// Holds schedule
		this.curZoom="";																		// Current zoom link
		this.timeZone="";																		// Time zone
		this.offset=0;																			// Time from start
		this.day=1;																				// Day in conference
	}

	GetDate(time, format="Mon Day, Year")													// GET FORMATTED DATE
	{
		let str;
		let mos=["January","February","March","April","May","June","July","August","September","October","November","December"];
		let d=new Date(time);																	// Get date
		var year=d.getFullYear();																// Get year
		if (format == "Mo/Day/Year") 															// 1/1/2020
			str=(d.getMonth()+1)+"/"+d.getDate()+"/"+year;										// Set it
		else if (format == "Mon Day, Year") 													// Jan 1, 2020
			str=mos[d.getMonth()]+" "+d.getDate()+", "+year;									// Set it
		return str;																				// Return formatted date
	}

	GetTime(time)																			// GET FORMATTED TIME
	{
		time=time.split(":");																	// Hours/minutes
		let t=(time[0] > 12) ? time[0]%12 : time[0];											// Set 12 hour time
		t+=":"+time[1]+" ";																		// Add minutes
		t+=(time[0] >= 12) ? "PM" : "AM";														// AM/PM
		return t;																				// Return time
	}

	GeEventByRoom(floor, room)																// GET EVENT FOR A ROOM
	{
		let i,o;
		for (i=0;i<this.schedule.length;++i) {													// For each event
			o=this.schedule[i];																	// Point at it
			if ((o.room == room) && 															// Room match
				(o.floor == floor) && 															// Floor match
				((o.day == this.day) || (o.day == "*"))) 										// Day match
					return o;																	// Return room event
			}
		return { link:"", content:"", title:"", desc:"", room:room };							// Return null event
	}

	CheckSchedule()																			// CHECK FOR SCHEDULE ACTIONS
	{
		let today=new Date().getDate()+50;													 	// Get today in days												
		this.day=today-(this.meetingStart.getDate()+49);										// Days into meeting
		app.DrawVenue();																		// Redraw venue
	}

	GoToRoom(floor, room)																	// ENTER A ROOM DIRECTLY
	{
		app.CloseAll(3);																		// Close video windows
		if (floor != app.curFloor) {															// If a different floor
			app.curFloor=floor-0;																// Get floor index
			app.DrawVenue();																	// Draw new floor
			}
		app.OnMeMove(app.bx/2,app.by/2,"co-Rm-"+room);											// Join room	
		app.ArrangePeople();																	// Reaarange the people
	}

	ShowSchedule()																			// SHOW EVENT SCHEDULE
	{
		let i,j,s,sc;
		let str=`<div id="co-sched" class="co-sched" style=";
			left:${$(app.vr).offset().left}px;top:0;
			width:${$(app.vr).width()-48}px; height:${$(app.vr).height()-48}px">
			<span style="font-size:18px">EVENT SCHEDULE</span>
			<img style="float:right;cursor:pointer" src="img/closedot.png" onclick="$('#co-sched').remove()"><br><br>
			<div style="height:calc(100% - 48px);width:100%;overflow-y:auto;text-align:left">`;
		let days=[];
		for (i=0;i<this.schedule.length;++i) {														// For each event
			sc=this.schedule[i];																	// Point at schedule
			sc.stn=sc.start.split(":")[0]*60+(sc.start.split(":")[1]-1);							// As minutes
			if (days[sc.day] == undefined) 				days[sc.day]=[];							// A new day													
			if (sc.desc && (sc.desc.charAt(0) != "*"))	days[sc.day].push(sc);						// Add event to day		
			}
		for (j in days) {																			// For each day
			if (!days[j].length)	continue;														// Skip if no events
			if (j-0 < (this.day-0))	continue;														// Start on today
			days[j].sort((a,b)=>{ return (a.stn > b.stn) ? 1 : -1 });								// Sort by minutes
			if ((j == "*") && (days[j].length)) 													// No date and some takers
				str+=`<div style="background-color:#5b66cb;width:calc(100% - 8px);padding:4px;color:#fff;text-align:center">Open all day</div><br>`
			else str+=`<div style="background-color:#5b66cb;width:calc(100% - 8px);padding:4px;color:#fff;text-align:center">
			${this.GetDate(this.meetingStart.getTime()+((j-1)*24*60*60*1000))}${this.timeZone ? " - "+this.timeZone : ""}</div>`;
			str+="<table style='width:100%'>";														// Add table of events
			s="";
			for (i=0;i<days[j].length;++i) {														// For each event that day
				sc=days[j][i];																		// Point at day's event
				if (sc.day != j)				continue;											// Not this day
				if (!sc.desc)					continue;											// No text
				if (sc.desc.charAt(0) == "*")	continue;											// Hidden text text
				if ((sc.stn != s) && (j != "*")) {													// New timeslot
					str+=`<tr><td colspan='3'><b>${this.GetTime(sc.start)}</b></td></tr>`;  		// Add time
					s=sc.stn;																		// Now is then
					}
				str+=`<tr style="vertical-align:top;cursor:pointer">`
				if (j != "*") str+=`<td style="width:30px">&nbsp;&nbsp;<input type="checkbox" id="co-Sc-${i}" ${sc.going ? " checked" : ""}></td>`;
				str+=`<td onclick="app.sced.GoToRoom(${sc.floor},${sc.room})" style="cursor:pointer">${sc.desc}</td>
				<td onclick="app.sced.GoToRoom(${sc.floor},${sc.room})"
				style="text-align:right;cursor:pointer;font-weight:bold;color:${app.venue[sc.floor][sc.room].rug}">${app.venue[sc.floor][sc.room].title}</td></tr>`;
				}
			str+="</table><br>";																	// Close table
			}
		str+="</div></div>";
		$("body").append(str.replace(/\t|\n|\r/g,""));												// Add schedule
		
		$("#co-sched").show("slide",{ direction:"down" });											// Slide up
		$("[id^=co-Sc-]").on("click", (e)=>{ 														// ON CHECK CLICK
			let id=e.currentTarget.id.substr(6);													// Get id
			this.schedule[id].going=$("#"+e.currentTarget.id).prop("checked");						// Store checked status
			}); 			
	}

	ShowAttendees()																				// SHOW THE ATTENDEES
	{
		let i,selects=[];
		app.chat.curChat=-1;																		// Not chatting with anyone
		let x=$("#co-attendees").offset().left-133;													// Left
		let y=$("#co-attendees").offset().top-50-app.by/2											// Top
		let str=`<div id="co-people" class="co-people" style="left:${x}px;top:${y}px;background-color:#eee">
			<img style="float:right;cursor:pointer;margin-top:5px" src="img/closedot.png" onclick="$('#co-people').remove()">
			<div style='text-align:center;font-size:18px'><b>Attendees</b></div><br>
			<div id="co-spp"style="overflow-x:hidden;overflow-y:auto;height:calc(100% - 140px);margin-bottom:12px;background-color:#fff;border:1px solid #999">
			</div><table>
			<tr><td>Sort by </td><td><select class="co-is" id="co-sps" style="width:148px">
			<option>None</option><option>Name</option><option>Organization</option></select></td></tr>
			<tr><td>In </td><td><select class="co-is" id="co-spr" style="width:148px"></select></td></tr>	
			<tr><td>Find </td><td><input class="co-is" id="co-spf" style="width:130px;height:21px;" placeholder="Type here"></td></tr></table>`;
		$("body").append(str.replace(/\t|\n|\r/g,""));
		$("#co-spr").append("<option>Any area</option><option>Hallway");
		fillPeople();
		
		for (i=1;i<app.venue[app.curFloor].length;++i)	$("#co-spr").append("<option>"+app.venue[app.curFloor][i].title+"</option>");
		
		$("#co-spr").on("change",()=>{ fillPeople() });
		$("#co-sps").on("change",()=>{ fillPeople() });
		$("#co-spf").on("change",()=>{ fillPeople() });

		function fillPeople() {																// FILL PEOPLE TABLE
			let i,o,r,s,str="<br>"
			selects=[];																			// Start fresh
			let room=$("#co-spr").prop("selectedIndex");										// Get room index
			let sort=$("#co-sps").prop("selectedIndex");										// Sort
			let find=$("#co-spf").val();														// Search term
			for (i=0;i<app.people.length;++i) {													// For each person
				o=app.people[i];																// Point at person											
				if (o.stats == "Q")	continue;													// Skip quiet people
				if (find) {																		// Filtering by search
					r=RegExp(find,"i");															// Turn into regex
					s=o.firstName+o.org+o.title+o.ints;											// Search all fields															
					if (!s.match(r)) continue;													// Skip if not a match
					}	
				if (room) {																		// If filtering by room
					if ((room == 1) && (o.stats != "A"))				continue;				// Only active people in hallway
					else if ((room > 1) && ("R"+(room-1) != o.stats))	continue;				// Show only people in the room
					}
				selects.push({index:i, org:o.org, name:o.lastName });							// Add to selects
				}
			if (sort == 1)		selects.sort((a,b)=>{ return (a.name > b.name) ? 1 : -1 });		// Sort by name
			else if (sort == 2)	selects.sort((a,b)=>{ return (a.org > b.org) ? 1 : -1 });		// Sort by org

			for (i=0;i<selects.length;++i) {													// For each selected person
				let o=app.people[selects[i].index];												// Point at person
				str+=`<div style="vertical-align:top"><div style="float:left;text-align:left;width:100%">
				<div style="float:left;width:40px;height:40px;overflow:hidden;border-radius:64px;margin:0 8px 16px 4px;border:1px solid #999">
				<img id="co-spi-${selects[i].index}" style="cursor:pointer;width:40px;" 
				src="${o.pic}"></div>
				<b>${o.firstName ? o.firstName : ""} ${o.lastName ? o.lastName : ""}</b>
				<br>${o.title ? o.title : "" }<br>${o.org ? o.org: ""}</div></div>`;
				}
			$("#co-spp").html(str);																// Add to listing
			$("[id^=co-spi-]").on("click",(e)=>{												// ON PIC CLICK
				let id=e.target.id.substr(7)-0;													// Get index
				app.chat.ShowCard(id);															// Show card
				});
			}
	}

	ShowLink(link)																				// SHOW LINK
	{
		if (link.charAt(0) != "*") 	app.CloseAll(3)													// If not a link open dialogs video/iframes
		$("#co-videoBar").remove();																	// Remove video bar
		if (link && link.match(/zoom/i)) {															// If Zoom
			this.curZoom=link;																		// Save link
			window.onfocus=()=>{ 																	// If main is back in focus
				let str=`<div id="co-videoBar" class="co-alert" 
				style="left:${app.bx/4+16}px;width:${app.bx/2-24}px;background-color:#5b66cb">
				Click here to return to last Zoom room</div>`;
				$("body").append(str.replace(/\t|\n|\r/g,""));										// Add return bar
				app.GoToCenter();																	// Got to center of hall
				$("#co-videoBar").on("click",()=>{
					let myWin=window.open(link,"_blank","scrollbars=no,toolbar=no,status=no,menubar=no");	// Open zoom link
					setTimeout(function(){ myWin.close(); },10000);									// Close after 10 secs
					});						
				}
			window.onblur=()=>{ $("#co-videoBar").remove();	}										// If main is out, remove bar
			let myWin=window.open(link,"_blank","scrollbars=no,toolbar=no,status=no,menubar=no");	// Open zoom link
			setTimeout(function(){ myWin.close(); },10000);											// Close after 10 secs
			}
		else{																						// Use iframe
			if (link && link.match(/zapp/i) && isMobile) {											// If zoom mobile
				let str="zoomus://zoom.us/join?confno="+link.split("?")[1];							// Make mobile url
				this.ShowLink(str);																	// Open with native app							
				return;																				// Quit
				}
			if (link.charAt(0) == "*") {															// Show a web page
				window.open(link.substr(1),"_blank");												// Open in new tab
				return;																				// Quit
				}
			if (link && link.match(/zapp/i)) link+="&"+app.KZ										// If zoom app, add k
			let str=`<div id="co-iframe" class="co-card"' style="margin:0;padding:0;box-shadow:none;
			left:${$(app.vr).offset().left}px;top:${$(app.vr).offset().top}px;
			width:${$(app.vr).width()}px; height:${($(app.vr).width())*.5625}px">
			<div style="position:absolute;top:4px; left:calc(100% - 24px);background-color:#fff;width:18px;height:18px;border-radius:180px">
			<img id="co-ifc" style="cursor:pointer;padding:1px 0 0 0" src="img/closedot.png"></div>
			<iframe id="co-iframeFrame" style="width:100%;height:100%" src="${link}" allow=camera;microphone;autoplay frameborder="0" allowfullscreen></iframe>`;
			$("body").append(str.replace(/\t|\n|\r/g,""));											// Add it
			
			$("#co-ifc").on("click", ()=>{															// ON CLOSE BUT
				$("#co-iframe").remove();															// Close window
				app.GoToCenter();																	// Go to center
				});	
			}
	}

} // Class closure