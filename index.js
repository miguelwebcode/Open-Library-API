import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

//To handle request and responses
const app = express();
const port = 3000;

//Configure and connect to database
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "open_library",
    password: '123456',
    port: 5432,
});
db.connect();

let booksList = [{
    id: 1,
    isbn: 1234567890123,
    title: "Title 1",
    date_read: '2024-07-05',
    rating: 8,
    summary: "summary",
    notes: "notes"
},
{
    id: 2,
    isbn: 2234567890120,
    title: "Title 2",
    date_read: '2024-07-03',
    rating: 7,
    summary: "summary 2",
    notes: "notes 2"
},]

//To access request body
app.use(bodyParser.urlencoded({ extended: true }));
//Set where static files are
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs", {books: booksList});
});

app.get("/add-new-book", (req, res) => {
    res.render("add-new-book.ejs");
});

app.post("/add", (req, res) => {
    res.redirect("/");
});

app.post("/book-detail", (req, res) => {
    res.render("book-detail.ejs");
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
