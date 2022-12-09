const minimist = require('minimist');
const express = require('express');
const http = require('http');
const bcrypt = require('bcrypt');
const path = require("path");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const users = require('./data').userDB;
const database = require('better-sqlite3');
const app = express();
const server = http.createServer(app);
const db = new database('users.db'); 
const args = minimist(process.argv.slice(2));
const port = args.port|| 3000;

// app.get('/app/', (req, res) => {
//     // res.send('200 OK');
//     res.sendFile(path.resolve("frontend", "login-page.html"));
// });



// app.listen(port, () => console.log("Server running..."));

    // creating a database to store users data 

// creating a user info table 
const stmt = ` CREATE TABLE IF NOT EXISTS userinfo (
		     id INTEGER PRIMARY KEY, 
		     username TEXT, 
		     email TEXT, 
		     password TEXT,
		     login_history LONGTEXT,
		     last_login TEXT
	);`

db.exec(stmt);

// checking for errors
console.log('table created if it had not existed')
const accesslog = fs.createWriteStream('./access.log', {flags:'a'});
morgan.token("username", function getCode(req) {
	                 return 'admin'; 
});

        app.use(morgan(':date[clf] :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms :username', {stream: accesslog}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./frontend')));

app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,'./frontend/index.html'));
});

app.get('/app',(req,res) => {
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
                password: hashPassword,
		login_history: Date.now().toString(), //SQL doesn't like arrays so login history is stored as LONGTEXT where every set of 13 numbers is a Date.now() entry. The first 13 characters will be the registration date, the next 13 are the next login, last 13 are most recent login
		last_login: Date.now().toString()
            };
		 
            users.push(newUser);
            console.log('User list', users);
              
		// inserting new user data into table
	    const adduser = db.prepare(`INSERT INTO userinfo (id, username, email, password, login_history, last_login) VALUES (?,?,?,?,?,?)`);
		// inserting the values from newUser into the SQL statement
	    const info = adduser.run(newUser.id, newUser.username, newUser.email, newUser.password, newUser.login_history, newUser.last_login);
	    
            console.log('this is info.changes: ' + info.changes); // outputs 1 to console if user had been successfully added

            res.send("<div align ='center'><h2>Registration successful</h2></div><br><br><div align='center'><a href='./login.html'>login</a></div><br><br><div align='center'><a href='./registration.html'>Register another user</a></div>");
        } else {
            res.send("<div align ='center'><h2>Email already used</h2></div><br><br><div align='center'><a href='./registration.html'>Register again</a><br><a href='./login.html'>Login</a><br></div>");
        }
	
	const x = db.prepare(`select username, password, email from userinfo where email = ?`);

	const y = x.get(req.body.email);
	morgan.token("username", function getCode(req) {
		 return y.username;
	 });

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
		//var new_log = Date.now().toString()
		//var q1 = `UPDATE userinfo SET last_login = ` + new_log + ` WHERE email = req.body.email`
		//var q2 = `UPDATE userinfo SET login_history = login_history` + last_login `WHERE email = req.body.email`
		//const g = db.query(q1)
		//const f = db.query(q2)
		
		morgan.token("username", function getCode(req) {
			 return d.username;
                });

                res.sendFile(path.join(__dirname,'./frontend/checklist.html'));
		
	    } 
	    else {
                res.send("<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align ='center'><a href='./login.html'>login again</a></div>");
            }
        }
        else {
    
            let fPass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfgagdfgdfgdfg`;
            await bcrypt.compare(req.body.password, fPass);
    
            res.send("<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align='center'><a href='./login.html'>login again<a><div>");
        }
    } 
	    catch(e) {
        //res.send("Error: " + e.message);
	res.send("<div align ='center'><h2>Email not registered</h2></div><br><br><div align='center'><a href='./registration.html'>Register</a><br><a href='./login.html'>Login</a><br></div>");
    }
});


app.listen(port, function(){
    console.log("server is listening on port: ", port);
});
