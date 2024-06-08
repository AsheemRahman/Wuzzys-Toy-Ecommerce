const productSchema = require('../../model/product.model')

//---------------------------------- Product View -----------------------------------

const productView = async (req, res) => {
   try {
      const id = req.params.id
      const product = await productSchema.findById(id)
      const similarProduct = await productSchema.find({productCollection: product.productCollection})
      res.render('user/productView', {title: product.productName,product,similarProduct})
   } catch (error) {
   console.log(`error while rendering product page ${error}`)
   }
}

module.exports = { productView }
