const express = require("express");
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



const fetchLessons = async (req, res, next) => {

    await client.connect();

    const db = client.db(db_name);

    const lessons_collection = db.collection(db_lesson_collection_name);

    const fetchedLessons = await lessons_collection.find({}).toArray(function (err, results) {
        if (err) {
            return next(err);
        }
        res.send(results);
    });
    console.log("lessons data is fetched");
    res.json(fetchedLessons);

}

const fetchOrders = async (req, res, next) => {

    try {
        await client.connect();


        const db = client.db(db_name);

        const orders_collection = db.collection(db_order_collection_name);

        const fetchedOrders = await orders_collection.find({}).toArray(function (err, results) {
            if (error) {
                return next(err);
            }
            res.send(results);
        });
        console.log("order data is fetched");

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

        if (!OrdersToInsert.full_name || !OrdersToInsert.phone_number || !OrdersToInsert.lessons) {
            return res.status(400).json({ message: "invalid order" });
        }

        const db = client.db(db_name);

        const orders_collection = db.collection(db_order_collection_name);

        const insertedOrders = await orders_collection.insertOne(OrdersToInsert);
        console.log("orders data is inserted");
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
        }else{
            console.log("availability is updated");
            res.status(200).json({ message: "availability is updated" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Define your route for inserting a lesson
app.post("/orders", insertorders);
app.put("/lessons/:id",putLessonAvailability);
app.get("/lessons", fetchLessons);
app.get("/orders", fetchOrders);


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on ${port}`);
});