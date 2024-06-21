const userSchema = require("../../model/userSchema");

const { ObjectId } = require('mongodb');



//------------------------------------------- profile ----------------------------------------------
const profile = async (req, res) => {
    try {
        const userDetail = await userSchema.findById(req.session.user)
        if (!userDetail) {
            req.flash('error', 'Error while getting user data. Please try again later.')
            return res.redirect('/user/home')
        }
        res.render('user/profile', { title: "Profile", alertMessage: req.flash('success'), user: req.session.user, userDetail })
    } catch (err) {
        console.log(`Error during profile page render ${err}`);
    }
}


//------------------------------------- update the user profile ------------------------------------

const updateProfile = async (req, res) => {
    try {
        // get the form data
        const userName = req.body.userName;
        const phone = req.body.phoneNumber;
        // update the user details
        const profileUpdate = await userSchema.findByIdAndUpdate(req.session.user, { name: userName, phone: phone })
        if (profileUpdate) {
            req.flash('success', 'Profile updated');
        } else {
            req.flash("error", 'Could not update right now , please try again')
        }
        res.redirect("/user/profile")
    } catch (err) {
        console.log(`Error during updating the user profile ${err}`);
    }
}


//------------------------------- address management in the user side -----------------------------

const addAddress = async (req, res) => {
    try {
        // user address details added
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
        // get current user data from collection
        const user = await userSchema.findById(req.session.user)
        // if maximum address size reached then redirect to login page
        if (user.address.length > 3) {
            req.flash("error", "Maximum Address limit Reached")
            return res.redirect('/user/profile')
        }
        // Add the new address to the user's address array
        user.address.push(userAddress);
        // Save the updated user document
        await user.save();

        req.flash('success', "Address added")
        res.redirect('/user/profile')
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
        // Find the user by userId
        const user = await userSchema.findById(userId).populate('address');
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/user/profile');
        }
        // Validate the index
        if (isNaN(index) || index < 0 || index >= user.address.length) {
            req.flash('error', 'Invalid address index');
            return res.redirect('/user/profile');
        }
        // Remove the address by index
        user.address.splice(index, 1);
        // Save the updated user document
        await user.save();

        req.flash('success', 'Address deleted successfully');
        res.redirect('/user/profile');
    } catch (err) {
        console.error(`Error during deleting address${err}`);
        req.flash('error','Failed to delete address. Please try again later.');
        res.redirect('/user/profile');
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
            res.redirect('/user/profile');
        }
    } catch (err) {
        console.error(`error on rendering the editaddress page`);
        req.flash('error','error while rendering the Edit Address page . Please try again later.');
        res.redirect('/user/profile');
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
        updateQuery[`address.${index}`] = data; // Constructing the dynamic update object

        const result = await userSchema.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateQuery }
        );
        req.flash('success','Address updated Successfully');
        res.redirect('/user/profile');
    } catch (err) {
        console.log(`error while editing the address ${err}`)
        req.flash('error','Cannot update the address right now . Please try again later.');
        res.redirect(`/user/edit-address/${index}`);
    }
}


module.exports = { profile , updateProfile , addAddress , removeAddress , editAddress , updateAddress }