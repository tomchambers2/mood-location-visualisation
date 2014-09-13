var coords = {};
var mood = {};
coords.coordsArray = [];

function createTracks(data) {
	coords.data = data;
};

function createMood(data) {
	mood.data = data;
}

function convert(lat, lng) {
	//var x = (lng + 180) * (view.bounds.width / 360);
	//var y = ((-1 * lat) + 90) * (view.bounds.height / 180);

	var x = (lat - 50) * 100;
	var y = Math.abs(lng) * 100;
	return {x:x,y:y};
}

function changeLine(color,width,line) {
	//change the line color
	mood.color = color;
	mood.weight = width;
};

function loadData(source, callback) {
	function handler() {
		var rows = req.responseText.split('\n');
		var result = [];
		for (var i=0;i<rows.length;i++) {
			var columns = rows[i].split(',');
			result.push(columns);
		}
		callback(result);
	}

	var req = new XMLHttpRequest();
	req.open("GET",source+".csv",true);
	req.onload = handler;

	req.send();
};

loadData('tracks',createTracks);
loadData('mood', createMood);

var date = 1395416710000; //start with first day of data
var i = 1;
var j = 2;
var dateElement = document.getElementsByClassName('date')[0];
var moodElement = document.getElementsByClassName('mood')[0];

var map = L.map('map').setView([51.505, -0.09], 8);	

L.tileLayer('http://{s}.tiles.mapbox.com/v3/tomchambers.jg86nle7/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
}).addTo(map);

/*
var polygon = L.polygon([
    [54.7738806623, -6.577112548],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);
*/

event = {
	count: 0
}

setInterval(function() {
	//if (event.count > 1000) return;
	//event.count++;
	if (coords.data && mood.data) {
		//date += 1000000; //this is the standard slow moving date
		date += 1000000; //fast date for testing
		//dateElement.innerHTML = moment(date).format('Do MMMM YYYY, ha');

		var loadedTrackTime = moment(coords.data[i][0]+' '+coords.data[i][1]); //this is the undrawn track. if we pass its date, draw it

		mood.date = mood.data[j][0].split('"')[1];
		mood.hours = mood.data[j][2].split('"')[1];
		mood.minutes = mood.data[j][3].split('"')[1];
		mood.seconds = mood.data[j][4].split('"')[1];
		mood.currentDate = moment(mood.date+' '+mood.hours+':'+mood.minutes+':'+mood.seconds);

		function changeMood(line) {
			if (moment(date).isAfter(mood.currentDate)) {
				//moodElement.innerHTML = mood.data[j][5].split('"')[1];
				mood.currentMood = mood.data[j][5].split('"')[1];
				j++;
				switch (mood.currentMood) {
					case 'Very bad':
						changeLine('#ED1C11',2,line);
						//console.log('changed mood very bad');
						return true;
						break;
					case 'Bad':
						changeLine('#ED7C38',3,line);
						//console.log('changed mood bad');
						return true;
						break;				
					case 'Meh':
						changeLine('#21ABED',5,line);
						//console.log('changed mood meh');
						return true;
						break;				
					case 'So-so':
						changeLine('#C0ED53',7,line);
						//console.log('changed mood so-so');
						return true;
						break;				
					case 'Okay':
						changeLine('#83ED52',8,line);
						//console.log('changed mood okay');
						return true;
						break;				
					case 'Good':
						changeLine('#26ED6D',10,line);
						//console.log('changed mood good');
						return true;
						break;
					default:
						changeLine('#BCBCBC',1,line);
						return false;
				};
			};
			return false;
		};

		if (moment(date).isAfter(loadedTrackTime)) {
			coords.x = parseFloat(coords.data[i][3],10);
			coords.y = parseFloat(coords.data[i][4],10);

			coords.coordsArray.push([coords.x,coords.y]);

			if (changeMood()) {
				//console.log(coords.coordsArray);
				var polyline = L.polyline(coords.coordsArray, {color: mood.color, weight: mood.weight }).addTo(map);
				//map.fitBounds(polyline.getBounds());
				coords.coordsArray = [];
				coords.coordsArray.push([coords.x,coords.y]);
			};

			//remove lines if there is a performance issue
			i++;
		};
	};
}, 16);