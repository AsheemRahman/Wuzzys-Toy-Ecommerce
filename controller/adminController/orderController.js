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



// const orderStatus = async (req, res, status, paymentStatus = null) => {
//     try {
//         const orderId = req.params.id;

//         // Prepare the update object
//         const updateData = { status };
//         if (paymentStatus) {
//             updateData.paymentStatus = paymentStatus;
//         }

//         // Update order status in MongoDB
//         const updatedOrder = await orderSchema.findByIdAndUpdate(orderId, {
//             $set: updateData}, { new: true });

//         // Check if order is updated successfully
//         if (!updatedOrder) {
//             return res.status(404).json({ msg: "Order not found" });
//         }

//         // Send response
//         res.status(200).json({ success: true, message: `Order status updated to ${status}` });
//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({ msg: "Internal server error" });
//     }
// };

// const statusShipped = (req, res) => {
//     updateOrderStatus(req, res, "Shipped");
// };

// const statusDelivered = (req, res) => {
//     updateOrderStatus(req, res, "Delivered", "Completed");
// };



module.exports = { orderpage  , orderView }