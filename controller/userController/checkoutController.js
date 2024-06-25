const productSchema = require('../../model/productSchema')
const cartSchema = require('../../model/cartSchema')
const userSchema = require('../../model/userSchema')
const addressSchema = require('../../model/addressSchema')


const checkout = async (req, res) => {
    try {
        if (!req.session.user) {
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

module.exports = { checkout };

