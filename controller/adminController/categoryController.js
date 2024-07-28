const categorySchema = require('../../model/categorySchema')

const mongoose = require('mongoose')

//--------------------------- catgeory page render ------------------------------

const category = async (req, res) => {
    try {
        const search = req.query.search || ''
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;

        const category = await categorySchema.find({collectionName: { $regex: search, $options: 'i' }})
            .sort({ updatedAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)

        const count = await categorySchema.countDocuments({ collectionName: { $regex: search, $options: 'i' } })

        res.render('admin/collection', { title: 'Category',
            category,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            search,
            limit,
            page})

    } catch (error) {
        console.log(`error from collection ${error}`)
    }
}

//---------------------------- new category  ----------------------------------

const addCategoryPost = async (req, res) => {
    try {
        const name = req.body.collectionName

    const category = {collectionName: name , isActive: true}
    const check = await categorySchema.findOne({collectionName: { $regex: name, $options: 'i' }})
    if (check == null) {
        await categorySchema.insertMany(category)
        .then(() => {
            req.flash('success', 'New category added')
            res.redirect('/admin/collection')
        })
        .catch(error => {
            console.log(`error while adding category ${error}`)
            })
        } else {
            req.flash('error', 'Category already exists')
            res.redirect('/admin/collection')
        }
    } catch (error) {
        console.log(`error from add Category post ${error}`)
    }
}

//----------------------------------- Active or block -----------------------------

const status = async (req, res) => {
    try {
        const categoryId = req.query.id
        const status = !(req.query.status === 'true')
        const category = await categorySchema.findByIdAndUpdate(categoryId, {isActive: status})
        res.redirect('/admin/collection')
    } catch (error) {
        console.log(`error while status update ${error}`)
    }
}

//------------------------------ Delete a Category --------------------------------

const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id
        const deleteCategory = await categorySchema.findByIdAndDelete(categoryId)
        if (deleteCategory != null) {
            req.flash('success', 'Category Successfully deleted')
            res.redirect('/admin/collection')
        } else {
            req.flash('error', 'Category Unable to delete')
            res.redirect('/admin/collection')
        }
    } catch (error) {
        console.log(`error while deleting category ${error}`)
    }
}

//-------------------------------- Edit Category ---------------------------------

const editCategory = async (req, res) => {
    try {

        const { categoryId, categoryName } = req.body
        const editCategory = await categorySchema.findByIdAndUpdate(categoryId,{ collectionName: categoryName })
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
