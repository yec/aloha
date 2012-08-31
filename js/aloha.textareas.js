(function ($) {

Drupal.behaviors.alohaTextareas = {
  attach: function(context) {
    Drupal.aloha.init(function() {
      var first = true;
      $('textarea[data-allowed-tags]', context).once('aloha', function() {
        var $editable = $(this);
        Drupal.aloha.attach($editable);

        // Activate the first Aloha Editor.
        if (first) {
          Drupal.aloha.activate($editable);
          first = false;
        }

        // React appropriately to changed input formats.
        $editable
        .parents('.text-format-wrapper').find('.filter-wrapper select')
        .bind('change.aloha', function() {
          Drupal.aloha.detach($editable);
          // @todo: format-dependent (de)attaching AND updating of data-allowed-tags attribute.
          console.log('CHANGED', $(this), arguments);
        })

        // Detach Aloha Editor when the containing form is submitted.
        $editable.parents('form').submit(function(event) {
          // Do not detach if the event was cancelled.
          if (event.isDefaultPrevented()) {
            return;
          }
          Drupal.aloha.detach($editable);
        });
      });
    });
  }
};

})(jQuery);
