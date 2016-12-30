//導入模組
var path = require('path');

var express  = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var room = {playernum: 0, enter_id: 0, player_id:0, turn_id:0};
var firebase = require("firebase");

// Initialize Firebase
var config = {
	apiKey: "AIzaSyASoh2OjHgNFAfu_UI7rT1sa3NKui-3D7E",
    authDomain: "pokergame-407e6.firebaseapp.com",
    databaseURL: "https://pokergame-407e6.firebaseio.com",
    storageBucket: "pokergame-407e6.appspot.com",
    messagingSenderId: "190173330964"
};
firebase.initializeApp(config);

var page = require('./routes/page');	//設定路由


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.set('port', (process.env.PORT || 3000));



app.get('/', page.index);
app.get('/gamelobby', page.gamelobby);

//socket
io.on('connection', function(socket) {
	console.log('socket connected');
	
	socket.on('player entered', function(playername) {
		socket.playername = playername;
		console.log("New Player:"+playername.name+" Entered.");
		//輸入名字
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
	
	socket.on('player_num_del',function() {
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

	socket.on('get_id',function(){
		socket.room = room;
		console.log("Give id:"+room.player_id);
		socket.emit('give_id',{player_id:room.player_id});
		room.player_id++;
		io.sockets.emit('check_turn_id',{turn_id:room.turn_id});
		console.log("Next id:"+room.player_id);
	});

	io.sockets.emit('set_turn_id',{turn_id:room.turn_id});
	
	socket.on('add_turn',function(){
		socket.room = room;	
		room.turn_id++;
		io.sockets.emit('set_turn_id',{turn_id:room.turn_id});
		console.log("Now turn:"+room.turn_id);
		io.sockets.emit('check_turn_id',{turn_id:room.turn_id});
	});

	socket.on('disconnect', function() {
		console.log('socket disconnected');
		//if(room.enter_id == 1){
			//room.playernum--;
		//}
		//console.log(room.playernum);
	});

	socket.on('same_value_a', function() {
		io.sockets.emit('same_value_b');
	});

	socket.on('different_value', function() {
		io.sockets.emit('different_value');
	});

	
});



var server = server.listen(app.get('port'), function(){
	console.log('Start server on port 3000:');
});
