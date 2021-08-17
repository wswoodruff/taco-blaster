(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require('regenerator-runtime');

require('./particles-on-click'); // Sound offfff!!!!!!


console.log('TACOOOOOOOOOOOOOOOOOOOOS!!!');
var DEBUG = false;
var TACOS_ROOM_ID = 'tacos-n-friends';
var MY_TACO_ID = 'my-taco';
var USE_NES = true;
var CURSOR_UPDATE_THROTTLE = 5;

var Throttle = require('lodash.throttle');

var Nes;

if (USE_NES) {
  Nes = require('@hapi/nes/lib/client');
} // const RECONNECT_TIMEOUT = 1000; // in milliseconds


var RoomClient; // This will get set by the server on connection

var roomUserId = null;

var addIdToElIfNotExists = function addIdToElIfNotExists(el, id) {
  var idEl = el.querySelector('.taco-id');

  if (!idEl) {
    var tacoId = document.createElement('div');
    tacoId.className = 'taco-id';
    tacoId.textContent = id;
    tacoId.style.color = 'white';
    tacoId.style.fontSize = '6px';
    tacoId.style.position = 'absolute';
    tacoId.style.transform = 'translateX(-25%)';
    tacoId.style.bottom = '-20px';
    tacoId.style.whiteSpace = 'nowrap';
    el.appendChild(tacoId);
  }
}; // Upsert user in room


var updateRoom = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref) {
    var roomId, userId, x, y, payload, _yield$RoomClient$req, _yield$RoomClient$req2, error, user, myTacoEl, connectionMsg;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            roomId = _ref.roomId, userId = _ref.userId, x = _ref.x, y = _ref.y;
            payload = {
              x: x,
              y: y
            };

            if (userId) {
              payload.id = userId;
            }

            _context.next = 5;
            return RoomClient.request({
              method: 'post',
              path: "/rooms/".concat(roomId, "/update"),
              payload: payload
            });

          case 5:
            _yield$RoomClient$req = _context.sent;
            _yield$RoomClient$req2 = _yield$RoomClient$req.payload;
            error = _yield$RoomClient$req2.error;
            user = _yield$RoomClient$req2.user;

            if (user) {
              roomUserId = user.id;
              myTacoEl = document.getElementById(MY_TACO_ID);
              addIdToElIfNotExists(myTacoEl, roomUserId);
            } // Setup some kinda easy debugging or something


            connectionMsg = document.getElementById('connectionMsg') || document.createElement('h3');
            connectionMsg.id = 'connectionMsg';

            if (error) {
              // let err = document.createElement(`<h3 style='color: white;'>Error ${error.message}</h3>`);
              connectionMsg.style.color = '#f88070';
              connectionMsg.textContent = "Error ".concat(error.message);
            } else {
              connectionMsg.style.color = '#73c991';
              connectionMsg.textContent = "Connected! x: ".concat(x || 'null', " y: ").concat(y || 'null');
            } // Add it


            document.body.appendChild(connectionMsg);
            return _context.abrupt("return", user);

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function updateRoom(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var myTaco = document.getElementById(MY_TACO_ID);

var moveCursor = function moveCursor(_ref3) {
  var element = _ref3.element,
      x = _ref3.x,
      y = _ref3.y;
  element.style.left = "".concat(x, "px");
  element.style.top = "".concat(y, "px");
}; // We need this wrapper to make async/await nice to write


var initSocket = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var _window, _window$location, protocol, host, url, wsLocation, connectionMsg, user, roomEl, onRoomUpdate;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!RoomClient) {
              _context2.next = 3;
              break;
            }

            _context2.next = 3;
            return RoomClient.disconnect();

          case 3:
            _window = window, _window$location = _window.location, protocol = _window$location.protocol, host = _window$location.host; // This will replace 'https' for 'ws' which will also leave 'wss' for 'https' protocols

            url = protocol.replace('http', 'ws') + '//' + host;
            wsLocation = url.replace('localhost:3001', 'localhost:3000');
            console.log('wsLocation', wsLocation);
            RoomClient = new Nes.Client(wsLocation);
            _context2.prev = 8;
            _context2.next = 11;
            return RoomClient.connect();

          case 11:
            _context2.next = 19;
            break;

          case 13:
            _context2.prev = 13;
            _context2.t0 = _context2["catch"](8);
            // Setup some kinda easy debugging or something
            connectionMsg = document.getElementById('connectionMsg') || document.createElement('h3');
            connectionMsg.id = 'connectionMsg';
            connectionMsg.style.color = '#f88070';
            connectionMsg.textContent = "Error ".concat(_context2.t0.message);

          case 19:
            _context2.next = 21;
            return updateRoom({
              roomId: TACOS_ROOM_ID,
              userId: roomUserId
            });

          case 21:
            user = _context2.sent;
            console.log('init user', user);
            roomEl = document.querySelector('.room');

            onRoomUpdate = function onRoomUpdate(props) {
              var id = props.id,
                  name = props.name,
                  _props$users = props.users,
                  users = _props$users === void 0 ? [] : _props$users,
                  isSync = props.isSync; // Thx copilot

              var usersNotMe = Object.keys(users).filter(function (id) {
                return id !== roomUserId;
              }).map(function (id) {
                return users[id];
              });
              var usersYesMe = users[Object.keys(users).find(function (id) {
                return id === roomUserId;
              })];
              var usersMarkedForDeletion = Object.values(usersNotMe).filter(function (_ref5) {
                var shouldDelete = _ref5.shouldDelete;
                return !!shouldDelete;
              }).map(function (_ref6) {
                var id = _ref6.id;
                return id;
              });
              var singleUsersNotMe = usersNotMe.length === 1 ? usersNotMe[0] : null;

              if (DEBUG) {
                console.log('');
                console.log('usersYesMe', usersYesMe);
                console.log('');
                console.log('usersNotMe', singleUsersNotMe ? singleUsersNotMe : usersNotMe);
              }

              if (usersYesMe) {
                moveCursor({
                  element: myTaco,
                  x: usersYesMe.x,
                  y: usersYesMe.y
                });
              }

              var getIds = function getIds(arr) {
                return arr.map(function (_ref7) {
                  var id = _ref7.id;
                  return id;
                });
              }; // Manage the ghost tacos


              var ghostTacos = Array.from(document.getElementsByClassName('ghost-taco'));
              var existingGhostIds = [];
              ghostTacos.forEach(function (tacoEl) {
                var tacoExistsInUsers = getIds(usersNotMe).includes(tacoEl.id); // Remove inactive tacos

                if (usersMarkedForDeletion.includes(tacoEl.id) || isSync && !tacoExistsInUsers) {
                  // Remove this taco
                  roomEl.removeChild(tacoEl);
                  return;
                }

                existingGhostIds.push(tacoEl.id);
                var tacoUpdate = usersNotMe.find(function (_ref8) {
                  var id = _ref8.id;
                  return id === tacoEl.id;
                });

                if (tacoUpdate) {
                  moveCursor({
                    element: tacoEl,
                    x: tacoUpdate.x,
                    y: tacoUpdate.y
                  });
                }
              });
              var newGhostIds = getIds(usersNotMe).filter(function (id) {
                return !existingGhostIds.includes(id);
              });
              newGhostIds.forEach(function (id) {
                // Add a new ghost taco
                var newTacoEl = document.createElement('div');
                newTacoEl.id = id;
                newTacoEl.classList.add('ghost-taco');
                newTacoEl.classList.add('taco-cursor');
                addIdToElIfNotExists(newTacoEl, id);
                roomEl.appendChild(newTacoEl);
                var userInfo = usersNotMe.find(function (_ref9) {
                  var id = _ref9.id;
                  return id === id;
                });
                moveCursor({
                  element: newTacoEl,
                  x: userInfo.x,
                  y: userInfo.y
                });
              });
            }; // Coooonnnnnneeeeeeecccccctttttttt!!!!!!!


            _context2.next = 27;
            return RoomClient.subscribe("/rooms/".concat(TACOS_ROOM_ID), onRoomUpdate);

          case 27:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[8, 13]]);
  }));

  return function initSocket() {
    return _ref4.apply(this, arguments);
  };
}();

var run = function run() {
  initSocket();
  var throttledBroadcast = Throttle(function (_ref10) {
    var x = _ref10.x,
        y = _ref10.y;
    // No point in awaiting this here
    updateRoom({
      roomId: TACOS_ROOM_ID,
      userId: roomUserId,
      x: x,
      y: y
    });
  }, CURSOR_UPDATE_THROTTLE); // Broadcast movements to the room and only
  // update my view with what we get from the server

  var onMouseMove = function onMouseMove(evt) {
    var mouseX = evt.pageX;
    var mouseY = evt.pageY;
    throttledBroadcast({
      x: mouseX,
      y: mouseY
    });
  };

  window.addEventListener('mousemove', onMouseMove);
};

run();
/****************************************************
      Brief attempt at websocket native stuff
****************************************************/
// const onSocketOpen = (evt) => {
//     console.log('open evt', evt);
//     // RoomClient.send('Hello Server!');
// };
// const onSocketMessage = (evt) => {
//     console.log('evt', evt);
//     console.log('Message from server ', evt?.data);
// };
// RoomClient = new WebSocket('ws://localhost:3000');
// // Listen for connection open
// RoomClient.removeEventListener('open', onSocketOpen);
// RoomClient.addEventListener('open', onSocketOpen);
// // Listen for messages
// RoomClient.removeEventListener('message', onSocketMessage);
// RoomClient.addEventListener('message', onSocketMessage);
// RoomClient.onclose = onSocketClose;
// const onSocketClose = (evt) => {
//     console.log('onclose evt', evt);
//     setTimeout(() => {
//         console.log('Reconnecting...');
//         initSocket();
//     }, RECONNECT_TIMEOUT);
// };

},{"./particles-on-click":2,"@hapi/nes/lib/client":3,"lodash.throttle":4,"regenerator-runtime":5}],2:[function(require,module,exports){
'use strict'; // Adapted from https://codepen.io/deanwagman/pen/EjLBdQ

console.log('Broooo'); // Little Canvas things

var canvas = document.querySelector("#canvas");
var ctx = canvas.getContext('2d'); // Set Canvas to be window size

canvas.width = window.innerWidth;
canvas.height = window.innerHeight; // Configuration, Play with these

var config = {
  particleNumber: 600,
  maxParticleSize: 20,
  maxSpeed: 40,
  colorVariation: 50
}; // Colors

var colorPalette = {
  bg: {
    r: 0,
    g: 0,
    b: 0
  },
  matter: [{
    r: 36,
    g: 18,
    b: 42
  }, // darkPRPL
  {
    r: 78,
    g: 36,
    b: 42
  }, // rockDust
  {
    r: 252,
    g: 178,
    b: 96
  }, // solorFlare
  {
    r: 253,
    g: 238,
    b: 152
  } // totesASun
  ]
}; // Some Variables hanging out

var particles = [];
var drawBg;
var centerX = canvas.width / 2;
var centerY = canvas.height / 2; // Draws the background for the canvas, because space

drawBg = function drawBg(ctx, color) {
  ctx.fillStyle = "rgb(" + color.r + "," + color.g + "," + color.b + ")";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}; // Particle Constructor


var Particle = function Particle(x, y) {
  // X Coordinate
  this.x = x || Math.round(Math.random() * canvas.width); // Y Coordinate

  this.y = y || Math.round(Math.random() * canvas.height); // Radius of the space dust

  this.r = Math.ceil(Math.random() * config.maxParticleSize); // Color of the rock, given some randomness

  this.c = colorVariation(colorPalette.matter[Math.floor(Math.random() * colorPalette.matter.length)], true); // Speed of which the rock travels

  this.s = Math.pow(Math.ceil(Math.random() * config.maxSpeed), .7); // Direction the Rock flies

  this.d = Math.round(Math.random() * 360);
}; // Provides some nice color variation
// Accepts an rgba object
// returns a modified rgba object or a rgba string if true is passed in for argument 2


var colorVariation = function colorVariation(color, returnString) {
  var r, g, b, a, variation;
  r = Math.round(Math.random() * config.colorVariation - config.colorVariation / 2 + color.r);
  g = Math.round(Math.random() * config.colorVariation - config.colorVariation / 2 + color.g);
  b = Math.round(Math.random() * config.colorVariation - config.colorVariation / 2 + color.b);
  a = Math.random() + .5;

  if (returnString) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  } else {
    return {
      r: r,
      g: g,
      b: b,
      a: a
    };
  }
}; // Used to find the rocks next point in space, accounting for speed and direction


var updateParticleModel = function updateParticleModel(p) {
  var a = 180 - (p.d + 90); // find the 3rd angle

  p.d > 0 && p.d < 180 ? p.x += p.s * Math.sin(p.d) / Math.sin(p.s) : p.x -= p.s * Math.sin(p.d) / Math.sin(p.s);
  p.d > 90 && p.d < 270 ? p.y += p.s * Math.sin(a) / Math.sin(p.s) : p.y -= p.s * Math.sin(a) / Math.sin(p.s);
  return p;
};

var tacoImg = document.createElement('img');
tacoImg.src = '/public/taco.png'; // Just the function that physically draws the particles
// Physically? sure why not, physically.

var drawParticle = function drawParticle(x, y, r, c) {
  ctx.drawImage(tacoImg, x, y, r * 2, r * 2);
}; // Remove particles that aren't on the canvas


var cleanUpArray = function cleanUpArray() {
  particles = particles.filter(function (p) {
    return p.x > -100 && p.y > -100;
  });
};

var initParticles = function initParticles(numParticles, x, y) {
  for (var i = 0; i < numParticles; i++) {
    particles.push(new Particle(x, y));
  }

  particles.forEach(function (p) {
    drawParticle(p.x, p.y, p.r, p.c);
  });
}; // That thing


window.requestAnimFrame = function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };
}(); // Our Frame function


var frame = function frame() {
  // Draw background first
  drawBg(ctx, colorPalette.bg); // Update Particle models to new position

  particles.map(function (p) {
    return updateParticleModel(p);
  }); // Draw em'

  particles.forEach(function (p) {
    drawParticle(p.x, p.y, p.r, p.c);
  }); // Play the same song? Ok!

  window.requestAnimFrame(frame);
}; // Click listener


document.body.addEventListener('click', function (event) {
  var x = event.clientX,
      y = event.clientY;
  cleanUpArray();
  initParticles(config.particleNumber, x, y);
}); // First Frame

frame(); // First particle explosion

initParticles(config.particleNumber);

},{}],3:[function(require,module,exports){
(function (global){(function (){
'use strict';

/*
    (hapi)nes WebSocket Client (https://github.com/hapijs/nes)
    Copyright (c) 2015-2016, Eran Hammer <eran@hammer.io> and other contributors
    BSD Licensed
*/

/* eslint no-undef: 0 */

(function (root, factory) {

    // $lab:coverage:off$

    if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = factory();                 // Export if used as a module
    }
    else if (typeof define === 'function' && define.amd) {
        define(factory);
    }
    else if (typeof exports === 'object') {
        exports.nes = factory();
    }
    else {
        root.nes = factory();
    }

    // $lab:coverage:on$

})(/* $lab:coverage:off$ */ typeof window !== 'undefined' ? window : global /* $lab:coverage:on$ */, () => {

    // Utilities

    const version = '2';
    const ignore = function () { };

    const stringify = function (message) {

        try {
            return JSON.stringify(message);
        }
        catch (err) {
            throw new NesError(err, errorTypes.USER);
        }
    };

    const nextTick = function (callback) {

        return (err) => {

            setTimeout(() => callback(err), 0);
        };
    };

    // NesError types

    const errorTypes = {
        TIMEOUT: 'timeout',
        DISCONNECT: 'disconnect',
        SERVER: 'server',
        PROTOCOL: 'protocol',
        WS: 'ws',
        USER: 'user'
    };

    const NesError = function (err, type) {

        if (typeof err === 'string') {
            err = new Error(err);
        }

        err.type = type;
        err.isNes = true;

        try {
            throw err; // ensure stack trace for IE11
        }
        catch (withStack) {
            return withStack;
        }
    };

    // Error codes

    const errorCodes = {
        1000: 'Normal closure',
        1001: 'Going away',
        1002: 'Protocol error',
        1003: 'Unsupported data',
        1004: 'Reserved',
        1005: 'No status received',
        1006: 'Abnormal closure',
        1007: 'Invalid frame payload data',
        1008: 'Policy violation',
        1009: 'Message too big',
        1010: 'Mandatory extension',
        1011: 'Internal server error',
        1015: 'TLS handshake'
    };

    // Client

    const Client = function (url, options) {

        options = options || {};

        this._isBrowser = typeof WebSocket !== 'undefined';

        if (!this._isBrowser) {
            options.ws = options.ws || {};

            if (options.ws.maxPayload === undefined) {
                options.ws.maxPayload = 0;              // Override default 100Mb limit in ws module to avoid breaking change
            }
        }

        // Configuration

        this._url = url;
        this._settings = options;
        this._heartbeatTimeout = false;             // Server heartbeat configuration

        // State

        this._ws = null;
        this._reconnection = null;
        this._reconnectionTimer = null;
        this._ids = 0;                              // Id counter
        this._requests = {};                        // id -> { resolve, reject, timeout }
        this._subscriptions = {};                   // path -> [callbacks]
        this._heartbeat = null;
        this._packets = [];
        this._disconnectListeners = null;
        this._disconnectRequested = false;

        // Events

        this.onError = (err) => console.error(err); // General error handler (only when an error cannot be associated with a request)
        this.onConnect = ignore;                    // Called whenever a connection is established
        this.onDisconnect = ignore;                 // Called whenever a connection is lost: function(willReconnect)
        this.onHeartbeatTimeout = ignore;           // Called when a heartbeat timeout will cause a disconnection
        this.onUpdate = ignore;

        // Public properties

        this.id = null;                             // Assigned when hello response is received
    };

    Client.WebSocket = /* $lab:coverage:off$ */ (typeof WebSocket === 'undefined' ? null : WebSocket); /* $lab:coverage:on$ */

    Client.prototype.connect = function (options) {

        options = options || {};

        if (this._reconnection) {
            return Promise.reject(new NesError('Cannot connect while client attempts to reconnect', errorTypes.USER));
        }

        if (this._ws) {
            return Promise.reject(new NesError('Already connected', errorTypes.USER));
        }

        if (options.reconnect !== false) {                  // Defaults to true
            this._reconnection = {                          // Options: reconnect, delay, maxDelay
                wait: 0,
                delay: options.delay || 1000,               // 1 second
                maxDelay: options.maxDelay || 5000,         // 5 seconds
                retries: options.retries || Infinity,       // Unlimited
                settings: {
                    auth: options.auth,
                    timeout: options.timeout
                }
            };
        }
        else {
            this._reconnection = null;
        }

        return new Promise((resolve, reject) => {

            this._connect(options, true, (err) => {

                if (err) {
                    return reject(err);
                }

                return resolve();
            });
        });
    };

    Client.prototype._connect = function (options, initial, next) {

        const ws = this._isBrowser ? new Client.WebSocket(this._url) : new Client.WebSocket(this._url, this._settings.ws);
        this._ws = ws;

        clearTimeout(this._reconnectionTimer);
        this._reconnectionTimer = null;

        const reconnect = (event) => {

            if (ws.onopen) {
                finalize(new NesError('Connection terminated while waiting to connect', errorTypes.WS));
            }

            const wasRequested = this._disconnectRequested;         // Get value before _cleanup()

            this._cleanup();

            const log = {
                code: event.code,
                explanation: errorCodes[event.code] || 'Unknown',
                reason: event.reason,
                wasClean: event.wasClean,
                willReconnect: this._willReconnect(),
                wasRequested
            };

            this.onDisconnect(log.willReconnect, log);
            this._reconnect();
        };

        const finalize = (err) => {

            if (next) {                     // Call only once when connect() is called
                const nextHolder = next;
                next = null;
                return nextHolder(err);
            }

            return this.onError(err);
        };

        const timeoutHandler = () => {

            this._cleanup();

            finalize(new NesError('Connection timed out', errorTypes.TIMEOUT));

            if (initial) {
                return this._reconnect();
            }
        };

        const timeout = (options.timeout ? setTimeout(timeoutHandler, options.timeout) : null);

        ws.onopen = () => {

            clearTimeout(timeout);
            ws.onopen = null;

            this._hello(options.auth)
                .then(() => {

                    this.onConnect();
                    finalize();
                })
                .catch((err) => {

                    if (err.path) {
                        delete this._subscriptions[err.path];
                    }

                    this._disconnect(() => nextTick(finalize)(err), true);         // Stop reconnection when the hello message returns error
                });
        };

        ws.onerror = (event) => {

            clearTimeout(timeout);

            if (this._willReconnect()) {
                return reconnect(event);
            }

            this._cleanup();
            const error = new NesError('Socket error', errorTypes.WS);
            return finalize(error);
        };

        ws.onclose = reconnect;

        ws.onmessage = (message) => {

            return this._onMessage(message);
        };
    };

    Client.prototype.overrideReconnectionAuth = function (auth) {

        if (!this._reconnection) {
            return false;
        }

        this._reconnection.settings.auth = auth;
        return true;
    };

    Client.prototype.reauthenticate = function (auth) {

        this.overrideReconnectionAuth(auth);

        const request = {
            type: 'reauth',
            auth
        };

        return this._send(request, true);
    };

    Client.prototype.disconnect = function () {

        return new Promise((resolve) => this._disconnect(resolve, false));
    };

    Client.prototype._disconnect = function (next, isInternal) {

        this._reconnection = null;
        clearTimeout(this._reconnectionTimer);
        this._reconnectionTimer = null;
        const requested = this._disconnectRequested || !isInternal;       // Retain true

        if (this._disconnectListeners) {
            this._disconnectRequested = requested;
            this._disconnectListeners.push(next);
            return;
        }

        if (!this._ws ||
            (this._ws.readyState !== Client.WebSocket.OPEN && this._ws.readyState !== Client.WebSocket.CONNECTING)) {

            return next();
        }

        this._disconnectRequested = requested;
        this._disconnectListeners = [next];
        this._ws.close();
    };

    Client.prototype._cleanup = function () {

        if (this._ws) {
            const ws = this._ws;
            this._ws = null;

            if (ws.readyState !== Client.WebSocket.CLOSED &&
                ws.readyState !== Client.WebSocket.CLOSING) {

                ws.close();
            }

            ws.onopen = null;
            ws.onclose = null;
            ws.onerror = ignore;
            ws.onmessage = null;
        }

        this._packets = [];
        this.id = null;

        clearTimeout(this._heartbeat);
        this._heartbeat = null;

        // Flush pending requests

        const error = new NesError('Request failed - server disconnected', errorTypes.DISCONNECT);

        const requests = this._requests;
        this._requests = {};
        const ids = Object.keys(requests);
        for (let i = 0; i < ids.length; ++i) {
            const id = ids[i];
            const request = requests[id];
            clearTimeout(request.timeout);
            request.reject(error);
        }

        if (this._disconnectListeners) {
            const listeners = this._disconnectListeners;
            this._disconnectListeners = null;
            this._disconnectRequested = false;
            listeners.forEach((listener) => listener());
        }
    };

    Client.prototype._reconnect = function () {

        // Reconnect

        const reconnection = this._reconnection;
        if (!reconnection) {
            return;
        }

        if (reconnection.retries < 1) {
            return this._disconnect(ignore, true);      // Clear _reconnection state
        }

        --reconnection.retries;
        reconnection.wait = reconnection.wait + reconnection.delay;

        const timeout = Math.min(reconnection.wait, reconnection.maxDelay);

        this._reconnectionTimer = setTimeout(() => {

            this._connect(reconnection.settings, false, (err) => {

                if (err) {
                    this.onError(err);
                    return this._reconnect();
                }
            });
        }, timeout);
    };

    Client.prototype.request = function (options) {

        if (typeof options === 'string') {
            options = {
                method: 'GET',
                path: options
            };
        }

        const request = {
            type: 'request',
            method: options.method || 'GET',
            path: options.path,
            headers: options.headers,
            payload: options.payload
        };

        return this._send(request, true);
    };

    Client.prototype.message = function (message) {

        const request = {
            type: 'message',
            message
        };

        return this._send(request, true);
    };

    Client.prototype._isReady = function () {

        return this._ws && this._ws.readyState === Client.WebSocket.OPEN;
    };

    Client.prototype._send = function (request, track) {

        if (!this._isReady()) {
            return Promise.reject(new NesError('Failed to send message - server disconnected', errorTypes.DISCONNECT));
        }

        request.id = ++this._ids;

        try {
            var encoded = stringify(request);
        }
        catch (err) {
            return Promise.reject(err);
        }

        // Ignore errors

        if (!track) {
            try {
                this._ws.send(encoded);
                return Promise.resolve();
            }
            catch (err) {
                return Promise.reject(new NesError(err, errorTypes.WS));
            }
        }

        // Track errors

        const record = {
            resolve: null,
            reject: null,
            timeout: null
        };

        const promise = new Promise((resolve, reject) => {

            record.resolve = resolve;
            record.reject = reject;
        });

        if (this._settings.timeout) {
            record.timeout = setTimeout(() => {

                record.timeout = null;
                return record.reject(new NesError('Request timed out', errorTypes.TIMEOUT));
            }, this._settings.timeout);
        }

        this._requests[request.id] = record;

        try {
            this._ws.send(encoded);
        }
        catch (err) {
            clearTimeout(this._requests[request.id].timeout);
            delete this._requests[request.id];
            return Promise.reject(new NesError(err, errorTypes.WS));
        }

        return promise;
    };

    Client.prototype._hello = function (auth) {

        const request = {
            type: 'hello',
            version
        };

        if (auth) {
            request.auth = auth;
        }

        const subs = this.subscriptions();
        if (subs.length) {
            request.subs = subs;
        }

        return this._send(request, true);
    };

    Client.prototype.subscriptions = function () {

        return Object.keys(this._subscriptions);
    };

    Client.prototype.subscribe = function (path, handler) {

        if (!path ||
            path[0] !== '/') {

            return Promise.reject(new NesError('Invalid path', errorTypes.USER));
        }

        const subs = this._subscriptions[path];
        if (subs) {

            // Already subscribed

            if (subs.indexOf(handler) === -1) {
                subs.push(handler);
            }

            return Promise.resolve();
        }

        this._subscriptions[path] = [handler];

        if (!this._isReady()) {

            // Queued subscription

            return Promise.resolve();
        }

        const request = {
            type: 'sub',
            path
        };

        const promise = this._send(request, true);
        promise.catch((ignoreErr) => {

            delete this._subscriptions[path];
        });

        return promise;
    };

    Client.prototype.unsubscribe = function (path, handler) {

        if (!path ||
            path[0] !== '/') {

            return Promise.reject(new NesError('Invalid path', errorTypes.USER));
        }

        const subs = this._subscriptions[path];
        if (!subs) {
            return Promise.resolve();
        }

        let sync = false;
        if (!handler) {
            delete this._subscriptions[path];
            sync = true;
        }
        else {
            const pos = subs.indexOf(handler);
            if (pos === -1) {
                return Promise.resolve();
            }

            subs.splice(pos, 1);
            if (!subs.length) {
                delete this._subscriptions[path];
                sync = true;
            }
        }

        if (!sync ||
            !this._isReady()) {

            return Promise.resolve();
        }

        const request = {
            type: 'unsub',
            path
        };

        const promise = this._send(request, true);
        promise.catch(ignore);                          // Ignoring errors as the subscription handlers are already removed
        return promise;
    };

    Client.prototype._onMessage = function (message) {

        this._beat();

        let data = message.data;
        const prefix = data[0];
        if (prefix !== '{') {
            this._packets.push(data.slice(1));
            if (prefix !== '!') {
                return;
            }

            data = this._packets.join('');
            this._packets = [];
        }

        if (this._packets.length) {
            this._packets = [];
            this.onError(new NesError('Received an incomplete message', errorTypes.PROTOCOL));
        }

        try {
            var update = JSON.parse(data);
        }
        catch (err) {
            return this.onError(new NesError(err, errorTypes.PROTOCOL));
        }

        // Recreate error

        let error = null;
        if (update.statusCode &&
            update.statusCode >= 400) {

            error = new NesError(update.payload.message || update.payload.error || 'Error', errorTypes.SERVER);
            error.statusCode = update.statusCode;
            error.data = update.payload;
            error.headers = update.headers;
            error.path = update.path;
        }

        // Ping

        if (update.type === 'ping') {
            return this._send({ type: 'ping' }, false).catch(ignore);         // Ignore errors
        }

        // Broadcast and update

        if (update.type === 'update') {
            return this.onUpdate(update.message);
        }

        // Publish or Revoke

        if (update.type === 'pub' ||
            update.type === 'revoke') {

            const handlers = this._subscriptions[update.path];
            if (update.type === 'revoke') {
                delete this._subscriptions[update.path];
            }

            if (handlers &&
                update.message !== undefined) {

                const flags = {};
                if (update.type === 'revoke') {
                    flags.revoked = true;
                }

                for (let i = 0; i < handlers.length; ++i) {
                    handlers[i](update.message, flags);
                }
            }

            return;
        }

        // Lookup request (message must include an id from this point)

        const request = this._requests[update.id];
        if (!request) {
            return this.onError(new NesError('Received response for unknown request', errorTypes.PROTOCOL));
        }

        clearTimeout(request.timeout);
        delete this._requests[update.id];

        const next = (err, args) => {

            if (err) {
                return request.reject(err);
            }

            return request.resolve(args);
        };

        // Response

        if (update.type === 'request') {
            return next(error, { payload: update.payload, statusCode: update.statusCode, headers: update.headers });
        }

        // Custom message

        if (update.type === 'message') {
            return next(error, { payload: update.message });
        }

        // Authentication

        if (update.type === 'hello') {
            this.id = update.socket;
            if (update.heartbeat) {
                this._heartbeatTimeout = update.heartbeat.interval + update.heartbeat.timeout;
                this._beat();           // Call again once timeout is set
            }

            return next(error);
        }

        if (update.type === 'reauth') {
            return next(error, true);
        }

        // Subscriptions

        if (update.type === 'sub' ||
            update.type === 'unsub') {

            return next(error);
        }

        next(new NesError('Received invalid response', errorTypes.PROTOCOL));
        return this.onError(new NesError('Received unknown response type: ' + update.type, errorTypes.PROTOCOL));
    };

    Client.prototype._beat = function () {

        if (!this._heartbeatTimeout) {
            return;
        }

        clearTimeout(this._heartbeat);

        this._heartbeat = setTimeout(() => {

            this.onError(new NesError('Disconnecting due to heartbeat timeout', errorTypes.TIMEOUT));
            this.onHeartbeatTimeout(this._willReconnect());
            this._ws.close();
        }, this._heartbeatTimeout);
    };

    Client.prototype._willReconnect = function () {

        return !!(this._reconnection && this._reconnection.retries >= 1);
    };

    // Expose interface

    return { Client };
});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
(function (global){(function (){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = throttle;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL21haW4uanMiLCJsaWIvcHVibGljL2pzL3BhcnRpY2xlcy1vbi1jbGljay5qcyIsIm5vZGVfbW9kdWxlcy9AaGFwaS9uZXMvbGliL2NsaWVudC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7OztBQUVBLE9BQU8sQ0FBQyxxQkFBRCxDQUFQOztBQUVBLE9BQU8sQ0FBQyxzQkFBRCxDQUFQLEMsQ0FFQTs7O0FBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSw2QkFBWjtBQUVBLElBQU0sS0FBSyxHQUFHLEtBQWQ7QUFDQSxJQUFNLGFBQWEsR0FBRyxpQkFBdEI7QUFDQSxJQUFNLFVBQVUsR0FBRyxTQUFuQjtBQUNBLElBQU0sT0FBTyxHQUFHLElBQWhCO0FBQ0EsSUFBTSxzQkFBc0IsR0FBRyxDQUEvQjs7QUFFQSxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsaUJBQUQsQ0FBeEI7O0FBRUEsSUFBSSxHQUFKOztBQUVBLElBQUksT0FBSixFQUFhO0FBQ1QsRUFBQSxHQUFHLEdBQUcsT0FBTyxDQUFDLHNCQUFELENBQWI7QUFDSCxDLENBRUQ7OztBQUVBLElBQUksVUFBSixDLENBQ0E7O0FBQ0EsSUFBSSxVQUFVLEdBQUcsSUFBakI7O0FBRUEsSUFBTSxvQkFBb0IsR0FBRyxTQUF2QixvQkFBdUIsQ0FBQyxFQUFELEVBQUssRUFBTCxFQUFZO0FBRXJDLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxhQUFILENBQWlCLFVBQWpCLENBQWI7O0FBRUEsTUFBSSxDQUFDLElBQUwsRUFBVztBQUNQLFFBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBQWY7QUFDQSxJQUFB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdHhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdmJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJ3JlZ2VuZXJhdG9yLXJ1bnRpbWUnKTtcblxucmVxdWlyZSgnLi9wYXJ0aWNsZXMtb24tY2xpY2snKTtcblxuLy8gU291bmQgb2ZmZmZmISEhISEhXG5jb25zb2xlLmxvZygnVEFDT09PT09PT09PT09PT09PT09PT09TISEhJyk7XG5cbmNvbnN0IERFQlVHID0gZmFsc2U7XG5jb25zdCBUQUNPU19ST09NX0lEID0gJ3RhY29zLW4tZnJpZW5kcyc7XG5jb25zdCBNWV9UQUNPX0lEID0gJ215LXRhY28nO1xuY29uc3QgVVNFX05FUyA9IHRydWU7XG5jb25zdCBDVVJTT1JfVVBEQVRFX1RIUk9UVExFID0gNTtcblxuY29uc3QgVGhyb3R0bGUgPSByZXF1aXJlKCdsb2Rhc2gudGhyb3R0bGUnKTtcblxubGV0IE5lcztcblxuaWYgKFVTRV9ORVMpIHtcbiAgICBOZXMgPSByZXF1aXJlKCdAaGFwaS9uZXMvbGliL2NsaWVudCcpO1xufVxuXG4vLyBjb25zdCBSRUNPTk5FQ1RfVElNRU9VVCA9IDEwMDA7IC8vIGluIG1pbGxpc2Vjb25kc1xuXG5sZXQgUm9vbUNsaWVudDtcbi8vIFRoaXMgd2lsbCBnZXQgc2V0IGJ5IHRoZSBzZXJ2ZXIgb24gY29ubmVjdGlvblxubGV0IHJvb21Vc2VySWQgPSBudWxsO1xuXG5jb25zdCBhZGRJZFRvRWxJZk5vdEV4aXN0cyA9IChlbCwgaWQpID0+IHtcblxuICAgIGNvbnN0IGlkRWwgPSBlbC5xdWVyeVNlbGVjdG9yKCcudGFjby1pZCcpO1xuXG4gICAgaWYgKCFpZEVsKSB7XG4gICAgICAgIGNvbnN0IHRhY29JZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0YWNvSWQuY2xhc3NOYW1lID0gJ3RhY28taWQnO1xuICAgICAgICB0YWNvSWQudGV4dENvbnRlbnQgPSBpZDtcbiAgICAgICAgdGFjb0lkLnN0eWxlLmNvbG9yID0gJ3doaXRlJztcbiAgICAgICAgdGFjb0lkLnN0eWxlLmZvbnRTaXplID0gJzZweCc7XG4gICAgICAgIHRhY29JZC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIHRhY29JZC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtMjUlKSc7XG4gICAgICAgIHRhY29JZC5zdHlsZS5ib3R0b20gPSAnLTIwcHgnO1xuICAgICAgICB0YWNvSWQuc3R5bGUud2hpdGVTcGFjZSA9ICdub3dyYXAnO1xuICAgICAgICBlbC5hcHBlbmRDaGlsZCh0YWNvSWQpO1xuICAgIH1cbn07XG5cbi8vIFVwc2VydCB1c2VyIGluIHJvb21cbmNvbnN0IHVwZGF0ZVJvb20gPSBhc3luYyAoeyByb29tSWQsIHVzZXJJZCwgeCwgeSB9KSA9PiB7XG5cbiAgICBjb25zdCBwYXlsb2FkID0geyB4LCB5IH07XG5cbiAgICBpZiAodXNlcklkKSB7XG4gICAgICAgIHBheWxvYWQuaWQgPSB1c2VySWQ7XG4gICAgfVxuXG4gICAgY29uc3QgeyBwYXlsb2FkOiB7IGVycm9yLCB1c2VyIH0gfSA9IGF3YWl0IFJvb21DbGllbnQucmVxdWVzdCh7XG4gICAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgICBwYXRoOiBgL3Jvb21zLyR7cm9vbUlkfS91cGRhdGVgLFxuICAgICAgICBwYXlsb2FkXG4gICAgfSk7XG5cbiAgICBpZiAodXNlcikge1xuICAgICAgICByb29tVXNlcklkID0gdXNlci5pZDtcbiAgICAgICAgY29uc3QgbXlUYWNvRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChNWV9UQUNPX0lEKTtcbiAgICAgICAgYWRkSWRUb0VsSWZOb3RFeGlzdHMobXlUYWNvRWwsIHJvb21Vc2VySWQpO1xuICAgIH1cblxuICAgIC8vIFNldHVwIHNvbWUga2luZGEgZWFzeSBkZWJ1Z2dpbmcgb3Igc29tZXRoaW5nXG4gICAgY29uc3QgY29ubmVjdGlvbk1zZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb25uZWN0aW9uTXNnJykgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcblxuICAgIGNvbm5lY3Rpb25Nc2cuaWQgPSAnY29ubmVjdGlvbk1zZyc7XG5cbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgLy8gbGV0IGVyciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYDxoMyBzdHlsZT0nY29sb3I6IHdoaXRlOyc+RXJyb3IgJHtlcnJvci5tZXNzYWdlfTwvaDM+YCk7XG4gICAgICAgIGNvbm5lY3Rpb25Nc2cuc3R5bGUuY29sb3IgPSAnI2Y4ODA3MCc7XG4gICAgICAgIGNvbm5lY3Rpb25Nc2cudGV4dENvbnRlbnQgPSBgRXJyb3IgJHtlcnJvci5tZXNzYWdlfWA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25uZWN0aW9uTXNnLnN0eWxlLmNvbG9yID0gJyM3M2M5OTEnO1xuICAgICAgICBjb25uZWN0aW9uTXNnLnRleHRDb250ZW50ID0gYENvbm5lY3RlZCEgeDogJHt4IHx8ICdudWxsJ30geTogJHt5IHx8ICdudWxsJ31gO1xuICAgIH1cblxuICAgIC8vIEFkZCBpdFxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29ubmVjdGlvbk1zZyk7XG5cbiAgICByZXR1cm4gdXNlcjtcbn07XG5cbmNvbnN0IG15VGFjbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKE1ZX1RBQ09fSUQpO1xuXG5jb25zdCBtb3ZlQ3Vyc29yID0gKHsgZWxlbWVudCwgeCwgeSB9KSA9PiB7XG5cbiAgICBlbGVtZW50LnN0eWxlLmxlZnQgPSBgJHt4fXB4YDtcbiAgICBlbGVtZW50LnN0eWxlLnRvcCA9IGAke3l9cHhgO1xufTtcblxuLy8gV2UgbmVlZCB0aGlzIHdyYXBwZXIgdG8gbWFrZSBhc3luYy9hd2FpdCBuaWNlIHRvIHdyaXRlXG5jb25zdCBpbml0U29ja2V0ID0gYXN5bmMgKCkgPT4ge1xuXG4gICAgaWYgKFJvb21DbGllbnQpIHtcbiAgICAgICAgYXdhaXQgUm9vbUNsaWVudC5kaXNjb25uZWN0KCk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBsb2NhdGlvbjogeyBwcm90b2NvbCwgaG9zdCB9IH0gPSB3aW5kb3c7XG5cbiAgICAvLyBUaGlzIHdpbGwgcmVwbGFjZSAnaHR0cHMnIGZvciAnd3MnIHdoaWNoIHdpbGwgYWxzbyBsZWF2ZSAnd3NzJyBmb3IgJ2h0dHBzJyBwcm90b2NvbHNcbiAgICBjb25zdCB1cmwgPSBwcm90b2NvbC5yZXBsYWNlKCdodHRwJywgJ3dzJykgKyAnLy8nICsgaG9zdDtcblxuICAgIGNvbnN0IHdzTG9jYXRpb24gPSB1cmwucmVwbGFjZSgnbG9jYWxob3N0OjMwMDEnLCAnbG9jYWxob3N0OjMwMDAnKTtcblxuICAgIGNvbnNvbGUubG9nKCd3c0xvY2F0aW9uJywgd3NMb2NhdGlvbik7XG5cbiAgICBSb29tQ2xpZW50ID0gbmV3IE5lcy5DbGllbnQod3NMb2NhdGlvbik7XG5cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBSb29tQ2xpZW50LmNvbm5lY3QoKTtcbiAgICB9XG4gICAgY2F0Y2ggKGNvbm5lY3RFcnIpIHtcbiAgICAgICAgLy8gU2V0dXAgc29tZSBraW5kYSBlYXN5IGRlYnVnZ2luZyBvciBzb21ldGhpbmdcbiAgICAgICAgY29uc3QgY29ubmVjdGlvbk1zZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb25uZWN0aW9uTXNnJykgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcblxuICAgICAgICBjb25uZWN0aW9uTXNnLmlkID0gJ2Nvbm5lY3Rpb25Nc2cnO1xuXG4gICAgICAgIGNvbm5lY3Rpb25Nc2cuc3R5bGUuY29sb3IgPSAnI2Y4ODA3MCc7XG4gICAgICAgIGNvbm5lY3Rpb25Nc2cudGV4dENvbnRlbnQgPSBgRXJyb3IgJHtjb25uZWN0RXJyLm1lc3NhZ2V9YDtcbiAgICB9XG5cbiAgICBjb25zdCB1c2VyID0gYXdhaXQgdXBkYXRlUm9vbSh7XG4gICAgICAgIHJvb21JZDogVEFDT1NfUk9PTV9JRCxcbiAgICAgICAgdXNlcklkOiByb29tVXNlcklkXG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygnaW5pdCB1c2VyJywgdXNlcik7XG5cbiAgICBjb25zdCByb29tRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucm9vbScpO1xuXG4gICAgY29uc3Qgb25Sb29tVXBkYXRlID0gKHByb3BzKSA9PiB7XG5cbiAgICAgICAgY29uc3QgeyBpZCwgbmFtZSwgdXNlcnMgPSBbXSwgaXNTeW5jIH0gPSBwcm9wcztcblxuICAgICAgICAvLyBUaHggY29waWxvdFxuICAgICAgICBjb25zdCB1c2Vyc05vdE1lID0gT2JqZWN0LmtleXModXNlcnMpXG4gICAgICAgICAgICAuZmlsdGVyKChpZCkgPT4gaWQgIT09IHJvb21Vc2VySWQpXG4gICAgICAgICAgICAubWFwKChpZCkgPT4gdXNlcnNbaWRdKTtcblxuICAgICAgICBjb25zdCB1c2Vyc1llc01lID0gdXNlcnNbT2JqZWN0LmtleXModXNlcnMpLmZpbmQoKGlkKSA9PiBpZCA9PT0gcm9vbVVzZXJJZCldO1xuXG4gICAgICAgIGNvbnN0IHVzZXJzTWFya2VkRm9yRGVsZXRpb24gPSBPYmplY3QudmFsdWVzKHVzZXJzTm90TWUpXG4gICAgICAgICAgICAuZmlsdGVyKCh7IHNob3VsZERlbGV0ZSB9KSA9PiAhIXNob3VsZERlbGV0ZSlcbiAgICAgICAgICAgIC5tYXAoKHsgaWQgfSkgPT4gaWQpO1xuXG4gICAgICAgIGNvbnN0IHNpbmdsZVVzZXJzTm90TWUgPSB1c2Vyc05vdE1lLmxlbmd0aCA9PT0gMSA/IHVzZXJzTm90TWVbMF0gOiBudWxsO1xuXG4gICAgICAgIGlmIChERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3VzZXJzWWVzTWUnLCB1c2Vyc1llc01lKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1c2Vyc05vdE1lJywgc2luZ2xlVXNlcnNOb3RNZSA/IHNpbmdsZVVzZXJzTm90TWUgOiB1c2Vyc05vdE1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1c2Vyc1llc01lKSB7XG4gICAgICAgICAgICBtb3ZlQ3Vyc29yKHtcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBteVRhY28sXG4gICAgICAgICAgICAgICAgeDogdXNlcnNZZXNNZS54LFxuICAgICAgICAgICAgICAgIHk6IHVzZXJzWWVzTWUueVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBnZXRJZHMgPSAoYXJyKSA9PiBhcnIubWFwKCh7IGlkIH0pID0+IGlkKTtcblxuICAgICAgICAvLyBNYW5hZ2UgdGhlIGdob3N0IHRhY29zXG5cbiAgICAgICAgY29uc3QgZ2hvc3RUYWNvcyA9IEFycmF5LmZyb20oZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZ2hvc3QtdGFjbycpKTtcblxuICAgICAgICBjb25zdCBleGlzdGluZ0dob3N0SWRzID0gW107XG5cbiAgICAgICAgZ2hvc3RUYWNvcy5mb3JFYWNoKCh0YWNvRWwpID0+IHtcblxuICAgICAgICAgICAgY29uc3QgdGFjb0V4aXN0c0luVXNlcnMgPSBnZXRJZHModXNlcnNOb3RNZSkuaW5jbHVkZXModGFjb0VsLmlkKTtcblxuICAgICAgICAgICAgLy8gUmVtb3ZlIGluYWN0aXZlIHRhY29zXG4gICAgICAgICAgICBpZiAodXNlcnNNYXJrZWRGb3JEZWxldGlvbi5pbmNsdWRlcyh0YWNvRWwuaWQpIHx8IChpc1N5bmMgJiYgIXRhY29FeGlzdHNJblVzZXJzKSkge1xuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0aGlzIHRhY29cbiAgICAgICAgICAgICAgICByb29tRWwucmVtb3ZlQ2hpbGQodGFjb0VsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4aXN0aW5nR2hvc3RJZHMucHVzaCh0YWNvRWwuaWQpO1xuXG4gICAgICAgICAgICBjb25zdCB0YWNvVXBkYXRlID0gdXNlcnNOb3RNZS5maW5kKCh7IGlkIH0pID0+IGlkID09PSB0YWNvRWwuaWQpO1xuXG4gICAgICAgICAgICBpZiAodGFjb1VwZGF0ZSkge1xuICAgICAgICAgICAgICAgIG1vdmVDdXJzb3Ioe1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiB0YWNvRWwsXG4gICAgICAgICAgICAgICAgICAgIHg6IHRhY29VcGRhdGUueCxcbiAgICAgICAgICAgICAgICAgICAgeTogdGFjb1VwZGF0ZS55XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG5ld0dob3N0SWRzID0gZ2V0SWRzKHVzZXJzTm90TWUpLmZpbHRlcigoaWQpID0+ICFleGlzdGluZ0dob3N0SWRzLmluY2x1ZGVzKGlkKSk7XG5cbiAgICAgICAgbmV3R2hvc3RJZHMuZm9yRWFjaCgoaWQpID0+IHtcblxuICAgICAgICAgICAgLy8gQWRkIGEgbmV3IGdob3N0IHRhY29cbiAgICAgICAgICAgIGNvbnN0IG5ld1RhY29FbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgbmV3VGFjb0VsLmlkID0gaWQ7XG4gICAgICAgICAgICBuZXdUYWNvRWwuY2xhc3NMaXN0LmFkZCgnZ2hvc3QtdGFjbycpO1xuICAgICAgICAgICAgbmV3VGFjb0VsLmNsYXNzTGlzdC5hZGQoJ3RhY28tY3Vyc29yJyk7XG5cbiAgICAgICAgICAgIGFkZElkVG9FbElmTm90RXhpc3RzKG5ld1RhY29FbCwgaWQpO1xuXG4gICAgICAgICAgICByb29tRWwuYXBwZW5kQ2hpbGQobmV3VGFjb0VsKTtcblxuICAgICAgICAgICAgY29uc3QgdXNlckluZm8gPSB1c2Vyc05vdE1lLmZpbmQoKHsgaWQgfSkgPT4gaWQgPT09IGlkKTtcblxuICAgICAgICAgICAgbW92ZUN1cnNvcih7XG4gICAgICAgICAgICAgICAgZWxlbWVudDogbmV3VGFjb0VsLFxuICAgICAgICAgICAgICAgIHg6IHVzZXJJbmZvLngsXG4gICAgICAgICAgICAgICAgeTogdXNlckluZm8ueVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBDb29vb25ubm5ubmVlZWVlZWVjY2NjY2N0dHR0dHR0dCEhISEhISFcbiAgICBhd2FpdCBSb29tQ2xpZW50LnN1YnNjcmliZShgL3Jvb21zLyR7VEFDT1NfUk9PTV9JRH1gLCBvblJvb21VcGRhdGUpO1xufTtcblxuY29uc3QgcnVuID0gKCkgPT4ge1xuXG4gICAgaW5pdFNvY2tldCgpO1xuXG4gICAgY29uc3QgdGhyb3R0bGVkQnJvYWRjYXN0ID0gVGhyb3R0bGUoKHsgeCwgeSB9KSA9PiB7XG5cbiAgICAgICAgLy8gTm8gcG9pbnQgaW4gYXdhaXRpbmcgdGhpcyBoZXJlXG4gICAgICAgIHVwZGF0ZVJvb20oe1xuICAgICAgICAgICAgcm9vbUlkOiBUQUNPU19ST09NX0lELFxuICAgICAgICAgICAgdXNlcklkOiByb29tVXNlcklkLFxuICAgICAgICAgICAgeCxcbiAgICAgICAgICAgIHlcbiAgICAgICAgfSk7XG4gICAgfSwgQ1VSU09SX1VQREFURV9USFJPVFRMRSk7XG5cbiAgICAvLyBCcm9hZGNhc3QgbW92ZW1lbnRzIHRvIHRoZSByb29tIGFuZCBvbmx5XG4gICAgLy8gdXBkYXRlIG15IHZpZXcgd2l0aCB3aGF0IHdlIGdldCBmcm9tIHRoZSBzZXJ2ZXJcbiAgICBjb25zdCBvbk1vdXNlTW92ZSA9IChldnQpID0+IHtcblxuICAgICAgICBjb25zdCBtb3VzZVggPSBldnQucGFnZVg7XG4gICAgICAgIGNvbnN0IG1vdXNlWSA9IGV2dC5wYWdlWTtcblxuICAgICAgICB0aHJvdHRsZWRCcm9hZGNhc3Qoe1xuICAgICAgICAgICAgeDogbW91c2VYLFxuICAgICAgICAgICAgeTogbW91c2VZXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xufTtcblxucnVuKCk7XG5cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgQnJpZWYgYXR0ZW1wdCBhdCB3ZWJzb2NrZXQgbmF0aXZlIHN0dWZmXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbi8vIGNvbnN0IG9uU29ja2V0T3BlbiA9IChldnQpID0+IHtcblxuLy8gICAgIGNvbnNvbGUubG9nKCdvcGVuIGV2dCcsIGV2dCk7XG4vLyAgICAgLy8gUm9vbUNsaWVudC5zZW5kKCdIZWxsbyBTZXJ2ZXIhJyk7XG4vLyB9O1xuXG4vLyBjb25zdCBvblNvY2tldE1lc3NhZ2UgPSAoZXZ0KSA9PiB7XG5cbi8vICAgICBjb25zb2xlLmxvZygnZXZ0JywgZXZ0KTtcblxuLy8gICAgIGNvbnNvbGUubG9nKCdNZXNzYWdlIGZyb20gc2VydmVyICcsIGV2dD8uZGF0YSk7XG4vLyB9O1xuXG4vLyBSb29tQ2xpZW50ID0gbmV3IFdlYlNvY2tldCgnd3M6Ly9sb2NhbGhvc3Q6MzAwMCcpO1xuXG4vLyAvLyBMaXN0ZW4gZm9yIGNvbm5lY3Rpb24gb3BlblxuLy8gUm9vbUNsaWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdvcGVuJywgb25Tb2NrZXRPcGVuKTtcbi8vIFJvb21DbGllbnQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIG9uU29ja2V0T3Blbik7XG5cbi8vIC8vIExpc3RlbiBmb3IgbWVzc2FnZXNcbi8vIFJvb21DbGllbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIG9uU29ja2V0TWVzc2FnZSk7XG4vLyBSb29tQ2xpZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBvblNvY2tldE1lc3NhZ2UpO1xuXG4vLyBSb29tQ2xpZW50Lm9uY2xvc2UgPSBvblNvY2tldENsb3NlO1xuXG4vLyBjb25zdCBvblNvY2tldENsb3NlID0gKGV2dCkgPT4ge1xuXG4vLyAgICAgY29uc29sZS5sb2coJ29uY2xvc2UgZXZ0JywgZXZ0KTtcblxuLy8gICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuXG4vLyAgICAgICAgIGNvbnNvbGUubG9nKCdSZWNvbm5lY3RpbmcuLi4nKTtcbi8vICAgICAgICAgaW5pdFNvY2tldCgpO1xuLy8gICAgIH0sIFJFQ09OTkVDVF9USU1FT1VUKTtcbi8vIH07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIEFkYXB0ZWQgZnJvbSBodHRwczovL2NvZGVwZW4uaW8vZGVhbndhZ21hbi9wZW4vRWpMQmRRXG5cbmNvbnNvbGUubG9nKCdCcm9vb28nKTtcblxuLy8gTGl0dGxlIENhbnZhcyB0aGluZ3NcbmNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2FudmFzXCIpO1xuY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbi8vIFNldCBDYW52YXMgdG8gYmUgd2luZG93IHNpemVcbmNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuLy8gQ29uZmlndXJhdGlvbiwgUGxheSB3aXRoIHRoZXNlXG5jb25zdCBjb25maWcgPSB7XG4gIHBhcnRpY2xlTnVtYmVyOiA2MDAsXG4gIG1heFBhcnRpY2xlU2l6ZTogMjAsXG4gIG1heFNwZWVkOiA0MCxcbiAgY29sb3JWYXJpYXRpb246IDUwXG59O1xuXG4vLyBDb2xvcnNcbmNvbnN0IGNvbG9yUGFsZXR0ZSA9IHtcbiAgICBiZzoge3I6MCxnOjAsYjowfSxcbiAgICBtYXR0ZXI6IFtcbiAgICAgIHsgcjogMzYsIGc6IDE4LCBiOiA0MiB9LCAvLyBkYXJrUFJQTFxuICAgICAgeyByOiA3OCwgZzogMzYsIGI6IDQyIH0sIC8vIHJvY2tEdXN0XG4gICAgICB7IHI6IDI1MiwgZzogMTc4LCBiOiA5NiB9LCAvLyBzb2xvckZsYXJlXG4gICAgICB7IHI6IDI1MywgZzogMjM4LCBiOiAxNTIgfSAvLyB0b3Rlc0FTdW5cbiAgICBdXG59O1xuXG4vLyBTb21lIFZhcmlhYmxlcyBoYW5naW5nIG91dFxubGV0IHBhcnRpY2xlcyA9IFtdO1xubGV0IGRyYXdCZztcblxuY29uc3QgY2VudGVyWCA9IGNhbnZhcy53aWR0aCAvIDI7XG5jb25zdCBjZW50ZXJZID0gY2FudmFzLmhlaWdodCAvIDI7XG5cbi8vIERyYXdzIHRoZSBiYWNrZ3JvdW5kIGZvciB0aGUgY2FudmFzLCBiZWNhdXNlIHNwYWNlXG5kcmF3QmcgPSAoY3R4LCBjb2xvcikgPT4ge1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKFwiICsgY29sb3IuciArIFwiLFwiICsgY29sb3IuZyArIFwiLFwiICsgY29sb3IuYiArIFwiKVwiO1xuICAgIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xufTtcblxuLy8gUGFydGljbGUgQ29uc3RydWN0b3JcbmNvbnN0IFBhcnRpY2xlID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAvLyBYIENvb3JkaW5hdGVcbiAgICB0aGlzLnggPSB4IHx8IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIGNhbnZhcy53aWR0aCk7XG4gICAgLy8gWSBDb29yZGluYXRlXG4gICAgdGhpcy55ID0geSB8fCBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiBjYW52YXMuaGVpZ2h0KTtcbiAgICAvLyBSYWRpdXMgb2YgdGhlIHNwYWNlIGR1c3RcbiAgICB0aGlzLnIgPSBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIGNvbmZpZy5tYXhQYXJ0aWNsZVNpemUpO1xuICAgIC8vIENvbG9yIG9mIHRoZSByb2NrLCBnaXZlbiBzb21lIHJhbmRvbW5lc3NcbiAgICB0aGlzLmMgPSBjb2xvclZhcmlhdGlvbihjb2xvclBhbGV0dGUubWF0dGVyW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNvbG9yUGFsZXR0ZS5tYXR0ZXIubGVuZ3RoKV0sdHJ1ZSApO1xuICAgIC8vIFNwZWVkIG9mIHdoaWNoIHRoZSByb2NrIHRyYXZlbHNcbiAgICB0aGlzLnMgPSBNYXRoLnBvdyhNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIGNvbmZpZy5tYXhTcGVlZCksIC43KTtcbiAgICAvLyBEaXJlY3Rpb24gdGhlIFJvY2sgZmxpZXNcbiAgICB0aGlzLmQgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAzNjApO1xufTtcblxuLy8gUHJvdmlkZXMgc29tZSBuaWNlIGNvbG9yIHZhcmlhdGlvblxuLy8gQWNjZXB0cyBhbiByZ2JhIG9iamVjdFxuLy8gcmV0dXJucyBhIG1vZGlmaWVkIHJnYmEgb2JqZWN0IG9yIGEgcmdiYSBzdHJpbmcgaWYgdHJ1ZSBpcyBwYXNzZWQgaW4gZm9yIGFyZ3VtZW50IDJcbmNvbnN0IGNvbG9yVmFyaWF0aW9uID0gZnVuY3Rpb24gKGNvbG9yLCByZXR1cm5TdHJpbmcpIHtcblxuICAgIHZhciByLGcsYixhLCB2YXJpYXRpb247XG4gICAgciA9IE1hdGgucm91bmQoKChNYXRoLnJhbmRvbSgpICogY29uZmlnLmNvbG9yVmFyaWF0aW9uKSAtIChjb25maWcuY29sb3JWYXJpYXRpb24vMikpICsgY29sb3Iucik7XG4gICAgZyA9IE1hdGgucm91bmQoKChNYXRoLnJhbmRvbSgpICogY29uZmlnLmNvbG9yVmFyaWF0aW9uKSAtIChjb25maWcuY29sb3JWYXJpYXRpb24vMikpICsgY29sb3IuZyk7XG4gICAgYiA9IE1hdGgucm91bmQoKChNYXRoLnJhbmRvbSgpICogY29uZmlnLmNvbG9yVmFyaWF0aW9uKSAtIChjb25maWcuY29sb3JWYXJpYXRpb24vMikpICsgY29sb3IuYik7XG4gICAgYSA9IE1hdGgucmFuZG9tKCkgKyAuNTtcbiAgICBpZiAocmV0dXJuU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBcInJnYmEoXCIgKyByICsgXCIsXCIgKyBnICsgXCIsXCIgKyBiICsgXCIsXCIgKyBhICsgXCIpXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtyLGcsYixhfTtcbiAgICB9XG59O1xuXG4vLyBVc2VkIHRvIGZpbmQgdGhlIHJvY2tzIG5leHQgcG9pbnQgaW4gc3BhY2UsIGFjY291bnRpbmcgZm9yIHNwZWVkIGFuZCBkaXJlY3Rpb25cbmNvbnN0IHVwZGF0ZVBhcnRpY2xlTW9kZWwgPSBmdW5jdGlvbiAocCkge1xuXG4gICAgdmFyIGEgPSAxODAgLSAocC5kICsgOTApOyAvLyBmaW5kIHRoZSAzcmQgYW5nbGVcbiAgICBwLmQgPiAwICYmIHAuZCA8IDE4MCA/IHAueCArPSBwLnMgKiBNYXRoLnNpbihwLmQpIC8gTWF0aC5zaW4ocC5zKSA6IHAueCAtPSBwLnMgKiBNYXRoLnNpbihwLmQpIC8gTWF0aC5zaW4ocC5zKTtcbiAgICBwLmQgPiA5MCAmJiBwLmQgPCAyNzAgPyBwLnkgKz0gcC5zICogTWF0aC5zaW4oYSkgLyBNYXRoLnNpbihwLnMpIDogcC55IC09IHAucyAqIE1hdGguc2luKGEpIC8gTWF0aC5zaW4ocC5zKTtcbiAgICByZXR1cm4gcDtcbn07XG5cbmNvbnN0IHRhY29JbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbnRhY29JbWcuc3JjID0gJy9wdWJsaWMvdGFjby5wbmcnO1xuXG4vLyBKdXN0IHRoZSBmdW5jdGlvbiB0aGF0IHBoeXNpY2FsbHkgZHJhd3MgdGhlIHBhcnRpY2xlc1xuLy8gUGh5c2ljYWxseT8gc3VyZSB3aHkgbm90LCBwaHlzaWNhbGx5LlxuY29uc3QgZHJhd1BhcnRpY2xlID0gZnVuY3Rpb24gKHgsIHksIHIsIGMpIHtcblxuICAgIGN0eC5kcmF3SW1hZ2UodGFjb0ltZywgeCwgeSwgciAqIDIsIHIgKiAyKTtcbn07XG5cbi8vIFJlbW92ZSBwYXJ0aWNsZXMgdGhhdCBhcmVuJ3Qgb24gdGhlIGNhbnZhc1xuY29uc3QgY2xlYW5VcEFycmF5ID0gZnVuY3Rpb24gKCkge1xuICAgIHBhcnRpY2xlcyA9IHBhcnRpY2xlcy5maWx0ZXIoKHApID0+IHtcbiAgICAgIHJldHVybiAocC54ID4gLTEwMCAmJiBwLnkgPiAtMTAwKTtcbiAgICB9KTtcbn07XG5cbmNvbnN0IGluaXRQYXJ0aWNsZXMgPSBmdW5jdGlvbiAobnVtUGFydGljbGVzLCB4LCB5KSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1QYXJ0aWNsZXM7IGkrKykge1xuICAgICAgICBwYXJ0aWNsZXMucHVzaChuZXcgUGFydGljbGUoeCwgeSkpO1xuICAgIH1cblxuICAgIHBhcnRpY2xlcy5mb3JFYWNoKChwKSA9PiB7XG4gICAgICAgIGRyYXdQYXJ0aWNsZShwLngsIHAueSwgcC5yLCBwLmMpO1xuICAgIH0pO1xufTtcblxuLy8gVGhhdCB0aGluZ1xud2luZG93LnJlcXVlc3RBbmltRnJhbWUgPSAoKCkgPT4ge1xuXG4gIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKTtcbiAgICAgfTtcbn0pKCk7XG5cbi8vIE91ciBGcmFtZSBmdW5jdGlvblxuY29uc3QgZnJhbWUgPSAoKSA9PiB7XG4gIC8vIERyYXcgYmFja2dyb3VuZCBmaXJzdFxuICBkcmF3QmcoY3R4LCBjb2xvclBhbGV0dGUuYmcpO1xuICAvLyBVcGRhdGUgUGFydGljbGUgbW9kZWxzIHRvIG5ldyBwb3NpdGlvblxuICBwYXJ0aWNsZXMubWFwKChwKSA9PiB7XG4gICAgcmV0dXJuIHVwZGF0ZVBhcnRpY2xlTW9kZWwocCk7XG4gIH0pO1xuICAvLyBEcmF3IGVtJ1xuICBwYXJ0aWNsZXMuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgZHJhd1BhcnRpY2xlKHAueCwgcC55LCBwLnIsIHAuYyk7XG4gIH0pO1xuICAvLyBQbGF5IHRoZSBzYW1lIHNvbmc/IE9rIVxuICB3aW5kb3cucmVxdWVzdEFuaW1GcmFtZShmcmFtZSk7XG59O1xuXG4vLyBDbGljayBsaXN0ZW5lclxuZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciB4ID0gZXZlbnQuY2xpZW50WCxcbiAgICAgICAgeSA9IGV2ZW50LmNsaWVudFk7XG4gICAgY2xlYW5VcEFycmF5KCk7XG4gICAgaW5pdFBhcnRpY2xlcyhjb25maWcucGFydGljbGVOdW1iZXIsIHgsIHkpO1xufSk7XG5cbi8vIEZpcnN0IEZyYW1lXG5mcmFtZSgpO1xuXG4vLyBGaXJzdCBwYXJ0aWNsZSBleHBsb3Npb25cbmluaXRQYXJ0aWNsZXMoY29uZmlnLnBhcnRpY2xlTnVtYmVyKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLypcbiAgICAoaGFwaSluZXMgV2ViU29ja2V0IENsaWVudCAoaHR0cHM6Ly9naXRodWIuY29tL2hhcGlqcy9uZXMpXG4gICAgQ29weXJpZ2h0IChjKSAyMDE1LTIwMTYsIEVyYW4gSGFtbWVyIDxlcmFuQGhhbW1lci5pbz4gYW5kIG90aGVyIGNvbnRyaWJ1dG9yc1xuICAgIEJTRCBMaWNlbnNlZFxuKi9cblxuLyogZXNsaW50IG5vLXVuZGVmOiAwICovXG5cbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuXG4gICAgLy8gJGxhYjpjb3ZlcmFnZTpvZmYkXG5cbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpOyAgICAgICAgICAgICAgICAgLy8gRXhwb3J0IGlmIHVzZWQgYXMgYSBtb2R1bGVcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGV4cG9ydHMubmVzID0gZmFjdG9yeSgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcm9vdC5uZXMgPSBmYWN0b3J5KCk7XG4gICAgfVxuXG4gICAgLy8gJGxhYjpjb3ZlcmFnZTpvbiRcblxufSkoLyogJGxhYjpjb3ZlcmFnZTpvZmYkICovIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsIC8qICRsYWI6Y292ZXJhZ2U6b24kICovLCAoKSA9PiB7XG5cbiAgICAvLyBVdGlsaXRpZXNcblxuICAgIGNvbnN0IHZlcnNpb24gPSAnMic7XG4gICAgY29uc3QgaWdub3JlID0gZnVuY3Rpb24gKCkgeyB9O1xuXG4gICAgY29uc3Qgc3RyaW5naWZ5ID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBOZXNFcnJvcihlcnIsIGVycm9yVHlwZXMuVVNFUik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3QgbmV4dFRpY2sgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcblxuICAgICAgICByZXR1cm4gKGVycikgPT4ge1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGNhbGxiYWNrKGVyciksIDApO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvLyBOZXNFcnJvciB0eXBlc1xuXG4gICAgY29uc3QgZXJyb3JUeXBlcyA9IHtcbiAgICAgICAgVElNRU9VVDogJ3RpbWVvdXQnLFxuICAgICAgICBESVNDT05ORUNUOiAnZGlzY29ubmVjdCcsXG4gICAgICAgIFNFUlZFUjogJ3NlcnZlcicsXG4gICAgICAgIFBST1RPQ09MOiAncHJvdG9jb2wnLFxuICAgICAgICBXUzogJ3dzJyxcbiAgICAgICAgVVNFUjogJ3VzZXInXG4gICAgfTtcblxuICAgIGNvbnN0IE5lc0Vycm9yID0gZnVuY3Rpb24gKGVyciwgdHlwZSkge1xuXG4gICAgICAgIGlmICh0eXBlb2YgZXJyID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgZXJyID0gbmV3IEVycm9yKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICBlcnIudHlwZSA9IHR5cGU7XG4gICAgICAgIGVyci5pc05lcyA9IHRydWU7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRocm93IGVycjsgLy8gZW5zdXJlIHN0YWNrIHRyYWNlIGZvciBJRTExXG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKHdpdGhTdGFjaykge1xuICAgICAgICAgICAgcmV0dXJuIHdpdGhTdGFjaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBFcnJvciBjb2Rlc1xuXG4gICAgY29uc3QgZXJyb3JDb2RlcyA9IHtcbiAgICAgICAgMTAwMDogJ05vcm1hbCBjbG9zdXJlJyxcbiAgICAgICAgMTAwMTogJ0dvaW5nIGF3YXknLFxuICAgICAgICAxMDAyOiAnUHJvdG9jb2wgZXJyb3InLFxuICAgICAgICAxMDAzOiAnVW5zdXBwb3J0ZWQgZGF0YScsXG4gICAgICAgIDEwMDQ6ICdSZXNlcnZlZCcsXG4gICAgICAgIDEwMDU6ICdObyBzdGF0dXMgcmVjZWl2ZWQnLFxuICAgICAgICAxMDA2OiAnQWJub3JtYWwgY2xvc3VyZScsXG4gICAgICAgIDEwMDc6ICdJbnZhbGlkIGZyYW1lIHBheWxvYWQgZGF0YScsXG4gICAgICAgIDEwMDg6ICdQb2xpY3kgdmlvbGF0aW9uJyxcbiAgICAgICAgMTAwOTogJ01lc3NhZ2UgdG9vIGJpZycsXG4gICAgICAgIDEwMTA6ICdNYW5kYXRvcnkgZXh0ZW5zaW9uJyxcbiAgICAgICAgMTAxMTogJ0ludGVybmFsIHNlcnZlciBlcnJvcicsXG4gICAgICAgIDEwMTU6ICdUTFMgaGFuZHNoYWtlJ1xuICAgIH07XG5cbiAgICAvLyBDbGllbnRcblxuICAgIGNvbnN0IENsaWVudCA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcblxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgICB0aGlzLl9pc0Jyb3dzZXIgPSB0eXBlb2YgV2ViU29ja2V0ICE9PSAndW5kZWZpbmVkJztcblxuICAgICAgICBpZiAoIXRoaXMuX2lzQnJvd3Nlcikge1xuICAgICAgICAgICAgb3B0aW9ucy53cyA9IG9wdGlvbnMud3MgfHwge307XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLndzLm1heFBheWxvYWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMud3MubWF4UGF5bG9hZCA9IDA7ICAgICAgICAgICAgICAvLyBPdmVycmlkZSBkZWZhdWx0IDEwME1iIGxpbWl0IGluIHdzIG1vZHVsZSB0byBhdm9pZCBicmVha2luZyBjaGFuZ2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbmZpZ3VyYXRpb25cblxuICAgICAgICB0aGlzLl91cmwgPSB1cmw7XG4gICAgICAgIHRoaXMuX3NldHRpbmdzID0gb3B0aW9ucztcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dCA9IGZhbHNlOyAgICAgICAgICAgICAvLyBTZXJ2ZXIgaGVhcnRiZWF0IGNvbmZpZ3VyYXRpb25cblxuICAgICAgICAvLyBTdGF0ZVxuXG4gICAgICAgIHRoaXMuX3dzID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcmVjb25uZWN0aW9uID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcmVjb25uZWN0aW9uVGltZXIgPSBudWxsO1xuICAgICAgICB0aGlzLl9pZHMgPSAwOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElkIGNvdW50ZXJcbiAgICAgICAgdGhpcy5fcmVxdWVzdHMgPSB7fTsgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgdGltZW91dCB9XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSB7fTsgICAgICAgICAgICAgICAgICAgLy8gcGF0aCAtPiBbY2FsbGJhY2tzXVxuICAgICAgICB0aGlzLl9oZWFydGJlYXQgPSBudWxsO1xuICAgICAgICB0aGlzLl9wYWNrZXRzID0gW107XG4gICAgICAgIHRoaXMuX2Rpc2Nvbm5lY3RMaXN0ZW5lcnMgPSBudWxsO1xuICAgICAgICB0aGlzLl9kaXNjb25uZWN0UmVxdWVzdGVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gRXZlbnRzXG5cbiAgICAgICAgdGhpcy5vbkVycm9yID0gKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIpOyAvLyBHZW5lcmFsIGVycm9yIGhhbmRsZXIgKG9ubHkgd2hlbiBhbiBlcnJvciBjYW5ub3QgYmUgYXNzb2NpYXRlZCB3aXRoIGEgcmVxdWVzdClcbiAgICAgICAgdGhpcy5vbkNvbm5lY3QgPSBpZ25vcmU7ICAgICAgICAgICAgICAgICAgICAvLyBDYWxsZWQgd2hlbmV2ZXIgYSBjb25uZWN0aW9uIGlzIGVzdGFibGlzaGVkXG4gICAgICAgIHRoaXMub25EaXNjb25uZWN0ID0gaWdub3JlOyAgICAgICAgICAgICAgICAgLy8gQ2FsbGVkIHdoZW5ldmVyIGEgY29ubmVjdGlvbiBpcyBsb3N0OiBmdW5jdGlvbih3aWxsUmVjb25uZWN0KVxuICAgICAgICB0aGlzLm9uSGVhcnRiZWF0VGltZW91dCA9IGlnbm9yZTsgICAgICAgICAgIC8vIENhbGxlZCB3aGVuIGEgaGVhcnRiZWF0IHRpbWVvdXQgd2lsbCBjYXVzZSBhIGRpc2Nvbm5lY3Rpb25cbiAgICAgICAgdGhpcy5vblVwZGF0ZSA9IGlnbm9yZTtcblxuICAgICAgICAvLyBQdWJsaWMgcHJvcGVydGllc1xuXG4gICAgICAgIHRoaXMuaWQgPSBudWxsOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXNzaWduZWQgd2hlbiBoZWxsbyByZXNwb25zZSBpcyByZWNlaXZlZFxuICAgIH07XG5cbiAgICBDbGllbnQuV2ViU29ja2V0ID0gLyogJGxhYjpjb3ZlcmFnZTpvZmYkICovICh0eXBlb2YgV2ViU29ja2V0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBXZWJTb2NrZXQpOyAvKiAkbGFiOmNvdmVyYWdlOm9uJCAqL1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcblxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgICBpZiAodGhpcy5fcmVjb25uZWN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IE5lc0Vycm9yKCdDYW5ub3QgY29ubmVjdCB3aGlsZSBjbGllbnQgYXR0ZW1wdHMgdG8gcmVjb25uZWN0JywgZXJyb3JUeXBlcy5VU0VSKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fd3MpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgTmVzRXJyb3IoJ0FscmVhZHkgY29ubmVjdGVkJywgZXJyb3JUeXBlcy5VU0VSKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy5yZWNvbm5lY3QgIT09IGZhbHNlKSB7ICAgICAgICAgICAgICAgICAgLy8gRGVmYXVsdHMgdG8gdHJ1ZVxuICAgICAgICAgICAgdGhpcy5fcmVjb25uZWN0aW9uID0geyAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3B0aW9uczogcmVjb25uZWN0LCBkZWxheSwgbWF4RGVsYXlcbiAgICAgICAgICAgICAgICB3YWl0OiAwLFxuICAgICAgICAgICAgICAgIGRlbGF5OiBvcHRpb25zLmRlbGF5IHx8IDEwMDAsICAgICAgICAgICAgICAgLy8gMSBzZWNvbmRcbiAgICAgICAgICAgICAgICBtYXhEZWxheTogb3B0aW9ucy5tYXhEZWxheSB8fCA1MDAwLCAgICAgICAgIC8vIDUgc2Vjb25kc1xuICAgICAgICAgICAgICAgIHJldHJpZXM6IG9wdGlvbnMucmV0cmllcyB8fCBJbmZpbml0eSwgICAgICAgLy8gVW5saW1pdGVkXG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogb3B0aW9ucy5hdXRoLFxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiBvcHRpb25zLnRpbWVvdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcmVjb25uZWN0aW9uID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Qob3B0aW9ucywgdHJ1ZSwgKGVycikgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5fY29ubmVjdCA9IGZ1bmN0aW9uIChvcHRpb25zLCBpbml0aWFsLCBuZXh0KSB7XG5cbiAgICAgICAgY29uc3Qgd3MgPSB0aGlzLl9pc0Jyb3dzZXIgPyBuZXcgQ2xpZW50LldlYlNvY2tldCh0aGlzLl91cmwpIDogbmV3IENsaWVudC5XZWJTb2NrZXQodGhpcy5fdXJsLCB0aGlzLl9zZXR0aW5ncy53cyk7XG4gICAgICAgIHRoaXMuX3dzID0gd3M7XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdGlvblRpbWVyKTtcbiAgICAgICAgdGhpcy5fcmVjb25uZWN0aW9uVGltZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0IHJlY29ubmVjdCA9IChldmVudCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAod3Mub25vcGVuKSB7XG4gICAgICAgICAgICAgICAgZmluYWxpemUobmV3IE5lc0Vycm9yKCdDb25uZWN0aW9uIHRlcm1pbmF0ZWQgd2hpbGUgd2FpdGluZyB0byBjb25uZWN0JywgZXJyb3JUeXBlcy5XUykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB3YXNSZXF1ZXN0ZWQgPSB0aGlzLl9kaXNjb25uZWN0UmVxdWVzdGVkOyAgICAgICAgIC8vIEdldCB2YWx1ZSBiZWZvcmUgX2NsZWFudXAoKVxuXG4gICAgICAgICAgICB0aGlzLl9jbGVhbnVwKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGxvZyA9IHtcbiAgICAgICAgICAgICAgICBjb2RlOiBldmVudC5jb2RlLFxuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uOiBlcnJvckNvZGVzW2V2ZW50LmNvZGVdIHx8ICdVbmtub3duJyxcbiAgICAgICAgICAgICAgICByZWFzb246IGV2ZW50LnJlYXNvbixcbiAgICAgICAgICAgICAgICB3YXNDbGVhbjogZXZlbnQud2FzQ2xlYW4sXG4gICAgICAgICAgICAgICAgd2lsbFJlY29ubmVjdDogdGhpcy5fd2lsbFJlY29ubmVjdCgpLFxuICAgICAgICAgICAgICAgIHdhc1JlcXVlc3RlZFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5vbkRpc2Nvbm5lY3QobG9nLndpbGxSZWNvbm5lY3QsIGxvZyk7XG4gICAgICAgICAgICB0aGlzLl9yZWNvbm5lY3QoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBmaW5hbGl6ZSA9IChlcnIpID0+IHtcblxuICAgICAgICAgICAgaWYgKG5leHQpIHsgICAgICAgICAgICAgICAgICAgICAvLyBDYWxsIG9ubHkgb25jZSB3aGVuIGNvbm5lY3QoKSBpcyBjYWxsZWRcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0SG9sZGVyID0gbmV4dDtcbiAgICAgICAgICAgICAgICBuZXh0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dEhvbGRlcihlcnIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbkVycm9yKGVycik7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgdGltZW91dEhhbmRsZXIgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuX2NsZWFudXAoKTtcblxuICAgICAgICAgICAgZmluYWxpemUobmV3IE5lc0Vycm9yKCdDb25uZWN0aW9uIHRpbWVkIG91dCcsIGVycm9yVHlwZXMuVElNRU9VVCkpO1xuXG4gICAgICAgICAgICBpZiAoaW5pdGlhbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZWNvbm5lY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB0aW1lb3V0ID0gKG9wdGlvbnMudGltZW91dCA/IHNldFRpbWVvdXQodGltZW91dEhhbmRsZXIsIG9wdGlvbnMudGltZW91dCkgOiBudWxsKTtcblxuICAgICAgICB3cy5vbm9wZW4gPSAoKSA9PiB7XG5cbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICAgIHdzLm9ub3BlbiA9IG51bGw7XG5cbiAgICAgICAgICAgIHRoaXMuX2hlbGxvKG9wdGlvbnMuYXV0aClcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkNvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgZmluYWxpemUoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5wYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fc3Vic2NyaXB0aW9uc1tlcnIucGF0aF07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNjb25uZWN0KCgpID0+IG5leHRUaWNrKGZpbmFsaXplKShlcnIpLCB0cnVlKTsgICAgICAgICAvLyBTdG9wIHJlY29ubmVjdGlvbiB3aGVuIHRoZSBoZWxsbyBtZXNzYWdlIHJldHVybnMgZXJyb3JcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB3cy5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG5cbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuX3dpbGxSZWNvbm5lY3QoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWNvbm5lY3QoZXZlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9jbGVhbnVwKCk7XG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBOZXNFcnJvcignU29ja2V0IGVycm9yJywgZXJyb3JUeXBlcy5XUyk7XG4gICAgICAgICAgICByZXR1cm4gZmluYWxpemUoZXJyb3IpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHdzLm9uY2xvc2UgPSByZWNvbm5lY3Q7XG5cbiAgICAgICAgd3Mub25tZXNzYWdlID0gKG1lc3NhZ2UpID0+IHtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29uTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5vdmVycmlkZVJlY29ubmVjdGlvbkF1dGggPSBmdW5jdGlvbiAoYXV0aCkge1xuXG4gICAgICAgIGlmICghdGhpcy5fcmVjb25uZWN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9yZWNvbm5lY3Rpb24uc2V0dGluZ3MuYXV0aCA9IGF1dGg7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLnJlYXV0aGVudGljYXRlID0gZnVuY3Rpb24gKGF1dGgpIHtcblxuICAgICAgICB0aGlzLm92ZXJyaWRlUmVjb25uZWN0aW9uQXV0aChhdXRoKTtcblxuICAgICAgICBjb25zdCByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ3JlYXV0aCcsXG4gICAgICAgICAgICBhdXRoXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmQocmVxdWVzdCwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHRoaXMuX2Rpc2Nvbm5lY3QocmVzb2x2ZSwgZmFsc2UpKTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5fZGlzY29ubmVjdCA9IGZ1bmN0aW9uIChuZXh0LCBpc0ludGVybmFsKSB7XG5cbiAgICAgICAgdGhpcy5fcmVjb25uZWN0aW9uID0gbnVsbDtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdGlvblRpbWVyKTtcbiAgICAgICAgdGhpcy5fcmVjb25uZWN0aW9uVGltZXIgPSBudWxsO1xuICAgICAgICBjb25zdCByZXF1ZXN0ZWQgPSB0aGlzLl9kaXNjb25uZWN0UmVxdWVzdGVkIHx8ICFpc0ludGVybmFsOyAgICAgICAvLyBSZXRhaW4gdHJ1ZVxuXG4gICAgICAgIGlmICh0aGlzLl9kaXNjb25uZWN0TGlzdGVuZXJzKSB7XG4gICAgICAgICAgICB0aGlzLl9kaXNjb25uZWN0UmVxdWVzdGVkID0gcmVxdWVzdGVkO1xuICAgICAgICAgICAgdGhpcy5fZGlzY29ubmVjdExpc3RlbmVycy5wdXNoKG5leHQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLl93cyB8fFxuICAgICAgICAgICAgKHRoaXMuX3dzLnJlYWR5U3RhdGUgIT09IENsaWVudC5XZWJTb2NrZXQuT1BFTiAmJiB0aGlzLl93cy5yZWFkeVN0YXRlICE9PSBDbGllbnQuV2ViU29ja2V0LkNPTk5FQ1RJTkcpKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXh0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9kaXNjb25uZWN0UmVxdWVzdGVkID0gcmVxdWVzdGVkO1xuICAgICAgICB0aGlzLl9kaXNjb25uZWN0TGlzdGVuZXJzID0gW25leHRdO1xuICAgICAgICB0aGlzLl93cy5jbG9zZSgpO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLl9jbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmICh0aGlzLl93cykge1xuICAgICAgICAgICAgY29uc3Qgd3MgPSB0aGlzLl93cztcbiAgICAgICAgICAgIHRoaXMuX3dzID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKHdzLnJlYWR5U3RhdGUgIT09IENsaWVudC5XZWJTb2NrZXQuQ0xPU0VEICYmXG4gICAgICAgICAgICAgICAgd3MucmVhZHlTdGF0ZSAhPT0gQ2xpZW50LldlYlNvY2tldC5DTE9TSU5HKSB7XG5cbiAgICAgICAgICAgICAgICB3cy5jbG9zZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3cy5vbm9wZW4gPSBudWxsO1xuICAgICAgICAgICAgd3Mub25jbG9zZSA9IG51bGw7XG4gICAgICAgICAgICB3cy5vbmVycm9yID0gaWdub3JlO1xuICAgICAgICAgICAgd3Mub25tZXNzYWdlID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3BhY2tldHMgPSBbXTtcbiAgICAgICAgdGhpcy5pZCA9IG51bGw7XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdCk7XG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdCA9IG51bGw7XG5cbiAgICAgICAgLy8gRmx1c2ggcGVuZGluZyByZXF1ZXN0c1xuXG4gICAgICAgIGNvbnN0IGVycm9yID0gbmV3IE5lc0Vycm9yKCdSZXF1ZXN0IGZhaWxlZCAtIHNlcnZlciBkaXNjb25uZWN0ZWQnLCBlcnJvclR5cGVzLkRJU0NPTk5FQ1QpO1xuXG4gICAgICAgIGNvbnN0IHJlcXVlc3RzID0gdGhpcy5fcmVxdWVzdHM7XG4gICAgICAgIHRoaXMuX3JlcXVlc3RzID0ge307XG4gICAgICAgIGNvbnN0IGlkcyA9IE9iamVjdC5rZXlzKHJlcXVlc3RzKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpZHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gaWRzW2ldO1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdCA9IHJlcXVlc3RzW2lkXTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChyZXF1ZXN0LnRpbWVvdXQpO1xuICAgICAgICAgICAgcmVxdWVzdC5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2Rpc2Nvbm5lY3RMaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2Rpc2Nvbm5lY3RMaXN0ZW5lcnM7XG4gICAgICAgICAgICB0aGlzLl9kaXNjb25uZWN0TGlzdGVuZXJzID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX2Rpc2Nvbm5lY3RSZXF1ZXN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4gbGlzdGVuZXIoKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5fcmVjb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIC8vIFJlY29ubmVjdFxuXG4gICAgICAgIGNvbnN0IHJlY29ubmVjdGlvbiA9IHRoaXMuX3JlY29ubmVjdGlvbjtcbiAgICAgICAgaWYgKCFyZWNvbm5lY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZWNvbm5lY3Rpb24ucmV0cmllcyA8IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kaXNjb25uZWN0KGlnbm9yZSwgdHJ1ZSk7ICAgICAgLy8gQ2xlYXIgX3JlY29ubmVjdGlvbiBzdGF0ZVxuICAgICAgICB9XG5cbiAgICAgICAgLS1yZWNvbm5lY3Rpb24ucmV0cmllcztcbiAgICAgICAgcmVjb25uZWN0aW9uLndhaXQgPSByZWNvbm5lY3Rpb24ud2FpdCArIHJlY29ubmVjdGlvbi5kZWxheTtcblxuICAgICAgICBjb25zdCB0aW1lb3V0ID0gTWF0aC5taW4ocmVjb25uZWN0aW9uLndhaXQsIHJlY29ubmVjdGlvbi5tYXhEZWxheSk7XG5cbiAgICAgICAgdGhpcy5fcmVjb25uZWN0aW9uVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5fY29ubmVjdChyZWNvbm5lY3Rpb24uc2V0dGluZ3MsIGZhbHNlLCAoZXJyKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRpbWVvdXQpO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBwYXRoOiBvcHRpb25zXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdyZXF1ZXN0JyxcbiAgICAgICAgICAgIG1ldGhvZDogb3B0aW9ucy5tZXRob2QgfHwgJ0dFVCcsXG4gICAgICAgICAgICBwYXRoOiBvcHRpb25zLnBhdGgsXG4gICAgICAgICAgICBoZWFkZXJzOiBvcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICBwYXlsb2FkOiBvcHRpb25zLnBheWxvYWRcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fc2VuZChyZXF1ZXN0LCB0cnVlKTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5tZXNzYWdlID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcblxuICAgICAgICBjb25zdCByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ21lc3NhZ2UnLFxuICAgICAgICAgICAgbWVzc2FnZVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZW5kKHJlcXVlc3QsIHRydWUpO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLl9pc1JlYWR5ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl93cyAmJiB0aGlzLl93cy5yZWFkeVN0YXRlID09PSBDbGllbnQuV2ViU29ja2V0Lk9QRU47XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuX3NlbmQgPSBmdW5jdGlvbiAocmVxdWVzdCwgdHJhY2spIHtcblxuICAgICAgICBpZiAoIXRoaXMuX2lzUmVhZHkoKSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBOZXNFcnJvcignRmFpbGVkIHRvIHNlbmQgbWVzc2FnZSAtIHNlcnZlciBkaXNjb25uZWN0ZWQnLCBlcnJvclR5cGVzLkRJU0NPTk5FQ1QpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3QuaWQgPSArK3RoaXMuX2lkcztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIGVuY29kZWQgPSBzdHJpbmdpZnkocmVxdWVzdCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZ25vcmUgZXJyb3JzXG5cbiAgICAgICAgaWYgKCF0cmFjaykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLl93cy5zZW5kKGVuY29kZWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IE5lc0Vycm9yKGVyciwgZXJyb3JUeXBlcy5XUykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVHJhY2sgZXJyb3JzXG5cbiAgICAgICAgY29uc3QgcmVjb3JkID0ge1xuICAgICAgICAgICAgcmVzb2x2ZTogbnVsbCxcbiAgICAgICAgICAgIHJlamVjdDogbnVsbCxcbiAgICAgICAgICAgIHRpbWVvdXQ6IG51bGxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICByZWNvcmQucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAgICAgICByZWNvcmQucmVqZWN0ID0gcmVqZWN0O1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5fc2V0dGluZ3MudGltZW91dCkge1xuICAgICAgICAgICAgcmVjb3JkLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblxuICAgICAgICAgICAgICAgIHJlY29yZC50aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjb3JkLnJlamVjdChuZXcgTmVzRXJyb3IoJ1JlcXVlc3QgdGltZWQgb3V0JywgZXJyb3JUeXBlcy5USU1FT1VUKSk7XG4gICAgICAgICAgICB9LCB0aGlzLl9zZXR0aW5ncy50aW1lb3V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3JlcXVlc3RzW3JlcXVlc3QuaWRdID0gcmVjb3JkO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLl93cy5zZW5kKGVuY29kZWQpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZXF1ZXN0c1tyZXF1ZXN0LmlkXS50aW1lb3V0KTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9yZXF1ZXN0c1tyZXF1ZXN0LmlkXTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgTmVzRXJyb3IoZXJyLCBlcnJvclR5cGVzLldTKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5faGVsbG8gPSBmdW5jdGlvbiAoYXV0aCkge1xuXG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICB0eXBlOiAnaGVsbG8nLFxuICAgICAgICAgICAgdmVyc2lvblxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChhdXRoKSB7XG4gICAgICAgICAgICByZXF1ZXN0LmF1dGggPSBhdXRoO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3VicyA9IHRoaXMuc3Vic2NyaXB0aW9ucygpO1xuICAgICAgICBpZiAoc3Vicy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlcXVlc3Quc3VicyA9IHN1YnM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc2VuZChyZXF1ZXN0LCB0cnVlKTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5zdWJzY3JpcHRpb25zID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9zdWJzY3JpcHRpb25zKTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbiAocGF0aCwgaGFuZGxlcikge1xuXG4gICAgICAgIGlmICghcGF0aCB8fFxuICAgICAgICAgICAgcGF0aFswXSAhPT0gJy8nKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgTmVzRXJyb3IoJ0ludmFsaWQgcGF0aCcsIGVycm9yVHlwZXMuVVNFUikpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3VicyA9IHRoaXMuX3N1YnNjcmlwdGlvbnNbcGF0aF07XG4gICAgICAgIGlmIChzdWJzKSB7XG5cbiAgICAgICAgICAgIC8vIEFscmVhZHkgc3Vic2NyaWJlZFxuXG4gICAgICAgICAgICBpZiAoc3Vicy5pbmRleE9mKGhhbmRsZXIpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHN1YnMucHVzaChoYW5kbGVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uc1twYXRoXSA9IFtoYW5kbGVyXTtcblxuICAgICAgICBpZiAoIXRoaXMuX2lzUmVhZHkoKSkge1xuXG4gICAgICAgICAgICAvLyBRdWV1ZWQgc3Vic2NyaXB0aW9uXG5cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICB0eXBlOiAnc3ViJyxcbiAgICAgICAgICAgIHBhdGhcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBwcm9taXNlID0gdGhpcy5fc2VuZChyZXF1ZXN0LCB0cnVlKTtcbiAgICAgICAgcHJvbWlzZS5jYXRjaCgoaWdub3JlRXJyKSA9PiB7XG5cbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9zdWJzY3JpcHRpb25zW3BhdGhdO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uIChwYXRoLCBoYW5kbGVyKSB7XG5cbiAgICAgICAgaWYgKCFwYXRoIHx8XG4gICAgICAgICAgICBwYXRoWzBdICE9PSAnLycpIHtcblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBOZXNFcnJvcignSW52YWxpZCBwYXRoJywgZXJyb3JUeXBlcy5VU0VSKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdWJzID0gdGhpcy5fc3Vic2NyaXB0aW9uc1twYXRoXTtcbiAgICAgICAgaWYgKCFzdWJzKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3luYyA9IGZhbHNlO1xuICAgICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9zdWJzY3JpcHRpb25zW3BhdGhdO1xuICAgICAgICAgICAgc3luYyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwb3MgPSBzdWJzLmluZGV4T2YoaGFuZGxlcik7XG4gICAgICAgICAgICBpZiAocG9zID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3Vicy5zcGxpY2UocG9zLCAxKTtcbiAgICAgICAgICAgIGlmICghc3Vicy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fc3Vic2NyaXB0aW9uc1twYXRoXTtcbiAgICAgICAgICAgICAgICBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3luYyB8fFxuICAgICAgICAgICAgIXRoaXMuX2lzUmVhZHkoKSkge1xuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ3Vuc3ViJyxcbiAgICAgICAgICAgIHBhdGhcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBwcm9taXNlID0gdGhpcy5fc2VuZChyZXF1ZXN0LCB0cnVlKTtcbiAgICAgICAgcHJvbWlzZS5jYXRjaChpZ25vcmUpOyAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JpbmcgZXJyb3JzIGFzIHRoZSBzdWJzY3JpcHRpb24gaGFuZGxlcnMgYXJlIGFscmVhZHkgcmVtb3ZlZFxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5fb25NZXNzYWdlID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcblxuICAgICAgICB0aGlzLl9iZWF0KCk7XG5cbiAgICAgICAgbGV0IGRhdGEgPSBtZXNzYWdlLmRhdGE7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IGRhdGFbMF07XG4gICAgICAgIGlmIChwcmVmaXggIT09ICd7Jykge1xuICAgICAgICAgICAgdGhpcy5fcGFja2V0cy5wdXNoKGRhdGEuc2xpY2UoMSkpO1xuICAgICAgICAgICAgaWYgKHByZWZpeCAhPT0gJyEnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkYXRhID0gdGhpcy5fcGFja2V0cy5qb2luKCcnKTtcbiAgICAgICAgICAgIHRoaXMuX3BhY2tldHMgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9wYWNrZXRzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5fcGFja2V0cyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5vbkVycm9yKG5ldyBOZXNFcnJvcignUmVjZWl2ZWQgYW4gaW5jb21wbGV0ZSBtZXNzYWdlJywgZXJyb3JUeXBlcy5QUk9UT0NPTCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciB1cGRhdGUgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uRXJyb3IobmV3IE5lc0Vycm9yKGVyciwgZXJyb3JUeXBlcy5QUk9UT0NPTCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVjcmVhdGUgZXJyb3JcblxuICAgICAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgICAgICBpZiAodXBkYXRlLnN0YXR1c0NvZGUgJiZcbiAgICAgICAgICAgIHVwZGF0ZS5zdGF0dXNDb2RlID49IDQwMCkge1xuXG4gICAgICAgICAgICBlcnJvciA9IG5ldyBOZXNFcnJvcih1cGRhdGUucGF5bG9hZC5tZXNzYWdlIHx8IHVwZGF0ZS5wYXlsb2FkLmVycm9yIHx8ICdFcnJvcicsIGVycm9yVHlwZXMuU0VSVkVSKTtcbiAgICAgICAgICAgIGVycm9yLnN0YXR1c0NvZGUgPSB1cGRhdGUuc3RhdHVzQ29kZTtcbiAgICAgICAgICAgIGVycm9yLmRhdGEgPSB1cGRhdGUucGF5bG9hZDtcbiAgICAgICAgICAgIGVycm9yLmhlYWRlcnMgPSB1cGRhdGUuaGVhZGVycztcbiAgICAgICAgICAgIGVycm9yLnBhdGggPSB1cGRhdGUucGF0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBpbmdcblxuICAgICAgICBpZiAodXBkYXRlLnR5cGUgPT09ICdwaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmQoeyB0eXBlOiAncGluZycgfSwgZmFsc2UpLmNhdGNoKGlnbm9yZSk7ICAgICAgICAgLy8gSWdub3JlIGVycm9yc1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnJvYWRjYXN0IGFuZCB1cGRhdGVcblxuICAgICAgICBpZiAodXBkYXRlLnR5cGUgPT09ICd1cGRhdGUnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vblVwZGF0ZSh1cGRhdGUubWVzc2FnZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQdWJsaXNoIG9yIFJldm9rZVxuXG4gICAgICAgIGlmICh1cGRhdGUudHlwZSA9PT0gJ3B1YicgfHxcbiAgICAgICAgICAgIHVwZGF0ZS50eXBlID09PSAncmV2b2tlJykge1xuXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuX3N1YnNjcmlwdGlvbnNbdXBkYXRlLnBhdGhdO1xuICAgICAgICAgICAgaWYgKHVwZGF0ZS50eXBlID09PSAncmV2b2tlJykge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9zdWJzY3JpcHRpb25zW3VwZGF0ZS5wYXRoXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGhhbmRsZXJzICYmXG4gICAgICAgICAgICAgICAgdXBkYXRlLm1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZmxhZ3MgPSB7fTtcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlLnR5cGUgPT09ICdyZXZva2UnKSB7XG4gICAgICAgICAgICAgICAgICAgIGZsYWdzLnJldm9rZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaV0odXBkYXRlLm1lc3NhZ2UsIGZsYWdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvb2t1cCByZXF1ZXN0IChtZXNzYWdlIG11c3QgaW5jbHVkZSBhbiBpZCBmcm9tIHRoaXMgcG9pbnQpXG5cbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMuX3JlcXVlc3RzW3VwZGF0ZS5pZF07XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub25FcnJvcihuZXcgTmVzRXJyb3IoJ1JlY2VpdmVkIHJlc3BvbnNlIGZvciB1bmtub3duIHJlcXVlc3QnLCBlcnJvclR5cGVzLlBST1RPQ09MKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjbGVhclRpbWVvdXQocmVxdWVzdC50aW1lb3V0KTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX3JlcXVlc3RzW3VwZGF0ZS5pZF07XG5cbiAgICAgICAgY29uc3QgbmV4dCA9IChlcnIsIGFyZ3MpID0+IHtcblxuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXF1ZXN0LnJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdC5yZXNvbHZlKGFyZ3MpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJlc3BvbnNlXG5cbiAgICAgICAgaWYgKHVwZGF0ZS50eXBlID09PSAncmVxdWVzdCcpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0KGVycm9yLCB7IHBheWxvYWQ6IHVwZGF0ZS5wYXlsb2FkLCBzdGF0dXNDb2RlOiB1cGRhdGUuc3RhdHVzQ29kZSwgaGVhZGVyczogdXBkYXRlLmhlYWRlcnMgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDdXN0b20gbWVzc2FnZVxuXG4gICAgICAgIGlmICh1cGRhdGUudHlwZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dChlcnJvciwgeyBwYXlsb2FkOiB1cGRhdGUubWVzc2FnZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF1dGhlbnRpY2F0aW9uXG5cbiAgICAgICAgaWYgKHVwZGF0ZS50eXBlID09PSAnaGVsbG8nKSB7XG4gICAgICAgICAgICB0aGlzLmlkID0gdXBkYXRlLnNvY2tldDtcbiAgICAgICAgICAgIGlmICh1cGRhdGUuaGVhcnRiZWF0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dCA9IHVwZGF0ZS5oZWFydGJlYXQuaW50ZXJ2YWwgKyB1cGRhdGUuaGVhcnRiZWF0LnRpbWVvdXQ7XG4gICAgICAgICAgICAgICAgdGhpcy5fYmVhdCgpOyAgICAgICAgICAgLy8gQ2FsbCBhZ2FpbiBvbmNlIHRpbWVvdXQgaXMgc2V0XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBuZXh0KGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1cGRhdGUudHlwZSA9PT0gJ3JlYXV0aCcpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0KGVycm9yLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN1YnNjcmlwdGlvbnNcblxuICAgICAgICBpZiAodXBkYXRlLnR5cGUgPT09ICdzdWInIHx8XG4gICAgICAgICAgICB1cGRhdGUudHlwZSA9PT0gJ3Vuc3ViJykge1xuXG4gICAgICAgICAgICByZXR1cm4gbmV4dChlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBuZXh0KG5ldyBOZXNFcnJvcignUmVjZWl2ZWQgaW52YWxpZCByZXNwb25zZScsIGVycm9yVHlwZXMuUFJPVE9DT0wpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMub25FcnJvcihuZXcgTmVzRXJyb3IoJ1JlY2VpdmVkIHVua25vd24gcmVzcG9uc2UgdHlwZTogJyArIHVwZGF0ZS50eXBlLCBlcnJvclR5cGVzLlBST1RPQ09MKSk7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuX2JlYXQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9oZWFydGJlYXRUaW1lb3V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5faGVhcnRiZWF0KTtcblxuICAgICAgICB0aGlzLl9oZWFydGJlYXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5vbkVycm9yKG5ldyBOZXNFcnJvcignRGlzY29ubmVjdGluZyBkdWUgdG8gaGVhcnRiZWF0IHRpbWVvdXQnLCBlcnJvclR5cGVzLlRJTUVPVVQpKTtcbiAgICAgICAgICAgIHRoaXMub25IZWFydGJlYXRUaW1lb3V0KHRoaXMuX3dpbGxSZWNvbm5lY3QoKSk7XG4gICAgICAgICAgICB0aGlzLl93cy5jbG9zZSgpO1xuICAgICAgICB9LCB0aGlzLl9oZWFydGJlYXRUaW1lb3V0KTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5fd2lsbFJlY29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICByZXR1cm4gISEodGhpcy5fcmVjb25uZWN0aW9uICYmIHRoaXMuX3JlY29ubmVjdGlvbi5yZXRyaWVzID49IDEpO1xuICAgIH07XG5cbiAgICAvLyBFeHBvc2UgaW50ZXJmYWNlXG5cbiAgICByZXR1cm4geyBDbGllbnQgfTtcbn0pO1xuIiwiLyoqXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIDxodHRwczovL2pxdWVyeS5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG5cbi8qKiBVc2VkIGFzIHRoZSBgVHlwZUVycm9yYCBtZXNzYWdlIGZvciBcIkZ1bmN0aW9uc1wiIG1ldGhvZHMuICovXG52YXIgRlVOQ19FUlJPUl9URVhUID0gJ0V4cGVjdGVkIGEgZnVuY3Rpb24nO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBOQU4gPSAwIC8gMDtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKiogVXNlZCB0byBtYXRjaCBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLiAqL1xudmFyIHJlVHJpbSA9IC9eXFxzK3xcXHMrJC9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmFkIHNpZ25lZCBoZXhhZGVjaW1hbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCYWRIZXggPSAvXlstK10weFswLTlhLWZdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJpbmFyeSBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCaW5hcnkgPSAvXjBiWzAxXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvY3RhbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNPY3RhbCA9IC9eMG9bMC03XSskL2k7XG5cbi8qKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB3aXRob3V0IGEgZGVwZW5kZW5jeSBvbiBgcm9vdGAuICovXG52YXIgZnJlZVBhcnNlSW50ID0gcGFyc2VJbnQ7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heCxcbiAgICBuYXRpdmVNaW4gPSBNYXRoLm1pbjtcblxuLyoqXG4gKiBHZXRzIHRoZSB0aW1lc3RhbXAgb2YgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCBoYXZlIGVsYXBzZWQgc2luY2VcbiAqIHRoZSBVbml4IGVwb2NoICgxIEphbnVhcnkgMTk3MCAwMDowMDowMCBVVEMpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBEYXRlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSB0aW1lc3RhbXAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZGVmZXIoZnVuY3Rpb24oc3RhbXApIHtcbiAqICAgY29uc29sZS5sb2coXy5ub3coKSAtIHN0YW1wKTtcbiAqIH0sIF8ubm93KCkpO1xuICogLy8gPT4gTG9ncyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpdCB0b29rIGZvciB0aGUgZGVmZXJyZWQgaW52b2NhdGlvbi5cbiAqL1xudmFyIG5vdyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gcm9vdC5EYXRlLm5vdygpO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZGVib3VuY2VkIGZ1bmN0aW9uIHRoYXQgZGVsYXlzIGludm9raW5nIGBmdW5jYCB1bnRpbCBhZnRlciBgd2FpdGBcbiAqIG1pbGxpc2Vjb25kcyBoYXZlIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgdGltZSB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHdhc1xuICogaW52b2tlZC4gVGhlIGRlYm91bmNlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGAgbWV0aG9kIHRvIGNhbmNlbFxuICogZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG8gaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uXG4gKiBQcm92aWRlIGBvcHRpb25zYCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBmdW5jYCBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGVcbiAqIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YCB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWRcbiAqIHdpdGggdGhlIGxhc3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnRcbiAqIGNhbGxzIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gcmV0dXJuIHRoZSByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgXG4gKiBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXNcbiAqIGludm9rZWQgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uXG4gKiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIGAwYCBhbmQgYGxlYWRpbmdgIGlzIGBmYWxzZWAsIGBmdW5jYCBpbnZvY2F0aW9uIGlzIGRlZmVycmVkXG4gKiB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiBgMGAuXG4gKlxuICogU2VlIFtEYXZpZCBDb3JiYWNobydzIGFydGljbGVdKGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZGVib3VuY2luZy10aHJvdHRsaW5nLWV4cGxhaW5lZC1leGFtcGxlcy8pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLmRlYm91bmNlYCBhbmQgYF8udGhyb3R0bGVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gZGVib3VuY2UuXG4gKiBAcGFyYW0ge251bWJlcn0gW3dhaXQ9MF0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gZGVsYXkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz1mYWxzZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2FpdF1cbiAqICBUaGUgbWF4aW11bSB0aW1lIGBmdW5jYCBpcyBhbGxvd2VkIHRvIGJlIGRlbGF5ZWQgYmVmb3JlIGl0J3MgaW52b2tlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZGVib3VuY2VkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCBjb3N0bHkgY2FsY3VsYXRpb25zIHdoaWxlIHRoZSB3aW5kb3cgc2l6ZSBpcyBpbiBmbHV4LlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3Jlc2l6ZScsIF8uZGVib3VuY2UoY2FsY3VsYXRlTGF5b3V0LCAxNTApKTtcbiAqXG4gKiAvLyBJbnZva2UgYHNlbmRNYWlsYCB3aGVuIGNsaWNrZWQsIGRlYm91bmNpbmcgc3Vic2VxdWVudCBjYWxscy5cbiAqIGpRdWVyeShlbGVtZW50KS5vbignY2xpY2snLCBfLmRlYm91bmNlKHNlbmRNYWlsLCAzMDAsIHtcbiAqICAgJ2xlYWRpbmcnOiB0cnVlLFxuICogICAndHJhaWxpbmcnOiBmYWxzZVxuICogfSkpO1xuICpcbiAqIC8vIEVuc3VyZSBgYmF0Y2hMb2dgIGlzIGludm9rZWQgb25jZSBhZnRlciAxIHNlY29uZCBvZiBkZWJvdW5jZWQgY2FsbHMuXG4gKiB2YXIgZGVib3VuY2VkID0gXy5kZWJvdW5jZShiYXRjaExvZywgMjUwLCB7ICdtYXhXYWl0JzogMTAwMCB9KTtcbiAqIHZhciBzb3VyY2UgPSBuZXcgRXZlbnRTb3VyY2UoJy9zdHJlYW0nKTtcbiAqIGpRdWVyeShzb3VyY2UpLm9uKCdtZXNzYWdlJywgZGVib3VuY2VkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIGRlYm91bmNlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgZGVib3VuY2VkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxhc3RBcmdzLFxuICAgICAgbGFzdFRoaXMsXG4gICAgICBtYXhXYWl0LFxuICAgICAgcmVzdWx0LFxuICAgICAgdGltZXJJZCxcbiAgICAgIGxhc3RDYWxsVGltZSxcbiAgICAgIGxhc3RJbnZva2VUaW1lID0gMCxcbiAgICAgIGxlYWRpbmcgPSBmYWxzZSxcbiAgICAgIG1heGluZyA9IGZhbHNlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIHdhaXQgPSB0b051bWJlcih3YWl0KSB8fCAwO1xuICBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gISFvcHRpb25zLmxlYWRpbmc7XG4gICAgbWF4aW5nID0gJ21heFdhaXQnIGluIG9wdGlvbnM7XG4gICAgbWF4V2FpdCA9IG1heGluZyA/IG5hdGl2ZU1heCh0b051bWJlcihvcHRpb25zLm1heFdhaXQpIHx8IDAsIHdhaXQpIDogbWF4V2FpdDtcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG5cbiAgZnVuY3Rpb24gaW52b2tlRnVuYyh0aW1lKSB7XG4gICAgdmFyIGFyZ3MgPSBsYXN0QXJncyxcbiAgICAgICAgdGhpc0FyZyA9IGxhc3RUaGlzO1xuXG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gbGVhZGluZ0VkZ2UodGltZSkge1xuICAgIC8vIFJlc2V0IGFueSBgbWF4V2FpdGAgdGltZXIuXG4gICAgbGFzdEludm9rZVRpbWUgPSB0aW1lO1xuICAgIC8vIFN0YXJ0IHRoZSB0aW1lciBmb3IgdGhlIHRyYWlsaW5nIGVkZ2UuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAvLyBJbnZva2UgdGhlIGxlYWRpbmcgZWRnZS5cbiAgICByZXR1cm4gbGVhZGluZyA/IGludm9rZUZ1bmModGltZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiByZW1haW5pbmdXYWl0KHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lLFxuICAgICAgICByZXN1bHQgPSB3YWl0IC0gdGltZVNpbmNlTGFzdENhbGw7XG5cbiAgICByZXR1cm4gbWF4aW5nID8gbmF0aXZlTWluKHJlc3VsdCwgbWF4V2FpdCAtIHRpbWVTaW5jZUxhc3RJbnZva2UpIDogcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvdWxkSW52b2tlKHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lO1xuXG4gICAgLy8gRWl0aGVyIHRoaXMgaXMgdGhlIGZpcnN0IGNhbGwsIGFjdGl2aXR5IGhhcyBzdG9wcGVkIGFuZCB3ZSdyZSBhdCB0aGVcbiAgICAvLyB0cmFpbGluZyBlZGdlLCB0aGUgc3lzdGVtIHRpbWUgaGFzIGdvbmUgYmFja3dhcmRzIGFuZCB3ZSdyZSB0cmVhdGluZ1xuICAgIC8vIGl0IGFzIHRoZSB0cmFpbGluZyBlZGdlLCBvciB3ZSd2ZSBoaXQgdGhlIGBtYXhXYWl0YCBsaW1pdC5cbiAgICByZXR1cm4gKGxhc3RDYWxsVGltZSA9PT0gdW5kZWZpbmVkIHx8ICh0aW1lU2luY2VMYXN0Q2FsbCA+PSB3YWl0KSB8fFxuICAgICAgKHRpbWVTaW5jZUxhc3RDYWxsIDwgMCkgfHwgKG1heGluZyAmJiB0aW1lU2luY2VMYXN0SW52b2tlID49IG1heFdhaXQpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpbWVyRXhwaXJlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpO1xuICAgIGlmIChzaG91bGRJbnZva2UodGltZSkpIHtcbiAgICAgIHJldHVybiB0cmFpbGluZ0VkZ2UodGltZSk7XG4gICAgfVxuICAgIC8vIFJlc3RhcnQgdGhlIHRpbWVyLlxuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgcmVtYWluaW5nV2FpdCh0aW1lKSk7XG4gIH1cblxuICBmdW5jdGlvbiB0cmFpbGluZ0VkZ2UodGltZSkge1xuICAgIHRpbWVySWQgPSB1bmRlZmluZWQ7XG5cbiAgICAvLyBPbmx5IGludm9rZSBpZiB3ZSBoYXZlIGBsYXN0QXJnc2Agd2hpY2ggbWVhbnMgYGZ1bmNgIGhhcyBiZWVuXG4gICAgLy8gZGVib3VuY2VkIGF0IGxlYXN0IG9uY2UuXG4gICAgaWYgKHRyYWlsaW5nICYmIGxhc3RBcmdzKSB7XG4gICAgICByZXR1cm4gaW52b2tlRnVuYyh0aW1lKTtcbiAgICB9XG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgIGlmICh0aW1lcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICB9XG4gICAgbGFzdEludm9rZVRpbWUgPSAwO1xuICAgIGxhc3RBcmdzID0gbGFzdENhbGxUaW1lID0gbGFzdFRoaXMgPSB0aW1lcklkID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgcmV0dXJuIHRpbWVySWQgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IHRyYWlsaW5nRWRnZShub3coKSk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWJvdW5jZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKSxcbiAgICAgICAgaXNJbnZva2luZyA9IHNob3VsZEludm9rZSh0aW1lKTtcblxuICAgIGxhc3RBcmdzID0gYXJndW1lbnRzO1xuICAgIGxhc3RUaGlzID0gdGhpcztcbiAgICBsYXN0Q2FsbFRpbWUgPSB0aW1lO1xuXG4gICAgaWYgKGlzSW52b2tpbmcpIHtcbiAgICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGxlYWRpbmdFZGdlKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgICBpZiAobWF4aW5nKSB7XG4gICAgICAgIC8vIEhhbmRsZSBpbnZvY2F0aW9ucyBpbiBhIHRpZ2h0IGxvb3AuXG4gICAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgICAgIHJldHVybiBpbnZva2VGdW5jKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgZGVib3VuY2VkLmNhbmNlbCA9IGNhbmNlbDtcbiAgZGVib3VuY2VkLmZsdXNoID0gZmx1c2g7XG4gIHJldHVybiBkZWJvdW5jZWQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHRocm90dGxlZCBmdW5jdGlvbiB0aGF0IG9ubHkgaW52b2tlcyBgZnVuY2AgYXQgbW9zdCBvbmNlIHBlclxuICogZXZlcnkgYHdhaXRgIG1pbGxpc2Vjb25kcy4gVGhlIHRocm90dGxlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGBcbiAqIG1ldGhvZCB0byBjYW5jZWwgZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG9cbiAqIGltbWVkaWF0ZWx5IGludm9rZSB0aGVtLiBQcm92aWRlIGBvcHRpb25zYCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBmdW5jYFxuICogc2hvdWxkIGJlIGludm9rZWQgb24gdGhlIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YFxuICogdGltZW91dC4gVGhlIGBmdW5jYCBpcyBpbnZva2VkIHdpdGggdGhlIGxhc3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZVxuICogdGhyb3R0bGVkIGZ1bmN0aW9uLiBTdWJzZXF1ZW50IGNhbGxzIHRvIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gcmV0dXJuIHRoZVxuICogcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYCBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXNcbiAqIGludm9rZWQgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uXG4gKiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIGAwYCBhbmQgYGxlYWRpbmdgIGlzIGBmYWxzZWAsIGBmdW5jYCBpbnZvY2F0aW9uIGlzIGRlZmVycmVkXG4gKiB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiBgMGAuXG4gKlxuICogU2VlIFtEYXZpZCBDb3JiYWNobydzIGFydGljbGVdKGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZGVib3VuY2luZy10aHJvdHRsaW5nLWV4cGxhaW5lZC1leGFtcGxlcy8pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLnRocm90dGxlYCBhbmQgYF8uZGVib3VuY2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gdGhyb3R0bGUuXG4gKiBAcGFyYW0ge251bWJlcn0gW3dhaXQ9MF0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gdGhyb3R0bGUgaW52b2NhdGlvbnMgdG8uXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgdGhyb3R0bGVkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCBleGNlc3NpdmVseSB1cGRhdGluZyB0aGUgcG9zaXRpb24gd2hpbGUgc2Nyb2xsaW5nLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3Njcm9sbCcsIF8udGhyb3R0bGUodXBkYXRlUG9zaXRpb24sIDEwMCkpO1xuICpcbiAqIC8vIEludm9rZSBgcmVuZXdUb2tlbmAgd2hlbiB0aGUgY2xpY2sgZXZlbnQgaXMgZmlyZWQsIGJ1dCBub3QgbW9yZSB0aGFuIG9uY2UgZXZlcnkgNSBtaW51dGVzLlxuICogdmFyIHRocm90dGxlZCA9IF8udGhyb3R0bGUocmVuZXdUb2tlbiwgMzAwMDAwLCB7ICd0cmFpbGluZyc6IGZhbHNlIH0pO1xuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIHRocm90dGxlZCk7XG4gKlxuICogLy8gQ2FuY2VsIHRoZSB0cmFpbGluZyB0aHJvdHRsZWQgaW52b2NhdGlvbi5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRocm90dGxlZC5jYW5jZWwpO1xuICovXG5mdW5jdGlvbiB0aHJvdHRsZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsZWFkaW5nID0gdHJ1ZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gJ2xlYWRpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMubGVhZGluZyA6IGxlYWRpbmc7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuICByZXR1cm4gZGVib3VuY2UoZnVuYywgd2FpdCwge1xuICAgICdsZWFkaW5nJzogbGVhZGluZyxcbiAgICAnbWF4V2FpdCc6IHdhaXQsXG4gICAgJ3RyYWlsaW5nJzogdHJhaWxpbmdcbiAgfSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gISF2YWx1ZSAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN5bWJvbGAgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHN5bWJvbCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3ltYm9sKFN5bWJvbC5pdGVyYXRvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N5bWJvbCgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gc3ltYm9sVGFnKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgbnVtYmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgbnVtYmVyLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvTnVtYmVyKDMuMik7XG4gKiAvLyA9PiAzLjJcbiAqXG4gKiBfLnRvTnVtYmVyKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gNWUtMzI0XG4gKlxuICogXy50b051bWJlcihJbmZpbml0eSk7XG4gKiAvLyA9PiBJbmZpbml0eVxuICpcbiAqIF8udG9OdW1iZXIoJzMuMicpO1xuICogLy8gPT4gMy4yXG4gKi9cbmZ1bmN0aW9uIHRvTnVtYmVyKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiBOQU47XG4gIH1cbiAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHZhciBvdGhlciA9IHR5cGVvZiB2YWx1ZS52YWx1ZU9mID09ICdmdW5jdGlvbicgPyB2YWx1ZS52YWx1ZU9mKCkgOiB2YWx1ZTtcbiAgICB2YWx1ZSA9IGlzT2JqZWN0KG90aGVyKSA/IChvdGhlciArICcnKSA6IG90aGVyO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IDAgPyB2YWx1ZSA6ICt2YWx1ZTtcbiAgfVxuICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UocmVUcmltLCAnJyk7XG4gIHZhciBpc0JpbmFyeSA9IHJlSXNCaW5hcnkudGVzdCh2YWx1ZSk7XG4gIHJldHVybiAoaXNCaW5hcnkgfHwgcmVJc09jdGFsLnRlc3QodmFsdWUpKVxuICAgID8gZnJlZVBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCBpc0JpbmFyeSA/IDIgOiA4KVxuICAgIDogKHJlSXNCYWRIZXgudGVzdCh2YWx1ZSkgPyBOQU4gOiArdmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRocm90dGxlO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG52YXIgcnVudGltZSA9IChmdW5jdGlvbiAoZXhwb3J0cykge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgT3AgPSBPYmplY3QucHJvdG90eXBlO1xuICB2YXIgaGFzT3duID0gT3AuaGFzT3duUHJvcGVydHk7XG4gIHZhciB1bmRlZmluZWQ7IC8vIE1vcmUgY29tcHJlc3NpYmxlIHRoYW4gdm9pZCAwLlxuICB2YXIgJFN5bWJvbCA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbCA6IHt9O1xuICB2YXIgaXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLml0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiO1xuICB2YXIgYXN5bmNJdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuYXN5bmNJdGVyYXRvciB8fCBcIkBAYXN5bmNJdGVyYXRvclwiO1xuICB2YXIgdG9TdHJpbmdUYWdTeW1ib2wgPSAkU3ltYm9sLnRvU3RyaW5nVGFnIHx8IFwiQEB0b1N0cmluZ1RhZ1wiO1xuXG4gIGZ1bmN0aW9uIGRlZmluZShvYmosIGtleSwgdmFsdWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiBvYmpba2V5XTtcbiAgfVxuICB0cnkge1xuICAgIC8vIElFIDggaGFzIGEgYnJva2VuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSB0aGF0IG9ubHkgd29ya3Mgb24gRE9NIG9iamVjdHMuXG4gICAgZGVmaW5lKHt9LCBcIlwiKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgZGVmaW5lID0gZnVuY3Rpb24ob2JqLCBrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gb2JqW2tleV0gPSB2YWx1ZTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIC8vIElmIG91dGVyRm4gcHJvdmlkZWQgYW5kIG91dGVyRm4ucHJvdG90eXBlIGlzIGEgR2VuZXJhdG9yLCB0aGVuIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yLlxuICAgIHZhciBwcm90b0dlbmVyYXRvciA9IG91dGVyRm4gJiYgb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IgPyBvdXRlckZuIDogR2VuZXJhdG9yO1xuICAgIHZhciBnZW5lcmF0b3IgPSBPYmplY3QuY3JlYXRlKHByb3RvR2VuZXJhdG9yLnByb3RvdHlwZSk7XG4gICAgdmFyIGNvbnRleHQgPSBuZXcgQ29udGV4dCh0cnlMb2NzTGlzdCB8fCBbXSk7XG5cbiAgICAvLyBUaGUgLl9pbnZva2UgbWV0aG9kIHVuaWZpZXMgdGhlIGltcGxlbWVudGF0aW9ucyBvZiB0aGUgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzLlxuICAgIGdlbmVyYXRvci5faW52b2tlID0gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcblxuICAgIHJldHVybiBnZW5lcmF0b3I7XG4gIH1cbiAgZXhwb3J0cy53cmFwID0gd3JhcDtcblxuICAvLyBUcnkvY2F0Y2ggaGVscGVyIHRvIG1pbmltaXplIGRlb3B0aW1pemF0aW9ucy4gUmV0dXJucyBhIGNvbXBsZXRpb25cbiAgLy8gcmVjb3JkIGxpa2UgY29udGV4dC50cnlFbnRyaWVzW2ldLmNvbXBsZXRpb24uIFRoaXMgaW50ZXJmYWNlIGNvdWxkXG4gIC8vIGhhdmUgYmVlbiAoYW5kIHdhcyBwcmV2aW91c2x5KSBkZXNpZ25lZCB0byB0YWtlIGEgY2xvc3VyZSB0byBiZVxuICAvLyBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnRzLCBidXQgaW4gYWxsIHRoZSBjYXNlcyB3ZSBjYXJlIGFib3V0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhbiBleGlzdGluZyBtZXRob2Qgd2Ugd2FudCB0byBjYWxsLCBzbyB0aGVyZSdzIG5vIG5lZWRcbiAgLy8gdG8gY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIG9iamVjdC4gV2UgY2FuIGV2ZW4gZ2V0IGF3YXkgd2l0aCBhc3N1bWluZ1xuICAvLyB0aGUgbWV0aG9kIHRha2VzIGV4YWN0bHkgb25lIGFyZ3VtZW50LCBzaW5jZSB0aGF0IGhhcHBlbnMgdG8gYmUgdHJ1ZVxuICAvLyBpbiBldmVyeSBjYXNlLCBzbyB3ZSBkb24ndCBoYXZlIHRvIHRvdWNoIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBUaGVcbiAgLy8gb25seSBhZGRpdGlvbmFsIGFsbG9jYXRpb24gcmVxdWlyZWQgaXMgdGhlIGNvbXBsZXRpb24gcmVjb3JkLCB3aGljaFxuICAvLyBoYXMgYSBzdGFibGUgc2hhcGUgYW5kIHNvIGhvcGVmdWxseSBzaG91bGQgYmUgY2hlYXAgdG8gYWxsb2NhdGUuXG4gIGZ1bmN0aW9uIHRyeUNhdGNoKGZuLCBvYmosIGFyZykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIm5vcm1hbFwiLCBhcmc6IGZuLmNhbGwob2JqLCBhcmcpIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcInRocm93XCIsIGFyZzogZXJyIH07XG4gICAgfVxuICB9XG5cbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkU3RhcnQgPSBcInN1c3BlbmRlZFN0YXJ0XCI7XG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkID0gXCJzdXNwZW5kZWRZaWVsZFwiO1xuICB2YXIgR2VuU3RhdGVFeGVjdXRpbmcgPSBcImV4ZWN1dGluZ1wiO1xuICB2YXIgR2VuU3RhdGVDb21wbGV0ZWQgPSBcImNvbXBsZXRlZFwiO1xuXG4gIC8vIFJldHVybmluZyB0aGlzIG9iamVjdCBmcm9tIHRoZSBpbm5lckZuIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXNcbiAgLy8gYnJlYWtpbmcgb3V0IG9mIHRoZSBkaXNwYXRjaCBzd2l0Y2ggc3RhdGVtZW50LlxuICB2YXIgQ29udGludWVTZW50aW5lbCA9IHt9O1xuXG4gIC8vIER1bW15IGNvbnN0cnVjdG9yIGZ1bmN0aW9ucyB0aGF0IHdlIHVzZSBhcyB0aGUgLmNvbnN0cnVjdG9yIGFuZFxuICAvLyAuY29uc3RydWN0b3IucHJvdG90eXBlIHByb3BlcnRpZXMgZm9yIGZ1bmN0aW9ucyB0aGF0IHJldHVybiBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0cy4gRm9yIGZ1bGwgc3BlYyBjb21wbGlhbmNlLCB5b3UgbWF5IHdpc2ggdG8gY29uZmlndXJlIHlvdXJcbiAgLy8gbWluaWZpZXIgbm90IHRvIG1hbmdsZSB0aGUgbmFtZXMgb2YgdGhlc2UgdHdvIGZ1bmN0aW9ucy5cbiAgZnVuY3Rpb24gR2VuZXJhdG9yKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb24oKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSgpIHt9XG5cbiAgLy8gVGhpcyBpcyBhIHBvbHlmaWxsIGZvciAlSXRlcmF0b3JQcm90b3R5cGUlIGZvciBlbnZpcm9ubWVudHMgdGhhdFxuICAvLyBkb24ndCBuYXRpdmVseSBzdXBwb3J0IGl0LlxuICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcbiAgZGVmaW5lKEl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCwgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9KTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICBkZWZpbmUoR3AsIFwiY29uc3RydWN0b3JcIiwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICBkZWZpbmUoR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUsIFwiY29uc3RydWN0b3JcIiwgR2VuZXJhdG9yRnVuY3Rpb24pO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5kaXNwbGF5TmFtZSA9IGRlZmluZShcbiAgICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSxcbiAgICB0b1N0cmluZ1RhZ1N5bWJvbCxcbiAgICBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgKTtcblxuICAvLyBIZWxwZXIgZm9yIGRlZmluaW5nIHRoZSAubmV4dCwgLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzIG9mIHRoZVxuICAvLyBJdGVyYXRvciBpbnRlcmZhY2UgaW4gdGVybXMgb2YgYSBzaW5nbGUgLl9pbnZva2UgbWV0aG9kLlxuICBmdW5jdGlvbiBkZWZpbmVJdGVyYXRvck1ldGhvZHMocHJvdG90eXBlKSB7XG4gICAgW1wibmV4dFwiLCBcInRocm93XCIsIFwicmV0dXJuXCJdLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICBkZWZpbmUocHJvdG90eXBlLCBtZXRob2QsIGZ1bmN0aW9uKGFyZykge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgZXhwb3J0cy5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBkZWZpbmUoZ2VuRnVuLCB0b1N0cmluZ1RhZ1N5bWJvbCwgXCJHZW5lcmF0b3JGdW5jdGlvblwiKTtcbiAgICB9XG4gICAgZ2VuRnVuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR3ApO1xuICAgIHJldHVybiBnZW5GdW47XG4gIH07XG5cbiAgLy8gV2l0aGluIHRoZSBib2R5IG9mIGFueSBhc3luYyBmdW5jdGlvbiwgYGF3YWl0IHhgIGlzIHRyYW5zZm9ybWVkIHRvXG4gIC8vIGB5aWVsZCByZWdlbmVyYXRvclJ1bnRpbWUuYXdyYXAoeClgLCBzbyB0aGF0IHRoZSBydW50aW1lIGNhbiB0ZXN0XG4gIC8vIGBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpYCB0byBkZXRlcm1pbmUgaWYgdGhlIHlpZWxkZWQgdmFsdWUgaXNcbiAgLy8gbWVhbnQgdG8gYmUgYXdhaXRlZC5cbiAgZXhwb3J0cy5hd3JhcCA9IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB7IF9fYXdhaXQ6IGFyZyB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIEFzeW5jSXRlcmF0b3IoZ2VuZXJhdG9yLCBQcm9taXNlSW1wbCkge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2VJbXBsLnJlc29sdmUodmFsdWUuX19hd2FpdCkudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaW52b2tlKFwibmV4dFwiLCB2YWx1ZSwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGludm9rZShcInRocm93XCIsIGVyciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlSW1wbC5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uKHVud3JhcHBlZCkge1xuICAgICAgICAgIC8vIFdoZW4gYSB5aWVsZGVkIFByb21pc2UgaXMgcmVzb2x2ZWQsIGl0cyBmaW5hbCB2YWx1ZSBiZWNvbWVzXG4gICAgICAgICAgLy8gdGhlIC52YWx1ZSBvZiB0aGUgUHJvbWlzZTx7dmFsdWUsZG9uZX0+IHJlc3VsdCBmb3IgdGhlXG4gICAgICAgICAgLy8gY3VycmVudCBpdGVyYXRpb24uXG4gICAgICAgICAgcmVzdWx0LnZhbHVlID0gdW53cmFwcGVkO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAvLyBJZiBhIHJlamVjdGVkIFByb21pc2Ugd2FzIHlpZWxkZWQsIHRocm93IHRoZSByZWplY3Rpb24gYmFja1xuICAgICAgICAgIC8vIGludG8gdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgaGFuZGxlZCB0aGVyZS5cbiAgICAgICAgICByZXR1cm4gaW52b2tlKFwidGhyb3dcIiwgZXJyb3IsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcmV2aW91c1Byb21pc2U7XG5cbiAgICBmdW5jdGlvbiBlbnF1ZXVlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBmdW5jdGlvbiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlSW1wbChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldmlvdXNQcm9taXNlID1cbiAgICAgICAgLy8gSWYgZW5xdWV1ZSBoYXMgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIHdlIHdhbnQgdG8gd2FpdCB1bnRpbFxuICAgICAgICAvLyBhbGwgcHJldmlvdXMgUHJvbWlzZXMgaGF2ZSBiZWVuIHJlc29sdmVkIGJlZm9yZSBjYWxsaW5nIGludm9rZSxcbiAgICAgICAgLy8gc28gdGhhdCByZXN1bHRzIGFyZSBhbHdheXMgZGVsaXZlcmVkIGluIHRoZSBjb3JyZWN0IG9yZGVyLiBJZlxuICAgICAgICAvLyBlbnF1ZXVlIGhhcyBub3QgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIGl0IGlzIGltcG9ydGFudCB0b1xuICAgICAgICAvLyBjYWxsIGludm9rZSBpbW1lZGlhdGVseSwgd2l0aG91dCB3YWl0aW5nIG9uIGEgY2FsbGJhY2sgdG8gZmlyZSxcbiAgICAgICAgLy8gc28gdGhhdCB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhcyB0aGUgb3Bwb3J0dW5pdHkgdG8gZG9cbiAgICAgICAgLy8gYW55IG5lY2Vzc2FyeSBzZXR1cCBpbiBhIHByZWRpY3RhYmxlIHdheS4gVGhpcyBwcmVkaWN0YWJpbGl0eVxuICAgICAgICAvLyBpcyB3aHkgdGhlIFByb21pc2UgY29uc3RydWN0b3Igc3luY2hyb25vdXNseSBpbnZva2VzIGl0c1xuICAgICAgICAvLyBleGVjdXRvciBjYWxsYmFjaywgYW5kIHdoeSBhc3luYyBmdW5jdGlvbnMgc3luY2hyb25vdXNseVxuICAgICAgICAvLyBleGVjdXRlIGNvZGUgYmVmb3JlIHRoZSBmaXJzdCBhd2FpdC4gU2luY2Ugd2UgaW1wbGVtZW50IHNpbXBsZVxuICAgICAgICAvLyBhc3luYyBmdW5jdGlvbnMgaW4gdGVybXMgb2YgYXN5bmMgZ2VuZXJhdG9ycywgaXQgaXMgZXNwZWNpYWxseVxuICAgICAgICAvLyBpbXBvcnRhbnQgdG8gZ2V0IHRoaXMgcmlnaHQsIGV2ZW4gdGhvdWdoIGl0IHJlcXVpcmVzIGNhcmUuXG4gICAgICAgIHByZXZpb3VzUHJvbWlzZSA/IHByZXZpb3VzUHJvbWlzZS50aGVuKFxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnLFxuICAgICAgICAgIC8vIEF2b2lkIHByb3BhZ2F0aW5nIGZhaWx1cmVzIHRvIFByb21pc2VzIHJldHVybmVkIGJ5IGxhdGVyXG4gICAgICAgICAgLy8gaW52b2NhdGlvbnMgb2YgdGhlIGl0ZXJhdG9yLlxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnXG4gICAgICAgICkgOiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpO1xuICAgIH1cblxuICAgIC8vIERlZmluZSB0aGUgdW5pZmllZCBoZWxwZXIgbWV0aG9kIHRoYXQgaXMgdXNlZCB0byBpbXBsZW1lbnQgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiAoc2VlIGRlZmluZUl0ZXJhdG9yTWV0aG9kcykuXG4gICAgdGhpcy5faW52b2tlID0gZW5xdWV1ZTtcbiAgfVxuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhBc3luY0l0ZXJhdG9yLnByb3RvdHlwZSk7XG4gIGRlZmluZShBc3luY0l0ZXJhdG9yLnByb3RvdHlwZSwgYXN5bmNJdGVyYXRvclN5bWJvbCwgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9KTtcbiAgZXhwb3J0cy5Bc3luY0l0ZXJhdG9yID0gQXN5bmNJdGVyYXRvcjtcblxuICAvLyBOb3RlIHRoYXQgc2ltcGxlIGFzeW5jIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gIC8vIEFzeW5jSXRlcmF0b3Igb2JqZWN0czsgdGhleSBqdXN0IHJldHVybiBhIFByb21pc2UgZm9yIHRoZSB2YWx1ZSBvZlxuICAvLyB0aGUgZmluYWwgcmVzdWx0IHByb2R1Y2VkIGJ5IHRoZSBpdGVyYXRvci5cbiAgZXhwb3J0cy5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0LCBQcm9taXNlSW1wbCkge1xuICAgIGlmIChQcm9taXNlSW1wbCA9PT0gdm9pZCAwKSBQcm9taXNlSW1wbCA9IFByb21pc2U7XG5cbiAgICB2YXIgaXRlciA9IG5ldyBBc3luY0l0ZXJhdG9yKFxuICAgICAgd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCksXG4gICAgICBQcm9taXNlSW1wbFxuICAgICk7XG5cbiAgICByZXR1cm4gZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uKG91dGVyRm4pXG4gICAgICA/IGl0ZXIgLy8gSWYgb3V0ZXJGbiBpcyBhIGdlbmVyYXRvciwgcmV0dXJuIHRoZSBmdWxsIGl0ZXJhdG9yLlxuICAgICAgOiBpdGVyLm5leHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZG9uZSA/IHJlc3VsdC52YWx1ZSA6IGl0ZXIubmV4dCgpO1xuICAgICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpIHtcbiAgICB2YXIgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUV4ZWN1dGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlQ29tcGxldGVkKSB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJlIGZvcmdpdmluZywgcGVyIDI1LjMuMy4zLjMgb2YgdGhlIHNwZWM6XG4gICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgcmV0dXJuIGRvbmVSZXN1bHQoKTtcbiAgICAgIH1cblxuICAgICAgY29udGV4dC5tZXRob2QgPSBtZXRob2Q7XG4gICAgICBjb250ZXh0LmFyZyA9IGFyZztcblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgdmFyIGRlbGVnYXRlUmVzdWx0ID0gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG4gICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQgPT09IENvbnRpbnVlU2VudGluZWwpIGNvbnRpbnVlO1xuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlUmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAvLyBTZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgICAgIGNvbnRleHQuc2VudCA9IGNvbnRleHQuX3NlbnQgPSBjb250ZXh0LmFyZztcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQpIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBjb250ZXh0LmFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKTtcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgY29udGV4dC5hcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUV4ZWN1dGluZztcblxuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgICAgIC8vIElmIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSBpbm5lckZuLCB3ZSBsZWF2ZSBzdGF0ZSA9PT1cbiAgICAgICAgICAvLyBHZW5TdGF0ZUV4ZWN1dGluZyBhbmQgbG9vcCBiYWNrIGZvciBhbm90aGVyIGludm9jYXRpb24uXG4gICAgICAgICAgc3RhdGUgPSBjb250ZXh0LmRvbmVcbiAgICAgICAgICAgID8gR2VuU3RhdGVDb21wbGV0ZWRcbiAgICAgICAgICAgIDogR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcblxuICAgICAgICAgIGlmIChyZWNvcmQuYXJnID09PSBDb250aW51ZVNlbnRpbmVsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHJlY29yZC5hcmcsXG4gICAgICAgICAgICBkb25lOiBjb250ZXh0LmRvbmVcbiAgICAgICAgICB9O1xuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggdGhlIGV4Y2VwdGlvbiBieSBsb29waW5nIGJhY2sgYXJvdW5kIHRvIHRoZVxuICAgICAgICAgIC8vIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpIGNhbGwgYWJvdmUuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIENhbGwgZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdKGNvbnRleHQuYXJnKSBhbmQgaGFuZGxlIHRoZVxuICAvLyByZXN1bHQsIGVpdGhlciBieSByZXR1cm5pbmcgYSB7IHZhbHVlLCBkb25lIH0gcmVzdWx0IGZyb20gdGhlXG4gIC8vIGRlbGVnYXRlIGl0ZXJhdG9yLCBvciBieSBtb2RpZnlpbmcgY29udGV4dC5tZXRob2QgYW5kIGNvbnRleHQuYXJnLFxuICAvLyBzZXR0aW5nIGNvbnRleHQuZGVsZWdhdGUgdG8gbnVsbCwgYW5kIHJldHVybmluZyB0aGUgQ29udGludWVTZW50aW5lbC5cbiAgZnVuY3Rpb24gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCkge1xuICAgIHZhciBtZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF07XG4gICAgaWYgKG1ldGhvZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBBIC50aHJvdyBvciAucmV0dXJuIHdoZW4gdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBubyAudGhyb3dcbiAgICAgIC8vIG1ldGhvZCBhbHdheXMgdGVybWluYXRlcyB0aGUgeWllbGQqIGxvb3AuXG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgLy8gTm90ZTogW1wicmV0dXJuXCJdIG11c3QgYmUgdXNlZCBmb3IgRVMzIHBhcnNpbmcgY29tcGF0aWJpbGl0eS5cbiAgICAgICAgaWYgKGRlbGVnYXRlLml0ZXJhdG9yW1wicmV0dXJuXCJdKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgLy8gSWYgbWF5YmVJbnZva2VEZWxlZ2F0ZShjb250ZXh0KSBjaGFuZ2VkIGNvbnRleHQubWV0aG9kIGZyb21cbiAgICAgICAgICAgIC8vIFwicmV0dXJuXCIgdG8gXCJ0aHJvd1wiLCBsZXQgdGhhdCBvdmVycmlkZSB0aGUgVHlwZUVycm9yIGJlbG93LlxuICAgICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcIlRoZSBpdGVyYXRvciBkb2VzIG5vdCBwcm92aWRlIGEgJ3Rocm93JyBtZXRob2RcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChtZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBjb250ZXh0LmFyZyk7XG5cbiAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcblxuICAgIGlmICghIGluZm8pIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiaXRlcmF0b3IgcmVzdWx0IGlzIG5vdCBhbiBvYmplY3RcIik7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgIC8vIEFzc2lnbiB0aGUgcmVzdWx0IG9mIHRoZSBmaW5pc2hlZCBkZWxlZ2F0ZSB0byB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyB2YXJpYWJsZSBzcGVjaWZpZWQgYnkgZGVsZWdhdGUucmVzdWx0TmFtZSAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG5cbiAgICAgIC8vIFJlc3VtZSBleGVjdXRpb24gYXQgdGhlIGRlc2lyZWQgbG9jYXRpb24gKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG5cbiAgICAgIC8vIElmIGNvbnRleHQubWV0aG9kIHdhcyBcInRocm93XCIgYnV0IHRoZSBkZWxlZ2F0ZSBoYW5kbGVkIHRoZVxuICAgICAgLy8gZXhjZXB0aW9uLCBsZXQgdGhlIG91dGVyIGdlbmVyYXRvciBwcm9jZWVkIG5vcm1hbGx5LiBJZlxuICAgICAgLy8gY29udGV4dC5tZXRob2Qgd2FzIFwibmV4dFwiLCBmb3JnZXQgY29udGV4dC5hcmcgc2luY2UgaXQgaGFzIGJlZW5cbiAgICAgIC8vIFwiY29uc3VtZWRcIiBieSB0aGUgZGVsZWdhdGUgaXRlcmF0b3IuIElmIGNvbnRleHQubWV0aG9kIHdhc1xuICAgICAgLy8gXCJyZXR1cm5cIiwgYWxsb3cgdGhlIG9yaWdpbmFsIC5yZXR1cm4gY2FsbCB0byBjb250aW51ZSBpbiB0aGVcbiAgICAgIC8vIG91dGVyIGdlbmVyYXRvci5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCAhPT0gXCJyZXR1cm5cIikge1xuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZS15aWVsZCB0aGUgcmVzdWx0IHJldHVybmVkIGJ5IHRoZSBkZWxlZ2F0ZSBtZXRob2QuXG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICAvLyBUaGUgZGVsZWdhdGUgaXRlcmF0b3IgaXMgZmluaXNoZWQsIHNvIGZvcmdldCBpdCBhbmQgY29udGludWUgd2l0aFxuICAgIC8vIHRoZSBvdXRlciBnZW5lcmF0b3IuXG4gICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgZGVmaW5lKEdwLCB0b1N0cmluZ1RhZ1N5bWJvbCwgXCJHZW5lcmF0b3JcIik7XG5cbiAgLy8gQSBHZW5lcmF0b3Igc2hvdWxkIGFsd2F5cyByZXR1cm4gaXRzZWxmIGFzIHRoZSBpdGVyYXRvciBvYmplY3Qgd2hlbiB0aGVcbiAgLy8gQEBpdGVyYXRvciBmdW5jdGlvbiBpcyBjYWxsZWQgb24gaXQuIFNvbWUgYnJvd3NlcnMnIGltcGxlbWVudGF0aW9ucyBvZiB0aGVcbiAgLy8gaXRlcmF0b3IgcHJvdG90eXBlIGNoYWluIGluY29ycmVjdGx5IGltcGxlbWVudCB0aGlzLCBjYXVzaW5nIHRoZSBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0IHRvIG5vdCBiZSByZXR1cm5lZCBmcm9tIHRoaXMgY2FsbC4gVGhpcyBlbnN1cmVzIHRoYXQgZG9lc24ndCBoYXBwZW4uXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVnZW5lcmF0b3IvaXNzdWVzLzI3NCBmb3IgbW9yZSBkZXRhaWxzLlxuICBkZWZpbmUoR3AsIGl0ZXJhdG9yU3ltYm9sLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfSk7XG5cbiAgZGVmaW5lKEdwLCBcInRvU3RyaW5nXCIsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiO1xuICB9KTtcblxuICBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykge1xuICAgIHZhciBlbnRyeSA9IHsgdHJ5TG9jOiBsb2NzWzBdIH07XG5cbiAgICBpZiAoMSBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV07XG4gICAgfVxuXG4gICAgaWYgKDIgaW4gbG9jcykge1xuICAgICAgZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl07XG4gICAgICBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM107XG4gICAgfVxuXG4gICAgdGhpcy50cnlFbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkge1xuICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9O1xuICAgIHJlY29yZC50eXBlID0gXCJub3JtYWxcIjtcbiAgICBkZWxldGUgcmVjb3JkLmFyZztcbiAgICBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkO1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh0cnlMb2NzTGlzdCkge1xuICAgIC8vIFRoZSByb290IGVudHJ5IG9iamVjdCAoZWZmZWN0aXZlbHkgYSB0cnkgc3RhdGVtZW50IHdpdGhvdXQgYSBjYXRjaFxuICAgIC8vIG9yIGEgZmluYWxseSBibG9jaykgZ2l2ZXMgdXMgYSBwbGFjZSB0byBzdG9yZSB2YWx1ZXMgdGhyb3duIGZyb21cbiAgICAvLyBsb2NhdGlvbnMgd2hlcmUgdGhlcmUgaXMgbm8gZW5jbG9zaW5nIHRyeSBzdGF0ZW1lbnQuXG4gICAgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XTtcbiAgICB0cnlMb2NzTGlzdC5mb3JFYWNoKHB1c2hUcnlFbnRyeSwgdGhpcyk7XG4gICAgdGhpcy5yZXNldCh0cnVlKTtcbiAgfVxuXG4gIGV4cG9ydHMua2V5cyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIGtleXMucmV2ZXJzZSgpO1xuXG4gICAgLy8gUmF0aGVyIHRoYW4gcmV0dXJuaW5nIGFuIG9iamVjdCB3aXRoIGEgbmV4dCBtZXRob2QsIHdlIGtlZXBcbiAgICAvLyB0aGluZ3Mgc2ltcGxlIGFuZCByZXR1cm4gdGhlIG5leHQgZnVuY3Rpb24gaXRzZWxmLlxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgd2hpbGUgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzLnBvcCgpO1xuICAgICAgICBpZiAoa2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIG5leHQudmFsdWUgPSBrZXk7XG4gICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVG8gYXZvaWQgY3JlYXRpbmcgYW4gYWRkaXRpb25hbCBvYmplY3QsIHdlIGp1c3QgaGFuZyB0aGUgLnZhbHVlXG4gICAgICAvLyBhbmQgLmRvbmUgcHJvcGVydGllcyBvZmYgdGhlIG5leHQgZnVuY3Rpb24gb2JqZWN0IGl0c2VsZi4gVGhpc1xuICAgICAgLy8gYWxzbyBlbnN1cmVzIHRoYXQgdGhlIG1pbmlmaWVyIHdpbGwgbm90IGFub255bWl6ZSB0aGUgZnVuY3Rpb24uXG4gICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWx1ZXMoaXRlcmFibGUpIHtcbiAgICBpZiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBpdGVyYXRvck1ldGhvZCA9IGl0ZXJhYmxlW2l0ZXJhdG9yU3ltYm9sXTtcbiAgICAgIGlmIChpdGVyYXRvck1ldGhvZCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JNZXRob2QuY2FsbChpdGVyYWJsZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc05hTihpdGVyYWJsZS5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsIG5leHQgPSBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbChpdGVyYWJsZSwgaSkpIHtcbiAgICAgICAgICAgICAgbmV4dC52YWx1ZSA9IGl0ZXJhYmxlW2ldO1xuICAgICAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5leHQubmV4dCA9IG5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGFuIGl0ZXJhdG9yIHdpdGggbm8gdmFsdWVzLlxuICAgIHJldHVybiB7IG5leHQ6IGRvbmVSZXN1bHQgfTtcbiAgfVxuICBleHBvcnRzLnZhbHVlcyA9IHZhbHVlcztcblxuICBmdW5jdGlvbiBkb25lUmVzdWx0KCkge1xuICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgfVxuXG4gIENvbnRleHQucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBDb250ZXh0LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKHNraXBUZW1wUmVzZXQpIHtcbiAgICAgIHRoaXMucHJldiA9IDA7XG4gICAgICB0aGlzLm5leHQgPSAwO1xuICAgICAgLy8gUmVzZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICB0aGlzLnNlbnQgPSB0aGlzLl9zZW50ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICB0aGlzLmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuXG4gICAgICB0aGlzLnRyeUVudHJpZXMuZm9yRWFjaChyZXNldFRyeUVudHJ5KTtcblxuICAgICAgaWYgKCFza2lwVGVtcFJlc2V0KSB7XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcykge1xuICAgICAgICAgIC8vIE5vdCBzdXJlIGFib3V0IHRoZSBvcHRpbWFsIG9yZGVyIG9mIHRoZXNlIGNvbmRpdGlvbnM6XG4gICAgICAgICAgaWYgKG5hbWUuY2hhckF0KDApID09PSBcInRcIiAmJlxuICAgICAgICAgICAgICBoYXNPd24uY2FsbCh0aGlzLCBuYW1lKSAmJlxuICAgICAgICAgICAgICAhaXNOYU4oK25hbWUuc2xpY2UoMSkpKSB7XG4gICAgICAgICAgICB0aGlzW25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgIHZhciByb290RW50cnkgPSB0aGlzLnRyeUVudHJpZXNbMF07XG4gICAgICB2YXIgcm9vdFJlY29yZCA9IHJvb3RFbnRyeS5jb21wbGV0aW9uO1xuICAgICAgaWYgKHJvb3RSZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJvb3RSZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5ydmFsO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaEV4Y2VwdGlvbjogZnVuY3Rpb24oZXhjZXB0aW9uKSB7XG4gICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzO1xuICAgICAgZnVuY3Rpb24gaGFuZGxlKGxvYywgY2F1Z2h0KSB7XG4gICAgICAgIHJlY29yZC50eXBlID0gXCJ0aHJvd1wiO1xuICAgICAgICByZWNvcmQuYXJnID0gZXhjZXB0aW9uO1xuICAgICAgICBjb250ZXh0Lm5leHQgPSBsb2M7XG5cbiAgICAgICAgaWYgKGNhdWdodCkge1xuICAgICAgICAgIC8vIElmIHRoZSBkaXNwYXRjaGVkIGV4Y2VwdGlvbiB3YXMgY2F1Z2h0IGJ5IGEgY2F0Y2ggYmxvY2ssXG4gICAgICAgICAgLy8gdGhlbiBsZXQgdGhhdCBjYXRjaCBibG9jayBoYW5kbGUgdGhlIGV4Y2VwdGlvbiBub3JtYWxseS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICEhIGNhdWdodDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IFwicm9vdFwiKSB7XG4gICAgICAgICAgLy8gRXhjZXB0aW9uIHRocm93biBvdXRzaWRlIG9mIGFueSB0cnkgYmxvY2sgdGhhdCBjb3VsZCBoYW5kbGVcbiAgICAgICAgICAvLyBpdCwgc28gc2V0IHRoZSBjb21wbGV0aW9uIHZhbHVlIG9mIHRoZSBlbnRpcmUgZnVuY3Rpb24gdG9cbiAgICAgICAgICAvLyB0aHJvdyB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJldHVybiBoYW5kbGUoXCJlbmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldikge1xuICAgICAgICAgIHZhciBoYXNDYXRjaCA9IGhhc093bi5jYWxsKGVudHJ5LCBcImNhdGNoTG9jXCIpO1xuICAgICAgICAgIHZhciBoYXNGaW5hbGx5ID0gaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKTtcblxuICAgICAgICAgIGlmIChoYXNDYXRjaCAmJiBoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzQ2F0Y2gpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0cnkgc3RhdGVtZW50IHdpdGhvdXQgY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWJydXB0OiBmdW5jdGlvbih0eXBlLCBhcmcpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKSAmJlxuICAgICAgICAgICAgdGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgIHZhciBmaW5hbGx5RW50cnkgPSBlbnRyeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmluYWxseUVudHJ5ICYmXG4gICAgICAgICAgKHR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgICB0eXBlID09PSBcImNvbnRpbnVlXCIpICYmXG4gICAgICAgICAgZmluYWxseUVudHJ5LnRyeUxvYyA8PSBhcmcgJiZcbiAgICAgICAgICBhcmcgPD0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBmaW5hbGx5IGVudHJ5IGlmIGNvbnRyb2wgaXMgbm90IGp1bXBpbmcgdG8gYVxuICAgICAgICAvLyBsb2NhdGlvbiBvdXRzaWRlIHRoZSB0cnkvY2F0Y2ggYmxvY2suXG4gICAgICAgIGZpbmFsbHlFbnRyeSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZWNvcmQgPSBmaW5hbGx5RW50cnkgPyBmaW5hbGx5RW50cnkuY29tcGxldGlvbiA6IHt9O1xuICAgICAgcmVjb3JkLnR5cGUgPSB0eXBlO1xuICAgICAgcmVjb3JkLmFyZyA9IGFyZztcblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSkge1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICB0aGlzLm5leHQgPSBmaW5hbGx5RW50cnkuZmluYWxseUxvYztcbiAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmNvbXBsZXRlKHJlY29yZCk7XG4gICAgfSxcblxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbihyZWNvcmQsIGFmdGVyTG9jKSB7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgIHJlY29yZC50eXBlID09PSBcImNvbnRpbnVlXCIpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gcmVjb3JkLmFyZztcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgdGhpcy5ydmFsID0gdGhpcy5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgIHRoaXMubmV4dCA9IFwiZW5kXCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiICYmIGFmdGVyTG9jKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGFmdGVyTG9jO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9LFxuXG4gICAgZmluaXNoOiBmdW5jdGlvbihmaW5hbGx5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LmZpbmFsbHlMb2MgPT09IGZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB0aGlzLmNvbXBsZXRlKGVudHJ5LmNvbXBsZXRpb24sIGVudHJ5LmFmdGVyTG9jKTtcbiAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcImNhdGNoXCI6IGZ1bmN0aW9uKHRyeUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IHRyeUxvYykge1xuICAgICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICB2YXIgdGhyb3duID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhyb3duO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSBjb250ZXh0LmNhdGNoIG1ldGhvZCBtdXN0IG9ubHkgYmUgY2FsbGVkIHdpdGggYSBsb2NhdGlvblxuICAgICAgLy8gYXJndW1lbnQgdGhhdCBjb3JyZXNwb25kcyB0byBhIGtub3duIGNhdGNoIGJsb2NrLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCBjYXRjaCBhdHRlbXB0XCIpO1xuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZVlpZWxkOiBmdW5jdGlvbihpdGVyYWJsZSwgcmVzdWx0TmFtZSwgbmV4dExvYykge1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHtcbiAgICAgICAgaXRlcmF0b3I6IHZhbHVlcyhpdGVyYWJsZSksXG4gICAgICAgIHJlc3VsdE5hbWU6IHJlc3VsdE5hbWUsXG4gICAgICAgIG5leHRMb2M6IG5leHRMb2NcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgLy8gRGVsaWJlcmF0ZWx5IGZvcmdldCB0aGUgbGFzdCBzZW50IHZhbHVlIHNvIHRoYXQgd2UgZG9uJ3RcbiAgICAgICAgLy8gYWNjaWRlbnRhbGx5IHBhc3MgaXQgb24gdG8gdGhlIGRlbGVnYXRlLlxuICAgICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGlzIHNjcmlwdCBpcyBleGVjdXRpbmcgYXMgYSBDb21tb25KUyBtb2R1bGVcbiAgLy8gb3Igbm90LCByZXR1cm4gdGhlIHJ1bnRpbWUgb2JqZWN0IHNvIHRoYXQgd2UgY2FuIGRlY2xhcmUgdGhlIHZhcmlhYmxlXG4gIC8vIHJlZ2VuZXJhdG9yUnVudGltZSBpbiB0aGUgb3V0ZXIgc2NvcGUsIHdoaWNoIGFsbG93cyB0aGlzIG1vZHVsZSB0byBiZVxuICAvLyBpbmplY3RlZCBlYXNpbHkgYnkgYGJpbi9yZWdlbmVyYXRvciAtLWluY2x1ZGUtcnVudGltZSBzY3JpcHQuanNgLlxuICByZXR1cm4gZXhwb3J0cztcblxufShcbiAgLy8gSWYgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlLCB1c2UgbW9kdWxlLmV4cG9ydHNcbiAgLy8gYXMgdGhlIHJlZ2VuZXJhdG9yUnVudGltZSBuYW1lc3BhY2UuIE90aGVyd2lzZSBjcmVhdGUgYSBuZXcgZW1wdHlcbiAgLy8gb2JqZWN0LiBFaXRoZXIgd2F5LCB0aGUgcmVzdWx0aW5nIG9iamVjdCB3aWxsIGJlIHVzZWQgdG8gaW5pdGlhbGl6ZVxuICAvLyB0aGUgcmVnZW5lcmF0b3JSdW50aW1lIHZhcmlhYmxlIGF0IHRoZSB0b3Agb2YgdGhpcyBmaWxlLlxuICB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiID8gbW9kdWxlLmV4cG9ydHMgOiB7fVxuKSk7XG5cbnRyeSB7XG4gIHJlZ2VuZXJhdG9yUnVudGltZSA9IHJ1bnRpbWU7XG59IGNhdGNoIChhY2NpZGVudGFsU3RyaWN0TW9kZSkge1xuICAvLyBUaGlzIG1vZHVsZSBzaG91bGQgbm90IGJlIHJ1bm5pbmcgaW4gc3RyaWN0IG1vZGUsIHNvIHRoZSBhYm92ZVxuICAvLyBhc3NpZ25tZW50IHNob3VsZCBhbHdheXMgd29yayB1bmxlc3Mgc29tZXRoaW5nIGlzIG1pc2NvbmZpZ3VyZWQuIEp1c3RcbiAgLy8gaW4gY2FzZSBydW50aW1lLmpzIGFjY2lkZW50YWxseSBydW5zIGluIHN0cmljdCBtb2RlLCBpbiBtb2Rlcm4gZW5naW5lc1xuICAvLyB3ZSBjYW4gZXhwbGljaXRseSBhY2Nlc3MgZ2xvYmFsVGhpcy4gSW4gb2xkZXIgZW5naW5lcyB3ZSBjYW4gZXNjYXBlXG4gIC8vIHN0cmljdCBtb2RlIHVzaW5nIGEgZ2xvYmFsIEZ1bmN0aW9uIGNhbGwuIFRoaXMgY291bGQgY29uY2VpdmFibHkgZmFpbFxuICAvLyBpZiBhIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5IGZvcmJpZHMgdXNpbmcgRnVuY3Rpb24sIGJ1dCBpbiB0aGF0IGNhc2VcbiAgLy8gdGhlIHByb3BlciBzb2x1dGlvbiBpcyB0byBmaXggdGhlIGFjY2lkZW50YWwgc3RyaWN0IG1vZGUgcHJvYmxlbS4gSWZcbiAgLy8geW91J3ZlIG1pc2NvbmZpZ3VyZWQgeW91ciBidW5kbGVyIHRvIGZvcmNlIHN0cmljdCBtb2RlIGFuZCBhcHBsaWVkIGFcbiAgLy8gQ1NQIHRvIGZvcmJpZCBGdW5jdGlvbiwgYW5kIHlvdSdyZSBub3Qgd2lsbGluZyB0byBmaXggZWl0aGVyIG9mIHRob3NlXG4gIC8vIHByb2JsZW1zLCBwbGVhc2UgZGV0YWlsIHlvdXIgdW5pcXVlIHByZWRpY2FtZW50IGluIGEgR2l0SHViIGlzc3VlLlxuICBpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09IFwib2JqZWN0XCIpIHtcbiAgICBnbG9iYWxUaGlzLnJlZ2VuZXJhdG9yUnVudGltZSA9IHJ1bnRpbWU7XG4gIH0gZWxzZSB7XG4gICAgRnVuY3Rpb24oXCJyXCIsIFwicmVnZW5lcmF0b3JSdW50aW1lID0gclwiKShydW50aW1lKTtcbiAgfVxufVxuIl19
