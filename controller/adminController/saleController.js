const orderSchema = require('../../model/orderSchema');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const salePage =async (req,res)=>{
    try{
        const orderCount = await orderSchema.countDocuments()
        const revenueResult = await orderSchema.aggregate([
            {$match: {orderStatus: { $in: ['Shipped', 'Confirmed', 'Delivered'] }}},
            {$group: {_id: null,total: { $sum: "$totalPrice" }}}]);

        const Revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
        const product = await orderSchema.aggregate([
            {$group: {_id: null,total: { $sum: "$totalQuantity" }}}]);

        const productCount = product.length > 0 ? product[0].total : 0;
        res.render('admin/salesReport',{title:"Sales Report" , Revenue , productCount , orderCount })
    }catch(error){
        console.log(`error while render sale report ${error}`)
    }
}



const getSalesByMonth = async (req, res) => {
    try {
        const sales = await orderSchema.aggregate([
            { $match: { orderStatus: { $in: ['Confirmed', 'Delivered', 'Shipped', 'Pending'] } } },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    totalSales: { $sum: "$totalPrice" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);
        res.json(sales);
    } catch (error) {
        console.log(`error in get sales by month ${error}`);
        res.json(error);
    }
};

const getOrderDetails = async (req, res) => {
    let { startDate, endDate, salesreportType } = req.body;
    let orderDetails;
    let match = {};
    
    try {
        if (!salesreportType) {
            orderDetails = await orderSchema.aggregate([
                {
                    $lookup: {
                        from: 'coupons',
                        localField: 'coupen_id',
                        foreignField: '_id',
                        as: 'coupen_data'
                    }
                },
                {
                    $sort: { createdAt: -1 }
                }
            ])
        } else {
            const now = new Date();
            if (salesreportType === 'custom') {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
            
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
            
                match = {
                    createdAt: { $gte: start, $lte: end }
                };
            } else if (salesreportType === 'monthly') {
                endDate = new Date();
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                match = { createdAt: { $gte: startDate, $lte: endDate} };
            } else if (salesreportType === 'yearly') {
                endDate = new Date();
                startDate = new Date(now.getFullYear(), 0, 1);
                match = { createdAt: { $gte: startDate, $lte: endDate } };
            } else if (salesreportType === 'weekly') {
                endDate = new Date();
                const currentDate = new Date();
                const diff = currentDate.getDate() - currentDate.getDay();
                startDate = new Date(currentDate.setDate(diff));
                match = { createdAt: { $gte: startDate, $lte: endDate } };
            }

            orderDetails = await orderSchema.aggregate([
                { $match: match },
                {
                    $lookup: {
                        from: 'coupons',
                        localField: 'coupen_id',
                        foreignField: '_id',
                        as: 'coupen_data'
                    }
                },
                {
                    $sort: { createdAt: -1 }
                }
            ])
        }
        res.json(orderDetails);
    } catch (error) {
        console.log(`error while render the order details ${error}`);
        res.status(400).json(err);
    }
};

// ----------------------------- downloading report --------------------------- 

const downloadPDF = async (req, res) => {
    const { salesreportType, startDate, endDate ,reportType } = req.body;
    let match = {};
    if (salesreportType !== "") {
        match = {
            createdAt: { $lte: new Date(endDate), $gte: new Date(startDate) },
        };
    }

    try {
        let orderDetails = await orderSchema.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: 'coupons',
                    localField: 'coupen_id',
                    foreignField: '_id',
                    as: 'coupen_data'
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        if (orderDetails.length > 0) {
            console.log(reportType,"reportType")
            if(reportType === 'PDF')
            await generatePdf(orderDetails, res);
            else if(reportType === 'EXCEL')
            {
                await generateExcel(orderDetails, res);
            }
        } else {
            res.status(404).json({ message: "No orders found for the specified period." });
        }
    } catch (error) {
        console.log(`error while download pdf ${error}`);
        res.status(500).json({ message: err.message });
    }
}

const generateExcel = async (orders, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    worksheet.columns = [
        { header: "ORDER ID", key: "orderId", width: 15 },
        { header: "CUSTOMER", key: "customer", width: 25 },
        { header: "ADDRESS", key: "address", width: 30 },
        { header: "QUANTITY", key: "quantity", width: 10 },
        { header: "AMOUNT", key: "amount", width: 15 },
        { header: "PAYMENT", key: "payment", width: 15 },
        { header: "COUPON", key: "coupon", width: 18 },
        { header: "TIME", key: "time", width: 20 },
        { header: "STATUS", key: "status", width: 15 }
    ];

    let totalSale = 0;
    let totalOrders = 0;

    for (const order of orders) {
        const orderId = order.order_id;
        const customer = order.address.customer_name;
        const address = `${order.address.building}, ${order.address.street}, ${order.address.city}, ${order.address.country} - ${order.address.pincode}`;
        const quantity = order.totalQuantity;
        const amount = order.totalPrice;
        const payment = order.paymentMethod;
        const coupon = order.coupen_data.length > 0 ? order.coupen_data[0].coupen_name : 'No Coupon';
        const time = order.createdAt.toLocaleDateString();
        const status = order.orderStatus;

        worksheet.addRow({
            orderId,
            customer,
            address,
            quantity,
            amount,
            payment,
            coupon,
            time,
            status
        });

        totalSale += order.totalPrice;
        totalOrders++;
    }
    worksheet.addRow({});
    const totalRow = worksheet.addRow({
        orderId: "Total",
        customer: "",
        address: "",
        quantity: "",
        amount: totalSale.toFixed(2),
        payment: "",
        coupon: "",
        time: "",
        status: `Total Orders: ${totalOrders}`
    });
    totalRow.eachCell((cell) => {
        cell.font = { bold: true };
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const excelBuffer = Buffer.from(buffer);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=sales-report.xlsx");
    res.send(excelBuffer);
};

async function generatePdf(orders, res) {
    const totalOrders = orders.length;
    const totalRevenue = orders
        .filter(order => order.status !== 'pending' && order.status !== 'cancelled' && order.status !== 'returned')
        .reduce((acc, curr) => acc + curr.totalPrice, 0);

    const doc = new PDFDocument();

    const filename = 'sales-report.pdf';

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    doc.font("Helvetica-Bold").fontSize(26).text("WUZZYS TOYS", { align: "center", margin: 5 });

    doc.moveDown();

    doc.fontSize(10).fillColor("red").text(`Total Revenue : Rs ${totalRevenue.toFixed(2)}`);
    doc.fontSize(10).fillColor("black").text(`Total Orders : ${totalOrders}`);

    doc.moveDown();

    doc.font("Helvetica-Bold").fillColor("black").fontSize(14).text(`Sales Report`, { align: "center", margin: 5 });

    doc.moveDown();

    const tableData = {
        headers: [
            'ORDER ID',
            'CUSTOMER',
            'QUANTITY',
            'AMOUNT',
            'PAYMENT',
            'COUPON',
            'TIME',
            'STATUS'
        ],
        rows: orders.map((order) => {
            return [
                order.order_id,
                order.address.customer_name,
                order.totalQuantity,
                order.totalPrice,
                order.paymentMethod,
                order.coupen_data.length > 0 ? order.coupen_data[0].coupen_name : 'No Coupon',
                order.createdAt.toLocaleDateString(),
                order.orderStatus
            ];
        })
    };
    try {
        await generateTable(doc, tableData);
    } catch (error) {
        console.error('Error generating table:', error);
    }
    doc.end();
}
function generateTable(doc, tableData) {
    const { headers, rows } = tableData;
    
    const columnWidths = [60, 100, 60, 60, 70, 80, 70, 100, 100];
    
    const tableTop = 200;
    const rowHeight = 20;
    
    const itemTop = (index) => tableTop + (index + 1) * rowHeight;
    
    doc.font('Helvetica-Bold');
    headers.forEach((header, i) => {
        doc.fontSize(10).text(header, 10 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), tableTop);
    });
    doc.font('Helvetica');
    rows.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            doc.fontSize(8).text(cell, 5 + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0), itemTop(rowIndex));
        });
    });
}
function dateFormat(inputDate) {
    const formated = new Date(inputDate);
    const options = { year: "numeric", month: "short", day: "numeric" };
    const formattedDate = formated.toLocaleDateString("en-US", options);
    return formattedDate;
}


module.exports = {salePage , getSalesByMonth , generateExcel , downloadPDF , getOrderDetails}