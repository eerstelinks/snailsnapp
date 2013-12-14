// function to create a overlay for ios
// two simple callbacks
function createCameraOverlay(backFunction, captureFunction) {

  var cropOffset = (Ti.Platform.displayCaps.platformHeight - Ti.Platform.displayCaps.platformWidth) / 2;

  var cameraOverlay = Titanium.UI.createView({
    top: 0,
    left: 0,
    width: Ti.UI.SIZE,
    height: Ti.UI.SIZE,
    touchEnabled: true,
  });

  var topOverlay = Titanium.UI.createView({
    backgroundColor: Alloy.CFG.black,
    top: 0,
    width: '100%',
    height: cropOffset,
  });

  var topLabel = Titanium.UI.createLabel({
    color: Alloy.CFG.green,
    text: L('camera_title'),
  });

  var backButton = Titanium.UI.createButton({
    color: Alloy.CFG.green,
    image: '/images/icons/chevron_left.png',
    title: L('button_back'),
    left: 10,
    style: Ti.UI.iPhone.SystemButtonStyle.PLAIN, // for good behavior on iOS6
  });

  var bottomOverlay = Titanium.UI.createView({
    backgroundColor: Alloy.CFG.black,
    bottom: 0,
    width: '100%',
    height: cropOffset,
  });

  var captureButton = Titanium.UI.createImageView({
    width: 100,
    bottom: -20,
    image: '/images/snailhome.png',
  });

  var cameraButton = Titanium.UI.createImageView({
    width: 32,
    height: 30,
    left: 20,
    image: '/images/icons/switch_camera.png',
  });

  var flashButton = Titanium.UI.createButton({
    color: Alloy.CFG.green,
    height: 30,
    right: 20,
    image: '/images/icons/bolt.png',
    title: ' auto',
    style: Ti.UI.iPhone.SystemButtonStyle.PLAIN, // for good behavior on iOS6
  });

  topOverlay.add(topLabel);
  topOverlay.add(backButton);
  cameraOverlay.add(topOverlay);

  // only add the cameraButton when user has more then 1 camera
  if (Ti.Media.getAvailableCameras().length > 1) {
    bottomOverlay.add(cameraButton);
  }

  bottomOverlay.add(flashButton);
  bottomOverlay.add(captureButton);
  cameraOverlay.add(bottomOverlay);

  // alert user when he clicks on camera
  cameraButton.addEventListener('click', function() {

    if (Ti.Media.camera == Ti.Media.CAMERA_FRONT) {
      var changeToCamera = Ti.Media.CAMERA_REAR;
    }
    else {
      showErrorAlert(L('camera_selfie_message'), L('camera_selfie_button'), L('camera_selfie_title'));
      var changeToCamera = Ti.Media.CAMERA_FRONT;
    }

    Ti.Media.switchCamera(changeToCamera);
  });

  // alert user when he clicks on camera
  flashButton.addEventListener('click', function() {

    if (Ti.Media.cameraFlashMode == Ti.Media.CAMERA_FLASH_AUTO) {
      Ti.Media.setCameraFlashMode(Ti.Media.CAMERA_FLASH_ON);
      var newTitle = L('camera_flash_on');
    }
    else if (Ti.Media.cameraFlashMode == Ti.Media.CAMERA_FLASH_ON) {
      Ti.Media.setCameraFlashMode(Ti.Media.CAMERA_FLASH_OFF);
      var newTitle = L('camera_flash_off');
    }
    else {
      Ti.Media.setCameraFlashMode(Ti.Media.CAMERA_FLASH_AUTO);
      var newTitle = L('camera_flash_auto');
    }

    flashButton.setTitle(' ' + newTitle);

  });

  // bind click event to backbutton to cancel
  if (typeof backFunction == 'function') {
    backButton.addEventListener('click', backFunction);
  }

  // bind click event to capture button
  if (typeof captureFunction != 'function') {

    captureFunction = function() {
      // animate show the user knows something is happening
      this.animate(Ti.UI.createAnimation({
        transform: Ti.UI.create2DMatrix().rotate(180),
        duration: 1500,
      }));

      // take the photo
      Ti.Media.takePicture();
    }
  }

  captureButton.addEventListener('click', captureFunction);

  return cameraOverlay;
}