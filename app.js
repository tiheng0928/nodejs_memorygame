var express  = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var room = {playernum: 0}


app.set('view engine', 'ejs' );
app.set('port', (process.env.PORT || 3000));
app.use(express.static('public'));
//����

app.get('/', function(req, res){
	
	res.render('pages/index.ejs');
});

//play��
app.get('/play', function(req, res){
	//�i�Jplay��
	res.render('pages/play');
});

//gaming��
app.get('/gamelobby', function(req, res){
	//�i�Jgaming��
	res.render('pages/gamelobby.ejs');
});

//socket
io.on('connection', function(socket) {
	console.log('socket connected');
	
	socket.on('player entered', function(playername) {
		socket.playername = playername;
		console.log("New Player:"+playername.name+" Entered.");
		//�Nplayer�s�Jfirbase
	});

	
	socket.on('player_num_plus',function() {
		socket.room = room;
		room.playernum++;
		console.log(room.playernum);
		io.sockets.emit('check_player_num',{playernum:room.playernum});
		if (room.playernum == 4) {
			io.sockets.emit('playable');
		}
	});
	
	socket.on('player_num_del',function(playernum) {
		socket.room = room;
		room.playernum--;
		console.log(room.playernum);
		io.sockets.emit('check_player_num',{playernum:room.playernum});
		if (room.playernum != 4) {
			io.sockets.emit('playdisable');
		}
	});


	
});


var server = server.listen(app.get('port'), function(){
	console.log('Start server on port 3000:');
});


