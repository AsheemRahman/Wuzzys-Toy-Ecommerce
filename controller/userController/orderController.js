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
        const orderDetails = await orderSchema.find({ customer_id: user }).populate("products.product_id").sort({ updatedAt: -1 })
        res.render("user/orders", {
            title: "Orders",
            user,
            orderDetails
        });
    } catch (err) {
        console.error(`Error rendering the order page: ${err}`);
        req.flash("error", "Error rendering the order page, please Try again later.");
        res.redirect("/user/home");
    }
};


const cancelOrder = async (req, res) => {
    try {
        const user = req.session.user;
        const orderId = req.params.id;

        if (!orderId) {
            req.flash('error', 'Invalid order ID');
            return res.redirect('/user/orders');
        }
        const order = await orderSchema.findByIdAndUpdate(orderId, { orderStatus: "Cancelled", isCancelled: true });
        if (!order) {
            req.flash('error', 'Order not found');
            return res.redirect('/user/orders');
        }
        for (let product of order.products) {
            if (product.product_id && product.product_quantity !== undefined) {
                await productSchema.findByIdAndUpdate(product.product_id, { $inc: { productQuantity: product.product_quantity } });
            } else {
                console.error(`Invalid product data: ${JSON.stringify(product)}`);
                req.flash('error', 'Error updating product quantity');
                return res.redirect('/user/orders');
            }
        }
        req.flash('success', 'Order cancelled successfully');
        res.redirect('/user/orders');
    } catch (error) {
        console.error(`Error while cancelling the order: ${error}`);
        req.flash('error', 'Cannot cancel this order right now, please try again');
        res.redirect('/user/orders');
    }
};


const orderDetail = async (req,res) =>{
    const user =req.session.user
    const order_id = req.params.id;
    try{
        const orderDetails = await orderSchema.findOne({ _id : order_id})
        res.render('user/orderDetail',{ title:"Order view" , orderDetails , user })
    }
    catch(error){
        console.log(`Error while render Order view page in user ${error}`)
        res.redirect('/user/order')
    }
}


module.exports = { orderPage , cancelOrder , orderDetail}