var messageTimeout;
var closeTimeout;

function showIndicator(e){
    $.activityIndicator.show();
    
    // change message
    messageTimeout = setTimeout(function() {
        $.activityIndicator.setMessage('Still loading...');
    }, 5*1000);
    
    // auto close this window when it takes more than 60 seconds
    closeTimeout = setTimeout(function(){
        e.source.close();
        $.activityIndicator.hide();
    }, 60*1000);
}

function hideIndicator(e){
    $.activityIndicator.hide();
    
    $.activityIndicator.setMessage('Loading...');
    clearTimeout(messageTimeout);
    clearTimeout(closeTimeout);
}