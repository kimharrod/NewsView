// Set up the router middleware
var router = express.Router();

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

// Route to retrieve scraped articles from the mongoDB
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

// Route to retrieve a single article by ObjectID
app.get("/articles/:id", function(req, res) {

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



