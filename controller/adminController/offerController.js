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
        if (!offerType || !referenceId || !discountPercent) {
            req.flash('error', 'All fields are required');
            return res.redirect('/admin/offer');
        }

        const offerExists = await offerSchema.findOne({ referenceId });
        if (offerExists) {
            req.flash('error', 'Offer Already Exists');
            return res.redirect('/admin/offer');
        }

        const newOffer = new offerSchema({ offerType, referenceId, discountPercent });
        await newOffer.save();

        req.flash("success", "Offer successfully added");
        res.redirect("/admin/offer");
    } catch (error) {
        console.log(`Error from addOffer: ${error}`);
        req.flash('error', 'An error occurred while adding the offer');
        res.redirect('/admin/offer');
    }
}

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
