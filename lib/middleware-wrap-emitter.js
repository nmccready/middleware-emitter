const EventEmitter = require('events');
const merge = require('object-merger');
const delegate = require('delegates');
const { isErrorFn } = require('./utils');

module.exports = class MiddlewareWrapEmitter {
  /**
   * Creates an instance of MiddlewareWrapEmitter.
   *
   * @param {object} options emitter options.
   * @param {Emitter|object} emitter emitter object.
   *
   * @memberOf MiddlewareWrapEmitter
   */
  constructor(options, emitter = new EventEmitter()) {
    this.emitter = emitter;
    this.options = options;

    // proxy all method calls from emitter to `this`
    Object.keys(emitter.constructor.prototype).forEach((name) => {
      if (
        typeof emitter[name] === 'function' &&
        !MiddlewareWrapEmitter.prototype[name]
      ) {
        delegate(this, 'emitter').method(name);
      }
    });
  }

  /**
   * Add event listener.
   *
   * @param {string} type event method type to call on this.emitter ('on' or 'once').
   * @param {array} chain array of middleware functions.
   *
   * @memberOf MiddlewareWrapEmitter
   */

  add(type, chain) {
    const req = {};
    const res = {};

    req.ctx = {};
    res.ctx = {};

    req.event = {};
    req.event.name = chain.shift();

    // find a function that handles an error
    let errorFn = chain.find(isErrorFn);

    /**
     * Next function.
     *
     * TODO: Convert to async / promises
     * @param {any} err
     * @returns
     */

    const next = (err) => {
      const context = { req, res };

      if (err instanceof Error) {
        errorFn = chain.find(isErrorFn) || errorFn;
        if (errorFn) return errorFn.call(this, context, next, err);
        throw err;
      }

      const fn = chain.shift();

      if (fn instanceof Function) {
        // only called by error if check above
        if (isErrorFn(fn)) return next.call(this, context, next);
        fn.call(this, context, next);
      } else if (fn instanceof Object) {
        req.ctx = merge(req.ctx, fn);
        return next.call(this, context, next);
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
   * @memberOf MiddlewareWrapEmitter
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
   * @memberOf MiddlewareWrapEmitter
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
   * @memberOf MiddlewareWrapEmitter
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
