debug = require('debug')('carcass:couch')

cradle = require('cradle')
carcass = require('carcass')
config = require('carcass-config')

###*
 * Represents a CouchDB connection.
###
module.exports = class Couch
    ###*
     * Constructor.
    ###
    constructor: (options) ->
        @id(options)
        debug('initializing couch %s.', @id())

    ###*
     * Cache of the connection.
     *
     * @type {Function}
    ###
    connection: carcass.helpers.accessor('_connection')

    ###*
     * Connect.
     *
     * @public
    ###
    connect: (done = ->) ->
        conn = @connection()
        if conn?
            done(null, conn)
            return @
        config = @config() ? {}
        debug('%s connecting to CouchDB', @id(), config)
        # Connect.
        conn = new cradle.Connection(config)
        # Cache connection.
        @connection(conn)
        done(null, conn)
        return @

    ###*
     * Disconnect.
     *
     * @public
    ###
    disconnect: ->
        # TODO: it's buggy, I guess.
        # @connection()?.close()
        @connection(null)
        return @

    ###*
     * Get a DB instance.
     *
     * @public
    ###
    getDB: (options) ->
        return @configManager().getConsumer('DB', options).couch(@)

###*
 * Mixins.
###
carcass.mixable(Couch)
Couch::mixin(carcass.proto.uid)
Couch::mixin(config.proto.consumer)
