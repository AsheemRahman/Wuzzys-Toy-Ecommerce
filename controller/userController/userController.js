const userSchema = require('../../model/userSchema')
const bcrypt = require('bcrypt')

const sendOTP = require('../../services/emailSender')
const generateOTP = require('../../services/generateOTP')

const passport = require('passport')
const auth = require('../../services/auth')
const facebook = require('../../services/facebook')

//--------------------------------- user Home page Render ------------------------------

const user = (req, res) => {
  try {
    res.redirect('/home')
  } catch (error) {
    console.log(`error while rendering user page ${error}`)
  }
}

//------------------------------------ Render Signup page --------------------------------

const signup = (req, res) => {
  try {
    if (req.session.user) {
      res.redirect('/home')
    } else {
      res.render('user/signup', { title: 'Signup', user: req.session.user })
    }
  } catch (error) {
    console.log(`error while rendering signup page ${error} `)
  }
}

//---------------------------------- Getting Details of User ------------------------------

const signupPost = async (req, res) => {
  try {
    const details = {
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
      phone: req.body.phone
    }
    const check = await userSchema.findOne({ email: details.email })

    if (check) {
      req.flash('error', 'User already exists')
      res.redirect('/signup')
    } else {
      const otp = generateOTP()
      sendOTP(details.email, otp)
      req.flash('success', `OTP sent to the ${details.email} `)

      req.session.otp = otp
      req.session.otpTime = Date.now()
      req.session.email = details.email
      req.session.name = details.name
      req.session.phone = details.phone
      req.session.password = details.password

      res.redirect('/verify')
    }
  } catch (error) {
    console.log(`error while user signup post ${error}`)
  }
}

//-------------------------------- Login otp Page Render -----------------------------

const verify = (req, res) => {
  try {
    res.render('user/verify', {
      title: 'OTP verify',
      email: req.session.email,
      otpTime: req.session.otpTime,
      user: req.session.user
    })
  } catch (error) {
    console.log(`error while rendering verify page ${error}`)
  }
}

//------------------------------------ verify the otp -------------------------------

const verifyPost = async (req, res) => {
  try {
    if (req.session.otp !== undefined) {
      const details = {
        name: req.session.name,
        email: req.session.email,
        password: req.session.password,
        phone: req.session.phone
      }

      if (req.body.otp === req.session.otp) {
        await userSchema
          .insertMany(details)
          .then(() => {
            console.log(`new user registeres successfully`)
            req.flash('success', 'user signup successfull')
            res.redirect('/login')
          })
          .catch(err => {
            console.log(`error while user signup ${err}`)
          })
      } else {
        req.flash('error', 'Invaild OTP , Try Again')
        res.redirect('/verify')
      }
    }
  } catch (error) {
    console.log(`error while verifying otp${error}`)
  }
}

//-------------------------------------- Otp Resent ---------------------------------

const otpResend = (req, res) => {
  try {
    const email = req.params.email
    const otp = generateOTP()

    sendOTP(email, otp)
    req.session.otp = otp
    req.session.otpTime = Date.now()

    req.flash('success', 'OTP resend successfully')
    res.redirect('/verify')
  } catch (error) {
    console.log(`error while resend otp ${error}`)
  }
}

//------------------------------------ Login Page Render ----------------------------

const login = (req, res) => {
  if (req.session.user) {
    res.redirect('/home')
  } else {
    res.render('user/login', { title: 'Login', user: req.session.user })
  }
}

//---------------------------------- Verify Login Details -----------------------------

const loginPost = async (req, res) => {
  try {
    const test = await userSchema.findOne({ email: req.body.email })

    if (test) {
      if (!test.isActive) {
        req.flash('error', 'User access is blocked by admin')
        res.redirect('/login')
      } else {
        const password = await bcrypt.compare(req.body.password, test.password)

        if (test && password) {
          req.session.user = test.id
          res.redirect('/home')
        } else {
          req.flash('error', 'Invalid credentails')
          res.redirect('/login')
        }
      }
    } else {
      req.flash('error', 'Couldnt find user , please login again')
      res.redirect('/login')
    }
  } catch (error) {
    console.log(`error while login post ${error}`)
  }
}

//--------------------------------------- User logout -----------------------------------

const logout = (req, res) => {
  try {
    req.session.destroy(error => {
      if (error) {
        console.log(`error while logout ${error}`)
      }
    })
    res.redirect('/home')
  } catch (error) {
    console.log(`error while logout user ${error}`)
  }
}


//-------------------------------------- google auth -----------------------------------

const googleAuth = (req, res) => {
  try {
    passport.authenticate('google', {
      scope: ['email', 'profile']
    })(req, res)
  } catch (err) {
    console.log(`Error on google authentication ${err}`)
  }
}


//----------------------------------- google auth callback  ----------------------------

const googleAuthCallback = (req, res, next) => {
  try {
      passport.authenticate('google', (err, user, info) => {
          if (err) {
              console.log(`Error on google auth callback: ${err}`);
              return next(err);
          }
          if(!user.isActive){
            req.flash('error', 'User access is blocked by admin')
            return res.redirect('/login')
          }
          if (!user) {
              return res.redirect('/login');
          }
          req.logIn(user, (err) => {
              if (err) {
                  return next(err);
              }
              req.session.user = user.id;
              return res.redirect('/home');
          });
      })(req, res, next);
  } catch (err) {
      console.log(`Error on google callback ${err}`);
  }
}


//-------------------------------------- Facebook auth -----------------------------------

const facebookAuth = (req, res, next) => {
  passport.authenticate('facebook', {
    scope: ['email', 'profile']
  })(req, res, next)
}


//----------------------------------- facebook auth callback  ----------------------------

const facebookAuthCallback = (req, res, next) => {
  passport.authenticate('facebook', (err, user, info) => {
    if (err) {
      console.log(`Error on facebook auth callback: ${err}`)
      return res.status(500).send('Authentication failed')
    }
    if (!user) {
      return res.redirect('/login')
    }
    req.logIn(user, err => {
      if (err) {
        console.log(`Error logging facbook: ${err}`)
        return res.status(500).send('Login failed')
      }
      req.session.user = user.id
      return res.redirect('/home')
    })
  })(req, res, next)
}

module.exports = {
  user,
  signup,
  signupPost,
  verify,
  verifyPost,
  otpResend,
  login,
  loginPost,
  googleAuth,
  googleAuthCallback,
  facebookAuth,
  facebookAuthCallback,
  logout
}
