# debug = require('debug')('carcass:plugin:modella')

_ = require('lodash')
carcass = require('carcass')

###*
 * Plugin for Modella.
 *
 * Add the ability of doing CRUD with CouchDB to a model.
###
module.exports = (Model) ->

    ###*
     * Meant to be overridden.
     *
     * @return {Object} a doc that will be saved to DB.
    ###
    Model::toDoc = -> @toJSON()

    ###*
     * Meant to be overridden.
     *
     * @return {Object} an instance of CouchDB.
    ###
    Model.db = -> throw new Error('require a DB instance')

    ###*
     * Accessor.
    ###
    Model::db = carcass.helpers.accessor('_db', {
        getDefault: -> return @model.db()
    })

    ###*
     * Shortcut to load data from DB and instantiate a new model.
     *
     * @return {Object} the loaded model.
    ###
    Model.load = (id, done = ->) -> (new Model({ _id: id })).load(done)

    ###*
     * Load.
     *
     * @return {this}
    ###
    Model::load = (done = ->) ->
        db = @db()
        db.read(@primary(), (err, doc) =>
            return done(db.httpError(err)) if err
            @set(doc)
            # Just loaded; nothing dirty.
            @dirty = {}
            # Allow model to be changed while loading.
            @run('loading', (err) =>
                # TODO: handle err?
                # Model can become dirty.
                return @save(done) if not _.isEmpty(@dirty)
                # After load.
                @model.emit('load', @)
                @emit('load')
                # Pass self with the callback; keep consistency with the other
                # CRUD methods.
                done(null, @)
            )
        )
        return @

    ###*
     * Route save to CouchDB.
     *
     * @return {this}
    ###
    Model.save = (done = ->) ->
        db = @db()
        @db().saveAndRead(@toDoc(), (err, res) ->
            @_onSaved(err, res, done)
        )
        return @

    ###*
     * Route update to CouchDB.
     *
     * @return {this}
    ###
    Model.update = (done = ->) ->
        db = @db()
        @db().saveAndRead(@primary(), @toDoc(), (err, res) =>
            @_onSaved(err, res, done)
        )
        return @

    ###*
     * Route remove to CouchDB.
    ###
    Model.remove = (done = ->) ->
        @db().remove(@primary(), (err, res) ->
            # TODO: handle conflict nicely.
            return done(db.httpError(err)) if err
            done(null, res)
        )
        return @

    ###*
     * Handle the save result.
     *
     * @return {this}
    ###
    Model::_onSaved = (err, res, done = ->) ->
        # Not a valid error.
        if not err? or not err.headers? or not err.headers.status?
            done(null, res)
            return @
        self = @
        db = @db()
        status = err.headers.status
        # Conflict.
        if status is 409
            # Load the latest version.
            Model.load(@primary(), (err, model) ->
                return done(db.httpError(err)) if err
                # Merge, if a merge handler available.
                if model.mergeConflict?
                    model.mergeConflict(self)
                    model.save((err, model) ->
                        return done(db.httpError(err)) if err
                        done(null, model.toJSON())
                    )
                # Otherwise return the latest version (so this update is dropped).
                else
                    done(null, model.toJSON())
            )
        else
            done(db.httpError(err))
        return @
