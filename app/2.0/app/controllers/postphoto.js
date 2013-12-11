var args = arguments[0] || {};

console.log(args);

$.description.setValue(args.image || '');

function outputStateFacebook() {
  Ti.API.info('Switch value: ' + $.postFacebook.value);
}
function outputStatePublic() {
  Ti.API.info('Switch value: ' + $.postPublic.value);
}
function outputStateAnonymous() {
  Ti.API.info('Switch value: ' + $.postAnonymous.value);
}