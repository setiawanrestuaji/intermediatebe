const connection = require('../db')
const authorization = {
  isAdmin: (req, res, next) => {
    const id = req.userId
    connection.query(`SELECT * FROM users WHERE id ='${id}'`, (err, result) => {
      if(err){
        res.json(err)
      }else{
        if(result[0].level === 0){
          next()
        }else{
          res.json({
            msg: "Harus Admin"
          })
        }
      }
    })
  },
  isUser: (req, res, next) => {
    const id = req.userId
    connection.query(`SELECT * FROM users WHERE id ='${id}'`, (err, result) => {
      if(err){
        res.json(err)
      }else{
        if(result[0].level === 1){
          next()
        }else{
          res.json({
            msg: "Harus User"
          })
        }
      }
    })
  }
}

module.exports = authorization