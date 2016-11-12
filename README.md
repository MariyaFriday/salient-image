# salient-image
Simple salient processing on top of node-opencv
> H. Xiaodi, H. Jonathan, C. Koch, Image signature: highlighting sparse salient regions, IEEE Transactions on Pattern Analysis and Machine Intelligence 34 (1) (2012) 194–200.

## pre-requisites

* opencv

## installation

```shell
npm install salient-image
```

## examples

### Examples

#### Images
| examples/input.jpg | examples/output.png | examples/output_with_options.png |
|---|---|---|
| <img src="https://raw.githubusercontent.com/piercus/salient-image/master/assets/mona.png"  width="200px"/> | <img src="https://raw.githubusercontent.com/piercus/salient-image/master/assets/output.png"  width="200px"/> | <img src="https://raw.githubusercontent.com/piercus/salient-image/master/assets/output_with_options.png"  width="200px"/> |

#### Code

```js
var salient = require("salient-image");
var cv = require("node-opencv");

// Without any options
salient("assets/mona.png", function(err, saliency){
  // res is an node-opencv floating-point Matrix
  // maximum is 1, minium is 1
  var imgOutput = new cv.Matrix(saliency.width(), saliency.height);
  saliency.convertTo(imgOutput, cv.Constants.CV_8U);
  imgOutput.save("assets/output.png");
  console.log('Image saved to ./assets/output.png');
});
```


## Example with options

```js
var cv = require("node-opencv");

// Without options
salient("assets/mona.png", {
    resize : [52, 43], // the resize size
    sigma : 0.045, // the sigma of the gaussian kernel
    gaussianKernel : [10, 10], // the size of the gaussian kernel
    colorSpace : cv.CV_LUI
  }, function(err, res){

});
```
## Algorithm Explanation

1. Resize the image if needed

``

2. Change the color space to human-like color space
3. Make a DCT (Direct Cosine Transform) over the image
4. Only consider the sign
