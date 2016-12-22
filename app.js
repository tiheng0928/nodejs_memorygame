var express  = require('express');
var app = express();
var io = require('socket.io')(http);

app.set('view engine', 'ejs' );
app.set('port', (process.env.PORT || 3000));

//首頁
app.get('/', function(req, res){
	//定義需要的資料
	
	//進入首頁
	res.render('pages/index',{
		//傳入首頁的資料
		
	});
	
});

//play頁
app.get('/play', function(req, res){
	//進入play頁
	res.render('pages/play');
});

var server = app.listen(app.get('port'), function(){
	console.log('Start server on port 3000:');
});


