Installation instructions
-------------------------

Install as any Drupal module (so also install its dependencies), with the
following additional steps:

* Configure the jQuery Update module to use jQuery 1.7, not jQuery 1.5.
* Apply this core patch: http://drupal.org/files/1664602-1.patch
* Configure a HTML input format WITHOUT the "Convert URLs into links"
  (filter_url) and the "Convert line breaks into HTML" (filter_autop) filters.
  I.e. you can just use Drupal's default "Filtered HTML" text format and disable
  these.
  Next, also make sure that the <br> and <p> tags are allowed if you're using
  the "Limit allowed HTML tags" (filter_html) filter.


TODO
----

* Refactor + improve the UI to make it work well on the back-end instead of just
  in the Edit module. Yet still keep the ability to easily integrate it with
  Edit's in-place editing UI.
* BUG INTRODUCED: unable to align captioned images.
* Improve our build of Aloha Editor, so that we can leverage Drupal's
  hook_library() even better.


Rationales
----------

* Everywhere in Aloha Editor plug-in configurations, configure allowed
  tags as unrestrictive as possible; restrictions will be automatically applied
  by the Drupal contenthandler (part of the "Drupal" Aloha Editor plug-in).


Loading Aloha Editor plug-ins
-----------------------------

Follow these steps:
1) Add a dependency on the "aloha" module if your module is useless without it.
2) Implement hook_library(). Use a name such as "mymodule.aloha". Add a
   dependency on each Aloha Editor plug-in that you need. E.g. if you're adding
   the "extra/captioned-image" plug-in that ships with Aloha Editor, you'll want
   to specify a dependency on "aloha.common/block", which is part of the "aloha"
   module.
3) To ensure that the plug-ins you're trying to load actually get loaded, you
   have to send the necessary settings to Aloha (i.e. they have to end up in
   Aloha.settings). To do this, specify a "JavaScript setting" in your library,
   you can use the public API function aloha_plugin_js_settings() to simplify
   this.
4) Finally, to ensure that Drupal will make your Aloha Editor plug-in available
   wherever Aloha Editor is available, you should implement hook_library_alter()
   and whenever $module == "aloha", you can add your dependency like so:
     $libraries['aloha']['dependencies'][] = array('mymodule', 'mymodule.aloha');
5) For more details, see the ASCII diagram and aloha_library().


The Aloha Editor dependency chain
---------------------------------

 ASCII diagram to illustrate the dependency chain. Not every detail is
 displayed, only the big picture. For example, many plug-ins have dependencies
 on other plug-ins.

                                                                     +---------------------------+
                                                                     |                           |
                                                                     |  +---------------------+  |
                                                         "plug-ins"  |  | aloha.common/format |  |
                                                                     |  +---------------------+  |
                                                                     |  +--------------------+   |
                                    +-------+                        |  | aloha.common/align |   |
                      +------------>| aloha |<-----------------------+  +--------------------+   |
                      |             +-------+                        |  +-------------------+    |
                      |                    ^                         |  | aloha.common/list |    |
                      |                    |                         |  +-------------------+    |
             "core"   |                    |    "UI"                 |  +------+                 |
                      |                    |                         |  | etc. |                 |
                +-----+------+            ++-----------------------+ |  +------+                 |
           +--->| aloha.core |<--+        | drupal-aloha/drupal-ui | |                           |
           |    +------------+   |        +------------------------+ +---------------------------+
           |                     |                 ^             ^
           |                     |                 |             |
           |                     |                 |             |
           |                     |                 |             |
           |                     |                 |             |
           |                     |                 |             |
+----------+------------+  +-----+--+     +--------+--------+   ++---+
| aloha.common/commands |  | jquery |     | aloha.common/ui |   | ui |
+-----------------------+  +--------+     +-----------------+   +----+
                                ^                                 ^
                    (Drupal core's jQuery)            (Drupal core's jQuery UI)
