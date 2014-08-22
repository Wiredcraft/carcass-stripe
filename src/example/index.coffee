stripe = require('..')
carcass = require('carcass')
couch = require('carcass-couch')
config = require('carcass-config')

# The lib.
module.exports = lib = carcass.mixable()
lib.mixin(carcass.proto.register)
lib.mixin(config.proto.manager)

# Integrate.
lib.extend(couch, 'classes')
lib.extend(couch, 'plugins')

lib.extend(stripe, 'classes')
lib.extend(stripe, 'plugins')
lib.extend(stripe, 'middlewares')

# Register.
lib.register(__dirname, name) for name in ['models', 'singletons']

# Stack config files.
path = require('path')
lib.configDir(path.resolve(__dirname, 'configs')).initConfig()
