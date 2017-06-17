// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");

// Make use of native Promises that ES6 provides
mongoose.promise = Promise;

// Require the Article and Comment models
var Article = require("./models/Article.js");
var Comment = require("./models/Comment.js");

// Initialize Express
var app = express();

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


