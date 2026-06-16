import mysql from "mysql2";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

const conn = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "MaseratiDB",
});

export const JWT_SECRET = "my_jwt_secret_Rimborsi";

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (token, done) => {
      try {
        const query = "SELECT * FROM user WHERE id = ?";
        conn.query(query, [token.id], (err, results: any) => {
          if (err) return done(err);

          if (results && results.length > 0) {
            const user = results[0];
            return done(null, user);
          } else {
            return done(null, false, { message: "Token non valido" });
          }
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);