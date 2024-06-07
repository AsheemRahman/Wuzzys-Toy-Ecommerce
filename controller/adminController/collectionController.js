const mongoose = require('mongoose')
const collectionSchema = require('../../model/collection.model')

const collection = async (req,res)=>{
    try {
        
        const search = req.query.search || "" ;
        const collection = await  collectionSchema.find({collectionName: {$regex : search, $options: 'i'}})

        res.render('admin/collection',{title: "Collection",collection})

    } catch (error) {
        console.log(`error from collection ${error}`)
    }
}

const addCollectionPost = async (req,res) => {
    try {
        
        const name= req.body.collectionName;

        const collection = {
            collectionName: name,
            isActive : true
        }

        const check = await collectionSchema.findOne({collectionName: {$regex : name, $options: 'i'}})

        if(check == null){
            await collectionSchema.insertMany(collection).then( ()=>{
                req.flash("success","New collection added")
                res.redirect('/admin/collection')
            }).catch((error) => {
                console.log(`error while adding collection ${error}`)
            })
        }else{
            req.flash("error","Collection already exists")
            res.redirect('/admin/collection')
        }

    } catch (error) {
        console.log(`error from add collection post ${error}`)
    }
}

const status = async (req,res)=> {
    try {
        const collectionId = req.query.id;
        const status = !(req.query.status === 'true');
        const collection = await collectionSchema.findByIdAndUpdate(collectionId,{isActive: status})

        res.redirect('/admin/collection')

    } catch (error) {
        console.log(`error while status update ${error}`)
    }
}

const deleteCollection = async (req,res)=> {
    try {
        const collectionId = req.params.id;

        const deleteCollection = await collectionSchema.findByIdAndDelete(collectionId);
        if(deleteCollection != null){
            req.flash('success',"Collection Successfully deleted")
            res.redirect('/admin/collection')
        }else{
            req.flash("error",'Collection Unable to delete')
            res.redirect('/admin/collection')
        }

    } catch (error) {
        console.log(`error while deleting collection ${error}`)
    }
}


const editcollection = async (req,res) => {
    try {
        const {collectionId,collectionName} = req.body;

        const editCollection = await collectionSchema.findByIdAndUpdate(collectionId,{collectionName: collectionName})

        if(editCollection != null){
            req.flash('success',"Collection Successfully edited")
            res.redirect('/admin/collection')
        }else{
            req.flash('error','Collection unable to edit')
            res.redirect('/admin/collection')
        }

    } catch (error) {
        console.log(`error while editing collection ${error}`)
    }

}

module.exports = {collection,addCollectionPost,deleteCollection,status,editcollection}