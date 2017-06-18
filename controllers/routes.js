// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");

// Require the Article and Comment models
var Article = require("../models/Article.js");
var Comment = require("../models/Comment.js");

// Set up the router middleware
var router = express.Router();

// Handlebars-related root route
router.get("/", function(req, res) {

	//Grab every doc in the Articles array
	Article.find({}, function(error, doc) {
		//Log any errors
		if (error) {
			console.log(error);
		}
		// or send the doc to the browser as a JSON object
		else {
			var data = {
			  articles: []
			};

		  for (var i = 0; i < doc.length; i++) {
		  	var cardImg = doc[i].image;

		  	if (!cardImg) {

		  		cardImg = "img/news-image.jpg";  		
		    
		    } // end if no article image provided

		data.articles.push({'id': doc[i]._id, 'title': doc[i].title, 'image': cardImg, 'description': doc[i].description});

		} // end for each article

		// send the results to handlebars to be rendered
		res.render("index", data);
		}
  	});
});

// A GET request to scrape the progressive.org website
router.get("/scrape", function(req, res) {
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

// Route to retrieve scraped articles from the mongoDB
router.get("/articles/", function(req, res) {
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

// Route to retrieve a single article by ObjectID
router.get("/articles/:id", function(req, res) {

	// Using the id passed in the id parameter, 
	// Prepare a db query that finds the matching article
	Article.findOne({ "_id": req.params.id })

	// Populate all of the comments associated with it
	.populate("comments")

	// And execute the query
	.exec(function(error, doc) {
		//log any errors
		if (error) {
			console.log(error);
		}
		else {
			res.json(doc);
		}
	});	
});

// Create a new comment
router.post("/comment/:id", function(req, res) {

	// Create a new comment and pass the req.body to the entry
	var newComment = new Comment(req.body);

	// Save the new comment to the database
	newComment.save(function(error, doc) {
		//Log any errors
		if (error) {
			console.log(error);
		}
		// Otherwise
		else {
			// Find our article and push the new comment id into the comments array
			Article.findOneAndUpdate({"_id": req.params.id}, { $push: { "comments": doc.id } }, { new: true})
			// And populate all of the comments associated with it
			.populate("comments")
			// Execute the query above
			.exec(function(err, doc) {
				// Log any errors
				if (error) {
					console.log(error);
				}
				else {
					// Or send the document to the browser
					res.send(doc);
				}
			});
		}
	});
});

// Route to save an article
router.put("/save/:id", function(req, res) {

	var art = req.params;

	   Article.update({ "_id": art.id }, { "saved": true })
	     // Execute the query above
	     .exec(function(err, doc) {
	     	// Log any errors
	     	if (error) {
	     		console.log(error);
	     	}
	     	else {
	     		// Or send the document to the browser
	     		res.send(doc);
	     	}
	     });
}); // end save 

// Route to unsave an article
router.put("/unsave/:id", function(req, res) {

	var art = req.params;

	   Article.update({ "_id": art.id }, { "saved": false})
	   // Execute the query above
	     .exec(function(err, doc) {
		   	  // Log any errors
		   	  if (error) {
		   	  	console.log(error);
		   	  }
		   	  else {
		   	  	// Or send the document to the browser
		   	  	res.send(doc);
		   	  }
	   });
}); // end unsave

// Route to update a comment
router.put("/commentupdate/:id", function(req, res) {
	var cmnt = req.params;

	console.log("comment: " + req.body.item);

	Comment.findOneAndUpdate({ "_id": cmnt.id }, { "body": req.body.item })
	// Execute the query above
	.exec(function (error, doc) {
		// Log any errors
		if (error) {
			console.log(error);
		}
		else {
			// Or send the document to the browser
			console.log("response sent: " + JSON.stringify(doc));
			res.send(doc);
		}
	});
}); // end comment update

// Export routes for server.js to use
module.exports = router;



