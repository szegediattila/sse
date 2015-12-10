var _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var serve = require('serve-static');
var app = express();
var clients = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(serve('./public'));

function sendMessages(message, type){
	// lerakjuk a datumot
	var date = +new Date();

	// vegig megyunk az osszes memoriaban eltarolt kliensen
	_.each(clients, function(client){
		var data = 'id: ' + date + '\n';

		// connection eventet kuldunk ha csatlakoztak
		if(type === 'connected') {
			data += 'event: connection\n';
		}
		// disconnection eventet kuldunk ha lecsatlakoztak
		else if(type === 'disconnected'){
			data += 'event: disconnection\n';
		}

		// hozzaadjuk az uzenetet
		data += 'data: ' + message + '\n\n';

		// elkuldjuk a data-t
		client.write(data);
	});
}

// stream vegponton figyelunk a csatlakozasokra
app.get('/stream', function(req, res, next){

	// beallitjuk a header ertekeket
	res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		"Connection": "keep-alive"
	});

	// a mar csatlakozott klienseknek kikuldunk egy infot
	sendMessages('client connected from ' + req.ip, 'connected');

	// elrakjuk memoriaba az uj klienst
	clients.push(res);

	// ha lezarul a kapcsolat (megszakad), kikuldunk egy warningot a klienseknek
	req.on("close", function() {
    	sendMessages('client disconnected from' + req.ip, 'disconnected')
  	});
});

// chat vegponton varjuk az uzeneteket
app.post('/chat', function(req, res, next){

	// elkuldjuk a kliens ip-jet es a messaget
	sendMessages(req.ip + '   ' + req.body.message);
	
	// 200 OK-val visszaterunk
	res.status(200).end();
});

// 3000-es porton inditjuk a szervert
app.listen(3000);
console.log('app is listening on port 3000');