// always destroy login when closed
$.viewphoto.addEventListener('close', function() {
  $.destroy();
});

function cancelSnapp() {
  $.viewphoto.close();
}