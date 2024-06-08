const productSchema = require('../../model/product.model')
const collectionSchema = require('../../model/collection.model')


//----------------------------------- Home page render --------------------------------

const home = async (req, res) => {
  try {
    const product = await productSchema.find()
    res.render('user/home', { title: 'Home', product , user:req.session.user })
  } catch (error) {
    console.log(`error while rendering home ${error}`)
  }
}


//--------------------------------------- Explore Page ---------------------------------

const explore = async (req, res) => {
  try {
    const product = await productSchema.find()

    res.render('user/explore', { title: 'explore', product , user:req.session.user })
  } catch (error) {
    console.log(`error from explore rendering ${error}`)
  }
}

module.exports = { home, explore }
