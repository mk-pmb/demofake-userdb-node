/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var udb, PT, pathLib = require('path');

udb = function DemoFakeUserDb(opts) {
  if (!(this instanceof DemoFakeUserDb)) { return new DemoFakeUserDb(opts); }
  this.opts = (opts || {});
  this.name = (this.opts.name);
  this.users = Object.create(null);
};
PT = udb.prototype;


PT.defaultFilePrefixes = [
  ['cwd://', 'userdb.'],
  [module.filename, '..', 'userdb.'],
];


PT.toString = function () {
  var nicks = this.getNicks(), info = '[' + String(this.constructor.name);
  if (this.name) { info += ' "' + String(this.name) + '" '; }
  info += ': ' + nicks.length + ' users';
  if (nicks.length > 0) { info += ': ' + nicks.join(', '); }
  info += ']';
  return info;
};


function requireWithPrefix(prefix, fn) {
  if (Array.isArray(prefix)) {
    if (prefix[0] === 'cwd://') { prefix[0] = process.cwd(); }
    prefix = pathLib.normalize(pathLib.join.apply(pathLib, prefix));
  }
  return require(prefix + fn);
}


PT.addUsersFromFile = function (srcFn, customProps) {
  var self = this, prefixes = self.defaultFilePrefixes,
    newUsers, usersDb = self.users;
  if (srcFn.indexOf('/') < 0) {
    prefixes.forEach(function (prefix) {
      if (newUsers) { return; }
      try { newUsers = requireWithPrefix(prefix, srcFn); } catch (ignore) {}
    });
  }
  if (!newUsers) {
    newUsers = requireWithPrefix(prefixes[0], srcFn + '.json');
  }
  return newUsers.map(function addUser(u) {
    usersDb[u.nick] = u;
    if (customProps) {
      Object.keys(customProps).forEach(function (prop) {
        u[prop] = customProps[prop];
      });
    }
    return u;
  });
};

PT.getUser    = function (nick) { return (this.users[nick] || false); };
PT.getNicks   = function () { return Object.keys(this.users); };
PT.countUsers = function () { return this.getNicks().length; };

PT.hasPropEql = function (propName, compare, nick) {
  return (this.getUser(nick)[propName] === compare);
};















module.exports = udb;
