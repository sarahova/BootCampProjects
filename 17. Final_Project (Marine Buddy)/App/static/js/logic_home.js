$( document ).ready(function() {
    console.log( $(".navbar-toggler").on("click", function(){
        $("#navbarNavAltMarkup").toggleClass("show")
      }));

  $('.flexslider').flexslider({
    animation: "slide"
  });
  // $("body").append('<div class="mbTitleWrap""><img src="/static/img/mbicon2@4x.png"><h1 class="mbTitle">Marine Buddy</h1></div>');
  $("body").append('<div class="mbTitleWrap""><img class="mainLogo" src="/static/img/mbicon2@4x.png"></div>');
  $("body").append('<a href="#topOfPage"><div id="backToTop"><img src="/static/img/arrows.png"></div></a>');
var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
var currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.getElementById("backToTop").style.right = "-100px";
  } else {
    document.getElementById("backToTop").style.right = "10px";
  }
  prevScrollpos = currentScrollPos;
}



});

