// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require('morgan');

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const guitarsRoutes = require("./routes/guitars");
const favoriteRoutes = require("./routes/myFavorites")
const loginRoute = require("./routes/login");
const registerRoute = require("./routes/register");
const searchRoute = require("./routes/search");
const newProductRoute = require("./routes/newListing");
const contactOwner = require("./routes/contact");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/", usersRoutes(db));
app.use("/api/", guitarsRoutes(db));
app.use("/myFavorites", favoriteRoutes(db));
app.use("/login", loginRoute(db));
app.use("/register", registerRoute(db));
app.use("/search", searchRoute(db));
app.use("/newProduct", newProductRoute(db));
app.use("/contactSeller", contactOwner(db));
// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
  res.render("index");
});

//Query to return user's listings
const getMyListings = function(user) {
  const sqlQuery = `SELECT * FROM guitars
  JOIN users ON users.id = guitars.seller_id
  WHERE users.id = $1
  LIMIT 10`
  const values = [user.id];
  return pool.query(sqlQuery, values)
  .then(res => res.rows)
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
