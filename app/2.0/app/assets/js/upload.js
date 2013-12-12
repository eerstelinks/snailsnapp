// some files for hashing the signature
Ti.include('/js/lib/sha-aws.js');         // http://aws.amazon.com/code/Amazon-S3/3236824658053653
Ti.include('/js/lib/webtoolkit.utf8.js'); // http://www.webtoolkit.info/javascript-utf8.html
Ti.include('/js/lib/date.js');            // http://www.mattkruse.com/javascript/date/source.html

function onProgress(e, otherThis, name) {
  console.log('onProgress (' + name + ') ' + new Date().getSeconds() + 's: ' + e.progress+' '+otherThis.status+' '+otherThis.readyState);
  var progress = e.progress * 100;

  // run progressCallback function when available
  if (typeof progressCallback == 'function') {
    progressCallback(progress);
  }
}

// name: (string) name of the new file
// file: (file/blob)
// successCallback: callback function get an object with url and stuff
// errorCallback: speaks for it self
// (optional) progressCallback: gets progress in %
function uploadToS3(name, file, successCallback, errorCallback, progressCallback) {

  if (typeof successCallback != 'function') {
    Ti.API.error('successCallback() is not defined');
    return false;
  }

  if (typeof errorCallback != 'function') {
    Ti.API.error('errorCallback() is not defined');
    return false;
  }

  var AWSAccessKeyID     = 'AKIAJHRVU52E4GKVARCQ';
  var AWSSecretAccessKey = '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';
  var AWSBucketName      = 'snapps';
  var AWSHost            = AWSBucketName + '.s3.amazonaws.com';

  var currentDateTime = formatDate(new Date(),'E, d MMM yyyy HH:mm:ss') + ' -0000';

  var xhr = Ti.Network.createHTTPClient();

  xhr.onsendstream = function(e){

    var progress = Math.floor(e.progress * 100);
    Ti.API.info('uploading (' + new Date().getSeconds() + 's): ' + progress + '%');

    // run progressCallback function when available
    if (typeof progressCallback == 'function') {
      progressCallback(progress);
    }

  };

  xhr.onerror = function(e) {
    Ti.API.error({ errorlocation: 'onload', error: e, responseText: xhr.responseText, headers: xhr.getResponseHeaders() });
    errorCallback();
  };

  xhr.onload = function() {
    if (this.status >= 200 && this.status < 300) {

      var responseHeaders = xhr.getResponseHeaders();

      var filename = name;
      var url      = 'https://' + AWSHost + '/' + name;

      if (responseHeaders['x-amz-version-id']) {
        url = url + '?versionId=' + responseHeaders['x-amz-version-id'];
      }

      successCallback({ url: url });
    }
    else {
      Ti.API.error({ errorlocation: 'onload', error: e, responseText: xhr.responseText, headers: xhr.getResponseHeaders() });
      errorCallback();
    }
  };

  //ensure we have time to upload
  xhr.setTimeout(99000);

  // An optional boolean parameter, defaulting to true, indicating whether or not to perform the operation asynchronously.
  // If this value is false, the send() method does not return until the response is received. If true, notification of a
  // completed transaction is provided using event listeners. This must be true if the multipart attribute is true, or
  // an exception will be thrown.
  xhr.open('PUT', 'https://' + AWSHost + '/' + name, true);

  //var StringToSign = 'PUT\n\nmultipart/form-data\n' + currentDateTime + '\nx-amz-acl:public-read\n/' + AWSBucketName + '/' + name;
  var StringToSign = 'PUT\n\n\n' + currentDateTime + '\nx-amz-acl:public-read\n/' + AWSBucketName + '/' + name;
  var AWSSignature = b64_hmac_sha1(AWSSecretAccessKey, Utf8.encode(StringToSign));
  var AuthorizationHeader = 'AWS ' + AWSAccessKeyID + ':' + AWSSignature;

  xhr.setRequestHeader('Authorization', AuthorizationHeader);
  //xhr.setRequestHeader('Content-Type', 'multipart/form-data');
  xhr.setRequestHeader('X-Amz-Acl', 'public-read');
  xhr.setRequestHeader('Host', AWSHost);
  xhr.setRequestHeader('Date', currentDateTime);

  xhr.send(file);
}