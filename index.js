import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

//To handle request and responses
const app = express();
const port = 3000;

//To access request body
app.use(bodyParser.urlencoded({ extended: true }));
//Set where static files are
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
