const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


const DBConnection = async ()=>{
    const MONGODB_URL=process.env.MONGODB_URI;
    try{
        await mongoose.connect(MONGODB_URL,{
            useNewUrlParser:true,
        });
        console.log("Database Connection established");

    }catch(err){ // Define the error variable
        console.log("Error connecting to MongoDB: " + err);
    }
};
module.exports={DBConnection};