const express = require("express");
const fs = require('fs');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const propertiesReader = require("properties-reader");
const path = require("path");
const propertiesPath = path.resolve(__dirname, "conf/db.properties");
const properties = propertiesReader(propertiesPath);
app.use(cors({ origin: "*" }));
app.use(express.json());

let dbPprefix = properties.get("db.prefix");
//for potential special characters
let dbUrl = properties.get("db.dbUrl");
let dbParams = properties.get("db.params")
//URL-Encoding of User and PWD
const username = encodeURIComponent(properties.get("db.user"));
const pass = encodeURIComponent(properties.get("db.pwd"));
const uri = dbPprefix + username + ":" + pass + dbUrl + dbParams;
const db_name = properties.get("db.dbName");
const db_lesson_collection_name = "lessons";
const db_order_collection_name = "orders";

const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

const fetchLessons = async (req, res) => {

    await client.connect();

    const db = client.db(db_name);

    const lessons_collection = db.collection(db_lesson_collection_name);

    const fetchedLessons = await lessons_collection.find({}).toArray();
    res.json(fetchedLessons);

}

const fetchOrders = async (req, res) => {

    try {
        await client.connect();


        const db = client.db(db_name);

        const orders_collection = db.collection(db_order_collection_name);

        const fetchedOrders = await orders_collection.find({}).toArray();

        res.json(fetchedOrders);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}
const insertorders = async (req, res) => {
    try {
        await client.connect();

        // Assuming req.body contains the data you want to insert
        const OrdersToInsert = req.body;

        if (!OrdersToInsert.full_name || !OrdersToInsert.phone_number || !OrdersToInsert.lessons || !OrdersToInsert.number_of_items) {
            return res.status(400).json({ message: "invalid order" });
        }

        const db = client.db(db_name);

        const orders_collection = db.collection(db_order_collection_name);

        const insertedOrders = await orders_collection.insertOne(OrdersToInsert);
        res.json(insertedOrders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const putLessonAvailability = async (req, res) => {
    try {
        await client.connect();
        const lesson_id = req.params.id;

        const { availability } = req.body;

        const db = client.db(db_name);

        const lessons_collection = db.collection(db_lesson_collection_name);

        if (!req.body.availability) {
            return res.status(400).json({ message: "invalid field" });
        }

        const lesson_result = await lessons_collection.updateOne(
            {
                _id: new ObjectId(lesson_id)
            },
            {
                $set: { availability: availability }
            }
        );

        if (lesson_result.matchedCount === 0) {
            res.status(404).json({ error: "lesson not found" });
        } else {
            res.status(200).json({ message: "availability is updated" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const imageMiddleware = (req, res, next) => {
    // Assuming the image path is provided in the request URL
    const imagePath = path.join(__dirname, './images', req.params.imageName);

    // Check if the file exists
    fs.access(imagePath, fs.constants.F_OK, (error) => {
        if (error) {
            // If the file does not exist, send a 404 response
            res.status(404).send('Image not found');
        } else {
            // If the file exists, send the image as a response
            res.sendFile(imagePath);
        }
    });
};

app.use((req, res, next) => {
    const { method, originalUrl, protocol } = req;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${method} ${originalUrl} - ${protocol}://${req.get('host')}${req.originalUrl}]\n`);
    next();
});



// Use the imageMiddleware for a specific route
app.get('/images/:imageName', imageMiddleware);
app.post("/orders", insertorders);
app.put("/lessons/:id", putLessonAvailability);
// Define your route for getting a lesson
app.get("/lessons", fetchLessons);
app.get("/orders", fetchOrders);

//start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on ${port}`);
});