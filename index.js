/**
 * Created by Jennifer on 4/4/14.
 */
var interaction = {

  init: function() {

	$('.nav-sidebar li').click(function(e) {
		var $this = $(this);
    var $curActive = $this.siblings(".active");
    var curActiveInd = $curActive.index();
    var desiredInd = $this.index();

    /**
     * CSS Changes
     */
		$curActive.children().css("color", "#2A6496")
      .css("background-color", "")
      .hover(function() {
        $(this).css("background-color", "")},
      function() {
        $(this).css("background-color", "")});
    $curActive.removeClass("active");

		$this.addClass('active');
		$this.children().css("color", "#fff")
      .css("background-color", "#428bca")
      .hover(function() {
        $(this).css("background-color", "#23537D")},
      function(){
        $(this).css("background-color", "#428bca")});

    /**
     * Changing Viz
     */
    switch (curActiveInd + 1) {
      case 1:
        $("#viz1").hide();
        break;
      case 2:
        $("#viz2").hide();
        break;
      case 3:
        $("#viz3").hide();
        break;
    }
    switch (desiredInd + 1) {
      case 1:
        $("#viz1").removeClass("hide").show();
        break;
      case 2:
        $("#viz2").removeClass("hide").show();
        break;
      case 3:
        $("#viz3").removeClass("hide").show();
        break;
    }
  });


  },
  vizTitles: {
    titles: ["Parallel Coordinates", "Second Viz", "Third Viz"],
    subtitles: ["So cool", "what", "idk"]
  }

};
$(document).ready(interaction.init);
