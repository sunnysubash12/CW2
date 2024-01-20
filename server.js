const express = require("express");
const app = express();
const {MongoClient} = require("mongodb");

const pass = "Facebook123--123";
const uri = `mongodb+srv://sunnysubash:${pass}@cluster.cxcal2p.mongodb.net/?retryWrites=true&w=majority`;
const db_name = "school_classes_db";
const db_lesson_collection_name = "lessons";
const db_order_collection_name = "orders";


const client = new MongoClient(uri);

const fetchLessons = async (req, res) => {

    try {
        await client.connect(); 

    const db = client.db(db_name);

    const lessons_collection = db.collection(db_lesson_collection_name);

    const fetchedLessons = await lessons_collection.find({}).toArray();

    res.json(fetchedLessons);

    } catch(error){
        res.status(500).json({message: error.message});
    }
    
}

const fetchOrders = async (req, res) => {

    try {
        await client.connect(); 

    const db = client.db(db_name);

    const orders_collection = db.collection(db_order_collection_name);

    const fetchedOrders = await orders_collection.find({}).toArray();

    res.json(fetchedOrders);

    } catch(error){
        res.status(500).json({message: error.message});
    }
    
}






app.get("/lessons", fetchLessons);
app.get("/orders", fetchOrders);


const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server is listening on ${port}`);
});