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

// checking for errors
console.log('table created if it had not existed')

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./frontend')));

app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,'./frontend/index.html'));
});


app.post('/register', async (req, res) => {
    try{
          const c = db.prepare(`select username, password, email from userinfo where email = ?`);
          
	  const d = c.get(req.body.email);	       
        
	    if ( d === undefined) {        // checking that email does not already exists: sql query result must be undefined
           
            let hashPassword = await bcrypt.hash(req.body.password, 10);
    
            let newUser = {
                id: Date.now(),
                username: req.body.username,
                email: req.body.email,
                password: hashPassword
            };
		 
            users.push(newUser);
            console.log('User list', users);
              
		// inserting new user data into table
	    const adduser = db.prepare(`INSERT INTO userinfo (id, username, email, password) VALUES (?,?,?,?)`);
		// inserting the values from newUser into the SQL statement
	    const info = adduser.run(newUser.id, newUser.username, newUser.email, newUser.password);
	    
            console.log('this is info.changes: ' + info.changes); // outputs 1 to console if user had been successfully added

            res.send("<div align ='center'><h2>Registration successful</h2></div><br><br><div align='center'><a href='./login.html'>login</a></div><br><br><div align='center'><a href='./registration.html'>Register another user</a></div>");
        } else {
            res.send("<div align ='center'><h2>Email already used</h2></div><br><br><div align='center'><a href='./registration.html'>Register again</a></div>");
        }
    } catch (e) {
        res.send("Error: " + e.message);
    }
});

app.post('/login', async (req, res) => {
    try{
	
	const c = db.prepare(`select username, password, email from userinfo where email = ?`);
        const d = c.get(req.body.email);

	let a = JSON.stringify(d.email);

	let b = JSON.stringify(req.body.email);

	console.log(JSON.stringify(d.email) === JSON.stringify(req.body.email));   // to check if emails match and are of the same type         
	console.log("this is the result of the query: " + JSON.stringify(d.password))
	    
        if (d!= undefined && a==b) {
             console.log(req.body.password, req.body.username, req.body.email )
            let submittedPass = req.body.password; 
		console.log("This is the submittedPass" + submittedPass + typeof(submittedPass));
            
		let storedPass = d.password;
		console.log("This is storedPass" + storedPass + typeof(storedPass));
    
            const passwordMatch = await bcrypt.compare(submittedPass, storedPass);
            if (passwordMatch) {
                let usrname = d.username;
                res.sendFile(path.join(__dirname,'./frontend/checklist.html'));
                // res.send(`<div align ='center'><h2>login successful</h2></div><br><br><br><div align ='center'><h3>Hello ${usrname} </h3></div><br><br><div align='center'><a href='./login.html'>logout </a></div>`);
		
	    } 
	    else {
                res.send("<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align ='center'><a href='./login.html'>login again</a></div>");
            }
        }
        else {
    
            let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
            await bcrypt.compare(req.body.password, fakePass);
    
            res.send("<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align='center'><a href='./login.html'>login again<a><div>");
        }
    } 
	    catch(e) {
        //res.send("Error: " + e.message);
	res.send("Email not registered");
    }
});


server.listen(3000, function(){
    console.log("server is listening on port: 3000");
});
