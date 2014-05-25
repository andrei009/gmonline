//SERVER (APP.JS)


var app = require('http').createServer(handler)

  , io = require('socket.io').listen(app)

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


io.sockets.on('connection', function (socket) {

    // Init
    console.log('Someone joined :)');
    socket.emit('message', { socket: 0, data:{ flag: 'welcome', msg: 'Hello there' }});

    socket.on('message', function (data) {
        if (!data.type) return;
        var pack = null;
        
        switch (data.type) {
            case 'broadcast':
                
                pack = { socket: socket.id , data: data.data };
                socket.broadcast.emit('message', pack);
                break;
                
            case 'broadcastvolatile':
                
                pack = { socket: socket.id , data: data.data };
                socket.broadcast.volatile.emit('message',pack);
                break;
        }

    });


  socket.on('disconnect', function() {
    
   console.log('Some left the party');

  });

});
