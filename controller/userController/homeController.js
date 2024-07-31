const productSchema = require('../../model/productSchema')
const wishlistSchema =require('../../model/wishlistSchema')
const checkPopup = require('../../model/PopupSchema')
const categorySchema = require('../../model/categorySchema');
const mongoose = require('mongoose')

//----------------------------------- Home page render --------------------------------

const home = async (req, res) => {
  const userId = req.session.user
  try {
    const popup = await checkPopup.findOne({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    const wishlist = await wishlistSchema.findOne({userID : userId})
    const product = await productSchema.find({ isActive : true }).sort({createdAt: -1}).limit(8)
    res.render('user/home', { title: 'Home', product, user: req.session.user ,wishlist , popup })
  } catch (error) {
    console.log(`error while rendering home ${error}`)
  }
}


//--------------------------------------- All Produccts Page ---------------------------------


const allproduct = async (req, res) => {
  try {
    const minPrice = parseInt(req.query.minPrice) || 0;
    const maxPrice = parseInt(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
    const sortBy = req.query.sortBy || 'newArrivals';
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const categories = await categorySchema.find({ isActive: true });

    // Extract category names if provided
    let selectedCategories = req.query.productCategory
      ? (Array.isArray(req.query.productCategory) ? req.query.productCategory : [req.query.productCategory])
      : categories.map(cat => cat.collectionName);

    let categoryIds = [];
    if (selectedCategories.length > 0) {
      const categoryDocs = await categorySchema.find({ collectionName: { $in: selectedCategories } });
      categoryIds = categoryDocs.map(cat => cat.collectionName);
    }

    const productQuery = {
      productName: { $regex: search, $options: "i" },
      productCollection: { $in: categoryIds },
      isActive: true,
      productPrice: { $gte: minPrice, $lte: maxPrice }
    };

    let sortOption = {};
    switch (sortBy) {
      case 'priceLowToHigh':
        sortOption = { productPrice: 1 };
        break;
      case 'priceHighToLow':
        sortOption = { productPrice: -1 };
        break;
      case 'nameAsc':
        sortOption = { productName: 1 };
        break;
      case 'nameDesc':
        sortOption = { productName: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const product = await productSchema.find(productQuery).populate('productCollection')
      .sort(sortOption)
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await productSchema.countDocuments(productQuery);

    res.render('user/allproduct', {
      title: 'All Product',
      alertMessage: req.flash('errorMessage'),
      user: req.session.user,
      product,
      categories,
      query: req.query,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search,
      limit,
      page,
    });
  } catch (error) {
    console.log(`error in All Product rendering ${error}`);
    res.status(500).send('An error occurred');
  }
};




//--------------------------------------- Latest product Page ---------------------------------

const latestProduct = async (req, res) => {
  try {
    const sortby = req.query.sortby || "";
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const userId = req.session.user
    
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

    const today = new Date();
    const productAge = new Date(today.setDate(today.getDate() - 30));
    
    const product = await productSchema.find({ productName: { $regex: search, $options: 'i' }, isActive: true , createdAt :{$gte : productAge}})
    .sort(sort)
    .limit(limit)
    .skip((page - 1) * limit)

      const count = await productSchema.countDocuments({ productName: { $regex: search, $options: 'i' },isActive: true , createdAt :{$gte : productAge} });

      const wishlist = await wishlistSchema.findOne({ userID: userId });

    res.render('user/view-more', {
      title: 'Latest Products',
      product,
      user: req.session.user,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search,
      limit,page,
      productAge,
      wishlist
    })
  } catch (error) {
    console.log(`error in Latest products page rendering ${error}`)
  }
}

//--------------------------------------- Category wise product Page ---------------------------------

const category = async (req, res) => {
  const categoryName = req.params.category || "";
  const search = req.query.search || "";
  const sortby = req.query.sortby || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const userId = req.session.user
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
      sort = { createdAt: -1 }
    }
    const categoryProduct = await productSchema.find({productCollection: categoryName , isActive : true , productName: { $regex: search, $options: 'i' }})
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)

      const count = await productSchema.countDocuments({productCollection: categoryName , productName: { $regex: search, $options: 'i' },isActive: true});

      const wishlist = await wishlistSchema.findOne({ userID: userId });

    res.render('user/category-product', {
      title: categoryName,
      product: categoryProduct,
      user: req.session.user,
      categoryName,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search,
      limit,page,
      wishlist
    })
  } catch (error) {
    console.log(`Error in Category-wise product rendering: ${error.message}`)
    res.status(500).send('Internal Server Error');
  }
}


module.exports = { home, allproduct , category , latestProduct }
