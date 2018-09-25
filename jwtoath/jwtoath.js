var jwt = require('jwt-simple');
var DBhelper = require('../db/DBhelper.js')
var config = require('../config/config.json')


module.exports = function(req, res, next) {
  // code goes here

var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
console.log(token)
if (token) {
  try {
    var decoded = jwt.decode(token, config.jwtSecret);
    if (decoded.exp <= Date.now()) {
  		res.end('Access token has expired', 400);
	}else{
		var user = new DBhelper.DBhelper('people');
		user.selectWhere((result)=>{
			if(result.length){
				req.user = result[0];
				next();
			}
		},'Pid = "'+decoded.iss+'"')
	}



  } catch (err) {
  	console.log(err)
    return next();
  }
} else {
  next();
}


};