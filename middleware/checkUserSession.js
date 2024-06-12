const userSchema=require("../model/user.modal")

async function checkUser(req,res,next){
   try {
    if(req.session.user){
        const userDetails= await userSchema.findById(req.session.user)
        if(userDetails && !userDetails.isBlocked)
            {
        
        next();
        }
    else{
        req.session.user=""
        res.redirect('/user/login')
    }
}
    else{
        next();
    }
}
    catch (err) {
    console.log(`error in checkuser is blocked  ${err}`)
    }
}

module.exports = checkUser