const GoogleStrategy=require("passport-google-oauth20").Strategy
const mongoose=require("mongoose");
const User=require("../models/User");

module.exports=function(passport){
  passport.use(new GoogleStrategy({
    clientID: '71363137851-g9clrtkqka21ddcknd8cjk0v5tpblakb.apps.googleusercontent.com',
    clientSecret:'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' ,
    callbackURL:"https://memory-git-main-himanshu303.vercel.app/auth/google/callback"
  }, async(accessToken,refreshToken,profile,done)=>{
    //console.log(profile);
    const newUser={
      googleId:profile.id,
      displayName:profile.displayName,
      firstName:profile.name.givenName,
      lastName:profile.name.familyName,
      image:profile.photos[0].value
    }

    try {
          let user=await User.findOne({googleId:profile.id})

          if(user){
            done(null, user)
          }else {
            user=await User.create(newUser)
            done(null,user)
          }

        }catch(err){
            console.log(err);
    }
  })
  )
  passport.serializeUser((user,done)=>
    done(null, user.id) )
  passport.deserializeUser(async(id,done)=> {
    try{
      const user=await User.findById(id)
      done(null,user);
}catch{
  done(err,user);
}
  }
      
  )
}