carcass = require('carcass')
config = require('carcass-config')

# The lib.
module.exports = lib = carcass.mixable()
lib.mixin(carcass.proto.register)
lib.mixin(config.proto.manager)

# Register.
lib.register(__dirname, name) for name in ['classes', 'singletons']

# Stack config files.
path = require('path')
lib.configDir(path.resolve(__dirname, 'configs')).initConfig()
