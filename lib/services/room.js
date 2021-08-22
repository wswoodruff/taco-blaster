'use strict';

const Schmervice = require('@hapipal/schmervice');
const Bounce = require('@hapi/bounce');
const { v4: uuidv4 } = require('uuid');
const Throttle = require('lodash.throttle');

// TODO perf improvement
// Implement https://github.com/fastify/fast-json-stringify
// on front and back-ends, but most importantly the back-end

const DEBUG = false;
const DEBUG_UPDATES = false;
const MAX_SCOREBOARD_LEADERS = 8;
const MAX_CHAT_MESSAGES = 5;
const INACTIVE_USER_TIMEOUT = 3 * 1000; // 3 seconds
const SYNC_INTERVAL = 3 * 1000; // 3 seconds
const ROOM_UPDATE_THROTTLE = 14; // 14 milliseconds — close to 16 which would be 60 fps, matches CURSOR_UPDATE_THROTTLE on the front-end

// TODO build room 'plugins', and add them to a data 'pipeline' that is built
// on server start according to config, that lets us skip unnecessary checks
// or anything we don't need, to overall aim for perf improvements.

const DEFAULT_ROOMS = {
    'tacos-n-friends': {
        // Specifying the id here again
        // helps us give a generic string
        // to nes for broacasting to rooms
        // this.server.subscription('/room/{id}');
        id: 'tacos-n-friends',
        name: 'Tacos n Friends',
        users: {},
        scoreboard: {
            trpz: 42000
        },
        trackMouseDown: false,
        hackable: true,
        scorePerClick: true,
        hasChatRoom: true
    },
    'trippys-lab': {
        id: 'trippys-lab',
        name: 'Trippy\'s Lab',
        users: {},
        scoreboard: {},
        trackMouseDown: false,
        spawnFriendlys: 2
    },
    'hack-lab': {
        id: 'hack-lab',
        name: 'Hack Lab',
        users: {},
        scoreboard: {},
        trackMouseDown: false
    }
};

const internals = [];

module.exports = class RoomService extends Schmervice.Service {

    initialize() {

        // Use 'initRooms' to initialize the RoomService with data
        let { initRooms } = this.options;

        try {
            initRooms = JSON.parse(initRooms);
        }
        catch (parseErr) {
            Bounce.ignore(parseErr, SyntaxError);
            initRooms = null;
        }

        this.rooms = initRooms || DEFAULT_ROOMS;

        // Client-side reported clicks
        this.clientClickTracker = {};

        // Tracking clicks server-side by monitoring mousedown for the scoreboard
        // Keyed by roomId
        this.mousedownTracker = {};

        // Will batch userIds to broadcast on a throttle
        // Keyed by roomId
        this.roomBroadcastBuffer = {};

        // When using 'this.server.publish' later, we'll pass the
        // room id and nes will publish to the correct room.
        // Ex:
        // this.server.publish(
        //     '/room/tacos-and-friends',
        //     { id: 'tacos-and-friends', user: { id: 'xyz', ... } }
        // );
        this.server.subscription('/rooms/{id}');

        this._setupSyncInterval();

        this._setupThrottledRoomStateBroadcast();
    }

    _setupThrottledRoomStateBroadcast() {

        // Only once
        if (this._throttledRoomStateBroadcastIsSetup) {
            return;
        }

        this._throttledRoomStateBroadcastIsSetup = true;

        // Hot path
        this.throttledBroadcastRoomStateUpdates = Throttle((roomId) => {

            // this.roomBroadcastBuffer[roomId] is an array of user ids
            const userIds = [...(this.roomBroadcastBuffer[roomId] || [])];

            if (!userIds) {
                return;
            }

            // Clear room buffer after copying info. Any updates after this line will be buffered for the next update
            this.roomBroadcastBuffer[roomId] = [];

            // Hot path
            this._broadcastRoomState({
                roomId,
                userIds,
                isSync: false
            });
        }, ROOM_UPDATE_THROTTLE);
    }

    _setupSyncInterval() {

        // Only once
        if (this._syncIntervalIsSetup) {
            return;
        }

        this._syncIntervalIsSetup = true;

        // Prune inactive users and sync everybody up
        setInterval(() => {

            const checkpoint = Date.now() - INACTIVE_USER_TIMEOUT;

            Object.entries(this.rooms).forEach(([roomId, room]) => {

                const usersToDelete = [];

                Object.entries(room.users).forEach(([userId, user]) => {

                    if (user.lastUpdate < checkpoint) {
                        usersToDelete.push(userId);
                    }
                });

                if (DEBUG) {
                    if (usersToDelete.length) {
                        console.log(
                            '\nlog\n',
                            `Marking inactive users for deletion in room ${roomId}:\n`,
                            usersToDelete.map((userId) => `userId: ${userId}`)
                        );
                    }
                    else {
                        this.server.log('log\n', `No inactive users in room ${roomId}\n`);
                    }
                }

                // Delete em!
                usersToDelete.forEach((userId) => {

                    delete room.users[userId];
                });

                this.syncRoomScoreboard(roomId);

                // Broadcast new room state with inactive users removed
                // Set isSync: true to tell the front-end to make this a
                // source-of-truth for room state and should treat this message
                // differently than regular updates.
                this._broadcastRoomState({ roomId, isSync: true });
            });

            if (DEBUG) {
                const now = Date.now();
                console.log('\nlog', {
                    label: 'Rooms state',
                    timestamp: now,
                    timestampReadable: Date(now).toLocaleString(),
                    rooms: JSON.stringify(this.rooms, null, 4)
                });
            }
        }, SYNC_INTERVAL);
    }

    getRooms() {

        return { ...this.rooms };
    }

    getRoomById(roomId) {

        this.assertRoomExists(roomId);

        return { ...this.rooms[roomId] };
    }

    syncRoomScoreboard(roomId) {

        const room = this.rooms[roomId];
        const roomUserIds = Object.keys(this.rooms[roomId].users);

        const mandatoryRoomScoreboardUsers = this.getSortedRoomScoreboard(roomId)
            .slice(0, MAX_SCOREBOARD_LEADERS);

        if (DEBUG) {
            console.log('mandatoryRoomScoreboardUsers', mandatoryRoomScoreboardUsers);
        }

        const mandatoryRoomScoreboardUsersIds = mandatoryRoomScoreboardUsers.map(({ userId }) => userId);

        const idsToDelete = Object.keys(room.scoreboard).filter((userId) => {

            return !mandatoryRoomScoreboardUsersIds.includes(userId) &&
                !roomUserIds.includes(userId);
        });

        idsToDelete.forEach((userId) => {

            delete this.rooms[roomId].scoreboard[userId];
        });
    }

    getSortedRoomScoreboard(roomId) {

        return Object.entries((this.rooms[roomId].scoreboard))
            .sort(([, scoreA], [, scoreB]) => {

                return scoreB < scoreA ? -1 : 1;
            })
            .map(([userId, score]) => {

                return { userId, score };
            });
    }

    updateRoomScoreboardUser({ roomId, userId, score }) {

        this.rooms[roomId].scoreboard[userId] = score;

        // Broadcast each scoreboard update
        this._broadcastRoomState({
            roomId,
            shouldUpdateScoreboard: true
        });
    }

    trackRoomScoreboardWithUser({ roomId, userInfo }) {

        const room = this.rooms[roomId];
        const userId = userInfo.id;

        if (room.scorePerClick) {

            this.clientClickTracker[roomId] = this.clientClickTracker[roomId] || {};

            if (!userInfo.lastClick) {
                return;
            }

            if (userInfo.lastClick.epoch > (this.clientClickTracker[roomId][userId] || 0)) {

                this.updateRoomScoreboardUser({
                    roomId,
                    userId,
                    score: (room.scoreboard[userId] || 0) + 1
                });
            }

            this.clientClickTracker[roomId][userId] = userInfo.lastClick.epoch;
        }
    }

    onUserClick({ roomId, userId }) {

        const room = this.rooms[roomId];
        const roomUser = this.rooms[roomId].users[userId];
        const roomUserScore = room.scoreboard[userId] || 0;

        if (room.scorePerClick) {
            this.updateRoomScoreboardUser({
                roomId,
                userId,
                score: roomUserScore + 1
            });
        }

        this.updateRoomUser({
            roomId,
            userInfo: {
                id: userId,
                lastClick: {
                    epoch: Date.now(),
                    // Get latest x, y
                    x: roomUser.x,
                    y: roomUser.y
                }
            }
        });
    }

    trackUserClicks({ roomId, userInfo }) {

        this.mousedownTracker[roomId] = this.mousedownTracker[roomId] || {};

        if (this.rooms[roomId].clickOnMouseDown) {
            this.onUserClick({ roomId, userId: userInfo.id });
        }
        // When the mouse was down before but it's not now, that's a mouseup, that's a click!
        else if (this.mousedownTracker[roomId][userInfo.id] && !userInfo.isMouseDown) {
            // It's a click!
            this.onUserClick({ roomId, userId: userInfo.id });
        }

        // We track by setting 'this.mousedownTracker[roomId][userInfo.id' based on 'isMouseDown'
        this.mousedownTracker[roomId][userInfo.id] = !!userInfo.isMouseDown;
    }

    // Hot path
    updateRoomUser({ roomId, userInfo }) {

        this.rooms[roomId].users[userInfo.id] = {
            ...this.rooms[roomId].users[userInfo.id],
            ...userInfo,
            lastUpdate: Date.now()
        };

        // Hot path
        // Dedupe
        this.roomBroadcastBuffer[roomId] = Array.from(new Set(
            (this.roomBroadcastBuffer[roomId] || []).concat(userInfo.id)
        ));

        this.throttledBroadcastRoomStateUpdates(roomId);
    }

    updateRoomChat({ roomId, chatInfo }) {

        this.rooms[roomId].chat = this.rooms[roomId].chat || [];

        // Push to end of chat
        this.rooms[roomId].chat.push({
            ...chatInfo,
            epoch: Date.now(),
            id: uuidv4()
        });

        const chatLength = this.rooms[roomId].chat.length;

        if (chatLength > MAX_CHAT_MESSAGES) {
            // Remove from beginning
            const chatToRemove = chatLength - MAX_CHAT_MESSAGES;
            this.rooms[roomId].chat = (
                this.rooms[roomId].chat.slice(chatToRemove)
            );
        }

        // Broadcast each chat update
        this._broadcastRoomState({
            roomId,
            shouldUpdateChat: true
        });

        const { userId } = chatInfo;

        if (userId) {
            this.rooms[roomId].users[userId] = {
                ...this.rooms[roomId].users[userId],
                lastUpdate: Date.now()
            };
        }
    }

    // Hot path
    upsertUserInRoom({ roomId, userInfo }) {

        const {
            randomFromArr,
            sillyNames
        } = internals;

        const room = this.rooms[roomId];

        // Hot path
        this.assertRoomExists(roomId);

        // if (!room.hackable && userInfo.id && !this.rooms[roomId].users[userInfo.id]) {
        if (userInfo.id && !this.rooms[roomId].users[userInfo.id]) {
            // Ah ah aahhhh! You didn't say the magic word!
            userInfo.id = null;
        }

        const userId = userInfo.id || `${uuidv4()}-${randomFromArr(sillyNames)}`; // Hot path
        userInfo.id = userId;

        if (DEBUG_UPDATES) {
            this.server.log('log', {
                msg: 'user upsert',
                userInfo
            });
        }

        // Hot path
        this.updateRoomUser({ roomId, userInfo });

        if (this.rooms[roomId].trackMouseDown) {
            // Hot path
            this.trackUserClicks({ roomId, userInfo });
        }

        this.trackRoomScoreboardWithUser({ roomId, userInfo });

        return this.rooms[roomId].users[userId];
    }

    // Hot path, throttled via 'this.throttledBroadcastRoomStateUpdates'
    _broadcastRoomState(broadcastInfo) {

        let {
            roomId,
            shouldDeleteUsers = false,
            isSync = false,
            shouldUpdateScoreboard = false,
            shouldUpdateChat = false
        } = broadcastInfo;

        // Hot path
        this.assertRoomExists(roomId);

        let update;

        const broadcastRoom = { ...this.rooms[roomId] };
        delete broadcastRoom.trackMouseDown;

        // NOTE Clients will need to know 'shouldDeleteUsers'
        // being true or false should affect how they deal with the update.
        // Otherwise the front-end should check for 'isSync',
        // and deal with that as a source-of-truth update.
        if (isSync) {
            update = {
                ...broadcastRoom,
                isSync,
                scoreboard: this.getSortedRoomScoreboard(roomId)
            };

            if (broadcastRoom.hasChatRoom) {
                update.chat = this.rooms[roomId].chat;
            }
        }
        else {
            // No need to send down isSync: false
            update = {
                id: broadcastRoom.id,
                users: this.rooms[roomId].users
            };

            if (shouldDeleteUsers) {
                update.shouldDeleteUsers = shouldDeleteUsers;
            }

            if (shouldUpdateScoreboard) {
                update.scoreboard = this.getSortedRoomScoreboard(roomId);
            }

            if (broadcastRoom.hasChatRoom && shouldUpdateChat) {
                update.chat = this.rooms[roomId].chat;
            }
        }

        // Hot path
        // Publish room info to each subscriber
        this.server.publish(
            `/rooms/${roomId}`, {
                ...update,
                epoch: Date.now()
            }
        );
    }

    getRooms() {

        return this.rooms;
    }

    // Hot path
    assertRoomExists(roomId) {

        if (!this.rooms[roomId]) {
            throw new Error('Room not found');
        }
    }
};

internals.randomFromArr = (arr) => arr[Math.floor(Math.random() * arr.length)];

internals.sillyNames = [
    'willie pup',
    'suckaaa',
    'cool kid',
    'cone cone cone',
    '2 stoned',
    'timbo slice',
    'krampus',
    'delivery 4 a dollar',
    'juice shopp',
    'bronkonious',
    'bronky',
    // Thx copilot for these next 2
    'bronk ronk',
    'bronk ronk ronk',
    'stonks',
    'stumpy',
    'likes turds',
    'buy schmeckles',
    'taco blastrrr',
    'the kiddd',
    'vr is pr',
    'dragonnnn'
];
