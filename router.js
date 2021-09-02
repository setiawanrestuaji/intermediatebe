const express = require('express')
const connection = require('./db')
const jwt = require('jsonwebtoken')

const authentication = require('./middleware/authentication')
const authorization = require('./middleware/authorization')
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
const upload = require('./middleware/upload')

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
      res.json(result)
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

module.exports = router