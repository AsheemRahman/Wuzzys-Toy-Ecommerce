const userSchema = require('../../model/userSchema')

//----------------------------------- profile page ----------------------------------

const profile = async (req,res)=>{
    
    try {
        
        const user = await userSchema.findById(req.session.user)
        if(user){
            res.render('user/profile',{title: 'Profile',user})
        }else{
            req.flash('error','Couldnt find user')
            res.redirect('/user/home')
        }
    } catch (error) {
        console.log(`error while loading profile ${error}`)
    }
}


module.exports = {profile}

