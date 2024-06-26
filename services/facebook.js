const userSchema = require('../model/userSchema')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const dotenv = require('dotenv').config()

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,    
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      passReqToCallback: true,
      profileFields: ['id', 'displayName', 'emails', 'name']
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        console.log(profile) // Log the profile object

        if (!profile.emails || !profile.emails.length) {
          return done(new Error('No email found in Facebook profile'), null)
        }

        const email = profile.emails[0].value
        let user = await userSchema.findOne({ email })

        if (!user) {
          user = new userSchema({
            name: profile.displayName,
            email: email,
            facebookID: profile.id
          })
          await user.save()
        }

        done(null, user)
      } catch (err) {
        console.error(err) // Log the error
        done(err, null)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userSchema.findById(id)
    done(null, user)
  } catch (err) {
    console.error(err) // Log the error
    done(err, null)
  }
})

module.exports = passport
