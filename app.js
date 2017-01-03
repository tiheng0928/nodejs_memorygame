//導入模組
var path = require('path');

var express  = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var room = {playernum: 0, enter_id: 0, player_id:0, turn_id:0};
var firebase = require("firebase");
var userID;
var listplayer = new Array();
var player_point = new Array();
player_point = [0,0,0,0];

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
	socket.on('add user',function(){
		console.log('player connected, ID：'+socket.id);
		userID = socket.id;
		socket.emit('get_user_id',userID);	
	})
	
	socket.emit('set_enter_id',{enter_id:room.enter_id});
	console.log(room.enter_id);

	socket.on('player_num_plus',function(plus_data) {
		socket.room = room;
		room.playernum++;
		room.enter_id = 1;
		listplayer.push(plus_data);
		console.log(plus_data);
		for (var i = 0; i < listplayer.length; i++) {
			console.log(listplayer[i]);
		}
		console.log(room.enter_id);
		io.sockets.emit('check_player_num',{playernum:room.playernum});
		socket.emit('set_enter_id',{enter_id:room.enter_id});
		if(room.playernum == 4){
			io.sockets.emit('full_result');
		}
	});
	
	socket.on('player_num_del',function(){
		socket.room = room;
		room.playernum--;
		room.enter_id = 0;
		console.log(room.enter_id);
		io.sockets.emit('check_player_num',{playernum:room.playernum});
		socket.emit('set_enter_id',{enter_id:room.enter_id});
		if(room.playernum != 4){
			io.sockets.emit('empty_result');
		}
		else{
			io.sockets.emit('full_result');
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

	//socket.on('link_player',function(userID,player_id){
		//player.push({userID:userID,player_id:player_id});
		//console.log('player:'+player);
	//});

	io.sockets.emit('set_turn_id',{turn_id:room.turn_id});
	
	socket.on('add_turn',function(){
		room.turn_id++;
		io.sockets.emit('set_turn_id',{turn_id:room.turn_id});
		console.log("Now turn:"+room.turn_id);
		io.sockets.emit('check_turn_id',{turn_id:room.turn_id});
	});

	socket.on('send_point',function(userID,point){
		for(var i=0;i<listplayer.length;i++){
			if(userID == listplayer[i]){
				player_point[i] = point;
				console.log('listplayer'+listplayer);
				console.log('玩家'+i+'：'+player_point[i]);
				io.sockets.emit('show_point',player_point);
			}
		}
	});

	socket.on('send_point_combo',function(userID,point,combo){
		for(var i=0;i<listplayer.length;i++){
			if(userID == listplayer[i]){
				player_point[i] = point;
				console.log('listplayer'+listplayer);
				console.log('玩家'+i+'：'+player_point[i]);
				io.sockets.emit('show_point',player_point);
				io.sockets.emit('show_combo',combo);
			}
		}
	});

	socket.on('disconnect', function() {
		console.log('socket disconnected :'+ socket.id);
		for (var i = 0; i < listplayer.length; i++) {
			if (listplayer[i] == socket.id) {
				room.playernum--;
				io.sockets.emit('check_player_num',{playernum:room.playernum});
				if(room.playernum != 4){
					io.sockets.emit('empty_result');
				}
			}
		}
	
	});

	//翻一張牌
	socket.on('click_card',function (clicked_id) {
		io.sockets.emit('turn_card',clicked_id);
	});


	socket.on('same_value_a', function(btn_id_1,btn_id_2,btn_val_1,btn_val_2){
		io.sockets.emit('same_value_b',btn_id_1,btn_id_2,btn_val_1,btn_val_2);
	});

	socket.on('different_value', function(btn_id_1,btn_id_2,btn_val_1,btn_val_2) {
		io.sockets.emit('different_value',btn_id_1,btn_id_2,btn_val_1,btn_val_2);
	});
	
	socket.on('gameover', function(){
		listplayer = [];
		room.playernum = 0 ;
		player_point = [0,0,0,0];
		room.player_id = 0;
		room.turn_id = 0;
		room.enter_id = 0;
		console.log("歸零player_id:"+room.player_id);
		console.log("歸零player_id:"+room.player_id);
		io.sockets.emit('returnindex');
		io.sockets.emit('clear_all',player_point,room.player_id,room.enter_id);
	});
	
});



var server = server.listen(app.get('port'), function(){
	console.log('Start server on port 3000:');
});
