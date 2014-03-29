debug = require('debug')('carcass:couch:db')

carcass = require('carcass')
config = require('carcass-config')
through2 = require('through2')
isString = carcass.String.isString
last = carcass.Array.prototype.last

###*
 * Represents a CouchDB database.
###
module.exports = class DB
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
        db = @db()
        if db?
            done(null, db)
            return @
        config = @config() ? {}
        debug('getting db %s from CouchDB', @id(), config)
        # Connect.
        @couch().connect((err, conn) =>
            return done(err) if err
            db = conn.database(@id())
            # Check existence.
            db.exists((err, exists) =>
                return done(err) if err
                if exists
                    @db(db)
                    return done(null, db)
                # Create.
                db.create((err) =>
                    return done(err) if err
                    @db(db)
                    return done(null, db)
                )
            )
        )
        return @

    ###*
     * Destroy.
     *
     * @public
    ####
    destroy: (done = ->) ->
        @db()?.destroy(done)
        @db(null)
        return @

    ###*
     * Route read to get.
     *
     * @public
    ####
    read: (args...) ->
        done = last.call(args)
        @declare((err, db) -> if err then done?(err) else db.get(args...))

    ###*
     * Route save.
     *
     * @public
    ####
    save: (args...) ->
        done = last.call(args)
        @declare((err, db) -> if err then done?(err) else db.save(args...))

    ###*
     * Route remove.
     *
     * @public
    ####
    remove: (args...) ->
        done = last.call(args)
        @declare((err, db) -> if err then done?(err) else db.remove(args...))

    ###*
     * Save and read; just a shortcut.
     *
     * @public
    ####
    saveAndRead: (args...) ->
        done = args.pop()
        args.push((err, res) =>
            if err then done?(err) else @read(res.id, res.rev, done)
        )
        @save(args...)
        return @

    ###*
     * Stream APIs.
    ###

    ###*
     * Read data through a stream, where you pipe in an id or an object and pipe
     *   out a result or an error.
     *
     * @return {Transform} a transform stream
     *
     * @public
    ###
    streamRead: (options = {}) ->
        self = @
        return through2.obj((chunk, enc, done) ->
            if isString(chunk)
                self.read(chunk, (err, doc) =>
                    return done() if err
                    @push(doc)
                    done()
                )
                return
            # Assume it's an object otherwise.
            id = chunk._id ? chunk.id ? null
            rev = chunk._rev ? chunk.rev ? null
            # .
            return done() if not id?
            self.read(id, rev, (err, doc) =>
                return done() if err
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
    streamSave: (options = {}) ->
        self = @
        return through2.obj((chunk, enc, done) ->
            # Assume it's an object.
            id = chunk._id ? chunk.id ? null
            rev = chunk._rev ? chunk.rev ? null
            # .
            if id? and rev?
                self.save(id, rev, chunk, (err, res) =>
                    return done() if err
                    @push(res)
                    done()
                )
            else if id?
                self.save(id, chunk, (err, res) =>
                    return done() if err
                    @push(res)
                    done()
                )
            else
                self.save(chunk, (err, res) =>
                    return done() if err
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
    streamSaveAndRead: (options = {}) ->
        self = @
        return through2.obj((chunk, enc, done) ->
            # Assume it's an object.
            id = chunk._id ? chunk.id ? null
            rev = chunk._rev ? chunk.rev ? null
            # .
            if id? and rev?
                self.saveAndRead(id, rev, chunk, (err, doc) =>
                    return done() if err
                    @push(doc)
                    done()
                )
            else if id?
                self.saveAndRead(id, chunk, (err, doc) =>
                    return done() if err
                    @push(doc)
                    done()
                )
            else
                self.saveAndRead(chunk, (err, doc) =>
                    return done() if err
                    @push(doc)
                    done()
                )
        )

###*
 * Mixins.
###
carcass.mixable(DB)
DB::mixin(carcass.proto.uid)
DB::mixin(config.proto.consumer)
