const offerSchema = require('../../model/offerSchema')
const categorySchema= require('../../model/categorySchema')
const productSchema = require('../../model/productSchema')


//-------------------------- offer page ----------------------------

const getOffer = async (req,res)=>{
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    
    try {
        const offers = await offerSchema.find({ offerType: { $regex: search, $options: 'i' } })
            .populate('referenceId')
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ updatedAt : -1 });

        const count = await offerSchema.countDocuments({ offerType: { $regex: search, $options: 'i' } });
        const products = await productSchema.find({isActive: true}).sort({createdAt: -1})
        const categories = await categorySchema.find({isActive: true}).sort({createdAt: -1})

        res.render('admin/offer',{
            title: "Offers",
            offers,
            products,
            categories,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            search,
            limit,page
        })
        
    } catch (error) {
        console.log(`error while render Offer Page ${error}`)
    }
}

const addOffer = async (req, res) => {
    try {
        const { offerType, referenceId, discountPercent } = req.body;

        // Check for missing fields
        if (!offerType || !referenceId || !discountPercent) {
            req.flash('error', 'All fields are required');
            return res.redirect('/admin/offer');
        }

        // Check for valid discount percent
        if (discountPercent > 98) {
            req.flash('error', 'Discount amount cannot exceed 98%');
            return res.redirect('/admin/offer');
        }

        // Check if the offer already exists
        const offerExists = await offerSchema.findOne({ referenceId });
        if (offerExists) {
            req.flash('error', 'Offer Already Exists');
            return res.redirect('/admin/offer');
        }

        if (offerType === 'category') {
            const category = await categorySchema.findById(referenceId);
            if (!category) {
                req.flash('error', 'Category not found');
                return res.redirect('/admin/offer');
            }

            // Delete existing category offers
            await offerSchema.deleteOne({ offerType: 'category', referenceId: category._id });

            // Add new category offer
            const newOffer = new offerSchema({
                offerType,
                referenceId: category._id,
                discountPercent,
            });
            await newOffer.save();

            // Update all products under this category
            const productsUnderCategory = await productSchema.find({ productCollection: category.collectionName });
            const bulkOperations = productsUnderCategory.map(product => ({
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        productDiscount: discountPercent,
                        productDiscountPrice: product.productPrice * (1 - (discountPercent / 100)),
                    },
                },
            }));

            if (bulkOperations.length > 0) {
                await productSchema.bulkWrite(bulkOperations);
            }

            req.flash('success', `Offer added for the products under ${category.collectionName}`);
        } else if (offerType === 'product') {
            const product = await productSchema.findById(referenceId);
            if (!product) {
                req.flash('error', 'Product not found');
                return res.redirect('/admin/offer');
            }

            // Delete existing product offers
            await offerSchema.deleteOne({ offerType: 'product', referenceId: product._id });

            // Add new product offer
            const newOffer = new offerSchema({
                offerType,
                referenceId: product._id,
                discountPercent,
            });
            await newOffer.save();

            // Update product discount and discount price
            product.productDiscount = discountPercent;
            product.productDiscountPrice = product.productPrice * (1 - (discountPercent / 100));
            await product.save();

            req.flash('success', `Offer added for the product ${product.productName}`);
        }
        res.redirect('/admin/offer');
    } catch (error) {
        console.error(`Error from addOffer: ${error}`);
        req.flash('error', 'An error occurred while adding the offer');
        res.redirect('/admin/offer');
    }
};



const editOffer = async (req, res) => {
    try {
        const { offerId, discountPercent } = req.body;
        if (!offerId || !discountPercent) {
            req.flash('error', 'All fields are required');
            return res.redirect('/admin/offer');
        }
        const offer = await offerSchema.findByIdAndUpdate(offerId, { discountPercent });
        if (offer) {
            req.flash('success', "Offer successfully edited");
        } else {
            req.flash('error', 'Offer not found');
        }
        res.redirect('/admin/offer');
    } catch (error) {
        console.log(`Error from editOffer: ${error}`);
        req.flash('error', 'An error occurred while editing the offer');
        res.redirect('/admin/offer');
    }
}


const offerStatus = async (req,res)=>{
    try {
        const offerId = req.query.id
        const status = !(req.query.status === 'true')

        const offer = await offerSchema.findByIdAndUpdate(offerId,{isActive: status})

        res.redirect('/admin/offer')
        
    } catch (error) {
        console.log(`error from orderStatus ${error}`)
    }
}

const deleteOffer = async (req,res)=>{
    try {
        const offerId = req.params.id
        const offer = await offerSchema.findByIdAndDelete(offerId)

        if(offer != null){
            req.flash('success','Offer successfully deleted'),
            res.redirect('/admin/offer')
        }else{
            req.flash('error','Offer unable to delete'),
            res.redirect('/admin/offer')
        }
    } catch (error) {
        console.log(`error from deleteOffer ${error}`)
    }

}


module.exports= {
    getOffer,
    addOffer,
    offerStatus,
    editOffer,
    deleteOffer
}