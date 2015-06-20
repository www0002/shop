//***************************************************
//*****  MOVE ALL SQL CONSTRUCTION INTO PG !!!!  ****
//***************************************************

var pg = require('pg');
//var conString = "postgres://postgres:777@5.9.111.244:5439/postgres";
//var conString = "postgres://postgres:777@80.80.108.194:5439/postgres";
var conString = "postgres://ubuntu:777@54.172.55.47:5432/postgres";

var sqlWhere = function(param) {
	if (!param || Object.keys(param).length == 0) return '';
	
}

exports.findOne = function(tableName, filterObj, cb) {

		pg.connect(conString, function(err, client, done) {
			
			if (err) return cb(err, []);
			
			var sqlStr = 'SELECT * FROM ' + tableName + ' WHERE ', i = 0, parArr = [];
			for (k in filterObj) {i++; sqlStr += k + ' = $' + i; parArr.push(filterObj[k]); };
			
			client.query(sqlStr, parArr, function(err, result) {
				done();
				if (err) return cb(err, []);
				if (result.rows.length == 0) return cb('not found', []);
				if (result.rows.length > 0) cb(null, [result.rows[0]]);
			});
		});
	
}

exports.createSertificate = function(file) {
	var sqlText = 'INSERT INTO "frame" ("file_name") values ("' + file.name + '");';
}

function dbCreate(req) {
	
}


exports.apiCreate = function(req, apiSucc, apiErr) {
	
	// TODO: prevent sql injection; create only allowed fields
	
	var sqlText = '';

	// at first special cases => stored sql procedures
	
	//req.params.collection || (req.params.collection = 'account');
	
	if (req.params.collection == 'orders') {
		
		req.body.a_kind = req.params.collection;
		sqlText = "select document_create('" + JSON.stringify(req.body) + "');";
		
	} else {
	
		sqlText = 'INSERT INTO "' + req.params.collection + '"';
		
		var sqlParam = [];
		var arrFields = [], arrValues = [];
		
		for (k in req.body) {
			sqlParam.push(req.body[k]);
			arrFields.push('"' + k + '"');
			arrValues.push('$' + sqlParam.length);
		};
		
		sqlText += ' (' + arrFields.join() + ') VALUES (' + arrValues.join() + ') RETURNING *';
		
	};
	
	//console.log(sqlText);
	pg.connect(conString, function(err, client, done) {
		//client.query(sqlText, function(err, sqlResult) {
		client.query(sqlText, sqlParam, function(err, result) {
			if (err) { 
				apiErr({err: err});
			} else {
				apiSucc(result.rows[0]);
			};
			//console.log('donn');
			done();
		});
	});
}
 
 
 
exports.apiRead = function(req, res) {
	
	// TODO: prevent sql injection
	
	// ***** SELECT *****
	var sqlText = 'SELECT * FROM "' + req.params.collection + '"';
	var sqlOrderBy = '';
	var sqlWhere = [];
	var sqlParam = [];
	
	// ***** WHERE *****
	var sqlParam = [];
	if (req.params.id) {
		sqlParam.push(req.params.id);
		sqlWhere.push(' id = $' + sqlParam.length);
	};
	
	sqlOrderBy = ' ORDER BY name';
	
	for (k in req.query) {
		if (k == 'latest') {
			sqlParam.push(req.query.latest);
			sqlOrderBy = ' ORDER BY id DESC LIMIT $' + sqlParam.length;
		} else if (k == 'stock') {
			sqlWhere.push(' amt ' + (req.query[k] == 'true' ? ' > ' : ' <= ') + '0');
		} else {
			sqlParam.push( req.query[k] );
			sqlWhere.push(' ' + k + ' = $' + sqlParam.length);
		}
	};
	
	if (req.params.collection == 'product') {
		sqlWhere.push(' hidden is not true and price > 0');
	};

	sqlWhere.length && (sqlText += ' WHERE ' + sqlWhere.join(' AND '));
	sqlText += sqlOrderBy;
	
	console.log(sqlText);
	//console.log(sqlParam);
	
	// ***** query pg *****
	pg.connect(conString, function(err, client, done) {
		client.query(sqlText, sqlParam, function(err, result) {
			if (err) { 
				res.status(404).json({err: err});
			} else {
				var sqlResult = (req.params.id) ? result.rows[0] : result.rows;
				res.json(sqlResult);
			};
			//console.log('donn');
			done();
		});
	});
	
}


exports.apiUpdate = function(req, apiSucc, apiErr) {
	
	var sqlText = '';

	sqlText = 'UPDATE "' + req.params.collection + '" SET';
	
		var sqlParam = [];
		var arrFields = [], arrValues = [];
		
		for (k in req.body) {
			sqlParam.push(req.body[k]);
			arrFields.push('"' + k + '"');
			arrValues.push('$' + sqlParam.length);
		};
		
	sqlText += ' (' + arrFields.join() + ') = (' + arrValues.join() + ') WHERE id = ' + req.params.id + ' RETURNING *';
		
		
	console.log(sqlText);
	
	pg.connect(conString, function(err, client, done) {
		
		client.query(sqlText, sqlParam, function(err, result) {
			if (err) { console.log(err); apiErr({err: err}) } else { apiSucc(result.rows[0]) };
			done();
		});
	});
}
 