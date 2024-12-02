const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 3000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://cv247:Dh2O6MrGyCOex8Ig@cluster0.jhokv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let db;
let lessonsCollection;
let ordersCollection;

const app = express();
app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
});
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

client.connect()
.then(()=>{
    db = client.db('cst3144');
    lessonsCollection = db.collection('lesson');
    ordersCollection = db.collection('order');
    console.log('Connected to MongoDB Atlas');
    // getLessons();

}).
catch((err)=>{
    console.log(err);
})

// middleware

// app.use(express.static('public'));
app.use('/public', express.static(path.join(__dirname, '../cst3144frontend/public')));
app.use(morgan('dev'));
app.use(bodyParser.json());


app.get('/', (req, res)=>{
    // res.sendFile('../views/index.html', {root: __dirname});
    res.sendFile(path.join(__dirname, '../cst3144frontend/views/index.html'));
})
app.get('/lessons', async (req, res)=>{
    try {
        const lessons = await getLessons();
        console.log(lessons);
        res.json(lessons);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

// full text search feature

app.get('/search', async (req, res)=>{
    const query = req.query.query.toLowerCase();
    if(!query){
        return res.status(400).send('Query Parameter is required');
    }
    try {
        const regex = new RegExp(query, 'i');
        const searchedLessons = await lessonsCollection.find({
            $or:[
                {name: {$regex: regex}},
                {locat: {$regex: regex}},
                {price: {$regex: regex}},
                {spaces: {$regex: regex}},
            ]
        }).toArray();
        res.json(searchedLessons);
    } catch (error) {
        console.log(error);
    }
    
})

// create order

app.post('/order', async (req, res) => {
    const newOrder = req.body;
    console.log('Received new order:', newOrder);
    try {
        const result = await ordersCollection.insertOne(newOrder);
        console.log('inserted order result', result);
        if(result.insertedId){
            const insertedOrder = await ordersCollection.findOne({ _id: result.insertedId }); 
            res.status(201).json(insertedOrder);
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Error creating order');
    }
})

// update lesson
app.put('/lessons', async (req,res) => {
    const updatedLessons = req.body;
    
    try{
        // bulk operations for updating lessons
        const bulkOps = updatedLessons.map(lesson => { 
            const { id, _id, ...fieldsToUpdate } = lesson; 
            // Extract id, _id and fields to update 
            return { 
                updateOne: { 
                    filter: { id }, 
                    update: { $set: fieldsToUpdate } 
                    // Use $set to update only provided fields excluding _id 
                    } 
                }; 
            });

        // Execute the bulk write operations
        const result = await lessonsCollection.bulkWrite(bulkOps);
        console.log(result);
        res.status(200).json(result);

    }
    catch(error){
        console.log(error);
        res.status(500).send('Error updating lessons');
    }
})

// get lessons

async function getLessons() { 
    try { 
        const lessons = await lessonsCollection.find().toArray(); 
        // console.log('Lessons:', lessons); 
        return lessons
    } 
    catch (err) { 
        console.error('Failed to fetch lessons:', err); 
    }}