var salient = require("../index");
var cv = require("opencv");

// Without any options
salient("assets/mona.png", function(err, saliency){
  // res is an node-opencv floating-point Matrix
  // maximum is 1, minium is 1
  var imgOutput = new cv.Matrix(saliency.width(), saliency.height);
  saliency.convertTo(imgOutput, cv.Constants.CV_8U);
  imgOutput.save("assets/output.png");
  console.log('Image saved to ./assets/output.png');
});
