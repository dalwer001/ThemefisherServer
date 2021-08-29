const express = require("express");
const app = express();
const cors = require("cors");
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const ObjectID = require('mongodb').ObjectId;
require("dotenv").config();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(fileUpload());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u97y4.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const studentCollection = client.db(`${process.env.DB_NAME}`).collection("studentList");
    console.log('connect Successfully');

    app.post('/addStudent', async(req, res) => {
        const studentInfo = req.body;
        try {
            const studentExist = await studentCollection.findOne({id:studentInfo.id} && {reg:studentInfo.reg});
            if (studentExist) {
                return res.status(422).json({ error: "Student already Exist" });
            } else {
                studentCollection.insertOne(studentInfo)
                    .then(result => {
                        res.send(result.insertCount > 0)
                    });
                res.status(201).json({ message: "Student added successfully" });
            }
        }

        catch (err) {
            console.log(err);
        }
    })

    app.get('/students', (req, res) => {
        try {
            studentCollection.find({})
                .toArray((err, documents) => {
                    res.send(documents)
                })
        }
        catch (err) {
            console.log(err);
        }
    })

    app.delete('/deleteStudent/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        studentCollection.deleteOne({ _id: id })
            .then(result => {
                res.send(result.deletedCount > 0)
            })
    })

    app.get('/updateStudent/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        studentCollection.find({ _id: id })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })

    app.patch('/updateStudentInfo/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        studentCollection.updateOne({ _id: id },
            {
                $set: {
                    name: req.body.name,
                    id: req.body.studentId,
                    reg: req.body.reg,
                    image: req.body.image
                }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })

    app.get('/', (req, res) => {
        res.send("I am working");
    })

});

app.listen(PORT);