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

    RoomClient = new Nes.Client('ws://localhost:3000');

    await RoomClient.connect();

    const user = await updateRoom({
        roomId: TACOS_ROOM_ID,
        userId: roomUserId
    });

    console.log('roomUserId', roomUserId);

    // subscribeGame

    // const reeezzzz = await RoomClient.subscribe(`/rooms/${TACOS_ROOM_ID}`, (...args) => {

    //     console.log('args', args);
    //     console.log('wuzzuuu');
    // });

    // console.log('reeezzzz', reeezzzz);

    // async handler(id) {

    //     const { client } = m.mods.app;
    //     const subscription = m.select.model.gameSubscription();
    //     const { payload: game } = await client.request(`/games/${id}`);

    //     await client.subscribe(`/games/${id}`, m.dispatch.model.subscriptionGameUpdate);

    //     return {
    //         game,
    //         nickname: subscription && subscription.game === id ?
    //             subscription.nickname :
    //             null
    //     };
    // }

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
            roomEl.appendChild(newTacoEl);

            const userInfo = usersNotMe.find(({ id }) => id === id);

            moveCursor({
                element: newTacoEl,
                x: userInfo.x,
                y: userInfo.y
            });
        });

        // console.log('updateCallback', props);
    };

    // Coooonnnnnneeeeeeecccccctttttttt!!!!!!!
    await RoomClient.subscribe(`/rooms/${TACOS_ROOM_ID}`, onRoomUpdate);
}

const run = () => {

    initSocket();

    const throttledBroadcast = Throttle(({ x, y }) => {

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
