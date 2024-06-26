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
        
        const orderDetails = await orderSchema.find({ customer_id: user, isCancelled: false })
            .populate("products.product_id")
            // .sort({ createdAt: -1 })
            // .exec();

        const orderCount = orderDetails.length;

        res.render("user/orders", {
            title: "Orders",
            user,
            orderDetails,
            orderCount
        });
    } catch (err) {
        console.error(`Error rendering the order page: ${err}`);
        req.flash("error", "Error rendering the order page, please try again later.");
        res.redirect("/user/home");
    }
};




module.exports = {orderPage}