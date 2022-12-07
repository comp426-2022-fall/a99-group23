// import minimist from 'minimist';
// import express from 'express';
// import http from 'http';
// import bcrypt from 'bcrypt';
// import path from 'path';
// import bodyParser from 'body-parser';
//import { userDB } from '../data.js';

// import path from 'path';

// const app = express();
// app.use(express.urlencoded({extended: true}));

// const args = minimist(process.argv.slice(2));
// const port = args.port|| 5000;

// app.get('/app/', (req, res) => {
//     // res.send('200 OK');
//     res.sendFile(path.resolve("frontend", "login-page.html"));
// });

// app.get('*', function(req, res){
//     res.send('404 NOT FOUND');
// })

// app.listen(port, () => console.log("Server running..."));

const express = require('express');
const http = require('http');
const bcrypt = require('bcrypt');
const path = require("path");
const bodyParser = require('body-parser');
const users = require('./data').userDB;
const database = require('better-sqlite3');
const app = express();
const server = http.createServer(app);

const db = new database('users.db');     // creating a database to store users data 

// creating a user info table 
const stmt = ` CREATE TABLE IF NOT EXISTS userinfo (
		     id INTEGER PRIMARY KEY, 
		     username TEXT, 
		     email TEXT, 
		     password TEXT
	);`

db.exec(stmt);



app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./frontend')));


app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,'./frontend/index.html'));
});


app.post('/register', async (req, res) => {
    try{
        let foundUser = users.find((data) => req.body.email === data.email);
        if (!foundUser) {
    
            let hashPassword = await bcrypt.hash(req.body.password, 10);
    
            let newUser = {
                id: Date.now(),
                username: req.body.username,
                email: req.body.email,
                password: hashPassword,
            };
            users.push(newUser);
            console.log('User list', users);
             
		// inserting new user data into table
	    const adduser = db.prepare(`INSERT INTO userinfo (id, username, email, password) VALUES (?,?,?)`);
		// inserting the values from newUser into the SQL statement
	    const info = adduser.run(newUser.id, newUser.username, newUser.email, newUser.password);
		

            res.send("<div align ='center'><h2>Registration successful</h2></div><br><br><div align='center'><a href='./login.html'>login</a></div><br><br><div align='center'><a href='./registration.html'>Register another user</a></div>");
        } else {
            res.send("<div align ='center'><h2>Email already used</h2></div><br><br><div align='center'><a href='./registration.html'>Register again</a></div>");
        }
    } catch{
        res.send("Internal server error");
    }
});

app.post('/login', async (req, res) => {
    try{
        let foundUser = users.find((data) => req.body.email === data.email);
	let founduserDB = db.prepare(`select id from userinfo where username =  ${req.body.username} `);
	let row = founduserDB.get();
	    if(row === undefined)
	    {}
        if (foundUser && row === undefined) {
    
            let submittedPass = req.body.password; 
            let storedPass = foundUser.password; 
    
            const passwordMatch = await bcrypt.compare(submittedPass, storedPass);
            if (passwordMatch) {
                let usrname = foundUser.username;
                res.send(`<div align ='center'><h2>login successful</h2></div><br><br><br><div align ='center'><h3>Hello ${usrname}</h3></div><br><br><div align='center'><a href='./login.html'>logout </div><br><br> <input type="checkbox" id="vehicle1" name="vehicle1" value="Bike"><label for="vehicle1"> I have a bike</label><br> </a></div>`);
		
	    } else {
                res.send("<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align ='center'><a href='./login.html'>login again</a></div>");
            }
        }
        else {
    
            let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
            await bcrypt.compare(req.body.password, fakePass);
    
            res.send("<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align='center'><a href='./login.html'>login again<a><div>");
        }
    } catch{
        res.send("Internal server error");
    }
});


server.listen(3000, function(){
    console.log("server is listening on port: 3000");
});
