var express = require('express');
var router = express.Router();
var DB = require('../db/DBhelper.js');
var uuidv1  = require('uuid/v1');
var jsonFormat = require('../jsonFormat/jf.js');
var config = require('../config/config.json');
var md5 = require('md5');
var jwt = require('jwt-simple');
var moment = require('moment');
var jwtoath = require('../jwtoath/jwtoath.js')


router.post('/postComment',checkLogin);
//router.post('/userInfo',checkLogin);
/* GET home page. */


router.post('/rgist', function(req, res, next)
{
		if(req.body.user_password && req.body.user_email)
		{
			console.log(req.body);
			var db = new DB.DBhelper('people');
			var userData = req.body;

			db.selectWhere((result)=>{
			if(result.length){  //如果存在该用户
					res.json(jsonFormat(-2,'already exist'));
			}else{
				
			userData.password = md5(userData.password);
			var uid= uuidv1();
			var peopleinfo = {Pid:uid,name:userData.name,email:userData.email,phone:userData.phone,password:userData.password,type:1};
			db.add(peopleinfo,(res1)=>{
				if(res1)
					{
						//console.log('111');
						res.json(jsonFormat(1,result[0]));//注册成功
					}
					else{
					    res.json(jsonFormat(-3,'fail to regist'));  //注册失败
					}
			});
			}
		},'user_email = "'+req.body.user_email+'"');  //根据email来进行注册
		}
		else{
			res.json(jsonFormat(-1,'do not have email or password'));
		}
});


router.post('/login',(req,res)=>{
	if(req.body.email&&req.body.password){
		var db = new DB.DBhelper('user');
		db.selectWhere((result)=>{
			console.log(config)
			if(result.length){
				var expires = moment().add('days', 7).valueOf();
				var token = jwt.encode({
  					iss: result[0].uid,
  					exp: expires
				},config.jwtSecret);

				res.json(jsonFormat(1,{
  					token : token,
  					expires: expires,
  					user: result[0].email
				}));

				// var db_usertoken = new DB.DBhelper('user_token');
				// db_usertoken.selectWhere((rs)=>{
				// 	if(rs.length){
				// 		rs[0]['userinfo']=result[0];
				// 		res.json(jsonFormat(2,rs[0]))
				// 	}else{
				// 		var newTokenData = {
				// 			uid:result[0].uid,
				// 			token:uuidv1()
				// 			}
				// 		db_usertoken.add(newTokenData,(rs)=>{
				// 			if(rs){
				// 				newTokenData['userinfo']=result[0];
				// 				res.json(jsonFormat(1,newTokenData));
				// 			}
				// 		})						
				// 		}
				// },'uid = '+result[0].uid);

			}else{
				res.json(jsonFormat(-102,'password or username error '));
			}
		},'email = "'+req.body.email+'" and password = "'+md5(req.body.password)+'"');

	}else{
		console.log(req.body);
		res.json(jsonFormat(-100,'no data catched or params are illegal '));
	}
});

router.post('/logout',(req,res)=>{
	if(req.body.uid){
		var db_usertoken = new DB.DBhelper('user_token');
		db_usertoken.selectWhere((rs)=>{
			if(rs.length){
				db_usertoken.delete('uid = '+rs[0].uid,(rs)=>{
					if(rs){
						res.json(jsonFormat(1,{token_delete:true}));
					}else{
						res.json(jsonFormat(-201,'token delete error'));
					}
				});
			}else{
				res.json(jsonFormat(-101,'uid not find, user maybe is already logout '));
			}
		},'uid ='+req.body.uid)
	}else{
		res.json(jsonFormat(-100,'no data catched or datas is illegal '));
	}

});

router.post('/userInfo',jwtoath,(req,res)=>{
	res.json(jsonFormat(1,req.user))
	// if(req.query.uid){
	// 	var db_user_info = new DB.DBhelper('user');
	// 	db_user_info.selectWhere((result)=>{
	// 		if(result.length)
	// 			res.json(jsonFormat(1,result))
	// 		else
	// 			res.json(jsonFormat(-101,'user not find'))
	// 	},'uid = ' + req.query.uid,'nickname,email,tumb_src,sex,sign');
	// }else{
	// 	res.json(jsonFormat(-100,'no data catched or params are illegal '));
	// }
});

router.get('/userComment',(req,res)=>{
	if(req.query.uid){
		var db_user_comment = new DB.DBhelper('movie_comment');
		db_user_comment.selectWhere((result)=>{
			if(result.length)
				res.json(jsonFormat(1,result))
			else
				res.json(jsonFormat(-101,'comment not find'))
		},'uid = ' + req.query.uid);
	}else{
		res.json(jsonFormat(-100,'no data catched or params are illegal '));
	}
});

router.post('/postComment',(req,res)=>{
	console.log(req.body)
	if(req.body.vid&&req.body.comment){
		var db_user_comment = new DB.DBhelper('movie_comment');
		var commentData=[];
		commentData.uid = req.body.uid;
		commentData.vid = req.body.vid;
		commentData.comment = req.body.comment;
		commentData.time = Date();
		db_user_comment.add(commentData,(result)=>{
			if(result){
				res.json(jsonFormat(1,{save:true}));
			}else{
				res.json(jsonFormat(-202,'database save error'))
			}
		}) 
	}else{
		res.json(jsonFormat(-100,'no data catched or params are illegal '));
	}
});


module.exports = router;