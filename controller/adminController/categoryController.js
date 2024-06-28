const mongoose = require('mongoose')
const categorySchema = require('../../model/categorySchema')

//--------------------------- finding collection by search ------------------------------

const category = async (req, res) => {
    try {
        const search = req.query.search || ''
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;

        const collection = await categorySchema.find({collectionName: { $regex: search, $options: 'i' }})
            .sort({ updatedAt: -1 })
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

//---------------------------- new category creating ----------------------------------

const addCategoryPost = async (req, res) => {
    try {
        const name = req.body.collectionName

    const collection = {collectionName: name , isActive: true}
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
        const category = await categorySchema.findByIdAndUpdate(collectionId, {isActive: status})
        res.redirect('/admin/collection')
    } catch (error) {
        console.log(`error while status update ${error}`)
    }
}

//------------------------------ Delete a Colection --------------------------------

const deleteCategory = async (req, res) => {
    try {
        const collectionId = req.params.id
        const deleteCategory = await categorySchema.findByIdAndDelete(collectionId)
        if (deleteCategory != null) {
            req.flash('success', 'Category Successfully deleted')
            res.redirect('/admin/collection')
        } else {
            req.flash('error', 'Category Unable to delete')
            res.redirect('/admin/collection')
        }
    } catch (error) {
        console.log(`error while deleting collection ${error}`)
    }
}

//-------------------------------- Edit Category ---------------------------------

const editCategory = async (req, res) => {
    try {

        const { collectionId, collectionName } = req.body
        const editCategory = await categorySchema.findByIdAndUpdate(collectionId,{ collectionName: collectionName })
        if (editCategory != null) {
            req.flash('success', 'Category Successfully edited')
            res.redirect('/admin/collection')
        } else {
            req.flash('error', 'Category unable to edit')
            res.redirect('/admin/collection')
        }
    } catch (error) {
        console.log(`error while editing category ${error}`)
    }
}

module.exports = {
    category,
    addCategoryPost,
    deleteCategory,
    status,
    editCategory
}
