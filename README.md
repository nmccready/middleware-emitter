# middleware-wrap-emitter [![Build Status](https://travis-ci.org/nmccready/middleware-wrap-emitter.svg)](https://travis-ci.org/nmccready/middleware-wrap-emitter)

Forked and Inspired by [middleware-emitter][https://github.com/jarradseers/middleware-emitter]. The libraries are similar except, this library wraps an emitter instead of inheriting one.

This allows you to not only break up logic for when an event is fired, but let's you share middleware between frameworks if necessary.

The middleware-wrap-emitter project also brings multiple event triggering and capturing.

_req_ The req is the 'request', req object which can be used as context or whatever you want.

_res_ The res is the 'response', is the context on the response, it's used to build up the output to be used later on.

You can think of the two like this - req = internal (chain only, imagine storing all data for calculation), res = external, when you are at the end of the chain - it's this object that you will want to use for display.

## Usage

Assuming you have broken up your **async** (promised based) middleware functions:

```js
const emitter = require('middleware-wrap-emitter');
const app = require('./middleware/app');

emitter
  .on('hello', app.handleError, app.load, app.hello, app.output)
  .emit('hello');
```

Just like [koa](https://github.com/koajs/koa/blob/master/docs/error-handling.md) error handling middlewares should be defined early on.

## Installation

```sh
$ npm install middleware-wrap-emitter
```

## Features

* Create an event middleware chain.
* Inject middleware functions.
* Build up the res chain for output.
* Build up the req chain for internal chain state.
* Listen to multiple events on the same chain.
* Emit multiple events at once.
* Simple, fast, light-weight.
* Written in ES6+ for node.js 8+.
* Test driven.

## Options

MiddlewareWrapEmitter extends the base EventEmitter class, therefore all standard options apply.

## Examples

A simple standalone example:

```js
const Emitter = require('middleware-wrap-emitter');

const emitter = new Emitter() || new Emitter({}, require('election').ipcMain);

emitter
  .on(
    'hello',

    async ({ req, res }, next) => {
      res.ctx.hello = 'world';
      await next();
    },

    async ({ req, res }) => {
      console.log(res.ctx); // { hello: 'world' }
    }
  )

  .emit('hello');
```

Listen / emit multiple events:

```js
emitter
  .on(
    ['hello', 'other', 'test'],

    async ({ req, res }, next) => {
      console.log(req.event.name);
    }
  )

  .emit(['hello', 'other', 'test']);

// hello
// other
// test
```

Inject data into the req (request) context:

```js
emitter
  .on(
    'inject',

    { hello: 'world' },

    async ({ req, res }, next) => {
      await next();
      console.log(req.ctx);
    }
  )

  .emit('inject', { some: 'data' });

// { some: 'data', hello: 'world' }
```

If you add a function with the 4th parameter of 'err', you can gracefully handle errors:

```js
emitter
  .on(
    'ohno',
    async ({ req, res }, next) => {
      try {
        await next();
      } catch (err) {
        console.error(err); // Oh no, something went wrong...
      }
    },
    async (req, res, next) => {
      await next();
    },
    async ({ req, res }, next) => {
      await next();
      new Error('Oh no, something went wrong...');
    }
  )
  .emit('ohno');

// Error: Oh no, something went wrong... + stack, will not continue!
```

Error handling should be done early on in the chain. If an error ocurs and is handled the rest of the chain is not processed. Therefor you need to handle your errors!

Check out the [test folder](test) for more!

## Tests

From the package

```bash
$ npm test
```

## License

[MIT](LICENSE)
