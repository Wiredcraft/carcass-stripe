var carcass, config, couch, lib, name, path, stripe, _i, _len, _ref;

stripe = require('..');

carcass = require('carcass');

couch = require('carcass-couch');

config = require('carcass-config');

module.exports = lib = carcass.mixable();

lib.mixin(carcass.proto.register);

lib.mixin(config.proto.manager);

lib.extend(couch, 'classes');

lib.extend(couch, 'plugins');

lib.extend(stripe, 'classes');

lib.extend(stripe, 'plugins');

lib.extend(stripe, 'middlewares');

_ref = ['models', 'singletons'];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  name = _ref[_i];
  lib.register(__dirname, name);
}

path = require('path');

lib.configDir(path.resolve(__dirname, 'configs')).initConfig();
