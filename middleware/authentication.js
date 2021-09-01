const jwt = require('jsonwebtoken')

const authentication = (req, res, next) => {
  const token = req.headers.token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(err){
      res.json(err)
    }else{
      // console.log(decoded.id)
      req.userId = decoded.id // untuk authorization
      next()
    }
  })
}

module.exports = authentication