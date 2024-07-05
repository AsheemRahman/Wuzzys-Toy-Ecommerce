const orderSchema = require('../../model/orderSchema')

//----------------------------- order page render -------------------------------

const orderpage = async (req, res) => {
    try {
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;

        let query = {};

        if (search) {
            const searchNumber = Number(search);
            if (!isNaN(searchNumber)) {
                query.order_id = searchNumber;
            }
        }
        const orders = await orderSchema.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        const count = await orderSchema.countDocuments(query);

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
    }
}

// ------------------------- Show Single order details ---------------------------

const orderView = async (req,res) =>{
    const order_id = req.params.id;
    try{
        const orderDetails = await orderSchema.findOne({ _id : order_id})
        res.render('admin/order-view',{title:"View Order" , orderDetails})
    }
    catch(error){
        console.log(`Error while render Order view page ${error}`)
        res.redirect('/admin/order')
    }
}


// ---------------------------------- status change ------------------------------

const orderStatus=async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Shipped', 'Confirmed', 'Delivered', 'Cancelled', 'Returned'];
        const currentOrder = await orderSchema.findOne({_id:orderId});

        if (!currentOrder) {
            return res.status(404).send('Order not found');
        }
        // Prevent status change to previous statuses
        if (validStatuses.indexOf(status) <= validStatuses.indexOf(currentOrder.status)) {
            return res.status(400).send('Invalid status change');
        }
        currentOrder.orderStatus = status;
        await currentOrder.save();

        res.send('Order status updated');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
}



module.exports = { orderpage  , orderView , orderStatus }