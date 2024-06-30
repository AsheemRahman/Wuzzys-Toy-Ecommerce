const Popup = require('../model/PopupSchema');

const checkPopup = async (req, res, next) => {
    const today = new Date();
    const popup = await Popup.findOne({
        startDate: { $lte: today },
        endDate: { $gte: today }
    });

    if (popup) {
        res.locals.popup = popup;
    } else {
        res.locals.popup = null;
    }
    next();
};

module.exports = checkPopup;