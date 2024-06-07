const productSchema = require('../../model/product.model')
const collectionSchema = require('../../model/collection.model')

const home = async (req, res) => {
  try {
    const product = await productSchema.find()

    res.render('user/home', { title: 'Home', product })
  } catch (error) {
    console.log(`error while rendering home ${error}`)
  }
}

const explore = async (req, res) => {
  try {
    const product = await productSchema.find()

    res.render('user/explore', { title: 'explore', product })
  } catch (error) {
    console.log(`error from explore rendering ${error}`)
  }
}

module.exports = { home, explore }
