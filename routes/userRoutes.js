const express = require('express')
const user = express.Router();
const activeUser = require('../middleware/userSession')
const checkUser= require('../middleware/checkUserSession')

const userController = require('../controller/userController/userController')
const homeController = require('../controller/userController/homeController')
const productController = require('../controller/userController/productController')
const profileController = require('../controller/userController/profileController')
const cartController = require('../controller/userController/cartController')
const checkoutController = require('../controller/userController/checkoutController')
const orderController = require('../controller/userController/orderController')
const forgotPassword = require('../controller/userController/forgotPassword')
const wishlistController = require('../controller/userController/wishlistcontroller')

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

user.get('/profile', activeUser , profileController.profile)

user.post('/update-profile', activeUser , profileController.updateProfile)

user.post('/add-address', activeUser , profileController.addAddress)

user.get('/remove-address/:index', activeUser , profileController.removeAddress);

user.get('/edit-address/:index', activeUser , profileController.editAddress)

user.post('/update-address/:index', activeUser , profileController.updateAddress)

user.get('/wallet', activeUser , profileController.walletPage)

//----------------------------- cart route --------------------------

user.get('/cart', activeUser , cartController.cart)
user.get('/add-to-cart/:id', activeUser, cartController.addToCartPost)
user.delete('/remove-item/:id',activeUser,cartController.removeItem)
user.post('/cart/increment',activeUser,cartController.increment)
user.post('/cart/decrement',activeUser,cartController.decrement)


//------------------------------- Wishlist ---------------------------

user.get('/wishlist', activeUser , wishlistController.wishlistpage )
user.get('/add-wishlist/:id', activeUser, wishlistController.addWishlist )
user.delete('/delete-wish/:id', activeUser , wishlistController.deleteWishlist )


//------------------ item count in wishlist and cart -----------------

user.get('/getCounts', activeUser, wishlistController.getCounts);


//-------------------------------- checkout --------------------------

user.get('/checkout', activeUser , checkoutController.checkout)
user.post('/checkout-address', activeUser ,checkoutController.addAddress)
user.get('/conform-order', activeUser , checkoutController.orderPage)
user.post('/place-order/:address/:payment', activeUser , checkoutController.placeOrder)
user.post('/payment-render/:amount', activeUser , checkoutController.paymentRender)


//---------------------------------- Order  ------------------------

user.get('/orders', activeUser , orderController.orderPage)
user.post('/cancelOrder/:id', activeUser , orderController.cancelOrder)
user.get("/orderDetail/:id", activeUser , orderController.orderDetail)
user.post('/returnOrder', activeUser, orderController.returnOrder)


//------------------------- forgot password ---------------------------

user.get('/forgotpassword' , forgotPassword.forgotPassword)
user.post('/forgotpassword' , forgotPassword.forgotPasswordPost)
user.get('/forgotpasswordotp' , forgotPassword.forgotPasswordOtp)
user.post('/forgotpasswordotp' , forgotPassword.forgotPasswordOtpPost)
user.post('/resetpassword' , forgotPassword.resetPasswordPost)
user.get('/forgotpassword-resend/:email' , forgotPassword.forgotResend)


//------------------------------- logout -------------------------------

user.get('/logout' , userController.logout)


module.exports = user;