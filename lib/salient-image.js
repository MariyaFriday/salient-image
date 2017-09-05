var cv = require('opencv');

var getSalientPerChannel = function(channel, gaussianKernel, sigmaOpt, debugFn){
  var width = channel.width();
  var height = channel.height();
  var floatInputMatrix = new cv.Matrix(height, width, cv.Constants.CV_32FC1);
  var signs            = new cv.Matrix(height, width, cv.Constants.CV_32FC1);
  var squaredFloat     = new cv.Matrix(height, width, cv.Constants.CV_32FC1);
  var outChannel       = new cv.Matrix(height, width, cv.Constants.CV_64F);
  var kernalL          = Math.floor(Math.min(width, height)/2)+1
  var kernelSize       = gaussianKernel || [kernalL, kernalL];
  var sigma            = sigmaOpt  || Math.min(width, height)/50;
  debugFn && debugFn("start");
  channel.convertTo(floatInputMatrix, cv.Constants.CV_32FC1);

  var dct = floatInputMatrix.dct();

  debugFn && debugFn("af dct");

  //var arrDct = dct.toArray();
  //debugFn && debugFn("af toArray");
  var dctW = dct.width();
  var dctH = dct.height();
  var zeros = new cv.Matrix.Zeros(dctH, dctW, cv.Constants.CV_32FC1);
  var signs = new cv.Matrix.Zeros(dctH, dctW, cv.Constants.CV_32FC1);
  var greater = new cv.Matrix.Zeros(dctH, dctW, cv.Constants.CV_32FC1);
  var lesser = new cv.Matrix.Zeros(dctH, dctW, cv.Constants.CV_32FC1);

  dct.compare(zeros, cv.Constants.CMP_GT).convertTo(greater, cv.Constants.CV_32FC1);
  dct.compare(zeros, cv.Constants.CMP_LT).convertTo(lesser, cv.Constants.CV_32FC1);

  signs.addWeighted(greater, 1/255, lesser, -1/255);

  /*for(var i = 0; i < height; i++){
    for(var j = 0; j < width; j++){
      if(arrDct[i][j][0] < 0){
        arrDct[i][j][0] = -1;
      } else if(arrDct[i][j][0] == 0){
        arrDct[i][j][0] = 0;
      } else {
        arrDct[i][j][0] = 1;
      }
    }
  }*/
  //debugFn && debugFn("bf fromArray");

  //var signs = cv.Matrix.fromArray(arrDct, cv.Constants.CV_32FC1);
  debugFn && debugFn("bf idct");

  var iDct = signs.idct();

  var squaredFloat = iDct.mul(iDct);

  squaredFloat.gaussianBlur(kernelSize, sigma);

  //console.log(res);

  squaredFloat.convertTo(outChannel, cv.Constants.CV_64F);
  debugFn && debugFn("end");

  return outChannel;
};

var defaultOptions = {
  resize : null, // no resize
  sigma : null, // the sigma of the gaussian kernel
  gaussianKernel : null, // gaussianKernel size = imageSize
  colorSpace : "CV_BGR2Lab"
};



module.exports = function(filename, options, cb){

  if(typeof(filename) === "object"){
    cb = options;
    options = filename;
    filename = options.filename;
  }

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

  var debugFn = options.debugFn;

  var onImg = function(err, img) {
    if (err) return cb(err);

    if(options.resize && options.resize.length == 2){
      img.resize(options.resize[0], options.resize[1]);
    }

    var width = img.width();
    var height = img.height();

    var channels;


    if(img.channels() === 1){
      channels = img.split();
    } else {
      img.cvtColor(options.colorSpace);
      channels = img.split();
    }

    var outChannels = [];

    //set up zero matrix
    var out = new cv.Matrix(height, width, cv.Constants.CV_64F, [0]);

    debugFn && debugFn("before getSalientPerChannel")
    for(var chanIdx = 0; chanIdx < channels.length; chanIdx++){
      var salient = getSalientPerChannel(channels[chanIdx], options.gaussianKernel, options.sigma, function(lbl){
        debugFn && debugFn("chanIdx"+chanIdx+lbl);
      })
      out = out.add(salient)
    }
    debugFn && debugFn("after getSalientPerChannel")

    out.normalize(0,1);

    return cb(null,out);

  };

  if(options.image){
    return onImg(null, options.image)
  }

  cv.readImage(filename, onImg);
};
