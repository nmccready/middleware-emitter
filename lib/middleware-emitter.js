/*!
 * Middleware Emitter.
 *
 * Middleware Emitter Class.
 * @created 27/03/2017 NZDT
 */

/**
 * Module dependencies.
 */

const EventEmitter = require('events');
const WrapEmitter = require('./middleware-wrap-emitter');

/**
 * MiddlewareEmitter class.
 *
 * @class MiddlewareEmitter
 * @extends {EventEmitter}
 */

class MiddlewareEmitter extends WrapEmitter {
  /**
   * Creates an instance of MiddlewareEmitter.
   *
   * @param {object} options emitter options.
   *
   * @memberOf MiddlewareEmitter
   */

  constructor(options) {
    super(new EventEmitter(), options);
    this.options = options;
  }
}

/**
 * Module exports.
 */

module.exports = MiddlewareEmitter;
