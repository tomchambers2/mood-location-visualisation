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