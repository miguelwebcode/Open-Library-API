import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import env from "dotenv";

//To handle request and responses
const app = express();
const port = 3000;
const API_URL = "https://covers.openlibrary.org/b/isbn/";
const SIZE = "L";
env.config();

//Configure and connect to database
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

let booksList = [
  {
    id: 1,
    isbn: 1234567890123,
    title: "Title 1",
    date_read: "2024-07-05",
    rating: 8,
    summary: "summary",
    notes: "notes",
  },
  {
    id: 2,
    isbn: 2234567890120,
    title: "Title 2",
    date_read: "2024-07-03",
    rating: 7,
    summary: "summary 2",
    notes: "notes 2",
  },
];

//To access request body
app.use(bodyParser.urlencoded({ extended: true }));
//Set where static files are
app.use(express.static("public"));

async function getBooks() {
  const result = await db.query("SELECT * FROM books ORDER BY id ASC");
  const booksWithFormattedDates = formatAllBooksDates(result.rows);
  return booksWithFormattedDates;
}

function formatAllBooksDates(arrayOfObjects) {
  const result = [];
  arrayOfObjects.forEach((book) => {
    book = getBookWithFormatDate(book);
    result.push(book);
  });
  return result;
}

function getBookWithFormatDate(book) {
  const date = new Date(book.date_read);
  var year = date.getFullYear();
  var month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0 based
  var day = date.getDate().toString().padStart(2, "0");

  var formattedDate = year + "-" + month + "-" + day;
  book.date_read = formattedDate;
  return book;
}

app.get("/", async (req, res) => {
  booksList = await getBooks();
  res.render("index.ejs", { books: booksList });
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
    await db.query(
      "INSERT INTO books (isbn, title, date_read, rating, summary, notes, cover_image) VALUES ($1, $2, $3, $4, $5, $6, $7);",
      [isbn, title, date_read, rating, summary, notes, cover_image]
    );
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/book-detail", async (req, res) => {
  const bookId = req.body.bookId;
  const result = await db.query("SELECT * FROM books WHERE id = $1", [bookId]);
  let book = result.rows[0];
  book = getBookWithFormatDate(book);
  res.render("book-detail.ejs", { book: book });
});

app.post("/edit", async (req, res) => {
  const bookId = req.body.bookId;
  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [
      bookId,
    ]);
    let book = result.rows[0];
    book = getBookWithFormatDate(book);
    res.render("edit-book.ejs", { book: book });
  } catch (error) {
    console.log(error);
  }
});

app.post("/update", async (req, res) => {
  const bookId = req.body.bookId;
  const isbn = req.body.isbn;
  const title = req.body.title;
  const date_read = req.body.dateRead;
  const rating = req.body.rating;
  const summary = req.body.summary;
  const notes = req.body.notes;
  const cover_image = `${API_URL}${isbn}-${SIZE}.jpg`;

  try {
    await db.query(
      "UPDATE books SET isbn = $2, title = $3, date_read = $4, rating = $5, summary = $6, notes = $7, cover_image = $8  WHERE id = $1",
      [bookId, isbn, title, date_read, rating, summary, notes, cover_image]
    );
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete", async (req, res) => {
  const bookId = req.body.bookId;
  try {
    await db.query("DELETE FROM books WHERE id = $1", [bookId]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
