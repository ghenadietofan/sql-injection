const express = require('express');
const path = require('path');
const pgp = require('pg-promise')(/* options */)
const session = require('express-session');
const bodyParser = require('body-parser');
const db = pgp('postgres://postgres:postgres@localhost:5432/postgres')

const app = express();
const PORT = process.env.PORT || 3000;
async function tableInit(){
    try{
        const query = `CREATE TABLE IF NOT EXISTS  public."Users"("ID" SERIAL PRIMARY KEY, "USERNAME" VARCHAR(255) UNIQUE NOT NULL, "PASSWORD" VARCHAR(255) UNIQUE NOT NULL )`
        const result = await db.query(query)
        console.log('Success.')
    }
    catch (err){
        console.log("Error:",err)
    }
}
async function userInit(){
    try{
        const result = await db.one(`SELECT COUNT(*) FROM public."Users"`);
        if(result.count>0){
            await db.none(`TRUNCATE public."Users"`)
        }
        await db.none(`INSERT INTO public."Users"("ID", "NAME", "PASSWORD") VALUES ('1','Iryna','123'),('2','Anastasia','222'),('3','Sofia','010'),('4','admin','111')`);
        console.log('Users added successfully.')
    }catch (err){
        console.log("Error in userInit",err);
    }
}

tableInit();
userInit();
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());

//connect to database
app.use(bodyParser.urlencoded({ extended: true }));



// placeholder for getting all rows from db table
app.get('/log-rows', async (req, res) => {
    try{
        const rows = await db.any('SELECT * FROM public."Users";')
        rows.forEach(row =>{
            res.send(row);
       });
    }catch (err){
        console.log(err);
        res.status(500).send('Error when trying to get all rows from db')
    }
})


//

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.post('/login',async (req,res)=>{
    const {username, password} = req.body;
    console.log('username:',username);
    console.log('password:',password);
    const user = await db.any(`SELECT * FROM public."Users" WHERE "NAME" = '${username}' AND "PASSWORD" = '${password}'`);
    if(user.length>0){
    req.session.loggedin = true;
    req.session.username = username;
        res.redirect('/profile');
    }
    else{
        res.send("Incorrect Username and Password. Please, try again...")
    }

})



app.get('/profile',(req,res)=>{
 //   res.send(`Welcome ${req.session.user.username}`);
    console.log('Logged In')
    res.sendFile(path.join(__dirname, '/components/profile.html'));


})
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '/')));

// Define a route to serve the index.html file


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});