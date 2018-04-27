/**
 * Module dependencies.
 */

const merge = require('object-merger');

/**
 * MiddlewareEmitter class.
 *
 * @class MiddlewareEmitter
 * @extends {EventEmitter}
 */

module.exports = class MiddlewareWrapEmitter {
  /**
   * Creates an instance of MiddlewareEmitter.
   *
   * @param {Emitter|object} emitter emitter object.
   * @param {object} options emitter options.
   *
   * @memberOf MiddlewareEmitter
   */
  constructor(emitter, options) {
    this.emitter = emitter;
    this.options = options;
  }

  /**
   * Add event listener.
   *
   * @param {string} type event method type to call on this.emitter ('on' or 'once').
   * @param {array} chain array of middleware functions.
   *
   * @memberOf MiddlewareEmitter
   */

  add(type, chain) {
    const req = {};
    const res = {};

    req.ctx = {};
    res.ctx = {};

    req.event = {};
    req.event.name = chain.shift();

    let error = chain.find((fn) => fn.length > 3);

    /**
     * Next function.
     *
     * @param {any} err
     * @returns
     */

    const next = (err) => {
      if (err instanceof Error) {
        error = chain.find((fn) => fn.length > 3) || error;
        if (error) return error.call(this, req, res, next, err);
        throw err;
      }

      const fn = chain.shift();

      if (fn instanceof Function) {
        if (fn.length > 3) return next.call(this, req, res, next);
        fn.call(this, req, res, next);
      } else if (fn instanceof Object) {
        req.ctx = merge(req.ctx, fn);
        return next.call(this, req, res, next);
      }

      return this;
    };

    this.emitter[type](req.event.name, (data) => {
      req.ctx = merge(req.ctx, data);
      next.call(this);
    });

    return this;
  }

  /**
   * On event.
   *
   * @param {any} arguments0 event name / array of event names.
   * @param {function} arguments middleware functions.
   *
   * @memberOf MiddlewareEmitter
   */

  on(...args) {
    let events = args.shift();

    events = Array.isArray(events) ? events : [events];

    events.forEach((event) => {
      this.add('on', [event].concat(...args));
    });

    return this;
  }

  /**
   * Trigger event once.
   *
   * @param {string} arguments0 event name.
   * @param {function} arguments middleware functions.
   *
   * @memberOf MiddlewareEmitter
   */

  once(...args) {
    this.add('once', ...args);
    return this;
  }

  /**
   * Fire events.
   *
   * @param {any} arguments0 event name or array of event names.
   * @param {function} arguments middleware functions.
   *
   * @memberOf MiddlewareEmitter
   */

  emit(...args) {
    let events = args.shift();

    events = Array.isArray(events) ? events : [events];

    events.forEach((event) => {
      this.emitter.emit(...[event].concat(...args));
    });

    return this;
  }
};
