var express  = require('express');
var app = express();
var io = require('socket.io')(http);

app.set('view engine', 'ejs' );
app.set('port', (process.env.PORT || 3000));

//����
app.get('/', function(req, res){
	//�w�q�ݭn�����
	
	//�i�J����
	res.render('pages/index',{
		//�ǤJ���������
		
	});
	
});

//play��
app.get('/play', function(req, res){
	//�i�Jplay��
	res.render('pages/play');
});

var server = app.listen(app.get('port'), function(){
	console.log('Start server on port 3000:');
});


