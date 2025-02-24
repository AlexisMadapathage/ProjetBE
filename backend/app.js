const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

dotenv.config(); // Charge les variables d’environnement


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(' Connexion MongoDB réussie !'))
  .catch(() => console.log(' Connexion MongoDB échouée !'));

const app = express (); 

// Activer CORS pour autoriser les requêtes du frontend
app.use(cors({
  origin: 'http://localhost:3001', // Autorise uniquement ton frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content', 'Accept', 'Content-Type', 'Authorization'],
  credentials: true // Autorise les cookies et tokens Bearer
}));

//app.use((req, res, next) => {
  //res.setHeader('Access-Control-Allow-Origin', '*');
  //res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  //res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  //console.log('Requête reçue:', req.method, req.url, req.headers);
  //next();
//});

app.use(express.json());

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;