'use strict';

let ehh = "ehhhhzzzz";

function Dataz() {
  this.timecode = -1;
  this.trackname = "";
  this.clientIDs = [];
}
Dataz.prototype.addClientId = function (id) {
  for (var i = 0; i < the.clientIDs.length; i++) {
    if ( id === the.clientIDs[i] ){
      // console.log("client id already in list");
      return -1;
    }
  }
  this.clientIDs.push(id);
};


module.exports = {
    method: 'GET',
    path: '/tacos',
    options: {
        handler: async (request, h) => {
          // return "FISIiiiiiishg!!! " + ehh;
          var t = new Dataz();
          t.trackname = "mrBUnnyRunner";
          t.timecode = 783624;
          // t.addClientId(4444);
          return t;
        }
    }
};
