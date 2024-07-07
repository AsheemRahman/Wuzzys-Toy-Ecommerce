const categorySchema = require('../../model/categorySchema')
const orderSchema = require('../../model/orderSchema')
const productSchema = require('../../model/productSchema')
const userSchema = require('../../model/userSchema')


//--------------------------- admin routes ------------------------------

const admin = (req,res)=>{
    try {
        res.redirect('/admin/login')
    } catch (error) {
        console.log(`error from admin ${error}`)
    }
}


//------------------------- login get request --------------------------

const login = (req,res)=>{
    try {
        if(req.session.admin){
            res.redirect('/admin/home')
        }else{
            res.render('admin/login',{title: "Login"})
        }
        
    } catch (error) {
        console.log(`error from admin login ${error}`)
    }
    
}


//--------------------- admin login post request ----------------------

const loginPost = (req,res)=>{
    try {
        if(req.body.email === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD ){
            req.session.admin = req.body.email
            res.redirect('/admin/home')
        }else{
            req.flash("error","Invalid Credentials")
            res.redirect('/admin/login')
        }
        
    } catch (error) {
        console.log(`error from login post ${error}`)
    }
    
}


//------------------------- admin home get request --------------------

const home = async (req,res)=>{
    try {
        const orderCount = await orderSchema.countDocuments()
        const userCount = await userSchema.countDocuments()

        const revenueResult = await orderSchema.aggregate([
            {
                $match: {
                    orderStatus: { $in: ['Shipped', 'Confirmed', 'Delivered'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalPrice" }
                }
            }
        ]);
        const Revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        const product = await orderSchema.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalQuantity" }
                }
            }
        ]);
        const productCount = product.length > 0 ? product[0].total : 0;

        res.render('admin/home',{title: "Home" , orderCount , userCount , Revenue , productCount })
    } catch (error) {
        console.log(`error from home ${error}`)
    }
}


//-------------------------- admin logout request ---------------------

const logout = (req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.log(`error while admin logout ${err}`)
        }else{
            res.redirect("/admin/login")
        }
    })
}

module.exports={ admin , login , loginPost , home , logout }