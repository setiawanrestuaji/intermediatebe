const express = require('express')
const bodyParser = require('body-parser')
const router = require('./router')
require('dotenv').config()

const app = express()
app.use(bodyParser.json())

app.use(router)

app.listen(3000, () => {
  console.log("Service running on PORT 3000")
})