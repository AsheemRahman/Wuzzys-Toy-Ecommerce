const userSchema = require("../../model/userSchema");
const walletSchema = require('../../model/walletSchema');

const { ObjectId } = require('mongodb');



//------------------------------------------- profile ----------------------------------------------

const profile = async (req, res) => {
    try {
        const userId = req.session.user
        const userDetail = await userSchema.findById(userId)
        if (!userId) {
            req.flash('error', 'User Not found . Please login again.')
            return res.redirect('/login')
        }
        if(!userDetail){
            req.flash('error','Profile is not found ,Please try again later')
            return res.redirect('/home')
        }
        res.render('user/profile', { title: "Profile", user: req.session.user , userDetail })
    } catch (err) {
        console.log(`Error during profile page render ${err}`);
        res.status(404)
    }
}


//------------------------------------- update the user profile ------------------------------------

const updateProfile = async (req, res) => {
    try {
        const userName = req.body.userName;
        const phone = req.body.phoneNumber;

        const profileUpdate = await userSchema.findByIdAndUpdate(req.session.user, { name: userName, phone: phone })
        if (profileUpdate) {
            req.flash('success', 'Profile updated');
        } else {
            req.flash("error", 'Could not update right now , please try again')
        }
        res.redirect("/profile")
    } catch (err) {
        console.log(`Error during updating the user profile ${err}`);
    }
}


//------------------------------- address management in the user side -----------------------------

const addAddress = async (req, res) => {
    try {
        const userAddress = {
            building:req.body.building,
            street:req.body.street,
            city:req.body.city,
            phonenumber:req.body.phonenumber,
            pincode:req.body.pincode,
            landmark:req.body.landmark,
            state:req.body.state,
            country:req.body.country
        }
        const user = await userSchema.findById(req.session.user)
        // if maximum address size reached then show alert
        if (user.address.length > 3) {
            req.flash("error", "Maximum Address limit Reached")
            return res.redirect('/profile')
        }
        // Add the new address to the user's address array
        user.address.push(userAddress);
        // Save the updated user document
        await user.save();

        req.flash('success', "Address added")
        res.redirect('/profile')
    } catch (err) {
        req.flash('error', "Error While adding new address , Please try later")
        console.log(`Error adding new address in collection ${err}`);
    }
}


//-------------------------------------- Remove Address ---------------------------------
const removeAddress = async (req, res) => {
    try {
        const userId = req.session.user;
        const index = parseInt(req.params.index, 10);

        const user = await userSchema.findById(userId).populate('address');
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/profile');
        }

        if (isNaN(index) || index < 0 || index >= user.address.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('/profile');
        }
        user.address.splice(index, 1);
        await user.save();

        req.flash('success', 'Address deleted successfully');
        res.redirect('/profile');
    } catch (err) {
        console.error(`Error during deleting address${err}`);
        req.flash('error','Failed to delete address. Please try again later.');
        res.redirect('/profile');
    }
};


// --------------------------------------- Edit address page load ---------------------------------

const editAddress = async (req, res) => {
    const index = Number(req.params.index);
    const id = req.session.user;

    try {
        const getAddress = await userSchema.findOne({ _id: id }, { address: { $slice: [index, 1] } });

        if (getAddress) {
            res.render('user/editAddress', { title: "edit address", data: getAddress.address[0], index , user: req.session.user});
        } else {
            res.redirect('/profile');
        }
    } catch (err) {
        console.error(`error on rendering the editaddress page`);
        req.flash('error','error while rendering the Edit Address page . Please try again later.');
        res.redirect('/profile');
    }
};


// ------------------------------------- Update existing address -------------------------------- 

const updateAddress= async (req,res)=>{
const id= req.session.user;
const index = parseInt(req.params.index, 10);
const data= {
    building:req.body.building,
    street:req.body.street,
    city:req.body.city,
    state:req.body.state,
    country:req.body.country,
    pincode:req.body.pincode,
    phonenumber:req.body.phonenumber,
    landmark:req.body.landmark
}
    try {
        const updateQuery = {};
        updateQuery[`address.${index}`] = data;

        const result = await userSchema.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateQuery }
        );
        req.flash('success','Address updated Successfully');
        res.redirect('/profile');
    } catch (err) {
        console.log(`error while editing the address ${err}`)
        req.flash('error','Cannot update the address right now . Please try again later.');
        res.redirect(`/edit-address/${index}`);
    }
}

const walletPage = async (req,res)=>{
    try{
        const userId = req.session.user;
        let wallet = await walletSchema.findOne({ userID: userId });
        if (!userId) {
            req.flash('error', 'User Not found . Please login again.')
            return res.redirect('/login')
        }
        if (!wallet) {
            wallet = { balance: 0, transaction: [] };
        }
        res.render('user/wallet',{title:'Wallet' , wallet , user:userId })
    }catch(error){
        console.log(`error while render user wallet ${error}`)
        res.redirect('/profile')
    }
}


module.exports = { profile , updateProfile , addAddress , removeAddress , editAddress , updateAddress , walletPage }