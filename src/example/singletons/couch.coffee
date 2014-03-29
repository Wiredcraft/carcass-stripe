lib = require('../')

###*
 * Just an example.
 *
 * This is how we use a single connection for the entire project.
###
module.exports = lib.getConsumer('Couch', 'couch')
