// Initialize variables
var	hString = "";
var	cardName = "";
var	cardImg = "";
var	artAuthor = "";
var carddata = {};
var	artSrc = "";
var	artSaved = false;
var	cardDesc = "";
var artId = "";
var footer = "";
var clickedId = "";
var preclickColor = "";
var preclickThis = "";
var clickedThis = "";


// Scrape the news site each time a user visits the app
$.ajax({
	method: "GET",
	url: "/scrape"
})

// Set up bindings on the article cards & card elements
function makeBinding () {
  $(".myArts").click(function() {

	hString = "";
	cardName = "";
	cardImg = "";
	artAuthor = "";
	artSrc = "";

	// Save the article id for the clicked article
	artId = $(this).attr("id");

	console.log("\n in myArts art_id: " + artId);

		// Retrieve the article info including associated comments
		$.getJSON("/articles/" + artId, function(carddata) {

			cardName = carddata.title;
			cardImg = carddata.image;
			artSrc = carddata.link;
			artSaved = carddata.saved;
			cardDesc = carddata.description;

			if (cardImg) {

				console.log("image exists");

			} else {

				cardImg = "img/news-image.jpg";

			} // end if no image available

			// Assemble the comments string to be inserted via jQuery for display
			hString = cardDesc + '<br><br>Comments:<br><ol>';

			for (var i = 0; i < carddata.comments.length; i++) {

				hString += '<li class="c-item" id=' + carddata.comments[i]._id + '>' + carddata.comments[i].body + ' <i class="fa fa-pencil" aria-hidden="false"></i>';

			} // end for each comment

			// Add a closing tag to the comments string
			hString += '</ol';

			// Save action here keeps track of saved/unsaved article state
			var saveAction = "";

			if (artSaved === false) {
				saveAction = "Save Article";
			  }	else {
				saveAction = "Unsave Article"; 
			} // end saveAction assignment if/else


			// Assemble modal footer
			footer = '<button type="button" id="save" class="btn btn-default">' + saveAction + '</button><center>Read article <a href="' + artSrc + '" target="_blank">here</a> <button type="button" id="reset" class="btn btn-default" data-dismiss="modal">Close</button>';

			// Insert the article data and comments into the modal 
			$("#artName").text(cardName);
			$("#articleImg").attr('src', cardImg);
			$("#artComments").html(hString);
			$("#cardFooter").html(footer);

			// Show the article modal
			$("#articleModal").modal('toggle');	

			// Change the color of the save button based on current state
			if ($("#save").html() === "Unsave Article") {
				$("#save").css("background", "");
				$("#save").css("color", "");
			} else {
				$("#save").css("background", "#d9534f");
				$("#save").css("color", "white");
			} // end change color of save button

			// On click function to save/unsave articles
			$("#save").click(function() {

				if (saveAction === "Save Article") {

					$.ajax({
						url: '/save/' + artId,
						type: 'put'
					})
					// With that done
					.done(function(data) {
					// Log the response
					console.log(data);
					});

					saveAction = "Unsave Article";
					$("#save").text("Unsave Article");
					$("#save").css("background", "");
					$("#save").css("color", "");

			  } else {

			  		$.ajax({
			  			url: '/unsave/' + artId,
			  			type: 'put'
			  		})
			  		// With that done
			  		.done(function(data) {
			  		// Log the response
			  		console.log(data);
			  		});

			  		saveAction = "Save Article";
			  		$("#save").text("Save Article");
			  		$("#save").css("background", "#d9534f");
			  		$("#save").css("color", "white");


			  } // end save/unsave if else

			}); // end on click function save/unsave
				
		}); // end get article info callback

	}); // end binding on article cards

	// Binding on the button to add a comment
	$("#add").click(function() {

		console.log("in add");

		// Run a POST request to add the comment
		// Use the text entered in the textarea
		$.ajax({
			method: "POST",
			url: "/comment/" + artId,
			data: {
				// Value taken from title field
				title: cardName,
				//Value taken from comment textarea
				body: $("#addText").val()
			}
		})
		// With that done
		.done(function(data) {
			// Log the response
			console.log(data);

			// Clear the comment field before repopulating with current comments
			$("#artComments").empty();

			// Assemble the comments string to be inserted via jQuery for display
			cString = cardDesc + '<br><br>Comments:<br><ol>';

			  for (var i = 0; i < data.comments.length; i++) {

			  	cString += '<li class="c-item" id=' + data.comments[i]._id + '>' + data.comments[i].body + '<i class="fa fa-pencil" aria-hidden="false"></i>';
			  
			  } // End for each comment

			// Add a closing tag to the newly assembled comments string
			cString += '</ol>'
			// Insert the updated comments into the modal
			$("#artComments").html(cString);

		}); // end ajax post callback function

		// clear the textarea
		$("#addText").val("");

	}); // end on click add a comment

// use Moment to query, format and display the current date
var dateString = moment().format('dddd, MMMM Do, YYYY');
$("#date").text(dateString);

} // end binding on article cards & card elements

// Utility function to redraw a single article card
function appendCard(art_id, title, content) {

	var h = '<div class="card myArts" id="' + artId + '">';
	h += '<div class="card-header">' + title + '</div>';
	h += '<div class="card-block">';
	h += '<div class="card-text">';
	h += '<div class="panel-body">';
	h += content;
	h += '</div>';
	h += '</div>';
	h += '</div>';
	$("#articles").append(h);

} // end function appendCard

// All/Saved category menu (slider menu if screen width is exceeded)
$(".item").click(function() {

	$("#articles").html("");

	// Sets color of active menu button (All or Saved)
	if (preclickThis) {
		$(preclickThis).css('background-color', preclickColor);
	}

	clickedThis = this;
	preclickThis = clickedThis;
	preclickColor = $(clickedThis).css('background-color');

	clickedId = $(clickedThis).attr("id");

	$(clickedThis).css('background-color', '#d9534f');

  // Ajax call to get all articles
  $.getJSON("/articles", function(articles) {

  	for (var i = 0; i < articles.length; i++) {

  		cardImg = articles[i].image;

  		if (!cardImg) {

  			cardImg = "img/news-image.jpg";

  		} // end if no article image available

  		
  		// Assemble info to be displayed by the appendcard function
  		var itemString = '<img src="' + cardImg + '"width="100%">';
  		itemString += '<p>' + articles[i].description + '</p>';
  		artId = articles[i]._id;

  		// conditional to render All articles or only Saved articles
  		if (clickedId === "all") {
  			appendCard(artId, articles[i].title, itemString);

  		} else {
  			
  			if (articles[i].saved === true) {
  				appendCard(artId, articles[i].title, itemString);			
  			} // end if saved article

  		} // end if all/saved if/else

  	} // end for each article
  	
  	// remove existing bindings to prevent multiple bindings
  	$("#add").unbind("click");
  	$("#commentupdate").unbind("click");

  	makeBinding();

  }); // end of get articles callback

}); // end All/Save category menu


makeBinding();
