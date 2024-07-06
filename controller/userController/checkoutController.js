const productSchema = require('../../model/productSchema')
const cartSchema = require('../../model/cartSchema')
const userSchema = require('../../model/userSchema')
const addressSchema = require('../../model/addressSchema')
const orderSchema = require('../../model/orderSchema')
const walletSchema = require('../../model/walletSchema');
const mongoose = require('mongoose')
const Razorpay = require('razorpay')


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

        let wallet = await walletSchema.findOne({ userID: userId });

        if (!wallet) {
            wallet = { balance: 0, transaction: [] };
        }

        res.render('user/checkOut', {
            title: 'Checkout',
            user,
            cartDetails,
            userDetails: user,
            wallet
        });
    } catch (err) {
        console.error(`Error while rendering the checkout page: ${err}`);
        res.status(500).send('An error occurred while processing your request');
    }
};


//--------------------------------- checkout order place ----------------------------------

const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user;
        const addressIndex = parseInt(req.params.address);
        const paymentMode = parseInt(req.params.payment);
        let paymentId = "";

        if (paymentMode === 1) {
            const razorpay_payment_id = req.body.razorpay_payment_id;
            const razorpay_order_id = req.body.razorpay_order_id;
            const razorpay_signature = req.body.razorpay_signature;
            paymentId = razorpay_payment_id;
        }

        const cartItems = await cartSchema.findOne({ userId }).populate("items.productId");
        if (!cartItems || !cartItems.items || cartItems.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Your cart is empty or could not be found.' });
        }

        const paymentDetails = ["Cash on delivery", "Wallet", "razorpay"];
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
            return res.status(400).json({ success: false, message: 'Selected address is not valid.' });
        }
        const wallet = await walletSchema.findOne({ userID: userId });
        if (!wallet || wallet.balance < cartItems.payableAmount) {
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance.' });
        }
        if(paymentDetails[paymentMode] === 'Wallet'){
            wallet.balance -= cartItems.payableAmount;
            wallet.transaction.push({
                wallet_amount: cartItems.payableAmount,
                transactionType: 'Debited',
                transaction_date: new Date(),
                order_id: new mongoose.Types.ObjectId(),
        });
        }

        await wallet.save();

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
        return res.status(200)
    } catch (err) {
        console.error(`Error on place order ${err}`);
        return res.status(500).json({ success: false, message: `Error on placing order: ${err.message}` });
    }
};


const paymentRender = (req, res) => {
    try {
        const totalAmount = req.params.amount;
        
        if (!totalAmount) {
            console.error("Amount parameter is missing");
            return res.status(404).json({ error: "Amount parameter is missing" });
        }

        const instance = new Razorpay({
            key_id: "rzp_test_jyh8u3FB51sm3I",
            key_secret: "5Cz0sGy9qDgUqCLLieURAfkD"
        });

        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: "receipt#1"
        };

        instance.orders.create(options, (err, order) => {
            if (err) {
                console.error(`Failed to create order: ${err}`);
                return res.status(500).json({ error: `Failed to create order: ${err.message}` });
            }
            return res.status(200).json({ orderID: order.id });
        });
    } catch (err) {
        console.error(`Error on orders in checkout: ${err}`);
        return res.status(500).json({ error: 'Internal server error' });
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



module.exports = { checkout , placeOrder ,addAddress , orderPage ,  paymentRender};

