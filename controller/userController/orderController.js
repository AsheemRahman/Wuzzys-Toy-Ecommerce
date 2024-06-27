const orderSchema = require("../../model/orderSchema");
const userSchema = require("../../model/userSchema");
const mongoose = require("mongoose");
const productSchema = require("../../model/productSchema");



//--------------------------------- user order page -----------------------------


const orderPage = async (req, res) => {
    try {
        const user = req.session.user;
        
        if (!user) {
            req.flash('error', "User not found. Please login again.");
            return res.redirect("/user/login");
        }
        
        const orderDetails = await orderSchema.find({ customer_id: user, isCancelled: false }).populate("products.product_id").sort({ createdAt: -1 })

        const orderCount = orderDetails.length;

        res.render("user/orders", {
            title: "Orders",
            user,
            orderDetails,
            orderCount
        });
    } catch (err) {
        console.error(`Error rendering the order page: ${err}`);
        req.flash("error", "Error rendering the order page, please Try again later.");
        res.redirect("/user/home");
    }
};


const cancelOrder = async(req,res)=>{
    try{
        const user = req.session.user
        const orderId = rq.params.id

        console.log(user)
        console.log(orderId)

        const order  = await orderSchema.findByIdAndUpdate(orderId,{status:"Cancelled"})

        for(product of order.products) {
            await productSchema.findByIdAndUpdate(product.productId,{$inc :{productQuantity : product.quantity}})
        }
        if(order){
            req.flash('success','Order cancel successfully')
            res.redirect('/user/orders')
        }else{
            req.flash('error','Order cannot cancel right now ,Try again later')
            res.redirect('/user/orders')
        }


    }catch(error){
        console.log(`error While cancel a order ${error}`)
        req.flash('error','Cannot cancel this Product right now ,Please Try again')
    }
}



module.exports = {orderPage , cancelOrder }