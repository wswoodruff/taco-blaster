'use strict';

module.exports = (server, options) => ({
    value: {
        getRooms: {
            description: '[no input]',
            command: async (srv, []) => {

                const { roomService } = server.services();

                console.log('rooms\n');
                console.log(JSON.stringify(roomService.getRooms()));
            }
        }
    }
});
