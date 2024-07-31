const multer = require('multer')
const path=require('path')

const storage = multer.diskStorage({

    //--------------------- files will be saved location -----------------------

    destination: function(req,file,cb){
        cb(null,'./uploads')
    },

    //------------------ file name of the file to be saved ---------------------

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + `-${file.originalname}`)
    }
})

const upload = multer({
    storage:storage,
    limits: {fileSize: 20*1024*1024}
})

module.exports = upload ;



