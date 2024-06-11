const userSchema = require('../model/user.modal')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require('dotenv').config()

dotenv.config();


passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL,
            passReqToCallback: true
            // profileFields: ['id', 'emails', 'name']
        },
    async (request, accessToken, refreshToken, profile, done) => {
        try {
            let user = await userSchema.findOne({ email: profile.email })
            if (!user) {
                user = new userSchema({
                name: profile.displayName,
                email: profile.email,
                facebookID: profile.id
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
