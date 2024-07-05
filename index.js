import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

//To handle request and responses
const app = express();
const port = 3000;
const API_URL = "https://covers.openlibrary.org/b/isbn/";
const SIZE = "L";

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

async function getBooks() {
    const result = await db.query("SELECT * FROM books");
    const booksWithFormattedDates = getBooksWithFormatDates(result.rows);
    return booksWithFormattedDates;
}

function getBooksWithFormatDates(arrayOfObjects) {
    const result = [];
    arrayOfObjects.forEach((book) => {
        const date = new Date(book.date_read);
        var year = date.getFullYear();
        var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0 based
        var day = date.getDate().toString().padStart(2, '0');

        var formattedDate = day + '-' + month + '-' + year;
        book.date_read = formattedDate;
        result.push(book);
    });

    return result;
}


app.get("/", async (req, res) => {
    booksList = await getBooks();
    res.render("index.ejs", {books: booksList});
});

app.get("/add-new-book", (req, res) => {
    res.render("add-new-book.ejs");
});

app.post("/add", async (req, res) => {
    //Get body values
    const isbn = req.body.isbn;
    const title = req.body.title;
    const date_read = req.body.dateRead;
    const rating = req.body.rating;
    const summary = req.body.summary;
    const notes = req.body.notes;
    const cover_image = `${API_URL}${isbn}-${SIZE}.jpg`;

    //Insert into db
    try {
        await db.query("INSERT INTO books (isbn, title, date_read, rating, summary, notes, cover_image) VALUES ($1, $2, $3, $4, $5, $6, $7);", 
            [isbn, title, date_read, rating, summary, notes, cover_image]);
        res.redirect("/");
    } catch (error) {
        console.log(error);
    }
});

app.post("/book-detail", (req, res) => {
    const bookId = req.body.bookId;
    res.render("book-detail.ejs");
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
