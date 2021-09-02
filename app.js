const express = require('express')
const bodyParser = require('body-parser')
const router = require('./router')
require('dotenv').config()

const app = express()
app.use(bodyParser.json())

app.use(router)
app.use(express.static(__dirname + '/uploads')) // membuka folder upload supaya bisa di akses

app.listen(3000, () => {
  console.log("Service running on PORT 3000")
})