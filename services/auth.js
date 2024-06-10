const userSchema = require('../model/user.modal')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const dotenv = require('dotenv').config()

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            passReqToCallback: true
        },
    async (request, accessToken, refreshToken, profile, done) => {
        try {
            let user = await userSchema.findOne({ email: profile.email })
            if (!user) {
                user = new userSchema({
                name: profile.displayName,
                email: profile.email,
                googleID: profile.id
            })
                await user.save()
            }
                done(null, user)
            } catch (err) {
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
    done(err, null)
  }
})


module.exports = passport ;
