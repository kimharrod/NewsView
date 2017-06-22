# NewsView
View, save and comment on the latest progressive news

[NewsView.fios.vc](http://newsview.fios.vc/)

### Overview

NewsView is a full-stack one-page site implemented with node, express, handlebars and MongoDB/Mongoose.

You can start the app from the command line using "node server.js".


### User Interface


NewsView works as follows:

1. When a user arrives at the NewsView site, the latest news articles from The Progressive (http://progressive.org) are scraped and displayed.  Handlebars is used for the inital article display. Cheerio is used for the web scraping.

![NewsView landing page](http://fios.vc/NewsViewInitial.png "Landing Page") 

2. When the user clicks on an article card, a modal appears with the article title, photo, description and comments (if any), as well as a text box to add comments, a "Save/Unsave Article" button and a link to read the full article.

![NewsView modal](http://fios.vc/NewsViewModal.png "Modal")

3. The user can add a comment by typing in the text box, and clicking the "Add" button.

![NewsView add comment](http://fios.vc/NewsViewAddComment2.png "Add comment")

4. When the user hovers over an existing comment, an edit pencil icon appears. Clicking on the comment will activate the text for editing and display "OK" and "X" checkboxes to the right of the comment. After editing the text, the user checks "OK". To delete the comment, the user clicks the "X".

![NewsView edit comment](http://fios.vc/NewsViewEditComment.png "Edit comment") 

5. The user can save and unsave articles from the article modal.  A category menu at the top of the page can be used to display all articles or saved articles only.

![NewsView saved articles](http://fios.vc/NewsViewSavedArticles.png "Saved Articles")


### Dependencies and Packages

The app requires the 'express', 'express-handlebars', 'cheerio', 'mongoose', 'request', 'logger' and 'body-parser' npm packages.

The app uses MongoDB for its database and Mongoose to model the application data.
