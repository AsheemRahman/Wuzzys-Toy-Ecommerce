const express = require('express')
const user = express.Router();
const isUser = require('../middleware/userSession')
const checkUser= require('../middleware/checkUserSession')

const userController = require('../controller/userController/userController')
const homeController = require('../controller/userController/homeController')
const productController = require('../controller/userController/productController')
const profileController = require('../controller/userController/profileController')
const cartController = require('../controller/userController/cartController')
const checkoutController = require('../controller/userController/checkoutController')
const orderController = require('../controller/userController/orderController')
const forgotPassword = require('../controller/userController/forgotPassword')

//------------------------------- main -------------------------------

user.get('/',userController.user)


//------------------------------ login -------------------------------

user.get('/login',userController.login)
user.post('/login',userController.loginPost)


//------------------------ login using google ------------------------

user.get('/auth/google',userController.googleAuth)
user.get('/auth/google/callback',userController.googleAuthCallback)


//------------------------ login using facebook ------------------------

user.get('/auth/facebook',userController.facebookAuth)
user.get('/auth/facebook/callback',userController.facebookAuthCallback)



//----------------------------- signup -------------------------------

user.get('/signup',userController.signup)
user.post('/signup',userController.signupPost)


//--------------------------- otp verify ------------------------------

user.get('/verify',userController.verify)
user.post('/verify',userController.verifyPost)
user.post('/resend/:email',userController.otpResend)


//-------------------------------- home -------------------------------

user.get('/home' , checkUser , homeController.home)


//----------------------------- product view -----------------------------

user.get('/allproduct', checkUser , homeController.allproduct)

user.get('/view-more', checkUser , homeController.latestProduct)

user.get('/product/:category', checkUser , homeController.category)

user.get('/productDetail/:id' , checkUser , productController.productDetail);


//----------------------------- profile route --------------------------

user.get('/profile', checkUser , profileController.profile)
user.post('/update-profile', checkUser , profileController.updateProfile)

user.post('/add-address', checkUser , profileController.addAddress)
user.get('/remove-address/:index', checkUser,profileController.removeAddress);
user.get('/edit-address/:index',checkUser,profileController.editAddress)
user.post('/update-address/:index',checkUser,profileController.updateAddress)

//----------------------------- cart route --------------------------

user.get('/cart', checkUser , cartController.cart)
user.get('/add-to-cart/:id', checkUser, cartController.addToCartPost)
user.get('/remove-item/:id',checkUser,cartController.removeItem)
user.get('/quantity/:id', checkUser ,cartController.quantity);

//---------------------------------- checkout -----------------------

user.get('/checkout', checkUser , checkoutController.checkout)
user.post('/checkout-address',checkUser,checkoutController.addAddress)
user.get('/conform-order',checkUser,checkoutController.orderPage)
user.post('/place-order/:address/:payment',checkUser,checkoutController.placeOrder)


//---------------------------------- Order  ------------------------

user.get('/orders', checkUser , orderController.orderPage)
user.post('/cancelOrder/:id', checkUser , orderController.cancelOrder)





//------------------------- forgot password ---------------------------

user.get('/forgotpassword' , forgotPassword.forgotPassword)
user.post('/forgotpassword' , forgotPassword.forgotPasswordPost)
user.get('/forgotpasswordotp' , forgotPassword.forgotPasswordOtp)
user.post('/forgotpasswordotp' , forgotPassword.forgotPasswordOtpPost)
user.post('/resetpassword' , forgotPassword.resetPasswordPost)
user.get('/forgotpassword-resend/:email' , forgotPassword.forgotResend)


//------------------------------- logout --------------------------------

user.get('/logout' , userController.logout)




module.exports = user;