var cv = require('opencv');

var getSalientPerChannel = function(channel, gaussianKernel, sigmaOpt){
  var width = channel.width();
  var height = channel.height();
  var floatInputMatrix = new cv.Matrix(height, width, cv.Constants.CV_32FC1);
  var signs            = new cv.Matrix(height, width, cv.Constants.CV_32FC1);
  var squaredFloat     = new cv.Matrix(height, width, cv.Constants.CV_32FC1);
  var outChannel       = new cv.Matrix(height, width, cv.Constants.CV_64F);
  var kernalL          = Math.floor(Math.min(width, height)/2)+1
  var kernelSize       = gaussianKernel || [kernalL, kernalL];
  var sigma            = sigmaOpt  || Math.min(width, height)/50;

  channel.convertTo(floatInputMatrix, cv.Constants.CV_32FC1);

  var dct = floatInputMatrix.dct();

  for(var i = 0; i < width; i++){
    for(var j = 0; j < height; j++){
      if(dct.get(i,j) < 0){
        signs.set(i, j, -1);
      } else if(dct.get(i,j) == 0){
        signs.set(i, j, 0);
      } else {
        signs.set(i, j, 1);
      }
    }
  }

  var iDct = signs.idct();

  //console.log(afterDoubleDct.getData())
  for(var i = 0; i < width; i++){
    for(var j = 0; j < height; j++){
      var v = iDct.get(i,j)
      squaredFloat.set(i,j, v * v)
    }
  }

  squaredFloat.gaussianBlur(kernelSize, sigma);

  //console.log(res);

  squaredFloat.convertTo(outChannel, cv.Constants.CV_64F);

  return outChannel;
};

var defaultOptions = {
  resize : null, // no resize
  sigma : null, // the sigma of the gaussian kernel
  gaussianKernel : null, // gaussianKernel size = imageSize
  colorSpace : "CV_BGR2Lab"
};

module.exports = function(filename, options, cb){
  if(!cb && typeof(options) === "function"){
    cb = options;
    options = {};
  }

  if(!options){
    options = {};
  }

  for(var i in defaultOptions) if(defaultOptions.hasOwnProperty(i) && typeof(options[i]) === "undefined"){
    options[i] = defaultOptions[i];
  }

  cv.readImage(filename, function(err, img) {
    if (err) return cb(err);

    if(options.resize && options.resize.length == 2){
      img.resize(options.resize[0], options.resize[1]);
    }

    var width = img.width();
    var height = img.height();

    img.cvtColor(options.colorSpace);

    var channels = img.split();
    var outChannels = [];

    //set up zero matrix
    var out = new cv.Matrix(height, width, cv.Constants.CV_64F, [0]);

    for(var chanIdx = 0; chanIdx < channels.length; chanIdx++){
      var salient = getSalientPerChannel(channels[chanIdx], options.gaussianKernel, options.sigma)
      out = out.add(salient)
    }

    out.normalize(0,1);

    return cb(null,out);

  });
};
