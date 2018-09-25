var express = require('express');
var mysql = require('mysql');
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var UUID = require('uuid');

var router = express.Router();

var pool = mysql.createPool({
  host: '115.29.106.55',
  user: 'moncent',
  port: '3306',
  password: '12345678',
  database: 'moncent'
});


router.get('/admin-index', checklogin);

router.get('/admin-tableUsers', checklogin);

router.get('/admin-tableMovie', checklogin);

router.get('/admin-tableMovieAdmin', checklogin);

router.get('/admin-tableAdv', checklogin);

function checklogin(req, res, next) {

  if (req.session.islogin) {
    next();
  } else {
    res.redirect("/admin-login");
  }
}






router.get('/', function (req, res, next) {
  res.render('./admin/index', { title: 'Exp' });
});

router.get('/error', function (req, res, next) {
  res.render('./error', { message: '错误' });
});

router.get('/selecterror', function (req, res, next) {
  res.render('./select/selecterror', { message: '查询错误' });
});

router.get('/loginerror', function (req, res, next) {
  res.render('./admin/loginerror', { message: '登录错误' });
});

router.get('/MovieInserterror', function (req, res, next) {
  res.render('./insert/MovieInserterror', { message: '选择错误，请选择一个电影与图片' });
});

router.get('/AdvInserterror', function (req, res, next) {
  res.render('./insert/AdvInserterror', { message: '选择错误,请选择一个广告' });
});

router.get('/admin-login', function (req, res, next) {
  res.render('./admin/admin-login');
});





router.get('/admin-index', (req, res, next) => {
  var sql = "SELECT count(*) FROM users;";

  pool.query(sql, function (error, results1, fields) {
    if (error) throw error;
    //  console.log(results1[0]);

    var sql = "SELECT count(*) FROM article;";

    pool.query(sql, function (error, results2, fields) {
      if (error) throw error;
      //  console.log(results2[0]);

      var sql = "SELECT count(*) FROM guides;";

      pool.query(sql, function (error, results3, fields) {
        if (error) throw error;
        // console.log(results3[0]);

        var sql = "SELECT count(*) FROM ticket;";

        pool.query(sql, function (error, results4, fields) {
          if (error) throw error;
          // console.log(results3[0]);
          res.render("./admin/admin-index", { data1: results1, data2: results2, data3: results3, data4: results4 });

        });


      });

    });

  });


});

router.get('/admin-tableUsers', (req, res, next) => {
  var sql = "select * from people where type = '0'";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    //   console.log(results[0].email);

    res.render("./admin/admin-tableUsers", { data: results });

  });


});

router.get('/admin-tableMovie', (req, res, next) => {
  var sql = "select * from article";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    // console.log(results[0].email);
    res.render("./admin/admin-tableMovie", { data: results });

  });

});

router.get('/admin-tableAdv', (req, res, next) => {

  var sql = "select * from guides";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    // console.log(results[0].email);
    res.render("./admin/admin-tableAdv", { data: results });

  });

});

router.get('/admin-tableMovieAdmin', (req, res, next) => {
  var sql = "select * from ticket";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    // console.log(results[0].email);
    res.render("./admin/admin-tableMovieAdmin", { data: results });

  });

});




router.post('/admin-login', (req, res, next) => {

  //登入
  var sql = "select * from people where email='" + req.body.email + "' and type = '1'";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    // console.log(req.body.password);
    // console.log(results[0].密码);
    if (results.length && results[0].email == req.body.email && results[0].password == req.body.password) {
      req.session.islogin = true;
      res.redirect("/admin-index");
    } else {
      res.redirect("/loginerror");
    }



  });

});
router.get('/admin-out', (req, res, next) => {
  //登出
  req.session.islogin = false;
  res.redirect("/admin-login");
});





router.get('/useredit', (req, res, next) => {
  console.log(req.query.id);
  res.render("./edit/useredit", { data: req.query.id });
});

router.get('/userupdate', (req, res, next) => {
  console.log(req.query.id);
  var sql = "UPDATE people SET " + req.query.clom + " = '" + req.query.change + "' WHERE Pid = '" + req.query.id + "';";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    res.redirect("/admin-tableUsers");
  });
});

router.get('/userdelet', (req, res, next) => {
  //删除
  //console.log(req.query.id)
  var sql = "DELETE FROM people WHERE Pid ='" + req.query.id + "';";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    // console.log(results[0].email);
    res.redirect("/admin-tableUsers");
  });

});

router.get('/Userinsert', (req, res, next) => {
  //删除
  // console.log(req.query.id)
  var user_id = UUID.v1();
  var sql = "insert into user (user_id, user_name, user_age, user_password, user_email) values ('" + user_id + "','" + req.query.user_name + "','" + req.query.user_age + "','" + req.query.user_password + "','" + req.query.user_email + "')";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.redirect("/admin-tableUsers");
  });

});

router.get('/Userselect', (req, res, next) => {

  var sql = "select * from people where " + req.query.selecttext + " = '" + req.query.inputtext + "';";


  console.log(req.query.selecttext);
  console.log(req.query.inputtext);

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    if (results.length) {
      res.render("./select/Userselect", { data: results });
    } else {
      res.redirect("/selecterror");
    }

  });



});





router.get('/MovieAdminedit', (req, res, next) => {
  // console.log(req.query.id);
  res.render("./edit/MovieAdminedit", { data: req.query.id });
});
router.get('/MovieAdminupdate', (req, res, next) => {
  console.log(req.query.id);
  console.log(req.query.clom);
  console.log(req.query.change);

  var sql = "UPDATE ticket SET " + req.query.clom + " = '" + req.query.change + "' WHERE Tid = '" + req.query.id + "';";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    // console.log(results[0].email);
    res.redirect("/admin-tableMovieAdmin");
  });
});

router.get('/MovieAdmindelet', (req, res, next) => {
  //删除
  //console.log(req.query.id)
  var sql = "DELETE FROM ticket WHERE Tid ='" + req.query.id + "';";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    // console.log(results[0].email);
    res.redirect("/admin-tableMovieAdmin");
  });

});

router.get('/MovieAdmininsert', (req, res, next) => {
  //插入
  var Tid = UUID.v1();
  console.log(req.query.user_id);
  console.log(req.query.user_password);
  var sql = "insert into ticket (Tid,ticket_cost,off,name,title,context,route,plan) values ('" + Tid + "','" + req.query.ticket_cost + "','" + req.query.off + "','" + req.query.name + "','" + req.query.title + "','" + req.query.context +"','" + req.query.route +"','" + req.query.plan +"')";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.redirect("/admin-tableMovieAdmin");
  });

});

router.get('/MovieAdminselect', (req, res, next) => {

  var sql = "select * from ticket where " + req.query.selecttext + " = '" + req.query.inputtext + "';";


  console.log(req.query.selecttext);
  console.log(req.query.inputtext);

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    if (results.length) {
      res.render("./select/MovieAdminselect", { data: results });
    } else {
      res.redirect("/selecterror");
    }

  });



});








router.post('/Movieinsert', function (req, res, next) {

  //生成multiparty对象，并配置上传目标路径
  var form = new multiparty.Form({ uploadDir: './public/' });
  //上传完成后处理
  form.parse(req, function (err, fields, files) {

    console.log(fields.movie_id[0]);
    if (files.inputFile.length != 2) {
      res.redirect("/MovieInserterror");
    } else {
      var filesTmp = JSON.stringify(files, null, 2);

      if (err) {
        console.log('parse error: ' + err);
      } else {
        console.log('parse files: ' + filesTmp);
        var inputFile = files.inputFile[0];
        var uploadedPathMovie = inputFile.path;
        var dstPathMovie = './public/' + inputFile.originalFilename;
        //重命名为真实文件名
        fs.rename(uploadedPathMovie, dstPathMovie, function (err) {
          if (err) {
            console.log('rename error: ' + err);
          } else {
            console.log(dstPathMovie);
          }
        });
        var inputFile = files.inputFile[1];
        var uploadedPathPicture = inputFile.path;
        var dstPathPicture = './public/' + inputFile.originalFilename;
        //重命名为真实文件名
        fs.rename(uploadedPathPicture, dstPathPicture, function (err) {
          if (err) {
            console.log('rename error: ' + err);
          } else {
            console.log(dstPathPicture);
          }
        });

        var movie_id = UUID.v1();

        var sql = "insert into movie (movie_id, movie_name, movie_len, movie_type, movie_address, movie_des, movie_picture) values ('"
          + movie_id + "','"
          + fields.movie_name[0] + "','"
          + fields.movie_len[0] + "','"
          + fields.movie_type[0] + "','"
          + dstPathMovie + "','"
          + fields.movie_des[0] + "','"
          + dstPathPicture + "')";

        pool.query(sql, function (error, results, fields) {
          if (error) throw error;
          res.redirect("/admin-tableMovie");
        });
      }

    }

  });
});

router.get('/Moviedelet', (req, res, next) => {
  //删除
  //console.log(req.query.id)
  var sql = "DELETE FROM article WHERE article_id='" + req.query.id + "';";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    // console.log(results[0].email);
    res.redirect("/admin-tableMovie");
  });

});

router.get('/Movieselect', (req, res, next) => {

  var sql = "select * from article where " + req.query.selecttext + " = '" + req.query.inputtext + "';";


  console.log(req.query.selecttext);
  console.log(req.query.inputtext);

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    if (results.length) {
      res.render("./select/Movieselect", { data: results });
    } else {
      res.redirect("/selecterror");
    }

  });



});

router.get('/Movieupdate', (req, res, next) => {
  console.log(req.query.id);
  console.log(req.query.clom);
  console.log(req.query.change);

  var sql = "UPDATE article SET " + req.query.clom + " = '" + req.query.change + "' WHERE article_id = '" + req.query.id + "';";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    // console.log(results[0].email);
    res.redirect("/admin-tableMovie");
  });
});
router.get('/Movieedit', (req, res, next) => {
  // console.log(req.query.id);
  res.render("./edit/Movieedit", { data: req.query.id });
});





router.post('/Advinsert', function (req, res, next) {

  //生成multiparty对象，并配置上传目标路径
  var form = new multiparty.Form({ uploadDir: './public/' });
  //上传完成后处理
  form.parse(req, function (err, fields, files) {

    if (files.inputFile.length != 1) {
      res.redirect("/AdvInserterror");
    } else {
      var filesTmp = JSON.stringify(files, null, 2);

      if (err) {
        console.log('parse error: ' + err);
      } else {
        console.log('parse files: ' + filesTmp);
        var inputFile = files.inputFile[0];
        var uploadedPathAdv = inputFile.path;
        var dstPathAdv = './public/' + inputFile.originalFilename;
        //重命名为真实文件名
        fs.rename(uploadedPathAdv, dstPathAdv, function (err) {
          if (err) {
            console.log('rename error: ' + err);
          } else {
            console.log(dstPathAdv);
          }
        });


        var adv_id = UUID.v1();
        var sql = "insert into adv (adv_id, adv_address, adv_name) values ('"
          + adv_id + "','"
          + dstPathAdv + "','"
          + fields.adv_name[0] + "')";

        pool.query(sql, function (error, results, fields) {
          if (error) throw error;
          res.redirect("/admin-tableAdv");
        });
      }

    }

  });
});

router.get('/Advdelet', (req, res, next) => {
  //删除
  //console.log(req.query.id)
  var sql = "DELETE FROM guides WHERE Gid='" + req.query.id + "';";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    // console.log(results[0].email);
    res.redirect("/admin-tableAdv");
  });

});

router.get('/Advselect', (req, res, next) => {

  var sql = "select * from guides where " + req.query.selecttext + " = '" + req.query.inputtext + "';";


  console.log(req.query.selecttext);
  console.log(req.query.inputtext);

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    if (results.length) {
      res.render("./select/Advselect", { data: results });
    } else {
      res.redirect("/selecterror");
    }

  });



});

router.get('/Advupdate', (req, res, next) => {

  var sql = "UPDATE guides SET " + req.query.clom + " = '" + req.query.change + "' WHERE Gid = '" + req.query.id + "';";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    // console.log(results[0].email);
    res.redirect("/admin-tableAdv");
  });
});

router.get('/Advedit', (req, res, next) => {
  // console.log(req.query.id);
  res.render("./edit/Advedit", { data: req.query.id });
});



module.exports = router;



