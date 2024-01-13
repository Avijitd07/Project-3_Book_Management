const express = require("express");
const bodyParser = require("body-parser");
const route = require("./routes/route.js");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");

//dotenv config
dotenv.config();
//db config
connectDB();
const app = express();
app.use(bodyParser.json());

app.use("/", route);

const PORT = process.env.PORT || 8080;
app.listen(process.env.PORT || 8080, function () {
  console.log("Express app running on port " + (process.env.PORT || 8080));
});
