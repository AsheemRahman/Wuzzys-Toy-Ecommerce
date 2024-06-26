const orderSchema = require('../../model/orderSchema')

//----------------------------- order page render -------------------------------

const orderpage = async (req, res) => {
    try {
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;

        const orders = await orderSchema.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        const count = await orderSchema.countDocuments({ name: { $regex: search, $options: 'i' } });

        res.render('admin/order', {
            title: 'Order Details',
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            search,
            limit
        });
    } catch (error) {
        console.log(`Error on rendering admin order details ${error}`);
        res.status(500).send('Internal Server Error');
    }
}



module.exports = { orderpage }