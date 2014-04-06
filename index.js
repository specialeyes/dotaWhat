/**
 * Created by Jennifer on 4/4/14.
 */
var interaction = {

  init: function() {

	$('.nav-sidebar li').click(function(e) {
		var $this = $(this);
		$this.siblings(".active").children("a").css("color", "#2A6496");
		$this.siblings(".active").children("a").css("background-color", "");  
		$this.siblings(".active").children("a").hover(function() {$(this).css("background-color", "")}, function(){$(this).css("background-color", "")}); 
		$this.siblings(".active").removeClass("active");
  
		$this.addClass('active');
		$this.children("a").css("color", "#fff");
		$this.children("a").css("background-color", "#428bca");
		$this.children("a").hover(function() {$(this).css("background-color", "#23537D")}, function(){$(this).css("background-color", "#428bca")}); 
});
  
/**	$(.nav-sidebar).children().click(function(this) {
		this.parent().siblings(".active").removeClass("active");
		this.addClass("active");
		});
  */
  },
  vizTitles: {
    titles: ["Parallel Coordinates", "Second Viz", "Third Viz"],
    subtitles: ["So cool", "what", "idk"]
  }

};
$(document).ready(interaction.init);
