const userSchema = require('../../model/user.modal')
const generatOTP = require('../../services/generateOTP')
const sendOTP = require('../../services/emailSender')
const bcrypt = require('bcrypt')

//------------------------------ Forget Page render ---------------------------------

const forgotPassword = (req,res)=>{
    try {

        req.session.user='';
        res.render('user/forgotPassword',{title:"Forgot Password"})
        
    } catch (error) {
        console.log(`error while rendering forgotpassword page ${error}`)
    }
}

//------------------------------------- Forget ---------------------------------------

const forgotPasswordPost = async(req,res)=>{
    
    try {
        
        const check = await userSchema.findOne({email:req.body.email})

    if(check.isBlocked){
        req.flash('error','User is blocked by admin')
        res.redirect('/user/login')
    }

    const otp = generatOTP();

    sendOTP(req.body.email,otp);

    req.session.email = req.body.email;
    req.session.otp = otp;
    req.session.otpTime = Date.now();

    if(check){
        res.redirect('/user/forgotpasswordotp')
    }else{
        req.flash('error',"User doesnot exists")
        res.redirect('/user/signup')
    }

    } catch (error) {
        console.log(`error while forgotpassword post ${error}`)
    }
}


//--------------------------------- Otp page is render --------------------------------

const forgotPasswordOtp = (req,res)=>{
    try {
        res.render('user/forgotPasswordOtp',{title: 'OTP verification',email:req.session.email,otpTime:req.session.otpTime})
        
    } catch (error) {
        console.log(`error while loading forgot password otp ${error}`)
    }
}


//------------------------------------- Otp Getting ----------------------------------

const forgotPasswordOtpPost = async (req,res)=>{

    try {
        if(req.session.otp !== undefined){
            if(req.body.otp === req.session.otp){
                res.render('user/resetpassword',{title: 'Reset Password'})
            }else{
                req.flash('error','Invaild OTP')
                res.redirect('/user/login')
            }
        }else{
            req.flash('error','Error occured retry')
            res.redirect('/user/forgotpassword')
        }
        
    } catch (error) {
        console.log(`error while forgot otp verification ${error}`)
    }
}


//----------------------------------- New Password -----------------------------------

const resetPasswordPost = async (req,res)=> {

    try {
        const password = await bcrypt.hash(req.body.password,10)
        const update = await userSchema.updateOne({email: req.session.email},{password: password})
        if(update){
            req.flash('success','Password updated successfully')
            res.redirect('/user/login')
        }else{
            req.flash('error','Error while password update')
            res.redirect('/user/login')
        }
    } catch (error) {
        console.log(`error while reset password post ${error}`)
    }

}


module.exports = {
    forgotPassword,
    forgotPasswordPost,
    forgotPasswordOtp,
    forgotPasswordOtpPost,
    resetPasswordPost
}
