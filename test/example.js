var salient = require("../index");
var cv = require("opencv");

// Without any options
salient("assets/mona.png", function(err, saliency){
  // saliency is an node-opencv floating-point Matrix
  // maximum is 1, minium is 1
  var width = saliency.width(), height =  saliency.height();
  var imgOutput = new cv.Matrix(width, height, cv.Constants.CV_8U);

  // convert floating point to grey scale Matrix
  saliency.convertTo(imgOutput, cv.Constants.CV_8U, 255);
  imgOutput.save("assets/output.png");
  console.log('Image saved to ./assets/output.png');
});

// With options
salient("assets/mona.png", {
    resize : [200, 200], // the resize size
    sigma : 0.045, // the sigma of the gaussian kernel
    gaussianKernel : [11, 11] // the size of the gaussian kernel
  }, function(err, saliency){
    // saliency is an node-opencv floating-point Matrix
    // maximum is 1, minium is 1
    var width = saliency.width(), height =  saliency.height();
    var imgOutput = new cv.Matrix(width, height, cv.Constants.CV_8U);

    // convert floating point to grey scale Matrix
    saliency.convertTo(imgOutput, cv.Constants.CV_8U, 255);
    imgOutput.save("assets/output_with_options.png");
    console.log('Image saved to ./assets/output_with_options.png');
});
