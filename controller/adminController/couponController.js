const Coupon = require('../../model/couponSchema');

// Get all coupons
const getCoupons = async (req, res) => {
    const coupons = await Coupon.find({});
    res.render('admin/coupons', { coupons, title: 'Coupons' });
};

// Add a new coupon
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

// Edit a coupon
const editCoupon = async (req, res) => {
    const { id, code, discountType, discountValue, startDate, endDate } = req.body;
    try {
        await Coupon.findByIdAndUpdate(id, { code, discountType, discountValue, startDate, endDate });
        res.json({ message: 'Coupon updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating coupon' });
    }
};

// Toggle coupon status
const toggleCouponStatus = async (req, res) => {
    const { id, isActive } = req.body;
    try {
        await Coupon.findByIdAndUpdate(id, { isActive });
        res.json({ message: 'Coupon status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating coupon status' });
    }
};

// Delete a coupon
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