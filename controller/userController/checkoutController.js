const productSchema = require('../../model/productSchema')
const cartSchema = require('../../model/cartSchema')
const userSchema = require('../../model/userSchema')
const addressSchema = require('../../model/addressSchema')
const orderSchema = require('../../model/orderSchema')
const mongoose = require('mongoose')


//--------------------------------- checkout page render -----------------------------------

const checkout = async (req, res) => {
    try {
        if (!req.session.user) {
            req.flash('error',"user is not Found , Login Again")
            return res.redirect('/user/login');
        }
        const userId = req.session.user;
        const user = await userSchema.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        const cartDetails = await cartSchema.findOne({ userId }).populate("items.productId");
        if (!cartDetails) {
            return res.status(404).send('Cart not found');
        }
        const items = cartDetails.items;
        if (items.length === 0) {
            return res.redirect('/user/cart');
        }
        res.render('user/checkOut', {
            title: 'Checkout',
            user,
            cartDetails,
            userDetails: user
        });
    } catch (err) {
        console.error(`Error while rendering the checkout page: ${err}`);
        res.status(500).send('An error occurred while processing your request');
    }
};


//--------------------------------- checkout orderplace -----------------------------------

const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user;
        const addressIndex = parseInt(req.params.address);
        const paymentMode = parseInt(req.params.payment);
        let paymentId = "";
        const cartItems = await cartSchema.findOne({ userId }).populate("items.productId");
        if (!cartItems || !cartItems.items || cartItems.items.length === 0) {
            req.flash('error', 'Your cart is empty or could not be found.');
            return res.redirect('/user/cart');
        }
        const paymentDetails = ["Cash on delivery", "razorpay", "Wallet"];
        const products = [];
        let totalQuantity = 0;
        cartItems.items.forEach((item) => {
            products.push({
                product_id: item.productId._id,
                product_name: item.productId.productName,
                product_category: item.productId.productCategory,
                product_quantity: item.productCount,
                product_price: item.productId.productPrice,
                product_image: item.productId.productImage[0],
                product_status: 'Confirmed'
            });
            totalQuantity += item.productCount;
        });
        const userDetails = await userSchema.findById(req.session.user);
        if (!userDetails || !userDetails.address || !userDetails.address[addressIndex]) {
            req.flash('error', 'Selected address is not valid.');
            return res.redirect('/user/cart');
        }
        const newOrder = new orderSchema({
            customer_id: req.session.user,
            order_id: Math.floor(Math.random() * 1000000),
            products: products,
            totalQuantity: totalQuantity,
            totalPrice: cartItems.payableAmount,
            address: {
                customer_name: req.body.customer_name,
                customer_email: userDetails.email,
                building: userDetails.address[addressIndex].building,
                street: userDetails.address[addressIndex].street,
                city: userDetails.address[addressIndex].city,
                country: userDetails.address[addressIndex].country,
                pincode: userDetails.address[addressIndex].pincode,
                phonenumber: userDetails.address[addressIndex].phoneNumber,
                landMark: userDetails.address[addressIndex].landmark
            },
            paymentMethod: paymentDetails[paymentMode],
            orderStatus: "Confirmed",
            paymentId: paymentId,
            isCancelled: false
        });
        await newOrder.save();
        for (const element of cartItems.items) {
            const product = await productSchema.findById(element.productId._id);
            if (product) {
                product.productQuantity -= element.productCount;
                if (product.productQuantity < 0) {
                    product.productQuantity = 0;
                }
                await product.save();
            }
        }
        await cartSchema.deleteOne({ userId: req.session.user });

        res.redirect('/user/conform-order');
    } catch (err) {
        console.log(`Error on place order ${err}`);
        req.flash('error', `Error on placing order ${err}`);
        return res.redirect('/user/cart');
    }
};



const addAddress = async (req, res) => {
    try {
        const userAddress = {
            building:req.body.building,
            street:req.body.street,
            city:req.body.city,
            phonenumber:req.body.phonenumber,
            pincode:req.body.pincode,
            landmark:req.body.landmark,
            state:req.body.state,
            country:req.body.country
        }
        const user = await userSchema.findById(req.session.user)
        if (user.address.length > 3) {
            req.flash("errorMessage", "Maximum Address limit Reached")
            return res.redirect('/user/profile')
        }
        user.address.push(userAddress);
        await user.save();

        req.flash('success', 'New address added')
        res.redirect('/user/checkout')
    } catch (err) {
        console.log(`Error on adding new address from checkout ${err}`);
    }
}


//---------------------------------- Order Successfull page ------------

const orderPage = async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await userSchema.findById(userId);

        const orders = await orderSchema.findOne({ customer_id: user._id }).sort({createdAt : -1}).limit(1)

        res.render('user/conform-order', { title: "Order conformed", orders: orders });
    } catch (err) {
        console.log(`Error on render in conform order ${err}`);
        req.flash('success',"user is not found , please Login again")
        res.redirect("/user/login")
    }
}



module.exports = { checkout , placeOrder ,addAddress , orderPage };

