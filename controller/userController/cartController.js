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

//--------------------------------------- Quantity in cart ---------------------------------

const quantity = async (req, res) => {
    try {
        const productId = req.params.id;
        const action = req.query.action;
        const userId = req.session.user._id;
        
        // Fetch the user's cart
        const cart = await cartSchema.findOne({ userId });
        
        // Ensure cart exists
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        
        // Find the item in the cart
        let item = cart.items.find(item => item.productId.toString() === productId);
        
        // Ensure item exists in the cart
        if (!item) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }
        
        // Update quantity based on action
        if (action === "dec" && item.productCount > 1) {
            item.productCount--;
        } else if (action === "inc") {
            // Check maximum quantity and product stock availability
            const product = await productSchema.findById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            
            if (item.productCount >= 10) {
                return res.status(400).json({ error: 'Maximum quantity per person is 10' });
            }
            
            if (item.productCount < product.productQuantity) {
                item.productCount++;
            } else {
                return res.status(400).json({ error: 'Product is out of stock' });
            }
        }
        
        // Save the updated cart
        await cart.save();
        
        // Send success message
        res.status(200).json({ message: 'Quantity updated successfully' });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




module.exports = {
    cart,
    addToCartPost,
    removeItem,
    quantity
}