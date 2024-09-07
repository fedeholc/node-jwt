import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { getUserByEmail, insertUser } from "./utils-db.js";
import { getSecretKey } from "./secret-key.js";
import { getDbInstance } from "./db.js";

const db = await getDbInstance();

passport.serializeUser((profile, done) => {
  console.log("serializeUser", profile);
  done(null, profile);
});

passport.deserializeUser(async (obj, done) => {
  console.log("deserializeUser", obj);

  /*   const user = await getUserByEmail(email);
   */ done(null, obj);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
       process.nextTick(function () {
         // To keep the example simple, the user's GitHub profile is returned to
         // represent the logged-in user.  In a typical application, you would want
         // to associate the GitHub account with a user record in your database,
         // and return that user instead.
         //authCallback("github", profile, { accessToken, refreshToken }, done);
        });
        return done(null, profile);
     /*  try {
 
        //  profile.accessToken = accessToken;
        //  console.log("accessToken", accessToken);
        //      let user = await getUserByEmail(db, profile.emails[0].value);
        // if (!user) {
        //   user = await insertUser(
        //     db,
        //     profile.username,
        //     profile.emails[0].value,
        //     profile.id
        //   );
        // }  
        //        user.id = "1234";
        // user.email = "federicoholc@gmail.com";  
        console.log("profile", profile);
        return done(null, profile);


      } catch (err) {
        return done(err);
      } */
 
    }
  )
);

export default passport;
