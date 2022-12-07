import minimist from 'minimist';
import express from 'express';
import path from 'path';

const app = express();
app.use(express.urlencoded({extended: true}));

const args = minimist(process.argv.slice(2));
const port = args.port|| 5000;

app.get('/app/', (req, res) => {
    // res.send('200 OK');
    res.sendFile(path.resolve("frontend", "index.html"));
});

app.get('*', function(req, res){
    res.send('404 NOT FOUND');
})

app.listen(port, () => console.log("Server running..."));