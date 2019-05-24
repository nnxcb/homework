let express = require('express')
let mysql = require('mysql')
// let bodyParser=require("body-parser")
let router = express.Router();

let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'zpf123',
  port: '3456',
  database: 'test',
  useConnectionPooling: true
})

connection.connect()
router.use(express.static('public'))

// router.use(bodyParser.json())
// router.use(bodyParser.urlencoded({ extended: false }))

router.post('/process_add', function (req, res) {
  // req = JSON.stringify(req)
  // console.log(req)
  debugger
  let name = req.body.name
  let url = req.body.url
  let alexa = req.body.alexa
  let country = req.body.country
  res.write("<head><meta charset='utf-8'/></head>")
  // 输出 JSON 格式
  let addSql = 'INSERT INTO websites(Id,name,url,alexa,country) VALUES(0,?,?,?,?)'
  let addSqlParams = [name, url, alexa, country]
  console.log(addSqlParams)
  // 增
  connection.query(addSql, addSqlParams, function (err, result) {
    if (err) {
      console.log('[INSERT ERROR] - ', err.message)
      return
    }
    console.log('--------------------------INSERT----------------------------')
    // console.log('INSERT ID:',result.insertId)
    console.log('INSERT ID:', result)
    console.log('-----------------------------------------------------------------\n\n')
  })
  // connection.end()
  let response = {
    '姓名': name,
    '网址': url,
    '排名': alexa,
    '国家': country
  }
  // console.log(response)
  res.end(JSON.stringify(response))
})
module.exports = router;

