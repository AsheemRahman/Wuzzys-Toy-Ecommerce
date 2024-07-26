const productSchema = require('../../model/productSchema')
const mongoose = require('mongoose');
const wishlistSchema = require('../../model/wishlistSchema');

//---------------------------------- Product View -----------------------------------

const productDetail = async (req, res) => {
   try {
      const id = req.params.id;
      const userId = req.session.user;

      // Validate the ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
         req.flash('error', 'Invalid product ID');
         return res.redirect('/home');
      }

      const product = await productSchema.findById(id);

      if (!product) {
         req.flash('error', 'Product not found');
         return res.redirect('/home');
      }

      if (product.isActive) {
         const similarProduct = await productSchema.find({
            productCollection: product.productCollection,
            isActive: true
         });

         const wishlist = await wishlistSchema.findOne({ userID: userId });

         return res.render('user/productDetail', {
            title: product.productName,
            product,
            similarProduct,
            user: req.session.user,
            wishlist
         });
      } else {
         req.flash('error', 'Product is not available');
         return res.redirect('/home');
      }
   } catch (error) {
      console.error(`Error while rendering product page: ${error}`);
      req.flash('error', 'An error occurred while retrieving product details. Please try again later.');
      res.redirect('/home');
   }
};



module.exports = { productDetail };
