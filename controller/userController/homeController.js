const productSchema = require('../../model/productSchema')
const categorySchema = require('../../model/categorySchema')

const checkPopup = require('../../model/PopupSchema')

//----------------------------------- Home page render --------------------------------

const home = async (req, res) => {
  try {
    const popup = await checkPopup.findOne({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    const product = await productSchema.find({ isActive : true })
    res.render('user/home', { title: 'Home', product, user: req.session.user , popup })
  } catch (error) {
    console.log(`error while rendering home ${error}`)
  }
}

//--------------------------------------- All Produccts Page ---------------------------------

const allproduct = async (req, res) => {
  try {
    const sortby = req.query.sortby || ""
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    let sort="";
    if(sortby){
        switch(sortby){
          case '1': sort = {productName: 1}
                  break;
          case '2': sort = {productName: -1}
                  break;
          case '3': sort = {productPrice: 1}
                  break;
          case '4': sort = {productPrice: -1}
                  break;
          case '5': sort = {createdAt: -1}
                  break;
      }
    }else{
      sort={createdAt:-1}
    }

    const product = await productSchema.find({ isActive : true })
        .sort(sort)
        .limit(limit)
        .skip((page - 1) * limit)

        const count = await productSchema.countDocuments({ productName: { $regex: search, $options: 'i' } });

    res.render('user/allproduct', {
      title: 'All Product',
      product,
      user: req.session.user,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search,
      limit,page
    })
  } catch (error) {
    console.log(`error from All Products page rendering ${error}`)
  }
}
//--------------------------------------- Latest product Page ---------------------------------

const latestProduct = async (req, res) => {
  try {
    const sortby = req.query.sortby || ""
    let sort="";
    if(sortby){
        switch(sortby){
          case '1': sort = {productName: 1}
                  break;
          case '2': sort = {productName: -1}
                  break;
          case '3': sort = {productPrice: 1}
                  break;
          case '4': sort = {productPrice: -1}
                  break;
          case '5': sort = {createdAt: -1}
                  break;
      }
    }else{
      sort={createdAt:-1}
    }

    const product = await productSchema.find({ isActive : true }).sort(sort)

    res.render('user/view-more', {
      title: 'Latest Products',
      product,
      user: req.session.user
    })
  } catch (error) {
    console.log(`error in Latest products page rendering ${error}`)
  }
}

//--------------------------------------- Category wise product Page ---------------------------------

const category = async (req, res) => {
  const categoryName = req.params.category || ""
  const sortby = req.query.sortby || ""
  try {

    let sort="";

    if(sortby){
        switch(sortby){
          case '1': sort = {productName: 1}
                  break;
          case '2': sort = {productName: -1}
                  break;
          case '3': sort = {productPrice: 1}
                  break;
          case '4': sort = {productPrice: -1}
                  break;
          case '5': sort = {createdAt: -1}
                  break;
      }
    }else{
      sort={createdAt:-1}
    }
    const categoryProduct = await productSchema.find({productCollection: categoryName , isActive : true }).sort(sort)
    res.render('user/category-product', {
      title: categoryName,
      product: categoryProduct,
      user: req.session.user
    })
  } catch (error) {
    console.log(`Error in Category-wise product rendering: ${error}`)
  }
}

module.exports = { home, allproduct, category , latestProduct }
