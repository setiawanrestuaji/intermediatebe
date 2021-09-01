const mysql2 = require('mysql2')

const connection = mysql2.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'intermediatebe'
})

connection.connect((err) => {
  if(err){
    console.log(err)
  }else{
    console.log('Koneksi ke db berhasil')
  }
})

module.exports = connection