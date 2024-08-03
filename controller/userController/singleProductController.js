const userSchema = require('../../model/userSchema')
const productSchema = require('../../model/productSchema')
const orderSchema = require('../../model/orderSchema')
const walletSchema = require('../../model/walletSchema');
const couponSchema = require('../../model/couponSchema');



const  Checkout = async (req,res)=>{
    try{
        const productId = req.params.id
        if (!req.session.user) {
            req.flash('error',"user is not Found , Login Again")
            return res.redirect('/login');
        }
        
        const userId = req.session.user;
        const user = await userSchema.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        
        let wallet = await walletSchema.findOne({ userID: userId });

        if (!wallet) {
            wallet = { balance: 0, transaction: [] };
        }
        const product = await productSchema.findById(productId)

        if(product.productQuantity <= 0){
            req.flash("error", "Product is out of Stock " )
            res.redirect('/home')
        }else if (product.isActive !== true ){
            req.flash("error","Product is not Available right now")
            res.redirect("home")
        }
        
        res.render('user/singleCheckout', {
            title: 'Checkout',
            user,
            product,
            userDetails: user,
            wallet
        });
    }catch(error){
        console.error(`Error while rendering the checkout page: ${error}`);
        res.status(500).send('An error occurred while processing your request');
    }
}


const singleOrder = async (req, res) => {
    try {
        const userId = req.session.user;
        const addressIndex = parseInt(req.params.address);
        const paymentMode = parseInt(req.params.payment);
        const productId = req.params.id;
        let couponDiscount = 0;
        let paymentId = "";

        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, payment_status, couponCode } = req.body;

        if (couponCode) {
            const coupon = await couponSchema.findOne({ code: couponCode });
            if (coupon && coupon.isActive) {
                couponDiscount = coupon.discountValue;
            }
        }

        if (paymentMode === 2) {
            paymentId = razorpay_payment_id;
        }

        const product = await productSchema.findById(productId);
        if (!product) {
            console.error(`Product not found for ID: ${productId}`);
            return res.status(400).json({ success: false, message: 'Your product is empty or could not be found.' });
        }

        const paymentDetails = ["Cash on delivery", "Wallet", "razorpay"];
        if (paymentDetails[paymentMode] === 'Cash on delivery') {
            if (product.productPrice > 1000) {
                return res.status(400).json({ success: false, message: 'COD below 1000 only.' });
            }
        }

        const userDetails = await userSchema.findById(userId);
        if (!userDetails || !userDetails.address || !userDetails.address[addressIndex]) {
            return res.status(400).json({ success: false, message: 'Selected address is not valid.' });
        }

        const newOrder = new orderSchema({
            customer_id: userId,
            order_id: Math.floor(Math.random() * 1000000),
            products: [{
                product_id: product._id,
                product_name: product.productName,
                product_category: product.productCollection,
                product_quantity: 1,
                product_price: product.productPrice,
                product_discount: product.productDiscount,
                product_image: product.productImage[0],
                product_status: 'Confirmed'
            }],
            totalQuantity: 1,
            totalPrice: product.productPrice - product.productPrice * (product.productDiscount /100),
            couponDiscount: couponDiscount,
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

        if (paymentDetails[paymentMode] === 'Wallet') {
            const wallet = await walletSchema.findOne({ userID: userId });
            if (!wallet || wallet.balance < product.productPrice) {
                return res.status(400).json({ success: false, message: 'Insufficient wallet balance.' });
            }
            wallet.balance -= product.productPrice;
            wallet.transaction.push({
                wallet_amount: product.productPrice,
                transactionType: 'Debited',
                transaction_date: new Date(),
                order_id: newOrder.order_id,
            });
            await wallet.save();
        }

        product.productQuantity -= 1;
        if (product.productQuantity < 0) {
            product.productQuantity = 0;
        }
        await product.save();

        return res.status(200).json({ success: true, message: 'Order placed successfully!' });
    } catch (err) {
        console.error(`Error on place order ${err}`);
        return res.status(500).json({ success: false, message: `Error on placing order: ${err.message}` });
    }
};

const coupon = async (req, res) => {
    try {
        const couponName = req.body.couponCode;

        const total = req.body.totalAmount;
        const userId = req.session.user;

        if (!userId) {
            req.flash('error', "User is not found, please login again");
            return res.redirect('/login');
        };

        const coupon = await couponSchema.findOne({ code: couponName });
        if (!coupon) {
            return res.status(404).json({ error: "Coupon not found" });
        };

        if (!coupon.isActive || coupon.expiryDate < new Date()) {
            return res.status(400).json({ error: "Coupon expired" });
        };

        let discountedTotal = total;

        if (total < coupon.minimumOrderAmount) {
            return res.status(400).json({ error: "Minimum purchase limit not reached." });
        };

        const couponDiscount = coupon.discountValue;

        if (coupon.discountType === "Fixed") {
            discountedTotal = total - couponDiscount;
        } else if (coupon.discountType === "Percentage") {
            const discountAmount = (couponDiscount / 100) * total;
            discountedTotal = total - discountAmount;
        };

        res.status(200).json({ total: discountedTotal, couponDiscount });
    } catch (err) {
        console.log(`Error in apply coupon: ${err}`);
        res.status(500).json({ error: "An error occurred while applying the coupon." });
    }
};




module.exports = { Checkout , singleOrder , coupon  }