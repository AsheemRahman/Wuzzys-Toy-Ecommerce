const Popup = require('../../model/PopupSchema');


// Render admin popup management page
const getPopups = async (req, res) => {
    try {
        const today = new Date();
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        
        const popups = await Popup.find({ title: { $regex: search, $options: 'i' } })
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ updatedAt : -1 });

        const count = await Popup.countDocuments({ title: { $regex: search, $options: 'i' } });

        res.render('admin/popups', { title: "Popup Alert", popups , today ,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            search,
            limit,page
        });

    } catch (error) {
        console.error('Error fetching popups:', error);
        res.status(500).send('Error fetching popups: ' + error.message);
    }
};

// Create a new popup
const createPopup = async (req, res) => {
    try {
        const { title, content, startDate, endDate } = req.body;

        // Basic validation
        if (!title || !content || !startDate || !endDate) {
            return res.status(400).send('All fields are required.');
        }

        const newPopup = new Popup({ title, content, startDate, endDate });
        await newPopup.save();
        res.redirect('/admin/popups');
    } catch (error) {
        console.error('Error creating popup:', error);
        res.status(500).send('Error creating popup: ' + error.message);
    }
};


// Update an existing popup
const updatePopup = async (req, res) => {
    try {
        const { title, content, startDate, endDate } = req.body;
        await Popup.findByIdAndUpdate(req.params.id, { title, content, startDate, endDate });
        res.redirect('/admin/popups');
    } catch (error) {
        res.status(500).send('Error updating popup: ' + error.message);
    }
};

//------------------------ delete an Popup ----------------------------

const deletePopup = async(req,res)=>{
    try{
        const id = req.params.id;
        const pop = await Popup.findByIdAndDelete(id)
        if( pop != null ){
            req.flash("success",'PopUp Delete successfully')
            res.redirect('/admin/popups')
        }else{
            req.flash('error','Couldnt delete the popup')
            res.redirect('/admin/popups')
        }
    }catch(error){
        res.status(500).send(`error updating popup : ${error}`)
    }
}

module.exports = { getPopups , createPopup , updatePopup , deletePopup }