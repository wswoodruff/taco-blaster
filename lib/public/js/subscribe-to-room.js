
// We need this wrapper to make async/await nice to write
exports.subscribe = async ({ roomId }) => {

    console.log('roomId', roomId);

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

    const clickTracker = {};

    const onRoomUpdate = (props) => {

        const { id: roomId, name, users = [], isSync } = props;

        // Thx copilot
        const usersNotMe = Object.keys(users)
            .filter((id) => id !== roomUserId)
            .map((id) => users[id]);

        Object.values(usersNotMe).forEach(({ id: userId, mouseIsDown: userMouseIsDown, x, y }) => {

            if (clickTracker[userId] && !userMouseIsDown) {
                genParticles(x, y);
            }

            clickTracker[userId] = userMouseIsDown;
        });

        const usersYesMe = users[Object.keys(users).find((id) => id === roomUserId)];

        const usersMarkedForDeletion = Object.values(usersNotMe)
            .filter(({ shouldDelete }) => !!shouldDelete)
            .map(({ id }) => id);

        const singleUsersNotMe = usersNotMe.length === 1 ? usersNotMe[0] : null;

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

        const getIds = (arr) => arr.map(({ id }) => id);

        // Manage the ghost tacos

        const ghostTacos = Array.from(document.getElementsByClassName('ghost-taco'));

        const existingGhostIds = [];

        ghostTacos.forEach((tacoEl) => {

            const tacoExistsInUsers = getIds(usersNotMe).includes(tacoEl.id);

            // Remove inactive tacos
            if (usersMarkedForDeletion.includes(tacoEl.id) || (isSync && !tacoExistsInUsers)) {
                // Remove this taco
                roomEl.removeChild(tacoEl);
                return;
            }

            existingGhostIds.push(tacoEl.id);

            const tacoUpdate = usersNotMe.find(({ id }) => id === tacoEl.id);

            if (tacoUpdate) {
                moveCursor({
                    element: tacoEl,
                    x: tacoUpdate.x,
                    y: tacoUpdate.y
                });
            }
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

    window.addEventListener('mousemove', onMouseMove);
};

run();

