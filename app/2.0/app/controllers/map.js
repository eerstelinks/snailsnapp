function report(evt) {
    alert("Annotation " + evt.title + " clicked, id: " + evt.annotation.myid);
}

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
	    Ti.Geolocation.purpose = 'Get Current Location';
	    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
	    Ti.Geolocation.distanceFilter = 10;
	    Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
	
	    Ti.Geolocation.getCurrentPosition(function(e) {
	        if (e.error) {
	    		showErrorAlert('To locate yourself we need your location, so turn it on in your phone settings', 'Let me turn it on');
	        } else {
	            setLocation(e.coords);
	        }
	    });
	}
}

locateMe();

