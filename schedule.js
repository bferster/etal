class Schedule  {																					

	constructor()   																		// CONSTRUCTOR
	{
		this.meetingStart="";																	// Meeting start
		this.schedule=[];																		// Holds schedule
		this.curZoom="";																		// Current zoom link
		this.timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g," ");		// Time zone													// Time zone
		this.day=1;																				// Day in conference
		this.mins=0;																			// Minutes in conference
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

	GetTime(time)																			// GET FORMATTED LOCAL TIME
	{
		time-=new Date().getTimezoneOffset();													// UTC to local time
		let t=Math.floor((time/60))%12+":";														// Get hours
		if (time%60 < 10)	t+="0";																// Add leading 0
		t+=time%60;																				// Add minutes
		t+=(time/60 >= 12) ? " PM" : " AM";														// AM/PM
		return t;																				// Return time
	}

	TimeToMins(time, offset)																// CONVERT TIME TO MINUTES
	{
		if (!time || (time == "*"))	 return "*";												// Wild card
		let mins=time.replace(/\D/g,"");														// Only digits
		if (mins.length < 3) mins+="00";														// Only hour spec'd, add minutes
		if (mins.length < 4) mins="0"+mins;														// Add leading 0 to hours
		return (mins.substr(0,2)*60)+(mins.substr(2)*1)+(offset-0);								// Get minutes
	}

	GetEventByRoom(floor, room)																// GET EVENT FOR A ROOM
	{
		let i,o;
		let awayId=app.venue[floor][room].away;													// Get away id, if any
		if (awayId)	{																			// If an away override
			for (i=0;i<this.schedule.length;++i)												// For each event
				if (this.schedule[i].id == awayId) 												// A match
					return this.schedule[i]														// Return away event
			}
		for (i=0;i<this.schedule.length;++i) {													// For each event
			o=this.schedule[i];																	// Point at it
			if ((o.room == room) && 															// Room match
				(o.floor == floor) && 															// Floor match
				((o.day == this.day) || (o.day == "*")) && 										// Day match
				((this.mins < (o.start-0+o.end-0) && (this.mins >= o.start)) || (o.start == "*"))) // Time match
					return o;																	// Return room event
			}
		return { link:"", content:"", title:"", desc:"", room:room };							// Return null event
	}

	CheckSchedule()																			// CHECK FOR SCHEDULE ACTIONS
	{
		let i,sc,str="";	
		let today=new Date();																	// Get today
		this.day=(today.getDate()+50)-(this.meetingStart.getDate()+49);							// Days into meeting
		this.mins=(today.getUTCHours()*60)+(today.getUTCMinutes()*1)+1;							// Get UTC time in minutes
		for (i=0;i<app.venue[app.curFloor].length;++i) {										// For each room
			sc=this.GetEventByRoom(app.curFloor,i);												// Point at event
			if (sc.link && sc.link.match(/gallery:https:/i)) this.GetGalleryData(sc)			// If from a doc, update it
			str+=sc.link+sc.content;															// Make content hash
			}
		if (app.curContent !== str)	app.DrawVenue();											// Redraw venue
	}

	GoToRoom(floor, room)																		// ENTER A ROOM DIRECTLY
	{
		app.CloseAll(3);																			// Close video windows
		if (floor != app.curFloor) {																// If a different floor
			app.curFloor=floor-0;																	// Get floor index
			app.DrawVenue();																		// Draw new floor
			}
		app.OnMeMove(app.bx/2,app.by/2,"co-Rm-"+room);												// Join room	
		app.ArrangePeople();																		// Reaarange the people
	}

	ShowSchedule()																				// SHOW EVENT SCHEDULE
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
			if (days[sc.day] == undefined) 				days[sc.day]=[];							// A new day													
			if (sc.desc && (sc.desc.charAt(0) != "*"))	days[sc.day].push(sc);						// Add event to day		
			}
		for (j in days) {																			// For each day
			if (!days[j].length)	continue;														// Skip if no events
			if (j-0 < (this.day-0))	continue;														// Start on today
			days[j].sort((a,b)=>{ return (a.start > b.start) ? 1 : -1 });							// Sort by minutes
			if ((j == "*") && (days[j].length)) 													// No date and some takers
				str+=`<div style="background-color:#5b66cb;width:calc(100% - 8px);padding:4px;color:#fff;text-align:center">Open all day</div><br>`
			else str+=`<div style="background-color:#5b66cb;width:calc(100% - 8px);padding:4px;color:#fff;text-align:center">
			${this.GetDate(this.meetingStart.getTime()+((j-1)*24*60*60*1000))}${this.timeZone ? " - "+this.timeZone : ""}</div>`;
			str+="<table style='width:100%;margin-top:12px'>";										// Add table of events
			s="";
			for (i=0;i<days[j].length;++i) {														// For each event that day
				sc=days[j][i];																		// Point at day's event
				if (sc.day != j)				continue;											// Not this day
				if (!sc.desc)					continue;											// No text
				if (sc.desc.charAt(0) == "*")	continue;											// Hidden text text
				if ((sc.start != s) && (sc.start != "*") && (j != "*")) {							// New timeslot
					str+=`<tr><td colspan='3'><b>${this.GetTime(sc.start)}</b></td></tr>`;  		// Add time
					s=sc.start;																		// Now is then
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
		let x=$("#co-attendees").offset().left-260;													// Left
		x=Math.min(x,app.bx-222);																	// Cap to screen
		let y=$("#co-attendees").offset().top-40-app.by/2											// Top
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
		$("#co-spr").append("<option>Any area</option><option>Hallway</option><option>Coffee bar</option>");
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
					else if ((room == 2) && (o.stats != "B0-0"))		continue;				// Only active people in main coffee bat
					else if ((room > 2) && ("R"+(room-2) != o.stats))	continue;				// Show only people in the room
					}
				selects.push({index:i, org:o.org, name:o.lastName });							// Add to selects
				}
			if (sort == 1)		selects.sort((a,b)=>{ return (a.name > b.name) ? 1 : -1 });		// Sort by name
			else if (sort == 2)	selects.sort((a,b)=>{ return (a.org > b.org) ? 1 : -1 });		// Sort by org

			for (i=0;i<selects.length;++i) {													// For each selected person
				let o=app.people[selects[i].index];												// Point at person
				str+=`<div style="vertical-align:top"><div style="float:left;text-align:left;width:100%">
				<div style="float:left;width:40px;height:40px;overflow:hidden;border-radius:64px;margin:0 8px 16px 4px;border:1px solid #999">
				<img id="co-spi-${selects[i].index}" style="cursor:pointer;width:40px;min-height:40px" 
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

	ShowLink(link, center)																		// SHOW LINK
	{
		if (!link) return;
		if (link.match(/^gallery/i))  return;														// Skip gallery links
		if (link.match(/^bulletin/i)) return;														// Skip bulletin board links
		if (link.match(/^chalk/i)) return;															// Skip chalkboard links
		if (link.charAt(0) != "*") 	app.CloseAll(3)													// If not a link open dialogs video/iframes
		if (center) app.GoToCenter();																// Move to center?
		let pad=0,h=$(app.vr).width()*.5625;														// Assume 16x9 and no padding

		if (link.match(/https:..zoom|zoomus:/i)) {													// If Zoom
			app.curZoom=link;																		// Save link
			let myWin=window.open(link,"_blank","scrollbars=no,toolbar=no,status=no,menubar=no");	// Open zoom link
			setTimeout(function(){ myWin.close(); },10000);											// Close after 10 secs
			}
		else{																						// Use iframe
			if (link.match(/zapp/i)) {																// An embedded zoom link
				let str="";
				let ua=window.navigator.userAgent;													// Get user agent
				let isAndroid=ua.match(/android/i);													// If Android
				if (isMobile && !isAndroid)	str="zoomus://";										// If IOS												// Use mobile header
				else if (ua.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) str="";
				if (str) {																			// If needing native app
					str="zoomus://zoom.us/join?confno="+link.split("?")[1];
					str+="&zc=0&uname="+app.people[app.myId].firstName+"-"+app.people[app.myId].lastName;
					app.sced.ShowLink(str);															// Open with native app							
					return;																			// Quit
					}
				}
			if (link.charAt(0) == "*") {															// Show a web page
				window.open(link.substr(1),"_blank");												// Open in new tab
				return;																				// Quit
				}
			else if (link.charAt(0) == "!") {														// Show a web page
				window.open(link.substr(1),"_blank","width=99%");									// Open in new tab
				return;																				// Quit
				}
			else if (link.charAt(0) == "#") {														// Show a full page
				pad=32;																				// padding
				h=app.by-$(app.vr).position().top-pad-pad/2-2										// Full height to bottom
				link=link.substr(1);																// Remove flag									
				}
			else if (link.charAt(0) == "=") {														// Show a full div
				pad=32;																				// padding
				h=$(app.vr).height()-pad-pad/2-2													// Full height to bottom
				link=link.substr(1);																// Remove flag									
				}
			else if (link.charAt(0) == "-") {														// Show a full div, no padding
				h=$(app.vr).height()-2;																// Full height to bottom
				link=link.substr(1);																// Remove flag									
				}
			$(window).scrollTop(0);																	// Scroll to top	
			if (link.match(/zapp.htm/i)) link+="&"+app.KZ;											// Add K for Zoom
			if (link.match(/.app.htm/i)) {
				link+="&"+app.people[app.myId].firstName+"-"+app.people[app.myId].lastName+"&"+app.people[app.myId].role;	// Add name 
				if (app.venue[0][0].params.jitsi)	link+="&jitsi"+app.venue[0][0].params.jitsi;	// Add jitsi server url if spec'd
				link=link.replace(/\<.*?>/ig,"");													// Remove tags, if any
				}
			
			let x=isSmall ? 0 : $(app.vr).offset().left;											// Left is video room, unless small
			let y=isSmall ? 0 : $(app.vr).offset().top;
			let str=`<div id="co-iframe" class="co-card"' style="margin:0;padding:${pad/2}px;padding-top:${pad}px;
			box-shadow:none;background-color:#eee;
			left:${x}px;top:${y}px;	width:${$(app.vr).width()-pad}px; height:${h}px
			${link.match(/.app.htm/i) ? ";background-color:#444;overflow:hidden" : ""}">`;
			if (pad) str+=`<img id="co-pipBut2" style="float:right;cursor:pointer;width:22px;margin-top:-27px" src="img/zoomblue.png" title="Video chat">`;
			str+=`<div id="co-ifSmall" style="pointer-events:none;cursor:pointer;position:absolute;top:6px;font-size:11px;left:6px;color:#fff;width:calc(100% - 8px)">
			<div style="position:absolute;background-color:#fff;width:18px;height:18px;border-radius:18px">
			<img id="co-ifc" style="cursor:pointer;padding:1px 0 0 0;pointer-events:auto" src="img/closedot.png"></div>
			<div style="display:inline-block;text-align:center;width:100%">
			<span id="co-ift"style="cursor:pointer;pointer-events:auto">Minimize window</span></div></div>
			<iframe id="co-iframeFrame" style="width:100%;height:100%" src="${link}" allow=camera;microphone;autoplay frameborder="0" allowfullscreen></iframe>`;
			$("body").append(str.replace(/\t|\n|\r/g,""));											// Add it

			$("#co-pipBut2").on("click", ()=>{ this.PipVideo("frame","co-iframe") });				// ON PIP BUT

			$("#co-ifc").on("click", ()=>{															// ON CLOSE BUT
				$("#co-iframe").remove();															// Close window
				app.GoToCenter();																	// Go to center
				});	
			
			$("#co-ift").on("click", ()=>{															// ON SMALLER BUT
				let w=$(app.vr).width(),h=$(app.vr).width()*.5625;									// Default size
				if ($("#co-ift").text() == "Minimize window")	{									// If reducing
					w=128;	h=256;																	// Small size
					$("#co-ift").text("Maximize");													// Change title
					}
				else $("#co-ift").text("Minimize window");											// Restore title		
				$("#co-iframe").css({width:w+"px", height:h+"px"});									// Hide/show iframe
				});	
			}
	}

	SetMacros(room, content)																	// SET CONTENT MACROS
	{
		return content;
		let ifr;
		let h=app.venue[app.curFloor][room].hgt;													// Get height
		if ((ifr=content.match(/iframe\((.+?)\)/i))) {												// An iframe macro
			content=`<iframe src="${ifr[1]}" 
			style="width:100%;height:${h}px;pointer-events:auto;border:none"  
			allow=camera;microphone;autoplay frameborder="0" allowfullscreen></iframe>`;
			}
		else if ((ifr=content.match(/center\((.+?)\)/i))) {											// A center macro
			}
		return content.replace(/\t|\n|\r/g,"");
	}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GALLERY
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	GetGalleryData(sc)																		// GET GALLERY DATA FROM SPREADSHEET
	{
		let i,j,v,col,row,con,o,s=[["title","url","desc"]];
		let id=sc.link.match(/d\/(.*)\//i);															// Extract id
		if (id) id=id[1];																			// Get actual id
		else{																						// Get implicit data
			if (!sc.content)	return "";															// Quit if no content													
			sc.content=sc.content.replace(/\n|\r/g,"");												// Remove CR/LFs
			o=sc.content.match(/gallery\(\((.*?)\)\)/ig);											// Get data from content
			if (!o)	return "";																		// Quit if invalid content													
			for (i=0;i<o.length;++i) {																// For each item
				o[i]=o[i].substr(9);																// Remove 'GALLERY((' tag
				o[i]=o[i].replace(/\)\)$/g,"");														// Remove closing paren
				v=o[i].split(",");																	// Extract fields
				s[i+1]=[];																			// Add row
				s[i+1][0]=v[0] ? v[0].trim() : "";													// Get title
				s[i+1][1]=v[1] ? v[1].replace(/<u>|<\/u>/ig,"").trim() : "";						// Url
				for (j=3;j<v.length;++j) v[2]+=","+v[j];											// Add back comma breaks													
				s[i+1][2]=v[2] ? v[2].trim() : "";													// Desc
				}
			return { data:s, content:this.CreateGallery(s,sc.room) };								// Return content
			}
		let str="https://spreadsheets.google.com/feeds/cells/"+id+"/1/public/values?alt=json";		// Make url
		$.ajax( { url:str, dataType:'jsonp' }).done((data)=> {										// Get data				
				let cells=data.feed.entry;															// Point at cells
			for (i=0;i<cells.length;++i) {															// For each cell
				o=cells[i];																			// Point at it
				col=o.gs$cell.col-1; 	row=o.gs$cell.row-1;										// Get cell coords
				con=o.content.$t;																	// Get content
				if (!con) 				continue;													// Skip blank cells
				if (!s[row])			s[row]=["","","",""];										// Add new row if not there already
				if (col < 5)			s[row][col]=con;											// Add cell to array
				}
			v=this.CreateGallery(s,sc.room);														// Create gallery 
			if (v != sc.content) { sc.content=v; this.CheckSchedule(); }							// If changed, set and trigger a redraw	
		}).fail((msg)=>{ trace("Can't load Gallery data") });		
		return { data:s, content:sc.content };														// No content yet
		}

	CreateGallery(s, room)																		// CREATE GALLERY
	{
		let i,p,ss;
		let str=`<div id="co-galBase-${room}" style="overflow-y:auto;margin:0 8px 0 18px">`;		// Base div
		for (i=1;i<s.length;++i) {																	// For each pic									
			ss=s[i][2].replace(/"/g,"&quot;");														// Escape "
			ss=ss.replace(/'/g,"&apos;");															// '
			if (ss && ss.match(/^http(.*?)pdf/i)  && !s[i][1]) s[i][1]="img/pdf.png";				// PDF icon
			else if (ss && ss.match(/^http(.*?)/i) && !s[i][1]) s[i][1]="img/link.png";				// Link icon
			ss=ss.replace(/&quot;/g,"~Q~");															// '"Escape" &quot;
			p=`\"${s[i][0]}\",\"${s[i][1]}\",\"${ss}\"`;											// Item content
			str+=`<div id="co-gItem-${i}" class="co-galleryItem"><img src="${s[i][1]}" width="50%"
			onclick='app.sced.ShowGalleryItem(${p})'><br>${s[i][0]}<br><br></div>`;					// Add it 
			}
		str+="</div>";																				// Close div
		return str;																					// Return gallery HTML	
	}

	ShowGalleryItem(title, link, content)														// SHOW GALLERY ITEM DETAILS
	{
		trace(title,)
		trace(link)
		trace(content)
		$("#co-gItemD").remove();																	// Kill existing
		$(window).scrollTop(0);																		// Scroll to top	
		let h=$(app.vr).height();																	// Cover div only
		if (content && content.match(/^#/)) { 														// If a full page link
			content=content.substr(1);																// Remove flag
			h=app.by-$(app.vr).position().top;														// Full height to bottom
			}
		let str=`<div id="co-gItemD" class="co-card"' style="margin:0;padding:16px;box-shadow:none;background-color:#eee;
		left:${$(app.vr).offset().left}px;top:${$(app.vr).offset().top}px;overflow:auto;
		width:${$(app.vr).width()-32}px;height:${h-34}px" data-content="${content}">
		<img id="co-igc" style="float:left;cursor:pointer" src="img/closedot.png">
		<img id="co-pipBut" style="float:right;cursor:pointer;width:22px" src="img/zoomblue.png" title="Video chat">
		<b>${title}</b><br><br>`;
		content=content.replace(/~Q~/g,"\"");														// "Unescape" &quot;

		if (content && content.match(/^#*http/i)) { 												// If  a link
			content=ConvertFromGoogleDrive(content);												// Convert link
			str+=`<iframe id="co-iframeFrame" style="width:100%;height:${h-79}px" src="${content}" 
			allow=camera;microphone;autoplay frameborder="0" allowfullscreen></iframe></div>`;
			}
		else{																						// Picture/text
			str+=`<img src="${link}" style="width:40%;border:1px solid #999;vertical-align:top;float:left;margin-left:5%">
			<div style="display:inline-block;text-align:left;margin-left:16px;vertical-align:top;width:calc(45% - 32px);">
			${content ? content : "No details..."}</div></div>`;
			}
		$("body").append(str.replace(/\t|\n|\r/g,""));												// Draw
		$("#co-igc").on("click", ()=>{ $("#co-gItemD").remove(); });								// ON CLOSE BUT
		$("#co-pipBut").on("click", ()=>{ this.PipVideo("gallery","co-gItemD") });					// ON PIP BUT
	}

	PipVideo(id, parent)																		// ADD PIP VIDEO CHAT			
	{
		let link="japp.htm?~"+app.meetingId+"~"+id;
		link+="&"+app.people[app.myId].firstName+"-"+app.people[app.myId].lastName+"&"+app.people[app.myId].role;	// Add name 
		link=link.replace(/\<.*?>/ig,"");	
		let w=$("#"+parent).width()/3;																// Start off smaller
		if ($("#co-pipDiv")[0]) {																	// If open
			$("#co-pipDiv").remove();																// Remove it
			return;																					// Quit
			}	
		let str=`<div id="co-pipDiv" style="position:absolute;right:16px;top:54px;width:${w}px;height:${w*.5625}px">
		<iframe id="co-pipFrame" style="position:absolute;left:12px;width:calc(100% - 12px);height:100%;" 
		src="${link}" allow=camera;microphone;autoplay frameborder="0" allowfullscreen></iframe>
		<div class="co-resizer"></div></div>`;
	
		$("#"+parent).append(str.replace(/\t|\n|\r/g,""));											// Draw
	
		let l=$("#"+parent).position().left;														// Left side
		let r=l+$("#"+parent).width()-64;															// Right

		$("#co-pipDiv").draggable( { axis:"x",  iframeFix:true,	containment:[l,0,r,10000],			// SET DRAGGING
		drag:(e,ui)=>{																				// ON DRAG
			let ifr=document.getElementById('co-pipFrame').contentWindow.document;					// Point to Jitsi ifrane
			let w=$("#"+parent).width()-ui.position.left+12;										// New size
			ifr.getElementById('jitsiConferenceFrame0').style.height=w*.5625+"px";					// Set Jitsi iframe 
			$("#co-pipDiv").css({ width:`${w}px`, height:`${w*.5625}px`, right:0, top:0 }); 		// Set container div
			}
		});

	}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VENDOR
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	VendorControl()																			// VENDOR CONTROL PANEL
	{
		let i,p=app.people[app.myId];															// Get person
		if (window.location.search.substring(1) == "preview")	p.role="admin";					// Force admin in preview
		if (!p.role)											return;							// Quit if no role
		if (!p.role.match(/admin|host|vendor/i))				return;							// Quit if not authorized
		$("#co-Vcon").remove();																	// Kill existing
		let content=$("#co-gItemD").data("content");											// Get content
		if (content && !content.match(/^https\:\/\/etalimages.s3.amazonaws.com/i)) content="";	// Not an AWS file

		let str=`<div id="co-Vcon" class="co-card"' style="margin:0;padding:16px;box-shadow:none;background-color:#eee;
		left:${$(app.vr).offset().left}px;top:${$(app.vr).offset().top}px;max-height:${$(app.vr).height()-34}px;overflow:auto;
		width:${$(app.vr).width()-32}px;height:-moz-fit-content;height:fit-content">
		<img id="co-clsa" style="float:right;cursor:pointer" src="img/closedot.png">
		<b>Vendor Control Panel</b><br><br>
		<div style="float:left">Override event in:&nbsp;&nbsp;&nbsp;&nbsp;</div><div style="text-align:left">
		<select class="co-is" style="width:auto" id="co-Vrom"><option>Hallway</option>`;
		for (i=1;i<app.venue[app.curFloor].length;++i) 											// For each room
			str+=`<option>${app.venue[app.curFloor][i].title.replace(/^\*/,"")}</option>`;		// Add room
		str+=`</select>&nbsp;to&nbsp;<select class="co-is" style="width:auto" id="co-Vevt"></select>`;

		str+=`<br><br><div style="float:left">Clear message board in:&nbsp;&nbsp;&nbsp;</div>`;
		for (let i=0;i<this.schedule.length;++i) {												// For each event
			if ((this.schedule[i].floor == app.curFloor) && (this.schedule[i].link) && this.schedule[i].link.match(/BULLETINBOARD/))
				str+=`<div id="co-Vbul-${i}" class="co-bsg">${app.venue[app.curFloor][this.schedule[i].room].title}</div>&nbsp;&nbsp;&nbsp;`;	
				}
		str+=`<br><br><div style="float:left">Write on chalk board(s):&nbsp;&nbsp;&nbsp;</div>`;
		for (let i=0;i<this.schedule.length;++i) {												// For each event
			if ((this.schedule[i].floor == app.curFloor) && (this.schedule[i].link) && this.schedule[i].link.match(/CHALKBOARD/))
				str+=`<div style="width:200px;height:100px;display:inline-block">
				<div id="co-Vcha-${i}" class="co-bsg" style="margin-bottom:4px">Write to ${app.venue[app.curFloor][this.schedule[i].room].title}</div>	
				<textarea id="co-VchaCon-${i}" style="text-align:center;width:100%;height:100%;padding:8px;">
				${this.schedule[i].content ? this.schedule[i].content.replace(/<br>/g,"&#010") : ""}
				</textarea></div>`;	
				}
		
		if (content) str+="<br><br>Upload new file to replace: <input type='file' id='co-imageUpload'>";
		str+="</div><br></div>";
		$("body").append(str.replace(/\t|\n|\r/g,""));											// Draw
		fillEvents(0);																			// Fiull hallway eventws
	
		$("#co-clsa").on("click", ()=>{ $("#co-Vcon").remove(); });								// ON CLOSE BUT

		$("#co-Vrom").change("change", ()=>{ 													// ON ROOM CHANGE
			fillEvents($("#co-Vrom").prop("selectedIndex"));									// Fill events select
			});

		$("#co-Vevt").change("change", (e)=>{ 													// ON AWAY CHANGE
			let id=$("#co-Vevt").val();															// Get event id
			let rm=$("#co-Vrom").prop("selectedIndex");											// Choose event
			let roomId=app.venue[app.curFloor][rm].id; 											// Get room id
			app.ws.send(`AW|${roomId}|${id != "Choose" ? id : 0 }`);							// Update server
			Sound("ding");																		// Ding
			});

		$("[id^=co-Vbul-]").on("click", (e)=>{ 													// ON ERASE BB
			let id=this.schedule[e.currentTarget.id.substr(8)].id;								// Get id
			app.ws.send(`BB|${id}|${app.myId}|EraseBb`);										// Clear
			Sound("ding");																		// Ding
			});

		$("[id^=co-Vcha-]").on("click", (e)=>{ 													// ON CHALK WRITE
			let i=e.currentTarget.id.substr(8);													// Base id
			let id=this.schedule[i].id;															// Get id
			let msg=$("#co-VchaCon-"+i).val();													// Get content
			if (msg) msg=msg.replace(/\n/g,"<br>");												// LF -> <br>
			app.ws.send(`BB|${id}|${app.myId}|${msg}`);											// Send message
			Sound("ding");																		// Ding
			});
	
		$("#co-imageUpload").on("change",(e)=>{													// ON IMAGE UPLOAD
			let myReader=new FileReader();														// Alloc reader
			myReader.onloadend=function(e) { 													// When loaded
				app.ws.send("IMG|"+content.split(".com/")[1]+"|"+myReader.result);				// Send base64 to server
				}						
			myReader.readAsDataURL(e.target.files[0]);											// Load file		
			});

		function fillEvents(room) {																// FILL EVENTS SELECT
			let str,o,s;
			$("#co-Vevt").empty();																// Clear
			$("#co-Vevt").append("<option>Choose</option>");									// Choose event
			for (i=0;i<app.sced.schedule.length;++i) {											// For each event
				o=app.sced.schedule[i];															// Point at event
				if ((app.curFloor == o.floor) && (room == o.room)) {							// The right room 
					s=o.start-new Date().getTimezoneOffset();									// Get local time
					if (!isNaN(s))  s=(Math.floor(s/60) < 10 ? "0" : "")+Math.floor(s/60)+":"+s%60+(s%60 ? "" : 0);	// Readable time
					else			s="";
					str=`<option value="${o.id}">${s} &nbsp; ${o.desc ? o.desc.substr(0,16).replace(/\*/,"") : ""}</option>`;
					$("#co-Vevt").append(str);													// Add option
					}
				}
			}
	}


} // Class closure