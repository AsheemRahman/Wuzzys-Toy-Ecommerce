const userSchema = require('../../model/user.modal')
const generatOTP = require('../../services/generateOTP')
const sendOTP = require('../../services/emailSender')
const bcrypt = require('bcrypt')

//------------------------------ Forget Page render ---------------------------------

const forgotPassword = (req, res) => {
    try {
        req.session.user = ''
        res.render('user/forgotPassword', {title: 'Forgot Password',user: req.session.user})
    } catch (error) {
        console.log(`error while rendering forgot Password page ${error}`)
    }
}

//------------------------------------- Forget ---------------------------------------
const forgotPasswordPost = async (req, res) => {
    try {
        const checkEmail = await userSchema.findOne({ email: req.body.email })

        if(checkEmail.isBlocked){
            req.flash('errorMessage', 'Access to this account has been restricted. Please reach out to the administrator for further assistance and guidance on the next steps."')
            return res.redirect('/user/login')
        }
        const otp = generatOTP();

        sendOTP(req.body.email, otp)

        req.session.email = req.body.email
        req.session.otp = otp;
        req.session.otpExpireTime = Date.now();

        if (checkEmail != "") {
            res.redirect('/user/forgotPasswordOtp')
        } else {
            req.flash('errorMessage', `We couldn't find your details , Please Register.`);
            res.redirect('/user/signup')
        }
    } catch (err) {
        console.log(`Error during forgot password page ${err}`);
    }
}



//--------------------------------- Otp page is render --------------------------------

const forgotPasswordOtp = (req, res) => {
    try {
        res.render('user/forgotPasswordOtp', {title: 'OTP verification',email: req.session.email,otpTime: req.session.otpTime,user: req.session.user})
    } catch (error) {
        console.log(`error while loading forgot password otp ${error}`)
    }
}

//------------------------------------- Otp Getting ----------------------------------

const forgotPasswordOtpPost = async (req, res) => {
    try {
        if (req.session.otp !== undefined) {
            if (req.body.otp === req.session.otp) {
                res.render('user/resetpassword', { title: 'Reset Password' ,user:req.session.user})
            } else {
            req.flash('error', 'Invaild OTP')
            res.redirect('/user/login')
            }
        } else {
            req.flash('error', 'Error occured retry')
            res.redirect('/user/forgotpassword')
        }
    } catch (error) {
        console.log(`error while forgot otp verification ${error}`)
    }
}

//----------------------------------- New Password -----------------------------------

const resetPasswordPost = async (req, res) => {
    try {
        const password = await bcrypt.hash(req.body.password, 10)
        const update = await userSchema.updateOne({ email: req.session.email },{ password: password })
        if (update) {
            req.flash('success', 'Password updated successfully')
            res.redirect('/user/login')
        } else {
        req.flash('error', 'Error while password update')
        res.redirect('/user/login')
        }
    } catch (error) {
        console.log(`error while reset password post ${error}`)
    }
}

//----------------------------------- OTP Resend -----------------------------------

const forgotResend = (req, res) => {
    try {
        const email = req.params.email
        const otp = generatOTP()
        sendOTP(email, otp)
        ;(req.session.otp = otp), (req.session.otpTime = Date.now())
        req.flash('success', 'New OTP sent to mail')
        res.redirect('/user/forgotpasswordotp')
    } catch (error) {
        console.log(`error in resend otp forgot password  ${error}`)
    }
}

module.exports = {
    forgotPassword,
    forgotPasswordPost,
    forgotPasswordOtp,
    forgotPasswordOtpPost,
    resetPasswordPost,
    forgotResend
}
