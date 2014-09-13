var coords = {};
var mood = {};
coords.coordsArray = [];
var speed = 1000 / 1000;
var firstLineDrawn = false;
mood.color = 'black';
mood.weight = 3;

function createTracks(data) {
	coords.data = data;
};

function createMood(data) {
	mood.data = data;
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

function clearMap() {
    for(i in map._layers) {
        if(map._layers[i]._path != undefined) {
            try {
                map.removeLayer(map._layers[i]);
            }
            catch(e) {
                console.log("problem with " + e + map._layers[i]);
            }
        }
    }
}

var increment = 1000000;
document.getElementById('fast').addEventListener('click', function() {
	increment = 10000000;
});
document.getElementById('medium').addEventListener('click', function() {
	increment = 1000000;
});
document.getElementById('slow').addEventListener('click', function() {
	increment = 100000;
});
document.getElementById('restart').addEventListener('click', function() {
	document.getElementById('finished').style.display = 'none';
	date = intialDate;
	clearMap();
	i = 1;
	j = 2;
	document.getElementById('controls').style.display = 'block';
});

loadData('tracks',createTracks);
loadData('mood', createMood);

//var date = 1395416710000; //start with first day of data
//var date = 1388534400000; //1st jan 2014
var intialDate = 1387627200000;
var date = intialDate; //21st dec 2013
var i = 1;
var j = 2;
var dateElement = document.getElementsByClassName('date')[0];
var moodElement = document.getElementsByClassName('mood')[0];

var map = L.map('map').setView([53.5534724,-2.5540983], 7);	

L.tileLayer('http://{s}.tiles.mapbox.com/v3/tomchambers.jg86nle7/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
}).addTo(map);

var interval = setInterval(function() {
	//return;
	if (coords.data && mood.data) {
		date += increment; //fast date for testing

		if (date > 1410134400000) {
			document.getElementById('controls').style.display = 'none';
			document.getElementById('finished').style.display = 'block';
			return;
		};

		//console.log(moment(date).format('Do MMMM YYYY ha'), "current date");

		dateElement.innerHTML = moment(date).format('Do MMMM YYYY, ha');

		var loadedTrackTime = moment(coords.data[i][0]+' '+coords.data[i][1]); //this is the undrawn track. if we pass its date, draw it
		//console.log(loadedTrackTime.format('Do MMMM YYYY ha'), "track time to be drawn");

		mood.date = mood.data[j][0].split('"')[1];
		mood.hours = mood.data[j][2].split('"')[1];
		mood.minutes = mood.data[j][3].split('"')[1];
		mood.seconds = mood.data[j][4].split('"')[1];
		mood.currentDate = moment(mood.date+' '+mood.hours+':'+mood.minutes+':'+mood.seconds);		

		function changeMood(line) {
			if (moment(date).isAfter(mood.currentDate)) {
				
				j++;
				//recursively increment until we have a mood that is beofre date
				function checkMood() {
					mood.date = mood.data[j][0].split('"')[1];
					mood.hours = mood.data[j][2].split('"')[1];
					mood.minutes = mood.data[j][3].split('"')[1];
					mood.seconds = mood.data[j][4].split('"')[1];
					mood.currentDate = moment(mood.date+' '+mood.hours+':'+mood.minutes+':'+mood.seconds);

					if (moment(date).isAfter(mood.currentDate)) {
						j++;
						checkMood();
						return;
					}
					moodElement.innerHTML = mood.data[j][5].split('"')[1];
					mood.currentMood = mood.data[j][5].split('"')[1];
				}
				checkMood();
				switch (mood.currentMood) {
					case 'Very bad':
						changeLine('#ED1C11',2,line);
						//console.log('changed mood very bad');
						return true;
						break;
					case 'Bad':
						changeLine('#ED7C38',2,line);
						//console.log('changed mood bad');
						return true;
						break;				
					case 'Meh':
						changeLine('#21ABED',3,line);
						//console.log('changed mood meh');
						return true;
						break;				
					case 'So-so':
						changeLine('#C0ED53',3,line);
						//console.log('changed mood so-so');
						return true;
						break;				
					case 'Okay':
						changeLine('#83ED52',4,line);
						//console.log('changed mood okay');
						return true;
						break;				
					case 'Good':
						changeLine('#26ED6D',4,line);
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

		function drawLine() {
			var loadedTrackTime = moment(coords.data[i][0]+' '+coords.data[i][1]);
			if (moment(date).isAfter(loadedTrackTime)) {
				//bad: if the date is after the latest point, go forward. means we end up with a backlog

				//good: if the date goes past a point, load all the points until date is ahead of the point

				coords.x = parseFloat(coords.data[i][3],10);
				coords.y = parseFloat(coords.data[i][4],10);

				coords.coordsArray.push([coords.x,coords.y]);

				if (changeMood() || !firstLineDrawn) {
					var polyline = L.polyline(coords.coordsArray, {color: mood.color, weight: mood.weight }).addTo(map);
					polyline.bindPopup("Date: "+moment(date).format('Do MMMM YYYY, ha'));
					//map.fitBounds(polyline.getBounds());
					coords.coordsArray = [];
					coords.coordsArray.push([coords.x,coords.y]);
				};
				i++;	
				if (moment(date).isAfter(loadedTrackTime)) {
					drawLine();
				};	
			};
		};
		drawLine();
	};
}, speed);