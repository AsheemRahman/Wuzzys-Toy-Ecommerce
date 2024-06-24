const productSchema = require('../../model/productSchema')
const cartSchema = require('../../model/cartSchema')
const userSchema = require('../../model/userSchema')



const checkout = async (req,res)=>{
    try{
        const userDetail = req.session.user
        const user = await userSchema.findById(userDetail)
        const cartDetails = await cartSchema.findOne({ userId: req.session.user }).populate("items.productId");

        const Items = cartDetails.items;

        if(Items.length === 0){
            res.redirect('/user/cart')
        }else{
            res.render('user/checkOut',{title: 'Checkout', user , cartDetails })
        }
    }catch(err){
        console.log(`Error while rendering the checkout page ${err}`)
    }
}

module.exports = { checkout }