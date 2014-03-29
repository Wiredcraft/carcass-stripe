carcass = require('carcass')

# The lib.
module.exports = lib = carcass.mixable()
lib.mixin(carcass.proto.register)

# Register.
lib.register(__dirname, name) for name in ['classes']
