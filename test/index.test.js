/*!
 * Middleware Emitter.
 *
 * Main test file.
 * @created 27/03/2017 NZDT
 */

/**
 * Module dependencies.
 */

const test = require('ava');
const MiddlewareEmitter = require('../');

const emitter = new MiddlewareEmitter({});

test('fist', (t) => {
  let total = 0;
  const expectedRes1 = { ctx: { one: true, two: true } };
  const expectedReq1 = {
    ctx: { hello: 'world', three: true },
    event: { name: 'test' }
  };

  emitter
    .on(
      ['test', 'hello'],
      (req, res, next) => {
        res.ctx.one = true;
        next();
      },

      (req, res, next) => {
        res.ctx.two = true;
        next();
      },

      {
        three: true
      },

      (req, res, next) => {
        next(new Error('Custom Error.'));
      },

      (req, res, next, err) => {
        t.deepEqual(err.message, 'Custom Error.') || total++;
        next();
      },

      (req, res) => {
        t.deepEqual(req, expectedReq1) || total++;
        t.deepEqual(res, expectedRes1) || total++;
      }
    )
    .emit(['test'], { hello: 'world' });

  t.is(total, 3, 'total');
  t.pass();
});

test('second', (t) => {
  let total = 0;

  emitter.emit('hello');

  const events = ['t1', 't2', 't3', 't4', 't5'];

  emitter
    .on(
      events,

      (req) => {
        t.truthy(events.includes(req.event.name)) || total++;
        t.deepEqual(req.ctx.some, 'data') || total++;
      }
    )
    .emit(events, { some: 'data' });

  emitter
    .on(
      'errors',
      (req, res, next) => {
        next(new Error('Custom error 1'));
      },
      (req, res, next, err) => {
        t.deepEqual(err.message, 'Custom error 1') || total++;
        next();
      },
      (req, res, next) => {
        next(new Error('Custom error 2'));
      },
      (req, res, next, err) => {
        t.deepEqual(err.message, 'Custom error 2') || total++;
      }
    )
    .emit('errors');

  emitter
    .on(
      'more-errors',
      (req, res, next, err) => {
        t.deepEqual(err.message, 'Custom error') || total++;
      },
      (req, res, next) => {
        next(new Error('Custom error'));
      }
    )
    .emit('more-errors');

  t.true(total > 0, 'total');
  t.pass();
});
