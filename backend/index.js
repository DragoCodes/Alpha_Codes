const express = require('express');
const app = express();
const {DBConnection}=require('./database/db.js');
const User= require('./models/Users.js')
const jwt= require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();
// middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));

DBConnection();

app.get('/', (req, res) => {
    res.send("Welcome to the today's class!");
});

app.post('/register', async(req, res) => {
    console.log(req);
    try {
        // get all the data from request body(
        const {firstname, lastname, email, password}= req.body;
        // check all the data should exist
        if(!(firstname&&lastname&&email&&password)){
            return res.status(400).send("Please enter all the required fields")
        }
        // check if user already registered
        const existingUser= await User.findOne({email})
        if (existingUser){
            return res.status(400).send("User already exists!");
        }

        // encrypt the password
        const hashPassword = bcrypt.hashSync(password, 10);
        console.log(hashPassword);

        // save the user in the database
        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hashPassword,
        });

        // generate token and send the response to the client   $$$$$$LEARN JWT TOKEN
        const token =jwt.sign({id:user._id,email}, process.env.SECRET_KEY,{
            expiresIn: '1h'
        });
        user.token = token;
        user.password = undefined;
        res.status(201).json({
            temp: "You have successfully registered!",
            user
        });
        // console.log(token);

    }catch(error)   {
        console.error(error);
    }
});

app.listen(8000,()=>{
    console.log("Server is running on port 8000");
});