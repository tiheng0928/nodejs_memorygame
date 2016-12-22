var express  = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


app.set('view engine', 'ejs' );
app.set('port', (process.env.PORT || 3000));

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
app.get('/gaming', function(req, res){
	//�i�Jgaming��
	res.render('pages/gaming');
});

//socket
io.on('connection', function(socket) {
	console.log('socket connected');
	socket.on('player entered', function(playername) {
		socket.playername = playername;
		console.log("New Player:"+playername.name+" Entered.");
		//�Nplayer�s�Jfirbase
		
	});
	
});


var server = server.listen(app.get('port'), function(){
	console.log('Start server on port 3000:');
});


