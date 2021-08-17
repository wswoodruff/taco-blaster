'use strict';

const Schmervice = require('@hapipal/schmervice');
const Bounce = require('@hapi/bounce');
const { v4: uuidv4 } = require('uuid');

const INACTIVE_USER_TIMEOUT = 5 * 1000; // 5 seconds
const SYNC_INTERVAL = 3 * 1000; // 3 seconds

const DEFAULT_ROOMS = {
    'tacos-n-friends': {
        // Specifying the id here again
        // helps us give a generic string
        // to nes for broacasting to rooms
        // this.server.subscription('/room/{id}');
        id: 'tacos-n-friends',
        name: 'Tacos n Friends',
        users: {}
    },
    'trippys-lab': {
        id: 'trippys-lab',
        name: 'Trippy\'s Lab',
        users: {}
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
                        `Deleting inactive users in room ${roomId}:\n`,
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

                // Broadcast new room state with inactive users removed
                // Set isSync: true to tell the front-end to make this an
                // allow-list of users in the room
                this.broadcastRoomState({ roomId, isSync: true });
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

    // Use 'isPartial' to update with less info over the wire
    upsertUserInRoom({ roomId, userInfo, isPartial }) {

        this.assertRoomExists(roomId);

        const userId = userInfo.id || uuidv4();

        // if (this.options.developmentMode) {
        //     this.server.log('log', {
        //         msg: `Room '${roomId}' user update:`,
        //         userId
        //     });
        // }

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

        // Broadcast upserted user to all room listeners
        this.broadcastRoomState({ roomId, userIds: [userId] });

        return this.rooms[roomId].users[userId];
    }

    broadcastRoomState({ roomId, userIds = [], deleteUsers = false, isSync = false }) {

        this.assertRoomExists(roomId);

        const isPartial = !!userIds.length;
        isSync = isSync || !isPartial;

        let update;

        if (!isPartial) {
            update = {
                isSync,
                ...this.rooms[roomId]
            };
        }
        else {
            update = {
                isSync,
                ...this.rooms[roomId],
                users: {
                    ...userIds.reduce((collector, userId) => ({
                        ...collector,
                        [userId]: deleteUsers ? { id: userId, shouldDelete: true } : this.rooms[roomId].users[userId]
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
