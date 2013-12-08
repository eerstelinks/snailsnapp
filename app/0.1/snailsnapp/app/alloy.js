// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

// colors
Alloy.CFG.green = "#18DB6E";
Alloy.CFG.grey = "#DCDCDC";
Alloy.CFG.white = "#FFFFFF";

Alloy.Globals.rotateArrow = Ti.UI.create2DMatrix().rotate(-45);

if (Titanium.Platform.name == 'iPhone OS') {
	var service = Ti.App.iOS.registerBackgroundService({url:'notification.js'});
}