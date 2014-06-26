debug = require('debug')('carcass:model:lorem')

lib = require('../')
modella = require('modella')
validation = require('modella-validators')

module.exports = Lorem = modella('Lorem')

Lorem.use(validation)
Lorem.use(lib.plugins.modella)

###*
 * Attributes.
###
Lorem.attr('name', {
    type: 'string'
})

###*
 * _id and _rev are for CouchDB.
###
Lorem.attr('_id')
Lorem.attr('_rev')

###*
 * The DB instance.
###
Lorem.db = ->
    config = lib.get('Lorem') ? {}
    dbName = config.dbName ? 'lorems'
    return lib.singletons.dbs[dbName] ? lib.singletons.couch.getDB(dbName)

###*
 * Just an example.
###
Lorem.on('saving', (lorem, done) ->
    # Fix name.
    lorem.name(lorem.name().toLowerCase())
    done()
)

###*
 * Just an example.
###
Lorem.on('loading', (lorem, done) ->
    # Fix name.
    lorem.name(lorem.name().toLowerCase())
    done()
)

###*
 * Just an example.
 *
 * @param {Object} model the model that just failed to update (conflict with
 *   `this`).
###
Lorem::mergeConflict = (model) ->
    # Do nothing, meaning drop it.
    debug(model.toJSON())
