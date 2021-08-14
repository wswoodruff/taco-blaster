'use strict';

const Schmervice = require('@hapipal/schmervice');
const Bounce = require('@hapi/bounce');
const { v4: uuidv4 } = require('uuid');
const { asyncStorageInternals } = require('@hapipal/toys');

const DEFAULT_ROOMS = {
    'tacos-and-friends': {
        // Specifying the id here again
        // helps us give a generic string
        // to nes for broacasting to rooms
        // this.server.subscription('/room/{id}');
        id: 'tacos-and-friends',
        name: 'Tacos and Friends',
        users: []
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
        this.server.subscription('/room/{id}');
    }

    // Use 'isPartial' to update with less info over the wire
    upsertUserInRoom({ roomId, userInfo, isPartial }) {

        this.assertRoomExists(roomId);

        // User exists in room already — just override
        if (userInfo.id && this.rooms[roomId].users[userId]) {
            if (isPartial) {
                this.rooms[roomId].users[userId] = {
                    ...this.rooms[roomId].users[userId],
                    ...userInfo
                };
            }
            else {
                this.rooms[roomId].users[userId] = { ...userInfo };
            }
        }
        // User is new — gen id and add to room
        else {
            const userId = uuidv4();
            this.rooms[roomId].users[userId] = { ...userInfo };
        }

        // Broadcast new user to all room listeners
        this.broadcastState(roomId);
    }

    broadcastRoomState(roomId) {

        this.assertRoomExists(roomId);

        // Publish all room info to each client
        this.server.publish(`/room/${roomId}`, this.room[roomId]);
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
