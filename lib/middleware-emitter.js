const EventEmitter = require('events');
const WrapEmitter = require('./middleware-wrap-emitter');

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
