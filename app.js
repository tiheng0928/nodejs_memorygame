var express  = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


app.set('view engine', 'ejs' );
app.set('port', (process.env.PORT || 3000));

//首頁

app.get('/', function(req, res){
	
	res.render('pages/index.ejs');
	
});

//play頁
app.get('/play', function(req, res){
	//進入play頁
	res.render('pages/play');
});

//gaming頁
app.get('/gaming', function(req, res){
	//進入gaming頁
	res.render('pages/gaming');
});

//socket
io.on('connection', function(socket) {
	console.log('socket connected');
	socket.on('player entered', function(playername) {
		socket.playername = playername;
		console.log("New Player:"+playername.name+" Entered.");
		//將player存入firbase
		
	});
	
});


var server = server.listen(app.get('port'), function(){
	console.log('Start server on port 3000:');
});


