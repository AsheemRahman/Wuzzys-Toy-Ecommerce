const express = require('express')
const admin = express.Router()
const isAdmin = require('../middleware/adminSession')
const adminController = require('../controller/adminController/adminController')
const categoryController = require('../controller/adminController/categoryController')
const productController = require('../controller/adminController/productController')
const userContoller = require('../controller/adminController/userController')
const orderController = require('../controller/adminController/orderController')
const couponController = require('../controller/adminController/couponController')
const saleController = require('../controller/adminController/saleController');
const offerController = require('../controller/adminController/offerController');
const popController = require('../controller/adminController/popupController')


//-----------------------------  login  ----------------------------

admin.get('/', adminController.admin)
admin.get('/login', adminController.login)
admin.post('/login', adminController.loginPost)


//------------------------ admin home page --------------------------

admin.get('/home', isAdmin , adminController.home)
admin.get('/charts', isAdmin , adminController.salesChart)


//-------------------------- collection -----------------------------

admin.get('/collection', isAdmin, categoryController.category)
admin.post('/addcollection', isAdmin, categoryController.addCategoryPost)
admin.get('/deletecollection/:id', isAdmin, categoryController.deleteCategory)
admin.get('/collectionstatus', isAdmin, categoryController.status)
admin.post('/editcollection', isAdmin, categoryController.editCategory)


//----------------------------- product -----------------------------

admin.get('/products', isAdmin, productController.product)
admin.get('/products/:id', isAdmin, productController.deleteProduct)
admin.get('/productstatus', isAdmin, productController.status)
admin.get('/addproduct', isAdmin, productController.addProduct)
admin.post('/addproduct', productController.multer , productController.addproductPost)
admin.get('/editproduct/:id', isAdmin, productController.editProduct)
admin.post('/editproduct/:id', isAdmin, productController.multer, productController.editProductPost);


//--------------------------- Customer Details ----------------------------

admin.get('/users', isAdmin, userContoller.users)
admin.get('/userstatus', isAdmin, userContoller.status)


// ----------------------------- Order Details ----------------------------

admin.get('/order', isAdmin, orderController.orderpage)
admin.get('/order-view/:id', isAdmin, orderController.orderView)
admin.post('/order/:orderId/status', isAdmin, orderController.orderStatus)


// -------------------------------- Popup --------------------------------

admin.get('/popups', isAdmin, popController.getPopups)
admin.post('/create-popup', isAdmin, popController.createPopup)
admin.post('/update-popup/:id', isAdmin, popController.updatePopup)
admin.get('/popups/:id', isAdmin, popController.deletePopup)


// -------------------------------- coupon --------------------------------

admin.get('/coupons/:id?', isAdmin, couponController.getCoupons)
admin.post('/addcoupon', isAdmin, couponController.addCoupon)
admin.post('/editcoupon/:id', isAdmin, couponController.editCoupon)
admin.get('/statuscoupon', isAdmin, couponController.toggleCouponStatus);
admin.delete('/deletecoupon/:id', isAdmin, couponController.deleteCoupon)


// -------------------------------- Sales Report --------------------------------

admin.get('/salesReport',isAdmin , saleController.salePage)
admin.get('/getsalesbymonth', isAdmin, saleController.getSalesByMonth);
admin.post('/fetch-sales-data',isAdmin, saleController.getOrderDetails);
admin.post('/downloadPDF',isAdmin,saleController.downloadPDF)


// -------------------------------- offer --------------------------------

admin.get('/offer', isAdmin, offerController.getOffer)
admin.post('/addOffer',isAdmin,offerController.addOffer)
admin.post('/editOffer',isAdmin,offerController.editOffer)
admin.get('/deleteOffer/:id',isAdmin,offerController.deleteOffer)
admin.get('/offerStatus',isAdmin,offerController.offerStatus)


//---------------------------- admin logout ------------------------------

admin.get('/logout', adminController.logout)


module.exports = admin
