const Coupon = require('../../model/couponSchema');

//------------------------------------- Get all coupons ---------------------------

const getCoupons = async (req, res) => {
    try{
        const coupons = await Coupon.find({});
        res.render('admin/coupons', { coupons, title: 'Coupons' });
    }catch(error){
        console.log(`error while render coupon page ${error}`)
    }
};

//--------------------------------- Add a new coupon -----------------------------

const addCoupon = async (req, res) => {
    const { code, discountType, discountValue, startDate, endDate } = req.body;
    try {
        const newCoupon = new Coupon({ code, discountType, discountValue, startDate, endDate });
        await newCoupon.save();
        res.json({ message: 'Coupon added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding coupon' });
    }
};

//------------------------------------- Edit a coupon ----------------------------

const editCoupon = async (req, res) => {
    const { id, code, discountType, discountValue, startDate, endDate } = req.body;
    if (!id || !code || !discountType || !discountValue || !startDate || !endDate) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,{ code, discountType, discountValue, startDate, endDate },);
        if (!updatedCoupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json({ message: 'Coupon updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating coupon', error: error.message });
    }
};


//----------------------------- Toggle coupon status ----------------------------

const toggleCouponStatus = async (req, res) => {
    const couponId = req.query.id;
    const status = req.query.status === 'true';
    try {
        await Coupon.findByIdAndUpdate(couponId, { isActive: !status });
        req.flash('error','Coupon status updated successfully')
        res.redirect('/admin/coupons')
    } catch (error) {
        console.log(`Error while changing status: ${error}`);
        res.flash('error' ,'Error updating coupon status' );
    }
};

//--------------------------------- Delete a coupon ------------------------------

const deleteCoupon = async (req, res) => {
    const { id } = req.params;
    try {
        await Coupon.findByIdAndDelete(id);
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting coupon' });
    }
};



module.exports = { getCoupons , addCoupon , editCoupon , toggleCouponStatus , deleteCoupon}