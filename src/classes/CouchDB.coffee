debug = require('debug')('carcass:couch:db')

_ = require('lodash')
Promise = require('bluebird')
through2 = require('through2')
carcass = require('carcass')
config = require('carcass-config')
highland = carcass.highland

###*
 * Represents a CouchDB database.
###
module.exports = class CouchDB
    ###*
     * Constructor.
    ###
    constructor: (options) ->
        @id(options)
        # Only lowercase characters (a-z), digits (0-9), and any of the
        # characters _, $, (, ), +, -, and / are allowed. Must begin with a
        # letter.
        @id(@id().toLowerCase().replace(/^[^a-z]+/, ''))
        debug('initializing the %s db.', @id())

    ###*
     * Cache of the couch instance.
     *
     * @type {Function}
    ###
    couch: carcass.helpers.accessor('_couch')

    ###*
     * Cache of the db instance.
     *
     * @type {Function}
    ###
    db: carcass.helpers.accessor('_db')

    ###*
     * Declare.
     *
     * @public
    ###
    declare: (done = ->) ->
        fulfilled = (db) -> done(null, db)
        promise = @db()
        if promise?
            promise.then(fulfilled, done)
            return @
        config = @config() ? {}
        debug('getting db %s from CouchDB', @id(), config)
        promise = new Promise((resolve, reject) =>
            # Connect.
            @couch().connect((err, conn) =>
                return reject(err) if err
                db = conn.database(@id())
                # Check existence.
                db.exists((err, exists) ->
                    return reject(err) if err
                    return resolve(db) if exists
                    # Create.
                    db.create((err) ->
                        return reject(err) if err
                        # Save design documents. This doesn't block the process
                        # and we don't care if there's a broken view.
                        if config.design?
                            for key, doc of config.design
                                db.save('_design/' + key, doc, (err) ->
                                    debug(err) if err
                                )
                        return resolve(db)
                    )
                )
            )
        )
        # Cache the promise.
        @db(promise)
        promise.then(fulfilled, done)
        return @

    ###*
     * Destroy.
     *
     * @public
    ####
    destroy: (done = ->) ->
        promise = @db()
        if not promise?
            done()
            return @
        promise.then((db) ->
            db.destroy(done)
        , done)
        @db(null)
        return @

    ###*
     * Save design documents.
    ###
    saveDesignDocs: (done = ->) ->
        config = @config() ? {}
        @declare((err, db) ->
            return done(err) if err
            return done() if not config.design?
            highland(_.pairs(config.design)).flatMap((pair) ->
                return highland.wrapInvoke('save', '_design/' + pair[0], pair[1])(db)
            ).on('error', (err) -> done(err)).toArray((res) -> done(null, res))
        )
        return @

    ###*
     * Route read to get.
     *
     * @public
    ####
    read: (args..., done = ->) ->
        @declare((err, db) -> if err then done(err) else db.get(args..., done))

    ###*
     * Route save.
     *
     * @public
    ####
    save: (args..., done = ->) ->
        @declare((err, db) -> if err then done(err) else db.save(args..., done))

    ###*
     * Route remove.
     *
     * @public
    ####
    remove: (args..., done = ->) ->
        @declare((err, db) -> if err then done(err) else db.remove(args..., done))

    ###*
     * Save and read; just a shortcut.
     *
     * @public
    ####
    saveAndRead: (args..., done = ->) ->
        @save(args..., (err, res) =>
            if err then done(err) else @read(res.id, res.rev, done)
        )
        return @

    ###*
     * Route view.
     *
     * @public
    ####
    view: (args..., done = ->) ->
        @declare((err, db) -> if err then done(err) else db.view(args..., done))

    ###*
     * Stream APIs.
     *
     * TODO: handle errors?
    ###

    ###*
     * Read data through a stream, where you pipe in an id or an object and pipe
     *   out a result or an error.
     *
     * @return {Transform} a transform stream
     *
     * @public
    ###
    streamRead: ->
        self = @
        return through2.obj((chunk, enc, done) ->
            # String is used as _id.
            if _.isString(chunk)
                self.read(chunk, (err, doc) =>
                    return done(dbError(err)) if err
                    @push(doc)
                    done()
                )
                return
            # Assume it's an object otherwise.
            id = chunk._id ? chunk.id ? null
            rev = chunk._rev ? chunk.rev ? null
            return done(new Error('id is required')) if not id?
            self.read(id, rev, (err, doc) =>
                return done(dbError(err)) if err
                @push(doc)
                done()
            )
        )

    ###*
     * Save data through a stream, where you pipe in data and pipe out the
     *   result.
     *
     * @return {Transform} a transform stream
     *
     * @public
    ###
    streamSave: ->
        self = @
        return through2.obj((chunk, enc, done) ->
            # Assume it's an object.
            id = chunk._id ? chunk.id ? null
            rev = chunk._rev ? chunk.rev ? null
            # .
            if id? and rev?
                self.save(id, rev, chunk, (err, res) =>
                    return done(dbError(err)) if err
                    @push(res)
                    done()
                )
            else if id?
                self.save(id, chunk, (err, res) =>
                    return done(dbError(err)) if err
                    @push(res)
                    done()
                )
            else
                self.save(chunk, (err, res) =>
                    return done(dbError(err)) if err
                    @push(res)
                    done()
                )
        )

    ###*
     * Save data through a stream, ...
     *
     * @return {Transform} a transform stream
     *
     * @public
    ###
    streamSaveAndRead: ->
        self = @
        return through2.obj((chunk, enc, done) ->
            # Assume it's an object.
            id = chunk._id ? chunk.id ? null
            rev = chunk._rev ? chunk.rev ? null
            # .
            if id? and rev?
                self.saveAndRead(id, rev, chunk, (err, doc) =>
                    return done(dbError(err)) if err
                    @push(doc)
                    done()
                )
            else if id?
                self.saveAndRead(id, chunk, (err, doc) =>
                    return done(dbError(err)) if err
                    @push(doc)
                    done()
                )
            else
                self.saveAndRead(chunk, (err, doc) =>
                    return done(dbError(err)) if err
                    @push(doc)
                    done()
                )
        )

    ###*
     * Read a view through a stream, where you pipe in a key or an object and
     *   pipe out the results or an error.
     *
     * @param {String} view the view name e.g. 'myDesign/myView'
     *
     * @return {Transform} a transform stream
     *
     * @public
    ###
    streamView: (view) ->
        self = @
        return through2.obj((chunk, enc, done) ->
            if not _.isObject(chunk)
                chunk = if chunk? then { key: chunk } else {}
            self.view(view, chunk, (err, docs) =>
                return done(dbError(err)) if err
                @push(doc) for doc in docs
                done()
            )
        )

###*
 * Mixins.
###
carcass.mixable(CouchDB)
CouchDB::mixin(carcass.proto.uid)
CouchDB::mixin(config.proto.consumer)

###*
 * Helper.
 *
 * For the streams.
 *
 * Until Cradle returns real errors.
###
dbError = (err) ->
    if err? and err.error
        return new Error(err.error)
    return err
