var express = require('express');
var app = express();

//app.use(function(req, res, next) {console.log(req); next(); } );

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var multer = require('multer');
//app.use(multer({dest:'./uploads/'}));

var methodOverride = require('method-override');
app.use(methodOverride('X-HTTP-Method-Override'));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

//var uuid = require('node-uuid');

var mail = require('./server/mail.js');


// Requires multiparty 
/* 
var multiparty = require('connect-multiparty');
multipartyMiddleware = multiparty();
 */
//var cors = require('cors');

//var uploader = require('./server/upload.js');



var pg = require('pg');
var conString = "postgres://postgres:777@localhost/postgres";
var urm42 = require('./server/urm.js');

var auth = require('./server/auth.js'); // after urm42!


app.post('/message', function (req, res) {
	mail.send({subject: req.body.subj, text: req.body.text}, function(rsl) { res.json(rsl) }, function(rsl) { res.status(404).json(rsl)});
});


app.post('/userLogin', auth.userLogin);
app.post('/userRegister', auth.userRegister);
app.post('/userUpdate',  auth.userUpdate);


// create
//app.post('/api/:collection', urm42.apiCreate);
app.post('/api/:collection', function(req, res) {
		urm42.apiCreate(req,
			function(rsl) { res.json(rsl) },
			function(rsl) { res.status(404).json(rsl)}
		);
	}
);


// read
app.get('/api/:collection', urm42.apiRead);
app.get('/api/:collection/:id', urm42.apiRead);
// update
// delete

app.post('/upload'
	,multer({
		dest:'./data/products/', 
		onError: function (error, next) {
		  console.log(error);
		  next(error);
		},
		rename: function (fieldname, filename, req, res) {
			//console.log('=>', filename)
			return filename
		},
		onFileUploadComplete: function (file, req, res) { 
			//console.log('>>>', file.name,' is complete')
		}})
	,function(req, res) { res.send("Your file was uploaded to " + ( req.files.file ? req.files.file.path : '???') ) }
);
 
 
 
 
// Example endpoint 

//app.use(cors());
/* 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
  */
//app.post('/upload', multipartyMiddleware);


app.use(express.static(__dirname));
app.get("/", function (req, res) {
	res.redirect("/index.html");
});

//app.listen(3000);
app.listen(80);