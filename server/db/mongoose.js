//import mongoose from 'mongoose';
let mongoose = require('mongoose');
let dbURI = 'mongodb://localhost:27017/StockSignal';
//let dbURI = 'mongodb://stocksignal>:6tN14aiavnTK6aLfaPEETqlf5R91PGYOYkuPsNWFr40L7sMNWg3ukGpx1k5pGtYWUNWw9UwSFohoKjchLyZoZw==@stocksignal.documents.azure.com:10250/mean?ssl=true&sslverifycertificate=false';


mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || dbURI);

module.exports = { mongoose };