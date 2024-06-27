const productSchema = require('../../model/productSchema')
const cartSchema = require('../../model/cartSchema')

const { ObjectId } = require('mongodb');

//------------------------------------ cart page -----------------------------------

const cart = async (req, res) => {
    if (!req.session.user) {
        req.flash('error', "User is Not Found , Please Login Again"  )
        return res.redirect('/user/login');
    }
    try {
        const cart = await cartSchema.findOne({ userId: req.session.user }).populate('items.productId')
        var totalPrice = 0;
        var totalPriceWithOutDiscount = 0;
        var cartItemCount = 0;
        if (cart) {
            cart.items.forEach((ele) => {
                if (ele.productId.productDiscount === 0) {
                    totalPrice += (ele.productId.productPrice * ele.productCount);
                    totalPriceWithOutDiscount += (ele.productId.productPrice * ele.productCount);
                }
                else {
                    const discountPrice = (ele.productId.productPrice * ele.productCount) - ((ele.productId.productDiscount / 100) * (ele.productId.productPrice * ele.productCount))
                    totalPrice += discountPrice
                    totalPriceWithOutDiscount += (ele.productId.productPrice * ele.productCount)
                }
                cartItemCount += ele.productCount
            })
            if (cart.payableAmount != totalPrice || cart.totalPrice != totalPriceWithOutDiscount) {
                cart.payableAmount = Math.round(totalPrice);
                cart.totalPrice = Math.round(totalPriceWithOutDiscount);
            }
            await cart.save();
        }
        res.render('user/cart', { title: "cart", cart, totalPrice, cartItemCount, totalPriceWithOutDiscount, alertMessage: req.flash('error'), user: req.session.user })
    } catch (err) {
        console.log(`error rendering in the cart ${err}`)
    }
}

//------------------------------ add product to cart -----------------------------

const addToCartPost = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.user;
        const productPrice = parseInt(req.query.price);
        const productQuantity = 1;
        const actualProductDetails = await productSchema.findById(productId);
        if (actualProductDetails.productQuantity <=0) {
            return res.status(404).json({ error: "Product is out of stock" })
        }
        const checkCart = await cartSchema.findOne({ userId: req.session.user }).populate('items.productId');
        if (checkCart) {
            let productExist = false;
            checkCart.items.forEach((ele) => {
                if (ele.productId.id === productId) {
                    productExist = true;
                    return res.status(404).json({ error: "Product is already in the cart" })
                }
            });
            if (!productExist) {
                checkCart.items.push({ productId: actualProductDetails._id, productCount: 1, productPrice: productPrice });
            }
            await checkCart.save();
        }
        else {
            const newCart = new cartSchema({
                userId: userId,
                items: [{ productId: actualProductDetails._id, productCount: 1, productPrice: productPrice }]
            });
            await newCart.save();
        }
        return res.status(200).json({ message: "Product added to cart" })    }
    catch (err) {
        console.log(`Error during adding product to cart: ${err}`);
    }
}


//--------------------------------------- Remove cart item ---------------------------------

const removeItem = async (req, res) => {
    const userId = req.session.user;
    const itemId = req.params.id;

    // Validate itemId
    if (!itemId || !ObjectId.isValid(itemId)) {
        req.flash('error', 'Invalid item ID.');
        return res.redirect("/user/cart");
    }
    
    try {
        const cart = await cartSchema.findOne({ userId: userId });

        if (cart) {
            // Pull the item from the cart
            cart.items.pull({ productId: new ObjectId(itemId) });
            await cart.save();

            req.flash('success', 'Item Removed from Cart');
        } else {
            console.log('No cart found for the specified user.');
            req.flash('error', 'Cart not found.');
        }
    } catch (err) {
        req.flash('error', 'Something went wrong, Please try again later.');
        console.error(`Error in removing the item from cart: ${err}`);
    }
    res.redirect("/user/cart");
};

const CartQuantity = async (req, res) => {
    try {
        const user = await userBase.findOne({ email: req.session.user });
        if (!user) {
            return res.status(400).json({ message: 'User not found', status: 'error' });
        }

        const { productId, quantity } = req.body;
        const cart = await Cart.findOne({ user: user._id });
        if (cart) {
            const item = cart.items.find(item => item.productId.equals(productId));
            if (item) {
                item.quantity = quantity;
                await cart.save();
                res.json({ message: 'Cart updated', status: 'updated' });
            } else {
                res.status(404).json({ message: 'Product not found in cart', status: 'error' });
            }
        } else {
            res.status(400).json({ message: 'Cart not found', status: 'error' });
        }
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).json({ error: 'Failed to update cart quantity', details: error.message });
    }
};



module.exports = {
    cart,
    addToCartPost,
    removeItem,
    CartQuantity
}