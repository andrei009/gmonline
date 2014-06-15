//SERVER (APP.JS)


var app = require('http').createServer(handler)

  , io = require('socket.io').listen(app)
  
  , _ = require('lodash')

  , fs = require('fs');


app.listen(3000);


function handler (req, res) {

  fs.readFile(__dirname + '/index.html',

  function (err, data) {

    if (err) {

      res.writeHead(500);

      return res.end('Error loading index.html');

    }


    res.writeHead(200);

    res.end(data);

  });

}

var connections = [];

io.sockets.on('connection', function (socket) {

    // Init
    connections[socket.id] = socket;
    console.log('Someone joined :'+socket.id);
    
    socket.emit('message', { socket: 0, data:{ flag: 'connected', socket: socket.id }});

    socket.on('message', function (data) {
        if (!data.type) return;
        var pack = null;
        
        switch (data.type) {
            
            case 'broadcast':
                
                pack = { socket: socket.id , data: data.data };
                
                if (data.to) {
                    io.sockets.socket(data.to).emit('message',pack);
                    return;
                }
                
                if (data.room) {
                    socket.broadcast.to(data.room).emit('message', pack);
                } else {
                    socket.broadcast.emit('message', pack);
                }
                break;
                
            case 'broadcastvolatile':
                
                pack = { socket: socket.id , data: data.data };
                
                if (data.to) {
                    io.sockets.socket(data.to).volatile.emit('message',pack);
                    return;
                }
                
                if (data.room)  {
                    console.log('bv to room:'+data.room);
                    socket.broadcast.volatile.to(data.room).emit('message', pack);
                } else {
                    socket.broadcast.volatile.emit('message',pack);
                }
                break;
                
            case 'join':
                console.log('join room:'+data.room);
                if (data.room) {
                    socket.join(data.room);
                }
                
                pack = { socket: socket.id , data: data.data};
                socket.broadcast.to(data.room).emit('message', pack);
                
                break;
                
            case 'leave':
                console.log('leave room:'+data.room);
                pack = { socket: socket.id , data: data.data};
                socket.broadcast.to(data.room).emit('message', pack);
                
                if (data.room) {
                    socket.leave(data.room);
                }
                break;
        }

    });


  socket.on('disconnect', function() {

    prevRoom = '';
    if (Object.keys(io.sockets.manager.roomClients[socket.id])[1]) {
        prevRoom = Object.keys(io.sockets.manager.roomClients[socket.id])[1].substring(1);
    }
    console.log(prevRoom);
    pack = { socket: socket.id , data: {flag:'disconnect'}};
    socket.broadcast.to(prevRoom).emit('message', pack);
   delete connections[socket.id];
   console.log('Some left the party :'+ socket.id);
  });

});
