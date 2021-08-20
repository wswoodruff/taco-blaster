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
let roomX = 0;
let roomY = 0;
// let isMouseDown = false;
let lastClick = null;

const abbreviateUserId = (userId) => `...${userId.split('-').pop()}`;

const addIdToElIfNotExists = (el, id) => {

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
        addIdToElIfNotExists(myTacoElEl, roomUserId);
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
            shouldDeleteUsers
        } = props;

        if (DEBUG) {
            console.log('onRoomUpdate', props);
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
        }

        if (isSync) {
            const scoreEl = document.getElementById('scoreboard');
            scoreEl.innerHTML = `<h3>Scoreboard</h3>${scoreboard.map(({ userId, score }) => `<p>${abbreviateUserId(userId)}: ${score}</p>`).join('')}`;
            roomUsers = users;
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
            newTacoEl.id = id;
            newTacoEl.classList.add('ghost-taco');
            newTacoEl.classList.add('taco-cursor');

            addIdToElIfNotExists(newTacoEl, id);

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
