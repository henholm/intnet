/* jslint node: true */

'use strict';

/**
 * @class User
 */
class User {
  constructor(name) {
    this.socket = null;
    this.name = name;
  }
}

module.exports = User;
