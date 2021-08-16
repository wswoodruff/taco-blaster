'use strict';

require('regenerator-runtime');

// Sound offfff!!!!!!
console.log('TACOOOOOOOOOOOOOOOOOOOOS!!!');

const TACOS_ROOM_ID = 'tacos-n-friends';
const MY_TACO_ID = 'my-taco';
const USE_NES = true;
const CURSOR_UPDATE_THROTTLE = 10;

const Throttle = require('lodash.throttle');

let Nes;

if (USE_NES) {
    Nes = require('@hapi/nes/lib/client');
}

// const RECONNECT_TIMEOUT = 1000; // in milliseconds

let RoomClient;
// This will get set by the server on connection
let roomUserId = null;

const addIdToElIfNotExists = (el, id) => {

    const idEl = el.querySelector('.taco-id');

    if (!idEl) {
        const tacoId = document.createElement('div');
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
};

// Upsert user in room
const updateRoom = async ({ roomId, userId, x, y }) => {

    const payload = { x, y };

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
        const myTacoEl = document.getElementById(MY_TACO_ID);
        addIdToElIfNotExists(myTacoEl, roomUserId);
    }

    // Setup some kinda easy debugging or something
    const connectionMsg = document.getElementById('connectionMsg') || document.createElement('h3');

    connectionMsg.id = 'connectionMsg';

    if (error) {
        // let err = document.createElement(`<h3 style='color: white;'>Error ${error.message}</h3>`);
        connectionMsg.style.color = '#f88070';
        connectionMsg.textContent = `Error ${error.message}`;
    }
    else {
        connectionMsg.style.color = '#73c991';
        connectionMsg.textContent = `Connected! x: ${x || 'null'} y: ${y || 'null'}`;
    }

    // Add it
    document.body.appendChild(connectionMsg);

    return user;
};

const myTaco = document.getElementById(MY_TACO_ID);

const moveCursor = ({ element, x, y }) => {

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

    const user = await updateRoom({
        roomId: TACOS_ROOM_ID,
        userId: roomUserId
    });

    console.log('init user', user);

    const roomEl = document.querySelector('.room');

    const onRoomUpdate = (props) => {

        const { id, name, users = [] } = props;

        // Thx copilot
        const usersNotMe = Object.keys(users).filter((id) => id !== roomUserId).map((id) => users[id]);
        const usersYesMe = users[Object.keys(users).find((id) => id === roomUserId)];

        console.log('');
        console.log('usersYesMe', usersYesMe);
        console.log('');
        console.log('usersNotMe', usersNotMe);

        moveCursor({
            element: myTaco,
            x: usersYesMe?.x,
            y: usersYesMe?.y
        });

        const getIds = (arr) => arr.map(({ id }) => id);

        // Manage the ghost tacos

        const ghostTacos = Array.from(document.getElementsByClassName('ghost-taco'));

        const existingGhostIds = [];

        ghostTacos.forEach((tacoEl) => {

            // Remove inactive tacos
            if (!getIds(usersNotMe).includes(tacoEl.id)) {
                // Remove this taco
                roomEl.removeChild(tacoEl);
                return;
            }

            existingGhostIds.push(tacoEl.id);

            const tacoUpdate = usersNotMe.find(({ id }) => id === tacoEl.id);

            moveCursor({
                element: tacoEl,
                x: tacoUpdate.x,
                y: tacoUpdate.y
            });
        });

        const newGhostIds = getIds(usersNotMe).filter((id) => !existingGhostIds.includes(id));

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
        });
    };

    // Coooonnnnnneeeeeeecccccctttttttt!!!!!!!
    await RoomClient.subscribe(`/rooms/${TACOS_ROOM_ID}`, onRoomUpdate);

    // const onRoomUpdate = (props) => {

    //     const { id, name, users = [] } = props;

    //     // Thx copilot
    //     const usersNotMe = Object.keys(users).filter((id) => id !== roomUserId).map((id) => users[id]);
    //     const usersYesMe = users[Object.keys(users).find((id) => id === roomUserId)];

    //     console.log('');
    //     console.log('usersYesMe', usersYesMe);
    //     console.log('');
    //     console.log('usersNotMe', usersNotMe);

    //     moveCursor({
    //         element: myTaco,
    //         x: usersYesMe?.x,
    //         y: usersYesMe?.y
    //     });

    //     const getIds = (arr) => arr.map(({ id }) => id);

    //     // Manage the ghost tacos

    //     const ghostTacos = Array.from(document.getElementsByClassName('ghost-taco'));

    //     const existingGhostIds = [];

    //     ghostTacos.forEach((tacoEl) => {

    //         // Remove inactive tacos
    //         if (!getIds(usersNotMe).includes(tacoEl.id)) {
    //             // Remove this taco
    //             roomEl.removeChild(tacoEl);
    //             return;
    //         }

    //         existingGhostIds.push(tacoEl.id);

    //         const tacoUpdate = usersNotMe.find(({ id }) => id === tacoEl.id);

    //         moveCursor({
    //             element: tacoEl,
    //             x: tacoUpdate.x,
    //             y: tacoUpdate.y
    //         });
    //     });

    //     const newGhostIds = getIds(usersNotMe).filter((id) => !existingGhostIds.includes(id));

    //     newGhostIds.forEach((id) => {

    //         // Add a new ghost taco
    //         const newTacoEl = document.createElement('div');
    //         newTacoEl.id = id;
    //         newTacoEl.classList.add('ghost-taco');
    //         newTacoEl.classList.add('taco-cursor');

    //         addIdToElIfNotExists(newTacoEl, id);

    //         roomEl.appendChild(newTacoEl);

    //         const userInfo = usersNotMe.find(({ id }) => id === id);

    //         moveCursor({
    //             element: newTacoEl,
    //             x: userInfo.x,
    //             y: userInfo.y
    //         });
    //     });
    // };

    // // Coooonnnnnneeeeeeecccccctttttttt!!!!!!!
    // await RoomClient.subscribe(`/rooms/${TACOS_ROOM_ID}`, onRoomUpdate);
}

const run = () => {

    initSocket();

    const throttledBroadcast = Throttle(({ x, y }) => {

        // No point in awaiting this here
        updateRoom({
            roomId: TACOS_ROOM_ID,
            userId: roomUserId,
            x,
            y
        });
    }, CURSOR_UPDATE_THROTTLE);

    // Broadcast movements to the room and only
    // update my view with what we get from the server
    const onMouseMove = (evt) => {

        const mouseX = evt.pageX;
        const mouseY = evt.pageY;

        throttledBroadcast({
            x: mouseX,
            y: mouseY
        });
    };

    window.addEventListener('mousemove', onMouseMove);
};

run();






/****************************************************
                Attempt at native stuff
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
