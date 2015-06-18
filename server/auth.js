var uuid = require('node-uuid');
var crypto = require("crypto");
var urm42 = require("./urm.js");

var cookieTokenExpire = 240*60*60*1000; // 240 hours

exports.generateHash = function(password, salt, algorithm) {
	var defaultSaltLen = 8;
	salt || (salt = crypto.randomBytes(Math.ceil(defaultSaltLen / 2)).toString('hex').substring(0, defaultSaltLen));
	algorithm || (algorithm = 'sha1');
	return algorithm + '$' + salt + '$' + crypto.createHmac(algorithm, salt).update(password).digest('hex');
}


exports.authRequest = function(req, res, next) {
	
	if (req.dbUser) return next();
	
	req.dbUser = Object.create(null);
	
	var token = req.cookies.token;
	if (token) {
		urm42.findOne( 'account', {token:token}, function (err, persons) { req.dbUser = persons[0]; } )
	};

	//console.log('authRequest>>', req.dbUser);

	next();
	
}


exports.userLogin = function (req, res) {
	
	var handleLoginErr = function() {
		return res.status(404).json({ err : 'wrong email or password' });
	};
	
	var cred = req.body;
	if (!cred.email || !cred.password) return handleLoginErr();

	urm42.findOne('account', { email : cred.email }, function (err, result){
		var he = result[0];
		//console.log('he>> ', he);
		if (!he) return handleLoginErr();
		hashedPassword = he.password;
		var parts = hashedPassword.split('$');
		if (parts.length < 3 || exports.generateHash(cred.password, parts[1], parts[0]) != hashedPassword) return handleLoginErr();
		res.cookie('token', he.token, { maxAge : cookieTokenExpire }).json(light(he));	
	});

}

exports.userRegister = function (req, res) {
	
	var cred = req.body;
	
	if (!cred.email || !cred.password) return res.status(400).json({ err : 'email or password not given' });
	
	cred.name || (cred.name = cred.email);
	
	urm42.findOne('account', { email : cred.email }, function (err, result){
		if (result.length > 0) return res.status(409).json({ err : 'email exists' });
		
		cred.password = exports.generateHash(cred.password);
		cred.token = uuid.v4().toString();
		
		req.params.collection = 'account';
		req.params.password = cred.password;
		req.params.token = cred.token;
		
		urm42.apiCreate(req,
			function(rsl) { 
				delete rsl.password;
				delete rsl.id;
				delete rsl.token;
				res.cookie('token', cred.token, { maxAge : cookieTokenExpire }).json(rsl);
			},
			function(rsl) {res.status(404).json(rsl)}
		);
		
	});
};

exports.userUpdate = function (req, res) {
	
	var cred = req.body;
	
	cred.token = req.cookies.token;
	if (!cred.token) return res.status(400).json({ err : 'token not given' });
	
	// if empty field do not change
	
	urm42.findOne('account', { token : cred.token }, function (err, result){
		
		if (result.length == 0) return res.status(404).json({ err : 'token not found' });
		
		req.params.collection = 'account';
		req.params.id = result[0].id;
		
		if (cred.password) cred.password = exports.generateHash(cred.password);
		
		urm42.apiUpdate(req,
			function(rsl) { 
				delete rsl.password;
				delete rsl.id;
				delete rsl.token;
				//res.cookie('token', cred.token, { maxAge : cookieTokenExpire }).json(rsl);
				res.json(rsl);
			},
			function(rsl) {
				//console.log('eeerrrr', rsl);
				res.status(407).json(rsl)
				}
			);

	});
};

function light(user) {
	return {
		name: user.name,
		email: user.email,
		phone: user.phone,
		address: user.address
	};
}