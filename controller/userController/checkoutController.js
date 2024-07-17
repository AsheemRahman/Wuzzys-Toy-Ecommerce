const productSchema = require('../../model/productSchema')
const cartSchema = require('../../model/cartSchema')
const userSchema = require('../../model/userSchema')
const addressSchema = require('../../model/addressSchema')
const orderSchema = require('../../model/orderSchema')
const walletSchema = require('../../model/walletSchema');
const couponSchema = require('../../model/couponSchema');
const mongoose = require('mongoose')
const Razorpay = require('razorpay')


//--------------------------------- checkout page render -----------------------------------

const checkout = async (req, res) => {
    try {
        if (!req.session.user) {
            req.flash('error',"user is not Found , Login Again")
            return res.redirect('/login');
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
            return res.redirect('/cart');
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
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, payment_status } = req.body;

        if (paymentMode === 2) {
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
                product_discount:item.productId.productDiscount,
                product_image: item.productId.productImage[0],
                product_status: 'Confirmed'
            });
            totalQuantity += item.productCount;
        });

        const userDetails = await userSchema.findById(req.session.user);
        if (!userDetails || !userDetails.address || !userDetails.address[addressIndex]) {
            return res.status(400).json({ success: false, message: 'Selected address is not valid.' });
        }
        if(paymentDetails[paymentMode] === 'Wallet'){
            const wallet = await walletSchema.findOne({ userID: userId });
            if(cartItems.payableAmount > 1000){
                return res.status(400).json({ success: false, message: 'COD below 1000 only.' });
            }
            if (!wallet || wallet.balance < cartItems.payableAmount) {
                return res.status(400).json({ success: false, message: 'Insufficient wallet balance.' });
            }
            wallet.balance -= cartItems.payableAmount;
            wallet.transaction.push({
                wallet_amount: cartItems.payableAmount,
                transactionType: 'Debited',
                transaction_date: new Date(),
                order_id: new mongoose.Types.ObjectId(),
            });
        await wallet.save();
        }

        const newOrder = new orderSchema({
            customer_id: req.session.user,
            order_id: Math.floor(Math.random() * 1000000),
            products: products,
            totalQuantity: totalQuantity,
            totalPrice: cartItems.payableAmount,
            address: {
                customer_name: userDetails.name,
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
            orderStatus: payment_status === "Pending" ? "Pending" : "Confirmed",
            paymentId: paymentId,
            paymentStatus: payment_status,
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
        return res.status(200).json({ success: true, message: 'Order placed successfully!' });
    } catch (err) {
        console.error(`Error on place order ${err}`);
        return res.status(500).json({ success: false, message: `Error on placing order: ${err.message}` });
    }
};


const paymentRender = (req, res) => {
    try {
        const totalAmount = req.params.amount;
        if (!totalAmount) {
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

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.error(`Failed to create order: ${error}`);
                return res.status(500).json({ error: `Failed to create order: ${error.message}` });
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
            return res.redirect('/profile')
        }
        user.address.push(userAddress);
        await user.save();

        req.flash('success', 'New address added')
        res.redirect('/checkout')
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
    }
}

//------------------------------ failed order page ---------------------------

const failedOrder = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            req.flash('error', 'USER is not found. Login again.');
            return res.redirect('/login');
        }
        res.render('user/Failed-order', { title: "Order Failed" });
    } catch (error) {
        console.log(`Error while rendering the failed order page`, error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


//---------------------------------- coupon -----------------------------------

const coupon = async (req, res) => {
    try {
        const couponName = req.body.couponCode;
        const userId = req.session.user;

        if (!userId) {
            req.flash('error', "User is not found, please login again");
            return res.redirect('/login');
        }

        const coupon = await couponSchema.findOne({ code: couponName });
        if (!coupon) {
            return res.status(404).json({ error: "Coupon not found" });
        }

        if (!coupon.isActive || coupon.expiryDate < new Date()) {
            return res.status(400).json({ error: "Coupon expired" });
        }

        const cart = await cartSchema.findOne({ userId });
        if (!cart) {
            return res.status(400).json({ error: "Cart not found" });
        }

        const total = cart.payableAmount;
        let discountedTotal = total;

        if (total < coupon.minimumOrderAmount) {
            return res.status(400).json({ error: "Minimum purchase limit not reached. Please add more items to your cart." });
        }

        const couponDiscount = coupon.discountValue;
        if (coupon.discountType === "Fixed") {
            discountedTotal = total - couponDiscount;
        } else if (coupon.discountType === "Percentage") {
            const discountAmount = (couponDiscount / 100) * total;
            discountedTotal = total - discountAmount;
        }

        cart.payableAmount = discountedTotal;
        await cart.save();
        res.status(200).json({ total: discountedTotal, couponDiscount });
    } catch (err) {
        console.log(`Error in apply coupon: ${err}`);
        res.status(500).json({ error: "An error occurred while applying the coupon." });
    }
};





module.exports = { checkout , placeOrder ,addAddress , orderPage , failedOrder ,  paymentRender , coupon};

