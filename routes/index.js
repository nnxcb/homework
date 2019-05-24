var express = require('express');
var multer  = require('multer');
const fs = require("fs");
var mysql = require('mysql'); 
var bodyParser=require("body-parser")
var router = express.Router();
var upload = multer({dest:'./public/images/user'}).any()
var resultData
var loginResult
var connection = mysql.createConnection({      //创建mysql实例
  host:'120.77.221.88',
  port:'3456',
  user:'root',
  password:'123456',
  database:'zpf'
});
connection.connect();
router.use(bodyParser.urlencoded({ extended: false }))
var queryData = () => {
  debugger
  var sql = 'SELECT * FROM websites';
  connection.query(sql, function (err,result) {
    debugger
      if(err){
      }
      resultData = result
  
  });
}

var addData = (req) => {
  debugger
  let name = req.body.name
  let url = req.body.url
  let alexa = req.body.alexa
  let country = req.body.country
  let addSql = 'INSERT INTO websites(Id,name,url,alexa,country) VALUES(0,?,?,?,?)'
  let addSqlParams = [name, url, alexa, country]
  // 增
  connection.query(addSql, addSqlParams, function (err, result) {
    if (err) {
      return err.message
    } else {
      return 200
    }
  })
}

/* GET home page. */
router.post('/process_get', function(req, res, next) {
  debugger
  queryData()
  // connection.end();
  res.send(resultData);
});

router.post('/process_add', function(req, res, next) {
  let returnData =  addData(req)
  res.send(returnData)
});

router.options('/user/image/upload', function(req, res, next) {
  console.log(req.files[0]);  // 上传的文件信息

  var des_file = __dirname + "/" + req.files[0].originalname;
  fs.readFile( req.files[0].path, function (err, data) {
      fs.writeFile(des_file, data, function (err) {
        if( err ){
            console.log( err );
        }else{
              response = {
                  message:'File uploaded successfully', 
                  filename:req.files[0].originalname
            };
        }
        console.log( response );
        res.end( JSON.stringify( response ) );
      });
  });
});

router.post('/login', function(req, res, next) {
  // loginData(req)

  let sql = "select * from t_system_user where userName=?";
  connection.query(sql, req.body.userName, function (err,result) {
    if (result.length === 1) {
      if (result[0].password === req.body.password) {
        loginResult = {
          code: 100,
          token: result[0].username
        }
      } else {
        loginResult = {
          code: 302
        }
      }
    } else {
      loginResult = {
        code: 500
      }
    }
    res.send(loginResult);
  });
  
});

router.post('/get_info', function(req, res, next) {
  let getInfoResult = {}
  getInfoResult.name = req.body.token
  getInfoResult.token = req.body.token
  getInfoResult.avatar = 'http://localhost:8084/images/user/' + getInfoResult.name
  getInfoResult.access = ['zpf']
  res.send(getInfoResult);
});

router.post('/userinfo/query', function(req, res, next) {
  let sql = "select * from t_system_user where userName=?";
  connection.query(sql, req.body.userName, function (err,result) {
    let createTime = new Date(result[0].create_time).getTime() + 28800000;
    result[0].create_time = new Date(createTime)
    res.send(result[0]);
  });
});

router.post('/userinfo/update', function(req, res, next) { 
  let updatePassword = req.body
  let userName = updatePassword.userName
  let user = [userName, updatePassword.oldPassword]
  let passwordSql = 'select * from t_system_user where username = ? && password = ?'
  connection.query(passwordSql, user, function (err,result) {
    if (result.length === 1) {
      let updateContent = 'Update t_system_user Set '
      if (updatePassword.newPassword) {
        updateContent = updateContent + 'password = ' + "'"  + updatePassword.newPassword + "'" + ','
      }
      // updateContent = updateContent + 'update_time = ' + new Date()
      updateContent = updateContent.slice(0, updateContent.length - 1)
      updateContent = updateContent + ' Where username = ' + "'" + updatePassword.userName + "'"
      connection.query(updateContent, function (err,result) {
        if (err === null) {
          res.send('201');
        }
      });
    } else if (result.length === 0) {
      res.send('501')
    }
  });
});

router.post('/user/query', function(req, res, next) {
  let b = req.body.pageSize
  let a = (req.body.page - 1) * b
  let addSqlParams = [a, b]
  let sql = "select * from t_system_user limit ?,?";
  connection.query(sql, addSqlParams, function (err,result) {
    for (let i = 0; i < result.length; i++) {
      result[i].create_time = new Date(result[i].create_time).getTime() + 28800000;
      if (result[i].update_time) {
        result[i].update_time = new Date(result[i].update_time).getTime();
      }
    }
    res.send(result);
  });
});

router.post('/user/update', function(req, res, next) { 
  let roleInfo = req.body.roleInfo
  let updateContent = 'Update t_system_user Set '
  if (roleInfo.shop_name) {
    updateContent = updateContent + 'shop_name = ' + "'"  + roleInfo.shop_name + "'" + ','
  }
  if (roleInfo.user_status) {
    updateContent = updateContent + 'user_status = ' + roleInfo.user_status + ','
  }
  // updateContent = updateContent + 'update_time = ' + new Date()
  updateContent = updateContent.slice(0, updateContent.length - 1)
  updateContent = updateContent + ' Where id = ' + roleInfo.id
  connection.query(updateContent, function (err,result) {
    if (err === null) {
      res.send(result);
    }
  });
});

router.post('/user/delete', function(req, res, next) {
  let sql = "delete from t_system_user where id = ?";
  connection.query(sql, req.body.id, function (err,result) {
    for (let i = 0; i < result.length; i++) {
      result[i].create_time = new Date(result[i].create_time).getTime() + 28800000;
      result[i].update_time = new Date(result[i].update_time).getTime();
    }
    res.send(result);
  });
});

router.post('/product/query', function(req, res, next) {
  let b = req.body.pageSize
  let a = (req.body.page - 1) * b
  let username = req.body.username
  let addSqlParams = [username, a, b]
  let sql = "select * from t_shop_product WHERE user_id = (SELECT id from t_system_user where username = ?) limit ?,?";
  connection.query(sql, addSqlParams, function (err,result) {
    if (err !== null) {
      res.send(err)
      return
    }
    for (let i = 0; i < result.length; i++) {
      result[i].create_time = new Date(result[i].create_time).getTime() + 28800000;
      result[i].update_time = new Date(result[i].update_time).getTime() + 28800000;
    }
    res.send(result);
  });
});

router.post('/product/update', function(req, res, next) {
  let roleInfo = req.body.roleInfo
  let updateContent = 'Update t_shop_product Set '
  if (roleInfo.p_name) {
    updateContent = updateContent + 'p_name = ' + "'"  + roleInfo.p_name + "'" + ','
  }
  if (roleInfo.p_price) {
    updateContent = updateContent + 'p_price = ' + "'" + roleInfo.p_price + "'" + ','
  }
  if (roleInfo.p_count) {
    updateContent = updateContent + 'p_count = ' + "'" + roleInfo.p_count + "'" + ','
  }
  if (roleInfo.p_states) {
    updateContent = updateContent + 'p_states = ' + "'" + roleInfo.p_states + "'" + ','
  }
  updateContent = updateContent.slice(0, updateContent.length - 1)
  updateContent = updateContent + ' Where id = ' + roleInfo.id
  connection.query(updateContent, function (err,result) {
    if (err === null) {
      res.send(result);
    }
  });
});

router.post('/product/delete', function(req, res, next) {
  let sql = "delete from t_shop_rate where id = ?";
  connection.query(sql, req.body.id, function (err,result) {
    for (let i = 0; i < result.length; i++) {
      result[i].create_time = new Date(result[i].create_time).getTime() + 28800000;
      result[i].update_time = new Date(result[i].update_time).getTime() + 28800000;
    }
    res.send(result);
  });
});


router.post('/purchase/record/query', function(req, res, next) {
  let b = req.body.pageSize
  let a = (req.body.page - 1) * b
  let username = req.body.username
  let addSqlParams = [username]
  let sql = "select * from t_purchase_record WHERE user_id = any(SELECT id from t_shop_product where user_id = (SELECT id from t_system_user WHERE username = ?))";
  connection.query(sql, addSqlParams, function (err,result) {
    if (err !== null) {
      res.send(err)
      return
    }
    let count = result.length
    result = result.slice(a, a + b)
    for (let i = 0; i < result.length; i++) {
      result[i].buy_time = new Date(result[i].buy_time).getTime() + 28800000;
    }
    let returnResult = {
      result: result,
      count: count
    }
    res.send(returnResult);
  });
});

router.post('/users/touxiang', upload, function(req,res,next){
  var path = req.files[0].path
  var obj = {
    touxiang: req.body.files
  }
  res.send(path);
})

router.post('/users/add', upload, function(req,res,next){
  let fileName = req.body.fileName
  let uploadData = req.body.uploadData
  let newFileName = 'public\\images\\user\\' + uploadData.username
  let queryUsername = "SELECT * FROM t_system_user WHERE username = ?"
  connection.query(queryUsername, uploadData.username, function (err, result) {
    if (err) {
      res.send(err.message)
    } else {
      if (result.length === 0) {
        let username = uploadData.username
        let password = uploadData.password
        let shop_name = uploadData.shop_name
        let user_status = uploadData.fileType
        let shop_level = 1
        let addSqlParams = [username, password, shop_name, shop_level, user_status]
        let addSql = 'INSERT INTO t_system_user (username,password,shop_name,shop_level,user_status) VALUES (?,?,?,?,?)'
        connection.query(addSql, addSqlParams, function (err, result) {
          if (err) {
            return err.message
          } else {
            fs.rename(fileName, newFileName, function(err){
              res.send(newFileName)
            });
          }
        })
      } else {
        res.send('1001')
      }
    }
  })
})

var addData = (req) => {
  debugger
  let name = req.body.name
  let url = req.body.url
  let alexa = req.body.alexa
  let country = req.body.country
  let addSql = 'INSERT INTO websites(Id,name,url,alexa,country) VALUES(0,?,?,?,?)'
  let addSqlParams = [name, url, alexa, country]
  // 增
  connection.query(addSql, addSqlParams, function (err, result) {
    if (err) {
      return err.message
    } else {
      return 200
    }
  })
}

module.exports = router;
