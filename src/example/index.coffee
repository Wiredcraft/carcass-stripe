couch = require('../')
carcass = require('carcass')
config = require('carcass-config')
extend = carcass.Object.extendProperties

# The lib.
module.exports = lib = carcass.mixable()
lib.mixin(carcass.proto.register)
lib.mixin(config.proto.manager)

# Integrate.
lib.classes = {}
extend(lib.classes, couch.classes)

# Register.
lib.register(__dirname, name) for name in ['singletons']

# Stack config files.
path = require('path')
lib.configDir(path.resolve(__dirname, 'configs')).initConfig()
