function doClick(e) {
    alert($.label.text);
}

function getDate() {
	var currentTime = new Date();
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	 
	return month + "/" + day + "/" + year + " -  " + hours + ":"+ minutes;
}

/* countdown part */
var countdownTo = new Date(2014,00,15).getTime();
var counter     = setInterval(countdown, 1000);

function countdown() {
	
	var miliseconds = countdownTo - new Date().getTime();
	var seconds     = Math.round(miliseconds / 1000);
	
	var days        = Math.floor(seconds / 86400);
	seconds         = seconds - days * 86400;
	
	var hours       = Math.floor(seconds / 3600);
	seconds         = seconds - hours * 3600;
	
	var minutes     = Math.floor(seconds / 60);
	seconds         = seconds - minutes * 60;
	
 	if (miliseconds <= 0) {
		clearInterval(counter);
		//counter ended, do something here
		return;
	}

	$.counter.text = days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's';
}

$.index.open();
