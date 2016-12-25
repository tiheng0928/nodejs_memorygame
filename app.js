var express  = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var room = {playernum: 0, enter_id: 0}


app.set('view engine', 'ejs' );
app.set('port', (process.env.PORT || 3000));
app.use(express.static('public'));
//­º­¶

app.get('/', function(req, res){
	
	res.render('pages/index.ejs');
});

//gaming­¶
app.get('/gaming', function(req, res){
	//¶i¤Jplay­¶
	res.render('pages/gaming');
});

//gaming­¶
app.get('/gamelobby', function(req, res){
	//¶i¤Jgaming­¶
	res.render('pages/gamelobby.ejs');
});

//socket
io.on('connection', function(socket) {
	console.log('socket connected');
	
	socket.on('player entered', function(playername) {
		socket.playername = playername;
		console.log("New Player:"+playername.name+" Entered.");
		//±Nplayer¦s¤Jfirbase
	});
	socket.emit('set_enter_id',{enter_id:room.enter_id});
	console.log(room.enter_id);
	socket.on('player_num_plus',function() {
		socket.room = room;
		room.playernum++;
		room.enter_id = 1;
		console.log(room.enter_id);
		io.sockets.emit('check_player_num',{playernum:room.playernum});
		socket.emit('set_enter_id',{enter_id:room.enter_id});
		if(room.playernum == 4){
			io.sockets.emit('full_result');
		}
	});
	
	socket.on('player_num_del',function(playernum) {
		socket.room = room;
		room.playernum--;
		room.enter_id = 0;
		console.log(room.enter_id);
		io.sockets.emit('check_player_num',{playernum:room.playernum});
		socket.emit('set_enter_id',{enter_id:room.enter_id});
		if(room.playernum != 4){
			io.sockets.emit('empty_result');
		}
	});
});

io.on('disconnect', function(socket) {
	console.log('socket disconnected');
	if(room.enter_id == 1){
		room.playernum--;
	}
	console.log(room.playernum);
});

var server = server.listen(app.get('port'), function(){
	console.log('Start server on port 3000:');
});


