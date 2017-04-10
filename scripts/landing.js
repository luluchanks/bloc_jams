xvar points = document.getElementsByClassName('point');

var animatePoints = function(){

  var revealPoint = function(point) {
      point.style.opacity = 1;
      point.style.transform = "scaleX(1) translateY(0)";
      point.style.msTransform = "scaleX(1) translateY(0)";
      point.style.WebkitTransform = "scaleX(1) translateY(0)";
  }
  for(var i=0; i < points.length; i++){
    revealPoint(points[i]);
  }
}
