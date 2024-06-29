const productSchema = require('../../model/productSchema')

//---------------------------------- Product View -----------------------------------

const productDetail = async (req, res) => {
   try {
      const id = req.params.id
      const product = await productSchema.findById(id)
      const similarProduct = await productSchema.find({productCollection: product.productCollection , isActive : true })
      res.render('user/productDetail', {title: product.productName , product , similarProduct , user:req.session.user})
   } catch (error) {
   console.log(`error while rendering product page ${error}`)
   }
}


module.exports = { productDetail }
