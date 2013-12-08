// settings
var app_version = '1.0';
var api_url = "https://eerstelinks.nl/snailsnapp/api";

// countdown part
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
                $.timer.text = 'Update this app!';
                
                return;
        }
        else {
        	$.timer.text = days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's';
        }        
}

// animate arrow so it will get more attention
if (Titanium.Platform.name == 'iPhone OS') {
	$.timerArrow.animate({
		top: -20,
		duration: 300,
		delay: 5000
	});
}

// set height of the timerscreen a little less height than the screen
$.timerscreen.height = Titanium.Platform.displayCaps.platformHeight - 50;
$.invite.height = Titanium.Platform.displayCaps.platformHeight + 30;

// loading animation window
var loading = Alloy.createController('loading').getView();

// set askedForFriend to false only when it isn't set
if (Ti.App.Properties.getString('askedForFriend') == null) {
	Ti.App.Properties.setString('askedForFriend', 'false');
}

// set random string
if (Ti.App.Properties.getString('uniqueId') == null) {
	Ti.App.Properties.setString('uniqueId', randomString(20));
}

function randomString(string_length) {
	var chars = "0123456789abcdefghiklmnopqrstuvwxyz";
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}

function showErrorAlert(message, button, title) {
	dialog = Ti.UI.createAlertDialog({
    	message: message || 'Something went wrong',
    	ok: button || 'Let me try again',
    	title: title || 'Snapp...'
	}).show();
}

function showSuccessAlert(message, button, title) {
	dialog = Ti.UI.createAlertDialog({
    	message: message || 'This was a big success',
    	ok: button || 'Let me go',
    	title: title || 'Snailed it'
	}).show();
}

// listen to the submit button
function submitForm(e) {
	
	var emailMe        = $.emailMe.value;
	var emailFriend    = $.emailFriend.value;
	var askedForFriend = Ti.App.Properties.getString('askedForFriend');

	var error = '';
	
	if (emailMe == '' && emailFriend != '') {
		error = 'You can only invite a friend when you enter your own e-mail. Don\'t worry, we won\'t mail you twice!';
	}
	else if (emailMe == '') {
		error = 'Please enter your e-mail';
	}
	else if (!validateEmail(emailMe)) {
		error = 'Your own email is not valid';
	}
	else if (emailFriend != '' && !validateEmail(emailFriend)) {
		error = 'Your friends email is not valid';
	}
	else if (emailFriend == '' && askedForFriend == 'false') {
		Ti.App.Properties.setString('askedForFriend', 'true');
		error = 'Sure you don\'t want to invite a friend? Our invites go fast! Submit again with or without inviting a friend.';
	}
	
	if (error != '') {
    	showErrorAlert(error);
	}
	else {
		
		sendData(function(message) {
			
			var showMessage = message || 'Stay tuned, you will get your invite soon!';
			
	    	showSuccessAlert(showMessage);
			
			if (emailFriend != '') {
				$.emailFriend.setEditable(false);
				$.submit.hide();
			}
			
			$.emailMe.setEditable(false);
		});
		
	}
	
};

// source: http://stackoverflow.com/a/46181
function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 

function sendData(callback) {

	if (Titanium.Network.networkType == Titanium.Network.NETWORK_NONE) {
		showErrorAlert('This snail needs to connect to his home!', 'Let me enable internet');
		return false;
	}

	// open loading window
	loading.open();
	
	var data = {
		time_zone: new Date().getTimezoneOffset(),
		email_own: $.emailMe.value,
		email_friend: $.emailFriend.value,
		platform: Titanium.Platform.name,
		os_version: Titanium.Platform.version,
		os_name: Titanium.Platform.osname,
		locale: Titanium.Platform.locale,
		app_version: app_version,
		user_random_string: Ti.App.Properties.getString('uniqueId')
	};
	
	var client = Ti.Network.createHTTPClient({
		
		// function called when the response data is available
		onload : function(e) {
			
			// close loading window
			loading.close();
			
			var response = JSON.parse(this.responseText);
			
			if (response == null) {
				showErrorAlert('Something is wrong with parsing the response', 'Let me try again later');
			}
			else if (response.status == 'success') {
				if (response.message) {
					callback(response.message);
				}
				else {
					callback();
				}
			}
			else if (response.message) {
				showErrorAlert(response.message);
			}
			else {
				showErrorAlert('Something went wrong with receiving the data', 'Let me try again later');
			}
		},
		// function called when an error occurs, including a timeout
		onerror : function(e) {
			
			// close loading window
			loading.close();
			
			showErrorAlert('Something went wrong with sending the data (' + e.error + ')', 'Let me try again later');
		},
		timeout : 60*1000  // in milliseconds
	});
	
	// Prepare the connection.
	client.open("POST", api_url + '/post/invite');
	
	// Send the request.
	client.send(data);
}


// open the first window
$.win.open();