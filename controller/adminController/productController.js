const productSchema = require('../../model/productSchema')
const categorySchema = require('../../model/categorySchema')

const upload = require('../../middleware/multer')

const fs = require('fs');


//------------------------------ Find Product by Search -----------------------------

const product = async (req, res) => {
    try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        
        const products = await productSchema.find({ productName: { $regex: search, $options: 'i' } })
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ updatedAt : -1 });

        const count = await productSchema.countDocuments({ productName: { $regex: search, $options: 'i' } });

        res.render('admin/products', {
            title: 'Products',
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            search,
            limit,page
        });
    } catch (error) {
        console.log(`error from product page ${error}`);
        res.status(500).send('Server Error');
    }
};


//---------------------------------- Add Product Render---------------------------------

const addProduct = async (req,res) => {
    try {
        const productCollection = await categorySchema.find()

        res.render('admin/addProduct',{title: "Add Product",productCollection})
    } catch (error) {
        console.log(`error while rendering addproduct page ${error}`)
    }
}


//------------------------------------ Multer upload ---------------------------------

const multer = upload.array('images',3);


//----------------------------------- add New product --------------------------------

const addproductPost = async (req,res) => {
    try {
        const imgArray = []

        req.files.forEach((img) =>{
            imgArray.push(img.path)
        })

        const product = {
            productName: req.body.productName,
            productPrice: req.body.productPrice,
            productCollection: req.body.productCollection,
            productQuantity: req.body.productQuantity,
            productDiscount: req.body.productDiscount,
            productDescription: req.body.productDescription,
            productImage: imgArray
        }

        const check = await productSchema.findOne({productName: product.productName, productCollection: product.productCollection, })

        if(!check){
            await productSchema.insertMany(product);
            req.flash('success','Product Successfully added')
        }else{
            req.flash('error','Product already exists')
        }
        res.redirect('/admin/products')

    } catch (error) {
        console.log(`error while adding product ${error}`)
        req.flash('error','Failed to added product')
        res.redirect('/admin/addproduct')
        res.status(500).send('Server Error');
    }
}

//----------------------------------- Edit Product page render -----------------------------------

const editProduct = async (req,res) => {
    
    try {
        const id = req.params.id;
        const product = await productSchema.findById(id)

        if(product){
            res.render('admin/editproduct',{title:'Edit Product',product})
        }else{
            req.flash('error','Unable to edit product')
            res.redirect('/admin/products')
        }

    } catch (error) {
        console.log(`error while loading edit product page ${error}`)
        res.status(500).send('Server Error');
    }
}


//----------------------------------- Edit Product  -----------------------------------

const editProductPost = async (req, res) => {
    try {
        const id = req.params.id;
        const imageToDelete = JSON.parse(req.body.deletedImages || '[]');
        const croppedImages = JSON.parse(req.body.croppedImages || '[]');

        // Delete images from filesystem
        imageToDelete.forEach(imagePath => {
            try {
                fs.unlinkSync(imagePath);
            } catch (error) {
                console.error(`Error deleting image: ${imagePath}`, error);
            }
        });

        // Remove images from database
        if (imageToDelete.length > 0) {
            await productSchema.findByIdAndUpdate(id, {
                $pull: { productImage: { $in: imageToDelete } }
            });
        }

        // Save cropped images to filesystem and update paths
        const savedCroppedImages = [];
        croppedImages.forEach((imageData, index) => {
            const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, "");
            const imagePath = `uploads/cropped_image_${id}_${Date.now()}_${index}.jpg`;
            fs.writeFileSync(imagePath, base64Data, 'base64');
            savedCroppedImages.push(imagePath);
        });

        const product = await productSchema.findById(id);
        // Update product with new images
        const newImages = [...product.productImage, ...savedCroppedImages];

        await productSchema.findByIdAndUpdate(id, {
            productPrice: req.body.productPrice,
            productQuantity: req.body.productQuantity,
            productDiscount: req.body.productDiscount,
            productDescription: req.body.productDescription,
            productImage: newImages,
        });

        req.flash('success', 'Product successfully updated');
        res.redirect('/admin/products');
    } catch (error) {
        console.log(`Error while editing product post: ${error}`);
        req.flash('error', "Could not edit the product");
        res.redirect('/admin/products');
    }
};


//------------------------------------ Product Status ----------------------------------

const status = async (req,res)=> {
    try {
        const{ id,status} = req.query;
        const newStatus = !(status === 'true')

        await productSchema.findByIdAndUpdate(id,{isActive: newStatus})
        res.redirect('/admin/products')

    } catch (error) {
        console.log(`error while changing status ${error}`)
    }
}


//------------------------------------ Delete Product -----------------------------------

const deleteProduct =async (req,res)=>{
    try {
        
        const id = req.params.id;
        const img = await productSchema.findById(id)
        img.productImage.forEach((x)=>{
            fs.unlinkSync(x)
        })
        const product = await productSchema.findByIdAndDelete(id)
        if(product != null){
            req.flash('success','Product successfully removed')
            res.redirect('/admin/products')
        }else{
            req.flash('error','Couldnt delete the product')
            res.redirect('/admin/products')
        }

    } catch (error) {
        console.log(`error while deleting the product ${error}`)
    }
}

module.exports = { product , deleteProduct , status , addProduct , multer , addproductPost , editProduct , editProductPost }