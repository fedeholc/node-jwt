import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { getUserByEmail, insertUser } from "./utils-db.js";
import { getSecretKey } from "./secret-key.js";
import { getDbInstance } from "./db.js";

const db = await getDbInstance();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await getUserByEmail(id);
  done(null, user);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://127.0.0.1:3000/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await getUserByEmail(db, profile.emails[0].value);
        if (!user) {
          user = await insertUser(
            db,
            profile.username,
            profile.emails[0].value,
            profile.id
          );
        }
        user.id = "1234"
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;
