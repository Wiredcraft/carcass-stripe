couch = require('../')
carcass = require('carcass')
config = require('carcass-config')

# The lib.
module.exports = lib = carcass.mixable()
lib.mixin(carcass.proto.register)
lib.mixin(config.proto.manager)

# Integrate.
lib.extend(couch, 'classes')
lib.extend(couch, 'plugins')
lib.extend(couch, 'middlewares')

# Register.
lib.register(__dirname, name) for name in ['models', 'singletons']

# Stack config files.
path = require('path')
lib.configDir(path.resolve(__dirname, 'configs')).initConfig()
