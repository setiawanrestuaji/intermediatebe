const multer = require('multer')
const path = require('path') // tidak perlu di install

 // konfigurasi multer
const multerUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => { // folder penyimpanan file
      cb(null, './uploads') // root
    },
    filename: (req, file, cb) => { // nama file
      const ext = path.extname(file.originalname) // mengambil ekstensi file .jpg | .png
      cb(null, `${Math.round(Math.random() * 1E9)}${ext}`) // nama file => tanggal sekarang.png
    }
  }),
  fileFilter: (req, file, cb) => { // filter file
    const ext = path.extname(file.originalname)
    if(ext === '.jpg' || ext === '.png' || ext === '.jpeg'){
      cb(null, true)
    }else{
      const error = {
        message: "Error type file"
      }
      cb(error, false)
    }
  },
  // membatasi ukuran file
  limits: { fileSize: 80 * 1000 } // satuan limit dalam bentuk bit, 1000 = 1kb
})

// middleware
const upload = (req, res, next) => {
  const multerSingle = multerUpload.single('image')
  multerSingle(req, res, (err) => {
    if(err){
      res.json(err)
    }else{
      next()
    }
  })
}

module.exports = upload