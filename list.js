(function() {
	jQuery(document).ready(function(){
	    jQuery.ajax({
		url: 'https://cdn.cul.columbia.edu/ldpd-toolkit/api/events-bw-prox-v2.json.php',
		type: 'GET',
		data: {
		    // This is part of a call to a php proxy used by CUL
		    burl: 'https://events.columbia.edu/feeder/main/eventsFeed.do',
		    f: 'y',
		    sort: 'dtstart.utc:asc',
		    fexpr: '(categories.href=\"/public/.bedework/categories/org/centertla\")',
		    skinName: 'list-json',
		    count: 200
		},
		dataType: 'json',
		success: function(data){
		    // do something with the data
		    for (let event of data.bwEventList.events) {
			var id = event.guid;
			var title = event.summary;
			var start = event.start_longdate;
			var startTime = event.start_time;
			var endTime = event.end_time;
			var url = event.eventlink;
			var description = event.description;
			var location = event.location_address;

			var catagory = [];
			var type = [];
			var eventsOpenTo = [];
			var groupSpecific = [];
			var campusLocation = [];

			var properties = {
			    "Catagory": catagory,
			    "Type": type,
			    "Events open to": eventsOpenTo,
			    "Groups": groupSpecific,
			    "Campus": campusLocation
			}
		
			
			var xprop = event.xproperties;
			for (var i = 0; i < xprop.length; i++) {
			    var aliasString;
		 	    var propList;

			    if (xprop[i]["X-BEDEWORK-ALIAS"] != null) {
				aliasString = xprop[i]["X-BEDEWORK-ALIAS"].values.text;
				propList = aliasString.split("/").slice(-2);
			        assignProp(propList);
			    }
			}

			function assignProp(propList) {
			    switch (propList[0]) {
			        case "Catagory":
				    catagory.push(propList[1]);
				    break;

				case "Type":
				    type.push(propList[1]);
				    break;

				case "Events open to":
				    eventsOpenTo.push(propList[1]);
				    break;

				case "Group-Specific":
				    groupSpecific.push(propList[1]);
				    break;

				case "Location":
				    campusLocation.push(propList[1]);
				    break;
			    }
			}
			
			function propertiesString(properties) {
			    var propString = "";
			    for (var i in properties) {
				propString += "<span>" + i + ": </span>" + properties[i] + "</br>";
			    }
			    return propString;
			}	

			var markup = `
			    <div class="event">
			    	<div class="event_specifics">
				    <a href="${url}"><h3>${title}</h3></a>
				    <h4>${start} ${startTime} - ${startTime}</h4>
				</div>
				<div class="event_description"><p>${description}</p></div>
			        <div class="location"><span class="event_location">Location: </span>${location}</div>
				<div class="event_properties">${ propertiesString(properties)}</div>
			    </div>`;
			jQuery('#calendarList').append(markup);
		    }
		},
		error: function() {
		    alert('Bad ajax call');
		}
	    })
	})
})();

