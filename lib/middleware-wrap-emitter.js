const EventEmitter = require('events');
const merge = require('object-merger');
const delegate = require('delegates');
const compose = require('koa-compose');

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

  add(type, name, chain) {
    let req = {};
    const res = {};

    const next = compose(chain);

    this.emitter[type](name, (data) => {
      req = merge(req, data);
      next.call(this, { req, res, event: { name } });
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
      this.add('on', event, args);
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
    this.add('once', args.shift(), args);
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
