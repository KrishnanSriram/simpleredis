const express = require('express');
const redis = require('redis');
const uuidv4 = require('uuid/v4');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const client = redis.createClient();
const app = express();

require('dotenv').config();
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

const publisher = redis.createClient(6379, '192.168.80.236');

publisher.on("error", function(error) {
    console.error(error);
});
// SET STORAGE
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        //file.fieldname + '-' + Date.now()
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.status(200).send({ 'message': 'Try another URI' });
});

app.post('/load', async (req, res) => {
    const data = req.body;
    console.dir(req.body);
    const id = req.body.id;
    console.log("New ID is", id);
    // return res.status(201).json({id});
    // const result = await publisher.set("test", "some sample text", redis.print);
    const result = await publisher.hmset(id, req.body, (err, result) => {
        if(err) {
            console.log('ERROR: failed to load contents');
            console.log(err);
            res.status(500).json(err);
        }
        else {
            console.log('SUCCESS: Loaded contents into collection');
            console.log(result);
            return res.status(201).json({result});
        }
    });
});

app.get('/load', async(req, res) => {
    const key = "asjhdfw873465askfjb";
    const response = await publisher.hgetall(key);
    console.log(response);
    return res.status(200).json(response);
})

app.listen(process.env.PORT, () => {
    console.log(`Redis PUBLISHER NodeJS application in port ${process.env.PORT}`);
});
