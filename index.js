var carcass, lib, name, _i, _len, _ref;

carcass = require('carcass');

module.exports = lib = carcass.mixable();

lib.mixin(carcass.proto.register);

_ref = ['classes'];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  name = _ref[_i];
  lib.register(__dirname, name);
}
