var carcass, config, lib, name, path, _i, _len, _ref;

carcass = require('carcass');

config = require('carcass-config');

module.exports = lib = carcass.mixable();

lib.mixin(carcass.proto.register);

lib.mixin(config.proto.manager);

_ref = ['classes', 'singletons'];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  name = _ref[_i];
  lib.register(__dirname, name);
}

path = require('path');

lib.configDir(path.resolve(__dirname, 'configs')).initConfig();
