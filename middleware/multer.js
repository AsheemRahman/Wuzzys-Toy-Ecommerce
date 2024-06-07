const multer = require('multer')

const storage = multer.diskStorage({

    //location of where the file should be saved

    destination: function(req,file,cb){
        cb(null,'./uploads')
    },

    //file name of the file to be saved

    filename: function(req,file,cb){
        cb(null,Date.now()+'-'+file.originalname)
    }
})


const upload = multer({storage:storage})

module.exports = upload ;