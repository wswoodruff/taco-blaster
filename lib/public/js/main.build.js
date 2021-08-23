(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _excluded = ["roomId", "userId"],
    _excluded2 = ["roomId", "userId"];

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require('regenerator-runtime');

var _require = require('./particles-on-click'),
    genParticles = _require.genParticles; // Sound offfff!!!!!!


console.log('TACOOOOOOOOOOOOOOOOOOOOS!!!');
var DEBUG = false;
var TACOS_ROOM_ID = 'tacos-n-friends';
var MY_TACO_ID = 'my-taco';
var MY_SCORE_ID = 'my-score';
var USE_NES = true;
var CURSOR_UPDATE_THROTTLE = 14; // 14 milliseconds — close to 16 which would be 60 fps

var Throttle = require('lodash.throttle');

var Nes;

if (USE_NES) {
  Nes = require('@hapi/nes/lib/client');
} // const RECONNECT_TIMEOUT = 1000; // in milliseconds


var RoomClient; // This will get set by the server on connection

var roomUserId = null;
var roomScoreboard = [];
var roomX = 0;
var roomY = 0; // let isMouseDown = false;

var lastClick = null;

var abbreviateUserId = function abbreviateUserId(userId) {
  return "...".concat((userId || '').split('-').pop());
};

var addIdToTacoIfNotExists = function addIdToTacoIfNotExists(el, id) {
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
  } else {
    idEl.textContent = abbreviateUserId(id);
  }
}; // Send room chat


var sendRoomChat = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref) {
    var roomId, userId, rest, payload, _yield$RoomClient$req, error;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            roomId = _ref.roomId, userId = _ref.userId, rest = _objectWithoutProperties(_ref, _excluded);
            payload = rest;

            if (userId) {
              payload.userId = userId;
            }

            _context.next = 5;
            return RoomClient.request({
              method: 'post',
              path: "/rooms/".concat(roomId, "/chat/update"),
              payload: payload
            });

          case 5:
            _yield$RoomClient$req = _context.sent;
            error = _yield$RoomClient$req.payload.error;

            if (error) {
              console.error(error);
            }

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function sendRoomChat(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var buildChatMessages = function buildChatMessages(_ref3) {
  var messages = _ref3.messages;
  return messages.map(function (_ref4, i) {
    var id = _ref4.id,
        userId = _ref4.userId,
        epoch = _ref4.epoch,
        msg = _ref4.msg;
    var msgFrom = document.createElement('div');
    msgFrom.innerText = abbreviateUserId(userId);
    msgFrom.classList.add('chat-msg-from');
    var msgTime = document.createElement('div');
    msgTime.innerText = new Date(epoch).toLocaleTimeString();
    msgTime.classList.add('chat-msg-time');
    var fromTimeContainer = document.createElement('div');
    fromTimeContainer.classList.add('from-time-container');
    fromTimeContainer.appendChild(msgFrom);
    fromTimeContainer.appendChild(msgTime);
    var message = document.createElement('div');
    message.innerText = msg;
    message.classList.add('chat-msg');
    var msgContainer = document.createElement('div');
    msgContainer.id = id;
    msgContainer.classList.add('chat-msg-container');

    if (userId === roomUserId) {
      msgContainer.classList.add('my-msg');
    }

    msgContainer.appendChild(fromTimeContainer);
    msgContainer.appendChild(message);
    return msgContainer;
  });
};

var updateChatRoomMessages = function updateChatRoomMessages(_ref5) {
  var roomId = _ref5.roomId,
      messages = _ref5.messages;
  var chatRoom = document.getElementById('chat-room');
  var chatRoomMessages;

  if (!chatRoom) {
    var _chatRoom = document.createElement('div');

    _chatRoom.id = 'chat-room';
    var chatRoomHeader = document.createElement('h3');
    chatRoomHeader.id = 'chat-room-header';
    chatRoomHeader.innerText = "".concat(roomId, " chat \u2014 be nice! =P");
    chatRoomMessages = document.createElement('div');
    chatRoomMessages.id = 'chat-room-messages';
    var chatInputContainer = document.createElement('div');
    var input = document.createElement('input');
    input.name = 'new-chat';
    input.autocomplete = 'new-password';
    input.id = 'chat-room-input';
    var submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.id = 'chat-room-submit';
    submitBtn.textContent = 'SUBMIT';
    var chatRoomForm = document.createElement('form');
    chatRoomForm.autocomplete = 'new-password';
    chatRoomForm.id = 'chat-room-form';
    chatRoomForm.appendChild(input);
    chatRoomForm.appendChild(submitBtn);

    chatRoomForm.onsubmit = function (evt) {
      evt.preventDefault();
      var chatInputEl = document.getElementById('chat-room-input');

      if (chatInputEl && chatInputEl.value) {
        sendRoomChat({
          roomId: roomId,
          userId: roomUserId,
          msg: chatInputEl.value
        }); // Clear out the input

        chatInputEl.value = '';
      }
    }; // Append chatRoomForm


    chatInputContainer.appendChild(chatRoomForm);

    _chatRoom.appendChild(chatRoomHeader);

    _chatRoom.appendChild(chatRoomMessages);

    _chatRoom.appendChild(chatInputContainer);

    document.body.appendChild(_chatRoom);
  }

  chatRoomMessages = document.querySelector('#chat-room-messages');
  var oldChatMsgContainers = Array.from(document.querySelectorAll('.chat-msg-container')); // Clear out contents

  chatRoomMessages.innerHTML = ''; // Rebuild before next repaint

  buildChatMessages({
    messages: messages
  }).forEach(function (el) {
    chatRoomMessages.appendChild(el);
  });
  var chatMsgContainers = document.querySelectorAll('.chat-msg-container');
  var lastMsg = Array.from(chatMsgContainers || []).pop();

  if (lastMsg) {
    lastMsg.scrollIntoView();
  }
}; // Upsert user in room


var updateRoom = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref6) {
    var roomId, userId, rest, payload, _yield$RoomClient$req2, _yield$RoomClient$req3, error, user, myTacoElEl, connectionMsg;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            roomId = _ref6.roomId, userId = _ref6.userId, rest = _objectWithoutProperties(_ref6, _excluded2);
            payload = rest;

            if (userId) {
              payload.id = userId;
            }

            _context2.next = 5;
            return RoomClient.request({
              method: 'post',
              path: "/rooms/".concat(roomId, "/update"),
              payload: payload
            });

          case 5:
            _yield$RoomClient$req2 = _context2.sent;
            _yield$RoomClient$req3 = _yield$RoomClient$req2.payload;
            error = _yield$RoomClient$req3.error;
            user = _yield$RoomClient$req3.user;

            if (user) {
              roomUserId = user.id;
              myTacoElEl = document.getElementById(MY_TACO_ID);
              addIdToTacoIfNotExists(myTacoElEl, roomUserId);
            } // Setup some kinda easy debugging or something


            connectionMsg = document.getElementById('connectionMsg') || document.createElement('h3');
            connectionMsg.id = 'connectionMsg';

            if (error) {
              // let err = document.createElement(`<h3 style='color: white;'>Error ${error.message}</h3>`);
              connectionMsg.style.color = '#f88070';
              connectionMsg.textContent = "Error ".concat(error.message || error);
            } else {
              connectionMsg.style.color = '#73c991';
              connectionMsg.textContent = "Connected x: ".concat(payload.x || 'null', " y: ").concat(payload.y || 'null');
            } // Add it


            document.body.appendChild(connectionMsg);
            return _context2.abrupt("return", user);

          case 15:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function updateRoom(_x2) {
    return _ref7.apply(this, arguments);
  };
}();

var throttledBroadcast = Throttle(function () {
  var update = {
    roomId: TACOS_ROOM_ID,
    userId: roomUserId,
    x: roomX,
    y: roomY
  };

  if (lastClick) {
    update.lastClick = lastClick;
  }

  updateRoom(update);
}, CURSOR_UPDATE_THROTTLE);
var myTacoEl = document.getElementById(MY_TACO_ID);
var myScoreEl = document.getElementById(MY_SCORE_ID); // Hot path

var moveCursor = function moveCursor(_ref8) {
  var element = _ref8.element,
      x = _ref8.x,
      y = _ref8.y;
  // Hopefully the 'px' at the end here will negate attempts to run a script
  element.style.left = "".concat(x, "px");
  element.style.top = "".concat(y, "px");
};

var updateScore = function updateScore(_ref9) {
  var element = _ref9.element,
      score = _ref9.score;

  if (!element) {
    console.warn('Score element not found');
    return;
  }

  element.textContent = score;
}; // We need this wrapper to make async/await nice to write


var initSocket = /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
    var _window, _window$location, protocol, host, url, wsLocation, connectionMsg, user, roomEl, clickTracker, roomUsers, onRoomUpdate;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!RoomClient) {
              _context3.next = 3;
              break;
            }

            _context3.next = 3;
            return RoomClient.disconnect();

          case 3:
            _window = window, _window$location = _window.location, protocol = _window$location.protocol, host = _window$location.host; // This will replace 'https' for 'ws' which will also leave 'wss' for 'https' protocols

            url = protocol.replace('http', 'ws') + '//' + host;
            wsLocation = url.replace('localhost:3001', 'localhost:3000');
            console.log('wsLocation', wsLocation);
            RoomClient = new Nes.Client(wsLocation);
            _context3.prev = 8;
            _context3.next = 11;
            return RoomClient.connect();

          case 11:
            _context3.next = 19;
            break;

          case 13:
            _context3.prev = 13;
            _context3.t0 = _context3["catch"](8);
            // Setup some kinda easy debugging or something
            connectionMsg = document.getElementById('connectionMsg') || document.createElement('h3');
            connectionMsg.id = 'connectionMsg';
            connectionMsg.style.color = '#f88070';
            connectionMsg.textContent = "Error ".concat(_context3.t0.message);

          case 19:
            _context3.next = 21;
            return updateRoom({
              roomId: TACOS_ROOM_ID,
              userId: roomUserId
            });

          case 21:
            user = _context3.sent;
            console.log('init user', user); // Init chat room

            updateChatRoomMessages({
              roomId: TACOS_ROOM_ID,
              messages: []
            });
            roomEl = document.querySelector('.room');
            clickTracker = {};
            roomUsers = {}; // Hot path, throttled server-side

            onRoomUpdate = function onRoomUpdate(props) {
              var _props$users = props.users,
                  users = _props$users === void 0 ? {} : _props$users,
                  isSync = props.isSync,
                  scoreboard = props.scoreboard,
                  shouldDeleteUsers = props.shouldDeleteUsers,
                  chat = props.chat;

              if (DEBUG) {
                console.log('onRoomUpdate', props);
              }

              if (chat) {
                updateChatRoomMessages({
                  roomId: TACOS_ROOM_ID,
                  messages: chat
                });
              }

              var ghostTacos = Array.from(document.getElementsByClassName('ghost-taco'));
              var remainingGhostTacos = ghostTacos; // isPartial

              if (shouldDeleteUsers) {
                Object.values(users).forEach(function (user) {
                  var maybeTaco = document.getElementById(user.id);

                  if (maybeTaco) {
                    // Remove this taco
                    roomEl.removeChild();
                  }
                });
                return;
              }

              if (isSync) {
                // Remove inactive tacos
                var userIds = Object.keys(users);
                ghostTacos.forEach(function (ghostTaco) {
                  if (!userIds.includes(ghostTaco.id)) {
                    // Remove this taco
                    roomEl.removeChild(ghostTaco);
                  } else {
                    remainingGhostTacos.push(ghostTaco);
                  }
                });
                roomUsers = users;
              }

              if (scoreboard) {
                var _roomScoreboard$find;

                roomScoreboard = scoreboard;
                var scoreboardEl = document.getElementById('scoreboard');
                scoreboardEl.innerHTML = "<h3>Scoreboard</h3>".concat(scoreboard.map(function (_ref11) {
                  var userId = _ref11.userId,
                      score = _ref11.score;
                  return "<p>".concat(abbreviateUserId(userId), ": ").concat(score, "</p>");
                }).join(''));
                var myScore = (_roomScoreboard$find = roomScoreboard.find(function (_ref12) {
                  var userId = _ref12.userId;
                  return userId === roomUserId;
                })) === null || _roomScoreboard$find === void 0 ? void 0 : _roomScoreboard$find.score;
                updateScore({
                  element: myScoreEl,
                  score: myScore
                });
              }

              var usersNotMe = Object.keys(users).filter(function (id) {
                return id !== roomUserId;
              }).map(function (id) {
                return users[id];
              });
              Object.values(usersNotMe).forEach(function (_ref13) {
                var userId = _ref13.id,
                    _ref13$lastClick = _ref13.lastClick;
                _ref13$lastClick = _ref13$lastClick === void 0 ? {} : _ref13$lastClick;
                var epoch = _ref13$lastClick.epoch,
                    x = _ref13$lastClick.x,
                    y = _ref13$lastClick.y;
                var userClicked = epoch;
                var lastUserClick = clickTracker[userId];
                var shouldGenParticles = false;

                if (userClicked && !lastUserClick || lastUserClick && userClicked > lastUserClick) {
                  shouldGenParticles = true;
                }

                if (shouldGenParticles) {
                  genParticles(x, y);
                }

                clickTracker[userId] = epoch;
              });
              var usersYesMe = users[Object.keys(users).find(function (id) {
                return id === roomUserId;
              })];
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
                  element: myTacoEl,
                  x: usersYesMe.x,
                  y: usersYesMe.y
                });
              }

              var getIds = function getIds(arr) {
                return arr.map(function (_ref14) {
                  var id = _ref14.id;
                  return id;
                });
              }; // Manage ghost tacos


              remainingGhostTacos.forEach(function (tacoEl) {
                var tacoUpdate = usersNotMe.find(function (_ref15) {
                  var id = _ref15.id;
                  return id === tacoEl.id;
                });

                if (tacoUpdate) {
                  var _roomScoreboard$find2;

                  moveCursor({
                    element: tacoEl,
                    x: tacoUpdate.x,
                    y: tacoUpdate.y
                  });
                  var tacoScore = document.getElementById("".concat(tacoEl.id, "-score"));
                  updateScore({
                    element: tacoScore,
                    score: (_roomScoreboard$find2 = roomScoreboard.find(function (_ref16) {
                      var userId = _ref16.userId;
                      return userId === tacoEl.id;
                    })) === null || _roomScoreboard$find2 === void 0 ? void 0 : _roomScoreboard$find2.score
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
              newGhostIds.forEach(function (id) {
                // Add a new ghost taco
                var newTacoEl = document.createElement('div');
                var newTacoCursor = document.createElement('div');
                var newTacoScoreEl = document.createElement('div');
                newTacoScoreEl.id = "".concat(id, "-score");
                updateScore({
                  element: newTacoScoreEl,
                  score: roomScoreboard[id]
                });
                newTacoEl.id = id;
                newTacoEl.classList.add('ghost-taco');
                newTacoEl.classList.add('taco-cursor');
                newTacoEl.appendChild(newTacoScoreEl);
                newTacoEl.appendChild(newTacoCursor);
                addIdToTacoIfNotExists(newTacoEl, id);
                roomEl.appendChild(newTacoEl);
                var userInfo = usersNotMe.find(function (_ref17) {
                  var id = _ref17.id;
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


            _context3.next = 30;
            return RoomClient.subscribe("/rooms/".concat(TACOS_ROOM_ID), onRoomUpdate);

          case 30:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[8, 13]]);
  }));

  return function initSocket() {
    return _ref10.apply(this, arguments);
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

  window.addEventListener('click', function (evt) {
    genParticles(evt.clientX, evt.clientY);
    lastClick = {
      epoch: Date.now(),
      x: evt.clientX,
      y: evt.clientY
    };
    throttledBroadcast();
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
  particleNumber: 38,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL21haW4uanMiLCJsaWIvcHVibGljL2pzL3BhcnRpY2xlcy1vbi1jbGljay5qcyIsIm5vZGVfbW9kdWxlcy9AaGFwaS9uZXMvbGliL2NsaWVudC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7Ozs7Ozs7Ozs7QUFFQSxPQUFPLENBQUMscUJBQUQsQ0FBUDs7QUFFQSxlQUF5QixPQUFPLENBQUMsc0JBQUQsQ0FBaEM7QUFBQSxJQUFRLFlBQVIsWUFBUSxZQUFSLEMsQ0FFQTs7O0FBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSw2QkFBWjtBQUVBLElBQU0sS0FBSyxHQUFHLEtBQWQ7QUFDQSxJQUFNLGFBQWEsR0FBRyxpQkFBdEI7QUFDQSxJQUFNLFVBQVUsR0FBRyxTQUFuQjtBQUNBLElBQU0sV0FBVyxHQUFHLFVBQXBCO0FBQ0EsSUFBTSxPQUFPLEdBQUcsSUFBaEI7QUFDQSxJQUFNLHNCQUFzQixHQUFHLEVBQS9CLEMsQ0FBbUM7O0FBRW5DLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxpQkFBRCxDQUF4Qjs7QUFFQSxJQUFJLEdBQUo7O0FBRUEsSUFBSSxPQUFKLEVBQWE7QUFDVCxFQUFBLEdBQUcsR0FBRyxPQUFPLENBQUMsc0JBQUQsQ0FBYjtBQUNILEMsQ0FFRDs7O0FBRUEsSUFBSSxVQUFKLEMsQ0FDQTs7QUFDQSxJQUFJLFVBQVUsR0FBRyxJQUFqQjtBQUNBLElBQUksY0FBYyxHQUFHLEVBQXJCO0FBQ0EsSUFBSSxLQUFLLEdBQUcsQ0FBWjtBQUNBLElBQUksS0FBSyxHQUFHLENBQVosQyxDQUNBOztBQUNBLElBQUksU0FBUyxHQUFHLElBQWhCOztBQUVBLElBQU0sZ0JBQWdC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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN0eEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2YkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgncmVnZW5lcmF0b3ItcnVudGltZScpO1xuXG5jb25zdCB7IGdlblBhcnRpY2xlcyB9ID0gcmVxdWlyZSgnLi9wYXJ0aWNsZXMtb24tY2xpY2snKTtcblxuLy8gU291bmQgb2ZmZmZmISEhISEhXG5jb25zb2xlLmxvZygnVEFDT09PT09PT09PT09PT09PT09PT09TISEhJyk7XG5cbmNvbnN0IERFQlVHID0gZmFsc2U7XG5jb25zdCBUQUNPU19ST09NX0lEID0gJ3RhY29zLW4tZnJpZW5kcyc7XG5jb25zdCBNWV9UQUNPX0lEID0gJ215LXRhY28nO1xuY29uc3QgTVlfU0NPUkVfSUQgPSAnbXktc2NvcmUnO1xuY29uc3QgVVNFX05FUyA9IHRydWU7XG5jb25zdCBDVVJTT1JfVVBEQVRFX1RIUk9UVExFID0gMTQ7IC8vIDE0IG1pbGxpc2Vjb25kcyDigJQgY2xvc2UgdG8gMTYgd2hpY2ggd291bGQgYmUgNjAgZnBzXG5cbmNvbnN0IFRocm90dGxlID0gcmVxdWlyZSgnbG9kYXNoLnRocm90dGxlJyk7XG5cbmxldCBOZXM7XG5cbmlmIChVU0VfTkVTKSB7XG4gICAgTmVzID0gcmVxdWlyZSgnQGhhcGkvbmVzL2xpYi9jbGllbnQnKTtcbn1cblxuLy8gY29uc3QgUkVDT05ORUNUX1RJTUVPVVQgPSAxMDAwOyAvLyBpbiBtaWxsaXNlY29uZHNcblxubGV0IFJvb21DbGllbnQ7XG4vLyBUaGlzIHdpbGwgZ2V0IHNldCBieSB0aGUgc2VydmVyIG9uIGNvbm5lY3Rpb25cbmxldCByb29tVXNlcklkID0gbnVsbDtcbmxldCByb29tU2NvcmVib2FyZCA9IFtdO1xubGV0IHJvb21YID0gMDtcbmxldCByb29tWSA9IDA7XG4vLyBsZXQgaXNNb3VzZURvd24gPSBmYWxzZTtcbmxldCBsYXN0Q2xpY2sgPSBudWxsO1xuXG5jb25zdCBhYmJyZXZpYXRlVXNlcklkID0gKHVzZXJJZCkgPT4gYC4uLiR7KHVzZXJJZCB8fCAnJykuc3BsaXQoJy0nKS5wb3AoKX1gO1xuXG5jb25zdCBhZGRJZFRvVGFjb0lmTm90RXhpc3RzID0gKGVsLCBpZCkgPT4ge1xuXG4gICAgY29uc3QgaWRFbCA9IGVsLnF1ZXJ5U2VsZWN0b3IoJy50YWNvLWlkJyk7XG5cbiAgICBpZiAoIWlkRWwpIHtcbiAgICAgICAgY29uc3QgdGFjb0lkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRhY29JZC5jbGFzc05hbWUgPSAndGFjby1pZCc7XG4gICAgICAgIHRhY29JZC50ZXh0Q29udGVudCA9IGFiYnJldmlhdGVVc2VySWQoaWQpO1xuICAgICAgICB0YWNvSWQuc3R5bGUuY29sb3IgPSAnd2hpdGUnO1xuICAgICAgICB0YWNvSWQuc3R5bGUuZm9udFNpemUgPSAnMTZweCc7XG4gICAgICAgIHRhY29JZC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIHRhY29JZC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtMjUlKSc7XG4gICAgICAgIHRhY29JZC5zdHlsZS5ib3R0b20gPSAnLTIwcHgnO1xuICAgICAgICB0YWNvSWQuc3R5bGUud2hpdGVTcGFjZSA9ICdub3dyYXAnO1xuICAgICAgICBlbC5hcHBlbmRDaGlsZCh0YWNvSWQpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWRFbC50ZXh0Q29udGVudCA9IGFiYnJldmlhdGVVc2VySWQoaWQpO1xuICAgIH1cbn07XG5cbi8vIFNlbmQgcm9vbSBjaGF0XG5jb25zdCBzZW5kUm9vbUNoYXQgPSBhc3luYyAoeyByb29tSWQsIHVzZXJJZCwgLi4ucmVzdCB9KSA9PiB7XG5cbiAgICBjb25zdCBwYXlsb2FkID0gcmVzdDtcblxuICAgIGlmICh1c2VySWQpIHtcbiAgICAgICAgcGF5bG9hZC51c2VySWQgPSB1c2VySWQ7XG4gICAgfVxuXG4gICAgY29uc3QgeyBwYXlsb2FkOiB7IGVycm9yIH0gfSA9IGF3YWl0IFJvb21DbGllbnQucmVxdWVzdCh7XG4gICAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgICBwYXRoOiBgL3Jvb21zLyR7cm9vbUlkfS9jaGF0L3VwZGF0ZWAsXG4gICAgICAgIHBheWxvYWRcbiAgICB9KTtcblxuICAgIGlmIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICB9XG59O1xuXG5jb25zdCBidWlsZENoYXRNZXNzYWdlcyA9ICh7IG1lc3NhZ2VzIH0pID0+IHtcblxuICAgIHJldHVybiBtZXNzYWdlcy5tYXAoKHsgaWQsIHVzZXJJZCwgZXBvY2gsIG1zZyB9LCBpKSA9PiB7XG5cbiAgICAgICAgY29uc3QgbXNnRnJvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBtc2dGcm9tLmlubmVyVGV4dCA9IGFiYnJldmlhdGVVc2VySWQodXNlcklkKTtcbiAgICAgICAgbXNnRnJvbS5jbGFzc0xpc3QuYWRkKCdjaGF0LW1zZy1mcm9tJyk7XG5cbiAgICAgICAgY29uc3QgbXNnVGltZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBtc2dUaW1lLmlubmVyVGV4dCA9IG5ldyBEYXRlKGVwb2NoKS50b0xvY2FsZVRpbWVTdHJpbmcoKTtcbiAgICAgICAgbXNnVGltZS5jbGFzc0xpc3QuYWRkKCdjaGF0LW1zZy10aW1lJyk7XG5cbiAgICAgICAgY29uc3QgZnJvbVRpbWVDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZnJvbVRpbWVDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnZnJvbS10aW1lLWNvbnRhaW5lcicpO1xuXG4gICAgICAgIGZyb21UaW1lQ29udGFpbmVyLmFwcGVuZENoaWxkKG1zZ0Zyb20pO1xuICAgICAgICBmcm9tVGltZUNvbnRhaW5lci5hcHBlbmRDaGlsZChtc2dUaW1lKTtcblxuICAgICAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG1lc3NhZ2UuaW5uZXJUZXh0ID0gbXNnO1xuICAgICAgICBtZXNzYWdlLmNsYXNzTGlzdC5hZGQoJ2NoYXQtbXNnJyk7XG5cbiAgICAgICAgY29uc3QgbXNnQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG1zZ0NvbnRhaW5lci5pZCA9IGlkO1xuICAgICAgICBtc2dDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnY2hhdC1tc2ctY29udGFpbmVyJyk7XG5cbiAgICAgICAgaWYgKHVzZXJJZCA9PT0gcm9vbVVzZXJJZCkge1xuICAgICAgICAgICAgbXNnQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ215LW1zZycpO1xuICAgICAgICB9XG5cbiAgICAgICAgbXNnQ29udGFpbmVyLmFwcGVuZENoaWxkKGZyb21UaW1lQ29udGFpbmVyKTtcbiAgICAgICAgbXNnQ29udGFpbmVyLmFwcGVuZENoaWxkKG1lc3NhZ2UpO1xuXG4gICAgICAgIHJldHVybiBtc2dDb250YWluZXI7XG4gICAgfSk7XG59O1xuXG5jb25zdCB1cGRhdGVDaGF0Um9vbU1lc3NhZ2VzID0gKHsgcm9vbUlkLCBtZXNzYWdlcyB9KSA9PiB7XG5cbiAgICBsZXQgY2hhdFJvb20gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhdC1yb29tJyk7XG4gICAgbGV0IGNoYXRSb29tTWVzc2FnZXM7XG5cbiAgICBpZiAoIWNoYXRSb29tKSB7XG4gICAgICAgIGNvbnN0IGNoYXRSb29tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGNoYXRSb29tLmlkID0gJ2NoYXQtcm9vbSc7XG5cbiAgICAgICAgY29uc3QgY2hhdFJvb21IZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgICAgICBjaGF0Um9vbUhlYWRlci5pZCA9ICdjaGF0LXJvb20taGVhZGVyJztcbiAgICAgICAgY2hhdFJvb21IZWFkZXIuaW5uZXJUZXh0ID0gYCR7cm9vbUlkfSBjaGF0IOKAlCBiZSBuaWNlISA9UGA7XG5cbiAgICAgICAgY2hhdFJvb21NZXNzYWdlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBjaGF0Um9vbU1lc3NhZ2VzLmlkID0gJ2NoYXQtcm9vbS1tZXNzYWdlcyc7XG5cbiAgICAgICAgY29uc3QgY2hhdElucHV0Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAgICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICBpbnB1dC5uYW1lID0gJ25ldy1jaGF0JztcbiAgICAgICAgaW5wdXQuYXV0b2NvbXBsZXRlID0gJ25ldy1wYXNzd29yZCc7XG4gICAgICAgIGlucHV0LmlkID0gJ2NoYXQtcm9vbS1pbnB1dCc7XG5cbiAgICAgICAgY29uc3Qgc3VibWl0QnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIHN1Ym1pdEJ0bi50eXBlID0gJ3N1Ym1pdCc7XG4gICAgICAgIHN1Ym1pdEJ0bi5pZCA9ICdjaGF0LXJvb20tc3VibWl0JztcbiAgICAgICAgc3VibWl0QnRuLnRleHRDb250ZW50ID0gJ1NVQk1JVCc7XG5cbiAgICAgICAgY29uc3QgY2hhdFJvb21Gb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xuICAgICAgICBjaGF0Um9vbUZvcm0uYXV0b2NvbXBsZXRlID0gJ25ldy1wYXNzd29yZCc7XG4gICAgICAgIGNoYXRSb29tRm9ybS5pZCA9ICdjaGF0LXJvb20tZm9ybSc7XG4gICAgICAgIGNoYXRSb29tRm9ybS5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgICAgIGNoYXRSb29tRm9ybS5hcHBlbmRDaGlsZChzdWJtaXRCdG4pO1xuXG4gICAgICAgIGNoYXRSb29tRm9ybS5vbnN1Ym1pdCA9IChldnQpID0+IHtcblxuICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNoYXRJbnB1dEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXQtcm9vbS1pbnB1dCcpO1xuXG4gICAgICAgICAgICBpZiAoY2hhdElucHV0RWwgJiYgY2hhdElucHV0RWwudmFsdWUpIHtcblxuICAgICAgICAgICAgICAgIHNlbmRSb29tQ2hhdCh7XG4gICAgICAgICAgICAgICAgICAgIHJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgdXNlcklkOiByb29tVXNlcklkLFxuICAgICAgICAgICAgICAgICAgICBtc2c6IGNoYXRJbnB1dEVsLnZhbHVlXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBDbGVhciBvdXQgdGhlIGlucHV0XG4gICAgICAgICAgICAgICAgY2hhdElucHV0RWwudmFsdWUgPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBcHBlbmQgY2hhdFJvb21Gb3JtXG4gICAgICAgIGNoYXRJbnB1dENvbnRhaW5lci5hcHBlbmRDaGlsZChjaGF0Um9vbUZvcm0pO1xuXG4gICAgICAgIGNoYXRSb29tLmFwcGVuZENoaWxkKGNoYXRSb29tSGVhZGVyKTtcbiAgICAgICAgY2hhdFJvb20uYXBwZW5kQ2hpbGQoY2hhdFJvb21NZXNzYWdlcyk7XG4gICAgICAgIGNoYXRSb29tLmFwcGVuZENoaWxkKGNoYXRJbnB1dENvbnRhaW5lcik7XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjaGF0Um9vbSk7XG4gICAgfVxuXG4gICAgY2hhdFJvb21NZXNzYWdlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjaGF0LXJvb20tbWVzc2FnZXMnKTtcblxuICAgIGNvbnN0IG9sZENoYXRNc2dDb250YWluZXJzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2hhdC1tc2ctY29udGFpbmVyJykpO1xuXG4gICAgLy8gQ2xlYXIgb3V0IGNvbnRlbnRzXG4gICAgY2hhdFJvb21NZXNzYWdlcy5pbm5lckhUTUwgPSAnJztcbiAgICAvLyBSZWJ1aWxkIGJlZm9yZSBuZXh0IHJlcGFpbnRcblxuICAgIGJ1aWxkQ2hhdE1lc3NhZ2VzKHsgbWVzc2FnZXMgfSkuZm9yRWFjaCgoZWwpID0+IHtcblxuICAgICAgICBjaGF0Um9vbU1lc3NhZ2VzLmFwcGVuZENoaWxkKGVsKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGNoYXRNc2dDb250YWluZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNoYXQtbXNnLWNvbnRhaW5lcicpO1xuXG4gICAgY29uc3QgbGFzdE1zZyA9IEFycmF5LmZyb20oKGNoYXRNc2dDb250YWluZXJzIHx8IFtdKSkucG9wKCk7XG5cbiAgICBpZiAobGFzdE1zZykge1xuICAgICAgICBsYXN0TXNnLnNjcm9sbEludG9WaWV3KCk7XG4gICAgfVxufTtcblxuLy8gVXBzZXJ0IHVzZXIgaW4gcm9vbVxuY29uc3QgdXBkYXRlUm9vbSA9IGFzeW5jICh7IHJvb21JZCwgdXNlcklkLCAuLi5yZXN0IH0pID0+IHtcblxuICAgIGNvbnN0IHBheWxvYWQgPSByZXN0O1xuXG4gICAgaWYgKHVzZXJJZCkge1xuICAgICAgICBwYXlsb2FkLmlkID0gdXNlcklkO1xuICAgIH1cblxuICAgIGNvbnN0IHsgcGF5bG9hZDogeyBlcnJvciwgdXNlciB9IH0gPSBhd2FpdCBSb29tQ2xpZW50LnJlcXVlc3Qoe1xuICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgcGF0aDogYC9yb29tcy8ke3Jvb21JZH0vdXBkYXRlYCxcbiAgICAgICAgcGF5bG9hZFxuICAgIH0pO1xuXG4gICAgaWYgKHVzZXIpIHtcbiAgICAgICAgcm9vbVVzZXJJZCA9IHVzZXIuaWQ7XG4gICAgICAgIGNvbnN0IG15VGFjb0VsRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChNWV9UQUNPX0lEKTtcbiAgICAgICAgYWRkSWRUb1RhY29JZk5vdEV4aXN0cyhteVRhY29FbEVsLCByb29tVXNlcklkKTtcbiAgICB9XG5cbiAgICAvLyBTZXR1cCBzb21lIGtpbmRhIGVhc3kgZGVidWdnaW5nIG9yIHNvbWV0aGluZ1xuICAgIGNvbnN0IGNvbm5lY3Rpb25Nc2cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29ubmVjdGlvbk1zZycpIHx8IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG5cbiAgICBjb25uZWN0aW9uTXNnLmlkID0gJ2Nvbm5lY3Rpb25Nc2cnO1xuXG4gICAgaWYgKGVycm9yKSB7XG4gICAgICAgIC8vIGxldCBlcnIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGA8aDMgc3R5bGU9J2NvbG9yOiB3aGl0ZTsnPkVycm9yICR7ZXJyb3IubWVzc2FnZX08L2gzPmApO1xuICAgICAgICBjb25uZWN0aW9uTXNnLnN0eWxlLmNvbG9yID0gJyNmODgwNzAnO1xuICAgICAgICBjb25uZWN0aW9uTXNnLnRleHRDb250ZW50ID0gYEVycm9yICR7ZXJyb3IubWVzc2FnZSB8fCBlcnJvcn1gO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29ubmVjdGlvbk1zZy5zdHlsZS5jb2xvciA9ICcjNzNjOTkxJztcbiAgICAgICAgY29ubmVjdGlvbk1zZy50ZXh0Q29udGVudCA9IGBDb25uZWN0ZWQgeDogJHtwYXlsb2FkLnggfHwgJ251bGwnfSB5OiAke3BheWxvYWQueSB8fCAnbnVsbCd9YDtcbiAgICB9XG5cbiAgICAvLyBBZGQgaXRcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbm5lY3Rpb25Nc2cpO1xuXG4gICAgcmV0dXJuIHVzZXI7XG59O1xuXG5jb25zdCB0aHJvdHRsZWRCcm9hZGNhc3QgPSBUaHJvdHRsZSgoKSA9PiB7XG5cbiAgICBjb25zdCB1cGRhdGUgPSB7XG4gICAgICAgIHJvb21JZDogVEFDT1NfUk9PTV9JRCxcbiAgICAgICAgdXNlcklkOiByb29tVXNlcklkLFxuICAgICAgICB4OiByb29tWCxcbiAgICAgICAgeTogcm9vbVlcbiAgICB9O1xuXG4gICAgaWYgKGxhc3RDbGljaykge1xuICAgICAgICB1cGRhdGUubGFzdENsaWNrID0gbGFzdENsaWNrO1xuICAgIH1cblxuICAgIHVwZGF0ZVJvb20odXBkYXRlKTtcbn0sIENVUlNPUl9VUERBVEVfVEhST1RUTEUpO1xuXG5jb25zdCBteVRhY29FbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKE1ZX1RBQ09fSUQpO1xuY29uc3QgbXlTY29yZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoTVlfU0NPUkVfSUQpO1xuXG4vLyBIb3QgcGF0aFxuY29uc3QgbW92ZUN1cnNvciA9ICh7IGVsZW1lbnQsIHgsIHkgfSkgPT4ge1xuXG4gICAgLy8gSG9wZWZ1bGx5IHRoZSAncHgnIGF0IHRoZSBlbmQgaGVyZSB3aWxsIG5lZ2F0ZSBhdHRlbXB0cyB0byBydW4gYSBzY3JpcHRcbiAgICBlbGVtZW50LnN0eWxlLmxlZnQgPSBgJHt4fXB4YDtcbiAgICBlbGVtZW50LnN0eWxlLnRvcCA9IGAke3l9cHhgO1xufTtcblxuY29uc3QgdXBkYXRlU2NvcmUgPSAoeyBlbGVtZW50LCBzY29yZSB9KSA9PiB7XG5cbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdTY29yZSBlbGVtZW50IG5vdCBmb3VuZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZWxlbWVudC50ZXh0Q29udGVudCA9IHNjb3JlO1xufTtcblxuLy8gV2UgbmVlZCB0aGlzIHdyYXBwZXIgdG8gbWFrZSBhc3luYy9hd2FpdCBuaWNlIHRvIHdyaXRlXG5jb25zdCBpbml0U29ja2V0ID0gYXN5bmMgKCkgPT4ge1xuXG4gICAgaWYgKFJvb21DbGllbnQpIHtcbiAgICAgICAgYXdhaXQgUm9vbUNsaWVudC5kaXNjb25uZWN0KCk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBsb2NhdGlvbjogeyBwcm90b2NvbCwgaG9zdCB9IH0gPSB3aW5kb3c7XG5cbiAgICAvLyBUaGlzIHdpbGwgcmVwbGFjZSAnaHR0cHMnIGZvciAnd3MnIHdoaWNoIHdpbGwgYWxzbyBsZWF2ZSAnd3NzJyBmb3IgJ2h0dHBzJyBwcm90b2NvbHNcbiAgICBjb25zdCB1cmwgPSBwcm90b2NvbC5yZXBsYWNlKCdodHRwJywgJ3dzJykgKyAnLy8nICsgaG9zdDtcblxuICAgIGNvbnN0IHdzTG9jYXRpb24gPSB1cmwucmVwbGFjZSgnbG9jYWxob3N0OjMwMDEnLCAnbG9jYWxob3N0OjMwMDAnKTtcblxuICAgIGNvbnNvbGUubG9nKCd3c0xvY2F0aW9uJywgd3NMb2NhdGlvbik7XG5cbiAgICBSb29tQ2xpZW50ID0gbmV3IE5lcy5DbGllbnQod3NMb2NhdGlvbik7XG5cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBSb29tQ2xpZW50LmNvbm5lY3QoKTtcbiAgICB9XG4gICAgY2F0Y2ggKGNvbm5lY3RFcnIpIHtcbiAgICAgICAgLy8gU2V0dXAgc29tZSBraW5kYSBlYXN5IGRlYnVnZ2luZyBvciBzb21ldGhpbmdcbiAgICAgICAgY29uc3QgY29ubmVjdGlvbk1zZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb25uZWN0aW9uTXNnJykgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcblxuICAgICAgICBjb25uZWN0aW9uTXNnLmlkID0gJ2Nvbm5lY3Rpb25Nc2cnO1xuXG4gICAgICAgIGNvbm5lY3Rpb25Nc2cuc3R5bGUuY29sb3IgPSAnI2Y4ODA3MCc7XG4gICAgICAgIGNvbm5lY3Rpb25Nc2cudGV4dENvbnRlbnQgPSBgRXJyb3IgJHtjb25uZWN0RXJyLm1lc3NhZ2V9YDtcbiAgICB9XG5cbiAgICAvLyBJbml0IHVzZXJcbiAgICBjb25zdCB1c2VyID0gYXdhaXQgdXBkYXRlUm9vbSh7XG4gICAgICAgIHJvb21JZDogVEFDT1NfUk9PTV9JRCxcbiAgICAgICAgdXNlcklkOiByb29tVXNlcklkXG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygnaW5pdCB1c2VyJywgdXNlcik7XG5cbiAgICAvLyBJbml0IGNoYXQgcm9vbVxuICAgIHVwZGF0ZUNoYXRSb29tTWVzc2FnZXMoeyByb29tSWQ6IFRBQ09TX1JPT01fSUQsIG1lc3NhZ2VzOiBbXSB9KTtcblxuICAgIGNvbnN0IHJvb21FbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yb29tJyk7XG5cbiAgICBjb25zdCBjbGlja1RyYWNrZXIgPSB7fTtcblxuICAgIGxldCByb29tVXNlcnMgPSB7fTtcblxuICAgIC8vIEhvdCBwYXRoLCB0aHJvdHRsZWQgc2VydmVyLXNpZGVcbiAgICBjb25zdCBvblJvb21VcGRhdGUgPSAocHJvcHMpID0+IHtcblxuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICAvLyBpZDogcm9vbUlkLFxuICAgICAgICAgICAgdXNlcnMgPSB7fSxcbiAgICAgICAgICAgIGlzU3luYyxcbiAgICAgICAgICAgIHNjb3JlYm9hcmQsXG4gICAgICAgICAgICBzaG91bGREZWxldGVVc2VycyxcbiAgICAgICAgICAgIGNoYXRcbiAgICAgICAgfSA9IHByb3BzO1xuXG4gICAgICAgIGlmIChERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ29uUm9vbVVwZGF0ZScsIHByb3BzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaGF0KSB7XG4gICAgICAgICAgICB1cGRhdGVDaGF0Um9vbU1lc3NhZ2VzKHsgcm9vbUlkOiBUQUNPU19ST09NX0lELCBtZXNzYWdlczogY2hhdCB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGdob3N0VGFjb3MgPSBBcnJheS5mcm9tKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2dob3N0LXRhY28nKSk7XG4gICAgICAgIGxldCByZW1haW5pbmdHaG9zdFRhY29zID0gZ2hvc3RUYWNvcztcblxuICAgICAgICAvLyBpc1BhcnRpYWxcbiAgICAgICAgaWYgKHNob3VsZERlbGV0ZVVzZXJzKSB7XG4gICAgICAgICAgICBPYmplY3QudmFsdWVzKHVzZXJzKS5mb3JFYWNoKCh1c2VyKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBtYXliZVRhY28gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh1c2VyLmlkKTtcblxuICAgICAgICAgICAgICAgIGlmIChtYXliZVRhY28pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRoaXMgdGFjb1xuICAgICAgICAgICAgICAgICAgICByb29tRWwucmVtb3ZlQ2hpbGQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNTeW5jKSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgaW5hY3RpdmUgdGFjb3NcbiAgICAgICAgICAgIGNvbnN0IHVzZXJJZHMgPSBPYmplY3Qua2V5cyh1c2Vycyk7XG5cbiAgICAgICAgICAgIGdob3N0VGFjb3MuZm9yRWFjaCgoZ2hvc3RUYWNvKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXVzZXJJZHMuaW5jbHVkZXMoZ2hvc3RUYWNvLmlkKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdGhpcyB0YWNvXG4gICAgICAgICAgICAgICAgICAgIHJvb21FbC5yZW1vdmVDaGlsZChnaG9zdFRhY28pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nR2hvc3RUYWNvcy5wdXNoKGdob3N0VGFjbyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJvb21Vc2VycyA9IHVzZXJzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNjb3JlYm9hcmQpIHtcbiAgICAgICAgICAgIHJvb21TY29yZWJvYXJkID0gc2NvcmVib2FyZDtcbiAgICAgICAgICAgIGNvbnN0IHNjb3JlYm9hcmRFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY29yZWJvYXJkJyk7XG4gICAgICAgICAgICBzY29yZWJvYXJkRWwuaW5uZXJIVE1MID0gYDxoMz5TY29yZWJvYXJkPC9oMz4ke3Njb3JlYm9hcmQubWFwKCh7IHVzZXJJZCwgc2NvcmUgfSkgPT4gYDxwPiR7YWJicmV2aWF0ZVVzZXJJZCh1c2VySWQpfTogJHtzY29yZX08L3A+YCkuam9pbignJyl9YDtcbiAgICAgICAgICAgIGNvbnN0IG15U2NvcmUgPSByb29tU2NvcmVib2FyZC5maW5kKCh7IHVzZXJJZCB9KSA9PiB1c2VySWQgPT09IHJvb21Vc2VySWQpPy5zY29yZTtcblxuICAgICAgICAgICAgdXBkYXRlU2NvcmUoe1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG15U2NvcmVFbCxcbiAgICAgICAgICAgICAgICBzY29yZTogbXlTY29yZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1c2Vyc05vdE1lID0gT2JqZWN0LmtleXModXNlcnMpXG4gICAgICAgICAgICAuZmlsdGVyKChpZCkgPT4gaWQgIT09IHJvb21Vc2VySWQpXG4gICAgICAgICAgICAubWFwKChpZCkgPT4gdXNlcnNbaWRdKTtcblxuICAgICAgICBPYmplY3QudmFsdWVzKHVzZXJzTm90TWUpLmZvckVhY2goKHsgaWQ6IHVzZXJJZCwgbGFzdENsaWNrOiB7IGVwb2NoLCB4LCB5IH0gPSB7fSB9KSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IHVzZXJDbGlja2VkID0gZXBvY2g7XG4gICAgICAgICAgICBjb25zdCBsYXN0VXNlckNsaWNrID0gY2xpY2tUcmFja2VyW3VzZXJJZF07XG4gICAgICAgICAgICBsZXQgc2hvdWxkR2VuUGFydGljbGVzID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmICh1c2VyQ2xpY2tlZCAmJiAhbGFzdFVzZXJDbGljayB8fCAobGFzdFVzZXJDbGljayAmJiB1c2VyQ2xpY2tlZCA+IGxhc3RVc2VyQ2xpY2spKSB7XG4gICAgICAgICAgICAgICAgc2hvdWxkR2VuUGFydGljbGVzID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNob3VsZEdlblBhcnRpY2xlcykge1xuICAgICAgICAgICAgICAgIGdlblBhcnRpY2xlcyh4LCB5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xpY2tUcmFja2VyW3VzZXJJZF0gPSBlcG9jaDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgdXNlcnNZZXNNZSA9IHVzZXJzW09iamVjdC5rZXlzKHVzZXJzKS5maW5kKChpZCkgPT4gaWQgPT09IHJvb21Vc2VySWQpXTtcblxuICAgICAgICBjb25zdCBzaW5nbGVVc2Vyc05vdE1lID0gdXNlcnNOb3RNZS5sZW5ndGggPT09IDEgPyB1c2Vyc05vdE1lWzBdIDogbnVsbDtcblxuICAgICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgICAgIGlmICh1c2Vyc1llc01lKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VzZXJzWWVzTWUnLCB1c2Vyc1llc01lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzaW5nbGVVc2Vyc05vdE1lIHx8IHVzZXJzTm90TWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VzZXJzTm90TWUnLCBzaW5nbGVVc2Vyc05vdE1lIHx8IHVzZXJzTm90TWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHVzZXJzWWVzTWUpIHtcbiAgICAgICAgICAgIG1vdmVDdXJzb3Ioe1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG15VGFjb0VsLFxuICAgICAgICAgICAgICAgIHg6IHVzZXJzWWVzTWUueCxcbiAgICAgICAgICAgICAgICB5OiB1c2Vyc1llc01lLnlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZ2V0SWRzID0gKGFycikgPT4gYXJyLm1hcCgoeyBpZCB9KSA9PiBpZCk7XG5cbiAgICAgICAgLy8gTWFuYWdlIGdob3N0IHRhY29zXG5cbiAgICAgICAgcmVtYWluaW5nR2hvc3RUYWNvcy5mb3JFYWNoKCh0YWNvRWwpID0+IHtcblxuICAgICAgICAgICAgY29uc3QgdGFjb1VwZGF0ZSA9IHVzZXJzTm90TWUuZmluZCgoeyBpZCB9KSA9PiBpZCA9PT0gdGFjb0VsLmlkKTtcblxuICAgICAgICAgICAgaWYgKHRhY29VcGRhdGUpIHtcbiAgICAgICAgICAgICAgICBtb3ZlQ3Vyc29yKHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogdGFjb0VsLFxuICAgICAgICAgICAgICAgICAgICB4OiB0YWNvVXBkYXRlLngsXG4gICAgICAgICAgICAgICAgICAgIHk6IHRhY29VcGRhdGUueVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgdGFjb1Njb3JlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7dGFjb0VsLmlkfS1zY29yZWApO1xuXG4gICAgICAgICAgICAgICAgdXBkYXRlU2NvcmUoe1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiB0YWNvU2NvcmUsXG4gICAgICAgICAgICAgICAgICAgIHNjb3JlOiByb29tU2NvcmVib2FyZC5maW5kKCh7IHVzZXJJZCB9KSA9PiB1c2VySWQgPT09IHRhY29FbC5pZCk/LnNjb3JlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHJvb21Vc2VySWRzID0gT2JqZWN0LmtleXMocm9vbVVzZXJzKTtcbiAgICAgICAgY29uc3QgbmV3R2hvc3RJZHMgPSBnZXRJZHModXNlcnNOb3RNZSkuZmlsdGVyKChpZCkgPT4gIXJvb21Vc2VySWRzLmluY2x1ZGVzKGlkKSk7XG5cbiAgICAgICAgdXNlcnNOb3RNZS5mb3JFYWNoKCh1c2VyKSA9PiB7XG5cbiAgICAgICAgICAgIHJvb21Vc2Vyc1t1c2VyLmlkXSA9IHVzZXI7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ld0dob3N0SWRzLmZvckVhY2goKGlkKSA9PiB7XG5cbiAgICAgICAgICAgIC8vIEFkZCBhIG5ldyBnaG9zdCB0YWNvXG4gICAgICAgICAgICBjb25zdCBuZXdUYWNvRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1RhY29DdXJzb3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1RhY29TY29yZUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAgICAgICAgIG5ld1RhY29TY29yZUVsLmlkID0gYCR7aWR9LXNjb3JlYDtcblxuICAgICAgICAgICAgdXBkYXRlU2NvcmUoe1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG5ld1RhY29TY29yZUVsLFxuICAgICAgICAgICAgICAgIHNjb3JlOiByb29tU2NvcmVib2FyZFtpZF1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBuZXdUYWNvRWwuaWQgPSBpZDtcbiAgICAgICAgICAgIG5ld1RhY29FbC5jbGFzc0xpc3QuYWRkKCdnaG9zdC10YWNvJyk7XG4gICAgICAgICAgICBuZXdUYWNvRWwuY2xhc3NMaXN0LmFkZCgndGFjby1jdXJzb3InKTtcblxuICAgICAgICAgICAgbmV3VGFjb0VsLmFwcGVuZENoaWxkKG5ld1RhY29TY29yZUVsKTtcbiAgICAgICAgICAgIG5ld1RhY29FbC5hcHBlbmRDaGlsZChuZXdUYWNvQ3Vyc29yKTtcblxuICAgICAgICAgICAgYWRkSWRUb1RhY29JZk5vdEV4aXN0cyhuZXdUYWNvRWwsIGlkKTtcblxuICAgICAgICAgICAgcm9vbUVsLmFwcGVuZENoaWxkKG5ld1RhY29FbCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHVzZXJJbmZvID0gdXNlcnNOb3RNZS5maW5kKCh7IGlkIH0pID0+IGlkID09PSBpZCk7XG5cbiAgICAgICAgICAgIG1vdmVDdXJzb3Ioe1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG5ld1RhY29FbCxcbiAgICAgICAgICAgICAgICB4OiB1c2VySW5mby54LFxuICAgICAgICAgICAgICAgIHk6IHVzZXJJbmZvLnlcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBnZW5QYXJ0aWNsZXModXNlckluZm8ueCwgdXNlckluZm8ueSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBDb29vb25ubm5ubmVlZWVlZWVjY2NjY2N0dHR0dHR0dCEhISEhISFcbiAgICBhd2FpdCBSb29tQ2xpZW50LnN1YnNjcmliZShgL3Jvb21zLyR7VEFDT1NfUk9PTV9JRH1gLCBvblJvb21VcGRhdGUpO1xufTtcblxuY29uc3QgcnVuID0gKCkgPT4ge1xuXG4gICAgaW5pdFNvY2tldCgpO1xuXG4gICAgLy8gQnJvYWRjYXN0IG1vdmVtZW50cyB0byB0aGUgcm9vbSBhbmQgb25seVxuICAgIC8vIHVwZGF0ZSBteSB2aWV3IHdpdGggd2hhdCB3ZSBnZXQgZnJvbSB0aGUgc2VydmVyXG4gICAgY29uc3Qgb25Nb3VzZU1vdmUgPSAoZXZ0KSA9PiB7XG5cbiAgICAgICAgcm9vbVggPSBldnQucGFnZVg7XG4gICAgICAgIHJvb21ZID0gZXZ0LnBhZ2VZO1xuXG4gICAgICAgIHRocm90dGxlZEJyb2FkY2FzdCgpO1xuICAgIH07XG5cbiAgICAvLyBEZXNrdG9wIGFuZCBtb2JpbGUgY2xpY2tzXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlKTtcblxuICAgIC8vIE1vYmlsZSBzdXBwb3J0XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIChldnQpID0+IHtcblxuICAgICAgICBvbk1vdXNlTW92ZSh7XG4gICAgICAgICAgICBwYWdlWDogTWF0aC5yb3VuZChldnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCksXG4gICAgICAgICAgICBwYWdlWTogTWF0aC5yb3VuZChldnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSlcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBNeSB0YWNvJ3MgcGFydGljbGVzXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2dCkge1xuXG4gICAgICAgIGdlblBhcnRpY2xlcyhldnQuY2xpZW50WCwgZXZ0LmNsaWVudFkpO1xuXG4gICAgICAgIGxhc3RDbGljayA9IHtcbiAgICAgICAgICAgIGVwb2NoOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgeDogZXZ0LmNsaWVudFgsXG4gICAgICAgICAgICB5OiBldnQuY2xpZW50WVxuICAgICAgICB9O1xuXG4gICAgICAgIHRocm90dGxlZEJyb2FkY2FzdCgpO1xuICAgIH0pO1xufTtcblxucnVuKCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICBCcmllZiBhdHRlbXB0IGF0IHdlYnNvY2tldCBuYXRpdmUgc3R1ZmZcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuLy8gY29uc3Qgb25Tb2NrZXRPcGVuID0gKGV2dCkgPT4ge1xuXG4vLyAgICAgY29uc29sZS5sb2coJ29wZW4gZXZ0JywgZXZ0KTtcbi8vICAgICAvLyBSb29tQ2xpZW50LnNlbmQoJ0hlbGxvIFNlcnZlciEnKTtcbi8vIH07XG5cbi8vIGNvbnN0IG9uU29ja2V0TWVzc2FnZSA9IChldnQpID0+IHtcblxuLy8gICAgIGNvbnNvbGUubG9nKCdldnQnLCBldnQpO1xuXG4vLyAgICAgY29uc29sZS5sb2coJ01lc3NhZ2UgZnJvbSBzZXJ2ZXIgJywgZXZ0Py5kYXRhKTtcbi8vIH07XG5cbi8vIFJvb21DbGllbnQgPSBuZXcgV2ViU29ja2V0KCd3czovL2xvY2FsaG9zdDozMDAwJyk7XG5cbi8vIC8vIExpc3RlbiBmb3IgY29ubmVjdGlvbiBvcGVuXG4vLyBSb29tQ2xpZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ29wZW4nLCBvblNvY2tldE9wZW4pO1xuLy8gUm9vbUNsaWVudC5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgb25Tb2NrZXRPcGVuKTtcblxuLy8gLy8gTGlzdGVuIGZvciBtZXNzYWdlc1xuLy8gUm9vbUNsaWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgb25Tb2NrZXRNZXNzYWdlKTtcbi8vIFJvb21DbGllbnQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIG9uU29ja2V0TWVzc2FnZSk7XG5cbi8vIFJvb21DbGllbnQub25jbG9zZSA9IG9uU29ja2V0Q2xvc2U7XG5cbi8vIGNvbnN0IG9uU29ja2V0Q2xvc2UgPSAoZXZ0KSA9PiB7XG5cbi8vICAgICBjb25zb2xlLmxvZygnb25jbG9zZSBldnQnLCBldnQpO1xuXG4vLyAgICAgc2V0VGltZW91dCgoKSA9PiB7XG5cbi8vICAgICAgICAgY29uc29sZS5sb2coJ1JlY29ubmVjdGluZy4uLicpO1xuLy8gICAgICAgICBpbml0U29ja2V0KCk7XG4vLyAgICAgfSwgUkVDT05ORUNUX1RJTUVPVVQpO1xuLy8gfTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vY29kZXBlbi5pby9kZWFud2FnbWFuL3Blbi9FakxCZFFcblxuLy8gTGl0dGxlIENhbnZhcyB0aGluZ3NcbmNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2FudmFzXCIpO1xuY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbi8vIFNldCBDYW52YXMgdG8gYmUgd2luZG93IHNpemVcbmNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuLy8gQ29uZmlndXJhdGlvbiwgUGxheSB3aXRoIHRoZXNlXG5jb25zdCBjb25maWcgPSB7XG4gIHBhcnRpY2xlTnVtYmVyOiAzOCxcbiAgbWF4UGFydGljbGVTaXplOiAyMCxcbiAgbWF4U3BlZWQ6IDQwLFxuICBjb2xvclZhcmlhdGlvbjogNTBcbn07XG5cbi8vIENvbG9yc1xuY29uc3QgY29sb3JQYWxldHRlID0ge1xuICAgIGJnOiB7IHI6IDAsIGc6IDAsIGI6IDAsIGE6IDAgfSxcbiAgICBtYXR0ZXI6IFtcbiAgICAgIHsgcjogMzYsIGc6IDE4LCBiOiA0MiB9LCAvLyBkYXJrUFJQTFxuICAgICAgeyByOiA3OCwgZzogMzYsIGI6IDQyIH0sIC8vIHJvY2tEdXN0XG4gICAgICB7IHI6IDI1MiwgZzogMTc4LCBiOiA5NiB9LCAvLyBzb2xvckZsYXJlXG4gICAgICB7IHI6IDI1MywgZzogMjM4LCBiOiAxNTIgfSAvLyB0b3Rlc0FTdW5cbiAgICBdXG59O1xuXG4vLyBTb21lIFZhcmlhYmxlcyBoYW5naW5nIG91dFxubGV0IHBhcnRpY2xlcyA9IFtdO1xubGV0IGRyYXdCZztcblxuY29uc3QgY2VudGVyWCA9IGNhbnZhcy53aWR0aCAvIDI7XG5jb25zdCBjZW50ZXJZID0gY2FudmFzLmhlaWdodCAvIDI7XG5cbi8vIERyYXdzIHRoZSBiYWNrZ3JvdW5kIGZvciB0aGUgY2FudmFzLCBiZWNhdXNlIHNwYWNlXG5kcmF3QmcgPSAoY3R4LCBjb2xvcikgPT4ge1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKFwiICsgY29sb3IuciArIFwiLFwiICsgY29sb3IuZyArIFwiLFwiICsgY29sb3IuYiArIFwiKVwiO1xuICAgIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xufTtcblxuLy8gUGFydGljbGUgQ29uc3RydWN0b3JcbmNvbnN0IFBhcnRpY2xlID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAvLyBYIENvb3JkaW5hdGVcbiAgICB0aGlzLnggPSB4IHx8IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIGNhbnZhcy53aWR0aCk7XG4gICAgLy8gWSBDb29yZGluYXRlXG4gICAgdGhpcy55ID0geSB8fCBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiBjYW52YXMuaGVpZ2h0KTtcbiAgICAvLyBSYWRpdXMgb2YgdGhlIHNwYWNlIGR1c3RcbiAgICB0aGlzLnIgPSBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIGNvbmZpZy5tYXhQYXJ0aWNsZVNpemUpO1xuICAgIC8vIENvbG9yIG9mIHRoZSByb2NrLCBnaXZlbiBzb21lIHJhbmRvbW5lc3NcbiAgICB0aGlzLmMgPSBjb2xvclZhcmlhdGlvbihjb2xvclBhbGV0dGUubWF0dGVyW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNvbG9yUGFsZXR0ZS5tYXR0ZXIubGVuZ3RoKV0sdHJ1ZSApO1xuICAgIC8vIFNwZWVkIG9mIHdoaWNoIHRoZSByb2NrIHRyYXZlbHNcbiAgICB0aGlzLnMgPSBNYXRoLnBvdyhNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIGNvbmZpZy5tYXhTcGVlZCksIC43KTtcbiAgICAvLyBEaXJlY3Rpb24gdGhlIFJvY2sgZmxpZXNcbiAgICB0aGlzLmQgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAzNjApO1xufTtcblxuLy8gUHJvdmlkZXMgc29tZSBuaWNlIGNvbG9yIHZhcmlhdGlvblxuLy8gQWNjZXB0cyBhbiByZ2JhIG9iamVjdFxuLy8gcmV0dXJucyBhIG1vZGlmaWVkIHJnYmEgb2JqZWN0IG9yIGEgcmdiYSBzdHJpbmcgaWYgdHJ1ZSBpcyBwYXNzZWQgaW4gZm9yIGFyZ3VtZW50IDJcbmNvbnN0IGNvbG9yVmFyaWF0aW9uID0gZnVuY3Rpb24gKGNvbG9yLCByZXR1cm5TdHJpbmcpIHtcblxuICAgIHZhciByLGcsYixhLCB2YXJpYXRpb247XG4gICAgciA9IE1hdGgucm91bmQoKChNYXRoLnJhbmRvbSgpICogY29uZmlnLmNvbG9yVmFyaWF0aW9uKSAtIChjb25maWcuY29sb3JWYXJpYXRpb24vMikpICsgY29sb3Iucik7XG4gICAgZyA9IE1hdGgucm91bmQoKChNYXRoLnJhbmRvbSgpICogY29uZmlnLmNvbG9yVmFyaWF0aW9uKSAtIChjb25maWcuY29sb3JWYXJpYXRpb24vMikpICsgY29sb3IuZyk7XG4gICAgYiA9IE1hdGgucm91bmQoKChNYXRoLnJhbmRvbSgpICogY29uZmlnLmNvbG9yVmFyaWF0aW9uKSAtIChjb25maWcuY29sb3JWYXJpYXRpb24vMikpICsgY29sb3IuYik7XG4gICAgYSA9IE1hdGgucmFuZG9tKCkgKyAuNTtcbiAgICBpZiAocmV0dXJuU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBcInJnYmEoXCIgKyByICsgXCIsXCIgKyBnICsgXCIsXCIgKyBiICsgXCIsXCIgKyBhICsgXCIpXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtyLGcsYixhfTtcbiAgICB9XG59O1xuXG4vLyBVc2VkIHRvIGZpbmQgdGhlIHJvY2tzIG5leHQgcG9pbnQgaW4gc3BhY2UsIGFjY291bnRpbmcgZm9yIHNwZWVkIGFuZCBkaXJlY3Rpb25cbmNvbnN0IHVwZGF0ZVBhcnRpY2xlTW9kZWwgPSBmdW5jdGlvbiAocCkge1xuXG4gICAgdmFyIGEgPSAxODAgLSAocC5kICsgOTApOyAvLyBmaW5kIHRoZSAzcmQgYW5nbGVcbiAgICBwLmQgPiAwICYmIHAuZCA8IDE4MCA/IHAueCArPSBwLnMgKiBNYXRoLnNpbihwLmQpIC8gTWF0aC5zaW4ocC5zKSA6IHAueCAtPSBwLnMgKiBNYXRoLnNpbihwLmQpIC8gTWF0aC5zaW4ocC5zKTtcbiAgICBwLmQgPiA5MCAmJiBwLmQgPCAyNzAgPyBwLnkgKz0gcC5zICogTWF0aC5zaW4oYSkgLyBNYXRoLnNpbihwLnMpIDogcC55IC09IHAucyAqIE1hdGguc2luKGEpIC8gTWF0aC5zaW4ocC5zKTtcbiAgICByZXR1cm4gcDtcbn07XG5cbmNvbnN0IHRhY29JbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbnRhY29JbWcuc3JjID0gJy9wdWJsaWMvdGFjby5wbmcnO1xuXG4vLyBKdXN0IHRoZSBmdW5jdGlvbiB0aGF0IHBoeXNpY2FsbHkgZHJhd3MgdGhlIHBhcnRpY2xlc1xuLy8gUGh5c2ljYWxseT8gc3VyZSB3aHkgbm90LCBwaHlzaWNhbGx5LlxuY29uc3QgZHJhd1BhcnRpY2xlID0gZnVuY3Rpb24gKHgsIHksIHIsIGMpIHtcblxuICAgIGNvbnN0IHNpemUgPSByICogMjtcblxuICAgIC8vIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSc7IC8vIGNvcHkgcGl4ZWwtdG8tcGl4ZWwgc291cmNlIGltYWdlXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG4gICAgY3R4LmRyYXdJbWFnZSh0YWNvSW1nLCB4LCB5LCBzaXplLCBzaXplKTtcbiAgICAvLyBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgICAvLyBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ211bHRpcGx5JzsgLy8gbXVsdGlwbHkgaXQgYnkgY29sb3JcbiAgICAvLyBjdHguZmlsbFN0eWxlID0gYztcbiAgICAvLyBjdHguZmlsbFN0eWxlID0gJyNmZjAwMDAnO1xuICAgIC8vIGN0eC5maWxsUmVjdCh4LCB5LCBzaXplLCBzaXplKTtcbiAgICAvLyBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLWF0b3AnOyAvLyByZXN0b3JlIHRyYW5zcGFyZW5jeVxuICAgIC8vIGN0eC5kcmF3SW1hZ2UodGFjb0ltZywgeCwgeSwgc2l6ZSwgc2l6ZSk7XG4gICAgLy8gY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG59O1xuXG4vLyBSZW1vdmUgcGFydGljbGVzIHRoYXQgYXJlbid0IG9uIHRoZSBjYW52YXNcbmNvbnN0IGNsZWFuVXBBcnJheSA9IGZ1bmN0aW9uICgpIHtcbiAgICBwYXJ0aWNsZXMgPSBwYXJ0aWNsZXMuZmlsdGVyKChwKSA9PiB7XG4gICAgICByZXR1cm4gKHAueCA+IC0xMDAgJiYgcC55ID4gLTEwMCk7XG4gICAgfSk7XG59O1xuXG5jb25zdCBpbml0UGFydGljbGVzID0gZnVuY3Rpb24gKG51bVBhcnRpY2xlcywgeCwgeSkge1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1QYXJ0aWNsZXM7IGkrKykge1xuICAgICAgICBwYXJ0aWNsZXMucHVzaChuZXcgUGFydGljbGUoeCwgeSkpO1xuICAgIH1cblxuICAgIHBhcnRpY2xlcy5mb3JFYWNoKChwKSA9PiB7XG5cbiAgICAgICAgZHJhd1BhcnRpY2xlKHAueCwgcC55LCBwLnIsIHAuYyk7XG4gICAgfSk7XG59O1xuXG4vLyBUaGF0IHRoaW5nXG53aW5kb3cucmVxdWVzdEFuaW1GcmFtZSA9ICgoKSA9PiB7XG5cbiAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xuICAgICB9O1xufSkoKTtcblxuLy8gT3VyIEZyYW1lIGZ1bmN0aW9uXG5jb25zdCBmcmFtZSA9ICgpID0+IHtcbiAgLy8gRHJhdyBiYWNrZ3JvdW5kIGZpcnN0XG4gIGRyYXdCZyhjdHgsIGNvbG9yUGFsZXR0ZS5iZyk7XG4gIC8vIFVwZGF0ZSBQYXJ0aWNsZSBtb2RlbHMgdG8gbmV3IHBvc2l0aW9uXG4gIHBhcnRpY2xlcy5tYXAoKHApID0+IHtcbiAgICByZXR1cm4gdXBkYXRlUGFydGljbGVNb2RlbChwKTtcbiAgfSk7XG4gIC8vIERyYXcgZW0nXG4gIHBhcnRpY2xlcy5mb3JFYWNoKChwKSA9PiB7XG5cbiAgICAgICAgZHJhd1BhcnRpY2xlKHAueCwgcC55LCBwLnIsIHAuYyk7XG4gIH0pO1xuICAvLyBQbGF5IHRoZSBzYW1lIHNvbmc/IE9rIVxuICB3aW5kb3cucmVxdWVzdEFuaW1GcmFtZShmcmFtZSk7XG59O1xuXG4vLyBGaXJzdCBGcmFtZVxuZnJhbWUoKTtcblxuLy8gRmlyc3QgcGFydGljbGUgZXhwbG9zaW9uXG5pbml0UGFydGljbGVzKGNvbmZpZy5wYXJ0aWNsZU51bWJlcik7XG5cbmV4cG9ydHMuZ2VuUGFydGljbGVzID0gKHgsIHkpID0+IHtcblxuICAgIGNsZWFuVXBBcnJheSgpO1xuICAgIGluaXRQYXJ0aWNsZXMoY29uZmlnLnBhcnRpY2xlTnVtYmVyLCB4LCB5KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qXG4gICAgKGhhcGkpbmVzIFdlYlNvY2tldCBDbGllbnQgKGh0dHBzOi8vZ2l0aHViLmNvbS9oYXBpanMvbmVzKVxuICAgIENvcHlyaWdodCAoYykgMjAxNS0yMDE2LCBFcmFuIEhhbW1lciA8ZXJhbkBoYW1tZXIuaW8+IGFuZCBvdGhlciBjb250cmlidXRvcnNcbiAgICBCU0QgTGljZW5zZWRcbiovXG5cbi8qIGVzbGludCBuby11bmRlZjogMCAqL1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcblxuICAgIC8vICRsYWI6Y292ZXJhZ2U6b2ZmJFxuXG4gICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTsgICAgICAgICAgICAgICAgIC8vIEV4cG9ydCBpZiB1c2VkIGFzIGEgbW9kdWxlXG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoZmFjdG9yeSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBleHBvcnRzLm5lcyA9IGZhY3RvcnkoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJvb3QubmVzID0gZmFjdG9yeSgpO1xuICAgIH1cblxuICAgIC8vICRsYWI6Y292ZXJhZ2U6b24kXG5cbn0pKC8qICRsYWI6Y292ZXJhZ2U6b2ZmJCAqLyB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCAvKiAkbGFiOmNvdmVyYWdlOm9uJCAqLywgKCkgPT4ge1xuXG4gICAgLy8gVXRpbGl0aWVzXG5cbiAgICBjb25zdCB2ZXJzaW9uID0gJzInO1xuICAgIGNvbnN0IGlnbm9yZSA9IGZ1bmN0aW9uICgpIHsgfTtcblxuICAgIGNvbnN0IHN0cmluZ2lmeSA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTmVzRXJyb3IoZXJyLCBlcnJvclR5cGVzLlVTRVIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG5leHRUaWNrID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cbiAgICAgICAgcmV0dXJuIChlcnIpID0+IHtcblxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBjYWxsYmFjayhlcnIpLCAwKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLy8gTmVzRXJyb3IgdHlwZXNcblxuICAgIGNvbnN0IGVycm9yVHlwZXMgPSB7XG4gICAgICAgIFRJTUVPVVQ6ICd0aW1lb3V0JyxcbiAgICAgICAgRElTQ09OTkVDVDogJ2Rpc2Nvbm5lY3QnLFxuICAgICAgICBTRVJWRVI6ICdzZXJ2ZXInLFxuICAgICAgICBQUk9UT0NPTDogJ3Byb3RvY29sJyxcbiAgICAgICAgV1M6ICd3cycsXG4gICAgICAgIFVTRVI6ICd1c2VyJ1xuICAgIH07XG5cbiAgICBjb25zdCBOZXNFcnJvciA9IGZ1bmN0aW9uIChlcnIsIHR5cGUpIHtcblxuICAgICAgICBpZiAodHlwZW9mIGVyciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGVyciA9IG5ldyBFcnJvcihlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgZXJyLnR5cGUgPSB0eXBlO1xuICAgICAgICBlcnIuaXNOZXMgPSB0cnVlO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7IC8vIGVuc3VyZSBzdGFjayB0cmFjZSBmb3IgSUUxMVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoICh3aXRoU3RhY2spIHtcbiAgICAgICAgICAgIHJldHVybiB3aXRoU3RhY2s7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gRXJyb3IgY29kZXNcblxuICAgIGNvbnN0IGVycm9yQ29kZXMgPSB7XG4gICAgICAgIDEwMDA6ICdOb3JtYWwgY2xvc3VyZScsXG4gICAgICAgIDEwMDE6ICdHb2luZyBhd2F5JyxcbiAgICAgICAgMTAwMjogJ1Byb3RvY29sIGVycm9yJyxcbiAgICAgICAgMTAwMzogJ1Vuc3VwcG9ydGVkIGRhdGEnLFxuICAgICAgICAxMDA0OiAnUmVzZXJ2ZWQnLFxuICAgICAgICAxMDA1OiAnTm8gc3RhdHVzIHJlY2VpdmVkJyxcbiAgICAgICAgMTAwNjogJ0Fibm9ybWFsIGNsb3N1cmUnLFxuICAgICAgICAxMDA3OiAnSW52YWxpZCBmcmFtZSBwYXlsb2FkIGRhdGEnLFxuICAgICAgICAxMDA4OiAnUG9saWN5IHZpb2xhdGlvbicsXG4gICAgICAgIDEwMDk6ICdNZXNzYWdlIHRvbyBiaWcnLFxuICAgICAgICAxMDEwOiAnTWFuZGF0b3J5IGV4dGVuc2lvbicsXG4gICAgICAgIDEwMTE6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InLFxuICAgICAgICAxMDE1OiAnVExTIGhhbmRzaGFrZSdcbiAgICB9O1xuXG4gICAgLy8gQ2xpZW50XG5cbiAgICBjb25zdCBDbGllbnQgPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XG5cbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgdGhpcy5faXNCcm93c2VyID0gdHlwZW9mIFdlYlNvY2tldCAhPT0gJ3VuZGVmaW5lZCc7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9pc0Jyb3dzZXIpIHtcbiAgICAgICAgICAgIG9wdGlvbnMud3MgPSBvcHRpb25zLndzIHx8IHt9O1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy53cy5tYXhQYXlsb2FkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLndzLm1heFBheWxvYWQgPSAwOyAgICAgICAgICAgICAgLy8gT3ZlcnJpZGUgZGVmYXVsdCAxMDBNYiBsaW1pdCBpbiB3cyBtb2R1bGUgdG8gYXZvaWQgYnJlYWtpbmcgY2hhbmdlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb25maWd1cmF0aW9uXG5cbiAgICAgICAgdGhpcy5fdXJsID0gdXJsO1xuICAgICAgICB0aGlzLl9zZXR0aW5ncyA9IG9wdGlvbnM7XG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXQgPSBmYWxzZTsgICAgICAgICAgICAgLy8gU2VydmVyIGhlYXJ0YmVhdCBjb25maWd1cmF0aW9uXG5cbiAgICAgICAgLy8gU3RhdGVcblxuICAgICAgICB0aGlzLl93cyA9IG51bGw7XG4gICAgICAgIHRoaXMuX3JlY29ubmVjdGlvbiA9IG51bGw7XG4gICAgICAgIHRoaXMuX3JlY29ubmVjdGlvblRpbWVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5faWRzID0gMDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZCBjb3VudGVyXG4gICAgICAgIHRoaXMuX3JlcXVlc3RzID0ge307ICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWQgLT4geyByZXNvbHZlLCByZWplY3QsIHRpbWVvdXQgfVxuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0ge307ICAgICAgICAgICAgICAgICAgIC8vIHBhdGggLT4gW2NhbGxiYWNrc11cbiAgICAgICAgdGhpcy5faGVhcnRiZWF0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcGFja2V0cyA9IFtdO1xuICAgICAgICB0aGlzLl9kaXNjb25uZWN0TGlzdGVuZXJzID0gbnVsbDtcbiAgICAgICAgdGhpcy5fZGlzY29ubmVjdFJlcXVlc3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIEV2ZW50c1xuXG4gICAgICAgIHRoaXMub25FcnJvciA9IChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyKTsgLy8gR2VuZXJhbCBlcnJvciBoYW5kbGVyIChvbmx5IHdoZW4gYW4gZXJyb3IgY2Fubm90IGJlIGFzc29jaWF0ZWQgd2l0aCBhIHJlcXVlc3QpXG4gICAgICAgIHRoaXMub25Db25uZWN0ID0gaWdub3JlOyAgICAgICAgICAgICAgICAgICAgLy8gQ2FsbGVkIHdoZW5ldmVyIGEgY29ubmVjdGlvbiBpcyBlc3RhYmxpc2hlZFxuICAgICAgICB0aGlzLm9uRGlzY29ubmVjdCA9IGlnbm9yZTsgICAgICAgICAgICAgICAgIC8vIENhbGxlZCB3aGVuZXZlciBhIGNvbm5lY3Rpb24gaXMgbG9zdDogZnVuY3Rpb24od2lsbFJlY29ubmVjdClcbiAgICAgICAgdGhpcy5vbkhlYXJ0YmVhdFRpbWVvdXQgPSBpZ25vcmU7ICAgICAgICAgICAvLyBDYWxsZWQgd2hlbiBhIGhlYXJ0YmVhdCB0aW1lb3V0IHdpbGwgY2F1c2UgYSBkaXNjb25uZWN0aW9uXG4gICAgICAgIHRoaXMub25VcGRhdGUgPSBpZ25vcmU7XG5cbiAgICAgICAgLy8gUHVibGljIHByb3BlcnRpZXNcblxuICAgICAgICB0aGlzLmlkID0gbnVsbDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFzc2lnbmVkIHdoZW4gaGVsbG8gcmVzcG9uc2UgaXMgcmVjZWl2ZWRcbiAgICB9O1xuXG4gICAgQ2xpZW50LldlYlNvY2tldCA9IC8qICRsYWI6Y292ZXJhZ2U6b2ZmJCAqLyAodHlwZW9mIFdlYlNvY2tldCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogV2ViU29ja2V0KTsgLyogJGxhYjpjb3ZlcmFnZTpvbiQgKi9cblxuICAgIENsaWVudC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgaWYgKHRoaXMuX3JlY29ubmVjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBOZXNFcnJvcignQ2Fubm90IGNvbm5lY3Qgd2hpbGUgY2xpZW50IGF0dGVtcHRzIHRvIHJlY29ubmVjdCcsIGVycm9yVHlwZXMuVVNFUikpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX3dzKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IE5lc0Vycm9yKCdBbHJlYWR5IGNvbm5lY3RlZCcsIGVycm9yVHlwZXMuVVNFUikpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMucmVjb25uZWN0ICE9PSBmYWxzZSkgeyAgICAgICAgICAgICAgICAgIC8vIERlZmF1bHRzIHRvIHRydWVcbiAgICAgICAgICAgIHRoaXMuX3JlY29ubmVjdGlvbiA9IHsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wdGlvbnM6IHJlY29ubmVjdCwgZGVsYXksIG1heERlbGF5XG4gICAgICAgICAgICAgICAgd2FpdDogMCxcbiAgICAgICAgICAgICAgICBkZWxheTogb3B0aW9ucy5kZWxheSB8fCAxMDAwLCAgICAgICAgICAgICAgIC8vIDEgc2Vjb25kXG4gICAgICAgICAgICAgICAgbWF4RGVsYXk6IG9wdGlvbnMubWF4RGVsYXkgfHwgNTAwMCwgICAgICAgICAvLyA1IHNlY29uZHNcbiAgICAgICAgICAgICAgICByZXRyaWVzOiBvcHRpb25zLnJldHJpZXMgfHwgSW5maW5pdHksICAgICAgIC8vIFVubGltaXRlZFxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IG9wdGlvbnMuYXV0aCxcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogb3B0aW9ucy50aW1lb3V0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3JlY29ubmVjdGlvbiA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0KG9wdGlvbnMsIHRydWUsIChlcnIpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuX2Nvbm5lY3QgPSBmdW5jdGlvbiAob3B0aW9ucywgaW5pdGlhbCwgbmV4dCkge1xuXG4gICAgICAgIGNvbnN0IHdzID0gdGhpcy5faXNCcm93c2VyID8gbmV3IENsaWVudC5XZWJTb2NrZXQodGhpcy5fdXJsKSA6IG5ldyBDbGllbnQuV2ViU29ja2V0KHRoaXMuX3VybCwgdGhpcy5fc2V0dGluZ3Mud3MpO1xuICAgICAgICB0aGlzLl93cyA9IHdzO1xuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3Rpb25UaW1lcik7XG4gICAgICAgIHRoaXMuX3JlY29ubmVjdGlvblRpbWVyID0gbnVsbDtcblxuICAgICAgICBjb25zdCByZWNvbm5lY3QgPSAoZXZlbnQpID0+IHtcblxuICAgICAgICAgICAgaWYgKHdzLm9ub3Blbikge1xuICAgICAgICAgICAgICAgIGZpbmFsaXplKG5ldyBOZXNFcnJvcignQ29ubmVjdGlvbiB0ZXJtaW5hdGVkIHdoaWxlIHdhaXRpbmcgdG8gY29ubmVjdCcsIGVycm9yVHlwZXMuV1MpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgd2FzUmVxdWVzdGVkID0gdGhpcy5fZGlzY29ubmVjdFJlcXVlc3RlZDsgICAgICAgICAvLyBHZXQgdmFsdWUgYmVmb3JlIF9jbGVhbnVwKClcblxuICAgICAgICAgICAgdGhpcy5fY2xlYW51cCgpO1xuXG4gICAgICAgICAgICBjb25zdCBsb2cgPSB7XG4gICAgICAgICAgICAgICAgY29kZTogZXZlbnQuY29kZSxcbiAgICAgICAgICAgICAgICBleHBsYW5hdGlvbjogZXJyb3JDb2Rlc1tldmVudC5jb2RlXSB8fCAnVW5rbm93bicsXG4gICAgICAgICAgICAgICAgcmVhc29uOiBldmVudC5yZWFzb24sXG4gICAgICAgICAgICAgICAgd2FzQ2xlYW46IGV2ZW50Lndhc0NsZWFuLFxuICAgICAgICAgICAgICAgIHdpbGxSZWNvbm5lY3Q6IHRoaXMuX3dpbGxSZWNvbm5lY3QoKSxcbiAgICAgICAgICAgICAgICB3YXNSZXF1ZXN0ZWRcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMub25EaXNjb25uZWN0KGxvZy53aWxsUmVjb25uZWN0LCBsb2cpO1xuICAgICAgICAgICAgdGhpcy5fcmVjb25uZWN0KCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZmluYWxpemUgPSAoZXJyKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChuZXh0KSB7ICAgICAgICAgICAgICAgICAgICAgLy8gQ2FsbCBvbmx5IG9uY2Ugd2hlbiBjb25uZWN0KCkgaXMgY2FsbGVkXG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dEhvbGRlciA9IG5leHQ7XG4gICAgICAgICAgICAgICAgbmV4dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5leHRIb2xkZXIoZXJyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub25FcnJvcihlcnIpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHRpbWVvdXRIYW5kbGVyID0gKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLl9jbGVhbnVwKCk7XG5cbiAgICAgICAgICAgIGZpbmFsaXplKG5ldyBOZXNFcnJvcignQ29ubmVjdGlvbiB0aW1lZCBvdXQnLCBlcnJvclR5cGVzLlRJTUVPVVQpKTtcblxuICAgICAgICAgICAgaWYgKGluaXRpYWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVjb25uZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgdGltZW91dCA9IChvcHRpb25zLnRpbWVvdXQgPyBzZXRUaW1lb3V0KHRpbWVvdXRIYW5kbGVyLCBvcHRpb25zLnRpbWVvdXQpIDogbnVsbCk7XG5cbiAgICAgICAgd3Mub25vcGVuID0gKCkgPT4ge1xuXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgICB3cy5vbm9wZW4gPSBudWxsO1xuXG4gICAgICAgICAgICB0aGlzLl9oZWxsbyhvcHRpb25zLmF1dGgpXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25Db25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsaXplKCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIucGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3N1YnNjcmlwdGlvbnNbZXJyLnBhdGhdO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzY29ubmVjdCgoKSA9PiBuZXh0VGljayhmaW5hbGl6ZSkoZXJyKSwgdHJ1ZSk7ICAgICAgICAgLy8gU3RvcCByZWNvbm5lY3Rpb24gd2hlbiB0aGUgaGVsbG8gbWVzc2FnZSByZXR1cm5zIGVycm9yXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgd3Mub25lcnJvciA9IChldmVudCkgPT4ge1xuXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl93aWxsUmVjb25uZWN0KCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjb25uZWN0KGV2ZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fY2xlYW51cCgpO1xuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgTmVzRXJyb3IoJ1NvY2tldCBlcnJvcicsIGVycm9yVHlwZXMuV1MpO1xuICAgICAgICAgICAgcmV0dXJuIGZpbmFsaXplKGVycm9yKTtcbiAgICAgICAgfTtcblxuICAgICAgICB3cy5vbmNsb3NlID0gcmVjb25uZWN0O1xuXG4gICAgICAgIHdzLm9ubWVzc2FnZSA9IChtZXNzYWdlKSA9PiB7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9vbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUub3ZlcnJpZGVSZWNvbm5lY3Rpb25BdXRoID0gZnVuY3Rpb24gKGF1dGgpIHtcblxuICAgICAgICBpZiAoIXRoaXMuX3JlY29ubmVjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcmVjb25uZWN0aW9uLnNldHRpbmdzLmF1dGggPSBhdXRoO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5yZWF1dGhlbnRpY2F0ZSA9IGZ1bmN0aW9uIChhdXRoKSB7XG5cbiAgICAgICAgdGhpcy5vdmVycmlkZVJlY29ubmVjdGlvbkF1dGgoYXV0aCk7XG5cbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdyZWF1dGgnLFxuICAgICAgICAgICAgYXV0aFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZW5kKHJlcXVlc3QsIHRydWUpO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB0aGlzLl9kaXNjb25uZWN0KHJlc29sdmUsIGZhbHNlKSk7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuX2Rpc2Nvbm5lY3QgPSBmdW5jdGlvbiAobmV4dCwgaXNJbnRlcm5hbCkge1xuXG4gICAgICAgIHRoaXMuX3JlY29ubmVjdGlvbiA9IG51bGw7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3Rpb25UaW1lcik7XG4gICAgICAgIHRoaXMuX3JlY29ubmVjdGlvblRpbWVyID0gbnVsbDtcbiAgICAgICAgY29uc3QgcmVxdWVzdGVkID0gdGhpcy5fZGlzY29ubmVjdFJlcXVlc3RlZCB8fCAhaXNJbnRlcm5hbDsgICAgICAgLy8gUmV0YWluIHRydWVcblxuICAgICAgICBpZiAodGhpcy5fZGlzY29ubmVjdExpc3RlbmVycykge1xuICAgICAgICAgICAgdGhpcy5fZGlzY29ubmVjdFJlcXVlc3RlZCA9IHJlcXVlc3RlZDtcbiAgICAgICAgICAgIHRoaXMuX2Rpc2Nvbm5lY3RMaXN0ZW5lcnMucHVzaChuZXh0KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5fd3MgfHxcbiAgICAgICAgICAgICh0aGlzLl93cy5yZWFkeVN0YXRlICE9PSBDbGllbnQuV2ViU29ja2V0Lk9QRU4gJiYgdGhpcy5fd3MucmVhZHlTdGF0ZSAhPT0gQ2xpZW50LldlYlNvY2tldC5DT05ORUNUSU5HKSkge1xuXG4gICAgICAgICAgICByZXR1cm4gbmV4dCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZGlzY29ubmVjdFJlcXVlc3RlZCA9IHJlcXVlc3RlZDtcbiAgICAgICAgdGhpcy5fZGlzY29ubmVjdExpc3RlbmVycyA9IFtuZXh0XTtcbiAgICAgICAgdGhpcy5fd3MuY2xvc2UoKTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5fY2xlYW51cCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBpZiAodGhpcy5fd3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHdzID0gdGhpcy5fd3M7XG4gICAgICAgICAgICB0aGlzLl93cyA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmICh3cy5yZWFkeVN0YXRlICE9PSBDbGllbnQuV2ViU29ja2V0LkNMT1NFRCAmJlxuICAgICAgICAgICAgICAgIHdzLnJlYWR5U3RhdGUgIT09IENsaWVudC5XZWJTb2NrZXQuQ0xPU0lORykge1xuXG4gICAgICAgICAgICAgICAgd3MuY2xvc2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd3Mub25vcGVuID0gbnVsbDtcbiAgICAgICAgICAgIHdzLm9uY2xvc2UgPSBudWxsO1xuICAgICAgICAgICAgd3Mub25lcnJvciA9IGlnbm9yZTtcbiAgICAgICAgICAgIHdzLm9ubWVzc2FnZSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wYWNrZXRzID0gW107XG4gICAgICAgIHRoaXMuaWQgPSBudWxsO1xuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXQpO1xuICAgICAgICB0aGlzLl9oZWFydGJlYXQgPSBudWxsO1xuXG4gICAgICAgIC8vIEZsdXNoIHBlbmRpbmcgcmVxdWVzdHNcblxuICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBOZXNFcnJvcignUmVxdWVzdCBmYWlsZWQgLSBzZXJ2ZXIgZGlzY29ubmVjdGVkJywgZXJyb3JUeXBlcy5ESVNDT05ORUNUKTtcblxuICAgICAgICBjb25zdCByZXF1ZXN0cyA9IHRoaXMuX3JlcXVlc3RzO1xuICAgICAgICB0aGlzLl9yZXF1ZXN0cyA9IHt9O1xuICAgICAgICBjb25zdCBpZHMgPSBPYmplY3Qua2V5cyhyZXF1ZXN0cyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaWRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IGlkc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3QgPSByZXF1ZXN0c1tpZF07XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQocmVxdWVzdC50aW1lb3V0KTtcbiAgICAgICAgICAgIHJlcXVlc3QucmVqZWN0KGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9kaXNjb25uZWN0TGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9kaXNjb25uZWN0TGlzdGVuZXJzO1xuICAgICAgICAgICAgdGhpcy5fZGlzY29ubmVjdExpc3RlbmVycyA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9kaXNjb25uZWN0UmVxdWVzdGVkID0gZmFsc2U7XG4gICAgICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IGxpc3RlbmVyKCkpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuX3JlY29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAvLyBSZWNvbm5lY3RcblxuICAgICAgICBjb25zdCByZWNvbm5lY3Rpb24gPSB0aGlzLl9yZWNvbm5lY3Rpb247XG4gICAgICAgIGlmICghcmVjb25uZWN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVjb25uZWN0aW9uLnJldHJpZXMgPCAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGlzY29ubmVjdChpZ25vcmUsIHRydWUpOyAgICAgIC8vIENsZWFyIF9yZWNvbm5lY3Rpb24gc3RhdGVcbiAgICAgICAgfVxuXG4gICAgICAgIC0tcmVjb25uZWN0aW9uLnJldHJpZXM7XG4gICAgICAgIHJlY29ubmVjdGlvbi53YWl0ID0gcmVjb25uZWN0aW9uLndhaXQgKyByZWNvbm5lY3Rpb24uZGVsYXk7XG5cbiAgICAgICAgY29uc3QgdGltZW91dCA9IE1hdGgubWluKHJlY29ubmVjdGlvbi53YWl0LCByZWNvbm5lY3Rpb24ubWF4RGVsYXkpO1xuXG4gICAgICAgIHRoaXMuX3JlY29ubmVjdGlvblRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3QocmVjb25uZWN0aW9uLnNldHRpbmdzLCBmYWxzZSwgKGVycikgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcblxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgcGF0aDogb3B0aW9uc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICB0eXBlOiAncmVxdWVzdCcsXG4gICAgICAgICAgICBtZXRob2Q6IG9wdGlvbnMubWV0aG9kIHx8ICdHRVQnLFxuICAgICAgICAgICAgcGF0aDogb3B0aW9ucy5wYXRoLFxuICAgICAgICAgICAgaGVhZGVyczogb3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgcGF5bG9hZDogb3B0aW9ucy5wYXlsb2FkXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmQocmVxdWVzdCwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUubWVzc2FnZSA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG5cbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdtZXNzYWdlJyxcbiAgICAgICAgICAgIG1lc3NhZ2VcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fc2VuZChyZXF1ZXN0LCB0cnVlKTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5faXNSZWFkeSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fd3MgJiYgdGhpcy5fd3MucmVhZHlTdGF0ZSA9PT0gQ2xpZW50LldlYlNvY2tldC5PUEVOO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLl9zZW5kID0gZnVuY3Rpb24gKHJlcXVlc3QsIHRyYWNrKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9pc1JlYWR5KCkpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgTmVzRXJyb3IoJ0ZhaWxlZCB0byBzZW5kIG1lc3NhZ2UgLSBzZXJ2ZXIgZGlzY29ubmVjdGVkJywgZXJyb3JUeXBlcy5ESVNDT05ORUNUKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmlkID0gKyt0aGlzLl9pZHM7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBlbmNvZGVkID0gc3RyaW5naWZ5KHJlcXVlc3QpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWdub3JlIGVycm9yc1xuXG4gICAgICAgIGlmICghdHJhY2spIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fd3Muc2VuZChlbmNvZGVkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBOZXNFcnJvcihlcnIsIGVycm9yVHlwZXMuV1MpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRyYWNrIGVycm9yc1xuXG4gICAgICAgIGNvbnN0IHJlY29yZCA9IHtcbiAgICAgICAgICAgIHJlc29sdmU6IG51bGwsXG4gICAgICAgICAgICByZWplY3Q6IG51bGwsXG4gICAgICAgICAgICB0aW1lb3V0OiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgcmVjb3JkLnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICAgICAgcmVjb3JkLnJlamVjdCA9IHJlamVjdDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMuX3NldHRpbmdzLnRpbWVvdXQpIHtcbiAgICAgICAgICAgIHJlY29yZC50aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICByZWNvcmQudGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY29yZC5yZWplY3QobmV3IE5lc0Vycm9yKCdSZXF1ZXN0IHRpbWVkIG91dCcsIGVycm9yVHlwZXMuVElNRU9VVCkpO1xuICAgICAgICAgICAgfSwgdGhpcy5fc2V0dGluZ3MudGltZW91dCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9yZXF1ZXN0c1tyZXF1ZXN0LmlkXSA9IHJlY29yZDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5fd3Muc2VuZChlbmNvZGVkKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVxdWVzdHNbcmVxdWVzdC5pZF0udGltZW91dCk7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fcmVxdWVzdHNbcmVxdWVzdC5pZF07XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IE5lc0Vycm9yKGVyciwgZXJyb3JUeXBlcy5XUykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuX2hlbGxvID0gZnVuY3Rpb24gKGF1dGgpIHtcblxuICAgICAgICBjb25zdCByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ2hlbGxvJyxcbiAgICAgICAgICAgIHZlcnNpb25cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoYXV0aCkge1xuICAgICAgICAgICAgcmVxdWVzdC5hdXRoID0gYXV0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN1YnMgPSB0aGlzLnN1YnNjcmlwdGlvbnMoKTtcbiAgICAgICAgaWYgKHN1YnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXF1ZXN0LnN1YnMgPSBzdWJzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmQocmVxdWVzdCwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuc3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fc3Vic2NyaXB0aW9ucyk7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gKHBhdGgsIGhhbmRsZXIpIHtcblxuICAgICAgICBpZiAoIXBhdGggfHxcbiAgICAgICAgICAgIHBhdGhbMF0gIT09ICcvJykge1xuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IE5lc0Vycm9yKCdJbnZhbGlkIHBhdGgnLCBlcnJvclR5cGVzLlVTRVIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN1YnMgPSB0aGlzLl9zdWJzY3JpcHRpb25zW3BhdGhdO1xuICAgICAgICBpZiAoc3Vicykge1xuXG4gICAgICAgICAgICAvLyBBbHJlYWR5IHN1YnNjcmliZWRcblxuICAgICAgICAgICAgaWYgKHN1YnMuaW5kZXhPZihoYW5kbGVyKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBzdWJzLnB1c2goaGFuZGxlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnNbcGF0aF0gPSBbaGFuZGxlcl07XG5cbiAgICAgICAgaWYgKCF0aGlzLl9pc1JlYWR5KCkpIHtcblxuICAgICAgICAgICAgLy8gUXVldWVkIHN1YnNjcmlwdGlvblxuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ3N1YicsXG4gICAgICAgICAgICBwYXRoXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IHRoaXMuX3NlbmQocmVxdWVzdCwgdHJ1ZSk7XG4gICAgICAgIHByb21pc2UuY2F0Y2goKGlnbm9yZUVycikgPT4ge1xuXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fc3Vic2NyaXB0aW9uc1twYXRoXTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiAocGF0aCwgaGFuZGxlcikge1xuXG4gICAgICAgIGlmICghcGF0aCB8fFxuICAgICAgICAgICAgcGF0aFswXSAhPT0gJy8nKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgTmVzRXJyb3IoJ0ludmFsaWQgcGF0aCcsIGVycm9yVHlwZXMuVVNFUikpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3VicyA9IHRoaXMuX3N1YnNjcmlwdGlvbnNbcGF0aF07XG4gICAgICAgIGlmICghc3Vicykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHN5bmMgPSBmYWxzZTtcbiAgICAgICAgaWYgKCFoYW5kbGVyKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fc3Vic2NyaXB0aW9uc1twYXRoXTtcbiAgICAgICAgICAgIHN5bmMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcG9zID0gc3Vicy5pbmRleE9mKGhhbmRsZXIpO1xuICAgICAgICAgICAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN1YnMuc3BsaWNlKHBvcywgMSk7XG4gICAgICAgICAgICBpZiAoIXN1YnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3N1YnNjcmlwdGlvbnNbcGF0aF07XG4gICAgICAgICAgICAgICAgc3luYyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXN5bmMgfHxcbiAgICAgICAgICAgICF0aGlzLl9pc1JlYWR5KCkpIHtcblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICd1bnN1YicsXG4gICAgICAgICAgICBwYXRoXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IHRoaXMuX3NlbmQocmVxdWVzdCwgdHJ1ZSk7XG4gICAgICAgIHByb21pc2UuY2F0Y2goaWdub3JlKTsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElnbm9yaW5nIGVycm9ycyBhcyB0aGUgc3Vic2NyaXB0aW9uIGhhbmRsZXJzIGFyZSBhbHJlYWR5IHJlbW92ZWRcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuX29uTWVzc2FnZSA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG5cbiAgICAgICAgdGhpcy5fYmVhdCgpO1xuXG4gICAgICAgIGxldCBkYXRhID0gbWVzc2FnZS5kYXRhO1xuICAgICAgICBjb25zdCBwcmVmaXggPSBkYXRhWzBdO1xuICAgICAgICBpZiAocHJlZml4ICE9PSAneycpIHtcbiAgICAgICAgICAgIHRoaXMuX3BhY2tldHMucHVzaChkYXRhLnNsaWNlKDEpKTtcbiAgICAgICAgICAgIGlmIChwcmVmaXggIT09ICchJykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGF0YSA9IHRoaXMuX3BhY2tldHMuam9pbignJyk7XG4gICAgICAgICAgICB0aGlzLl9wYWNrZXRzID0gW107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fcGFja2V0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuX3BhY2tldHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMub25FcnJvcihuZXcgTmVzRXJyb3IoJ1JlY2VpdmVkIGFuIGluY29tcGxldGUgbWVzc2FnZScsIGVycm9yVHlwZXMuUFJPVE9DT0wpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgdXBkYXRlID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbkVycm9yKG5ldyBOZXNFcnJvcihlcnIsIGVycm9yVHlwZXMuUFJPVE9DT0wpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlY3JlYXRlIGVycm9yXG5cbiAgICAgICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICAgICAgaWYgKHVwZGF0ZS5zdGF0dXNDb2RlICYmXG4gICAgICAgICAgICB1cGRhdGUuc3RhdHVzQ29kZSA+PSA0MDApIHtcblxuICAgICAgICAgICAgZXJyb3IgPSBuZXcgTmVzRXJyb3IodXBkYXRlLnBheWxvYWQubWVzc2FnZSB8fCB1cGRhdGUucGF5bG9hZC5lcnJvciB8fCAnRXJyb3InLCBlcnJvclR5cGVzLlNFUlZFUik7XG4gICAgICAgICAgICBlcnJvci5zdGF0dXNDb2RlID0gdXBkYXRlLnN0YXR1c0NvZGU7XG4gICAgICAgICAgICBlcnJvci5kYXRhID0gdXBkYXRlLnBheWxvYWQ7XG4gICAgICAgICAgICBlcnJvci5oZWFkZXJzID0gdXBkYXRlLmhlYWRlcnM7XG4gICAgICAgICAgICBlcnJvci5wYXRoID0gdXBkYXRlLnBhdGg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQaW5nXG5cbiAgICAgICAgaWYgKHVwZGF0ZS50eXBlID09PSAncGluZycpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZW5kKHsgdHlwZTogJ3BpbmcnIH0sIGZhbHNlKS5jYXRjaChpZ25vcmUpOyAgICAgICAgIC8vIElnbm9yZSBlcnJvcnNcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJyb2FkY2FzdCBhbmQgdXBkYXRlXG5cbiAgICAgICAgaWYgKHVwZGF0ZS50eXBlID09PSAndXBkYXRlJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub25VcGRhdGUodXBkYXRlLm1lc3NhZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHVibGlzaCBvciBSZXZva2VcblxuICAgICAgICBpZiAodXBkYXRlLnR5cGUgPT09ICdwdWInIHx8XG4gICAgICAgICAgICB1cGRhdGUudHlwZSA9PT0gJ3Jldm9rZScpIHtcblxuICAgICAgICAgICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLl9zdWJzY3JpcHRpb25zW3VwZGF0ZS5wYXRoXTtcbiAgICAgICAgICAgIGlmICh1cGRhdGUudHlwZSA9PT0gJ3Jldm9rZScpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fc3Vic2NyaXB0aW9uc1t1cGRhdGUucGF0aF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChoYW5kbGVycyAmJlxuICAgICAgICAgICAgICAgIHVwZGF0ZS5tZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGZsYWdzID0ge307XG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZS50eXBlID09PSAncmV2b2tlJykge1xuICAgICAgICAgICAgICAgICAgICBmbGFncy5yZXZva2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2ldKHVwZGF0ZS5tZXNzYWdlLCBmbGFncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb29rdXAgcmVxdWVzdCAobWVzc2FnZSBtdXN0IGluY2x1ZGUgYW4gaWQgZnJvbSB0aGlzIHBvaW50KVxuXG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLl9yZXF1ZXN0c1t1cGRhdGUuaWRdO1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uRXJyb3IobmV3IE5lc0Vycm9yKCdSZWNlaXZlZCByZXNwb25zZSBmb3IgdW5rbm93biByZXF1ZXN0JywgZXJyb3JUeXBlcy5QUk9UT0NPTCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHJlcXVlc3QudGltZW91dCk7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9yZXF1ZXN0c1t1cGRhdGUuaWRdO1xuXG4gICAgICAgIGNvbnN0IG5leHQgPSAoZXJyLCBhcmdzKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdC5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QucmVzb2x2ZShhcmdzKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBSZXNwb25zZVxuXG4gICAgICAgIGlmICh1cGRhdGUudHlwZSA9PT0gJ3JlcXVlc3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dChlcnJvciwgeyBwYXlsb2FkOiB1cGRhdGUucGF5bG9hZCwgc3RhdHVzQ29kZTogdXBkYXRlLnN0YXR1c0NvZGUsIGhlYWRlcnM6IHVwZGF0ZS5oZWFkZXJzIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3VzdG9tIG1lc3NhZ2VcblxuICAgICAgICBpZiAodXBkYXRlLnR5cGUgPT09ICdtZXNzYWdlJykge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQoZXJyb3IsIHsgcGF5bG9hZDogdXBkYXRlLm1lc3NhZ2UgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBdXRoZW50aWNhdGlvblxuXG4gICAgICAgIGlmICh1cGRhdGUudHlwZSA9PT0gJ2hlbGxvJykge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHVwZGF0ZS5zb2NrZXQ7XG4gICAgICAgICAgICBpZiAodXBkYXRlLmhlYXJ0YmVhdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXQgPSB1cGRhdGUuaGVhcnRiZWF0LmludGVydmFsICsgdXBkYXRlLmhlYXJ0YmVhdC50aW1lb3V0O1xuICAgICAgICAgICAgICAgIHRoaXMuX2JlYXQoKTsgICAgICAgICAgIC8vIENhbGwgYWdhaW4gb25jZSB0aW1lb3V0IGlzIHNldFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV4dChlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodXBkYXRlLnR5cGUgPT09ICdyZWF1dGgnKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dChlcnJvciwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdWJzY3JpcHRpb25zXG5cbiAgICAgICAgaWYgKHVwZGF0ZS50eXBlID09PSAnc3ViJyB8fFxuICAgICAgICAgICAgdXBkYXRlLnR5cGUgPT09ICd1bnN1YicpIHtcblxuICAgICAgICAgICAgcmV0dXJuIG5leHQoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV4dChuZXcgTmVzRXJyb3IoJ1JlY2VpdmVkIGludmFsaWQgcmVzcG9uc2UnLCBlcnJvclR5cGVzLlBST1RPQ09MKSk7XG4gICAgICAgIHJldHVybiB0aGlzLm9uRXJyb3IobmV3IE5lc0Vycm9yKCdSZWNlaXZlZCB1bmtub3duIHJlc3BvbnNlIHR5cGU6ICcgKyB1cGRhdGUudHlwZSwgZXJyb3JUeXBlcy5QUk9UT0NPTCkpO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLl9iZWF0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmICghdGhpcy5faGVhcnRiZWF0VGltZW91dCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdCk7XG5cbiAgICAgICAgdGhpcy5faGVhcnRiZWF0ID0gc2V0VGltZW91dCgoKSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMub25FcnJvcihuZXcgTmVzRXJyb3IoJ0Rpc2Nvbm5lY3RpbmcgZHVlIHRvIGhlYXJ0YmVhdCB0aW1lb3V0JywgZXJyb3JUeXBlcy5USU1FT1VUKSk7XG4gICAgICAgICAgICB0aGlzLm9uSGVhcnRiZWF0VGltZW91dCh0aGlzLl93aWxsUmVjb25uZWN0KCkpO1xuICAgICAgICAgICAgdGhpcy5fd3MuY2xvc2UoKTtcbiAgICAgICAgfSwgdGhpcy5faGVhcnRiZWF0VGltZW91dCk7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuX3dpbGxSZWNvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgcmV0dXJuICEhKHRoaXMuX3JlY29ubmVjdGlvbiAmJiB0aGlzLl9yZWNvbm5lY3Rpb24ucmV0cmllcyA+PSAxKTtcbiAgICB9O1xuXG4gICAgLy8gRXhwb3NlIGludGVyZmFjZVxuXG4gICAgcmV0dXJuIHsgQ2xpZW50IH07XG59KTtcbiIsIi8qKlxuICogbG9kYXNoIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBleHBvcnRzPVwibnBtXCIgLW8gLi9gXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyA8aHR0cHM6Ly9qcXVlcnkub3JnLz5cbiAqIFJlbGVhc2VkIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwczovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS44LjMgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqL1xuXG4vKiogVXNlZCBhcyB0aGUgYFR5cGVFcnJvcmAgbWVzc2FnZSBmb3IgXCJGdW5jdGlvbnNcIiBtZXRob2RzLiAqL1xudmFyIEZVTkNfRVJST1JfVEVYVCA9ICdFeHBlY3RlZCBhIGZ1bmN0aW9uJztcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTkFOID0gMCAvIDA7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZS4gKi9cbnZhciByZVRyaW0gPSAvXlxccyt8XFxzKyQvZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJhZCBzaWduZWQgaGV4YWRlY2ltYWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmFkSGV4ID0gL15bLStdMHhbMC05YS1mXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiaW5hcnkgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmluYXJ5ID0gL14wYlswMV0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb2N0YWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzT2N0YWwgPSAvXjBvWzAtN10rJC9pO1xuXG4vKiogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgd2l0aG91dCBhIGRlcGVuZGVuY3kgb24gYHJvb3RgLiAqL1xudmFyIGZyZWVQYXJzZUludCA9IHBhcnNlSW50O1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXgsXG4gICAgbmF0aXZlTWluID0gTWF0aC5taW47XG5cbi8qKlxuICogR2V0cyB0aGUgdGltZXN0YW1wIG9mIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgaGF2ZSBlbGFwc2VkIHNpbmNlXG4gKiB0aGUgVW5peCBlcG9jaCAoMSBKYW51YXJ5IDE5NzAgMDA6MDA6MDAgVVRDKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgRGF0ZVxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgdGltZXN0YW1wLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmRlZmVyKGZ1bmN0aW9uKHN0YW1wKSB7XG4gKiAgIGNvbnNvbGUubG9nKF8ubm93KCkgLSBzdGFtcCk7XG4gKiB9LCBfLm5vdygpKTtcbiAqIC8vID0+IExvZ3MgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgaXQgdG9vayBmb3IgdGhlIGRlZmVycmVkIGludm9jYXRpb24uXG4gKi9cbnZhciBub3cgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHJvb3QuRGF0ZS5ub3coKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRlYm91bmNlZCBmdW5jdGlvbiB0aGF0IGRlbGF5cyBpbnZva2luZyBgZnVuY2AgdW50aWwgYWZ0ZXIgYHdhaXRgXG4gKiBtaWxsaXNlY29uZHMgaGF2ZSBlbGFwc2VkIHNpbmNlIHRoZSBsYXN0IHRpbWUgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiB3YXNcbiAqIGludm9rZWQuIFRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gY29tZXMgd2l0aCBhIGBjYW5jZWxgIG1ldGhvZCB0byBjYW5jZWxcbiAqIGRlbGF5ZWQgYGZ1bmNgIGludm9jYXRpb25zIGFuZCBhIGBmbHVzaGAgbWV0aG9kIHRvIGltbWVkaWF0ZWx5IGludm9rZSB0aGVtLlxuICogUHJvdmlkZSBgb3B0aW9uc2AgdG8gaW5kaWNhdGUgd2hldGhlciBgZnVuY2Agc2hvdWxkIGJlIGludm9rZWQgb24gdGhlXG4gKiBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGAgdGltZW91dC4gVGhlIGBmdW5jYCBpcyBpbnZva2VkXG4gKiB3aXRoIHRoZSBsYXN0IGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uLiBTdWJzZXF1ZW50XG4gKiBjYWxscyB0byB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHJldHVybiB0aGUgcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYFxuICogaW52b2NhdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCwgYGZ1bmNgIGlzXG4gKiBpbnZva2VkIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIGRlYm91bmNlZCBmdW5jdGlvblxuICogaXMgaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIElmIGB3YWl0YCBpcyBgMGAgYW5kIGBsZWFkaW5nYCBpcyBgZmFsc2VgLCBgZnVuY2AgaW52b2NhdGlvbiBpcyBkZWZlcnJlZFxuICogdW50aWwgdG8gdGhlIG5leHQgdGljaywgc2ltaWxhciB0byBgc2V0VGltZW91dGAgd2l0aCBhIHRpbWVvdXQgb2YgYDBgLlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwczovL2Nzcy10cmlja3MuY29tL2RlYm91bmNpbmctdGhyb3R0bGluZy1leHBsYWluZWQtZXhhbXBsZXMvKVxuICogZm9yIGRldGFpbHMgb3ZlciB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBgXy5kZWJvdW5jZWAgYW5kIGBfLnRocm90dGxlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRlYm91bmNlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9ZmFsc2VdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdhaXRdXG4gKiAgVGhlIG1heGltdW0gdGltZSBgZnVuY2AgaXMgYWxsb3dlZCB0byBiZSBkZWxheWVkIGJlZm9yZSBpdCdzIGludm9rZWQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGRlYm91bmNlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgY29zdGx5IGNhbGN1bGF0aW9ucyB3aGlsZSB0aGUgd2luZG93IHNpemUgaXMgaW4gZmx1eC5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdyZXNpemUnLCBfLmRlYm91bmNlKGNhbGN1bGF0ZUxheW91dCwgMTUwKSk7XG4gKlxuICogLy8gSW52b2tlIGBzZW5kTWFpbGAgd2hlbiBjbGlja2VkLCBkZWJvdW5jaW5nIHN1YnNlcXVlbnQgY2FsbHMuXG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgXy5kZWJvdW5jZShzZW5kTWFpbCwgMzAwLCB7XG4gKiAgICdsZWFkaW5nJzogdHJ1ZSxcbiAqICAgJ3RyYWlsaW5nJzogZmFsc2VcbiAqIH0pKTtcbiAqXG4gKiAvLyBFbnN1cmUgYGJhdGNoTG9nYCBpcyBpbnZva2VkIG9uY2UgYWZ0ZXIgMSBzZWNvbmQgb2YgZGVib3VuY2VkIGNhbGxzLlxuICogdmFyIGRlYm91bmNlZCA9IF8uZGVib3VuY2UoYmF0Y2hMb2csIDI1MCwgeyAnbWF4V2FpdCc6IDEwMDAgfSk7XG4gKiB2YXIgc291cmNlID0gbmV3IEV2ZW50U291cmNlKCcvc3RyZWFtJyk7XG4gKiBqUXVlcnkoc291cmNlKS5vbignbWVzc2FnZScsIGRlYm91bmNlZCk7XG4gKlxuICogLy8gQ2FuY2VsIHRoZSB0cmFpbGluZyBkZWJvdW5jZWQgaW52b2NhdGlvbi5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIGRlYm91bmNlZC5jYW5jZWwpO1xuICovXG5mdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsYXN0QXJncyxcbiAgICAgIGxhc3RUaGlzLFxuICAgICAgbWF4V2FpdCxcbiAgICAgIHJlc3VsdCxcbiAgICAgIHRpbWVySWQsXG4gICAgICBsYXN0Q2FsbFRpbWUsXG4gICAgICBsYXN0SW52b2tlVGltZSA9IDAsXG4gICAgICBsZWFkaW5nID0gZmFsc2UsXG4gICAgICBtYXhpbmcgPSBmYWxzZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICB3YWl0ID0gdG9OdW1iZXIod2FpdCkgfHwgMDtcbiAgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9ICEhb3B0aW9ucy5sZWFkaW5nO1xuICAgIG1heGluZyA9ICdtYXhXYWl0JyBpbiBvcHRpb25zO1xuICAgIG1heFdhaXQgPSBtYXhpbmcgPyBuYXRpdmVNYXgodG9OdW1iZXIob3B0aW9ucy5tYXhXYWl0KSB8fCAwLCB3YWl0KSA6IG1heFdhaXQ7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuXG4gIGZ1bmN0aW9uIGludm9rZUZ1bmModGltZSkge1xuICAgIHZhciBhcmdzID0gbGFzdEFyZ3MsXG4gICAgICAgIHRoaXNBcmcgPSBsYXN0VGhpcztcblxuICAgIGxhc3RBcmdzID0gbGFzdFRoaXMgPSB1bmRlZmluZWQ7XG4gICAgbGFzdEludm9rZVRpbWUgPSB0aW1lO1xuICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxlYWRpbmdFZGdlKHRpbWUpIHtcbiAgICAvLyBSZXNldCBhbnkgYG1heFdhaXRgIHRpbWVyLlxuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICAvLyBTdGFydCB0aGUgdGltZXIgZm9yIHRoZSB0cmFpbGluZyBlZGdlLlxuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgLy8gSW52b2tlIHRoZSBsZWFkaW5nIGVkZ2UuXG4gICAgcmV0dXJuIGxlYWRpbmcgPyBpbnZva2VGdW5jKHRpbWUpIDogcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtYWluaW5nV2FpdCh0aW1lKSB7XG4gICAgdmFyIHRpbWVTaW5jZUxhc3RDYWxsID0gdGltZSAtIGxhc3RDYWxsVGltZSxcbiAgICAgICAgdGltZVNpbmNlTGFzdEludm9rZSA9IHRpbWUgLSBsYXN0SW52b2tlVGltZSxcbiAgICAgICAgcmVzdWx0ID0gd2FpdCAtIHRpbWVTaW5jZUxhc3RDYWxsO1xuXG4gICAgcmV0dXJuIG1heGluZyA/IG5hdGl2ZU1pbihyZXN1bHQsIG1heFdhaXQgLSB0aW1lU2luY2VMYXN0SW52b2tlKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3VsZEludm9rZSh0aW1lKSB7XG4gICAgdmFyIHRpbWVTaW5jZUxhc3RDYWxsID0gdGltZSAtIGxhc3RDYWxsVGltZSxcbiAgICAgICAgdGltZVNpbmNlTGFzdEludm9rZSA9IHRpbWUgLSBsYXN0SW52b2tlVGltZTtcblxuICAgIC8vIEVpdGhlciB0aGlzIGlzIHRoZSBmaXJzdCBjYWxsLCBhY3Rpdml0eSBoYXMgc3RvcHBlZCBhbmQgd2UncmUgYXQgdGhlXG4gICAgLy8gdHJhaWxpbmcgZWRnZSwgdGhlIHN5c3RlbSB0aW1lIGhhcyBnb25lIGJhY2t3YXJkcyBhbmQgd2UncmUgdHJlYXRpbmdcbiAgICAvLyBpdCBhcyB0aGUgdHJhaWxpbmcgZWRnZSwgb3Igd2UndmUgaGl0IHRoZSBgbWF4V2FpdGAgbGltaXQuXG4gICAgcmV0dXJuIChsYXN0Q2FsbFRpbWUgPT09IHVuZGVmaW5lZCB8fCAodGltZVNpbmNlTGFzdENhbGwgPj0gd2FpdCkgfHxcbiAgICAgICh0aW1lU2luY2VMYXN0Q2FsbCA8IDApIHx8IChtYXhpbmcgJiYgdGltZVNpbmNlTGFzdEludm9rZSA+PSBtYXhXYWl0KSk7XG4gIH1cblxuICBmdW5jdGlvbiB0aW1lckV4cGlyZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKTtcbiAgICBpZiAoc2hvdWxkSW52b2tlKHRpbWUpKSB7XG4gICAgICByZXR1cm4gdHJhaWxpbmdFZGdlKHRpbWUpO1xuICAgIH1cbiAgICAvLyBSZXN0YXJ0IHRoZSB0aW1lci5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHJlbWFpbmluZ1dhaXQodGltZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhaWxpbmdFZGdlKHRpbWUpIHtcbiAgICB0aW1lcklkID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gT25seSBpbnZva2UgaWYgd2UgaGF2ZSBgbGFzdEFyZ3NgIHdoaWNoIG1lYW5zIGBmdW5jYCBoYXMgYmVlblxuICAgIC8vIGRlYm91bmNlZCBhdCBsZWFzdCBvbmNlLlxuICAgIGlmICh0cmFpbGluZyAmJiBsYXN0QXJncykge1xuICAgICAgcmV0dXJuIGludm9rZUZ1bmModGltZSk7XG4gICAgfVxuICAgIGxhc3RBcmdzID0gbGFzdFRoaXMgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICBpZiAodGltZXJJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgfVxuICAgIGxhc3RJbnZva2VUaW1lID0gMDtcbiAgICBsYXN0QXJncyA9IGxhc3RDYWxsVGltZSA9IGxhc3RUaGlzID0gdGltZXJJZCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgIHJldHVybiB0aW1lcklkID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiB0cmFpbGluZ0VkZ2Uobm93KCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVib3VuY2VkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCksXG4gICAgICAgIGlzSW52b2tpbmcgPSBzaG91bGRJbnZva2UodGltZSk7XG5cbiAgICBsYXN0QXJncyA9IGFyZ3VtZW50cztcbiAgICBsYXN0VGhpcyA9IHRoaXM7XG4gICAgbGFzdENhbGxUaW1lID0gdGltZTtcblxuICAgIGlmIChpc0ludm9raW5nKSB7XG4gICAgICBpZiAodGltZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBsZWFkaW5nRWRnZShsYXN0Q2FsbFRpbWUpO1xuICAgICAgfVxuICAgICAgaWYgKG1heGluZykge1xuICAgICAgICAvLyBIYW5kbGUgaW52b2NhdGlvbnMgaW4gYSB0aWdodCBsb29wLlxuICAgICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgICAgICByZXR1cm4gaW52b2tlRnVuYyhsYXN0Q2FsbFRpbWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGltZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGRlYm91bmNlZC5jYW5jZWwgPSBjYW5jZWw7XG4gIGRlYm91bmNlZC5mbHVzaCA9IGZsdXNoO1xuICByZXR1cm4gZGVib3VuY2VkO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB0aHJvdHRsZWQgZnVuY3Rpb24gdGhhdCBvbmx5IGludm9rZXMgYGZ1bmNgIGF0IG1vc3Qgb25jZSBwZXJcbiAqIGV2ZXJ5IGB3YWl0YCBtaWxsaXNlY29uZHMuIFRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gY29tZXMgd2l0aCBhIGBjYW5jZWxgXG4gKiBtZXRob2QgdG8gY2FuY2VsIGRlbGF5ZWQgYGZ1bmNgIGludm9jYXRpb25zIGFuZCBhIGBmbHVzaGAgbWV0aG9kIHRvXG4gKiBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS4gUHJvdmlkZSBgb3B0aW9uc2AgdG8gaW5kaWNhdGUgd2hldGhlciBgZnVuY2BcbiAqIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZSBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGBcbiAqIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZCB3aXRoIHRoZSBsYXN0IGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGVcbiAqIHRocm90dGxlZCBmdW5jdGlvbi4gU3Vic2VxdWVudCBjYWxscyB0byB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIHJldHVybiB0aGVcbiAqIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2AgaW52b2NhdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCwgYGZ1bmNgIGlzXG4gKiBpbnZva2VkIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIHRocm90dGxlZCBmdW5jdGlvblxuICogaXMgaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIElmIGB3YWl0YCBpcyBgMGAgYW5kIGBsZWFkaW5nYCBpcyBgZmFsc2VgLCBgZnVuY2AgaW52b2NhdGlvbiBpcyBkZWZlcnJlZFxuICogdW50aWwgdG8gdGhlIG5leHQgdGljaywgc2ltaWxhciB0byBgc2V0VGltZW91dGAgd2l0aCBhIHRpbWVvdXQgb2YgYDBgLlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwczovL2Nzcy10cmlja3MuY29tL2RlYm91bmNpbmctdGhyb3R0bGluZy1leHBsYWluZWQtZXhhbXBsZXMvKVxuICogZm9yIGRldGFpbHMgb3ZlciB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBgXy50aHJvdHRsZWAgYW5kIGBfLmRlYm91bmNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHRocm90dGxlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHRocm90dGxlIGludm9jYXRpb25zIHRvLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHRocm90dGxlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgZXhjZXNzaXZlbHkgdXBkYXRpbmcgdGhlIHBvc2l0aW9uIHdoaWxlIHNjcm9sbGluZy5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdzY3JvbGwnLCBfLnRocm90dGxlKHVwZGF0ZVBvc2l0aW9uLCAxMDApKTtcbiAqXG4gKiAvLyBJbnZva2UgYHJlbmV3VG9rZW5gIHdoZW4gdGhlIGNsaWNrIGV2ZW50IGlzIGZpcmVkLCBidXQgbm90IG1vcmUgdGhhbiBvbmNlIGV2ZXJ5IDUgbWludXRlcy5cbiAqIHZhciB0aHJvdHRsZWQgPSBfLnRocm90dGxlKHJlbmV3VG9rZW4sIDMwMDAwMCwgeyAndHJhaWxpbmcnOiBmYWxzZSB9KTtcbiAqIGpRdWVyeShlbGVtZW50KS5vbignY2xpY2snLCB0aHJvdHRsZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgdGhyb3R0bGVkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCB0aHJvdHRsZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gdGhyb3R0bGUoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGVhZGluZyA9IHRydWUsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9ICdsZWFkaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLmxlYWRpbmcgOiBsZWFkaW5nO1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cbiAgcmV0dXJuIGRlYm91bmNlKGZ1bmMsIHdhaXQsIHtcbiAgICAnbGVhZGluZyc6IGxlYWRpbmcsXG4gICAgJ21heFdhaXQnOiB3YWl0LFxuICAgICd0cmFpbGluZyc6IHRyYWlsaW5nXG4gIH0pO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICEhdmFsdWUgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzeW1ib2wsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTeW1ib2woJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3ltYm9sJyB8fFxuICAgIChpc09iamVjdExpa2UodmFsdWUpICYmIG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpID09IHN5bWJvbFRhZyk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIG51bWJlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIG51bWJlci5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b051bWJlcigzLjIpO1xuICogLy8gPT4gMy4yXG4gKlxuICogXy50b051bWJlcihOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IDVlLTMyNFxuICpcbiAqIF8udG9OdW1iZXIoSW5maW5pdHkpO1xuICogLy8gPT4gSW5maW5pdHlcbiAqXG4gKiBfLnRvTnVtYmVyKCczLjInKTtcbiAqIC8vID0+IDMuMlxuICovXG5mdW5jdGlvbiB0b051bWJlcih2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gTkFOO1xuICB9XG4gIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICB2YXIgb3RoZXIgPSB0eXBlb2YgdmFsdWUudmFsdWVPZiA9PSAnZnVuY3Rpb24nID8gdmFsdWUudmFsdWVPZigpIDogdmFsdWU7XG4gICAgdmFsdWUgPSBpc09iamVjdChvdGhlcikgPyAob3RoZXIgKyAnJykgOiBvdGhlcjtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSAwID8gdmFsdWUgOiArdmFsdWU7XG4gIH1cbiAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKHJlVHJpbSwgJycpO1xuICB2YXIgaXNCaW5hcnkgPSByZUlzQmluYXJ5LnRlc3QodmFsdWUpO1xuICByZXR1cm4gKGlzQmluYXJ5IHx8IHJlSXNPY3RhbC50ZXN0KHZhbHVlKSlcbiAgICA/IGZyZWVQYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgaXNCaW5hcnkgPyAyIDogOClcbiAgICA6IChyZUlzQmFkSGV4LnRlc3QodmFsdWUpID8gTkFOIDogK3ZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aHJvdHRsZTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxudmFyIHJ1bnRpbWUgPSAoZnVuY3Rpb24gKGV4cG9ydHMpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIE9wID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9wLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyICRTeW1ib2wgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2wgOiB7fTtcbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcbiAgdmFyIGFzeW5jSXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLmFzeW5jSXRlcmF0b3IgfHwgXCJAQGFzeW5jSXRlcmF0b3JcIjtcbiAgdmFyIHRvU3RyaW5nVGFnU3ltYm9sID0gJFN5bWJvbC50b1N0cmluZ1RhZyB8fCBcIkBAdG9TdHJpbmdUYWdcIjtcblxuICBmdW5jdGlvbiBkZWZpbmUob2JqLCBrZXksIHZhbHVlKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gb2JqW2tleV07XG4gIH1cbiAgdHJ5IHtcbiAgICAvLyBJRSA4IGhhcyBhIGJyb2tlbiBPYmplY3QuZGVmaW5lUHJvcGVydHkgdGhhdCBvbmx5IHdvcmtzIG9uIERPTSBvYmplY3RzLlxuICAgIGRlZmluZSh7fSwgXCJcIik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGRlZmluZSA9IGZ1bmN0aW9uKG9iaiwga2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIG9ialtrZXldID0gdmFsdWU7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIGV4cG9ydHMud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIGRlZmluZShJdGVyYXRvclByb3RvdHlwZSwgaXRlcmF0b3JTeW1ib2wsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfSk7XG5cbiAgdmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuICB2YXIgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90byAmJiBnZXRQcm90byhnZXRQcm90byh2YWx1ZXMoW10pKSk7XG4gIGlmIChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAmJlxuICAgICAgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgIT09IE9wICYmXG4gICAgICBoYXNPd24uY2FsbChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSwgaXRlcmF0b3JTeW1ib2wpKSB7XG4gICAgLy8gVGhpcyBlbnZpcm9ubWVudCBoYXMgYSBuYXRpdmUgJUl0ZXJhdG9yUHJvdG90eXBlJTsgdXNlIGl0IGluc3RlYWRcbiAgICAvLyBvZiB0aGUgcG9seWZpbGwuXG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBOYXRpdmVJdGVyYXRvclByb3RvdHlwZTtcbiAgfVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9XG4gICAgR2VuZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUpO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGUgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgZGVmaW5lKEdwLCBcImNvbnN0cnVjdG9yXCIsIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKTtcbiAgZGVmaW5lKEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLCBcImNvbnN0cnVjdG9yXCIsIEdlbmVyYXRvckZ1bmN0aW9uKTtcbiAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBkZWZpbmUoXG4gICAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUsXG4gICAgdG9TdHJpbmdUYWdTeW1ib2wsXG4gICAgXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICk7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgZGVmaW5lKHByb3RvdHlwZSwgbWV0aG9kLCBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGV4cG9ydHMuaXNHZW5lcmF0b3JGdW5jdGlvbiA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIHZhciBjdG9yID0gdHlwZW9mIGdlbkZ1biA9PT0gXCJmdW5jdGlvblwiICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gY3RvclxuICAgICAgPyBjdG9yID09PSBHZW5lcmF0b3JGdW5jdGlvbiB8fFxuICAgICAgICAvLyBGb3IgdGhlIG5hdGl2ZSBHZW5lcmF0b3JGdW5jdGlvbiBjb25zdHJ1Y3RvciwgdGhlIGJlc3Qgd2UgY2FuXG4gICAgICAgIC8vIGRvIGlzIHRvIGNoZWNrIGl0cyAubmFtZSBwcm9wZXJ0eS5cbiAgICAgICAgKGN0b3IuZGlzcGxheU5hbWUgfHwgY3Rvci5uYW1lKSA9PT0gXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICAgICA6IGZhbHNlO1xuICB9O1xuXG4gIGV4cG9ydHMubWFyayA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIGlmIChPYmplY3Quc2V0UHJvdG90eXBlT2YpIHtcbiAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihnZW5GdW4sIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2VuRnVuLl9fcHJvdG9fXyA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAgICAgZGVmaW5lKGdlbkZ1biwgdG9TdHJpbmdUYWdTeW1ib2wsIFwiR2VuZXJhdG9yRnVuY3Rpb25cIik7XG4gICAgfVxuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKWAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuXG4gIGV4cG9ydHMuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvciwgUHJvbWlzZUltcGwpIHtcbiAgICBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGdlbmVyYXRvclttZXRob2RdLCBnZW5lcmF0b3IsIGFyZyk7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICByZWplY3QocmVjb3JkLmFyZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVzdWx0ID0gcmVjb3JkLmFyZztcbiAgICAgICAgdmFyIHZhbHVlID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgJiZcbiAgICAgICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlSW1wbC5yZXNvbHZlKHZhbHVlLl9fYXdhaXQpLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGludm9rZShcIm5leHRcIiwgdmFsdWUsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJ0aHJvd1wiLCBlcnIsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZUltcGwucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbih1bndyYXBwZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAgIC8vIGN1cnJlbnQgaXRlcmF0aW9uLlxuICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgLy8gSWYgYSByZWplY3RlZCBQcm9taXNlIHdhcyB5aWVsZGVkLCB0aHJvdyB0aGUgcmVqZWN0aW9uIGJhY2tcbiAgICAgICAgICAvLyBpbnRvIHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gc28gaXQgY2FuIGJlIGhhbmRsZWQgdGhlcmUuXG4gICAgICAgICAgcmV0dXJuIGludm9rZShcInRocm93XCIsIGVycm9yLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcHJldmlvdXNQcm9taXNlO1xuXG4gICAgZnVuY3Rpb24gZW5xdWV1ZShtZXRob2QsIGFyZykge1xuICAgICAgZnVuY3Rpb24gY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZUltcGwoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZSA9XG4gICAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgICAgLy8gYWxsIHByZXZpb3VzIFByb21pc2VzIGhhdmUgYmVlbiByZXNvbHZlZCBiZWZvcmUgY2FsbGluZyBpbnZva2UsXG4gICAgICAgIC8vIHNvIHRoYXQgcmVzdWx0cyBhcmUgYWx3YXlzIGRlbGl2ZXJlZCBpbiB0aGUgY29ycmVjdCBvcmRlci4gSWZcbiAgICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgICAgLy8gY2FsbCBpbnZva2UgaW1tZWRpYXRlbHksIHdpdGhvdXQgd2FpdGluZyBvbiBhIGNhbGxiYWNrIHRvIGZpcmUsXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBoYXMgdGhlIG9wcG9ydHVuaXR5IHRvIGRvXG4gICAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgICAgLy8gaXMgd2h5IHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yIHN5bmNocm9ub3VzbHkgaW52b2tlcyBpdHNcbiAgICAgICAgLy8gZXhlY3V0b3IgY2FsbGJhY2ssIGFuZCB3aHkgYXN5bmMgZnVuY3Rpb25zIHN5bmNocm9ub3VzbHlcbiAgICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgICAgLy8gYXN5bmMgZnVuY3Rpb25zIGluIHRlcm1zIG9mIGFzeW5jIGdlbmVyYXRvcnMsIGl0IGlzIGVzcGVjaWFsbHlcbiAgICAgICAgLy8gaW1wb3J0YW50IHRvIGdldCB0aGlzIHJpZ2h0LCBldmVuIHRob3VnaCBpdCByZXF1aXJlcyBjYXJlLlxuICAgICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihcbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyxcbiAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBmYWlsdXJlcyB0byBQcm9taXNlcyByZXR1cm5lZCBieSBsYXRlclxuICAgICAgICAgIC8vIGludm9jYXRpb25zIG9mIHRoZSBpdGVyYXRvci5cbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZ1xuICAgICAgICApIDogY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuICBkZWZpbmUoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUsIGFzeW5jSXRlcmF0b3JTeW1ib2wsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfSk7XG4gIGV4cG9ydHMuQXN5bmNJdGVyYXRvciA9IEFzeW5jSXRlcmF0b3I7XG5cbiAgLy8gTm90ZSB0aGF0IHNpbXBsZSBhc3luYyBmdW5jdGlvbnMgYXJlIGltcGxlbWVudGVkIG9uIHRvcCBvZlxuICAvLyBBc3luY0l0ZXJhdG9yIG9iamVjdHM7IHRoZXkganVzdCByZXR1cm4gYSBQcm9taXNlIGZvciB0aGUgdmFsdWUgb2ZcbiAgLy8gdGhlIGZpbmFsIHJlc3VsdCBwcm9kdWNlZCBieSB0aGUgaXRlcmF0b3IuXG4gIGV4cG9ydHMuYXN5bmMgPSBmdW5jdGlvbihpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCwgUHJvbWlzZUltcGwpIHtcbiAgICBpZiAoUHJvbWlzZUltcGwgPT09IHZvaWQgMCkgUHJvbWlzZUltcGwgPSBQcm9taXNlO1xuXG4gICAgdmFyIGl0ZXIgPSBuZXcgQXN5bmNJdGVyYXRvcihcbiAgICAgIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpLFxuICAgICAgUHJvbWlzZUltcGxcbiAgICApO1xuXG4gICAgcmV0dXJuIGV4cG9ydHMuaXNHZW5lcmF0b3JGdW5jdGlvbihvdXRlckZuKVxuICAgICAgPyBpdGVyIC8vIElmIG91dGVyRm4gaXMgYSBnZW5lcmF0b3IsIHJldHVybiB0aGUgZnVsbCBpdGVyYXRvci5cbiAgICAgIDogaXRlci5uZXh0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRvbmUgPyByZXN1bHQudmFsdWUgOiBpdGVyLm5leHQoKTtcbiAgICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KSB7XG4gICAgdmFyIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVFeGVjdXRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUNvbXBsZXRlZCkge1xuICAgICAgICBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCZSBmb3JnaXZpbmcsIHBlciAyNS4zLjMuMy4zIG9mIHRoZSBzcGVjOlxuICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgIHJldHVybiBkb25lUmVzdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnRleHQubWV0aG9kID0gbWV0aG9kO1xuICAgICAgY29udGV4dC5hcmcgPSBhcmc7XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGNvbnRleHQuZGVsZWdhdGU7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgICAgIHZhciBkZWxlZ2F0ZVJlc3VsdCA9IG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0ID09PSBDb250aW51ZVNlbnRpbmVsKSBjb250aW51ZTtcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZVJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgLy8gU2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgICAgICBjb250ZXh0LnNlbnQgPSBjb250ZXh0Ll9zZW50ID0gY29udGV4dC5hcmc7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0KSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgICAgdGhyb3cgY29udGV4dC5hcmc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZyk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgIGNvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIGNvbnRleHQuYXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gR2VuU3RhdGVFeGVjdXRpbmc7XG5cbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIpIHtcbiAgICAgICAgICAvLyBJZiBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gaW5uZXJGbiwgd2UgbGVhdmUgc3RhdGUgPT09XG4gICAgICAgICAgLy8gR2VuU3RhdGVFeGVjdXRpbmcgYW5kIGxvb3AgYmFjayBmb3IgYW5vdGhlciBpbnZvY2F0aW9uLlxuICAgICAgICAgIHN0YXRlID0gY29udGV4dC5kb25lXG4gICAgICAgICAgICA/IEdlblN0YXRlQ29tcGxldGVkXG4gICAgICAgICAgICA6IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiByZWNvcmQuYXJnLFxuICAgICAgICAgICAgZG9uZTogY29udGV4dC5kb25lXG4gICAgICAgICAgfTtcblxuICAgICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgIC8vIERpc3BhdGNoIHRoZSBleGNlcHRpb24gYnkgbG9vcGluZyBiYWNrIGFyb3VuZCB0byB0aGVcbiAgICAgICAgICAvLyBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKSBjYWxsIGFib3ZlLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBDYWxsIGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXShjb250ZXh0LmFyZykgYW5kIGhhbmRsZSB0aGVcbiAgLy8gcmVzdWx0LCBlaXRoZXIgYnkgcmV0dXJuaW5nIGEgeyB2YWx1ZSwgZG9uZSB9IHJlc3VsdCBmcm9tIHRoZVxuICAvLyBkZWxlZ2F0ZSBpdGVyYXRvciwgb3IgYnkgbW9kaWZ5aW5nIGNvbnRleHQubWV0aG9kIGFuZCBjb250ZXh0LmFyZyxcbiAgLy8gc2V0dGluZyBjb250ZXh0LmRlbGVnYXRlIHRvIG51bGwsIGFuZCByZXR1cm5pbmcgdGhlIENvbnRpbnVlU2VudGluZWwuXG4gIGZ1bmN0aW9uIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgbWV0aG9kID0gZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdO1xuICAgIGlmIChtZXRob2QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gQSAudGhyb3cgb3IgLnJldHVybiB3aGVuIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgbm8gLnRocm93XG4gICAgICAvLyBtZXRob2QgYWx3YXlzIHRlcm1pbmF0ZXMgdGhlIHlpZWxkKiBsb29wLlxuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIC8vIE5vdGU6IFtcInJldHVyblwiXSBtdXN0IGJlIHVzZWQgZm9yIEVTMyBwYXJzaW5nIGNvbXBhdGliaWxpdHkuXG4gICAgICAgIGlmIChkZWxlZ2F0ZS5pdGVyYXRvcltcInJldHVyblwiXSkge1xuICAgICAgICAgIC8vIElmIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgYSByZXR1cm4gbWV0aG9kLCBnaXZlIGl0IGFcbiAgICAgICAgICAvLyBjaGFuY2UgdG8gY2xlYW4gdXAuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuXG4gICAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIC8vIElmIG1heWJlSW52b2tlRGVsZWdhdGUoY29udGV4dCkgY2hhbmdlZCBjb250ZXh0Lm1ldGhvZCBmcm9tXG4gICAgICAgICAgICAvLyBcInJldHVyblwiIHRvIFwidGhyb3dcIiwgbGV0IHRoYXQgb3ZlcnJpZGUgdGhlIFR5cGVFcnJvciBiZWxvdy5cbiAgICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgXCJUaGUgaXRlcmF0b3IgZG9lcyBub3QgcHJvdmlkZSBhICd0aHJvdycgbWV0aG9kXCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2gobWV0aG9kLCBkZWxlZ2F0ZS5pdGVyYXRvciwgY29udGV4dC5hcmcpO1xuXG4gICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG5cbiAgICBpZiAoISBpbmZvKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcIml0ZXJhdG9yIHJlc3VsdCBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAvLyBBc3NpZ24gdGhlIHJlc3VsdCBvZiB0aGUgZmluaXNoZWQgZGVsZWdhdGUgdG8gdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gdmFyaWFibGUgc3BlY2lmaWVkIGJ5IGRlbGVnYXRlLnJlc3VsdE5hbWUgKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuXG4gICAgICAvLyBSZXN1bWUgZXhlY3V0aW9uIGF0IHRoZSBkZXNpcmVkIGxvY2F0aW9uIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0Lm5leHQgPSBkZWxlZ2F0ZS5uZXh0TG9jO1xuXG4gICAgICAvLyBJZiBjb250ZXh0Lm1ldGhvZCB3YXMgXCJ0aHJvd1wiIGJ1dCB0aGUgZGVsZWdhdGUgaGFuZGxlZCB0aGVcbiAgICAgIC8vIGV4Y2VwdGlvbiwgbGV0IHRoZSBvdXRlciBnZW5lcmF0b3IgcHJvY2VlZCBub3JtYWxseS4gSWZcbiAgICAgIC8vIGNvbnRleHQubWV0aG9kIHdhcyBcIm5leHRcIiwgZm9yZ2V0IGNvbnRleHQuYXJnIHNpbmNlIGl0IGhhcyBiZWVuXG4gICAgICAvLyBcImNvbnN1bWVkXCIgYnkgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yLiBJZiBjb250ZXh0Lm1ldGhvZCB3YXNcbiAgICAgIC8vIFwicmV0dXJuXCIsIGFsbG93IHRoZSBvcmlnaW5hbCAucmV0dXJuIGNhbGwgdG8gY29udGludWUgaW4gdGhlXG4gICAgICAvLyBvdXRlciBnZW5lcmF0b3IuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgIT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmUteWllbGQgdGhlIHJlc3VsdCByZXR1cm5lZCBieSB0aGUgZGVsZWdhdGUgbWV0aG9kLlxuICAgICAgcmV0dXJuIGluZm87XG4gICAgfVxuXG4gICAgLy8gVGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGlzIGZpbmlzaGVkLCBzbyBmb3JnZXQgaXQgYW5kIGNvbnRpbnVlIHdpdGhcbiAgICAvLyB0aGUgb3V0ZXIgZ2VuZXJhdG9yLlxuICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICB9XG5cbiAgLy8gRGVmaW5lIEdlbmVyYXRvci5wcm90b3R5cGUue25leHQsdGhyb3cscmV0dXJufSBpbiB0ZXJtcyBvZiB0aGVcbiAgLy8gdW5pZmllZCAuX2ludm9rZSBoZWxwZXIgbWV0aG9kLlxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoR3ApO1xuXG4gIGRlZmluZShHcCwgdG9TdHJpbmdUYWdTeW1ib2wsIFwiR2VuZXJhdG9yXCIpO1xuXG4gIC8vIEEgR2VuZXJhdG9yIHNob3VsZCBhbHdheXMgcmV0dXJuIGl0c2VsZiBhcyB0aGUgaXRlcmF0b3Igb2JqZWN0IHdoZW4gdGhlXG4gIC8vIEBAaXRlcmF0b3IgZnVuY3Rpb24gaXMgY2FsbGVkIG9uIGl0LiBTb21lIGJyb3dzZXJzJyBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlXG4gIC8vIGl0ZXJhdG9yIHByb3RvdHlwZSBjaGFpbiBpbmNvcnJlY3RseSBpbXBsZW1lbnQgdGhpcywgY2F1c2luZyB0aGUgR2VuZXJhdG9yXG4gIC8vIG9iamVjdCB0byBub3QgYmUgcmV0dXJuZWQgZnJvbSB0aGlzIGNhbGwuIFRoaXMgZW5zdXJlcyB0aGF0IGRvZXNuJ3QgaGFwcGVuLlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlZ2VuZXJhdG9yL2lzc3Vlcy8yNzQgZm9yIG1vcmUgZGV0YWlscy5cbiAgZGVmaW5lKEdwLCBpdGVyYXRvclN5bWJvbCwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0pO1xuXG4gIGRlZmluZShHcCwgXCJ0b1N0cmluZ1wiLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEdlbmVyYXRvcl1cIjtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBleHBvcnRzLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgZXhwb3J0cy52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlXG4gIC8vIG9yIG5vdCwgcmV0dXJuIHRoZSBydW50aW1lIG9iamVjdCBzbyB0aGF0IHdlIGNhbiBkZWNsYXJlIHRoZSB2YXJpYWJsZVxuICAvLyByZWdlbmVyYXRvclJ1bnRpbWUgaW4gdGhlIG91dGVyIHNjb3BlLCB3aGljaCBhbGxvd3MgdGhpcyBtb2R1bGUgdG8gYmVcbiAgLy8gaW5qZWN0ZWQgZWFzaWx5IGJ5IGBiaW4vcmVnZW5lcmF0b3IgLS1pbmNsdWRlLXJ1bnRpbWUgc2NyaXB0LmpzYC5cbiAgcmV0dXJuIGV4cG9ydHM7XG5cbn0oXG4gIC8vIElmIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZSwgdXNlIG1vZHVsZS5leHBvcnRzXG4gIC8vIGFzIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgbmFtZXNwYWNlLiBPdGhlcndpc2UgY3JlYXRlIGEgbmV3IGVtcHR5XG4gIC8vIG9iamVjdC4gRWl0aGVyIHdheSwgdGhlIHJlc3VsdGluZyBvYmplY3Qgd2lsbCBiZSB1c2VkIHRvIGluaXRpYWxpemVcbiAgLy8gdGhlIHJlZ2VuZXJhdG9yUnVudGltZSB2YXJpYWJsZSBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZS5cbiAgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiA/IG1vZHVsZS5leHBvcnRzIDoge31cbikpO1xuXG50cnkge1xuICByZWdlbmVyYXRvclJ1bnRpbWUgPSBydW50aW1lO1xufSBjYXRjaCAoYWNjaWRlbnRhbFN0cmljdE1vZGUpIHtcbiAgLy8gVGhpcyBtb2R1bGUgc2hvdWxkIG5vdCBiZSBydW5uaW5nIGluIHN0cmljdCBtb2RlLCBzbyB0aGUgYWJvdmVcbiAgLy8gYXNzaWdubWVudCBzaG91bGQgYWx3YXlzIHdvcmsgdW5sZXNzIHNvbWV0aGluZyBpcyBtaXNjb25maWd1cmVkLiBKdXN0XG4gIC8vIGluIGNhc2UgcnVudGltZS5qcyBhY2NpZGVudGFsbHkgcnVucyBpbiBzdHJpY3QgbW9kZSwgaW4gbW9kZXJuIGVuZ2luZXNcbiAgLy8gd2UgY2FuIGV4cGxpY2l0bHkgYWNjZXNzIGdsb2JhbFRoaXMuIEluIG9sZGVyIGVuZ2luZXMgd2UgY2FuIGVzY2FwZVxuICAvLyBzdHJpY3QgbW9kZSB1c2luZyBhIGdsb2JhbCBGdW5jdGlvbiBjYWxsLiBUaGlzIGNvdWxkIGNvbmNlaXZhYmx5IGZhaWxcbiAgLy8gaWYgYSBDb250ZW50IFNlY3VyaXR5IFBvbGljeSBmb3JiaWRzIHVzaW5nIEZ1bmN0aW9uLCBidXQgaW4gdGhhdCBjYXNlXG4gIC8vIHRoZSBwcm9wZXIgc29sdXRpb24gaXMgdG8gZml4IHRoZSBhY2NpZGVudGFsIHN0cmljdCBtb2RlIHByb2JsZW0uIElmXG4gIC8vIHlvdSd2ZSBtaXNjb25maWd1cmVkIHlvdXIgYnVuZGxlciB0byBmb3JjZSBzdHJpY3QgbW9kZSBhbmQgYXBwbGllZCBhXG4gIC8vIENTUCB0byBmb3JiaWQgRnVuY3Rpb24sIGFuZCB5b3UncmUgbm90IHdpbGxpbmcgdG8gZml4IGVpdGhlciBvZiB0aG9zZVxuICAvLyBwcm9ibGVtcywgcGxlYXNlIGRldGFpbCB5b3VyIHVuaXF1ZSBwcmVkaWNhbWVudCBpbiBhIEdpdEh1YiBpc3N1ZS5cbiAgaWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSBcIm9iamVjdFwiKSB7XG4gICAgZ2xvYmFsVGhpcy5yZWdlbmVyYXRvclJ1bnRpbWUgPSBydW50aW1lO1xuICB9IGVsc2Uge1xuICAgIEZ1bmN0aW9uKFwiclwiLCBcInJlZ2VuZXJhdG9yUnVudGltZSA9IHJcIikocnVudGltZSk7XG4gIH1cbn1cbiJdfQ==
