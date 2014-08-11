
0.6.0 / 2014-08-11
==================

 * Added db.streamRemove().
 * Fixed license.

0.5.0 / 2014-07-29
==================

 * Added gulp-coverage. Use coffeelint.json from carcass.
 * Renamed plugins.modella to plugins.modellaCouch.

0.4.2 / 2014-06-30
==================

 * Fixed Object #<Object> has no method '_onSaved'.

0.4.1 / 2014-06-26
==================

 * Added a "load" event to the modella plugin.

0.4.0 / 2014-06-26
==================

 * Added a plugin for Modella (see /example).
 * API change: db.declare() does not auto-save design docs anymore - please use db.saveDesignDocs().
 * Rebuilt dbError() to httpError() and exported it.

0.3.3 / 2014-06-12
==================

 * Added db.all() and db.streamAll() to get all docs from a DB.

0.3.2 / 2014-06-06
==================

 * Pass real errors with streams. Fixed db.destroy().
 * Use carcass.highland.pipeThrough() with the tests.

0.3.1 / 2014-05-05
==================

 * Renamed an internal class (DB -> CouchDB) and use promise for internal cache.

0.3.0 / 2014-04-24
==================

 * Added db.saveDesignDocs().
 * Updated carcass.

0.2.0 / 2014-04-03
==================

 * Improved db.declare() to have design docs saved. Added db.view() and db.streamView().

0.1.0 / 2014-03-31
==================

 * Moved carcass and carcass-config from devDependencies to dependencies.
 * Moved to Wiredcraft.
 * Moved examples to /example.

0.0.1 / 2014-03-25
==================

 * Added singletons/couch.
 * Added classes: Couch and DB.
 * Added basic files.
 * Initial commit
