const express = require('express');
const app = express();
const {DBConnection}=require('./database/db.js');
const User= require('./models/Users.js')
const jwt= require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');


dotenv.config();

const PORT = process.env.PORT || 8080;
const cookieParser = require("cookie-parser");
const cors = require("cors");
// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


DBConnection();

app.get('/', (req, res) => {
    res.send("REGISTRATION AND LOGIN");
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
        const hashPassword = await bcrypt.hashSync(password, 10);
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
            expiresIn: '1d'
        });
        user.token = token;
        user.password = undefined;

        res.status(200).json({
            temp: "You have successfully registered!",
            user
        });

    }catch(error)   {
        console.error(error);
    }
});
app.post("/login", async (req, res) => {
    try {
        //get all the user data
        const { email, password } = req.body;

        // check that all the data should exists
        if (!(email && password)) {
            return res.status(400).send("Please enter all the information");
        }

        //find the user in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send("User not found!");
        }

        //match the password
        const enteredPassword = await bcrypt.compare(password, user.password);
        if (!enteredPassword) {
            return res.status(401).send("Password is incorrect");
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });
        user.token = token;
        user.password = undefined;

        //store cookies
        const options = {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            httpOnly: true, //only manipulate by server
        };

        //send the token
        res.status(200).cookie("token", token, options).json({
            message: "You have successfully logged in!",
            success: true,
            token,
        });
    } catch (error) {
        console.log(error.message);
    }
});


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});