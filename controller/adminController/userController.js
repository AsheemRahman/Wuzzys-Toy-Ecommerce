
const userSchema = require('../../model/userSchema')


//-------------------------------- User Page Render ----------------------------------

const users = async (req,res)=> {

    try {
        
        const search = req.query.search || ''
        const user = await userSchema.find({name: {$regex: search, $options: 'i'}}).sort({ createdAt: -1 });

        res.render('admin/user',{title: 'Customers',user})

    } catch (error) {
        console.log(`Error while loading user in admin ${error}`)
    }

}

//------------------------------------ User Status ---------------------------------

const status = async (req,res)=> {

    try {
        
        const {id,status} = req.query;
        const newStatus = !(status === 'true')

        await userSchema.findByIdAndUpdate(id,{isActive: newStatus})
        res.redirect('/admin/users')

    } catch (error) {
        console.log(`error while changing status of user ${error}`)
    }

}

module.exports ={ users,status};