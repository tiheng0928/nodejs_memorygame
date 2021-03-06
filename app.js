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
var false_num =0;

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

	socket.on('player_num_plus',function(plus_data) {
		socket.room = room;
		room.playernum++;
		console.log('目前排隊人數:'+room.playernum);
		if(room.playernum<=4){
			room.enter_id = 1;
			listplayer.push(plus_data);
			console.log(plus_data);
			for (var i = 0; i < listplayer.length; i++) {
				console.log(listplayer[i]);
			}
			console.log('我的排隊號碼:'+room.enter_id);
			io.sockets.emit('check_player_num',{playernum:room.playernum});
			socket.emit('set_enter_id',{enter_id:room.enter_id});
			if(room.playernum == 4){
				io.sockets.emit('full_result');
			}
		}
		else{
			room.playernum--;
			socket.emit('check_player_num',{playernum:room.playernum});
			socket.emit('full_result');
		}
	});
	
	socket.on('player_num_del',function(del_data){
		socket.room = room;
		if(room.playernum > 0){
			room.playernum--;
			room.enter_id = 0;
			for (var i = 0; i < listplayer.length; i++) {
				if(listplayer[i] == del_data){
					listplayer.splice(i,1);
				}
			}
			io.sockets.emit('check_player_num',{playernum:room.playernum});
			socket.emit('set_enter_id',{enter_id:room.enter_id});
			if(room.playernum != 4){
				io.sockets.emit('empty_result');
			}
			else{
				io.sockets.emit('full_result');
			}
		}
	});

	socket.on('get_id',function(currentUserId,user_id){
		var f;
		//socket.room = room;
		firebaseID.push(currentUserId);
		socketID.push(user_id);
		console.log('資料庫ID陣列有：'+firebaseID); //顯示進入遊戲陣列中的firebaseID
		console.log('socketID陣列有：'+socketID)	//顯示進入遊戲陣列中的socketID
		
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
		io.sockets.emit('start_countdown');
	});

	socket.on('send_point',function(userID,point){
		for(var i=0;i<socketID.length;i++){
			if(userID == socketID[i]){
				player_point[i] = point;
				console.log('玩家'+i+'：'+player_point[i]);
				io.sockets.emit('show_point',player_point);
			}
		}
	});

	/*
	socket.on('send_point_combo',function(userID,point,combo){
		for(var i=0;i<listplayer.length;i++){
			if(userID == listplayer[i]){
				player_point[i] = point;
				console.log('玩家'+i+'combo：'+combo);
				io.sockets.emit('show_point',player_point);
				io.sockets.emit('show_combo',combo);
			}
		}
	});
	*/

	//playing_player
	socket.on('plus_playing_player', function() {
		playing_player ++;
		console.log('playing_player:' +playing_player);
		io.sockets.emit('plus_playing_player_a', playing_player);
		if(playing_player==4){
			io.sockets.emit('start_countdown');
			io.sockets.emit('game_start');
		}
	});

	socket.on('disconnect', function() {
		usernumber--;
		if(usernumber <= 0){
			usernumber = 0;
		}
		io.sockets.emit('usernum',usernumber);
		console.log('socket disconnected :'+ socket.id);
		for (var i = 0; i < listplayer.length; i++) {
			if (listplayer[i] == socket.id && room.playernum > 0) {
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
				if(socket.id == socketID[i]){
					io.sockets.emit('someone_depart');
					console.log('發送someone_depart了');
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
		io.sockets.emit('start_countdown');
	});
	/*
	socket.on('displaypoint', function(){
		io.sockets.emit('display_point_onpage');
	});
	*/
	socket.on('different_value_a', function(btn_id_1,btn_id_2,btn_val_1,btn_val_2) {
		io.sockets.emit('different_value_b',btn_id_1,btn_id_2,btn_val_1,btn_val_2);
	});

	socket.on('timeout_recovery_a',function(card_recover){
		io.sockets.emit('timeout_recovery_b',card_recover);
	});

	socket.on('show_result',function(){
		var max = player_point[0];
		var win;
		var i =0;
		for (i = 0; i < player_point.length; i++) {
			if (player_point[i] >= max) {
            	max = player_point[i];
            	console.log(player_point[i]);
            	win = i;
        	}
		}
		console.log('win:'+win);
		console.log('max:'+max);
		io.sockets.emit('show_winner',display_user[win],max);
	});

	socket.on('readtogameover', function(){
		io.sockets.emit('show_point', player_point);
		io.sockets.emit('do_gameover');
	});

	socket.on('add_false_num',function(){
		false_num = false_num +2;
	});

	socket.on('ask_false_num',function(){
		socket.emit('now_false_num',false_num);
	});

	socket.on('gameover', function(){
		io.sockets.emit('returnindex');
	});

	socket.on('clear_0',function(){
		listplayer = [];
		room.playernum = 0 ;
		room.player_id = 0 ;
		player_point = [] ;
		playing_player = 0 ;
		display_user = [] ;
		socketID = [] ;
		false_num = 0 ;
		console.log(room.playernum);
	});

	socket.on('gameover_someone', function(){  //有人中斷的遊戲結束
		console.log('遊玩人數歸0:'+room.playernum);
		console.log('listplayer:'+listplayer);

		for(var i =0; i <4 ; i++){
			for(var j = 0; j <= i ; j++){
				if(i == j ){
					socket.to(socketID[i]).emit('returnindex_someone');
					console.log('有發送returnindex~');
					console.log('listplayer:'+socketID[i]);
				}
			}
		}
	});
});

var server = server.listen(app.get('port'), function(){
	console.log('Start server on port 3000:');
});
