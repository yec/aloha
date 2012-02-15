/**
 * @file
 * Javascript to attach Aloha Editor to the right fields and blocks.
 */

(function(window, undefined) {
  var Aloha = window.Aloha || (window.Aloha = {});

  // Set settings
  Aloha.settings = settings.aloha.alohaSettings;
});

(function($) {
  Drupal.behaviors.alohaEditor = {
    attach: function(context, settings) {
      Drupal.behaviors.alohaEditor.fixExtJsArrayPrototypeOverride();
      // Run only if aloha is required
      if (settings.aloha) {
        Aloha.ready(function() {
          Aloha.require(['aloha', 'aloha/jquery'], function(Aloha, $) {
            // Load Aloha for each editable content region
            for (var key in settings.aloha.regions) {
              Drupal.behaviors.alohaEditor.attachRegion(key, settings.aloha.regions[key]);
            }
          });
        });
      }
      Drupal.behaviors.alohaEditor.hoverEffect();
    },

    attachRegion: function(key, region) {
      // Get the container
      var $container = Aloha.jQuery('#aloha-target-' + key).parent();
      var saveIfChanged = function () {
        var html = Drupal.behaviors.alohaEditor.getContentFromContainer($container);
        if (region.html != html) {
          region.html = html;
          Drupal.behaviors.alohaEditor.save(key, region);
        }
      };
      // Store the original HTML to test if we need to fire save
      region.html = Drupal.behaviors.alohaEditor.getContentFromContainer($container);
      // Set up Aloha and associated events
      $container.aloha();
      // Save if required when leaving the edit area
      $container.blur(saveIfChanged);
      // Save if required when window is closed or we navigate to a new page
      $(window).unload(saveIfChanged);
    },

    // Strip our span target and any following tags from content to be saved.
    getContentFromContainer: function(container) {
      var $containerClone = jQuery(container).clone();
      $containerClone.find('.aloha-target, .aloha-target ~ *').remove();
      return $containerClone.html();
    },

    // Workaround for http://drupal.org/node/1404584
    fixExtJsArrayPrototypeOverride: function () {
      if (Array.prototype.remove) {
        delete Array.prototype.remove;
        Ext.applyIf(Array.prototype, {
          remove:function (o) {
            if (!this.indexOf) return this;
            var index = this.indexOf(o);
            if (index != -1) {
              this.splice(index, 1);
            }
            return this;
          }
        });
      }
    },
    
    hoverEffect: function () {
      var color = $(".aloha-target").parent().css("background-color");
      $(".aloha-target").parent().hover(
        function() {
          $(this).animate({
          	backgroundColor: "rgb(255, 255, 200)",
          }, 800 );
        },
        function() {
          $(this).animate({
          	backgroundColor: color,
          }, 800 );
        }
      );
    },

    save: function(key, region) {
      $.ajax({
        type: "POST",
        url: Drupal.settings.basePath + 'aloha/' + region.type + '/save',
        data: region,
        success: function(obj) {
          if (obj.status == 'saved') {
            var element = '<div class="aloha-status">' + Drupal.t('%title has been saved.', {'%title': obj.title}) + '</div>';
            $(element).insertBefore($('#aloha-target-' + key).parent()).delay(1300).fadeOut(function () {
              $(this).remove();
            });
          }
        }
      });
    }
  };
}(jQuery));
