const multer = require('multer')
const path=require('path')

const storage = multer.diskStorage({

    //location of where the file should be saved

    destination: function(req,file,cb){
        cb(null,'./uploads')
    },

    //file name of the file to be saved

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + `-${file.originalname}`)
    }
})


const upload = multer({storage:storage})

module.exports = upload ;



