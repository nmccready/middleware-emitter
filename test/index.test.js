const test = require('ava');
const EventEmitter = require('events');
const MiddleWrapEmitter = require('../');
const Bluebird = require('bluebird');

global.Promise = Bluebird;

[
  new MiddleWrapEmitter({}),
  new MiddleWrapEmitter({}, new EventEmitter())
].forEach((emitter) => {
  test.cb('all middle ware is called and handled', (t) => {
    let total = 0;
    const expectedRes1 = { one: true, two: true };
    const expectedReq1 = { hello: 'world', three: true };

    emitter
      .on(
        ['test', 'hello'],
        async ({ req, res }, next) => {
          try {
            await next();
          } catch (err) {
            t.deepEqual(err.message, 'Custom Error.', 'Error is Caught') ||
              total++;
            t.is(total, 4, 'total');
            t.end();
          }
        },
        async ({ req, res }, next) => {
          res.one = true;
          await next();
        },
        async ({ req, res }, next) => {
          res.two = true;
          await next();
        },
        async ({ req, res }, next) => {
          req.three = true;
          await next();
        },
        async ({ req, res }, next) => {
          await next(); // allows next callback (below) to run
          throw new Error('Custom Error.');
        },
        async ({ req, res, event: { name } }, next) => {
          t.deepEqual(req, expectedReq1, 'request') || total++;
          t.deepEqual(res, expectedRes1, 'response') || total++;
          t.deepEqual(name, 'test', 'event name') || total++;
          await next();
        }
      )
      .emit(['test'], { hello: 'world' });
  });

  test.cb('emits all events across all handlers', (t) => {
    let total = 0;

    const events = ['t1', 't2', 't3', 't4', 't5'];

    emitter
      .on(events, async ({ req, event: { name } }) => {
        t.truthy(events.includes(name));
        t.deepEqual(req.some, 'data') || total++;

        if (events.length === total) {
          t.end();
        }
      })
      .emit(events, { some: 'data' });
  });

  test.cb('specific errors can be handled (async)', (t) => {
    let total = 0;

    class CustomError1 extends Error {}
    class CustomError2 extends Error {}

    emitter
      .on(
        ['errors2', 'errors1'],
        async ({ req, res }, next) => {
          try {
            await next();
          } catch (err) {
            if (err instanceof CustomError2) {
              t.deepEqual(err.message, 'Custom error 2', 'catch error2') ||
                total++;
            } else if (err instanceof CustomError1) {
              t.deepEqual(err.message, 'Custom error 1', 'catch error1') ||
                total++;
              t.deepEqual(total, 2, 'total errors');
              t.end();
            } else {
              t.fail(err);
              t.pass();
            }
          }
        },
        async ({ req, res, event: { name } }, next) => {
          await next();
          if (name === 'errors1') throw new CustomError1('Custom error 1');
        },
        async ({ req, res, event: { name } }, next) => {
          await next();
          if (name === 'errors2') throw new CustomError2('Custom error 2');
        },
        async (_, next) => {
          await next();
        }
      )
      .emit('errors2')
      .emit('errors1');
  });

  test.cb('specific errors can be handled (Bluebird)', (t) => {
    let total = 0;

    class CustomError1 extends Error {}
    class CustomError2 extends Error {}

    emitter
      .on(
        ['errors2', 'errors1'],
        ({ req, res }, next) => {
          return next() // BLUEBIRD SUGAR
            .catch(CustomError2, (err) => {
              t.deepEqual(err.message, 'Custom error 2', 'catch error2') ||
                total++;
            })
            .catch(CustomError1, (err) => {
              t.deepEqual(err.message, 'Custom error 1', 'catch error1') ||
                total++;
              t.deepEqual(total, 2, 'total errors');
              t.end();
            })
            .catch(CustomError2, (err) => {
              t.fail(err);
              t.end();
            });
        },
        async ({ req, res, event: { name } }, next) => {
          await next();
          if (name === 'errors1') throw new CustomError1('Custom error 1');
        },
        async ({ req, res, event: { name } }, next) => {
          await next();
          if (name === 'errors2') throw new CustomError2('Custom error 2');
        },
        async (_, next) => {
          await next();
        }
      )
      .emit('errors2')
      .emit('errors1');
  });
});
