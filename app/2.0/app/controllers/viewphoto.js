// always destroy login when closed
$.viewphoto.addEventListener('close', function() {
  $.destroy();
});

// bind placeholder function to description field so it works on iphone
bindPlaceholder($.new_comment, L('view_photo_comment_placeholder'));

function closeViewPhoto() {
  $.viewphoto.close();
}