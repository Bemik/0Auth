require('dotenv').config({ path: './auth.env' });
const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

const app = express();
const port = 3000;

// Configure Discord OAuth2 strategy
passport.use(new DiscordStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
  scope: ['identify', 'email'],
}, (accessToken, refreshToken, profile, done) => {
  // Log the user's profile data to the console
  console.log(profile);
  return done(null, profile);
}));

// Initialize passport
app.use(passport.initialize());

// OAuth2 authentication route
app.get('/auth/discord', passport.authenticate('discord'));

// Callback route for Discord OAuth2
app.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    res.send(`<h1>Welcome ${req.user.username}!</h1>`);
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(process.env.CLIENT_ID);  // Should print your Discord Client ID
  console.log(process.env.CLIENT_SECRET);  // Should print your Discord Client Secret
  console.log(process.env.CALLBACK_URL);  // Should print your callback URL
});
