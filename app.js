var express  = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('view engine', 'ejs' );
app.set('port', (process.env.PORT || 3000));

//­º­¶
app.get('/', function(req, res){
	
	res.render('pages/index.ejs');
	
});

//play­¶
app.get('/play', function(req, res){
	//¶i¤Jplay­¶
	res.render('pages/play');
});

var server = app.listen(app.get('port'), function(){
	console.log('Start server on port 3000:');
});


