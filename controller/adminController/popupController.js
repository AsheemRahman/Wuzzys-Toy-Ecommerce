const Popup = require('../../model/PopupSchema');


// Render admin popup management page
const getPopups = async (req, res) => {
    try {
        const popups = await Popup.find();
        if (req.session.admin) {
            res.render('admin/popups', { title: "Popup Alert", popups });
        } else {
            res.redirect('/admin/login');
        }
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

module.exports = { getPopups , createPopup , updatePopup}