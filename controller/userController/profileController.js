const userSchema = require("../../model/userSchema");


//profile
const profile = async (req, res) => {
    try {
        const userDetail = await userSchema.findById(req.session.user)
        if (!userDetail) {
            req.flash('error', 'Error while getting user data. Please try again later.')
            return res.redirect('/user/home')
        }
        res.render('user/profile', { title: "Profile", alertMessage: req.flash('errorMessage'), user: req.session.user, userDetail })
    } catch (err) {
        console.log(`Error during profile page render ${err}`);
    }
}


// update the user profile
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


// address management in the user side 
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
            req.flash("errorMessage", "Maximum Address limit Reached")
            return res.redirect('/user/profile')
        }
        // Add the new address to the user's address array
        user.address.push(userAddress);
        // Save the updated user document
        await user.save();

        req.flash('sucess', "Address added")
        res.redirect('/user/profile')
    } catch (err) {
        req.flash('error', "Error While adding new address , Please try later")
        console.log(`Error adding new address in collection ${err}`);
    }
}



// edit the user address
const editAddressPost = async (req, res) => {
    try {
        const addressIndex = req.params.id
        const userAddress = {
            contactName: req.body.name,
            pincode: req.body.pincode,
            homeAddress: req.body.addressHome,
            areaAddress: req.body.addressArea,
            landmark: req.body.addresslandmark
        }
        // get current user data from collection
        const user = await userSchema.findById(req.session.user)

        user.address[addressIndex] = userAddress
        await user.save();

        req.flash('errorMessage', 'user address edited')
        res.redirect('/user/profile')
    } catch (err) {
        console.log(`Error during editing address in collection in post request ${err}`);
    }
}

module.exports = {
    profile,
    updateProfile,
    addAddress,
    editAddressPost,
}