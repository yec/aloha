/**
 * @file
 * A simple interface to interact with Aloha Editor.
 */

Drupal.aloha = {

  state: {
    initializing: false,
    ready: false,
    initCallbacks: [],
  },

  /**
   * Initialize Aloha Editor.
   *
   * @param callback
   *   An optional callback that will be called whenever Aloha Editor is ready.
   *   If this is called multiple times while Aloha Editor is initializing, each
   *   callback will be queued and will be executed when Aloha Editor is ready.
   *   If Aloha Editor is already ready when you call this, the callback will be
   *   called immediately.
   */
  init: function(callback) {
    // If Aloha is ready, immediately execute the callback. If it is,
    // initializing then add it to the list of init callbacks, all of which will
    // be called as soon as Aloha is ready.
    if (Drupal.aloha.state.initializing) {
      if (typeof callback == "function") {
        if (Drupal.aloha.state.ready) {
          callback();
        }
        else {
          Drupal.aloha.state.initCallbacks.push(callback);
        }
      }
      return;
    }
    else {
      Drupal.aloha.state.initializing = true;
      Drupal.aloha.state.initCallbacks.push(callback);
    }

    // Migrate Aloha.settings from Drupal.settings.
    Aloha.settings = Drupal.settings.aloha.settings;

    // Give all Drupal modules' JS the opportunity to alter Aloha Editor's
    // settings, before Aloha Editor gets initialized.
    jQuery(document).trigger('aloha-before-init', [Aloha.settings]);
    setTimeout(function() {
      Aloha.settings.plugins.load = Aloha.settings.plugins.load.join(',');
      Aloha.deferInit();
      Aloha.ready(function() {
        Drupal.aloha.state.ready = true;

        // Execute all queued init callbacks.
        for (var i = 0; i < Drupal.aloha.state.initCallbacks.length; i++) {
          var callback = Drupal.aloha.state.initCallbacks[i];
          callback();
        }

        // Also fire an event.
        jQuery(document).trigger('aloha-ready');
      })
    }, 0);
  },

  /**
   * Attach Aloha Editor to an editable.
   *
   * @param $editable
   *   The editable to which Aloha Editor should be applied. Can be a <textarea>
   *   or any HTML tag that contains HTML that should be edited (e.g. <div>,
   *   <article>, etc.) Should have a data-allowed-tags attribute (see README).
   * @param allowedTags
   *   An optional allowedTags string, which contains a comma-separated list of
   *   allowed HTML tags. E.g.: "br,p" or "br,p,strong,em,h1,h2,h3,blockquote".
   */
  attach: function($editable, allowedTags) {
    var id = $editable.attr('id');
    // If no ID is set on this editable, then generate one.
    if (typeof id === 'undefined' || id == '') {
      id = 'aloha-' + new Date().getTime();
      $editable.attr('id', id);
    }

    if (typeof allowedTags === 'undefined') {
      allowedTags = '';
    }
    $editable.attr('data-allowed-tags', allowedTags);

    Aloha.jQuery('#' + id).aloha();

    // Trigger 'aloha-content-changed' event whenever content has changed.
    Aloha.bind('aloha-smart-content-changed.aloha', function(event, ae) {
      if (ae.editable.obj[0].id == id && ae.triggerType !== 'blur') {
        $editable.trigger('aloha-content-changed');
      }
    });
  },

  /**
   * Enforce the activation of an attached Aloha Editor on a specific editable.
   *
   * @param $editable
   *   The editable on which Aloha Editor should be activated.
   */
  activate: function($editable) {
    var id = $editable.attr('id');

    // If the original editable is a textarea, Aloha Editor will automatically
    // have created a <div class="aloha-textarea" /> for it.
    if ($editable.is('textarea')) {
      id = $editable.parent().find('.aloha-textarea').attr('id');
    }

    Aloha.getEditableById(id).activate();
    // This hack will trigger the floating menu to appear *immediately*.
    Aloha.jQuery('#' + id).focus().trigger('mousedown').trigger('mouseup');
  },

  /**
   * Detach Aloha Editor from an editable.
   *
   * @param $editable
   *   The editable from which Aloha Editor should be detached. This will also
   *   cause Aloha Editor's additional mark-up to be cleaned up.
   */
  detach: function($editable) {
    var id = $editable.attr('id');

    Aloha.jQuery('#' + id)
    .unbind('aloha-smart-content-changed.aloha')
    .mahalo();
    if (id.match(/^aloha-\d+$/) != null) {
      $editable.removeAttr('id');
    }
  }
};

// As soon as the DOM is ready, migrate Aloha.settings from Drupal.settings and
// then immediately initialize Aloha Editor.
jQuery(function() { Drupal.aloha.init(); });
