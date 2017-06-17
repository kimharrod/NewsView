// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Make use of native Promises that ES6 provides
mongoose.promise = Promise;

// Require the Article and Comment models
var Article = require("./models/Article.js");
var Comment = require("./models/Comment.js");

// Initialize Express
var app = express();
var PORT = process.env.PORT || 8099;

// Set up Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use morgan and body parser
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
	extended: false
}));

// Make public a static directory
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/newsview");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
	console.log("Mongoose Error: ", error);
});

// When successfully logged in to the db via mongoose, log message
db.once("open", function() {
	console.log("Mongoose connection successful.");
});

// Import routes and give the server access to them
var routes = require("./controllers/routes.js");

app.use("/", routes);

// Start the server to begin listening
app.listen(PORT, function() {
	console.log("App listening on PORT " + PORT);
});

