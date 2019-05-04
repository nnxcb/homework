var express = require('express');
var mysql = require('mysql'); 
var bodyParser=require("body-parser")
var router = express.Router();
var resultData
var loginResult
var connection = mysql.createConnection({      //创建mysql实例
  host:'localhost',
  port:'3306',
  user:'root',
  password:'zpf123',
  database:'homework'
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
  getInfoResult.avatar = 'http://localhost:8084/images/' + getInfoResult.name + '.jpg'
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

router.post('/product/query', function(req, res, next) {  ///user/query
  debugger
  let sql = "select * from t_shop_product where user_id = ?";
  connection.query(sql, req.body.id, function (err,result) {
    res.send(result);
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
      result[i].update_time = new Date(result[i].update_time).getTime() + 28800000;
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
      result[i].update_time = new Date(result[i].update_time).getTime() + 28800000;
    }
    res.send(result);
  });
});

module.exports = router;
