'use strict';

require('regenerator-runtime');

const { genParticles } = require('./particles-on-click');

// Sound offfff!!!!!!
console.log('TACOOOOOOOOOOOOOOOOOOOOS!!!');

const DEBUG = false;
const TACOS_ROOM_ID = 'tacos-n-friends';
const MY_TACO_ID = 'my-taco';
const MY_SCORE_ID = 'my-score';
const USE_NES = true;
const CURSOR_UPDATE_THROTTLE = 14; // 14 milliseconds — close to 16 which would be 60 fps

const Throttle = require('lodash.throttle');

let Nes;

if (USE_NES) {
    Nes = require('@hapi/nes/lib/client');
}

// const RECONNECT_TIMEOUT = 1000; // in milliseconds

let RoomClient;
// This will get set by the server on connection
let roomUserId = null;
let roomScoreboard = [];
let roomX = 0;
let roomY = 0;
// let isMouseDown = false;
let lastClick = null;
let justSentMsg = false;

const abbreviateUserId = (userId) => `...${userId.split('-').pop()}`;

const addIdToTacoIfNotExists = (el, id) => {

    const idEl = el.querySelector('.taco-id');

    if (!idEl) {
        const tacoId = document.createElement('div');
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
    else {
        idEl.textContent = abbreviateUserId(id);
    }
};

// Send room chat
const sendRoomChat = async ({ roomId, userId, ...rest }) => {

    const payload = rest;

    if (userId) {
        payload.userId = userId;
    }

    justSentMsg = true;

    const { payload: { error } } = await RoomClient.request({
        method: 'post',
        path: `/rooms/${roomId}/chat/update`,
        payload
    });

    if (error) {
        console.error(error);
    }
};

const buildChatMessages = ({ messages }) => {

    return messages.map(({ id, userId, epoch, msg }, i) => {

        const msgFrom = document.createElement('div');
        msgFrom.innerText = abbreviateUserId(userId || '');
        msgFrom.classList.add('chat-msg-from');

        const msgTime = document.createElement('div');
        msgTime.innerText = new Date(epoch).toLocaleTimeString();
        msgTime.classList.add('chat-msg-time');

        const fromTimeContainer = document.createElement('div');
        fromTimeContainer.classList.add('from-time-container');

        fromTimeContainer.appendChild(msgFrom);
        fromTimeContainer.appendChild(msgTime);

        const message = document.createElement('div');
        message.innerText = msg;
        message.classList.add('chat-msg');

        const msgContainer = document.createElement('div');
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

const updateChatRoomMessages = ({ roomId, messages }) => {

    let chatRoom = document.getElementById('chat-room');
    let chatRoomMessages;

    if (!chatRoom) {
        const chatRoom = document.createElement('div');
        chatRoom.id = 'chat-room';

        const chatRoomHeader = document.createElement('h3');
        chatRoomHeader.id = 'chat-room-header';
        chatRoomHeader.innerText = `${roomId} chat — be nice! =P`;

        chatRoomMessages = document.createElement('div');
        chatRoomMessages.id = 'chat-room-messages';

        const chatInputContainer = document.createElement('div');

        const input = document.createElement('input');
        input.name = 'new-chat';
        input.autocomplete = 'new-password';
        input.id = 'chat-room-input';

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.id = 'chat-room-submit';
        submitBtn.textContent = 'SUBMIT';

        const chatRoomForm = document.createElement('form');
        chatRoomForm.autocomplete = 'new-password';
        chatRoomForm.id = 'chat-room-form';
        chatRoomForm.appendChild(input);
        chatRoomForm.appendChild(submitBtn);

        chatRoomForm.onsubmit = (evt) => {

            evt.preventDefault();

            const chatInputEl = document.getElementById('chat-room-input');

            if (chatInputEl && chatInputEl.value) {

                sendRoomChat({
                    roomId,
                    userId: roomUserId,
                    msg: chatInputEl.value
                });

                // Clear out the input
                chatInputEl.value = '';
            }
        };

        // Append chatRoomForm
        chatInputContainer.appendChild(chatRoomForm);

        chatRoom.appendChild(chatRoomHeader);
        chatRoom.appendChild(chatRoomMessages);
        chatRoom.appendChild(chatInputContainer);

        document.body.appendChild(chatRoom);
    }

    chatRoomMessages = document.querySelector('#chat-room-messages');

    const oldChatMsgContainers = Array.from(document.querySelectorAll('.chat-msg-container'));

    // Clear out contents
    chatRoomMessages.innerHTML = '';
    // Rebuild before next repaint

    buildChatMessages({ messages }).forEach((el) => {

        chatRoomMessages.appendChild(el);
    });

    const chatRoomMsgsContainer = document.getElementById('chat-room-messages');
    const chatMsgContainers = document.querySelectorAll('.chat-msg-container');

    const lastMsg = Array.from((chatMsgContainers || [])).pop();
    const lastMsgIsMine = lastMsg && messages[messages.length - 1].userId === roomUserId;

    const isFirstChatLoad = oldChatMsgContainers.length === 0;

    // Give some leeway w/ the 5 px at the end
    const isScrolledToBottom = chatRoomMsgsContainer.scrollTop >=
        (chatRoomMsgsContainer.scrollHeight - chatRoomMsgsContainer.offsetHeight - 5);

    if (lastMsg && ((lastMsgIsMine && justSentMsg) || isFirstChatLoad || isScrolledToBottom)) {
        justSentMsg = false;
        lastMsg.scrollIntoView();
    }
};

// Upsert user in room
const updateRoom = async ({ roomId, userId, ...rest }) => {

    const payload = rest;

    if (userId) {
        payload.id = userId;
    }

    const { payload: { error, user } } = await RoomClient.request({
        method: 'post',
        path: `/rooms/${roomId}/update`,
        payload
    });

    if (user) {
        roomUserId = user.id;
        const myTacoElEl = document.getElementById(MY_TACO_ID);
        addIdToTacoIfNotExists(myTacoElEl, roomUserId);
    }

    // Setup some kinda easy debugging or something
    const connectionMsg = document.getElementById('connectionMsg') || document.createElement('h3');

    connectionMsg.id = 'connectionMsg';

    if (error) {
        // let err = document.createElement(`<h3 style='color: white;'>Error ${error.message}</h3>`);
        connectionMsg.style.color = '#f88070';
        connectionMsg.textContent = `Error ${error.message || error}`;
    }
    else {
        connectionMsg.style.color = '#73c991';
        connectionMsg.textContent = `Connected x: ${payload.x || 'null'} y: ${payload.y || 'null'}`;
    }

    // Add it
    document.body.appendChild(connectionMsg);

    return user;
};

const throttledBroadcast = Throttle(() => {

    const update = {
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

const myTacoEl = document.getElementById(MY_TACO_ID);
const myScoreEl = document.getElementById(MY_SCORE_ID);

// Hot path
const moveCursor = ({ element, x, y }) => {

    // Hopefully the 'px' at the end here will negate attempts to run a script
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
};

const updateScore = ({ element, score }) => {

    if (!element) {
        console.warn('Score element not found');
        return;
    }

    element.textContent = score;
};

// We need this wrapper to make async/await nice to write
const initSocket = async () => {

    if (RoomClient) {
        await RoomClient.disconnect();
    }

    const { location: { protocol, host } } = window;

    // This will replace 'https' for 'ws' which will also leave 'wss' for 'https' protocols
    const url = protocol.replace('http', 'ws') + '//' + host;

    const wsLocation = url.replace('localhost:3001', 'localhost:3000');

    console.log('wsLocation', wsLocation);

    RoomClient = new Nes.Client(wsLocation);

    try {
        await RoomClient.connect();
    }
    catch (connectErr) {
        // Setup some kinda easy debugging or something
        const connectionMsg = document.getElementById('connectionMsg') || document.createElement('h3');

        connectionMsg.id = 'connectionMsg';

        connectionMsg.style.color = '#f88070';
        connectionMsg.textContent = `Error ${connectErr.message}`;
    }

    // Init user
    const user = await updateRoom({
        roomId: TACOS_ROOM_ID,
        userId: roomUserId
    });

    console.log('init user', user);

    // Init chat room
    updateChatRoomMessages({ roomId: TACOS_ROOM_ID, messages: [] });

    const roomEl = document.querySelector('.room');

    const clickTracker = {};

    let roomUsers = {};

    // Hot path, throttled server-side
    const onRoomUpdate = (props) => {

        const {
            // id: roomId,
            users = {},
            isSync,
            scoreboard,
            shouldDeleteUsers,
            chat
        } = props;

        if (DEBUG) {
            console.log('onRoomUpdate', props);
        }

        if (chat) {
            updateChatRoomMessages({ roomId: TACOS_ROOM_ID, messages: chat });
        }

        const ghostTacos = Array.from(document.getElementsByClassName('ghost-taco'));
        let remainingGhostTacos = ghostTacos;

        // isPartial
        if (shouldDeleteUsers) {
            Object.values(users).forEach((user) => {

                const maybeTaco = document.getElementById(user.id);

                if (maybeTaco) {
                    // Remove this taco
                    roomEl.removeChild();
                }
            });
            return;
        }
        if (isSync) {
            // Remove inactive tacos
            const userIds = Object.keys(users);

            ghostTacos.forEach((ghostTaco) => {

                if (!userIds.includes(ghostTaco.id)) {
                    // Remove this taco
                    roomEl.removeChild(ghostTaco);
                }
                else {
                    remainingGhostTacos.push(ghostTaco);
                }
            });

            roomUsers = users;
        }

        if (scoreboard) {
            roomScoreboard = scoreboard;
            const scoreboardEl = document.getElementById('scoreboard');
            scoreboardEl.innerHTML = `<h3>Scoreboard</h3>${scoreboard.map(({ userId, score }) => `<p>${abbreviateUserId(userId)}: ${score}</p>`).join('')}`;
            const myScore = roomScoreboard.find(({ userId }) => userId === roomUserId)?.score;

            updateScore({
                element: myScoreEl,
                score: myScore
            });
        }

        const usersNotMe = Object.keys(users)
            .filter((id) => id !== roomUserId)
            .map((id) => users[id]);

        Object.values(usersNotMe).forEach(({ id: userId, lastClick: { epoch, x, y } = {} }) => {

            const userClicked = epoch;
            const lastUserClick = clickTracker[userId];
            let shouldGenParticles = false;

            if (userClicked && !lastUserClick || (lastUserClick && userClicked > lastUserClick)) {
                shouldGenParticles = true;
            }

            if (shouldGenParticles) {
                genParticles(x, y);
            }

            clickTracker[userId] = epoch;
        });

        const usersYesMe = users[Object.keys(users).find((id) => id === roomUserId)];

        const singleUsersNotMe = usersNotMe.length === 1 ? usersNotMe[0] : null;

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

        const getIds = (arr) => arr.map(({ id }) => id);

        // Manage ghost tacos

        remainingGhostTacos.forEach((tacoEl) => {

            const tacoUpdate = usersNotMe.find(({ id }) => id === tacoEl.id);

            if (tacoUpdate) {
                moveCursor({
                    element: tacoEl,
                    x: tacoUpdate.x,
                    y: tacoUpdate.y
                });

                const tacoScore = document.getElementById(`${tacoEl.id}-score`);

                updateScore({
                    element: tacoScore,
                    score: roomScoreboard.find(({ userId }) => userId === tacoEl.id)?.score
                });
            }
        });

        const roomUserIds = Object.keys(roomUsers);
        const newGhostIds = getIds(usersNotMe).filter((id) => !roomUserIds.includes(id));

        usersNotMe.forEach((user) => {

            roomUsers[user.id] = user;
        });

        newGhostIds.forEach((id) => {

            // Add a new ghost taco
            const newTacoEl = document.createElement('div');
            const newTacoCursor = document.createElement('div');
            const newTacoScoreEl = document.createElement('div');

            newTacoScoreEl.id = `${id}-score`;

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

            const userInfo = usersNotMe.find(({ id }) => id === id);

            moveCursor({
                element: newTacoEl,
                x: userInfo.x,
                y: userInfo.y
            });

            genParticles(userInfo.x, userInfo.y);
        });
    };

    // Coooonnnnnneeeeeeecccccctttttttt!!!!!!!
    await RoomClient.subscribe(`/rooms/${TACOS_ROOM_ID}`, onRoomUpdate);
};

const run = () => {

    initSocket();

    // Broadcast movements to the room and only
    // update my view with what we get from the server
    const onMouseMove = (evt) => {

        roomX = evt.pageX;
        roomY = evt.pageY;

        throttledBroadcast();
    };

    // Desktop and mobile clicks
    window.addEventListener('mousemove', onMouseMove);

    // Mobile support
    window.addEventListener('touchmove', (evt) => {

        onMouseMove({
            pageX: Math.round(evt.changedTouches[0].clientX),
            pageY: Math.round(evt.changedTouches[0].clientY)
        });
    });

    // My taco's particles
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
