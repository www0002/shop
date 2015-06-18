var nodemailer = require('nodemailer');

var mailOptions = {

	smtp_service : 'Yandex', //'Mail.ru',
	from : 'mail.vaun@yandex.ru', //'vaun@bk.ru',
	smtp_pass : 'HjcnjdLjy99', //'HjcnjdLjy77',
	to : 'victor.dugin@yandex.ru, victor.dugin@gmail.com',
	
	subject : 'subject',
	text : 'text' // plaintext body

}

// WORKING GODE!
//Send directly (without smtp server)
//var transporter = nodemailer.createTransport();
//Send via smtp server


var transporter = nodemailer.createTransport({
		service : mailOptions.smtp_service,
		auth : {
			user : mailOptions.from,
			pass : mailOptions.smtp_pass
		}
	});

exports.send = function(messageOptions, cb) {

	Object.keys(messageOptions).forEach( function(e) {mailOptions[e] = messageOptions[e]} );

	transporter.sendMail(mailOptions, function (error, info) {
		if (cb) cb(error, info);
	});
	
}