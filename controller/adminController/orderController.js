const orderSchema = require('../../model/orderSchema')

//----------------------------- order page render -------------------------------

const orderpage = async (req, res) => {
    try {
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;

        // Initialize query object
        let query = {};

        // Parse search query as a number if provided
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


const updateStatus = async (req, res) => {
    const { id: order_id, status } = req.params;
    if (!status) {
        req.flash('error',"Order status Cannot edit now , Try again later")
        return res.redirect('/admin/order');
    }
    try {
        const updateStatus = await orderCollection.findOneAndUpdate(
            { _id: new ObjectId(order_id) },
            { $set: { orderStatus: status } },
            { new: true }
        );

        req.flash('success',"Order Status Change Successfully")
    } catch (error) {
        console.log(`error while update order status ${error}`);
        req.flash('error',"Error while update order status")
    }
    res.redirect('/admin/order');
};


// ------------------------- Show Single order details --------------------------- 

const orderView = async (req,res) =>{
    const order_id = req.params.id;
    try{
        const orderDetails = await orderSchema.findOne({ _id : order_id})
        console.log(orderDetails)
        res.render('admin/order-view',{title:"View Order" , orderDetails})
    }
    catch(error){
        console.log(`Error while render Order view page ${error}`)
        res.redirect('/admin/order')
    }
}




module.exports = { orderpage ,updateStatus , orderView }