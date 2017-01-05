//導入模組
var path = require('path');

var express  = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var room = {playernum: 0, enter_id: 0, player_id:0, turn_id:0, user_id:''};
var firebase = require("firebase");
var userID;
var listplayer = new Array();
var player_point = new Array();
var firebaseID = new Array();
var socketID = new Array();
var display_user = new Array();
var usernumber = 0;
var playing_player = 0;

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
	socket.on('add user',function(){ 						//進入socket給ID,查看線上人數
		console.log('player connected, ID：'+socket.id);
		userID = socket.id;
		console.log('user_num:'+usernumber);
		usernumber++;
		io.sockets.emit('usernum',usernumber);
		socket.emit('get_user_id',userID);	
	});
	/*
	socket.on('check_list_num', function(){
		socket.emit('check_player_num',room.playnum);
	});
	*/
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

	socket.on('get_id',function(currentUserId,user_id){
		var f;
		//socket.room = room;
		firebaseID.push(currentUserId);
		socketID.push(user_id);
		console.log('資料庫ID陣列有：'+firebaseID); //顯示排隊陣列中的firebaseID
		console.log('socketID陣列有：'+socketID)	//顯示排隊陣列中的socketID
		
		display_user.push(currentUserId);		//將排隊玩家的firebaseID依序插入display_user陣列
		
		console.log("Give id:"+room.player_id); //顯示現在玩家的ID
		room.user_id = user_id;					
		
		socket.emit('give_id',{player_id:room.player_id});	//玩家ID傳給前台user
		room.player_id++;									//玩家ID+1，準備給下個玩家用

		io.sockets.emit('check_turn_id',{turn_id:room.turn_id});
		io.sockets.emit('getFB_ID',display_user);
		console.log("Next id:"+room.player_id);
	});

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

	//playing_player
	socket.on('plus_playing_player', function() {
		playing_player ++;
		console.log('playing_player:' +playing_player);
		io.sockets.emit('plus_playing_player_a', playing_player);
	});

	//disconnect
	socket.on('disconnect', function() {
		usernumber--;
		if(usernumber <= 0){
			usernumber = 0;
		}

		io.sockets.emit('usernum',usernumber);
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

		//中途有人離開遊戲，遊戲停止
		console.log('playing_player:'+playing_player);
		if (playing_player == 4) {
			for(var i = 0 ; i < 4 ; i++){
				if(socket.id == listplayer[i]){
					io.sockets.emit('someone_depart');
				}
			}
		}		
	
	});

	//翻一張牌
	socket.on('click_card',function (clicked_id) {
		io.sockets.emit('turn_card',clicked_id);
	});


	socket.on('same_value_a', function(btn_id_1,btn_id_2,btn_val_1,btn_val_2){  //收到玩家正確翻牌訊息
		socket.emit('same_value_b',btn_id_1,btn_id_2,btn_val_1,btn_val_2);	//讓資料庫牌狀態變false
	});
	/*
	socket.on('displaypoint', function(){
		io.sockets.emit('display_point_onpage');
	});
	*/
	socket.on('different_value', function(btn_id_1,btn_id_2,btn_val_1,btn_val_2) {
		io.sockets.emit('different_value',btn_id_1,btn_id_2,btn_val_1,btn_val_2);
	});

	socket.on('readtogameover', function(){
		io.sockets.emit('show_point', player_point);
		io.sockets.emit('do_gameover');
	});

	socket.on('gameover', function(){
		io.sockets.emit('returnindex');
	});

	socket.on('clear_0',function(){
		listplayer = [];
		room.playernum = 0 ;
		room.player_id = 0 ;
		console.log(room.playernum);
	});

	socket.on('gameover_someone', function(){  //有人中斷的遊戲結束
		console.log('遊玩人數歸0:'+room.playernum);
		console.log('listplayer:'+listplayer);

		for(var i =0; i <4 ; i++){
			for(var j = 0; j <= i ; j++){
				if(i == j ){
					socket.to(listplayer[i]).emit('returnindex');
					console.log('有發送returnindex~');
					console.log('listplayer:'+listplayer[i]);

				}
			}

		}
	
	});
	
});



var server = server.listen(app.get('port'), function(){
	console.log('Start server on port 3000:');
});
