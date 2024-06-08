
//--------------------------- admin routes ------------------------------

const admin = (req,res)=>{
    try {
        res.redirect('/admin/login')
    } catch (error) {
        console.log(`error from admin ${error}`)
    }
}


//------------------------- login get request --------------------------

const login = (req,res)=>{
    try {
        if(req.session.admin){
            res.redirect('/admin/home')
        }else{
            res.render('admin/login',{title: "Login"})
        }
        
    } catch (error) {
        console.log(`error from admin login ${error}`)
    }
    
}


//--------------------- admin login post request ----------------------

const loginPost = (req,res)=>{
    try {
        if(req.body.email === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD ){
            req.session.admin = req.body.email
            res.redirect('/admin/home')
        }else{
            req.flash("error","Invalid Credentials")
            res.redirect('/admin/login')
        }
        
    } catch (error) {
        console.log(`error from login post ${error}`)
    }
    
}


//------------------------- admin home get request --------------------

const home = (req,res)=>{
   try {
    res.render('admin/home',{title: "Home"})
   } catch (error) {
    console.log(`error from home ${error}`)
   }
}


//-------------------------- admin logout request ---------------------

const logout = (req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.log(`error while admin logout ${err}`)
        }else{
            res.redirect("/admin/login")
        }
    })
}

module.exports={login,loginPost,home,admin,logout}