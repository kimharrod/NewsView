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

// Routes
// ======

// A GET request to scrape the progressive.org website
app.get("/scrape", function(req, res) {
	// First get the body of the html with request
	request("http://progressive.org/dispatches", function(error, response, html) {
		// Then load that into cheerio and save it to $ for a shorthand selector
		var $ = cheerio.load(html);
		// Now grab every p within the mp-classiclist, and do the following:
		$(".mp-classiclist p.mp-description").each(function(i, element) {

			// Save an empty result object
			var result = {};

			// Add the title, link, image and description of every article
			// Save them as properties of the result object
			result.title = $(this).children("a").attr("title");
			result.link = $(this).children("a").attr("href");
			result.image = $($(this).parent()).parent().find(".mp-lazyload").attr("src");
			// Remove the "more" at the end of the description
			var str = $(this).text();
			result.description = str.slice(0, -4);

			console.log("\nImage URL: " + result.image);

			console.log(JSON.stringify(result));

			// Check to see if an article with title already exists in the database
			Article.count({ title: result.title }, function (err, count) {

				// If it isn't a duplicate, then:
				if (count < 1) {

					// Using our Article model, create a new entry
					// This effectively passes the result object to the entry
					// (including the title, image, description and link)
					var entry = new Article(result);

					// Save entry to the db
					entry.save(function(err, doc) {

						// Log any errors
						if (err) {
							console.log(err);
						}

						// Or log the doc
						else {
							console.log(doc);
						}
					});

				} //end if count < 1
			}); // end Article.count	

		});
	});

	// Tell the browser that we finished scraping the text
	res.send("Scrape Complete");
});

// Route to get the scraped articles from the mongoDB
app.get("/articles/", function(req, res) {
	// Get all docs in the Articles array
	Article.find({}, function(error, doc) {

		// Log any errors
		if (error) {
			console.log(error);
		}
		else {
			res.json(doc);
		}
	});
});


