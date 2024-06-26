const mongoose = require('mongoose')
const categorySchema = require('../../model/categorySchema')

//--------------------------- finding collection by search ------------------------------

const collection = async (req, res) => {
    try {
        const search = req.query.search || ''
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;

        const collection = await categorySchema.find({collectionName: { $regex: search, $options: 'i' }})
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)

        const count = await categorySchema.countDocuments({ collectionName: { $regex: search, $options: 'i' } })

        res.render('admin/collection', { title: 'Category',
            collection ,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            search,
            limit,
            page})

    } catch (error) {
        console.log(`error from collection ${error}`)
    }
}

//---------------------------- new collection creating ----------------------------------

const addCollectionPost = async (req, res) => {
    try {
        const name = req.body.collectionName

    const collection = {
        collectionName: name,
        isActive: true
    }
    const check = await categorySchema.findOne({collectionName: { $regex: name, $options: 'i' }})
    if (check == null) {
        await categorySchema.insertMany(collection)
        .then(() => {
            req.flash('success', 'New collection added')
            res.redirect('/admin/collection')
        })
        .catch(error => {
            console.log(`error while adding collection ${error}`)
            })
        } else {
            req.flash('error', 'Collection already exists')
            res.redirect('/admin/collection')
        }
    } catch (error) {
        console.log(`error from add collection post ${error}`)
    }
}

//----------------------------------- Active or block -----------------------------

const status = async (req, res) => {
    try {
        const collectionId = req.query.id
        const status = !(req.query.status === 'true')
        const collection = await categorySchema.findByIdAndUpdate(collectionId, {isActive: status})
        res.redirect('/admin/collection')
    } catch (error) {
        console.log(`error while status update ${error}`)
    }
}

//------------------------------ Delete a Colection --------------------------------

const deleteCollection = async (req, res) => {
    try {
        const collectionId = req.params.id
        const deleteCollection = await categorySchema.findByIdAndDelete(collectionId)
        if (deleteCollection != null) {
            req.flash('success', 'Collection Successfully deleted')
            res.redirect('/admin/collection')
        } else {
            req.flash('error', 'Collection Unable to delete')
            res.redirect('/admin/collection')
        }
    } catch (error) {
        console.log(`error while deleting collection ${error}`)
    }
}

//-------------------------------- Edit Collection ---------------------------------

const editcollection = async (req, res) => {
    try {

        const { collectionId, collectionName } = req.body
        const editCollection = await categorySchema.findByIdAndUpdate(collectionId,{ collectionName: collectionName })
        if (editCollection != null) {
            req.flash('success', 'Collection Successfully edited')
            res.redirect('/admin/collection')
        } else {
            req.flash('error', 'Collection unable to edit')
            res.redirect('/admin/collection')
        }
    } catch (error) {
        console.log(`error while editing collection ${error}`)
    }
}

module.exports = {
    collection,
    addCollectionPost,
    deleteCollection,
    status,
    editcollection
}
