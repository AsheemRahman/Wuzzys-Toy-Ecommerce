const express = require('express')
const user = express.Router();
const isUser = require('../middleware/userSession')

const userContoller = require('../controller/userController/userController')
const homeController = require('../controller/userController/homeController')
const productController = require('../controller/userController/productController')
const profileContoller = require('../controller/userController/profileController')
const forgotPassword = require('../controller/userController/forgotPassword')

//------------------------------- main -------------------------------

user.get('/',userContoller.user)


//------------------------------ login -------------------------------

user.get('/login',userContoller.login)
user.post('/login',userContoller.loginPost)


//----------------------------- signup -------------------------------

user.get('/signup',userContoller.signup)
user.post('/signup',userContoller.signgupPost)


//--------------------------- otp verify ------------------------------

user.get('/verify',userContoller.verify)
user.post('/verify',userContoller.verifyPost)
user.post('/resend/:email',userContoller.otpResend)


//-------------------------------- home -------------------------------

user.get('/home',homeController.home)
user.get('/explore',homeController.explore)


//---------------------------- product view ---------------------------

user.get('/product/:id',productController.productView);


//----------------------------- logout --------------------------------

user.get('/logout',userContoller.logout)


//------------------------- forgot password ---------------------------

user.get('/forgotpassword',forgotPassword.forgotPassword)
user.post('/forgotpassword',forgotPassword.forgotPasswordPost)
user.get('/forgotpasswordotp',forgotPassword.forgotPasswordOtp)
user.post('/forgotpasswordotp',forgotPassword.forgotPasswordOtpPost)
user.post('/resetpassword',forgotPassword.resetPasswordPost)


//----------------------------- profile ------------------------------

user.get('/profile',isUser,profileContoller.profile)



module.exports = user;