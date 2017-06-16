// Require mongoose
var mongoose = require("mongoose");

// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({

	title: {
		type: String;
		required: true
	},
	image: {
		type: String
	},
	link: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	saved: {
		type: Boolean,
		default: false
	},
	//This only saves one comment's ObjectID. Ref refers to the Comment model.
	comments: [{
		type: Schema.Types.ObjectId,
		ref: "Comment"
	}]
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

//Export the model
module.exports = Article;
