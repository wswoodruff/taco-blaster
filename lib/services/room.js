'use strict';

const Schmervice = require('@hapipal/schmervice');
const Bounce = require('@hapi/bounce');
const { v4: uuidv4 } = require('uuid');
const Throttle = require('lodash.throttle');

const DEBUG = false;
const MAX_USERS_PER_SCOREBOARD = 10;
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
        scoreboard: {}
    },
    'trippys-lab': {
        id: 'trippys-lab',
        name: 'Trippy\'s Lab',
        users: {},
        scoreboard: {}
    },
    'hacks-lab': {
        id: 'trippys-lab',
        name: 'Trippy\'s Lab',
        users: {},
        scoreboard: {}
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

        this.clickTracker = {};

        // Will batch stuff to broadcast, throttled across updates
        this.roomBroadcastBuffer = {};

        // When using 'this.server.publish' later, we'll pass the
        // room id and nes will publish to the correct room.
        // Ex:
        // this.server.publish(
        //     '/room/tacos-and-friends',
        //     { id: 'tacos-and-friends', user: { id: 'xyz', ... } }
        // );
        this.server.subscription('/rooms/{id}');

        // Prune inactive users every 30 secs and sync everybody up
        setInterval(() => {

            const checkpoint = Date.now() - INACTIVE_USER_TIMEOUT;

            Object.entries(this.rooms).forEach(([roomId, room]) => {

                // checkpoint
                // room.users.forEach

                const usersToDelete = [];

                Object.entries(room.users).forEach(([userId, user]) => {

                    if (user.lastUpdate < checkpoint) {
                        usersToDelete.push(userId);
                    }
                });

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

                // Delete them!
                usersToDelete.forEach((userId) => {

                    delete room.users[userId];
                });

                this.updateClickTracker(roomId);

                // Broadcast new room state with inactive users removed
                // Set isSync: true to tell the front-end to make this an
                // allow-list of users in the room
                // Use the private func to ensure it isn't throttled
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

        this.throttledBroadcastRoomStateUpdates = Throttle((roomId) => {

            const updateBufferInfo = { ...(this.roomBroadcastBuffer[roomId] || { roomId, userIds: [] }) };

            // Clear room buffer after copying info
            this.roomBroadcastBuffer[roomId] = { roomId, userIds: [] };

            this._broadcastRoomState({
                roomId,
                ...updateBufferInfo,
                isSync: false
            });
        }, ROOM_UPDATE_THROTTLE);
    }

    updateRoomBuffer({ roomId, userIds }) {

        this.roomBroadcastBuffer[roomId] = this.roomBroadcastBuffer[roomId] || { roomId, userIds: [] };

        this.roomBroadcastBuffer[roomId] = {
            ...this.roomBroadcastBuffer[roomId],
            // Dedupe
            users: Array.from(
                new Set(this.roomBroadcastBuffer[roomId].userIds.concat(userIds))
            )
        };

        this.throttledBroadcastRoomStateUpdates(roomId);
    }

    getRoomById(roomId) {

        this.assertRoomExists(roomId);

        return this.rooms[roomId];
    }

    pruneRoomScoreboard(roomId) {

        ////////
        // MAX_USERS_PER_SCOREBOARD
    }

    onUserClick({ roomId, userId }) {

        if (!this.clickTracker[roomId]) {
            this.clickTracker[roomId] = {
                [userId]: 1
            };
        }
        else {
            this.clickTracker[roomId] = {
                ...this.clickTracker[roomId],
                [userId]: this.clickTracker[roomId][userId] + 1
            };
        }

        this.pruneRoomScoreboard(roomId);
    }

    updateClickTracker(roomId) {

        // First clean it up

        // TODO
        return;

        const room = this.getRoomById(roomId);

        if (!this.clickTracker[roomId]) {
            this.clickTracker[roomId] = {
                // These will be user ids, ex:
                // 'c9a8d8f0-f8a0-11e7-a8e3-0a5d8c5f4d6a': 123
            };
        }

        const clickTrackIdsToDelete = [];

        const roomUserIds = Object.keys(room.users);

        Object.keys(this.clickTracker[roomId]).forEach((userId) => {

            if (!roomUserIds.includes(userId)) {
                clickTrackIdsToDelete.push(userId);
            }
        });

        clickTrackIdsToDelete.forEach((userId) => {

            delete this.clickTracker[roomId][userId];
        });

        // Now act on clicks;

        //
    }

    // Use 'isPartial' to update with less info over the wire
    upsertUserInRoom({ roomId, userInfo, isPartial }) {

        this.assertRoomExists(roomId);

        const userId = userInfo.id || uuidv4();

        if (DEBUG) {
            this.server.log('log', {
                msg: `Room '${roomId}' user update:`,
                userId
            });
        }

        // Check if user exists in room already
        if (this.rooms[roomId].users[userId]) {
            if (isPartial) {
                this.rooms[roomId].users[userId] = {
                    ...this.rooms[roomId].users[userId],
                    ...userInfo
                };
            }
            else {
                this.rooms[roomId].users[userId] = {
                    ...userInfo
                };
            }
        }
        // User is new to room
        else {
            this.rooms[roomId].users[userId] = {
                id: userId,
                ...userInfo
            };
        }

        this.rooms[roomId].users[userId] = {
            ...this.rooms[roomId].users[userId],
            lastUpdate: Date.now()
        };

        // Mark upserted user for broadcast update (Add to buffer)
        this.updateRoomBuffer({ roomId, userIds: [userId] });

        return this.rooms[roomId].users[userId];
    }

    _broadcastRoomState({ roomId, userIds = [], shouldDeleteUsers = false, isSync = false }) {

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

        // Publish room info to each subscriber
        this.server.publish(
            `/rooms/${roomId}`, {
                ...update,
                isPartial
            }
        );
    }

    getRooms() {

        return this.rooms;
    }

    assertRoomExists(roomId) {

        if (!this.rooms[roomId]) {
            throw new Error('Room not found');
        }
    }
};
