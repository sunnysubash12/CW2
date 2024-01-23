const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const propertiesReader = require("properties-reader");
const path = require("path");
const { error } = require("console");
const propertiesPath = path.resolve(__dirname, "conf/db.properties");
const properties = propertiesReader(propertiesPath);
app.use(cors());

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

    try {
        await client.connect();

        const db = client.db(db_name);

        const lessons_collection = db.collection(db_lesson_collection_name);

        const fetchedLessons = await lessons_collection.find({}).toArray();

        res.json(fetchedLessons);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

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

        res.json(fetchedOrders);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}






app.get("/lessons", fetchLessons);
app.get("/orders", fetchOrders);


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on ${port}`);
});