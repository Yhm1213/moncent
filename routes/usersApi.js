var express = require('express');
var router = express.Router();
var DB = require('../db/DBhelper.js');
var uuidv1 = require('uuid/v1');
var jsonFormat = require('../jsonFormat/jf.js');
var config = require('../config/config.json');
var md5 = require('md5');
var jwt = require('jwt-simple');
var moment = require('moment');
var jwtoath = require('../jwtoath/jwtoath.js');
var nodemailer = require('nodemailer');



router.post('/postComment', jwtoath,(req,res)=>{
 if(req.user && req.body.article_id && req.body.context){

	var db = new DB.DBhelper('guides_comment');

	var commentinfo = {article_id:req.body.article_id ,users$Uid:req.user.Pid,context:req.body.context,date:Date()};

	db.add(commentinfo,(res2)=>{
		if (res2)
		{
			res.json(jsonFormat(1,res2));
		}
		else
		{
			res.json(jsonFormat(-1,'laji'));
		}
	});
	
 }else{
	res.json('shabi');
 }
});



router.get('/getComment',(req,res)=>{
 if(req.query.article_id){

	var db = new DB.DBhelper('guides_comment');

	db.selectWhere(result=>{
		if(result){
			console.log(result);
			res.json(jsonFormat(1,result));
		}
		else
		{
			res.json(jsonFormat(-1,'laji'));
		}
	},'article_id = "'+req.query.article_id+'"')
	
 }else{
	res.json('shabi');
 }
});

//router.post('/userInfo',checkLogin);
/* GET home page. */
router.post('/regist', function (req, res, next) {
	if (req.body.password && req.body.email) {
		console.log(req.body);
		var db = new DB.DBhelper('people');
		var db_user = new DB.DBhelper('users');
		var userData = req.body;

		console.log(12);
		db.selectWhere((result) => {
			if (result.length) {  //如果存在该用户
				res.json(jsonFormat(-2, 'already exist'));
			} else {

				var oath_code = new DB.DBhelper('email_oath');
				oath_code.selectWhere((code)=>{
					if(code.length){
					if(code[0].oath_code==req.body.oath_code){
							db.add(peopleinfo, (res1) => {
					if (res1) {
						//console.log('111');
						db_user.add(userinfo, (res_user) => {
							if (res_user) {
								//console.log('111');
								res.json(jsonFormat(1, result[0]));//注册成功
							}
							else {
								res.json(jsonFormat(-3, 'fail to regist'));  //注册失败
							}
						});
					}
					else {
						res.json(jsonFormat(-3, 'fail to regist'));  //注册失败
					}
				});
						}else{
						res.json(jsonFormat(-301, 'oath_code error'));  //注册失败
						}
					}else{
						res.json(jsonFormat(-3, 'fail to regist'));  //注册失败
					}

				},'email ="'+req.body.email+'"')

				userData.password = md5(userData.password);
				var uid = uuidv1();

				var peopleinfo = { Pid: uid, name: userData.name, email: userData.email, phone: userData.phone, password: userData.password, type: 1 };
				var userinfo = { Uid: uid, sex: userData.sex, introduce: '啥鸡巴都没有', money: 0 }
				// 
			}
		}, 'email = "' + req.body.email + '"');  //根据email来进行注册
	}
	else {
		res.json(jsonFormat(-1, 'do not have email or password'));
	}
});


router.post('/login', (req, res) => {
	if (req.body.email && req.body.password) {
		var db = new DB.DBhelper('people');
		db.selectWhere((result) => {
			console.log(config)
			if (result.length) {
				var expires = moment().add('days', 7).valueOf();
				var token = jwt.encode({
					iss: result[0].Pid,
					exp: expires
				}, config.jwtSecret);

				res.json(jsonFormat(1, {
					token: token,
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

			} else {
				res.json(jsonFormat(-102, 'password or username error '));
			}
		}, 'email = "' + req.body.email + '" and password = "' + md5(req.body.password) + '"');

	} else {
		console.log(req.body);
		res.json(jsonFormat(-100, 'no data catched or params are illegal '));
	}
});

router.post('/logout', (req, res) => {
	if (req.body.uid) {
		var db_usertoken = new DB.DBhelper('user_token');
		db_usertoken.selectWhere((rs) => {
			if (rs.length) {
				db_usertoken.delete('uid = ' + rs[0].uid, (rs) => {
					if (rs) {
						res.json(jsonFormat(1, { token_delete: true }));
					} else {
						res.json(jsonFormat(-201, 'token delete error'));
					}
				});
			} else {
				res.json(jsonFormat(-101, 'uid not find, user maybe is already logout '));
			}
		}, 'uid =' + req.body.uid)
	} else {
		res.json(jsonFormat(-100, 'no data catched or datas is illegal '));
	}

});

router.post('/userInfo', jwtoath, (req, res) => {
	res.json(jsonFormat(1, req.user))
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

router.post('/user_article', jwtoath,(req,res)=>{
	console.log(req.user);
 if(req.user){
	var db = new DB.DBhelper('article');

	db.selectWhere((result) => {
		if(result){
			console.log(result);
			res.json(jsonFormat(1, result)); 
		}
		else{
			res.json(jsonFormat(-3, 'fail to view'));  //注册失败
		}
	},'users$Pid = "'+req.user.Pid+'"');
}
});

router.post('/user_order', jwtoath,(req,res)=>{
	console.log(req.user);
 if(req.user){
	var db = new DB.DBhelper('ticket_order');
	db.connectHelper('select * from ticket,ticket_order where ticket.Tid = ticket_order.ticket$Tid and ticket_order.users$Uid = "'+req.user.Pid+'"',(err,rs,fd)=>{
		if(!err){
			res.json(jsonFormat(1,rs));
		}
	})
}
});

router.post('/user_money', jwtoath,(req,res)=>{
 console.log(req.user);
 if(req.user){
	var db = new DB.DBhelper('users');

	db.selectWhere((result) => {
		if(result){
			console.log(result);
			res.json(jsonFormat(1,result[0])); 
		}
		else{
			res.json(jsonFormat(-3, 'fail to view'));  //注册失败
		}
	},'Uid = "'+req.user.Pid+'"');
}
});


router.post('/post_artical', jwtoath,(req,res)=>{
 console.log(req.user);
 if(req.user){
	var db = new DB.DBhelper('article');

	var aid = uuidv1();
	var date = Date();
	var articalinfo = {article_id:aid,title:req.body.title,date:date,context:req.body.context,status:0,users$pid:req.user.Pid,tumb_src:req.body.tumb_src}

	db.add(articalinfo,(res1)=>{
		if(res1)
		{
			res.json(jsonFormat(1, articalinfo));//注册成功
		}
		else {
						res.json(jsonFormat(-3, 'fail to regist'));  //注册失败
			}
	})
}
});


router.get('/view_article',(req,res)=>{

	var db = new DB.DBhelper('article');
    console.log('11');
	db.selectWhere((result) => {
		if(result){
		console.log(result);
		res.json(jsonFormat(1, result));  			
		}
		else{
			res.json(jsonFormat(-3, 'fail to view'));  
		}
	},'status = 1');
});

router.get('/view_guide',(req,res)=>{

 
	var db = new DB.DBhelper('ticket');
    console.log('11');
	db.selectWhere((result) => {
		if(result){
		console.log(result);
		res.json(jsonFormat(1, result));  			
		}
		else{
			res.json(jsonFormat(-3, 'fail to view'));  //注册失败
		}
	});
});

//rou



router.post('/purche', jwtoath, (req, res) => {

	console.log(req.user);
	if (req.user) {

		var db2 = new DB.DBhelper('users');

		db2.selectWhere(res1 => {
			if (res1) {
				var moneys = res1[0].money - req.body.cost;
				console.log(moneys);
				if (moneys < 0) {
					console.log(12);
					res.json(jsonFormat(-2, '穷b'));  //注册失败
				}
				var moneyinfo = { money: moneys };
				db2.save(moneyinfo, 'Uid = "' + req.user.Pid + '"', rs => {
					if (rs) {
						var db = new DB.DBhelper('ticket_order');

						var ticket_orderinfo = { users$Uid: req.user.Pid,ticket$Tid: req.body.ticket$Tid, cost: req.body.cost, date: Date() };
						console.log('11');
						db.add(ticket_orderinfo, (result) => {
							if (result) {
								console.log(result);
								res.json(jsonFormat(1, result[0]));
							}
							else {
								res.json(jsonFormat(-3, 'fail to view'));  //注册失败
							}
						});
					}
					else {
						res.json(jsonFormat(-3, 'fail to pruche'));  //注册失败
					}
				})
			}
			else {
				res.json(jsonFormat(-3, 'fail to pruche'));  //注册失败
			}
		}, 'Uid = "' + req.user.Pid + '"')

	}
});

router.post('/search', (req, res) => {
	if (req.body.word){
		var db = new DB.DBhelper('article');

		console.log(req.body.word);

		db.connectHelper('select * from moncent.article where title LIKE "%'+ req.body.word +'%" and status = 1', (err, rs, fd) =>{
			if (!err) {
				res.json(jsonFormat(1, rs));
			}
			else{
				res.json(jsonFormat(-3, 'sb 吧你'));  //注册失败
			}
		})
	}
	else{
		res.json(jsonFormat(-3, 'sb 吧你'));  //注册失败
	}
});

router.post('/send_oath',(req,res)=>{
	if(req.body.email){
	var code =parseInt( Math.random()*99999);
	var mailAddress = req.body.email;

var transporter = nodemailer.createTransport({
    //https://github.com/andris9/nodemailer-wellknown#supported-services 支持列表
    service: '163',
    port: 465, // SMTP 端口
    secureConnection: true, // 使用 SSL
    auth: {
        user: 'Moncent@163.com',
        //这里密码不是qq密码，是你设置的smtp密码
        pass: 'sw960602'
    }
});
var mailOptions = {
    from: 'Moncent@163.com', // 发件地址
    to: mailAddress, // 收件列表
    subject: '大山旅游验证码邮件', // 标题
    //text和html两者只支持一种
    //text: 'Donot Reply: Moncent Oath Code', // 标题
    html: '<H1>亲爱的用户欢迎您注册大山旅游。这是您的验证码：</H1><H2>'+code+'</H2>' // html 内容
};


transporter.sendMail(mailOptions, function(error, info){
    if(error){
       console.log(error);
       res.json(jsonFormat(0,"error"));
    }else{
       var email_oath = new DB.DBhelper('email_oath');
       var saveData = [];
       saveData.email=mailAddress;
       saveData.oath_code = code;
       email_oath.add(saveData,(result)=>{
       		if(result){
       			res.json(jsonFormat(1,info))
       		}else{
       			console.log("error");
       			res.json(jsonFormat(0,"error"))
       		}
       });
      
    }

});

	}
})

router.get('/get_ticketinfo',(req,res)=>{
	if(req.query.tid){
		var guide = new DB.DBhelper('ticket');
		guide.selectWhere((result)=>{
			if(result.length){
				res.json(jsonFormat(1,result[0]));
			}else{
				res.json(jsonFormat(0,'error'));
			}
		},'Tid = "'+req.query.tid+'"')
	}
})

router.get('/get_articleinfo',(req,res)=>{
	if(req.query.aid){
		var guide = new DB.DBhelper('article');
		guide.selectWhere((result)=>{
			if(result.length){
				res.json(jsonFormat(1,result[0]));
			}else{
				res.json(jsonFormat(0,'error'));
			}
		},'article_id = "'+req.query.aid+'"')
	}
})

module.exports = router;