const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (mongoose.connections[0].readyState) {
            console.log("MongoDB already connected");
            return;
        }

        if (!process.env.MONGO_URI) {
            console.log("No MONGO_URI found, using JSON file fallback");
            return;
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        console.log("Will use JSON file fallback for data");
        // Don't throw error, let the app continue with JSON fallback
    }
};

module.exports = connectDB; 