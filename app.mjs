import dotenv from 'dotenv';  // Load environment variables
import express from 'express';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import fetch from 'node-fetch';

dotenv.config({ path: './auth.env' });  // Load environment variables from auth.env

const app = express();
const port = 3000;

// Define the function to fetch user info from Discord
async function getUserInfo(accessToken) {
  const response = await fetch('https://discord.com/api/v10/users/@me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const userData = await response.json();
  console.log(userData);  // Log user data to the console

  // Check if the user has a verified phone number
  if (userData.phone) {
    console.log('User has a verified phone number');
  } else {
    console.log('User does not have a verified phone number');
  }

  return userData;
}

// Configure the Discord strategy for Passport
passport.use(new DiscordStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
  scope: ['identify', 'email'], // Request the necessary permissions
}, (accessToken, refreshToken, profile, done) => {
  console.log(profile);  // Log the user's profile data
  return done(null, profile);
}));

// Initialize Passport
app.use(passport.initialize());

// OAuth2 authentication route
app.get('/auth/discord', passport.authenticate('discord'));

// Callback route for Discord OAuth2
app.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }),
  async (req, res) => {
    try {
      const accessToken = req.user.accessToken; // Get the access token from the authenticated user
      const userData = await getUserInfo(accessToken);  // Fetch the user's data from Discord API

      if (userData.phone) {
        // If the user has a verified phone number, proceed to show them the dashboard or welcome message
        res.send(`<h1>Welcome, ${userData.username}!</h1><p>You have a verified phone number!</p>`);
      } else {
        // If the user does not have a verified phone number, show an error message
        res.status(403).send('<h1>Access Denied: You must have a verified phone number!</h1>');
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).send('Error retrieving user data');
    }
  });

// Root route
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Discord OAuth2 App!</h1>');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
