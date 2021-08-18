'use strict';

const Schmervice = require('@hapipal/schmervice');
const Bounce = require('@hapi/bounce');
const { v4: uuidv4 } = require('uuid');
const Throttle = require('lodash.throttle');

const DEBUG = true;
const MAX_SCOREBOARD_LEADERS = 10;
const INACTIVE_USER_TIMEOUT = 5 * 1000; // 5 seconds
const SYNC_INTERVAL = 3 * 1000; // 3 seconds
const ROOM_UPDATE_THROTTLE = 5; // 5 milliseconds, matches CURSOR_UPDATE_THROTTLE on the front-end

const DEFAULT_ROOMS = {
    'tacos-n-friends': {
        // Specifying the id here again
        // helps us give a generic string
        // to nes for broacasting to rooms
        // this.server.subscription('/room/{id}');
        id: 'tacos-n-friends',
        name: 'Tacos n Friends',
        users: {},
        scoreboard: []
    },
    'trippys-lab': {
        id: 'trippys-lab',
        name: 'Trippy\'s Lab',
        users: {},
        scoreboard: []
    },
    'hack-lab': {
        id: 'hack-lab',
        name: 'Hack Lab',
        users: {},
        scoreboard: []
    }
};

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

        // Keyed by roomId
        this.scoreboard = {};
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

                this.deleteRoomScoreboardInactiveUsers({ roomId, userIds: usersToDelete });

                // Broadcast new room state with inactive users removed
                // Set isSync: true to tell the front-end to make this a
                // source-of-truth for room state and should treat this message
                // differently than regular updates.
                this._broadcastRoomState({ roomId, isSync: true });
            });

            const now = Date.now();

            // We also want to log the room state to logs for now
            console.log('\nlog', {
                label: 'Rooms state',
                timestamp: Date.now(),
                timestampReadable: Date(now).toLocaleString(),
                rooms: JSON.stringify(this.rooms, null, 4)
            });

        }, SYNC_INTERVAL);
    }

    getRooms() {

        return { ...this.rooms };
    }

    getRoomById(roomId) {

        this.assertRoomExists(roomId);

        return { ...this.rooms[roomId] };
    }

    deleteRoomScoreboardInactiveUsers({ roomId, userIds }) {

        if (!userIds.length) {
            return;
        }

        // Except for scoreboard leaders
        const roomScoreboardLeaders = this.getRoomScoreboardLeaders(roomId);

        const idsToDelete = userIds.filter((userId) => !roomScoreboardLeaders.includes(userId));

        if (this.scoreboard[roomId]) {
            idsToDelete.forEach((userId) => {

                delete this.scoreboard[roomId][userId];
            });
        }
    }

    setRoomScoreboardUserScore({ roomId, userId, value }) {

        this.scoreboard[roomId][userId] = value;
    }

    getRoomScoreboardLeaders(roomId) {

        return Object.entries((this.scoreboard[roomId] || {}))
            .sort(([, scoreA], [, scoreB]) => {

                return scoreB < scoreA ? -1 : 1;
            })
            .slice(0, MAX_SCOREBOARD_LEADERS)
            .map(([userId, score]) => {

                return { userId, score };
            });
    }

    onUserClick({ roomId, userId, x, y }) {

        if (!this.scoreboard[roomId]) {
            this.scoreboard[roomId] = {
                [userId]: 1
            };
        }
        else {
            this.scoreboard[roomId] = {
                ...this.scoreboard[roomId],
                [userId]: this.scoreboard[roomId][userId] + 1
            };
        }

        this.updateRoomUser({
            roomId,
            userInfo: {
                id: userId,
                lastClick: {
                    epoch: Date.now(),
                    x,
                    y
                }
            }
        });

        this.updateRoomScoreboard(roomId);
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

    // Hot path
    // Use 'isPartial' to update with less info over the wire
    upsertUserInRoom({ roomId, userInfo }) {

        // Hot path
        this.assertRoomExists(roomId);

        const userId = userInfo.id || uuidv4(); // Hot path

        if (DEBUG) {
            this.server.log('log', {
                msg: `Room '${roomId}' user update:`,
                userId
            });
        }

        // Hot path
        userInfo.id = userId;
        this.updateRoomUser({ roomId, userInfo });

        return this.rooms[roomId].users[userId];
    }

    // Hot path, throttled tho
    _broadcastRoomState({ roomId, userIds = [], shouldDeleteUsers = false, isSync = false }) {

        // Hot path
        this.assertRoomExists(roomId);

        const isPartial = !!userIds.length;
        isSync = isSync || !isPartial;

        let update;

        if (isSync) {
            update = {
                isSync,
                ...this.rooms[roomId]
            };
        }
        else {
            // isPartial
            update = {
                isSync,
                ...this.rooms[roomId],
                users: {
                    ...userIds.reduce((collector, userId) => ({
                        ...collector,
                        [userId]: shouldDeleteUsers ?
                            { id: userId, shouldDelete: true } :
                            this.rooms[roomId].users[userId]
                    }), {})
                }
            };
        }

        // Hot path
        // Publish room info to each subscriber
        this.server.publish(
            `/rooms/${roomId}`, {
                ...update,
                isPartial,
                scoreboard: this.getRoomScoreboardLeaders(roomId),
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
