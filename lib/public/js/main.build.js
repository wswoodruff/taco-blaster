(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require('regenerator-runtime');

var _require = require('./particles-on-click'),
    genParticles = _require.genParticles; // Sound offfff!!!!!!


console.log('TACOOOOOOOOOOOOOOOOOOOOS!!!');
var DEBUG = false;
var TACOS_ROOM_ID = 'tacos-n-friends';
var MY_TACO_ID = 'my-taco';
var USE_NES = true;
var CURSOR_UPDATE_THROTTLE = 10; // 10 milliseconds — closer to 16 which would be 60 fps

var Throttle = require('lodash.throttle');

var Nes;

if (USE_NES) {
  Nes = require('@hapi/nes/lib/client');
} // const RECONNECT_TIMEOUT = 1000; // in milliseconds


var RoomClient; // This will get set by the server on connection

var roomUserId = null;
var roomX = 0;
var roomY = 0;
var isMouseDown = false;

var abbreviateUserId = function abbreviateUserId(userId) {
  return "...".concat(userId.split('-').pop());
};

var addIdToElIfNotExists = function addIdToElIfNotExists(el, id) {
  var idEl = el.querySelector('.taco-id');

  if (!idEl) {
    var tacoId = document.createElement('div');
    tacoId.className = 'taco-id';
    tacoId.textContent = abbreviateUserId(id);
    tacoId.style.color = 'white';
    tacoId.style.fontSize = '16px';
    tacoId.style.position = 'absolute';
    tacoId.style.transform = 'translateX(-25%)';
    tacoId.style.bottom = '-20px';
    tacoId.style.whiteSpace = 'nowrap';
    el.appendChild(tacoId);
  }
}; // Upsert user in room


var updateRoom = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref) {
    var roomId, userId, x, y, isMouseDown, payload, _yield$RoomClient$req, _yield$RoomClient$req2, error, user, myTacoEl, connectionMsg;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            roomId = _ref.roomId, userId = _ref.userId, x = _ref.x, y = _ref.y, isMouseDown = _ref.isMouseDown;
            payload = {
              x: x,
              y: y,
              isMouseDown: isMouseDown
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
              connectionMsg.textContent = "Error ".concat(error.message || error);
            } else {
              connectionMsg.style.color = '#73c991';
              connectionMsg.textContent = "Connected x: ".concat(x || 'null', " y: ").concat(y || 'null');
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

var throttledBroadcast = Throttle(function () {
  updateRoom({
    roomId: TACOS_ROOM_ID,
    userId: roomUserId,
    x: roomX,
    y: roomY,
    isMouseDown: isMouseDown
  });
}, CURSOR_UPDATE_THROTTLE);
window.addEventListener('mousedown', function (evt) {
  isMouseDown = true;
  throttledBroadcast();
});
window.addEventListener('mouseup', function (evt) {
  isMouseDown = false;
  throttledBroadcast();
});
var myTaco = document.getElementById(MY_TACO_ID); // Hot path

var moveCursor = function moveCursor(_ref3) {
  var element = _ref3.element,
      x = _ref3.x,
      y = _ref3.y;
  // Hopefully the 'px' at the end here will negate attempts to run a script
  element.style.left = "".concat(x, "px");
  element.style.top = "".concat(y, "px");
}; // We need this wrapper to make async/await nice to write


var initSocket = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var _window, _window$location, protocol, host, url, wsLocation, connectionMsg, user, roomEl, clickTracker, roomUsers, onRoomUpdate;

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
            clickTracker = {};
            roomUsers = {}; // Hot path, throttled server-side

            onRoomUpdate = function onRoomUpdate(props) {
              var roomId = props.id,
                  _props$users = props.users,
                  users = _props$users === void 0 ? [] : _props$users,
                  isSync = props.isSync,
                  scoreboard = props.scoreboard;

              if (DEBUG) {
                console.log('onRoomUpdate', props);
              }

              if (isSync) {
                var scoreEl = document.getElementById('scoreboard');
                scoreEl.innerHTML = "<h3>Scoreboard</h3>".concat(scoreboard.map(function (_ref5) {
                  var userId = _ref5.userId,
                      score = _ref5.score;
                  return "<p>".concat(abbreviateUserId(userId), ": ").concat(score, "</p>");
                }).join(''));
                roomUsers = users;
              }

              var usersNotMe = Object.keys(users).filter(function (id) {
                return id !== roomUserId;
              }).map(function (id) {
                return users[id];
              });
              Object.values(usersNotMe).forEach(function (_ref6) {
                var userId = _ref6.id,
                    _ref6$lastClick = _ref6.lastClick;
                _ref6$lastClick = _ref6$lastClick === void 0 ? {} : _ref6$lastClick;
                var epoch = _ref6$lastClick.epoch,
                    x = _ref6$lastClick.x,
                    y = _ref6$lastClick.y;
                var userClicked = epoch;
                var lastUserClick = clickTracker[userId];
                var shouldGenParticles = false;

                if (userClicked && !lastUserClick || lastUserClick && userClicked > lastUserClick) {
                  shouldGenParticles = true;
                }

                clickTracker[userId] = epoch;

                if (shouldGenParticles) {
                  genParticles(x, y);
                }

                clickTracker[userId] = epoch;
              });
              var usersYesMe = users[Object.keys(users).find(function (id) {
                return id === roomUserId;
              })];
              var usersMarkedForDeletion = Object.values(usersNotMe).filter(function (_ref7) {
                var shouldDelete = _ref7.shouldDelete;
                return !!shouldDelete;
              }).map(function (_ref8) {
                var id = _ref8.id;
                return id;
              });
              var singleUsersNotMe = usersNotMe.length === 1 ? usersNotMe[0] : null;

              if (DEBUG) {
                if (usersYesMe) {
                  console.log('usersYesMe', usersYesMe);
                }

                if (singleUsersNotMe || usersNotMe.length) {
                  console.log('usersNotMe', singleUsersNotMe || usersNotMe);
                }
              }

              if (usersYesMe) {
                moveCursor({
                  element: myTaco,
                  x: usersYesMe.x,
                  y: usersYesMe.y
                });
              }

              var getIds = function getIds(arr) {
                return arr.map(function (_ref9) {
                  var id = _ref9.id;
                  return id;
                });
              }; // Manage the ghost tacos


              var ghostTacos = Array.from(document.getElementsByClassName('ghost-taco'));
              var existingGhostIds = [];
              ghostTacos.forEach(function (tacoEl) {
                var tacoExistsInUsers = Object.keys(roomUsers).includes(tacoEl.id); // Remove inactive tacos

                if (usersMarkedForDeletion.includes(tacoEl.id) || isSync && !tacoExistsInUsers) {
                  // Remove this taco
                  roomEl.removeChild(tacoEl);
                  return;
                }

                existingGhostIds.push(tacoEl.id);
                var tacoUpdate = usersNotMe.find(function (_ref10) {
                  var id = _ref10.id;
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
              var roomUserIds = Object.keys(roomUsers);
              var newGhostIds = getIds(usersNotMe).filter(function (id) {
                return !roomUserIds.includes(id);
              });
              usersNotMe.forEach(function (user) {
                roomUsers[user.id] = user;
              });
              console.log('newGhostIds', newGhostIds);
              newGhostIds.forEach(function (id) {
                // Add a new ghost taco
                var newTacoEl = document.createElement('div');
                newTacoEl.id = id;
                newTacoEl.classList.add('ghost-taco');
                newTacoEl.classList.add('taco-cursor');
                addIdToElIfNotExists(newTacoEl, id);
                roomEl.appendChild(newTacoEl);
                var userInfo = usersNotMe.find(function (_ref11) {
                  var id = _ref11.id;
                  return id === id;
                });
                moveCursor({
                  element: newTacoEl,
                  x: userInfo.x,
                  y: userInfo.y
                });
                genParticles(userInfo.x, userInfo.y);
              });
            }; // Coooonnnnnneeeeeeecccccctttttttt!!!!!!!


            _context2.next = 29;
            return RoomClient.subscribe("/rooms/".concat(TACOS_ROOM_ID), onRoomUpdate);

          case 29:
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
  initSocket(); // Broadcast movements to the room and only
  // update my view with what we get from the server

  var onMouseMove = function onMouseMove(evt) {
    roomX = evt.pageX;
    roomY = evt.pageY;
    throttledBroadcast();
  }; // Desktop and mobile clicks


  window.addEventListener('mousemove', onMouseMove); // Mobile support

  window.addEventListener('touchmove', function (evt) {
    onMouseMove({
      pageX: Math.round(evt.changedTouches[0].clientX),
      pageY: Math.round(evt.changedTouches[0].clientY)
    });
  }); // My taco's particles

  document.body.addEventListener('click', function (evt) {
    genParticles(evt.clientX, evt.clientY);
  });
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
// Little Canvas things

var canvas = document.querySelector("#canvas");
var ctx = canvas.getContext('2d'); // Set Canvas to be window size

canvas.width = window.innerWidth;
canvas.height = window.innerHeight; // Configuration, Play with these

var config = {
  particleNumber: 40,
  maxParticleSize: 20,
  maxSpeed: 40,
  colorVariation: 50
}; // Colors

var colorPalette = {
  bg: {
    r: 0,
    g: 0,
    b: 0,
    a: 0
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
  var size = r * 2; // ctx.globalCompositeOperation = 'copy'; // copy pixel-to-pixel source image

  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(tacoImg, x, y, size, size); // ctx.globalCompositeOperation = 'source-over';
  // ctx.globalCompositeOperation = 'multiply'; // multiply it by color
  // ctx.fillStyle = c;
  // ctx.fillStyle = '#ff0000';
  // ctx.fillRect(x, y, size, size);
  // ctx.globalCompositeOperation = 'destination-atop'; // restore transparency
  // ctx.drawImage(tacoImg, x, y, size, size);
  // ctx.globalCompositeOperation = 'source-over';
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
}; // First Frame


frame(); // First particle explosion

initParticles(config.particleNumber);

exports.genParticles = function (x, y) {
  cleanUpArray();
  initParticles(config.particleNumber, x, y);
};

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL21haW4uanMiLCJsaWIvcHVibGljL2pzL3BhcnRpY2xlcy1vbi1jbGljay5qcyIsIm5vZGVfbW9kdWxlcy9AaGFwaS9uZXMvbGliL2NsaWVudC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7OztBQUVBLE9BQU8sQ0FBQyxxQkFBRCxDQUFQOztBQUVBLGVBQXlCLE9BQU8sQ0FBQyxzQkFBRCxDQUFoQztBQUFBLElBQVEsWUFBUixZQUFRLFlBQVIsQyxDQUVBOzs7QUFDQSxPQUFPLENBQUMsR0FBUixDQUFZLDZCQUFaO0FBRUEsSUFBTSxLQUFLLEdBQUcsS0FBZDtBQUNBLElBQU0sYUFBYSxHQUFHLGlCQUF0QjtBQUNBLElBQU0sVUFBVSxHQUFHLFNBQW5CO0FBQ0EsSUFBTSxPQUFPLEdBQUcsSUFBaEI7QUFDQSxJQUFNLHNCQUFzQixHQUFHLEVBQS9CLEMsQ0FBbUM7O0FBRW5DLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxpQkFBRCxDQUF4Qjs7QUFFQSxJQUFJLEdBQUo7O0FBRUEsSUFBSSxPQUFKLEVBQWE7QUFDVCxFQUFBLEdBQUcsR0FBRyxPQUFPLENBQUMsc0JBQUQsQ0FBYjtBQUNILEMsQ0FFRDs7O0FBRUEsSUFBSSxVQUFKLEMsQ0FDQTs7QUFDQSxJQUFJLFVBQVUsR0FBRyxJQUFqQjtBQUNBLElBQUksS0FBSyxHQUFHLENBQVo7QUFDQSxJQUFJLEtBQUssR0FBRyxDQUFaO0FBQ0EsSUFBSSxXQUFXLEdBQUcsS0FBbEI7O0FBRUEsSUFBTSxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBbUIsQ0FBQyxNQUFEO0FBQUEsc0JBQWtCLE1BQU0sQ0FBQyxLQUFQLENBQWEsR0FBYixFQUFrQixHQUFsQixFQUFsQjtBQUFBLENBQXpCOztBQUVBLElBQU0sb0JBQW9CLEdBQUcsU0FBdkIsb0JBQXVCLENBQUMsRUFBRCxFQUFLLEVBQUwsRUFBWTtBQUVyQyxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsYUFBSCxDQUFpQixVQUFqQixDQUFiOztBQUVBLE1BQUksQ0FBQyxJQUFMLEVBQVc7QUFDUCxRQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFmO0FBQ0EsSUFBQSxNQUFNLENBQUMsU0FBUCxHQUFtQixTQUFuQjtBQUNBLElBQUEsTUFBTSxDQUFDLFdBQVAsR0FBcUIsZ0JBQWdCLENBQUMsRUFBRCxDQUFyQztBQUNBLElBQUEsTUFBTSxDQUFDLEtBQVAsQ0FBYSxLQUFiLEdBQXFCLE9BQXJCO0FBQ0EsSUFBQSxNQUFNLENBQUMsS0FBUCxDQUFhLFFBQWIsR0FBd0IsTUFBeEI7QUFDQSxJQUFBLE1BQU0sQ0FBQyxLQUFQLENBQWEsUUFBYixHQUF3QixVQUF4QjtBQUNBLElBQUEsTUFBTSxDQUFDLEtBQVAsQ0FBYSxTQUFiLEdBQXlCLGtCQUF6QjtBQUNBLElBQUEsTUFBTSxDQUFDLEtBQVAsQ0FBYSxNQUFiLEdBQXNCLE9BQXRCO0FBQ0EsSUFBQSxNQUFNLENBQUMsS0FBUCxDQUFhLFVBQWIsR0FBMEIsUUFBMUI7QUFDQSxJQUFBLEVBQUUsQ0FBQyxXQUFILENBQWUsTUFBZjtBQUNIO0FBQ0osQ0FoQkQsQyxDQWtCQTs7O0FBQ0EsSUFBTSxVQUFVO0FBQUEsc0VBQUc7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFTLFlBQUEsTUFBVCxRQUFTLE1BQVQsRUFBaUIsTUFBakIsUUFBaUIsTUFBakIsRUFBeUIsQ0FBekIsUUFBeUIsQ0FBekIsRUFBNEIsQ0FBNUIsUUFBNEIsQ0FBNUIsRUFBK0IsV0FBL0IsUUFBK0IsV0FBL0I7QUFFVCxZQUFBLE9BRlMsR0FFQztBQUFFLGNBQUEsQ0FBQyxFQUFELENBQUY7QUFBSyxjQUFBLENBQUMsRUFBRCxDQUFMO0FBQVEsY0FBQSxXQUFXLEVBQVg7QUFBUixhQUZEOztBQUlmLGdCQUFJLE1BQUosRUFBWTtBQUNSLGNBQUEsT0FBTyxDQUFDLEVBQVIsR0FBYSxNQUFiO0FBQ0g7O0FBTmM7QUFBQSxtQkFRNEIsVUFBVSxDQUFDLE9BQVgsQ0FBbUI7QUFDMUQsY0FBQSxNQUFNLEVBQUUsTUFEa0Q7QUFFMUQsY0FBQSxJQUFJLG1CQUFZLE1BQVosWUFGc0Q7QUFHMUQsY0FBQSxPQUFPLEVBQVA7QUFIMEQsYUFBbkIsQ0FSNUI7O0FBQUE7QUFBQTtBQUFBLDJEQVFQLE9BUk87QUFRSSxZQUFBLEtBUkosMEJBUUksS0FSSjtBQVFXLFlBQUEsSUFSWCwwQkFRVyxJQVJYOztBQWNmLGdCQUFJLElBQUosRUFBVTtBQUNOLGNBQUEsVUFBVSxHQUFHLElBQUksQ0FBQyxFQUFsQjtBQUNNLGNBQUEsUUFGQSxHQUVXLFFBQVEsQ0FBQyxjQUFULENBQXdCLFVBQXhCLENBRlg7QUFHTixjQUFBLG9CQUFvQixDQUFDLFFBQUQsRUFBVyxVQUFYLENBQXBCO0FBQ0gsYUFsQmMsQ0FvQmY7OztBQUNNLFlBQUEsYUFyQlMsR0FxQk8sUUFBUSxDQUFDLGNBQVQsQ0FBd0IsZUFBeEIsS0FBNEMsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsSUFBdkIsQ0FyQm5EO0FBdUJmLFlBQUEsYUFBYSxDQUFDLEVBQWQsR0FBbUIsZUFBbkI7O0FBRUEsZ0JBQUksS0FBSixFQUFXO0FBQ1A7QUFDQSxjQUFBLGFBQWEsQ0FBQyxLQUFkLENBQW9CLEtBQXBCLEdBQTRCLFNBQTVCO0FBQ0EsY0FBQSxhQUFhLENBQUMsV0FBZCxtQkFBcUMsS0FBSyxDQUFDLE9BQU4sSUFBaUIsS0FBdEQ7QUFDSCxhQUpELE1BS0s7QUFDRCxjQUFBLGFBQWEsQ0FBQyxLQUFkLENBQW9CLEtBQXBCLEdBQTRCLFNBQTVCO0FBQ0EsY0FBQSxhQUFhLENBQUMsV0FBZCwwQkFBNEMsQ0FBQyxJQUFJLE1BQWpELGlCQUE4RCxDQUFDLElBQUksTUFBbkU7QUFDSCxhQWpDYyxDQW1DZjs7O0FBQ0EsWUFBQSxRQUFRLENBQUMsSUFBVCxDQUFjLFdBQWQsQ0FBMEIsYUFBMUI7QUFwQ2UsNkNBc0NSLElBdENROztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQUg7O0FBQUEsa0JBQVYsVUFBVTtBQUFBO0FBQUE7QUFBQSxHQUFoQjs7QUF5Q0EsSUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsWUFBTTtBQUV0QyxFQUFBLFVBQVUsQ0FBQztBQUNQLElBQUEsTUFBTSxFQUFFLGFBREQ7QUFFUCxJQUFBLE1BQU0sRUFBRSxVQUZEO0FBR1AsSUFBQSxDQUFDLEVBQUUsS0FISTtBQUlQLElBQUEsQ0FBQyxFQUFFLEtBSkk7QUFLUCxJQUFBLFdBQVcsRUFBWDtBQUxPLEdBQUQsQ0FBVjtBQU9ILENBVGtDLEVBU2hDLHNCQVRnQyxDQUFuQztBQVdBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixXQUF4QixFQUFxQyxVQUFDLEdBQUQsRUFBUztBQUUxQyxFQUFBLFdBQVcsR0FBRyxJQUFkO0FBQ0EsRUFBQSxrQkFBa0I7QUFDckIsQ0FKRDtBQU1BLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixTQUF4QixFQUFtQyxVQUFDLEdBQUQsRUFBUztBQUV4QyxFQUFBLFdBQVcsR0FBRyxLQUFkO0FBQ0EsRUFBQSxrQkFBa0I7QUFDckIsQ0FKRDtBQU1BLElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFULENBQXdCLFVBQXhCLENBQWYsQyxDQUVBOztBQUNBLElBQU0sVUFBVSxHQUFHLFNBQWIsVUFBYSxRQUF1QjtBQUFBLE1BQXBCLE9BQW9CLFNBQXBCLE9BQW9CO0FBQUEsTUFBWCxDQUFXLFNBQVgsQ0FBVztBQUFBLE1BQVIsQ0FBUSxTQUFSLENBQVE7QUFFdEM7QUFDQSxFQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsSUFBZCxhQUF3QixDQUF4QjtBQUNBLEVBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxHQUFkLGFBQXVCLENBQXZCO0FBQ0gsQ0FMRCxDLENBT0E7OztBQUNBLElBQU0sVUFBVTtBQUFBLHNFQUFHO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFFWCxVQUZXO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsbUJBR0wsVUFBVSxDQUFDLFVBQVgsRUFISzs7QUFBQTtBQUFBLHNCQU0wQixNQU4xQiw2QkFNUCxRQU5PLEVBTUssUUFOTCxvQkFNSyxRQU5MLEVBTWUsSUFOZixvQkFNZSxJQU5mLEVBUWY7O0FBQ00sWUFBQSxHQVRTLEdBU0gsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsTUFBakIsRUFBeUIsSUFBekIsSUFBaUMsSUFBakMsR0FBd0MsSUFUckM7QUFXVCxZQUFBLFVBWFMsR0FXSSxHQUFHLENBQUMsT0FBSixDQUFZLGdCQUFaLEVBQThCLGdCQUE5QixDQVhKO0FBYWYsWUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFlBQVosRUFBMEIsVUFBMUI7QUFFQSxZQUFBLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFSLENBQWUsVUFBZixDQUFiO0FBZmU7QUFBQTtBQUFBLG1CQWtCTCxVQUFVLENBQUMsT0FBWCxFQWxCSzs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBcUJYO0FBQ00sWUFBQSxhQXRCSyxHQXNCVyxRQUFRLENBQUMsY0FBVCxDQUF3QixlQUF4QixLQUE0QyxRQUFRLENBQUMsYUFBVCxDQUF1QixJQUF2QixDQXRCdkQ7QUF3QlgsWUFBQSxhQUFhLENBQUMsRUFBZCxHQUFtQixlQUFuQjtBQUVBLFlBQUEsYUFBYSxDQUFDLEtBQWQsQ0FBb0IsS0FBcEIsR0FBNEIsU0FBNUI7QUFDQSxZQUFBLGFBQWEsQ0FBQyxXQUFkLG1CQUFxQyxhQUFXLE9BQWhEOztBQTNCVztBQUFBO0FBQUEsbUJBOEJJLFVBQVUsQ0FBQztBQUMxQixjQUFBLE1BQU0sRUFBRSxhQURrQjtBQUUxQixjQUFBLE1BQU0sRUFBRTtBQUZrQixhQUFELENBOUJkOztBQUFBO0FBOEJULFlBQUEsSUE5QlM7QUFtQ2YsWUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFdBQVosRUFBeUIsSUFBekI7QUFFTSxZQUFBLE1BckNTLEdBcUNBLFFBQVEsQ0FBQyxhQUFULENBQXVCLE9BQXZCLENBckNBO0FBdUNULFlBQUEsWUF2Q1MsR0F1Q00sRUF2Q047QUF5Q1gsWUFBQSxTQXpDVyxHQXlDQyxFQXpDRCxFQTJDZjs7QUFDTSxZQUFBLFlBNUNTLEdBNENNLFNBQWYsWUFBZSxDQUFDLEtBQUQsRUFBVztBQUU1QixrQkFDUSxNQURSLEdBS0ksS0FMSixDQUNJLEVBREo7QUFBQSxpQ0FLSSxLQUxKLENBRUksS0FGSjtBQUFBLGtCQUVJLEtBRkosNkJBRVksRUFGWjtBQUFBLGtCQUdJLE1BSEosR0FLSSxLQUxKLENBR0ksTUFISjtBQUFBLGtCQUlJLFVBSkosR0FLSSxLQUxKLENBSUksVUFKSjs7QUFPQSxrQkFBSSxLQUFKLEVBQVc7QUFDUCxnQkFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVosRUFBNEIsS0FBNUI7QUFDSDs7QUFFRCxrQkFBSSxNQUFKLEVBQVk7QUFDUixvQkFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsWUFBeEIsQ0FBaEI7QUFDQSxnQkFBQSxPQUFPLENBQUMsU0FBUixnQ0FBMEMsVUFBVSxDQUFDLEdBQVgsQ0FBZTtBQUFBLHNCQUFHLE1BQUgsU0FBRyxNQUFIO0FBQUEsc0JBQVcsS0FBWCxTQUFXLEtBQVg7QUFBQSxzQ0FBNkIsZ0JBQWdCLENBQUMsTUFBRCxDQUE3QyxlQUEwRCxLQUExRDtBQUFBLGlCQUFmLEVBQXNGLElBQXRGLENBQTJGLEVBQTNGLENBQTFDO0FBQ0EsZ0JBQUEsU0FBUyxHQUFHLEtBQVo7QUFDSDs7QUFFRCxrQkFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaLEVBQ2QsTUFEYyxDQUNQLFVBQUMsRUFBRDtBQUFBLHVCQUFRLEVBQUUsS0FBSyxVQUFmO0FBQUEsZUFETyxFQUVkLEdBRmMsQ0FFVixVQUFDLEVBQUQ7QUFBQSx1QkFBUSxLQUFLLENBQUMsRUFBRCxDQUFiO0FBQUEsZUFGVSxDQUFuQjtBQUlBLGNBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxVQUFkLEVBQTBCLE9BQTFCLENBQWtDLGlCQUFxRDtBQUFBLG9CQUE5QyxNQUE4QyxTQUFsRCxFQUFrRDtBQUFBLDRDQUF0QyxTQUFzQztBQUFBLCtEQUFULEVBQVM7QUFBQSxvQkFBekIsS0FBeUIsbUJBQXpCLEtBQXlCO0FBQUEsb0JBQWxCLENBQWtCLG1CQUFsQixDQUFrQjtBQUFBLG9CQUFmLENBQWUsbUJBQWYsQ0FBZTtBQUVuRixvQkFBTSxXQUFXLEdBQUcsS0FBcEI7QUFDQSxvQkFBTSxhQUFhLEdBQUcsWUFBWSxDQUFDLE1BQUQsQ0FBbEM7QUFDQSxvQkFBSSxrQkFBa0IsR0FBRyxLQUF6Qjs7QUFFQSxvQkFBSSxXQUFXLElBQUksQ0FBQyxhQUFoQixJQUFrQyxhQUFhLElBQUksV0FBVyxHQUFHLGFBQXJFLEVBQXFGO0FBQ2pGLGtCQUFBLGtCQUFrQixHQUFHLElBQXJCO0FBQ0g7O0FBRUQsZ0JBQUEsWUFBWSxDQUFDLE1BQUQsQ0FBWixHQUF1QixLQUF2Qjs7QUFFQSxvQkFBSSxrQkFBSixFQUF3QjtBQUNwQixrQkFBQSxZQUFZLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBWjtBQUNIOztBQUVELGdCQUFBLFlBQVksQ0FBQyxNQUFELENBQVosR0FBdUIsS0FBdkI7QUFDSCxlQWpCRDtBQW1CQSxrQkFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBWixFQUFtQixJQUFuQixDQUF3QixVQUFDLEVBQUQ7QUFBQSx1QkFBUSxFQUFFLEtBQUssVUFBZjtBQUFBLGVBQXhCLENBQUQsQ0FBeEI7QUFFQSxrQkFBTSxzQkFBc0IsR0FBRyxNQUFNLENBQUMsTUFBUCxDQUFjLFVBQWQsRUFDMUIsTUFEMEIsQ0FDbkI7QUFBQSxvQkFBRyxZQUFILFNBQUcsWUFBSDtBQUFBLHVCQUFzQixDQUFDLENBQUMsWUFBeEI7QUFBQSxlQURtQixFQUUxQixHQUYwQixDQUV0QjtBQUFBLG9CQUFHLEVBQUgsU0FBRyxFQUFIO0FBQUEsdUJBQVksRUFBWjtBQUFBLGVBRnNCLENBQS9CO0FBSUEsa0JBQU0sZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLE1BQVgsS0FBc0IsQ0FBdEIsR0FBMEIsVUFBVSxDQUFDLENBQUQsQ0FBcEMsR0FBMEMsSUFBbkU7O0FBRUEsa0JBQUksS0FBSixFQUFXO0FBQ1Asb0JBQUksVUFBSixFQUFnQjtBQUNaLGtCQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksWUFBWixFQUEwQixVQUExQjtBQUNIOztBQUNELG9CQUFJLGdCQUFnQixJQUFJLFVBQVUsQ0FBQyxNQUFuQyxFQUEyQztBQUN2QyxrQkFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFlBQVosRUFBMEIsZ0JBQWdCLElBQUksVUFBOUM7QUFDSDtBQUNKOztBQUVELGtCQUFJLFVBQUosRUFBZ0I7QUFDWixnQkFBQSxVQUFVLENBQUM7QUFDUCxrQkFBQSxPQUFPLEVBQUUsTUFERjtBQUVQLGtCQUFBLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FGUDtBQUdQLGtCQUFBLENBQUMsRUFBRSxVQUFVLENBQUM7QUFIUCxpQkFBRCxDQUFWO0FBS0g7O0FBRUQsa0JBQU0sTUFBTSxHQUFHLFNBQVQsTUFBUyxDQUFDLEdBQUQ7QUFBQSx1QkFBUyxHQUFHLENBQUMsR0FBSixDQUFRO0FBQUEsc0JBQUcsRUFBSCxTQUFHLEVBQUg7QUFBQSx5QkFBWSxFQUFaO0FBQUEsaUJBQVIsQ0FBVDtBQUFBLGVBQWYsQ0FuRTRCLENBcUU1Qjs7O0FBRUEsa0JBQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBUSxDQUFDLHNCQUFULENBQWdDLFlBQWhDLENBQVgsQ0FBbkI7QUFFQSxrQkFBTSxnQkFBZ0IsR0FBRyxFQUF6QjtBQUVBLGNBQUEsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsVUFBQyxNQUFELEVBQVk7QUFFM0Isb0JBQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLElBQVAsQ0FBWSxTQUFaLEVBQXVCLFFBQXZCLENBQWdDLE1BQU0sQ0FBQyxFQUF2QyxDQUExQixDQUYyQixDQUkzQjs7QUFDQSxvQkFBSSxzQkFBc0IsQ0FBQyxRQUF2QixDQUFnQyxNQUFNLENBQUMsRUFBdkMsS0FBK0MsTUFBTSxJQUFJLENBQUMsaUJBQTlELEVBQWtGO0FBQzlFO0FBQ0Esa0JBQUEsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsTUFBbkI7QUFDQTtBQUNIOztBQUVELGdCQUFBLGdCQUFnQixDQUFDLElBQWpCLENBQXNCLE1BQU0sQ0FBQyxFQUE3QjtBQUVBLG9CQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBWCxDQUFnQjtBQUFBLHNCQUFHLEVBQUgsVUFBRyxFQUFIO0FBQUEseUJBQVksRUFBRSxLQUFLLE1BQU0sQ0FBQyxFQUExQjtBQUFBLGlCQUFoQixDQUFuQjs7QUFFQSxvQkFBSSxVQUFKLEVBQWdCO0FBQ1osa0JBQUEsVUFBVSxDQUFDO0FBQ1Asb0JBQUEsT0FBTyxFQUFFLE1BREY7QUFFUCxvQkFBQSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBRlA7QUFHUCxvQkFBQSxDQUFDLEVBQUUsVUFBVSxDQUFDO0FBSFAsbUJBQUQsQ0FBVjtBQUtIO0FBQ0osZUF0QkQ7QUF3QkEsa0JBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBWixDQUFwQjtBQUNBLGtCQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsVUFBRCxDQUFOLENBQW1CLE1BQW5CLENBQTBCLFVBQUMsRUFBRDtBQUFBLHVCQUFRLENBQUMsV0FBVyxDQUFDLFFBQVosQ0FBcUIsRUFBckIsQ0FBVDtBQUFBLGVBQTFCLENBQXBCO0FBRUEsY0FBQSxVQUFVLENBQUMsT0FBWCxDQUFtQixVQUFDLElBQUQsRUFBVTtBQUV6QixnQkFBQSxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQU4sQ0FBVCxHQUFxQixJQUFyQjtBQUNILGVBSEQ7QUFLQSxjQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksYUFBWixFQUEyQixXQUEzQjtBQUVBLGNBQUEsV0FBVyxDQUFDLE9BQVosQ0FBb0IsVUFBQyxFQUFELEVBQVE7QUFFeEI7QUFDQSxvQkFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBbEI7QUFDQSxnQkFBQSxTQUFTLENBQUMsRUFBVixHQUFlLEVBQWY7QUFDQSxnQkFBQSxTQUFTLENBQUMsU0FBVixDQUFvQixHQUFwQixDQUF3QixZQUF4QjtBQUNBLGdCQUFBLFNBQVMsQ0FBQyxTQUFWLENBQW9CLEdBQXBCLENBQXdCLGFBQXhCO0FBRUEsZ0JBQUEsb0JBQW9CLENBQUMsU0FBRCxFQUFZLEVBQVosQ0FBcEI7QUFFQSxnQkFBQSxNQUFNLENBQUMsV0FBUCxDQUFtQixTQUFuQjtBQUVBLG9CQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsSUFBWCxDQUFnQjtBQUFBLHNCQUFHLEVBQUgsVUFBRyxFQUFIO0FBQUEseUJBQVksRUFBRSxLQUFLLEVBQW5CO0FBQUEsaUJBQWhCLENBQWpCO0FBRUEsZ0JBQUEsVUFBVSxDQUFDO0FBQ1Asa0JBQUEsT0FBTyxFQUFFLFNBREY7QUFFUCxrQkFBQSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBRkw7QUFHUCxrQkFBQSxDQUFDLEVBQUUsUUFBUSxDQUFDO0FBSEwsaUJBQUQsQ0FBVjtBQU1BLGdCQUFBLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBVixFQUFhLFFBQVEsQ0FBQyxDQUF0QixDQUFaO0FBQ0gsZUFyQkQ7QUFzQkgsYUEvS2MsRUFpTGY7OztBQWpMZTtBQUFBLG1CQWtMVCxVQUFVLENBQUMsU0FBWCxrQkFBK0IsYUFBL0IsR0FBZ0QsWUFBaEQsQ0FsTFM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBSDs7QUFBQSxrQkFBVixVQUFVO0FBQUE7QUFBQTtBQUFBLEdBQWhCOztBQXFMQSxJQUFNLEdBQUcsR0FBRyxTQUFOLEdBQU0sR0FBTTtBQUVkLEVBQUEsVUFBVSxHQUZJLENBSWQ7QUFDQTs7QUFDQSxNQUFNLFdBQVcsR0FBRyxTQUFkLFdBQWMsQ0FBQyxHQUFELEVBQVM7QUFFekIsSUFBQSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQVo7QUFDQSxJQUFBLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBWjtBQUVBLElBQUEsa0JBQWtCO0FBQ3JCLEdBTkQsQ0FOYyxDQWNkOzs7QUFDQSxFQUFBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixXQUF4QixFQUFxQyxXQUFyQyxFQWZjLENBaUJkOztBQUNBLEVBQUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFdBQXhCLEVBQXFDLFVBQUMsR0FBRCxFQUFTO0FBRTFDLElBQUEsV0FBVyxDQUFDO0FBQ1IsTUFBQSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFHLENBQUMsY0FBSixDQUFtQixDQUFuQixFQUFzQixPQUFqQyxDQURDO0FBRVIsTUFBQSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFHLENBQUMsY0FBSixDQUFtQixDQUFuQixFQUFzQixPQUFqQztBQUZDLEtBQUQsQ0FBWDtBQUlILEdBTkQsRUFsQmMsQ0EwQmQ7O0FBQ0EsRUFBQSxRQUFRLENBQUMsSUFBVCxDQUFjLGdCQUFkLENBQStCLE9BQS9CLEVBQXdDLFVBQVUsR0FBVixFQUFlO0FBRW5ELElBQUEsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFMLEVBQWMsR0FBRyxDQUFDLE9BQWxCLENBQVo7QUFDSCxHQUhEO0FBSUgsQ0EvQkQ7O0FBaUNBLEdBQUc7QUFFSDtBQUNBO0FBQ0E7QUFHQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBRUE7QUFFQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUVBO0FBRUE7QUFFQTtBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7QUMvWEEsYSxDQUVBO0FBRUE7O0FBQ0EsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsU0FBdkIsQ0FBZjtBQUNBLElBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQWxCLENBQVosQyxDQUVBOztBQUNBLE1BQU0sQ0FBQyxLQUFQLEdBQWUsTUFBTSxDQUFDLFVBQXRCO0FBQ0EsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsTUFBTSxDQUFDLFdBQXZCLEMsQ0FFQTs7QUFDQSxJQUFNLE1BQU0sR0FBRztBQUNiLEVBQUEsY0FBYyxFQUFFLEVBREg7QUFFYixFQUFBLGVBQWUsRUFBRSxFQUZKO0FBR2IsRUFBQSxRQUFRLEVBQUUsRUFIRztBQUliLEVBQUEsY0FBYyxFQUFFO0FBSkgsQ0FBZixDLENBT0E7O0FBQ0EsSUFBTSxZQUFZLEdBQUc7QUFDakIsRUFBQSxFQUFFLEVBQUU7QUFBRSxJQUFBLENBQUMsRUFBRSxDQUFMO0FBQVEsSUFBQSxDQUFDLEVBQUUsQ0FBWDtBQUFjLElBQUEsQ0FBQyxFQUFFLENBQWpCO0FBQW9CLElBQUEsQ0FBQyxFQUFFO0FBQXZCLEdBRGE7QUFFakIsRUFBQSxNQUFNLEVBQUUsQ0FDTjtBQUFFLElBQUEsQ0FBQyxFQUFFLEVBQUw7QUFBUyxJQUFBLENBQUMsRUFBRSxFQUFaO0FBQWdCLElBQUEsQ0FBQyxFQUFFO0FBQW5CLEdBRE0sRUFDbUI7QUFDekI7QUFBRSxJQUFBLENBQUMsRUFBRSxFQUFMO0FBQVMsSUFBQSxDQUFDLEVBQUUsRUFBWjtBQUFnQixJQUFBLENBQUMsRUFBRTtBQUFuQixHQUZNLEVBRW1CO0FBQ3pCO0FBQUUsSUFBQSxDQUFDLEVBQUUsR0FBTDtBQUFVLElBQUEsQ0FBQyxFQUFFLEdBQWI7QUFBa0IsSUFBQSxDQUFDLEVBQUU7QUFBckIsR0FITSxFQUdxQjtBQUMzQjtBQUFFLElBQUEsQ0FBQyxFQUFFLEdBQUw7QUFBVSxJQUFBLENBQUMsRUFBRSxHQUFiO0FBQWtCLElBQUEsQ0FBQyxFQUFFO0FBQXJCLEdBSk0sQ0FJcUI7QUFKckI7QUFGUyxDQUFyQixDLENBVUE7O0FBQ0EsSUFBSSxTQUFTLEdBQUcsRUFBaEI7QUFDQSxJQUFJLE1BQUo7QUFFQSxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBUCxHQUFlLENBQS9CO0FBQ0EsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBaEMsQyxDQUVBOztBQUNBLE1BQU0sR0FBRyxnQkFBQyxHQUFELEVBQU0sS0FBTixFQUFnQjtBQUVyQixFQUFBLEdBQUcsQ0FBQyxTQUFKLEdBQWdCLFNBQVMsS0FBSyxDQUFDLENBQWYsR0FBbUIsR0FBbkIsR0FBeUIsS0FBSyxDQUFDLENBQS9CLEdBQW1DLEdBQW5DLEdBQXlDLEtBQUssQ0FBQyxDQUEvQyxHQUFtRCxHQUFuRTtBQUNBLEVBQUEsR0FBRyxDQUFDLFFBQUosQ0FBYSxDQUFiLEVBQWdCLENBQWhCLEVBQW1CLE1BQU0sQ0FBQyxLQUExQixFQUFpQyxNQUFNLENBQUMsTUFBeEM7QUFDSCxDQUpELEMsQ0FNQTs7O0FBQ0EsSUFBTSxRQUFRLEdBQUcsU0FBWCxRQUFXLENBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0I7QUFDN0I7QUFDQSxPQUFLLENBQUwsR0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsTUFBTCxLQUFnQixNQUFNLENBQUMsS0FBbEMsQ0FBZCxDQUY2QixDQUc3Qjs7QUFDQSxPQUFLLENBQUwsR0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsTUFBTCxLQUFnQixNQUFNLENBQUMsTUFBbEMsQ0FBZCxDQUo2QixDQUs3Qjs7QUFDQSxPQUFLLENBQUwsR0FBUyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxNQUFMLEtBQWdCLE1BQU0sQ0FBQyxlQUFqQyxDQUFULENBTjZCLENBTzdCOztBQUNBLE9BQUssQ0FBTCxHQUFTLGNBQWMsQ0FBQyxZQUFZLENBQUMsTUFBYixDQUFvQixJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxNQUFMLEtBQWdCLFlBQVksQ0FBQyxNQUFiLENBQW9CLE1BQS9DLENBQXBCLENBQUQsRUFBNkUsSUFBN0UsQ0FBdkIsQ0FSNkIsQ0FTN0I7O0FBQ0EsT0FBSyxDQUFMLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxNQUFMLEtBQWdCLE1BQU0sQ0FBQyxRQUFqQyxDQUFULEVBQXFELEVBQXJELENBQVQsQ0FWNkIsQ0FXN0I7O0FBQ0EsT0FBSyxDQUFMLEdBQVMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsTUFBTCxLQUFnQixHQUEzQixDQUFUO0FBQ0gsQ0FiRCxDLENBZUE7QUFDQTtBQUNBOzs7QUFDQSxJQUFNLGNBQWMsR0FBRyxTQUFqQixjQUFpQixDQUFVLEtBQVYsRUFBaUIsWUFBakIsRUFBK0I7QUFFbEQsTUFBSSxDQUFKLEVBQU0sQ0FBTixFQUFRLENBQVIsRUFBVSxDQUFWLEVBQWEsU0FBYjtBQUNBLEVBQUEsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFMLENBQWEsSUFBSSxDQUFDLE1BQUwsS0FBZ0IsTUFBTSxDQUFDLGNBQXhCLEdBQTJDLE1BQU0sQ0FBQyxjQUFQLEdBQXNCLENBQWxFLEdBQXdFLEtBQUssQ0FBQyxDQUF6RixDQUFKO0FBQ0EsRUFBQSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUwsQ0FBYSxJQUFJLENBQUMsTUFBTCxLQUFnQixNQUFNLENBQUMsY0FBeEIsR0FBMkMsTUFBTSxDQUFDLGNBQVAsR0FBc0IsQ0FBbEUsR0FBd0UsS0FBSyxDQUFDLENBQXpGLENBQUo7QUFDQSxFQUFBLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBTCxDQUFhLElBQUksQ0FBQyxNQUFMLEtBQWdCLE1BQU0sQ0FBQyxjQUF4QixHQUEyQyxNQUFNLENBQUMsY0FBUCxHQUFzQixDQUFsRSxHQUF3RSxLQUFLLENBQUMsQ0FBekYsQ0FBSjtBQUNBLEVBQUEsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFMLEtBQWdCLEVBQXBCOztBQUNBLE1BQUksWUFBSixFQUFrQjtBQUNkLFdBQU8sVUFBVSxDQUFWLEdBQWMsR0FBZCxHQUFvQixDQUFwQixHQUF3QixHQUF4QixHQUE4QixDQUE5QixHQUFrQyxHQUFsQyxHQUF3QyxDQUF4QyxHQUE0QyxHQUFuRDtBQUNILEdBRkQsTUFFTztBQUNILFdBQU87QUFBQyxNQUFBLENBQUMsRUFBRCxDQUFEO0FBQUcsTUFBQSxDQUFDLEVBQUQsQ0FBSDtBQUFLLE1BQUEsQ0FBQyxFQUFELENBQUw7QUFBTyxNQUFBLENBQUMsRUFBRDtBQUFQLEtBQVA7QUFDSDtBQUNKLENBWkQsQyxDQWNBOzs7QUFDQSxJQUFNLG1CQUFtQixHQUFHLFNBQXRCLG1CQUFzQixDQUFVLENBQVYsRUFBYTtBQUVyQyxNQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFGLEdBQU0sRUFBYixDQUFSLENBRnFDLENBRVg7O0FBQzFCLEVBQUEsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFOLElBQVcsQ0FBQyxDQUFDLENBQUYsR0FBTSxHQUFqQixHQUF1QixDQUFDLENBQUMsQ0FBRixJQUFPLENBQUMsQ0FBQyxDQUFGLEdBQU0sSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLENBQUMsQ0FBWCxDQUFOLEdBQXNCLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxDQUFDLENBQVgsQ0FBcEQsR0FBb0UsQ0FBQyxDQUFDLENBQUYsSUFBTyxDQUFDLENBQUMsQ0FBRixHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxDQUFDLENBQVgsQ0FBTixHQUFzQixJQUFJLENBQUMsR0FBTCxDQUFTLENBQUMsQ0FBQyxDQUFYLENBQWpHO0FBQ0EsRUFBQSxDQUFDLENBQUMsQ0FBRixHQUFNLEVBQU4sSUFBWSxDQUFDLENBQUMsQ0FBRixHQUFNLEdBQWxCLEdBQXdCLENBQUMsQ0FBQyxDQUFGLElBQU8sQ0FBQyxDQUFDLENBQUYsR0FBTSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsQ0FBTixHQUFvQixJQUFJLENBQUMsR0FBTCxDQUFTLENBQUMsQ0FBQyxDQUFYLENBQW5ELEdBQW1FLENBQUMsQ0FBQyxDQUFGLElBQU8sQ0FBQyxDQUFDLENBQUYsR0FBTSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsQ0FBTixHQUFvQixJQUFJLENBQUMsR0FBTCxDQUFTLENBQUMsQ0FBQyxDQUFYLENBQTlGO0FBQ0EsU0FBTyxDQUFQO0FBQ0gsQ0FORDs7QUFRQSxJQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFoQjtBQUNBLE9BQU8sQ0FBQyxHQUFSLEdBQWMsa0JBQWQsQyxDQUVBO0FBQ0E7O0FBQ0EsSUFBTSxZQUFZLEdBQUcsU0FBZixZQUFlLENBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkIsRUFBc0I7QUFFdkMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQWpCLENBRnVDLENBSXZDOztBQUNBLEVBQUEsR0FBRyxDQUFDLHdCQUFKLEdBQStCLGFBQS9CO0FBQ0EsRUFBQSxHQUFHLENBQUMsU0FBSixDQUFjLE9BQWQsRUFBdUIsQ0FBdkIsRUFBMEIsQ0FBMUIsRUFBNkIsSUFBN0IsRUFBbUMsSUFBbkMsRUFOdUMsQ0FPdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNILENBZkQsQyxDQWlCQTs7O0FBQ0EsSUFBTSxZQUFZLEdBQUcsU0FBZixZQUFlLEdBQVk7QUFDN0IsRUFBQSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsVUFBQyxDQUFELEVBQU87QUFDbEMsV0FBUSxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsR0FBUCxJQUFjLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxHQUE3QjtBQUNELEdBRlcsQ0FBWjtBQUdILENBSkQ7O0FBTUEsSUFBTSxhQUFhLEdBQUcsU0FBaEIsYUFBZ0IsQ0FBVSxZQUFWLEVBQXdCLENBQXhCLEVBQTJCLENBQTNCLEVBQThCO0FBRWhELE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsWUFBcEIsRUFBa0MsQ0FBQyxFQUFuQyxFQUF1QztBQUNuQyxJQUFBLFNBQVMsQ0FBQyxJQUFWLENBQWUsSUFBSSxRQUFKLENBQWEsQ0FBYixFQUFnQixDQUFoQixDQUFmO0FBQ0g7O0FBRUQsRUFBQSxTQUFTLENBQUMsT0FBVixDQUFrQixVQUFDLENBQUQsRUFBTztBQUVyQixJQUFBLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBSCxFQUFNLENBQUMsQ0FBQyxDQUFSLEVBQVcsQ0FBQyxDQUFDLENBQWIsRUFBZ0IsQ0FBQyxDQUFDLENBQWxCLENBQVo7QUFDSCxHQUhEO0FBSUgsQ0FWRCxDLENBWUE7OztBQUNBLE1BQU0sQ0FBQyxnQkFBUCxHQUEyQixZQUFNO0FBRS9CLFNBQU8sTUFBTSxDQUFDLHFCQUFQLElBQ0osTUFBTSxDQUFDLDJCQURILElBRUosTUFBTSxDQUFDLHdCQUZILElBR0osVUFBUyxRQUFULEVBQW1CO0FBQ2hCLElBQUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsUUFBbEIsRUFBNEIsT0FBTyxFQUFuQztBQUNGLEdBTEo7QUFNRCxDQVJ5QixFQUExQixDLENBVUE7OztBQUNBLElBQU0sS0FBSyxHQUFHLFNBQVIsS0FBUSxHQUFNO0FBQ2xCO0FBQ0EsRUFBQSxNQUFNLENBQUMsR0FBRCxFQUFNLFlBQVksQ0FBQyxFQUFuQixDQUFOLENBRmtCLENBR2xCOztBQUNBLEVBQUEsU0FBUyxDQUFDLEdBQVYsQ0FBYyxVQUFDLENBQUQsRUFBTztBQUNuQixXQUFPLG1CQUFtQixDQUFDLENBQUQsQ0FBMUI7QUFDRCxHQUZELEVBSmtCLENBT2xCOztBQUNBLEVBQUEsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsVUFBQyxDQUFELEVBQU87QUFFbkIsSUFBQSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUgsRUFBTSxDQUFDLENBQUMsQ0FBUixFQUFXLENBQUMsQ0FBQyxDQUFiLEVBQWdCLENBQUMsQ0FBQyxDQUFsQixDQUFaO0FBQ0wsR0FIRCxFQVJrQixDQVlsQjs7QUFDQSxFQUFBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixLQUF4QjtBQUNELENBZEQsQyxDQWdCQTs7O0FBQ0EsS0FBSyxHLENBRUw7O0FBQ0EsYUFBYSxDQUFDLE1BQU0sQ0FBQyxjQUFSLENBQWI7O0FBRUEsT0FBTyxDQUFDLFlBQVIsR0FBdUIsVUFBQyxDQUFELEVBQUksQ0FBSixFQUFVO0FBRTdCLEVBQUEsWUFBWTtBQUNaLEVBQUEsYUFBYSxDQUFDLE1BQU0sQ0FBQyxjQUFSLEVBQXdCLENBQXhCLEVBQTJCLENBQTNCLENBQWI7QUFDSCxDQUpEOzs7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdHhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdmJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJ3JlZ2VuZXJhdG9yLXJ1bnRpbWUnKTtcblxuY29uc3QgeyBnZW5QYXJ0aWNsZXMgfSA9IHJlcXVpcmUoJy4vcGFydGljbGVzLW9uLWNsaWNrJyk7XG5cbi8vIFNvdW5kIG9mZmZmZiEhISEhIVxuY29uc29sZS5sb2coJ1RBQ09PT09PT09PT09PT09PT09PT09PUyEhIScpO1xuXG5jb25zdCBERUJVRyA9IGZhbHNlO1xuY29uc3QgVEFDT1NfUk9PTV9JRCA9ICd0YWNvcy1uLWZyaWVuZHMnO1xuY29uc3QgTVlfVEFDT19JRCA9ICdteS10YWNvJztcbmNvbnN0IFVTRV9ORVMgPSB0cnVlO1xuY29uc3QgQ1VSU09SX1VQREFURV9USFJPVFRMRSA9IDEwOyAvLyAxMCBtaWxsaXNlY29uZHMg4oCUIGNsb3NlciB0byAxNiB3aGljaCB3b3VsZCBiZSA2MCBmcHNcblxuY29uc3QgVGhyb3R0bGUgPSByZXF1aXJlKCdsb2Rhc2gudGhyb3R0bGUnKTtcblxubGV0IE5lcztcblxuaWYgKFVTRV9ORVMpIHtcbiAgICBOZXMgPSByZXF1aXJlKCdAaGFwaS9uZXMvbGliL2NsaWVudCcpO1xufVxuXG4vLyBjb25zdCBSRUNPTk5FQ1RfVElNRU9VVCA9IDEwMDA7IC8vIGluIG1pbGxpc2Vjb25kc1xuXG5sZXQgUm9vbUNsaWVudDtcbi8vIFRoaXMgd2lsbCBnZXQgc2V0IGJ5IHRoZSBzZXJ2ZXIgb24gY29ubmVjdGlvblxubGV0IHJvb21Vc2VySWQgPSBudWxsO1xubGV0IHJvb21YID0gMDtcbmxldCByb29tWSA9IDA7XG5sZXQgaXNNb3VzZURvd24gPSBmYWxzZTtcblxuY29uc3QgYWJicmV2aWF0ZVVzZXJJZCA9ICh1c2VySWQpID0+IGAuLi4ke3VzZXJJZC5zcGxpdCgnLScpLnBvcCgpfWA7XG5cbmNvbnN0IGFkZElkVG9FbElmTm90RXhpc3RzID0gKGVsLCBpZCkgPT4ge1xuXG4gICAgY29uc3QgaWRFbCA9IGVsLnF1ZXJ5U2VsZWN0b3IoJy50YWNvLWlkJyk7XG5cbiAgICBpZiAoIWlkRWwpIHtcbiAgICAgICAgY29uc3QgdGFjb0lkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRhY29JZC5jbGFzc05hbWUgPSAndGFjby1pZCc7XG4gICAgICAgIHRhY29JZC50ZXh0Q29udGVudCA9IGFiYnJldmlhdGVVc2VySWQoaWQpO1xuICAgICAgICB0YWNvSWQuc3R5bGUuY29sb3IgPSAnd2hpdGUnO1xuICAgICAgICB0YWNvSWQuc3R5bGUuZm9udFNpemUgPSAnMTZweCc7XG4gICAgICAgIHRhY29JZC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIHRhY29JZC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtMjUlKSc7XG4gICAgICAgIHRhY29JZC5zdHlsZS5ib3R0b20gPSAnLTIwcHgnO1xuICAgICAgICB0YWNvSWQuc3R5bGUud2hpdGVTcGFjZSA9ICdub3dyYXAnO1xuICAgICAgICBlbC5hcHBlbmRDaGlsZCh0YWNvSWQpO1xuICAgIH1cbn07XG5cbi8vIFVwc2VydCB1c2VyIGluIHJvb21cbmNvbnN0IHVwZGF0ZVJvb20gPSBhc3luYyAoeyByb29tSWQsIHVzZXJJZCwgeCwgeSwgaXNNb3VzZURvd24gfSkgPT4ge1xuXG4gICAgY29uc3QgcGF5bG9hZCA9IHsgeCwgeSwgaXNNb3VzZURvd24gfTtcblxuICAgIGlmICh1c2VySWQpIHtcbiAgICAgICAgcGF5bG9hZC5pZCA9IHVzZXJJZDtcbiAgICB9XG5cbiAgICBjb25zdCB7IHBheWxvYWQ6IHsgZXJyb3IsIHVzZXIgfSB9ID0gYXdhaXQgUm9vbUNsaWVudC5yZXF1ZXN0KHtcbiAgICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICAgIHBhdGg6IGAvcm9vbXMvJHtyb29tSWR9L3VwZGF0ZWAsXG4gICAgICAgIHBheWxvYWRcbiAgICB9KTtcblxuICAgIGlmICh1c2VyKSB7XG4gICAgICAgIHJvb21Vc2VySWQgPSB1c2VyLmlkO1xuICAgICAgICBjb25zdCBteVRhY29FbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKE1ZX1RBQ09fSUQpO1xuICAgICAgICBhZGRJZFRvRWxJZk5vdEV4aXN0cyhteVRhY29FbCwgcm9vbVVzZXJJZCk7XG4gICAgfVxuXG4gICAgLy8gU2V0dXAgc29tZSBraW5kYSBlYXN5IGRlYnVnZ2luZyBvciBzb21ldGhpbmdcbiAgICBjb25zdCBjb25uZWN0aW9uTXNnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvbm5lY3Rpb25Nc2cnKSB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuXG4gICAgY29ubmVjdGlvbk1zZy5pZCA9ICdjb25uZWN0aW9uTXNnJztcblxuICAgIGlmIChlcnJvcikge1xuICAgICAgICAvLyBsZXQgZXJyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgPGgzIHN0eWxlPSdjb2xvcjogd2hpdGU7Jz5FcnJvciAke2Vycm9yLm1lc3NhZ2V9PC9oMz5gKTtcbiAgICAgICAgY29ubmVjdGlvbk1zZy5zdHlsZS5jb2xvciA9ICcjZjg4MDcwJztcbiAgICAgICAgY29ubmVjdGlvbk1zZy50ZXh0Q29udGVudCA9IGBFcnJvciAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbm5lY3Rpb25Nc2cuc3R5bGUuY29sb3IgPSAnIzczYzk5MSc7XG4gICAgICAgIGNvbm5lY3Rpb25Nc2cudGV4dENvbnRlbnQgPSBgQ29ubmVjdGVkIHg6ICR7eCB8fCAnbnVsbCd9IHk6ICR7eSB8fCAnbnVsbCd9YDtcbiAgICB9XG5cbiAgICAvLyBBZGQgaXRcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbm5lY3Rpb25Nc2cpO1xuXG4gICAgcmV0dXJuIHVzZXI7XG59O1xuXG5jb25zdCB0aHJvdHRsZWRCcm9hZGNhc3QgPSBUaHJvdHRsZSgoKSA9PiB7XG5cbiAgICB1cGRhdGVSb29tKHtcbiAgICAgICAgcm9vbUlkOiBUQUNPU19ST09NX0lELFxuICAgICAgICB1c2VySWQ6IHJvb21Vc2VySWQsXG4gICAgICAgIHg6IHJvb21YLFxuICAgICAgICB5OiByb29tWSxcbiAgICAgICAgaXNNb3VzZURvd25cbiAgICB9KTtcbn0sIENVUlNPUl9VUERBVEVfVEhST1RUTEUpO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGV2dCkgPT4ge1xuXG4gICAgaXNNb3VzZURvd24gPSB0cnVlO1xuICAgIHRocm90dGxlZEJyb2FkY2FzdCgpO1xufSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGV2dCkgPT4ge1xuXG4gICAgaXNNb3VzZURvd24gPSBmYWxzZTtcbiAgICB0aHJvdHRsZWRCcm9hZGNhc3QoKTtcbn0pO1xuXG5jb25zdCBteVRhY28gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChNWV9UQUNPX0lEKTtcblxuLy8gSG90IHBhdGhcbmNvbnN0IG1vdmVDdXJzb3IgPSAoeyBlbGVtZW50LCB4LCB5IH0pID0+IHtcblxuICAgIC8vIEhvcGVmdWxseSB0aGUgJ3B4JyBhdCB0aGUgZW5kIGhlcmUgd2lsbCBuZWdhdGUgYXR0ZW1wdHMgdG8gcnVuIGEgc2NyaXB0XG4gICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gYCR7eH1weGA7XG4gICAgZWxlbWVudC5zdHlsZS50b3AgPSBgJHt5fXB4YDtcbn07XG5cbi8vIFdlIG5lZWQgdGhpcyB3cmFwcGVyIHRvIG1ha2UgYXN5bmMvYXdhaXQgbmljZSB0byB3cml0ZVxuY29uc3QgaW5pdFNvY2tldCA9IGFzeW5jICgpID0+IHtcblxuICAgIGlmIChSb29tQ2xpZW50KSB7XG4gICAgICAgIGF3YWl0IFJvb21DbGllbnQuZGlzY29ubmVjdCgpO1xuICAgIH1cblxuICAgIGNvbnN0IHsgbG9jYXRpb246IHsgcHJvdG9jb2wsIGhvc3QgfSB9ID0gd2luZG93O1xuXG4gICAgLy8gVGhpcyB3aWxsIHJlcGxhY2UgJ2h0dHBzJyBmb3IgJ3dzJyB3aGljaCB3aWxsIGFsc28gbGVhdmUgJ3dzcycgZm9yICdodHRwcycgcHJvdG9jb2xzXG4gICAgY29uc3QgdXJsID0gcHJvdG9jb2wucmVwbGFjZSgnaHR0cCcsICd3cycpICsgJy8vJyArIGhvc3Q7XG5cbiAgICBjb25zdCB3c0xvY2F0aW9uID0gdXJsLnJlcGxhY2UoJ2xvY2FsaG9zdDozMDAxJywgJ2xvY2FsaG9zdDozMDAwJyk7XG5cbiAgICBjb25zb2xlLmxvZygnd3NMb2NhdGlvbicsIHdzTG9jYXRpb24pO1xuXG4gICAgUm9vbUNsaWVudCA9IG5ldyBOZXMuQ2xpZW50KHdzTG9jYXRpb24pO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgUm9vbUNsaWVudC5jb25uZWN0KCk7XG4gICAgfVxuICAgIGNhdGNoIChjb25uZWN0RXJyKSB7XG4gICAgICAgIC8vIFNldHVwIHNvbWUga2luZGEgZWFzeSBkZWJ1Z2dpbmcgb3Igc29tZXRoaW5nXG4gICAgICAgIGNvbnN0IGNvbm5lY3Rpb25Nc2cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29ubmVjdGlvbk1zZycpIHx8IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG5cbiAgICAgICAgY29ubmVjdGlvbk1zZy5pZCA9ICdjb25uZWN0aW9uTXNnJztcblxuICAgICAgICBjb25uZWN0aW9uTXNnLnN0eWxlLmNvbG9yID0gJyNmODgwNzAnO1xuICAgICAgICBjb25uZWN0aW9uTXNnLnRleHRDb250ZW50ID0gYEVycm9yICR7Y29ubmVjdEVyci5tZXNzYWdlfWA7XG4gICAgfVxuXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHVwZGF0ZVJvb20oe1xuICAgICAgICByb29tSWQ6IFRBQ09TX1JPT01fSUQsXG4gICAgICAgIHVzZXJJZDogcm9vbVVzZXJJZFxuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coJ2luaXQgdXNlcicsIHVzZXIpO1xuXG4gICAgY29uc3Qgcm9vbUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJvb20nKTtcblxuICAgIGNvbnN0IGNsaWNrVHJhY2tlciA9IHt9O1xuXG4gICAgbGV0IHJvb21Vc2VycyA9IHt9O1xuXG4gICAgLy8gSG90IHBhdGgsIHRocm90dGxlZCBzZXJ2ZXItc2lkZVxuICAgIGNvbnN0IG9uUm9vbVVwZGF0ZSA9IChwcm9wcykgPT4ge1xuXG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIGlkOiByb29tSWQsXG4gICAgICAgICAgICB1c2VycyA9IFtdLFxuICAgICAgICAgICAgaXNTeW5jLFxuICAgICAgICAgICAgc2NvcmVib2FyZFxuICAgICAgICB9ID0gcHJvcHM7XG5cbiAgICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnb25Sb29tVXBkYXRlJywgcHJvcHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzU3luYykge1xuICAgICAgICAgICAgY29uc3Qgc2NvcmVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY29yZWJvYXJkJyk7XG4gICAgICAgICAgICBzY29yZUVsLmlubmVySFRNTCA9IGA8aDM+U2NvcmVib2FyZDwvaDM+JHtzY29yZWJvYXJkLm1hcCgoeyB1c2VySWQsIHNjb3JlIH0pID0+IGA8cD4ke2FiYnJldmlhdGVVc2VySWQodXNlcklkKX06ICR7c2NvcmV9PC9wPmApLmpvaW4oJycpfWA7XG4gICAgICAgICAgICByb29tVXNlcnMgPSB1c2VycztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVzZXJzTm90TWUgPSBPYmplY3Qua2V5cyh1c2VycylcbiAgICAgICAgICAgIC5maWx0ZXIoKGlkKSA9PiBpZCAhPT0gcm9vbVVzZXJJZClcbiAgICAgICAgICAgIC5tYXAoKGlkKSA9PiB1c2Vyc1tpZF0pO1xuXG4gICAgICAgIE9iamVjdC52YWx1ZXModXNlcnNOb3RNZSkuZm9yRWFjaCgoeyBpZDogdXNlcklkLCBsYXN0Q2xpY2s6IHsgZXBvY2gsIHgsIHkgfSA9IHt9IH0pID0+IHtcblxuICAgICAgICAgICAgY29uc3QgdXNlckNsaWNrZWQgPSBlcG9jaDtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RVc2VyQ2xpY2sgPSBjbGlja1RyYWNrZXJbdXNlcklkXTtcbiAgICAgICAgICAgIGxldCBzaG91bGRHZW5QYXJ0aWNsZXMgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKHVzZXJDbGlja2VkICYmICFsYXN0VXNlckNsaWNrIHx8IChsYXN0VXNlckNsaWNrICYmIHVzZXJDbGlja2VkID4gbGFzdFVzZXJDbGljaykpIHtcbiAgICAgICAgICAgICAgICBzaG91bGRHZW5QYXJ0aWNsZXMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGlja1RyYWNrZXJbdXNlcklkXSA9IGVwb2NoO1xuXG4gICAgICAgICAgICBpZiAoc2hvdWxkR2VuUGFydGljbGVzKSB7XG4gICAgICAgICAgICAgICAgZ2VuUGFydGljbGVzKHgsIHkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGlja1RyYWNrZXJbdXNlcklkXSA9IGVwb2NoO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB1c2Vyc1llc01lID0gdXNlcnNbT2JqZWN0LmtleXModXNlcnMpLmZpbmQoKGlkKSA9PiBpZCA9PT0gcm9vbVVzZXJJZCldO1xuXG4gICAgICAgIGNvbnN0IHVzZXJzTWFya2VkRm9yRGVsZXRpb24gPSBPYmplY3QudmFsdWVzKHVzZXJzTm90TWUpXG4gICAgICAgICAgICAuZmlsdGVyKCh7IHNob3VsZERlbGV0ZSB9KSA9PiAhIXNob3VsZERlbGV0ZSlcbiAgICAgICAgICAgIC5tYXAoKHsgaWQgfSkgPT4gaWQpO1xuXG4gICAgICAgIGNvbnN0IHNpbmdsZVVzZXJzTm90TWUgPSB1c2Vyc05vdE1lLmxlbmd0aCA9PT0gMSA/IHVzZXJzTm90TWVbMF0gOiBudWxsO1xuXG4gICAgICAgIGlmIChERUJVRykge1xuICAgICAgICAgICAgaWYgKHVzZXJzWWVzTWUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXNlcnNZZXNNZScsIHVzZXJzWWVzTWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNpbmdsZVVzZXJzTm90TWUgfHwgdXNlcnNOb3RNZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXNlcnNOb3RNZScsIHNpbmdsZVVzZXJzTm90TWUgfHwgdXNlcnNOb3RNZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodXNlcnNZZXNNZSkge1xuICAgICAgICAgICAgbW92ZUN1cnNvcih7XG4gICAgICAgICAgICAgICAgZWxlbWVudDogbXlUYWNvLFxuICAgICAgICAgICAgICAgIHg6IHVzZXJzWWVzTWUueCxcbiAgICAgICAgICAgICAgICB5OiB1c2Vyc1llc01lLnlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZ2V0SWRzID0gKGFycikgPT4gYXJyLm1hcCgoeyBpZCB9KSA9PiBpZCk7XG5cbiAgICAgICAgLy8gTWFuYWdlIHRoZSBnaG9zdCB0YWNvc1xuXG4gICAgICAgIGNvbnN0IGdob3N0VGFjb3MgPSBBcnJheS5mcm9tKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2dob3N0LXRhY28nKSk7XG5cbiAgICAgICAgY29uc3QgZXhpc3RpbmdHaG9zdElkcyA9IFtdO1xuXG4gICAgICAgIGdob3N0VGFjb3MuZm9yRWFjaCgodGFjb0VsKSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IHRhY29FeGlzdHNJblVzZXJzID0gT2JqZWN0LmtleXMocm9vbVVzZXJzKS5pbmNsdWRlcyh0YWNvRWwuaWQpO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgaW5hY3RpdmUgdGFjb3NcbiAgICAgICAgICAgIGlmICh1c2Vyc01hcmtlZEZvckRlbGV0aW9uLmluY2x1ZGVzKHRhY29FbC5pZCkgfHwgKGlzU3luYyAmJiAhdGFjb0V4aXN0c0luVXNlcnMpKSB7XG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRoaXMgdGFjb1xuICAgICAgICAgICAgICAgIHJvb21FbC5yZW1vdmVDaGlsZCh0YWNvRWwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXhpc3RpbmdHaG9zdElkcy5wdXNoKHRhY29FbC5pZCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRhY29VcGRhdGUgPSB1c2Vyc05vdE1lLmZpbmQoKHsgaWQgfSkgPT4gaWQgPT09IHRhY29FbC5pZCk7XG5cbiAgICAgICAgICAgIGlmICh0YWNvVXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgbW92ZUN1cnNvcih7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHRhY29FbCxcbiAgICAgICAgICAgICAgICAgICAgeDogdGFjb1VwZGF0ZS54LFxuICAgICAgICAgICAgICAgICAgICB5OiB0YWNvVXBkYXRlLnlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgcm9vbVVzZXJJZHMgPSBPYmplY3Qua2V5cyhyb29tVXNlcnMpO1xuICAgICAgICBjb25zdCBuZXdHaG9zdElkcyA9IGdldElkcyh1c2Vyc05vdE1lKS5maWx0ZXIoKGlkKSA9PiAhcm9vbVVzZXJJZHMuaW5jbHVkZXMoaWQpKTtcblxuICAgICAgICB1c2Vyc05vdE1lLmZvckVhY2goKHVzZXIpID0+IHtcblxuICAgICAgICAgICAgcm9vbVVzZXJzW3VzZXIuaWRdID0gdXNlcjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ25ld0dob3N0SWRzJywgbmV3R2hvc3RJZHMpO1xuXG4gICAgICAgIG5ld0dob3N0SWRzLmZvckVhY2goKGlkKSA9PiB7XG5cbiAgICAgICAgICAgIC8vIEFkZCBhIG5ldyBnaG9zdCB0YWNvXG4gICAgICAgICAgICBjb25zdCBuZXdUYWNvRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIG5ld1RhY29FbC5pZCA9IGlkO1xuICAgICAgICAgICAgbmV3VGFjb0VsLmNsYXNzTGlzdC5hZGQoJ2dob3N0LXRhY28nKTtcbiAgICAgICAgICAgIG5ld1RhY29FbC5jbGFzc0xpc3QuYWRkKCd0YWNvLWN1cnNvcicpO1xuXG4gICAgICAgICAgICBhZGRJZFRvRWxJZk5vdEV4aXN0cyhuZXdUYWNvRWwsIGlkKTtcblxuICAgICAgICAgICAgcm9vbUVsLmFwcGVuZENoaWxkKG5ld1RhY29FbCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHVzZXJJbmZvID0gdXNlcnNOb3RNZS5maW5kKCh7IGlkIH0pID0+IGlkID09PSBpZCk7XG5cbiAgICAgICAgICAgIG1vdmVDdXJzb3Ioe1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG5ld1RhY29FbCxcbiAgICAgICAgICAgICAgICB4OiB1c2VySW5mby54LFxuICAgICAgICAgICAgICAgIHk6IHVzZXJJbmZvLnlcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBnZW5QYXJ0aWNsZXModXNlckluZm8ueCwgdXNlckluZm8ueSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBDb29vb25ubm5ubmVlZWVlZWVjY2NjY2N0dHR0dHR0dCEhISEhISFcbiAgICBhd2FpdCBSb29tQ2xpZW50LnN1YnNjcmliZShgL3Jvb21zLyR7VEFDT1NfUk9PTV9JRH1gLCBvblJvb21VcGRhdGUpO1xufTtcblxuY29uc3QgcnVuID0gKCkgPT4ge1xuXG4gICAgaW5pdFNvY2tldCgpO1xuXG4gICAgLy8gQnJvYWRjYXN0IG1vdmVtZW50cyB0byB0aGUgcm9vbSBhbmQgb25seVxuICAgIC8vIHVwZGF0ZSBteSB2aWV3IHdpdGggd2hhdCB3ZSBnZXQgZnJvbSB0aGUgc2VydmVyXG4gICAgY29uc3Qgb25Nb3VzZU1vdmUgPSAoZXZ0KSA9PiB7XG5cbiAgICAgICAgcm9vbVggPSBldnQucGFnZVg7XG4gICAgICAgIHJvb21ZID0gZXZ0LnBhZ2VZO1xuXG4gICAgICAgIHRocm90dGxlZEJyb2FkY2FzdCgpO1xuICAgIH07XG5cbiAgICAvLyBEZXNrdG9wIGFuZCBtb2JpbGUgY2xpY2tzXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlKTtcblxuICAgIC8vIE1vYmlsZSBzdXBwb3J0XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIChldnQpID0+IHtcblxuICAgICAgICBvbk1vdXNlTW92ZSh7XG4gICAgICAgICAgICBwYWdlWDogTWF0aC5yb3VuZChldnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCksXG4gICAgICAgICAgICBwYWdlWTogTWF0aC5yb3VuZChldnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSlcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBNeSB0YWNvJ3MgcGFydGljbGVzXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldnQpIHtcblxuICAgICAgICBnZW5QYXJ0aWNsZXMoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKTtcbiAgICB9KTtcbn07XG5cbnJ1bigpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgQnJpZWYgYXR0ZW1wdCBhdCB3ZWJzb2NrZXQgbmF0aXZlIHN0dWZmXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbi8vIGNvbnN0IG9uU29ja2V0T3BlbiA9IChldnQpID0+IHtcblxuLy8gICAgIGNvbnNvbGUubG9nKCdvcGVuIGV2dCcsIGV2dCk7XG4vLyAgICAgLy8gUm9vbUNsaWVudC5zZW5kKCdIZWxsbyBTZXJ2ZXIhJyk7XG4vLyB9O1xuXG4vLyBjb25zdCBvblNvY2tldE1lc3NhZ2UgPSAoZXZ0KSA9PiB7XG5cbi8vICAgICBjb25zb2xlLmxvZygnZXZ0JywgZXZ0KTtcblxuLy8gICAgIGNvbnNvbGUubG9nKCdNZXNzYWdlIGZyb20gc2VydmVyICcsIGV2dD8uZGF0YSk7XG4vLyB9O1xuXG4vLyBSb29tQ2xpZW50ID0gbmV3IFdlYlNvY2tldCgnd3M6Ly9sb2NhbGhvc3Q6MzAwMCcpO1xuXG4vLyAvLyBMaXN0ZW4gZm9yIGNvbm5lY3Rpb24gb3BlblxuLy8gUm9vbUNsaWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdvcGVuJywgb25Tb2NrZXRPcGVuKTtcbi8vIFJvb21DbGllbnQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIG9uU29ja2V0T3Blbik7XG5cbi8vIC8vIExpc3RlbiBmb3IgbWVzc2FnZXNcbi8vIFJvb21DbGllbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIG9uU29ja2V0TWVzc2FnZSk7XG4vLyBSb29tQ2xpZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBvblNvY2tldE1lc3NhZ2UpO1xuXG4vLyBSb29tQ2xpZW50Lm9uY2xvc2UgPSBvblNvY2tldENsb3NlO1xuXG4vLyBjb25zdCBvblNvY2tldENsb3NlID0gKGV2dCkgPT4ge1xuXG4vLyAgICAgY29uc29sZS5sb2coJ29uY2xvc2UgZXZ0JywgZXZ0KTtcblxuLy8gICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuXG4vLyAgICAgICAgIGNvbnNvbGUubG9nKCdSZWNvbm5lY3RpbmcuLi4nKTtcbi8vICAgICAgICAgaW5pdFNvY2tldCgpO1xuLy8gICAgIH0sIFJFQ09OTkVDVF9USU1FT1VUKTtcbi8vIH07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIEFkYXB0ZWQgZnJvbSBodHRwczovL2NvZGVwZW4uaW8vZGVhbndhZ21hbi9wZW4vRWpMQmRRXG5cbi8vIExpdHRsZSBDYW52YXMgdGhpbmdzXG5jb25zdCBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhbnZhc1wiKTtcbmNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4vLyBTZXQgQ2FudmFzIHRvIGJlIHdpbmRvdyBzaXplXG5jYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbmNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbi8vIENvbmZpZ3VyYXRpb24sIFBsYXkgd2l0aCB0aGVzZVxuY29uc3QgY29uZmlnID0ge1xuICBwYXJ0aWNsZU51bWJlcjogNDAsXG4gIG1heFBhcnRpY2xlU2l6ZTogMjAsXG4gIG1heFNwZWVkOiA0MCxcbiAgY29sb3JWYXJpYXRpb246IDUwXG59O1xuXG4vLyBDb2xvcnNcbmNvbnN0IGNvbG9yUGFsZXR0ZSA9IHtcbiAgICBiZzogeyByOiAwLCBnOiAwLCBiOiAwLCBhOiAwIH0sXG4gICAgbWF0dGVyOiBbXG4gICAgICB7IHI6IDM2LCBnOiAxOCwgYjogNDIgfSwgLy8gZGFya1BSUExcbiAgICAgIHsgcjogNzgsIGc6IDM2LCBiOiA0MiB9LCAvLyByb2NrRHVzdFxuICAgICAgeyByOiAyNTIsIGc6IDE3OCwgYjogOTYgfSwgLy8gc29sb3JGbGFyZVxuICAgICAgeyByOiAyNTMsIGc6IDIzOCwgYjogMTUyIH0gLy8gdG90ZXNBU3VuXG4gICAgXVxufTtcblxuLy8gU29tZSBWYXJpYWJsZXMgaGFuZ2luZyBvdXRcbmxldCBwYXJ0aWNsZXMgPSBbXTtcbmxldCBkcmF3Qmc7XG5cbmNvbnN0IGNlbnRlclggPSBjYW52YXMud2lkdGggLyAyO1xuY29uc3QgY2VudGVyWSA9IGNhbnZhcy5oZWlnaHQgLyAyO1xuXG4vLyBEcmF3cyB0aGUgYmFja2dyb3VuZCBmb3IgdGhlIGNhbnZhcywgYmVjYXVzZSBzcGFjZVxuZHJhd0JnID0gKGN0eCwgY29sb3IpID0+IHtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYihcIiArIGNvbG9yLnIgKyBcIixcIiArIGNvbG9yLmcgKyBcIixcIiArIGNvbG9yLmIgKyBcIilcIjtcbiAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbn07XG5cbi8vIFBhcnRpY2xlIENvbnN0cnVjdG9yXG5jb25zdCBQYXJ0aWNsZSA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgLy8gWCBDb29yZGluYXRlXG4gICAgdGhpcy54ID0geCB8fCBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiBjYW52YXMud2lkdGgpO1xuICAgIC8vIFkgQ29vcmRpbmF0ZVxuICAgIHRoaXMueSA9IHkgfHwgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogY2FudmFzLmhlaWdodCk7XG4gICAgLy8gUmFkaXVzIG9mIHRoZSBzcGFjZSBkdXN0XG4gICAgdGhpcy5yID0gTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiBjb25maWcubWF4UGFydGljbGVTaXplKTtcbiAgICAvLyBDb2xvciBvZiB0aGUgcm9jaywgZ2l2ZW4gc29tZSByYW5kb21uZXNzXG4gICAgdGhpcy5jID0gY29sb3JWYXJpYXRpb24oY29sb3JQYWxldHRlLm1hdHRlcltNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjb2xvclBhbGV0dGUubWF0dGVyLmxlbmd0aCldLHRydWUgKTtcbiAgICAvLyBTcGVlZCBvZiB3aGljaCB0aGUgcm9jayB0cmF2ZWxzXG4gICAgdGhpcy5zID0gTWF0aC5wb3coTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiBjb25maWcubWF4U3BlZWQpLCAuNyk7XG4gICAgLy8gRGlyZWN0aW9uIHRoZSBSb2NrIGZsaWVzXG4gICAgdGhpcy5kID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMzYwKTtcbn07XG5cbi8vIFByb3ZpZGVzIHNvbWUgbmljZSBjb2xvciB2YXJpYXRpb25cbi8vIEFjY2VwdHMgYW4gcmdiYSBvYmplY3Rcbi8vIHJldHVybnMgYSBtb2RpZmllZCByZ2JhIG9iamVjdCBvciBhIHJnYmEgc3RyaW5nIGlmIHRydWUgaXMgcGFzc2VkIGluIGZvciBhcmd1bWVudCAyXG5jb25zdCBjb2xvclZhcmlhdGlvbiA9IGZ1bmN0aW9uIChjb2xvciwgcmV0dXJuU3RyaW5nKSB7XG5cbiAgICB2YXIgcixnLGIsYSwgdmFyaWF0aW9uO1xuICAgIHIgPSBNYXRoLnJvdW5kKCgoTWF0aC5yYW5kb20oKSAqIGNvbmZpZy5jb2xvclZhcmlhdGlvbikgLSAoY29uZmlnLmNvbG9yVmFyaWF0aW9uLzIpKSArIGNvbG9yLnIpO1xuICAgIGcgPSBNYXRoLnJvdW5kKCgoTWF0aC5yYW5kb20oKSAqIGNvbmZpZy5jb2xvclZhcmlhdGlvbikgLSAoY29uZmlnLmNvbG9yVmFyaWF0aW9uLzIpKSArIGNvbG9yLmcpO1xuICAgIGIgPSBNYXRoLnJvdW5kKCgoTWF0aC5yYW5kb20oKSAqIGNvbmZpZy5jb2xvclZhcmlhdGlvbikgLSAoY29uZmlnLmNvbG9yVmFyaWF0aW9uLzIpKSArIGNvbG9yLmIpO1xuICAgIGEgPSBNYXRoLnJhbmRvbSgpICsgLjU7XG4gICAgaWYgKHJldHVyblN0cmluZykge1xuICAgICAgICByZXR1cm4gXCJyZ2JhKFwiICsgciArIFwiLFwiICsgZyArIFwiLFwiICsgYiArIFwiLFwiICsgYSArIFwiKVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7cixnLGIsYX07XG4gICAgfVxufTtcblxuLy8gVXNlZCB0byBmaW5kIHRoZSByb2NrcyBuZXh0IHBvaW50IGluIHNwYWNlLCBhY2NvdW50aW5nIGZvciBzcGVlZCBhbmQgZGlyZWN0aW9uXG5jb25zdCB1cGRhdGVQYXJ0aWNsZU1vZGVsID0gZnVuY3Rpb24gKHApIHtcblxuICAgIHZhciBhID0gMTgwIC0gKHAuZCArIDkwKTsgLy8gZmluZCB0aGUgM3JkIGFuZ2xlXG4gICAgcC5kID4gMCAmJiBwLmQgPCAxODAgPyBwLnggKz0gcC5zICogTWF0aC5zaW4ocC5kKSAvIE1hdGguc2luKHAucykgOiBwLnggLT0gcC5zICogTWF0aC5zaW4ocC5kKSAvIE1hdGguc2luKHAucyk7XG4gICAgcC5kID4gOTAgJiYgcC5kIDwgMjcwID8gcC55ICs9IHAucyAqIE1hdGguc2luKGEpIC8gTWF0aC5zaW4ocC5zKSA6IHAueSAtPSBwLnMgKiBNYXRoLnNpbihhKSAvIE1hdGguc2luKHAucyk7XG4gICAgcmV0dXJuIHA7XG59O1xuXG5jb25zdCB0YWNvSW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG50YWNvSW1nLnNyYyA9ICcvcHVibGljL3RhY28ucG5nJztcblxuLy8gSnVzdCB0aGUgZnVuY3Rpb24gdGhhdCBwaHlzaWNhbGx5IGRyYXdzIHRoZSBwYXJ0aWNsZXNcbi8vIFBoeXNpY2FsbHk/IHN1cmUgd2h5IG5vdCwgcGh5c2ljYWxseS5cbmNvbnN0IGRyYXdQYXJ0aWNsZSA9IGZ1bmN0aW9uICh4LCB5LCByLCBjKSB7XG5cbiAgICBjb25zdCBzaXplID0gciAqIDI7XG5cbiAgICAvLyBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknOyAvLyBjb3B5IHBpeGVsLXRvLXBpeGVsIHNvdXJjZSBpbWFnZVxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInO1xuICAgIGN0eC5kcmF3SW1hZ2UodGFjb0ltZywgeCwgeSwgc2l6ZSwgc2l6ZSk7XG4gICAgLy8gY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG4gICAgLy8gY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdtdWx0aXBseSc7IC8vIG11bHRpcGx5IGl0IGJ5IGNvbG9yXG4gICAgLy8gY3R4LmZpbGxTdHlsZSA9IGM7XG4gICAgLy8gY3R4LmZpbGxTdHlsZSA9ICcjZmYwMDAwJztcbiAgICAvLyBjdHguZmlsbFJlY3QoeCwgeSwgc2l6ZSwgc2l6ZSk7XG4gICAgLy8gY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1hdG9wJzsgLy8gcmVzdG9yZSB0cmFuc3BhcmVuY3lcbiAgICAvLyBjdHguZHJhd0ltYWdlKHRhY29JbWcsIHgsIHksIHNpemUsIHNpemUpO1xuICAgIC8vIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInO1xufTtcblxuLy8gUmVtb3ZlIHBhcnRpY2xlcyB0aGF0IGFyZW4ndCBvbiB0aGUgY2FudmFzXG5jb25zdCBjbGVhblVwQXJyYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgcGFydGljbGVzID0gcGFydGljbGVzLmZpbHRlcigocCkgPT4ge1xuICAgICAgcmV0dXJuIChwLnggPiAtMTAwICYmIHAueSA+IC0xMDApO1xuICAgIH0pO1xufTtcblxuY29uc3QgaW5pdFBhcnRpY2xlcyA9IGZ1bmN0aW9uIChudW1QYXJ0aWNsZXMsIHgsIHkpIHtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtUGFydGljbGVzOyBpKyspIHtcbiAgICAgICAgcGFydGljbGVzLnB1c2gobmV3IFBhcnRpY2xlKHgsIHkpKTtcbiAgICB9XG5cbiAgICBwYXJ0aWNsZXMuZm9yRWFjaCgocCkgPT4ge1xuXG4gICAgICAgIGRyYXdQYXJ0aWNsZShwLngsIHAueSwgcC5yLCBwLmMpO1xuICAgIH0pO1xufTtcblxuLy8gVGhhdCB0aGluZ1xud2luZG93LnJlcXVlc3RBbmltRnJhbWUgPSAoKCkgPT4ge1xuXG4gIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKTtcbiAgICAgfTtcbn0pKCk7XG5cbi8vIE91ciBGcmFtZSBmdW5jdGlvblxuY29uc3QgZnJhbWUgPSAoKSA9PiB7XG4gIC8vIERyYXcgYmFja2dyb3VuZCBmaXJzdFxuICBkcmF3QmcoY3R4LCBjb2xvclBhbGV0dGUuYmcpO1xuICAvLyBVcGRhdGUgUGFydGljbGUgbW9kZWxzIHRvIG5ldyBwb3NpdGlvblxuICBwYXJ0aWNsZXMubWFwKChwKSA9PiB7XG4gICAgcmV0dXJuIHVwZGF0ZVBhcnRpY2xlTW9kZWwocCk7XG4gIH0pO1xuICAvLyBEcmF3IGVtJ1xuICBwYXJ0aWNsZXMuZm9yRWFjaCgocCkgPT4ge1xuXG4gICAgICAgIGRyYXdQYXJ0aWNsZShwLngsIHAueSwgcC5yLCBwLmMpO1xuICB9KTtcbiAgLy8gUGxheSB0aGUgc2FtZSBzb25nPyBPayFcbiAgd2luZG93LnJlcXVlc3RBbmltRnJhbWUoZnJhbWUpO1xufTtcblxuLy8gRmlyc3QgRnJhbWVcbmZyYW1lKCk7XG5cbi8vIEZpcnN0IHBhcnRpY2xlIGV4cGxvc2lvblxuaW5pdFBhcnRpY2xlcyhjb25maWcucGFydGljbGVOdW1iZXIpO1xuXG5leHBvcnRzLmdlblBhcnRpY2xlcyA9ICh4LCB5KSA9PiB7XG5cbiAgICBjbGVhblVwQXJyYXkoKTtcbiAgICBpbml0UGFydGljbGVzKGNvbmZpZy5wYXJ0aWNsZU51bWJlciwgeCwgeSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKlxuICAgIChoYXBpKW5lcyBXZWJTb2NrZXQgQ2xpZW50IChodHRwczovL2dpdGh1Yi5jb20vaGFwaWpzL25lcylcbiAgICBDb3B5cmlnaHQgKGMpIDIwMTUtMjAxNiwgRXJhbiBIYW1tZXIgPGVyYW5AaGFtbWVyLmlvPiBhbmQgb3RoZXIgY29udHJpYnV0b3JzXG4gICAgQlNEIExpY2Vuc2VkXG4qL1xuXG4vKiBlc2xpbnQgbm8tdW5kZWY6IDAgKi9cblxuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG5cbiAgICAvLyAkbGFiOmNvdmVyYWdlOm9mZiRcblxuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7ICAgICAgICAgICAgICAgICAvLyBFeHBvcnQgaWYgdXNlZCBhcyBhIG1vZHVsZVxuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZXhwb3J0cy5uZXMgPSBmYWN0b3J5KCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByb290Lm5lcyA9IGZhY3RvcnkoKTtcbiAgICB9XG5cbiAgICAvLyAkbGFiOmNvdmVyYWdlOm9uJFxuXG59KSgvKiAkbGFiOmNvdmVyYWdlOm9mZiQgKi8gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWwgLyogJGxhYjpjb3ZlcmFnZTpvbiQgKi8sICgpID0+IHtcblxuICAgIC8vIFV0aWxpdGllc1xuXG4gICAgY29uc3QgdmVyc2lvbiA9ICcyJztcbiAgICBjb25zdCBpZ25vcmUgPSBmdW5jdGlvbiAoKSB7IH07XG5cbiAgICBjb25zdCBzdHJpbmdpZnkgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE5lc0Vycm9yKGVyciwgZXJyb3JUeXBlcy5VU0VSKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBuZXh0VGljayA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuXG4gICAgICAgIHJldHVybiAoZXJyKSA9PiB7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gY2FsbGJhY2soZXJyKSwgMCk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8vIE5lc0Vycm9yIHR5cGVzXG5cbiAgICBjb25zdCBlcnJvclR5cGVzID0ge1xuICAgICAgICBUSU1FT1VUOiAndGltZW91dCcsXG4gICAgICAgIERJU0NPTk5FQ1Q6ICdkaXNjb25uZWN0JyxcbiAgICAgICAgU0VSVkVSOiAnc2VydmVyJyxcbiAgICAgICAgUFJPVE9DT0w6ICdwcm90b2NvbCcsXG4gICAgICAgIFdTOiAnd3MnLFxuICAgICAgICBVU0VSOiAndXNlcidcbiAgICB9O1xuXG4gICAgY29uc3QgTmVzRXJyb3IgPSBmdW5jdGlvbiAoZXJyLCB0eXBlKSB7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBlcnIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBlcnIgPSBuZXcgRXJyb3IoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVyci50eXBlID0gdHlwZTtcbiAgICAgICAgZXJyLmlzTmVzID0gdHJ1ZTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhyb3cgZXJyOyAvLyBlbnN1cmUgc3RhY2sgdHJhY2UgZm9yIElFMTFcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAod2l0aFN0YWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gd2l0aFN0YWNrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEVycm9yIGNvZGVzXG5cbiAgICBjb25zdCBlcnJvckNvZGVzID0ge1xuICAgICAgICAxMDAwOiAnTm9ybWFsIGNsb3N1cmUnLFxuICAgICAgICAxMDAxOiAnR29pbmcgYXdheScsXG4gICAgICAgIDEwMDI6ICdQcm90b2NvbCBlcnJvcicsXG4gICAgICAgIDEwMDM6ICdVbnN1cHBvcnRlZCBkYXRhJyxcbiAgICAgICAgMTAwNDogJ1Jlc2VydmVkJyxcbiAgICAgICAgMTAwNTogJ05vIHN0YXR1cyByZWNlaXZlZCcsXG4gICAgICAgIDEwMDY6ICdBYm5vcm1hbCBjbG9zdXJlJyxcbiAgICAgICAgMTAwNzogJ0ludmFsaWQgZnJhbWUgcGF5bG9hZCBkYXRhJyxcbiAgICAgICAgMTAwODogJ1BvbGljeSB2aW9sYXRpb24nLFxuICAgICAgICAxMDA5OiAnTWVzc2FnZSB0b28gYmlnJyxcbiAgICAgICAgMTAxMDogJ01hbmRhdG9yeSBleHRlbnNpb24nLFxuICAgICAgICAxMDExOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyxcbiAgICAgICAgMTAxNTogJ1RMUyBoYW5kc2hha2UnXG4gICAgfTtcblxuICAgIC8vIENsaWVudFxuXG4gICAgY29uc3QgQ2xpZW50ID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICAgIHRoaXMuX2lzQnJvd3NlciA9IHR5cGVvZiBXZWJTb2NrZXQgIT09ICd1bmRlZmluZWQnO1xuXG4gICAgICAgIGlmICghdGhpcy5faXNCcm93c2VyKSB7XG4gICAgICAgICAgICBvcHRpb25zLndzID0gb3B0aW9ucy53cyB8fCB7fTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud3MubWF4UGF5bG9hZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy53cy5tYXhQYXlsb2FkID0gMDsgICAgICAgICAgICAgIC8vIE92ZXJyaWRlIGRlZmF1bHQgMTAwTWIgbGltaXQgaW4gd3MgbW9kdWxlIHRvIGF2b2lkIGJyZWFraW5nIGNoYW5nZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29uZmlndXJhdGlvblxuXG4gICAgICAgIHRoaXMuX3VybCA9IHVybDtcbiAgICAgICAgdGhpcy5fc2V0dGluZ3MgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0ID0gZmFsc2U7ICAgICAgICAgICAgIC8vIFNlcnZlciBoZWFydGJlYXQgY29uZmlndXJhdGlvblxuXG4gICAgICAgIC8vIFN0YXRlXG5cbiAgICAgICAgdGhpcy5fd3MgPSBudWxsO1xuICAgICAgICB0aGlzLl9yZWNvbm5lY3Rpb24gPSBudWxsO1xuICAgICAgICB0aGlzLl9yZWNvbm5lY3Rpb25UaW1lciA9IG51bGw7XG4gICAgICAgIHRoaXMuX2lkcyA9IDA7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWQgY291bnRlclxuICAgICAgICB0aGlzLl9yZXF1ZXN0cyA9IHt9OyAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlkIC0+IHsgcmVzb2x2ZSwgcmVqZWN0LCB0aW1lb3V0IH1cbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IHt9OyAgICAgICAgICAgICAgICAgICAvLyBwYXRoIC0+IFtjYWxsYmFja3NdXG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdCA9IG51bGw7XG4gICAgICAgIHRoaXMuX3BhY2tldHMgPSBbXTtcbiAgICAgICAgdGhpcy5fZGlzY29ubmVjdExpc3RlbmVycyA9IG51bGw7XG4gICAgICAgIHRoaXMuX2Rpc2Nvbm5lY3RSZXF1ZXN0ZWQgPSBmYWxzZTtcblxuICAgICAgICAvLyBFdmVudHNcblxuICAgICAgICB0aGlzLm9uRXJyb3IgPSAoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVycik7IC8vIEdlbmVyYWwgZXJyb3IgaGFuZGxlciAob25seSB3aGVuIGFuIGVycm9yIGNhbm5vdCBiZSBhc3NvY2lhdGVkIHdpdGggYSByZXF1ZXN0KVxuICAgICAgICB0aGlzLm9uQ29ubmVjdCA9IGlnbm9yZTsgICAgICAgICAgICAgICAgICAgIC8vIENhbGxlZCB3aGVuZXZlciBhIGNvbm5lY3Rpb24gaXMgZXN0YWJsaXNoZWRcbiAgICAgICAgdGhpcy5vbkRpc2Nvbm5lY3QgPSBpZ25vcmU7ICAgICAgICAgICAgICAgICAvLyBDYWxsZWQgd2hlbmV2ZXIgYSBjb25uZWN0aW9uIGlzIGxvc3Q6IGZ1bmN0aW9uKHdpbGxSZWNvbm5lY3QpXG4gICAgICAgIHRoaXMub25IZWFydGJlYXRUaW1lb3V0ID0gaWdub3JlOyAgICAgICAgICAgLy8gQ2FsbGVkIHdoZW4gYSBoZWFydGJlYXQgdGltZW91dCB3aWxsIGNhdXNlIGEgZGlzY29ubmVjdGlvblxuICAgICAgICB0aGlzLm9uVXBkYXRlID0gaWdub3JlO1xuXG4gICAgICAgIC8vIFB1YmxpYyBwcm9wZXJ0aWVzXG5cbiAgICAgICAgdGhpcy5pZCA9IG51bGw7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBc3NpZ25lZCB3aGVuIGhlbGxvIHJlc3BvbnNlIGlzIHJlY2VpdmVkXG4gICAgfTtcblxuICAgIENsaWVudC5XZWJTb2NrZXQgPSAvKiAkbGFiOmNvdmVyYWdlOm9mZiQgKi8gKHR5cGVvZiBXZWJTb2NrZXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IFdlYlNvY2tldCk7IC8qICRsYWI6Y292ZXJhZ2U6b24kICovXG5cbiAgICBDbGllbnQucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICAgIGlmICh0aGlzLl9yZWNvbm5lY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgTmVzRXJyb3IoJ0Nhbm5vdCBjb25uZWN0IHdoaWxlIGNsaWVudCBhdHRlbXB0cyB0byByZWNvbm5lY3QnLCBlcnJvclR5cGVzLlVTRVIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl93cykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBOZXNFcnJvcignQWxyZWFkeSBjb25uZWN0ZWQnLCBlcnJvclR5cGVzLlVTRVIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLnJlY29ubmVjdCAhPT0gZmFsc2UpIHsgICAgICAgICAgICAgICAgICAvLyBEZWZhdWx0cyB0byB0cnVlXG4gICAgICAgICAgICB0aGlzLl9yZWNvbm5lY3Rpb24gPSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcHRpb25zOiByZWNvbm5lY3QsIGRlbGF5LCBtYXhEZWxheVxuICAgICAgICAgICAgICAgIHdhaXQ6IDAsXG4gICAgICAgICAgICAgICAgZGVsYXk6IG9wdGlvbnMuZGVsYXkgfHwgMTAwMCwgICAgICAgICAgICAgICAvLyAxIHNlY29uZFxuICAgICAgICAgICAgICAgIG1heERlbGF5OiBvcHRpb25zLm1heERlbGF5IHx8IDUwMDAsICAgICAgICAgLy8gNSBzZWNvbmRzXG4gICAgICAgICAgICAgICAgcmV0cmllczogb3B0aW9ucy5yZXRyaWVzIHx8IEluZmluaXR5LCAgICAgICAvLyBVbmxpbWl0ZWRcbiAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICAgICAgICBhdXRoOiBvcHRpb25zLmF1dGgsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IG9wdGlvbnMudGltZW91dFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9yZWNvbm5lY3Rpb24gPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5fY29ubmVjdChvcHRpb25zLCB0cnVlLCAoZXJyKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLl9jb25uZWN0ID0gZnVuY3Rpb24gKG9wdGlvbnMsIGluaXRpYWwsIG5leHQpIHtcblxuICAgICAgICBjb25zdCB3cyA9IHRoaXMuX2lzQnJvd3NlciA/IG5ldyBDbGllbnQuV2ViU29ja2V0KHRoaXMuX3VybCkgOiBuZXcgQ2xpZW50LldlYlNvY2tldCh0aGlzLl91cmwsIHRoaXMuX3NldHRpbmdzLndzKTtcbiAgICAgICAgdGhpcy5fd3MgPSB3cztcblxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0aW9uVGltZXIpO1xuICAgICAgICB0aGlzLl9yZWNvbm5lY3Rpb25UaW1lciA9IG51bGw7XG5cbiAgICAgICAgY29uc3QgcmVjb25uZWN0ID0gKGV2ZW50KSA9PiB7XG5cbiAgICAgICAgICAgIGlmICh3cy5vbm9wZW4pIHtcbiAgICAgICAgICAgICAgICBmaW5hbGl6ZShuZXcgTmVzRXJyb3IoJ0Nvbm5lY3Rpb24gdGVybWluYXRlZCB3aGlsZSB3YWl0aW5nIHRvIGNvbm5lY3QnLCBlcnJvclR5cGVzLldTKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHdhc1JlcXVlc3RlZCA9IHRoaXMuX2Rpc2Nvbm5lY3RSZXF1ZXN0ZWQ7ICAgICAgICAgLy8gR2V0IHZhbHVlIGJlZm9yZSBfY2xlYW51cCgpXG5cbiAgICAgICAgICAgIHRoaXMuX2NsZWFudXAoKTtcblxuICAgICAgICAgICAgY29uc3QgbG9nID0ge1xuICAgICAgICAgICAgICAgIGNvZGU6IGV2ZW50LmNvZGUsXG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb246IGVycm9yQ29kZXNbZXZlbnQuY29kZV0gfHwgJ1Vua25vd24nLFxuICAgICAgICAgICAgICAgIHJlYXNvbjogZXZlbnQucmVhc29uLFxuICAgICAgICAgICAgICAgIHdhc0NsZWFuOiBldmVudC53YXNDbGVhbixcbiAgICAgICAgICAgICAgICB3aWxsUmVjb25uZWN0OiB0aGlzLl93aWxsUmVjb25uZWN0KCksXG4gICAgICAgICAgICAgICAgd2FzUmVxdWVzdGVkXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLm9uRGlzY29ubmVjdChsb2cud2lsbFJlY29ubmVjdCwgbG9nKTtcbiAgICAgICAgICAgIHRoaXMuX3JlY29ubmVjdCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGZpbmFsaXplID0gKGVycikgPT4ge1xuXG4gICAgICAgICAgICBpZiAobmV4dCkgeyAgICAgICAgICAgICAgICAgICAgIC8vIENhbGwgb25seSBvbmNlIHdoZW4gY29ubmVjdCgpIGlzIGNhbGxlZFxuICAgICAgICAgICAgICAgIGNvbnN0IG5leHRIb2xkZXIgPSBuZXh0O1xuICAgICAgICAgICAgICAgIG5leHQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXh0SG9sZGVyKGVycik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uRXJyb3IoZXJyKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB0aW1lb3V0SGFuZGxlciA9ICgpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5fY2xlYW51cCgpO1xuXG4gICAgICAgICAgICBmaW5hbGl6ZShuZXcgTmVzRXJyb3IoJ0Nvbm5lY3Rpb24gdGltZWQgb3V0JywgZXJyb3JUeXBlcy5USU1FT1VUKSk7XG5cbiAgICAgICAgICAgIGlmIChpbml0aWFsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlY29ubmVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHRpbWVvdXQgPSAob3B0aW9ucy50aW1lb3V0ID8gc2V0VGltZW91dCh0aW1lb3V0SGFuZGxlciwgb3B0aW9ucy50aW1lb3V0KSA6IG51bGwpO1xuXG4gICAgICAgIHdzLm9ub3BlbiA9ICgpID0+IHtcblxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgICAgd3Mub25vcGVuID0gbnVsbDtcblxuICAgICAgICAgICAgdGhpcy5faGVsbG8ob3B0aW9ucy5hdXRoKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQ29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBmaW5hbGl6ZSgpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyLnBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9zdWJzY3JpcHRpb25zW2Vyci5wYXRoXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2Nvbm5lY3QoKCkgPT4gbmV4dFRpY2soZmluYWxpemUpKGVyciksIHRydWUpOyAgICAgICAgIC8vIFN0b3AgcmVjb25uZWN0aW9uIHdoZW4gdGhlIGhlbGxvIG1lc3NhZ2UgcmV0dXJucyBlcnJvclxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHdzLm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcblxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5fd2lsbFJlY29ubmVjdCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY29ubmVjdChldmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2NsZWFudXAoKTtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IE5lc0Vycm9yKCdTb2NrZXQgZXJyb3InLCBlcnJvclR5cGVzLldTKTtcbiAgICAgICAgICAgIHJldHVybiBmaW5hbGl6ZShlcnJvcik7XG4gICAgICAgIH07XG5cbiAgICAgICAgd3Mub25jbG9zZSA9IHJlY29ubmVjdDtcblxuICAgICAgICB3cy5vbm1lc3NhZ2UgPSAobWVzc2FnZSkgPT4ge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb25NZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLm92ZXJyaWRlUmVjb25uZWN0aW9uQXV0aCA9IGZ1bmN0aW9uIChhdXRoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9yZWNvbm5lY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3JlY29ubmVjdGlvbi5zZXR0aW5ncy5hdXRoID0gYXV0aDtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUucmVhdXRoZW50aWNhdGUgPSBmdW5jdGlvbiAoYXV0aCkge1xuXG4gICAgICAgIHRoaXMub3ZlcnJpZGVSZWNvbm5lY3Rpb25BdXRoKGF1dGgpO1xuXG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICB0eXBlOiAncmVhdXRoJyxcbiAgICAgICAgICAgIGF1dGhcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fc2VuZChyZXF1ZXN0LCB0cnVlKTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gdGhpcy5fZGlzY29ubmVjdChyZXNvbHZlLCBmYWxzZSkpO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLl9kaXNjb25uZWN0ID0gZnVuY3Rpb24gKG5leHQsIGlzSW50ZXJuYWwpIHtcblxuICAgICAgICB0aGlzLl9yZWNvbm5lY3Rpb24gPSBudWxsO1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0aW9uVGltZXIpO1xuICAgICAgICB0aGlzLl9yZWNvbm5lY3Rpb25UaW1lciA9IG51bGw7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RlZCA9IHRoaXMuX2Rpc2Nvbm5lY3RSZXF1ZXN0ZWQgfHwgIWlzSW50ZXJuYWw7ICAgICAgIC8vIFJldGFpbiB0cnVlXG5cbiAgICAgICAgaWYgKHRoaXMuX2Rpc2Nvbm5lY3RMaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIHRoaXMuX2Rpc2Nvbm5lY3RSZXF1ZXN0ZWQgPSByZXF1ZXN0ZWQ7XG4gICAgICAgICAgICB0aGlzLl9kaXNjb25uZWN0TGlzdGVuZXJzLnB1c2gobmV4dCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX3dzIHx8XG4gICAgICAgICAgICAodGhpcy5fd3MucmVhZHlTdGF0ZSAhPT0gQ2xpZW50LldlYlNvY2tldC5PUEVOICYmIHRoaXMuX3dzLnJlYWR5U3RhdGUgIT09IENsaWVudC5XZWJTb2NrZXQuQ09OTkVDVElORykpIHtcblxuICAgICAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2Rpc2Nvbm5lY3RSZXF1ZXN0ZWQgPSByZXF1ZXN0ZWQ7XG4gICAgICAgIHRoaXMuX2Rpc2Nvbm5lY3RMaXN0ZW5lcnMgPSBbbmV4dF07XG4gICAgICAgIHRoaXMuX3dzLmNsb3NlKCk7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuX2NsZWFudXAgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX3dzKSB7XG4gICAgICAgICAgICBjb25zdCB3cyA9IHRoaXMuX3dzO1xuICAgICAgICAgICAgdGhpcy5fd3MgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAod3MucmVhZHlTdGF0ZSAhPT0gQ2xpZW50LldlYlNvY2tldC5DTE9TRUQgJiZcbiAgICAgICAgICAgICAgICB3cy5yZWFkeVN0YXRlICE9PSBDbGllbnQuV2ViU29ja2V0LkNMT1NJTkcpIHtcblxuICAgICAgICAgICAgICAgIHdzLmNsb3NlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdzLm9ub3BlbiA9IG51bGw7XG4gICAgICAgICAgICB3cy5vbmNsb3NlID0gbnVsbDtcbiAgICAgICAgICAgIHdzLm9uZXJyb3IgPSBpZ25vcmU7XG4gICAgICAgICAgICB3cy5vbm1lc3NhZ2UgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcGFja2V0cyA9IFtdO1xuICAgICAgICB0aGlzLmlkID0gbnVsbDtcblxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5faGVhcnRiZWF0KTtcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0ID0gbnVsbDtcblxuICAgICAgICAvLyBGbHVzaCBwZW5kaW5nIHJlcXVlc3RzXG5cbiAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgTmVzRXJyb3IoJ1JlcXVlc3QgZmFpbGVkIC0gc2VydmVyIGRpc2Nvbm5lY3RlZCcsIGVycm9yVHlwZXMuRElTQ09OTkVDVCk7XG5cbiAgICAgICAgY29uc3QgcmVxdWVzdHMgPSB0aGlzLl9yZXF1ZXN0cztcbiAgICAgICAgdGhpcy5fcmVxdWVzdHMgPSB7fTtcbiAgICAgICAgY29uc3QgaWRzID0gT2JqZWN0LmtleXMocmVxdWVzdHMpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlkcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBpZHNbaV07XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0ID0gcmVxdWVzdHNbaWRdO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHJlcXVlc3QudGltZW91dCk7XG4gICAgICAgICAgICByZXF1ZXN0LnJlamVjdChlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fZGlzY29ubmVjdExpc3RlbmVycykge1xuICAgICAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fZGlzY29ubmVjdExpc3RlbmVycztcbiAgICAgICAgICAgIHRoaXMuX2Rpc2Nvbm5lY3RMaXN0ZW5lcnMgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fZGlzY29ubmVjdFJlcXVlc3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgbGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcigpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLl9yZWNvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgLy8gUmVjb25uZWN0XG5cbiAgICAgICAgY29uc3QgcmVjb25uZWN0aW9uID0gdGhpcy5fcmVjb25uZWN0aW9uO1xuICAgICAgICBpZiAoIXJlY29ubmVjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlY29ubmVjdGlvbi5yZXRyaWVzIDwgMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Rpc2Nvbm5lY3QoaWdub3JlLCB0cnVlKTsgICAgICAvLyBDbGVhciBfcmVjb25uZWN0aW9uIHN0YXRlXG4gICAgICAgIH1cblxuICAgICAgICAtLXJlY29ubmVjdGlvbi5yZXRyaWVzO1xuICAgICAgICByZWNvbm5lY3Rpb24ud2FpdCA9IHJlY29ubmVjdGlvbi53YWl0ICsgcmVjb25uZWN0aW9uLmRlbGF5O1xuXG4gICAgICAgIGNvbnN0IHRpbWVvdXQgPSBNYXRoLm1pbihyZWNvbm5lY3Rpb24ud2FpdCwgcmVjb25uZWN0aW9uLm1heERlbGF5KTtcblxuICAgICAgICB0aGlzLl9yZWNvbm5lY3Rpb25UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0KHJlY29ubmVjdGlvbi5zZXR0aW5ncywgZmFsc2UsIChlcnIpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZWNvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdGltZW91dCk7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHBhdGg6IG9wdGlvbnNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ3JlcXVlc3QnLFxuICAgICAgICAgICAgbWV0aG9kOiBvcHRpb25zLm1ldGhvZCB8fCAnR0VUJyxcbiAgICAgICAgICAgIHBhdGg6IG9wdGlvbnMucGF0aCxcbiAgICAgICAgICAgIGhlYWRlcnM6IG9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIHBheWxvYWQ6IG9wdGlvbnMucGF5bG9hZFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZW5kKHJlcXVlc3QsIHRydWUpO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLm1lc3NhZ2UgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuXG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICB0eXBlOiAnbWVzc2FnZScsXG4gICAgICAgICAgICBtZXNzYWdlXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmQocmVxdWVzdCwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuX2lzUmVhZHkgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3dzICYmIHRoaXMuX3dzLnJlYWR5U3RhdGUgPT09IENsaWVudC5XZWJTb2NrZXQuT1BFTjtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5fc2VuZCA9IGZ1bmN0aW9uIChyZXF1ZXN0LCB0cmFjaykge1xuXG4gICAgICAgIGlmICghdGhpcy5faXNSZWFkeSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IE5lc0Vycm9yKCdGYWlsZWQgdG8gc2VuZCBtZXNzYWdlIC0gc2VydmVyIGRpc2Nvbm5lY3RlZCcsIGVycm9yVHlwZXMuRElTQ09OTkVDVCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5pZCA9ICsrdGhpcy5faWRzO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgZW5jb2RlZCA9IHN0cmluZ2lmeShyZXF1ZXN0KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElnbm9yZSBlcnJvcnNcblxuICAgICAgICBpZiAoIXRyYWNrKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3dzLnNlbmQoZW5jb2RlZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgTmVzRXJyb3IoZXJyLCBlcnJvclR5cGVzLldTKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUcmFjayBlcnJvcnNcblxuICAgICAgICBjb25zdCByZWNvcmQgPSB7XG4gICAgICAgICAgICByZXNvbHZlOiBudWxsLFxuICAgICAgICAgICAgcmVqZWN0OiBudWxsLFxuICAgICAgICAgICAgdGltZW91dDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgIHJlY29yZC5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIHJlY29yZC5yZWplY3QgPSByZWplY3Q7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLl9zZXR0aW5ncy50aW1lb3V0KSB7XG4gICAgICAgICAgICByZWNvcmQudGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgcmVjb3JkLnRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWNvcmQucmVqZWN0KG5ldyBOZXNFcnJvcignUmVxdWVzdCB0aW1lZCBvdXQnLCBlcnJvclR5cGVzLlRJTUVPVVQpKTtcbiAgICAgICAgICAgIH0sIHRoaXMuX3NldHRpbmdzLnRpbWVvdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcmVxdWVzdHNbcmVxdWVzdC5pZF0gPSByZWNvcmQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuX3dzLnNlbmQoZW5jb2RlZCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlcXVlc3RzW3JlcXVlc3QuaWRdLnRpbWVvdXQpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3JlcXVlc3RzW3JlcXVlc3QuaWRdO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBOZXNFcnJvcihlcnIsIGVycm9yVHlwZXMuV1MpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLl9oZWxsbyA9IGZ1bmN0aW9uIChhdXRoKSB7XG5cbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdoZWxsbycsXG4gICAgICAgICAgICB2ZXJzaW9uXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGF1dGgpIHtcbiAgICAgICAgICAgIHJlcXVlc3QuYXV0aCA9IGF1dGg7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdWJzID0gdGhpcy5zdWJzY3JpcHRpb25zKCk7XG4gICAgICAgIGlmIChzdWJzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVxdWVzdC5zdWJzID0gc3VicztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZW5kKHJlcXVlc3QsIHRydWUpO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLnN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX3N1YnNjcmlwdGlvbnMpO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uIChwYXRoLCBoYW5kbGVyKSB7XG5cbiAgICAgICAgaWYgKCFwYXRoIHx8XG4gICAgICAgICAgICBwYXRoWzBdICE9PSAnLycpIHtcblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBOZXNFcnJvcignSW52YWxpZCBwYXRoJywgZXJyb3JUeXBlcy5VU0VSKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdWJzID0gdGhpcy5fc3Vic2NyaXB0aW9uc1twYXRoXTtcbiAgICAgICAgaWYgKHN1YnMpIHtcblxuICAgICAgICAgICAgLy8gQWxyZWFkeSBzdWJzY3JpYmVkXG5cbiAgICAgICAgICAgIGlmIChzdWJzLmluZGV4T2YoaGFuZGxlcikgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgc3Vicy5wdXNoKGhhbmRsZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zW3BhdGhdID0gW2hhbmRsZXJdO1xuXG4gICAgICAgIGlmICghdGhpcy5faXNSZWFkeSgpKSB7XG5cbiAgICAgICAgICAgIC8vIFF1ZXVlZCBzdWJzY3JpcHRpb25cblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdzdWInLFxuICAgICAgICAgICAgcGF0aFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSB0aGlzLl9zZW5kKHJlcXVlc3QsIHRydWUpO1xuICAgICAgICBwcm9taXNlLmNhdGNoKChpZ25vcmVFcnIpID0+IHtcblxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3N1YnNjcmlwdGlvbnNbcGF0aF07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24gKHBhdGgsIGhhbmRsZXIpIHtcblxuICAgICAgICBpZiAoIXBhdGggfHxcbiAgICAgICAgICAgIHBhdGhbMF0gIT09ICcvJykge1xuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IE5lc0Vycm9yKCdJbnZhbGlkIHBhdGgnLCBlcnJvclR5cGVzLlVTRVIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN1YnMgPSB0aGlzLl9zdWJzY3JpcHRpb25zW3BhdGhdO1xuICAgICAgICBpZiAoIXN1YnMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzeW5jID0gZmFsc2U7XG4gICAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3N1YnNjcmlwdGlvbnNbcGF0aF07XG4gICAgICAgICAgICBzeW5jID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IHN1YnMuaW5kZXhPZihoYW5kbGVyKTtcbiAgICAgICAgICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdWJzLnNwbGljZShwb3MsIDEpO1xuICAgICAgICAgICAgaWYgKCFzdWJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9zdWJzY3JpcHRpb25zW3BhdGhdO1xuICAgICAgICAgICAgICAgIHN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzeW5jIHx8XG4gICAgICAgICAgICAhdGhpcy5faXNSZWFkeSgpKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICB0eXBlOiAndW5zdWInLFxuICAgICAgICAgICAgcGF0aFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSB0aGlzLl9zZW5kKHJlcXVlc3QsIHRydWUpO1xuICAgICAgICBwcm9taXNlLmNhdGNoKGlnbm9yZSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmluZyBlcnJvcnMgYXMgdGhlIHN1YnNjcmlwdGlvbiBoYW5kbGVycyBhcmUgYWxyZWFkeSByZW1vdmVkXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLl9vbk1lc3NhZ2UgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuXG4gICAgICAgIHRoaXMuX2JlYXQoKTtcblxuICAgICAgICBsZXQgZGF0YSA9IG1lc3NhZ2UuZGF0YTtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gZGF0YVswXTtcbiAgICAgICAgaWYgKHByZWZpeCAhPT0gJ3snKSB7XG4gICAgICAgICAgICB0aGlzLl9wYWNrZXRzLnB1c2goZGF0YS5zbGljZSgxKSk7XG4gICAgICAgICAgICBpZiAocHJlZml4ICE9PSAnIScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9wYWNrZXRzLmpvaW4oJycpO1xuICAgICAgICAgICAgdGhpcy5fcGFja2V0cyA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX3BhY2tldHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLl9wYWNrZXRzID0gW107XG4gICAgICAgICAgICB0aGlzLm9uRXJyb3IobmV3IE5lc0Vycm9yKCdSZWNlaXZlZCBhbiBpbmNvbXBsZXRlIG1lc3NhZ2UnLCBlcnJvclR5cGVzLlBST1RPQ09MKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHVwZGF0ZSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub25FcnJvcihuZXcgTmVzRXJyb3IoZXJyLCBlcnJvclR5cGVzLlBST1RPQ09MKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWNyZWF0ZSBlcnJvclxuXG4gICAgICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgICAgIGlmICh1cGRhdGUuc3RhdHVzQ29kZSAmJlxuICAgICAgICAgICAgdXBkYXRlLnN0YXR1c0NvZGUgPj0gNDAwKSB7XG5cbiAgICAgICAgICAgIGVycm9yID0gbmV3IE5lc0Vycm9yKHVwZGF0ZS5wYXlsb2FkLm1lc3NhZ2UgfHwgdXBkYXRlLnBheWxvYWQuZXJyb3IgfHwgJ0Vycm9yJywgZXJyb3JUeXBlcy5TRVJWRVIpO1xuICAgICAgICAgICAgZXJyb3Iuc3RhdHVzQ29kZSA9IHVwZGF0ZS5zdGF0dXNDb2RlO1xuICAgICAgICAgICAgZXJyb3IuZGF0YSA9IHVwZGF0ZS5wYXlsb2FkO1xuICAgICAgICAgICAgZXJyb3IuaGVhZGVycyA9IHVwZGF0ZS5oZWFkZXJzO1xuICAgICAgICAgICAgZXJyb3IucGF0aCA9IHVwZGF0ZS5wYXRoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUGluZ1xuXG4gICAgICAgIGlmICh1cGRhdGUudHlwZSA9PT0gJ3BpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2VuZCh7IHR5cGU6ICdwaW5nJyB9LCBmYWxzZSkuY2F0Y2goaWdub3JlKTsgICAgICAgICAvLyBJZ25vcmUgZXJyb3JzXG4gICAgICAgIH1cblxuICAgICAgICAvLyBCcm9hZGNhc3QgYW5kIHVwZGF0ZVxuXG4gICAgICAgIGlmICh1cGRhdGUudHlwZSA9PT0gJ3VwZGF0ZScpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uVXBkYXRlKHVwZGF0ZS5tZXNzYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFB1Ymxpc2ggb3IgUmV2b2tlXG5cbiAgICAgICAgaWYgKHVwZGF0ZS50eXBlID09PSAncHViJyB8fFxuICAgICAgICAgICAgdXBkYXRlLnR5cGUgPT09ICdyZXZva2UnKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5fc3Vic2NyaXB0aW9uc1t1cGRhdGUucGF0aF07XG4gICAgICAgICAgICBpZiAodXBkYXRlLnR5cGUgPT09ICdyZXZva2UnKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3N1YnNjcmlwdGlvbnNbdXBkYXRlLnBhdGhdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaGFuZGxlcnMgJiZcbiAgICAgICAgICAgICAgICB1cGRhdGUubWVzc2FnZSAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBmbGFncyA9IHt9O1xuICAgICAgICAgICAgICAgIGlmICh1cGRhdGUudHlwZSA9PT0gJ3Jldm9rZScpIHtcbiAgICAgICAgICAgICAgICAgICAgZmxhZ3MucmV2b2tlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1tpXSh1cGRhdGUubWVzc2FnZSwgZmxhZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9va3VwIHJlcXVlc3QgKG1lc3NhZ2UgbXVzdCBpbmNsdWRlIGFuIGlkIGZyb20gdGhpcyBwb2ludClcblxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gdGhpcy5fcmVxdWVzdHNbdXBkYXRlLmlkXTtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbkVycm9yKG5ldyBOZXNFcnJvcignUmVjZWl2ZWQgcmVzcG9uc2UgZm9yIHVua25vd24gcmVxdWVzdCcsIGVycm9yVHlwZXMuUFJPVE9DT0wpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsZWFyVGltZW91dChyZXF1ZXN0LnRpbWVvdXQpO1xuICAgICAgICBkZWxldGUgdGhpcy5fcmVxdWVzdHNbdXBkYXRlLmlkXTtcblxuICAgICAgICBjb25zdCBuZXh0ID0gKGVyciwgYXJncykgPT4ge1xuXG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0LnJlc29sdmUoYXJncyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmVzcG9uc2VcblxuICAgICAgICBpZiAodXBkYXRlLnR5cGUgPT09ICdyZXF1ZXN0Jykge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQoZXJyb3IsIHsgcGF5bG9hZDogdXBkYXRlLnBheWxvYWQsIHN0YXR1c0NvZGU6IHVwZGF0ZS5zdGF0dXNDb2RlLCBoZWFkZXJzOiB1cGRhdGUuaGVhZGVycyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEN1c3RvbSBtZXNzYWdlXG5cbiAgICAgICAgaWYgKHVwZGF0ZS50eXBlID09PSAnbWVzc2FnZScpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0KGVycm9yLCB7IHBheWxvYWQ6IHVwZGF0ZS5tZXNzYWdlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXV0aGVudGljYXRpb25cblxuICAgICAgICBpZiAodXBkYXRlLnR5cGUgPT09ICdoZWxsbycpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSB1cGRhdGUuc29ja2V0O1xuICAgICAgICAgICAgaWYgKHVwZGF0ZS5oZWFydGJlYXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0ID0gdXBkYXRlLmhlYXJ0YmVhdC5pbnRlcnZhbCArIHVwZGF0ZS5oZWFydGJlYXQudGltZW91dDtcbiAgICAgICAgICAgICAgICB0aGlzLl9iZWF0KCk7ICAgICAgICAgICAvLyBDYWxsIGFnYWluIG9uY2UgdGltZW91dCBpcyBzZXRcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5leHQoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHVwZGF0ZS50eXBlID09PSAncmVhdXRoJykge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQoZXJyb3IsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3Vic2NyaXB0aW9uc1xuXG4gICAgICAgIGlmICh1cGRhdGUudHlwZSA9PT0gJ3N1YicgfHxcbiAgICAgICAgICAgIHVwZGF0ZS50eXBlID09PSAndW5zdWInKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXh0KGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5leHQobmV3IE5lc0Vycm9yKCdSZWNlaXZlZCBpbnZhbGlkIHJlc3BvbnNlJywgZXJyb3JUeXBlcy5QUk9UT0NPTCkpO1xuICAgICAgICByZXR1cm4gdGhpcy5vbkVycm9yKG5ldyBOZXNFcnJvcignUmVjZWl2ZWQgdW5rbm93biByZXNwb25zZSB0eXBlOiAnICsgdXBkYXRlLnR5cGUsIGVycm9yVHlwZXMuUFJPVE9DT0wpKTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5fYmVhdCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBpZiAoIXRoaXMuX2hlYXJ0YmVhdFRpbWVvdXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXQpO1xuXG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLm9uRXJyb3IobmV3IE5lc0Vycm9yKCdEaXNjb25uZWN0aW5nIGR1ZSB0byBoZWFydGJlYXQgdGltZW91dCcsIGVycm9yVHlwZXMuVElNRU9VVCkpO1xuICAgICAgICAgICAgdGhpcy5vbkhlYXJ0YmVhdFRpbWVvdXQodGhpcy5fd2lsbFJlY29ubmVjdCgpKTtcbiAgICAgICAgICAgIHRoaXMuX3dzLmNsb3NlKCk7XG4gICAgICAgIH0sIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXQpO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLl93aWxsUmVjb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHJldHVybiAhISh0aGlzLl9yZWNvbm5lY3Rpb24gJiYgdGhpcy5fcmVjb25uZWN0aW9uLnJldHJpZXMgPj0gMSk7XG4gICAgfTtcblxuICAgIC8vIEV4cG9zZSBpbnRlcmZhY2VcblxuICAgIHJldHVybiB7IENsaWVudCB9O1xufSk7XG4iLCIvKipcbiAqIGxvZGFzaCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cHM6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgZXhwb3J0cz1cIm5wbVwiIC1vIC4vYFxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnMgPGh0dHBzOi8vanF1ZXJ5Lm9yZy8+XG4gKiBSZWxlYXNlZCB1bmRlciBNSVQgbGljZW5zZSA8aHR0cHM6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuOC4zIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKi9cblxuLyoqIFVzZWQgYXMgdGhlIGBUeXBlRXJyb3JgIG1lc3NhZ2UgZm9yIFwiRnVuY3Rpb25zXCIgbWV0aG9kcy4gKi9cbnZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE5BTiA9IDAgLyAwO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UuICovXG52YXIgcmVUcmltID0gL15cXHMrfFxccyskL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiYWQgc2lnbmVkIGhleGFkZWNpbWFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JhZEhleCA9IC9eWy0rXTB4WzAtOWEtZl0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmluYXJ5IHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JpbmFyeSA9IC9eMGJbMDFdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG9jdGFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc09jdGFsID0gL14wb1swLTddKyQvaTtcblxuLyoqIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHdpdGhvdXQgYSBkZXBlbmRlbmN5IG9uIGByb290YC4gKi9cbnZhciBmcmVlUGFyc2VJbnQgPSBwYXJzZUludDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4LFxuICAgIG5hdGl2ZU1pbiA9IE1hdGgubWluO1xuXG4vKipcbiAqIEdldHMgdGhlIHRpbWVzdGFtcCBvZiB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGF0IGhhdmUgZWxhcHNlZCBzaW5jZVxuICogdGhlIFVuaXggZXBvY2ggKDEgSmFudWFyeSAxOTcwIDAwOjAwOjAwIFVUQykuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjQuMFxuICogQGNhdGVnb3J5IERhdGVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIHRpbWVzdGFtcC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5kZWZlcihmdW5jdGlvbihzdGFtcCkge1xuICogICBjb25zb2xlLmxvZyhfLm5vdygpIC0gc3RhbXApO1xuICogfSwgXy5ub3coKSk7XG4gKiAvLyA9PiBMb2dzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGl0IHRvb2sgZm9yIHRoZSBkZWZlcnJlZCBpbnZvY2F0aW9uLlxuICovXG52YXIgbm93ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiByb290LkRhdGUubm93KCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBkZWJvdW5jZWQgZnVuY3Rpb24gdGhhdCBkZWxheXMgaW52b2tpbmcgYGZ1bmNgIHVudGlsIGFmdGVyIGB3YWl0YFxuICogbWlsbGlzZWNvbmRzIGhhdmUgZWxhcHNlZCBzaW5jZSB0aGUgbGFzdCB0aW1lIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gd2FzXG4gKiBpbnZva2VkLiBUaGUgZGVib3VuY2VkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYCBtZXRob2QgdG8gY2FuY2VsXG4gKiBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0byBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS5cbiAqIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZVxuICogbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZFxuICogd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbi4gU3Vic2VxdWVudFxuICogY2FsbHMgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbiByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2BcbiAqIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8uZGVib3VuY2VgIGFuZCBgXy50aHJvdHRsZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPWZhbHNlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhXYWl0XVxuICogIFRoZSBtYXhpbXVtIHRpbWUgYGZ1bmNgIGlzIGFsbG93ZWQgdG8gYmUgZGVsYXllZCBiZWZvcmUgaXQncyBpbnZva2VkLlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBkZWJvdW5jZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGNvc3RseSBjYWxjdWxhdGlvbnMgd2hpbGUgdGhlIHdpbmRvdyBzaXplIGlzIGluIGZsdXguXG4gKiBqUXVlcnkod2luZG93KS5vbigncmVzaXplJywgXy5kZWJvdW5jZShjYWxjdWxhdGVMYXlvdXQsIDE1MCkpO1xuICpcbiAqIC8vIEludm9rZSBgc2VuZE1haWxgIHdoZW4gY2xpY2tlZCwgZGVib3VuY2luZyBzdWJzZXF1ZW50IGNhbGxzLlxuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIF8uZGVib3VuY2Uoc2VuZE1haWwsIDMwMCwge1xuICogICAnbGVhZGluZyc6IHRydWUsXG4gKiAgICd0cmFpbGluZyc6IGZhbHNlXG4gKiB9KSk7XG4gKlxuICogLy8gRW5zdXJlIGBiYXRjaExvZ2AgaXMgaW52b2tlZCBvbmNlIGFmdGVyIDEgc2Vjb25kIG9mIGRlYm91bmNlZCBjYWxscy5cbiAqIHZhciBkZWJvdW5jZWQgPSBfLmRlYm91bmNlKGJhdGNoTG9nLCAyNTAsIHsgJ21heFdhaXQnOiAxMDAwIH0pO1xuICogdmFyIHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSgnL3N0cmVhbScpO1xuICogalF1ZXJ5KHNvdXJjZSkub24oJ21lc3NhZ2UnLCBkZWJvdW5jZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgZGVib3VuY2VkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCBkZWJvdW5jZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGFzdEFyZ3MsXG4gICAgICBsYXN0VGhpcyxcbiAgICAgIG1heFdhaXQsXG4gICAgICByZXN1bHQsXG4gICAgICB0aW1lcklkLFxuICAgICAgbGFzdENhbGxUaW1lLFxuICAgICAgbGFzdEludm9rZVRpbWUgPSAwLFxuICAgICAgbGVhZGluZyA9IGZhbHNlLFxuICAgICAgbWF4aW5nID0gZmFsc2UsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgd2FpdCA9IHRvTnVtYmVyKHdhaXQpIHx8IDA7XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAhIW9wdGlvbnMubGVhZGluZztcbiAgICBtYXhpbmcgPSAnbWF4V2FpdCcgaW4gb3B0aW9ucztcbiAgICBtYXhXYWl0ID0gbWF4aW5nID8gbmF0aXZlTWF4KHRvTnVtYmVyKG9wdGlvbnMubWF4V2FpdCkgfHwgMCwgd2FpdCkgOiBtYXhXYWl0O1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VGdW5jKHRpbWUpIHtcbiAgICB2YXIgYXJncyA9IGxhc3RBcmdzLFxuICAgICAgICB0aGlzQXJnID0gbGFzdFRoaXM7XG5cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBsZWFkaW5nRWRnZSh0aW1lKSB7XG4gICAgLy8gUmVzZXQgYW55IGBtYXhXYWl0YCB0aW1lci5cbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgLy8gU3RhcnQgdGhlIHRpbWVyIGZvciB0aGUgdHJhaWxpbmcgZWRnZS5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIC8vIEludm9rZSB0aGUgbGVhZGluZyBlZGdlLlxuICAgIHJldHVybiBsZWFkaW5nID8gaW52b2tlRnVuYyh0aW1lKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbWFpbmluZ1dhaXQodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWUsXG4gICAgICAgIHJlc3VsdCA9IHdhaXQgLSB0aW1lU2luY2VMYXN0Q2FsbDtcblxuICAgIHJldHVybiBtYXhpbmcgPyBuYXRpdmVNaW4ocmVzdWx0LCBtYXhXYWl0IC0gdGltZVNpbmNlTGFzdEludm9rZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBzaG91bGRJbnZva2UodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWU7XG5cbiAgICAvLyBFaXRoZXIgdGhpcyBpcyB0aGUgZmlyc3QgY2FsbCwgYWN0aXZpdHkgaGFzIHN0b3BwZWQgYW5kIHdlJ3JlIGF0IHRoZVxuICAgIC8vIHRyYWlsaW5nIGVkZ2UsIHRoZSBzeXN0ZW0gdGltZSBoYXMgZ29uZSBiYWNrd2FyZHMgYW5kIHdlJ3JlIHRyZWF0aW5nXG4gICAgLy8gaXQgYXMgdGhlIHRyYWlsaW5nIGVkZ2UsIG9yIHdlJ3ZlIGhpdCB0aGUgYG1heFdhaXRgIGxpbWl0LlxuICAgIHJldHVybiAobGFzdENhbGxUaW1lID09PSB1bmRlZmluZWQgfHwgKHRpbWVTaW5jZUxhc3RDYWxsID49IHdhaXQpIHx8XG4gICAgICAodGltZVNpbmNlTGFzdENhbGwgPCAwKSB8fCAobWF4aW5nICYmIHRpbWVTaW5jZUxhc3RJbnZva2UgPj0gbWF4V2FpdCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGltZXJFeHBpcmVkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgaWYgKHNob3VsZEludm9rZSh0aW1lKSkge1xuICAgICAgcmV0dXJuIHRyYWlsaW5nRWRnZSh0aW1lKTtcbiAgICB9XG4gICAgLy8gUmVzdGFydCB0aGUgdGltZXIuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCByZW1haW5pbmdXYWl0KHRpbWUpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyYWlsaW5nRWRnZSh0aW1lKSB7XG4gICAgdGltZXJJZCA9IHVuZGVmaW5lZDtcblxuICAgIC8vIE9ubHkgaW52b2tlIGlmIHdlIGhhdmUgYGxhc3RBcmdzYCB3aGljaCBtZWFucyBgZnVuY2AgaGFzIGJlZW5cbiAgICAvLyBkZWJvdW5jZWQgYXQgbGVhc3Qgb25jZS5cbiAgICBpZiAodHJhaWxpbmcgJiYgbGFzdEFyZ3MpIHtcbiAgICAgIHJldHVybiBpbnZva2VGdW5jKHRpbWUpO1xuICAgIH1cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgaWYgKHRpbWVySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgIH1cbiAgICBsYXN0SW52b2tlVGltZSA9IDA7XG4gICAgbGFzdEFyZ3MgPSBsYXN0Q2FsbFRpbWUgPSBsYXN0VGhpcyA9IHRpbWVySWQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICByZXR1cm4gdGltZXJJZCA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogdHJhaWxpbmdFZGdlKG5vdygpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlYm91bmNlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpLFxuICAgICAgICBpc0ludm9raW5nID0gc2hvdWxkSW52b2tlKHRpbWUpO1xuXG4gICAgbGFzdEFyZ3MgPSBhcmd1bWVudHM7XG4gICAgbGFzdFRoaXMgPSB0aGlzO1xuICAgIGxhc3RDYWxsVGltZSA9IHRpbWU7XG5cbiAgICBpZiAoaXNJbnZva2luZykge1xuICAgICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbGVhZGluZ0VkZ2UobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhpbmcpIHtcbiAgICAgICAgLy8gSGFuZGxlIGludm9jYXRpb25zIGluIGEgdGlnaHQgbG9vcC5cbiAgICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAgICAgcmV0dXJuIGludm9rZUZ1bmMobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBkZWJvdW5jZWQuY2FuY2VsID0gY2FuY2VsO1xuICBkZWJvdW5jZWQuZmx1c2ggPSBmbHVzaDtcbiAgcmV0dXJuIGRlYm91bmNlZDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgdGhyb3R0bGVkIGZ1bmN0aW9uIHRoYXQgb25seSBpbnZva2VzIGBmdW5jYCBhdCBtb3N0IG9uY2UgcGVyXG4gKiBldmVyeSBgd2FpdGAgbWlsbGlzZWNvbmRzLiBUaGUgdGhyb3R0bGVkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYFxuICogbWV0aG9kIHRvIGNhbmNlbCBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0b1xuICogaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgXG4gKiBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGUgbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgXG4gKiB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWQgd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlXG4gKiB0aHJvdHRsZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnQgY2FsbHMgdG8gdGhlIHRocm90dGxlZCBmdW5jdGlvbiByZXR1cm4gdGhlXG4gKiByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8udGhyb3R0bGVgIGFuZCBgXy5kZWJvdW5jZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB0aHJvdHRsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB0aHJvdHRsZSBpbnZvY2F0aW9ucyB0by5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyB0aHJvdHRsZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGV4Y2Vzc2l2ZWx5IHVwZGF0aW5nIHRoZSBwb3NpdGlvbiB3aGlsZSBzY3JvbGxpbmcuXG4gKiBqUXVlcnkod2luZG93KS5vbignc2Nyb2xsJywgXy50aHJvdHRsZSh1cGRhdGVQb3NpdGlvbiwgMTAwKSk7XG4gKlxuICogLy8gSW52b2tlIGByZW5ld1Rva2VuYCB3aGVuIHRoZSBjbGljayBldmVudCBpcyBmaXJlZCwgYnV0IG5vdCBtb3JlIHRoYW4gb25jZSBldmVyeSA1IG1pbnV0ZXMuXG4gKiB2YXIgdGhyb3R0bGVkID0gXy50aHJvdHRsZShyZW5ld1Rva2VuLCAzMDAwMDAsIHsgJ3RyYWlsaW5nJzogZmFsc2UgfSk7XG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgdGhyb3R0bGVkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIHRocm90dGxlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgdGhyb3R0bGVkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIHRocm90dGxlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxlYWRpbmcgPSB0cnVlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAnbGVhZGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy5sZWFkaW5nIDogbGVhZGluZztcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG4gIHJldHVybiBkZWJvdW5jZShmdW5jLCB3YWl0LCB7XG4gICAgJ2xlYWRpbmcnOiBsZWFkaW5nLFxuICAgICdtYXhXYWl0Jzogd2FpdCxcbiAgICAndHJhaWxpbmcnOiB0cmFpbGluZ1xuICB9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAhIXZhbHVlICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBudW1iZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBudW1iZXIuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udG9OdW1iZXIoMy4yKTtcbiAqIC8vID0+IDMuMlxuICpcbiAqIF8udG9OdW1iZXIoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiA1ZS0zMjRcbiAqXG4gKiBfLnRvTnVtYmVyKEluZmluaXR5KTtcbiAqIC8vID0+IEluZmluaXR5XG4gKlxuICogXy50b051bWJlcignMy4yJyk7XG4gKiAvLyA9PiAzLjJcbiAqL1xuZnVuY3Rpb24gdG9OdW1iZXIodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIE5BTjtcbiAgfVxuICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgdmFyIG90aGVyID0gdHlwZW9mIHZhbHVlLnZhbHVlT2YgPT0gJ2Z1bmN0aW9uJyA/IHZhbHVlLnZhbHVlT2YoKSA6IHZhbHVlO1xuICAgIHZhbHVlID0gaXNPYmplY3Qob3RoZXIpID8gKG90aGVyICsgJycpIDogb3RoZXI7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gMCA/IHZhbHVlIDogK3ZhbHVlO1xuICB9XG4gIHZhbHVlID0gdmFsdWUucmVwbGFjZShyZVRyaW0sICcnKTtcbiAgdmFyIGlzQmluYXJ5ID0gcmVJc0JpbmFyeS50ZXN0KHZhbHVlKTtcbiAgcmV0dXJuIChpc0JpbmFyeSB8fCByZUlzT2N0YWwudGVzdCh2YWx1ZSkpXG4gICAgPyBmcmVlUGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIGlzQmluYXJ5ID8gMiA6IDgpXG4gICAgOiAocmVJc0JhZEhleC50ZXN0KHZhbHVlKSA/IE5BTiA6ICt2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGhyb3R0bGU7XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnZhciBydW50aW1lID0gKGZ1bmN0aW9uIChleHBvcnRzKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBPcCA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBoYXNPd24gPSBPcC5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciAkU3ltYm9sID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sIDoge307XG4gIHZhciBpdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG4gIHZhciBhc3luY0l0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5hc3luY0l0ZXJhdG9yIHx8IFwiQEBhc3luY0l0ZXJhdG9yXCI7XG4gIHZhciB0b1N0cmluZ1RhZ1N5bWJvbCA9ICRTeW1ib2wudG9TdHJpbmdUYWcgfHwgXCJAQHRvU3RyaW5nVGFnXCI7XG5cbiAgZnVuY3Rpb24gZGVmaW5lKG9iaiwga2V5LCB2YWx1ZSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIG9ialtrZXldO1xuICB9XG4gIHRyeSB7XG4gICAgLy8gSUUgOCBoYXMgYSBicm9rZW4gT2JqZWN0LmRlZmluZVByb3BlcnR5IHRoYXQgb25seSB3b3JrcyBvbiBET00gb2JqZWN0cy5cbiAgICBkZWZpbmUoe30sIFwiXCIpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBkZWZpbmUgPSBmdW5jdGlvbihvYmosIGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBvYmpba2V5XSA9IHZhbHVlO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gSWYgb3V0ZXJGbiBwcm92aWRlZCBhbmQgb3V0ZXJGbi5wcm90b3R5cGUgaXMgYSBHZW5lcmF0b3IsIHRoZW4gb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IuXG4gICAgdmFyIHByb3RvR2VuZXJhdG9yID0gb3V0ZXJGbiAmJiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvciA/IG91dGVyRm4gOiBHZW5lcmF0b3I7XG4gICAgdmFyIGdlbmVyYXRvciA9IE9iamVjdC5jcmVhdGUocHJvdG9HZW5lcmF0b3IucHJvdG90eXBlKTtcbiAgICB2YXIgY29udGV4dCA9IG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKTtcblxuICAgIC8vIFRoZSAuX2ludm9rZSBtZXRob2QgdW5pZmllcyB0aGUgaW1wbGVtZW50YXRpb25zIG9mIHRoZSAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMuXG4gICAgZ2VuZXJhdG9yLl9pbnZva2UgPSBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuXG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfVxuICBleHBvcnRzLndyYXAgPSB3cmFwO1xuXG4gIC8vIFRyeS9jYXRjaCBoZWxwZXIgdG8gbWluaW1pemUgZGVvcHRpbWl6YXRpb25zLiBSZXR1cm5zIGEgY29tcGxldGlvblxuICAvLyByZWNvcmQgbGlrZSBjb250ZXh0LnRyeUVudHJpZXNbaV0uY29tcGxldGlvbi4gVGhpcyBpbnRlcmZhY2UgY291bGRcbiAgLy8gaGF2ZSBiZWVuIChhbmQgd2FzIHByZXZpb3VzbHkpIGRlc2lnbmVkIHRvIHRha2UgYSBjbG9zdXJlIHRvIGJlXG4gIC8vIGludm9rZWQgd2l0aG91dCBhcmd1bWVudHMsIGJ1dCBpbiBhbGwgdGhlIGNhc2VzIHdlIGNhcmUgYWJvdXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGFuIGV4aXN0aW5nIG1ldGhvZCB3ZSB3YW50IHRvIGNhbGwsIHNvIHRoZXJlJ3Mgbm8gbmVlZFxuICAvLyB0byBjcmVhdGUgYSBuZXcgZnVuY3Rpb24gb2JqZWN0LiBXZSBjYW4gZXZlbiBnZXQgYXdheSB3aXRoIGFzc3VtaW5nXG4gIC8vIHRoZSBtZXRob2QgdGFrZXMgZXhhY3RseSBvbmUgYXJndW1lbnQsIHNpbmNlIHRoYXQgaGFwcGVucyB0byBiZSB0cnVlXG4gIC8vIGluIGV2ZXJ5IGNhc2UsIHNvIHdlIGRvbid0IGhhdmUgdG8gdG91Y2ggdGhlIGFyZ3VtZW50cyBvYmplY3QuIFRoZVxuICAvLyBvbmx5IGFkZGl0aW9uYWwgYWxsb2NhdGlvbiByZXF1aXJlZCBpcyB0aGUgY29tcGxldGlvbiByZWNvcmQsIHdoaWNoXG4gIC8vIGhhcyBhIHN0YWJsZSBzaGFwZSBhbmQgc28gaG9wZWZ1bGx5IHNob3VsZCBiZSBjaGVhcCB0byBhbGxvY2F0ZS5cbiAgZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9iaiwgYXJnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibm9ybWFsXCIsIGFyZzogZm4uY2FsbChvYmosIGFyZykgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwidGhyb3dcIiwgYXJnOiBlcnIgfTtcbiAgICB9XG4gIH1cblxuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRTdGFydCA9IFwic3VzcGVuZGVkU3RhcnRcIjtcbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkWWllbGQgPSBcInN1c3BlbmRlZFlpZWxkXCI7XG4gIHZhciBHZW5TdGF0ZUV4ZWN1dGluZyA9IFwiZXhlY3V0aW5nXCI7XG4gIHZhciBHZW5TdGF0ZUNvbXBsZXRlZCA9IFwiY29tcGxldGVkXCI7XG5cbiAgLy8gUmV0dXJuaW5nIHRoaXMgb2JqZWN0IGZyb20gdGhlIGlubmVyRm4gaGFzIHRoZSBzYW1lIGVmZmVjdCBhc1xuICAvLyBicmVha2luZyBvdXQgb2YgdGhlIGRpc3BhdGNoIHN3aXRjaCBzdGF0ZW1lbnQuXG4gIHZhciBDb250aW51ZVNlbnRpbmVsID0ge307XG5cbiAgLy8gRHVtbXkgY29uc3RydWN0b3IgZnVuY3Rpb25zIHRoYXQgd2UgdXNlIGFzIHRoZSAuY29uc3RydWN0b3IgYW5kXG4gIC8vIC5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgcHJvcGVydGllcyBmb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIEdlbmVyYXRvclxuICAvLyBvYmplY3RzLiBGb3IgZnVsbCBzcGVjIGNvbXBsaWFuY2UsIHlvdSBtYXkgd2lzaCB0byBjb25maWd1cmUgeW91clxuICAvLyBtaW5pZmllciBub3QgdG8gbWFuZ2xlIHRoZSBuYW1lcyBvZiB0aGVzZSB0d28gZnVuY3Rpb25zLlxuICBmdW5jdGlvbiBHZW5lcmF0b3IoKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge31cblxuICAvLyBUaGlzIGlzIGEgcG9seWZpbGwgZm9yICVJdGVyYXRvclByb3RvdHlwZSUgZm9yIGVudmlyb25tZW50cyB0aGF0XG4gIC8vIGRvbid0IG5hdGl2ZWx5IHN1cHBvcnQgaXQuXG4gIHZhciBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuICBkZWZpbmUoSXRlcmF0b3JQcm90b3R5cGUsIGl0ZXJhdG9yU3ltYm9sLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0pO1xuXG4gIHZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbiAgdmFyIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG8gJiYgZ2V0UHJvdG8oZ2V0UHJvdG8odmFsdWVzKFtdKSkpO1xuICBpZiAoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgJiZcbiAgICAgIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICE9PSBPcCAmJlxuICAgICAgaGFzT3duLmNhbGwoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUsIGl0ZXJhdG9yU3ltYm9sKSkge1xuICAgIC8vIFRoaXMgZW52aXJvbm1lbnQgaGFzIGEgbmF0aXZlICVJdGVyYXRvclByb3RvdHlwZSU7IHVzZSBpdCBpbnN0ZWFkXG4gICAgLy8gb2YgdGhlIHBvbHlmaWxsLlxuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gTmF0aXZlSXRlcmF0b3JQcm90b3R5cGU7XG4gIH1cblxuICB2YXIgR3AgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUgPVxuICAgIEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlKTtcbiAgR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIGRlZmluZShHcCwgXCJjb25zdHJ1Y3RvclwiLCBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSk7XG4gIGRlZmluZShHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSwgXCJjb25zdHJ1Y3RvclwiLCBHZW5lcmF0b3JGdW5jdGlvbik7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gZGVmaW5lKFxuICAgIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLFxuICAgIHRvU3RyaW5nVGFnU3ltYm9sLFxuICAgIFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICApO1xuXG4gIC8vIEhlbHBlciBmb3IgZGVmaW5pbmcgdGhlIC5uZXh0LCAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMgb2YgdGhlXG4gIC8vIEl0ZXJhdG9yIGludGVyZmFjZSBpbiB0ZXJtcyBvZiBhIHNpbmdsZSAuX2ludm9rZSBtZXRob2QuXG4gIGZ1bmN0aW9uIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhwcm90b3R5cGUpIHtcbiAgICBbXCJuZXh0XCIsIFwidGhyb3dcIiwgXCJyZXR1cm5cIl0uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIGRlZmluZShwcm90b3R5cGUsIG1ldGhvZCwgZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2UobWV0aG9kLCBhcmcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICB2YXIgY3RvciA9IHR5cGVvZiBnZW5GdW4gPT09IFwiZnVuY3Rpb25cIiAmJiBnZW5GdW4uY29uc3RydWN0b3I7XG4gICAgcmV0dXJuIGN0b3JcbiAgICAgID8gY3RvciA9PT0gR2VuZXJhdG9yRnVuY3Rpb24gfHxcbiAgICAgICAgLy8gRm9yIHRoZSBuYXRpdmUgR2VuZXJhdG9yRnVuY3Rpb24gY29uc3RydWN0b3IsIHRoZSBiZXN0IHdlIGNhblxuICAgICAgICAvLyBkbyBpcyB0byBjaGVjayBpdHMgLm5hbWUgcHJvcGVydHkuXG4gICAgICAgIChjdG9yLmRpc3BsYXlOYW1lIHx8IGN0b3IubmFtZSkgPT09IFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICAgICAgOiBmYWxzZTtcbiAgfTtcblxuICBleHBvcnRzLm1hcmsgPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoZ2VuRnVuLCBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICAgIGRlZmluZShnZW5GdW4sIHRvU3RyaW5nVGFnU3ltYm9sLCBcIkdlbmVyYXRvckZ1bmN0aW9uXCIpO1xuICAgIH1cbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICAvLyBXaXRoaW4gdGhlIGJvZHkgb2YgYW55IGFzeW5jIGZ1bmN0aW9uLCBgYXdhaXQgeGAgaXMgdHJhbnNmb3JtZWQgdG9cbiAgLy8gYHlpZWxkIHJlZ2VuZXJhdG9yUnVudGltZS5hd3JhcCh4KWAsIHNvIHRoYXQgdGhlIHJ1bnRpbWUgY2FuIHRlc3RcbiAgLy8gYGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIilgIHRvIGRldGVybWluZSBpZiB0aGUgeWllbGRlZCB2YWx1ZSBpc1xuICAvLyBtZWFudCB0byBiZSBhd2FpdGVkLlxuICBleHBvcnRzLmF3cmFwID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHsgX19hd2FpdDogYXJnIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gQXN5bmNJdGVyYXRvcihnZW5lcmF0b3IsIFByb21pc2VJbXBsKSB7XG4gICAgZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChnZW5lcmF0b3JbbWV0aG9kXSwgZ2VuZXJhdG9yLCBhcmcpO1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgcmVqZWN0KHJlY29yZC5hcmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlICYmXG4gICAgICAgICAgICB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIikpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZUltcGwucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2VJbXBsLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24odW53cmFwcGVkKSB7XG4gICAgICAgICAgLy8gV2hlbiBhIHlpZWxkZWQgUHJvbWlzZSBpcyByZXNvbHZlZCwgaXRzIGZpbmFsIHZhbHVlIGJlY29tZXNcbiAgICAgICAgICAvLyB0aGUgLnZhbHVlIG9mIHRoZSBQcm9taXNlPHt2YWx1ZSxkb25lfT4gcmVzdWx0IGZvciB0aGVcbiAgICAgICAgICAvLyBjdXJyZW50IGl0ZXJhdGlvbi5cbiAgICAgICAgICByZXN1bHQudmFsdWUgPSB1bndyYXBwZWQ7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIC8vIElmIGEgcmVqZWN0ZWQgUHJvbWlzZSB3YXMgeWllbGRlZCwgdGhyb3cgdGhlIHJlamVjdGlvbiBiYWNrXG4gICAgICAgICAgLy8gaW50byB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBoYW5kbGVkIHRoZXJlLlxuICAgICAgICAgIHJldHVybiBpbnZva2UoXCJ0aHJvd1wiLCBlcnJvciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIGZ1bmN0aW9uIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2VJbXBsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcmV2aW91c1Byb21pc2UgPVxuICAgICAgICAvLyBJZiBlbnF1ZXVlIGhhcyBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gd2Ugd2FudCB0byB3YWl0IHVudGlsXG4gICAgICAgIC8vIGFsbCBwcmV2aW91cyBQcm9taXNlcyBoYXZlIGJlZW4gcmVzb2x2ZWQgYmVmb3JlIGNhbGxpbmcgaW52b2tlLFxuICAgICAgICAvLyBzbyB0aGF0IHJlc3VsdHMgYXJlIGFsd2F5cyBkZWxpdmVyZWQgaW4gdGhlIGNvcnJlY3Qgb3JkZXIuIElmXG4gICAgICAgIC8vIGVucXVldWUgaGFzIG5vdCBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gaXQgaXMgaW1wb3J0YW50IHRvXG4gICAgICAgIC8vIGNhbGwgaW52b2tlIGltbWVkaWF0ZWx5LCB3aXRob3V0IHdhaXRpbmcgb24gYSBjYWxsYmFjayB0byBmaXJlLFxuICAgICAgICAvLyBzbyB0aGF0IHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gaGFzIHRoZSBvcHBvcnR1bml0eSB0byBkb1xuICAgICAgICAvLyBhbnkgbmVjZXNzYXJ5IHNldHVwIGluIGEgcHJlZGljdGFibGUgd2F5LiBUaGlzIHByZWRpY3RhYmlsaXR5XG4gICAgICAgIC8vIGlzIHdoeSB0aGUgUHJvbWlzZSBjb25zdHJ1Y3RvciBzeW5jaHJvbm91c2x5IGludm9rZXMgaXRzXG4gICAgICAgIC8vIGV4ZWN1dG9yIGNhbGxiYWNrLCBhbmQgd2h5IGFzeW5jIGZ1bmN0aW9ucyBzeW5jaHJvbm91c2x5XG4gICAgICAgIC8vIGV4ZWN1dGUgY29kZSBiZWZvcmUgdGhlIGZpcnN0IGF3YWl0LiBTaW5jZSB3ZSBpbXBsZW1lbnQgc2ltcGxlXG4gICAgICAgIC8vIGFzeW5jIGZ1bmN0aW9ucyBpbiB0ZXJtcyBvZiBhc3luYyBnZW5lcmF0b3JzLCBpdCBpcyBlc3BlY2lhbGx5XG4gICAgICAgIC8vIGltcG9ydGFudCB0byBnZXQgdGhpcyByaWdodCwgZXZlbiB0aG91Z2ggaXQgcmVxdWlyZXMgY2FyZS5cbiAgICAgICAgcHJldmlvdXNQcm9taXNlID8gcHJldmlvdXNQcm9taXNlLnRoZW4oXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcsXG4gICAgICAgICAgLy8gQXZvaWQgcHJvcGFnYXRpbmcgZmFpbHVyZXMgdG8gUHJvbWlzZXMgcmV0dXJuZWQgYnkgbGF0ZXJcbiAgICAgICAgICAvLyBpbnZvY2F0aW9ucyBvZiB0aGUgaXRlcmF0b3IuXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmdcbiAgICAgICAgKSA6IGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCk7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSB1bmlmaWVkIGhlbHBlciBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGltcGxlbWVudCAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIChzZWUgZGVmaW5lSXRlcmF0b3JNZXRob2RzKS5cbiAgICB0aGlzLl9pbnZva2UgPSBlbnF1ZXVlO1xuICB9XG5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlKTtcbiAgZGVmaW5lKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlLCBhc3luY0l0ZXJhdG9yU3ltYm9sLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0pO1xuICBleHBvcnRzLkFzeW5jSXRlcmF0b3IgPSBBc3luY0l0ZXJhdG9yO1xuXG4gIC8vIE5vdGUgdGhhdCBzaW1wbGUgYXN5bmMgZnVuY3Rpb25zIGFyZSBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAgLy8gQXN5bmNJdGVyYXRvciBvYmplY3RzOyB0aGV5IGp1c3QgcmV0dXJuIGEgUHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9mXG4gIC8vIHRoZSBmaW5hbCByZXN1bHQgcHJvZHVjZWQgYnkgdGhlIGl0ZXJhdG9yLlxuICBleHBvcnRzLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QsIFByb21pc2VJbXBsKSB7XG4gICAgaWYgKFByb21pc2VJbXBsID09PSB2b2lkIDApIFByb21pc2VJbXBsID0gUHJvbWlzZTtcblxuICAgIHZhciBpdGVyID0gbmV3IEFzeW5jSXRlcmF0b3IoXG4gICAgICB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSxcbiAgICAgIFByb21pc2VJbXBsXG4gICAgKTtcblxuICAgIHJldHVybiBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIGNvbnRleHQuYXJnID0gYXJnO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgZGVsZWdhdGVSZXN1bHQgPSBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGNvbnRleHQuYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbCBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF0oY29udGV4dC5hcmcpIGFuZCBoYW5kbGUgdGhlXG4gIC8vIHJlc3VsdCwgZWl0aGVyIGJ5IHJldHVybmluZyBhIHsgdmFsdWUsIGRvbmUgfSByZXN1bHQgZnJvbSB0aGVcbiAgLy8gZGVsZWdhdGUgaXRlcmF0b3IsIG9yIGJ5IG1vZGlmeWluZyBjb250ZXh0Lm1ldGhvZCBhbmQgY29udGV4dC5hcmcsXG4gIC8vIHNldHRpbmcgY29udGV4dC5kZWxlZ2F0ZSB0byBudWxsLCBhbmQgcmV0dXJuaW5nIHRoZSBDb250aW51ZVNlbnRpbmVsLlxuICBmdW5jdGlvbiBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIG1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXTtcbiAgICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEEgLnRocm93IG9yIC5yZXR1cm4gd2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIC50aHJvd1xuICAgICAgLy8gbWV0aG9kIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAvLyBOb3RlOiBbXCJyZXR1cm5cIl0gbXVzdCBiZSB1c2VkIGZvciBFUzMgcGFyc2luZyBjb21wYXRpYmlsaXR5LlxuICAgICAgICBpZiAoZGVsZWdhdGUuaXRlcmF0b3JbXCJyZXR1cm5cIl0pIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIGEgcmV0dXJuIG1ldGhvZCwgZ2l2ZSBpdCBhXG4gICAgICAgICAgLy8gY2hhbmNlIHRvIGNsZWFuIHVwLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcblxuICAgICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICAvLyBJZiBtYXliZUludm9rZURlbGVnYXRlKGNvbnRleHQpIGNoYW5nZWQgY29udGV4dC5tZXRob2QgZnJvbVxuICAgICAgICAgICAgLy8gXCJyZXR1cm5cIiB0byBcInRocm93XCIsIGxldCB0aGF0IG92ZXJyaWRlIHRoZSBUeXBlRXJyb3IgYmVsb3cuXG4gICAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiVGhlIGl0ZXJhdG9yIGRvZXMgbm90IHByb3ZpZGUgYSAndGhyb3cnIG1ldGhvZFwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKG1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGNvbnRleHQuYXJnKTtcblxuICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuXG4gICAgaWYgKCEgaW5mbykge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXCJpdGVyYXRvciByZXN1bHQgaXMgbm90IGFuIG9iamVjdFwiKTtcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgLy8gQXNzaWduIHRoZSByZXN1bHQgb2YgdGhlIGZpbmlzaGVkIGRlbGVnYXRlIHRvIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIHZhcmlhYmxlIHNwZWNpZmllZCBieSBkZWxlZ2F0ZS5yZXN1bHROYW1lIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcblxuICAgICAgLy8gUmVzdW1lIGV4ZWN1dGlvbiBhdCB0aGUgZGVzaXJlZCBsb2NhdGlvbiAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcblxuICAgICAgLy8gSWYgY29udGV4dC5tZXRob2Qgd2FzIFwidGhyb3dcIiBidXQgdGhlIGRlbGVnYXRlIGhhbmRsZWQgdGhlXG4gICAgICAvLyBleGNlcHRpb24sIGxldCB0aGUgb3V0ZXIgZ2VuZXJhdG9yIHByb2NlZWQgbm9ybWFsbHkuIElmXG4gICAgICAvLyBjb250ZXh0Lm1ldGhvZCB3YXMgXCJuZXh0XCIsIGZvcmdldCBjb250ZXh0LmFyZyBzaW5jZSBpdCBoYXMgYmVlblxuICAgICAgLy8gXCJjb25zdW1lZFwiIGJ5IHRoZSBkZWxlZ2F0ZSBpdGVyYXRvci4gSWYgY29udGV4dC5tZXRob2Qgd2FzXG4gICAgICAvLyBcInJldHVyblwiLCBhbGxvdyB0aGUgb3JpZ2luYWwgLnJldHVybiBjYWxsIHRvIGNvbnRpbnVlIGluIHRoZVxuICAgICAgLy8gb3V0ZXIgZ2VuZXJhdG9yLlxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kICE9PSBcInJldHVyblwiKSB7XG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJlLXlpZWxkIHRoZSByZXN1bHQgcmV0dXJuZWQgYnkgdGhlIGRlbGVnYXRlIG1ldGhvZC5cbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH1cblxuICAgIC8vIFRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBpcyBmaW5pc2hlZCwgc28gZm9yZ2V0IGl0IGFuZCBjb250aW51ZSB3aXRoXG4gICAgLy8gdGhlIG91dGVyIGdlbmVyYXRvci5cbiAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgfVxuXG4gIC8vIERlZmluZSBHZW5lcmF0b3IucHJvdG90eXBlLntuZXh0LHRocm93LHJldHVybn0gaW4gdGVybXMgb2YgdGhlXG4gIC8vIHVuaWZpZWQgLl9pbnZva2UgaGVscGVyIG1ldGhvZC5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEdwKTtcblxuICBkZWZpbmUoR3AsIHRvU3RyaW5nVGFnU3ltYm9sLCBcIkdlbmVyYXRvclwiKTtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIGRlZmluZShHcCwgaXRlcmF0b3JTeW1ib2wsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9KTtcblxuICBkZWZpbmUoR3AsIFwidG9TdHJpbmdcIiwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KHRydWUpO1xuICB9XG5cbiAgZXhwb3J0cy5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIGV4cG9ydHMudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oc2tpcFRlbXBSZXNldCkge1xuICAgICAgdGhpcy5wcmV2ID0gMDtcbiAgICAgIHRoaXMubmV4dCA9IDA7XG4gICAgICAvLyBSZXNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgIHRoaXMuc2VudCA9IHRoaXMuX3NlbnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICBpZiAoIXNraXBUZW1wUmVzZXQpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzKSB7XG4gICAgICAgICAgLy8gTm90IHN1cmUgYWJvdXQgdGhlIG9wdGltYWwgb3JkZXIgb2YgdGhlc2UgY29uZGl0aW9uczpcbiAgICAgICAgICBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwidFwiICYmXG4gICAgICAgICAgICAgIGhhc093bi5jYWxsKHRoaXMsIG5hbWUpICYmXG4gICAgICAgICAgICAgICFpc05hTigrbmFtZS5zbGljZSgxKSkpIHtcbiAgICAgICAgICAgIHRoaXNbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgdmFyIHJvb3RFbnRyeSA9IHRoaXMudHJ5RW50cmllc1swXTtcbiAgICAgIHZhciByb290UmVjb3JkID0gcm9vdEVudHJ5LmNvbXBsZXRpb247XG4gICAgICBpZiAocm9vdFJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcm9vdFJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJ2YWw7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoRXhjZXB0aW9uOiBmdW5jdGlvbihleGNlcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHtcbiAgICAgICAgcmVjb3JkLnR5cGUgPSBcInRocm93XCI7XG4gICAgICAgIHJlY29yZC5hcmcgPSBleGNlcHRpb247XG4gICAgICAgIGNvbnRleHQubmV4dCA9IGxvYztcblxuICAgICAgICBpZiAoY2F1Z2h0KSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRpc3BhdGNoZWQgZXhjZXB0aW9uIHdhcyBjYXVnaHQgYnkgYSBjYXRjaCBibG9jayxcbiAgICAgICAgICAvLyB0aGVuIGxldCB0aGF0IGNhdGNoIGJsb2NrIGhhbmRsZSB0aGUgZXhjZXB0aW9uIG5vcm1hbGx5LlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gISEgY2F1Z2h0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gXCJyb290XCIpIHtcbiAgICAgICAgICAvLyBFeGNlcHRpb24gdGhyb3duIG91dHNpZGUgb2YgYW55IHRyeSBibG9jayB0aGF0IGNvdWxkIGhhbmRsZVxuICAgICAgICAgIC8vIGl0LCBzbyBzZXQgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgdGhlIGVudGlyZSBmdW5jdGlvbiB0b1xuICAgICAgICAgIC8vIHRocm93IHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZShcImVuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7XG4gICAgICAgICAgdmFyIGhhc0NhdGNoID0gaGFzT3duLmNhbGwoZW50cnksIFwiY2F0Y2hMb2NcIik7XG4gICAgICAgICAgdmFyIGhhc0ZpbmFsbHkgPSBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpO1xuXG4gICAgICAgICAgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhYnJ1cHQ6IGZ1bmN0aW9uKHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmXG4gICAgICAgICAgICB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgIHR5cGUgPT09IFwiY29udGludWVcIikgJiZcbiAgICAgICAgICBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJlxuICAgICAgICAgIGFyZyA8PSBmaW5hbGx5RW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAvLyBJZ25vcmUgdGhlIGZpbmFsbHkgZW50cnkgaWYgY29udHJvbCBpcyBub3QganVtcGluZyB0byBhXG4gICAgICAgIC8vIGxvY2F0aW9uIG91dHNpZGUgdGhlIHRyeS9jYXRjaCBibG9jay5cbiAgICAgICAgZmluYWxseUVudHJ5ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlY29yZCA9IGZpbmFsbHlFbnRyeSA/IGZpbmFsbHlFbnRyeS5jb21wbGV0aW9uIDoge307XG4gICAgICByZWNvcmQudHlwZSA9IHR5cGU7XG4gICAgICByZWNvcmQuYXJnID0gYXJnO1xuXG4gICAgICBpZiAoZmluYWxseUVudHJ5KSB7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIHRoaXMubmV4dCA9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jO1xuICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICB9LFxuXG4gICAgY29tcGxldGU6IGZ1bmN0aW9uKHJlY29yZCwgYWZ0ZXJMb2MpIHtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgcmVjb3JkLnR5cGUgPT09IFwiY29udGludWVcIikge1xuICAgICAgICB0aGlzLm5leHQgPSByZWNvcmQuYXJnO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICB0aGlzLnJ2YWwgPSB0aGlzLmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gXCJlbmRcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIgJiYgYWZ0ZXJMb2MpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gYWZ0ZXJMb2M7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uKGZpbmFsbHlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykge1xuICAgICAgICAgIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZVxuICAvLyBvciBub3QsIHJldHVybiB0aGUgcnVudGltZSBvYmplY3Qgc28gdGhhdCB3ZSBjYW4gZGVjbGFyZSB0aGUgdmFyaWFibGVcbiAgLy8gcmVnZW5lcmF0b3JSdW50aW1lIGluIHRoZSBvdXRlciBzY29wZSwgd2hpY2ggYWxsb3dzIHRoaXMgbW9kdWxlIHRvIGJlXG4gIC8vIGluamVjdGVkIGVhc2lseSBieSBgYmluL3JlZ2VuZXJhdG9yIC0taW5jbHVkZS1ydW50aW1lIHNjcmlwdC5qc2AuXG4gIHJldHVybiBleHBvcnRzO1xuXG59KFxuICAvLyBJZiB0aGlzIHNjcmlwdCBpcyBleGVjdXRpbmcgYXMgYSBDb21tb25KUyBtb2R1bGUsIHVzZSBtb2R1bGUuZXhwb3J0c1xuICAvLyBhcyB0aGUgcmVnZW5lcmF0b3JSdW50aW1lIG5hbWVzcGFjZS4gT3RoZXJ3aXNlIGNyZWF0ZSBhIG5ldyBlbXB0eVxuICAvLyBvYmplY3QuIEVpdGhlciB3YXksIHRoZSByZXN1bHRpbmcgb2JqZWN0IHdpbGwgYmUgdXNlZCB0byBpbml0aWFsaXplXG4gIC8vIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgdmFyaWFibGUgYXQgdGhlIHRvcCBvZiB0aGlzIGZpbGUuXG4gIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgPyBtb2R1bGUuZXhwb3J0cyA6IHt9XG4pKTtcblxudHJ5IHtcbiAgcmVnZW5lcmF0b3JSdW50aW1lID0gcnVudGltZTtcbn0gY2F0Y2ggKGFjY2lkZW50YWxTdHJpY3RNb2RlKSB7XG4gIC8vIFRoaXMgbW9kdWxlIHNob3VsZCBub3QgYmUgcnVubmluZyBpbiBzdHJpY3QgbW9kZSwgc28gdGhlIGFib3ZlXG4gIC8vIGFzc2lnbm1lbnQgc2hvdWxkIGFsd2F5cyB3b3JrIHVubGVzcyBzb21ldGhpbmcgaXMgbWlzY29uZmlndXJlZC4gSnVzdFxuICAvLyBpbiBjYXNlIHJ1bnRpbWUuanMgYWNjaWRlbnRhbGx5IHJ1bnMgaW4gc3RyaWN0IG1vZGUsIGluIG1vZGVybiBlbmdpbmVzXG4gIC8vIHdlIGNhbiBleHBsaWNpdGx5IGFjY2VzcyBnbG9iYWxUaGlzLiBJbiBvbGRlciBlbmdpbmVzIHdlIGNhbiBlc2NhcGVcbiAgLy8gc3RyaWN0IG1vZGUgdXNpbmcgYSBnbG9iYWwgRnVuY3Rpb24gY2FsbC4gVGhpcyBjb3VsZCBjb25jZWl2YWJseSBmYWlsXG4gIC8vIGlmIGEgQ29udGVudCBTZWN1cml0eSBQb2xpY3kgZm9yYmlkcyB1c2luZyBGdW5jdGlvbiwgYnV0IGluIHRoYXQgY2FzZVxuICAvLyB0aGUgcHJvcGVyIHNvbHV0aW9uIGlzIHRvIGZpeCB0aGUgYWNjaWRlbnRhbCBzdHJpY3QgbW9kZSBwcm9ibGVtLiBJZlxuICAvLyB5b3UndmUgbWlzY29uZmlndXJlZCB5b3VyIGJ1bmRsZXIgdG8gZm9yY2Ugc3RyaWN0IG1vZGUgYW5kIGFwcGxpZWQgYVxuICAvLyBDU1AgdG8gZm9yYmlkIEZ1bmN0aW9uLCBhbmQgeW91J3JlIG5vdCB3aWxsaW5nIHRvIGZpeCBlaXRoZXIgb2YgdGhvc2VcbiAgLy8gcHJvYmxlbXMsIHBsZWFzZSBkZXRhaWwgeW91ciB1bmlxdWUgcHJlZGljYW1lbnQgaW4gYSBHaXRIdWIgaXNzdWUuXG4gIGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gXCJvYmplY3RcIikge1xuICAgIGdsb2JhbFRoaXMucmVnZW5lcmF0b3JSdW50aW1lID0gcnVudGltZTtcbiAgfSBlbHNlIHtcbiAgICBGdW5jdGlvbihcInJcIiwgXCJyZWdlbmVyYXRvclJ1bnRpbWUgPSByXCIpKHJ1bnRpbWUpO1xuICB9XG59XG4iXX0=
