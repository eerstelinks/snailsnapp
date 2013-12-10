$.mapview.showsPointsOfInterest = false;
$.mapview.userLocationButton = false;
$.mapview.traffic = false;

$.mapview.userLocation = true;

$.mapview.region = {
	latitude: 52.373056, 
	longitude: 4.892222,
	latitudeDelta: 0.01,
	longitudeDelta: 0.01
};

function setLocation(coords){
    var region = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        animate: true,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
    };
    $.mapview.setLocation(region);
}

function locateMe() {
	if (Ti.Geolocation.locationServicesEnabled) {
	    Ti.Geolocation.purpose = L('geo_own_location_purpose', 'Get Current Location');
	    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
	    Ti.Geolocation.distanceFilter = 10;
	    Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
	
	    Ti.Geolocation.getCurrentPosition(function(e) {
	        if (e.error) {
	    		showErrorAlert(L('geo_no_location_message'), L('geo_no_location_button'));
	        } else {
	            setLocation(e.coords);
	        }
	    });
	}
}

Alloy.Globals.Facebook.addEventListener('logout', function(e) {
    Alloy.createController('index').getView().open();
});


function fbLogOut() {
	Alloy.Globals.Facebook.logout();
}

locateMe();

