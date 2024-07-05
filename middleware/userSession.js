const userSchema = require('../model/userSchema')

async function isUser (req,res,next){

    try {
        
        if(req.session.user){
            const user = await userSchema.findById(req.session.user);
            if(user.isActive){
                next();
            }else{
                req.session.user ='';
                req.flash('error','user is blocked by admin')
                res.redirect('/user/login')
            }
        }else{
            res.redirect('/user/login')
        }
    } catch (error) {
        console.log(`user session error ${error}`)
    }
}

module.exports = isUser