const productSchema = require('../../model/productSchema')
const collectionSchema = require('../../model/collectionSchema')

//----------------------------------- Home page render --------------------------------

const home = async (req, res) => {
  try {
    const product = await productSchema.find()
    res.render('user/home', { title: 'Home', product, user: req.session.user })
  } catch (error) {
    console.log(`error while rendering home ${error}`)
  }
}

//--------------------------------------- All Produccts Page ---------------------------------

const allproduct = async (req, res) => {
  try {
    const product = await productSchema.find()

    res.render('user/allproduct', {
      title: 'All Product',
      product,
      user: req.session.user
    })
  } catch (error) {
    console.log(`error from All Products rendering ${error}`)
  }
}

//--------------------------------------- Category wise product Page ---------------------------------

const category = async (req, res) => {
  try {
    const categoryName = req.params.category
    const categoryProduct = await productSchema.find({
      productCollection: categoryName
    })
    res.render('user/category-product', {
      title: categoryName,
      product: categoryProduct,
      user: req.session.user
    })
  } catch (error) {
    console.log(`Error in Category-wise product rendering: ${error}`)
  }
}

module.exports = { home, allproduct, category }
