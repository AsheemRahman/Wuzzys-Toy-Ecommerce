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
            // find the total price of cart items
            cart.items.forEach((ele) => {
                // if the product has not discount then
                if (ele.productId.productDiscount === 0) {
                    totalPrice += (ele.productId.productPrice * ele.productCount);
                    totalPriceWithOutDiscount += (ele.productId.productPrice * ele.productCount);
                }
                //if the product has discount
                else {
                    const discountPrice = (ele.productId.productPrice * ele.productCount) - ((ele.productId.productDiscount / 100) * (ele.productId.productPrice * ele.productCount))
                    totalPrice += discountPrice
                    totalPriceWithOutDiscount += (ele.productId.productPrice * ele.productCount)
                }
                cartItemCount += ele.productCount
            })
            // if the totalPrice and payable amount in the cart and the calculated total price is different then update the collection with the new values
            if (cart.payableAmount != totalPrice || cart.totalPrice != totalPriceWithOutDiscount) {
                cart.payableAmount = Math.round(totalPrice);
                cart.totalPrice = Math.round(totalPriceWithOutDiscount);
            }
            await cart.save();
            res.render('user/cart', { title: "cart", cart, totalPrice, cartItemCount, totalPriceWithOutDiscount, alertMessage: req.flash('error'), user: req.session.user })
        }
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
        // const productQuantity = 1;
        // Find the product from the collection
        const actualProductDetails = await productSchema.findById(productId);
        if (actualProductDetails.productQuantity <=0) {
            return res.status(404).json({ error: "Product is out of stock" })
        }
        // Check if the user already has a cart
        const checkUserCart = await cartSchema.findOne({ userId: req.session.user }).populate('items.productId');
        if (checkUserCart) {
            let productExist = false;
            // Check if the product already exists in the cart
            checkUserCart.items.forEach((ele) => {
                if (ele.productId.id === productId) {
                    productExist = true;
                    return res.status(404).json({ error: "Product is already in the cart" })
                }
            });
            if (!productExist) {
                checkUserCart.items.push({ productId: actualProductDetails._id, productCount: 1, productPrice: productPrice });
            }
            await checkUserCart.save();
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


const increment = async (req, res) => {
    try {
        const productId = req.params.productId;
        const productQuantity = req.body.quantity;

        if (!productQuantity) {
            return res.status(400).json({ error: "Product quantity not provided" });
        }

        const product = await productSchema.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (productQuantity >= product.productQuantity) {
            return res.status(400).json({ error: "Insufficient product stock" });
        }

        const cart = await cartSchema.findOne({ userId: req.session.user }).populate('items.productId');
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const productCart = cart.items.find(item => item.productId.id === productId);
        if (!productCart) {
            return res.status(404).json({ error: "Product not in cart" });
        }

        productCart.productCount += 1;

        let totalPrice = 0;
        let totalPriceWithoutDiscount = 0;
        cart.items.forEach(item => {
            totalPriceWithoutDiscount += item.productId.productPrice * item.productCount;
            totalPrice += item.productId.productDiscountPrice * item.productCount;
        });

        cart.payableAmount = Math.round(totalPrice);
        cart.totalPrice = Math.round(totalPriceWithoutDiscount);
        await cart.save();

        const savings = totalPriceWithoutDiscount - totalPrice;
        return res.status(200).json({
            productCount: productCart.productCount,
            productTotal: productCart.productCount * product.productDiscountPrice,
            total: totalPrice,
            subTotal: totalPriceWithoutDiscount,
            savings: savings,
        });
    } catch (err) {
        console.error(`Error incrementing product quantity: ${err}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const decrement = async (req, res) => {
    try {
        const productId = req.params.productId;
        const productQuantity = req.body.quantity;

        if (!productQuantity) {
            return res.status(400).json({ error: "Product quantity not provided" });
        }

        const cart = await cartSchema.findOne({ userId: req.session.user }).populate('items.productId');
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const productCart = cart.items.find(item => item.productId.id === productId);
        if (!productCart) {
            return res.status(404).json({ error: "Product not in cart" });
        }

        if (productCart.productCount <= 1) {
            return res.status(400).json({ error: "Cannot decrement product quantity below 1" });
        }

        productCart.productCount -= 1;

        let totalPrice = 0;
        let totalPriceWithoutDiscount = 0;
        cart.items.forEach(item => {
            totalPriceWithoutDiscount += item.productId.productPrice * item.productCount;
            totalPrice += item.productId.productDiscountPrice * item.productCount;
        });

        cart.payableAmount = Math.round(totalPrice);
        cart.totalPrice = Math.round(totalPriceWithoutDiscount);
        await cart.save();

        const savings = totalPriceWithoutDiscount - totalPrice;
        return res.status(200).json({
            productCount: productCart.productCount,
            productTotal: productCart.productCount * productCart.productId.productDiscountPrice,
            total: totalPrice,
            subTotal: totalPriceWithoutDiscount,
            savings: savings,
        });
    } catch (err) {
        console.error(`Error decrementing product quantity: ${err}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};




module.exports = {
    cart,
    addToCartPost,
    removeItem,
    increment,
    decrement
}