const productSchema = require('../../model/productSchema')
const mongoose = require('mongoose');

//---------------------------------- Product View -----------------------------------

const productDetail = async (req, res) => {
   try {
      const id = req.params.id;

      // Validate the ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
         req.flash('error', 'Invalid product ID');
         return res.redirect('/user/home');
      }

      const product = await productSchema.findById(id);

      if (!product) {
         req.flash('error', 'Product not found');
         return res.redirect('/user/home');
      }

      if (product.isActive) {
         const similarProduct = await productSchema.find({
            productCollection: product.productCollection,
            isActive: true
         });
         return res.render('user/productDetail', {
            title: product.productName,
            product,
            similarProduct,
            user: req.session.user
         });
      } else {
         req.flash('error', 'Product is not available');
         return res.redirect('/user/home');
      }
   } catch (error) {
      console.error(`Error while rendering product page: ${error}`);
      req.flash('error', 'An error occurred while product details. Please try again later.');
      res.redirect('/user/home');
   }
}


module.exports = { productDetail };
