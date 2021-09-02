const express = require('express')
const connection = require('./db')
const jwt = require('jsonwebtoken')

const authentication = require('./middleware/authentication')
const authorization = require('./middleware/authorization')
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
const upload = require('./middleware/upload')
const _ = require('lodash')
const redisAction = require('./helpers/redis')

const redis = require('redis')
const client = redis.createClient({
  host: '127.0.0.1', // localhost
  port: 6379,
})
client.on('error', (err) => {
  console.log(err)
})

const router = express.Router()

router
.get('/', (req, res) => {
  res.json({
    msg: 'success'
  })
})
.post('/register', (req, res) => {
  const {email, password, level} = req.body
  connection.query(`
    INSERT INTO users 
      (email, password, level) 
      VALUES
      ('${email}','${password}','${level}') 
  `, (err, result) => {
    if(err){
      res.json(err)
    }else{
      // Cara 1
      // client.del("users")
      // res.json(result)

      // Cara 2
      connection.query(`SELECT * FROM users`, (err, result) => {
        client.set("users", JSON.stringify(result))
        res.json(result)
      })
    }
  })
})
.post('/login', (req, res) => {
  const {email, password} = req.body
  connection.query(`
    SELECT * FROM users WHERE email='${email}' AND password='${password}'
  `, (err, result) => {
    if(err){
      res.json(err)
    }else{
      // berhasil login & generate token
      const user = result[0]
      // data harus unik / mewakili suatu identitas
      const payload = {
        id: user.id,
        email: user.email
      }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      res.json({
        token: token
      })
    }
  })
})
// hanya level admin yang bisa akses
.get('/user-admin', authentication, authorization.isAdmin, (req, res) => {
  connection.query(`SELECT * FROM users`, (err, result) => {
    if(err){
      res.json(err)
    }else{
      res.json(result)
    }
  })
})
// hanya level user yang bisa akses
.get('/user-user', authentication, authorization.isUser, (req, res) => {
  connection.query(`SELECT * FROM users`, (err, result) => {
    if(err){
      res.json(err)
    }else{
      res.json(result)
    }
  })
})
// semua level bisa akses
.get('/user-all', authentication, (req, res) => {
  connection.query(`SELECT * FROM users`, (err, result) => {
    if(err){
      res.json(err)
    }else{
      res.json(result)
    }
  })
})
.post('/upload', upload, (req, res) => {
  const image = req.file.filename // nama file yang akan di simpan ke db
  const {email, password, level} = req.body
  connection.query(`
    INSERT INTO users (email, password, level, image)
    VALUES
    ('${email}','${password}','${level}','${image}')
  `, (err, result) => {
    if(err){
      res.json(err)
    }else{
      res.json(result)
    }
  })
})
// authentication => mengecheck token
// authorization => mengecheck level
.post('/set-redis', (req, res) => {
  connection.query(`SELECT * FROM users`, (err, result) => {
    client.set("users", JSON.stringify(result))
    res.json(result)
  })
})
.get('/users', (req, res) => {
  const search = req.query.search ? req.query.search : ''
  const page = req.query.page ? req.query.page : 1
  const limit = req.query.limit ? parseInt(req.query.limit) : 2
  const start = page === 1 ? 0 : (page-1)*limit

  client.get("users", (err, result) => {
    if(!result){ // data di redis tidak ada
      // Get all data, tujuan untuk dimasukkan ke redis
      connection.query(`SELECT * FROM users`, (err, result) => {
        redisAction.set("users", JSON.stringify(result))
      // Get data from mysql dengan search, tujuan untuk response
        connection.query(`SELECT * FROM users  WHERE email LIKE '%${search}%'`, (err, resultSearch) => {
          res.json({
            data: resultSearch,
            msg: 'Data from MYSQL'
          })
        })
      })
    }else{
      const response = JSON.parse(result) // convert data dari redis ke json
      const dataFiltered = _.filter(response, (e) => {
        return e.email.includes(search)
      })
      const paginate = _.slice(dataFiltered, start, start+limit)
      // page 1 = 0         , 0+10  => 0 - 10
      // page 2 = (2-1)*10  , 10+10 => 10 - 20
      res.json({
        data: paginate,
        msg: 'Data from Redis'
      })
    }
  })
})
.get('/send-email', (req, res) => {
  const sendEmail = require('./helpers/mail')
  sendEmail(req.query.email).then((response) => {
    res.json(response)
  }).catch((err) => {
    res.json(err)
  })
})

module.exports = router