import $ from 'jquery';

const W = 640;
const H = 360;


class VideoCanvas {

  constructor(el) {
  	this.videoElement = el;
  	this.windowW = window.innerWidth;
  	this.windowH = window.innerHeight;
  	this.containerRatio = W / H;

    this._init();
  }


  _createCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  _init(){
  	this.frameBuffer = this._createCanvas(W, H);
  	this.bufferCtx = this.frameBuffer.getContext("2d");
    document.body.appendChild(this.frameBuffer);
  }


  update(){
  	this.videoWidth = this.videoElement.videoWidth || W;
    this.videoHeight = this.videoElement.videoHeight || H;

    let elRatio = this.videoWidth / this.videoHeight;
    let scale, x, y;

    // define scale
    if (this.containerRatio > elRatio) {
      scale = W / this.videoWidth;
    } else {
      scale = H / this.videoHeight;
    }
    // define position
    if (this.containerRatio === elRatio) {
      x = y = 0;
    } else {
      x = (W - this.videoWidth * scale) * 0.5 / scale;
      y = (H - this.videoHeight * scale) * 0.5 / scale;
    }

    let newVideoWidth = this.videoWidth * scale;
    let newVideoHeight = this.videoHeight * scale;

    this.frameBuffer.width = newVideoWidth;
    this.frameBuffer.height = newVideoHeight;

    this.bufferCtx.clearRect(0, 0,this.windowW, this.windowH);
    this.bufferCtx.drawImage(this.videoElement, 0, 0, this.videoWidth, this.videoHeight, 0, 0, newVideoWidth, newVideoHeight);
  }

  getCanvas(){
  	return this.frameBuffer;
  }

  onResize(w, h){
    this.windowW = w;
    this.windowH = h;
  }
};
export default VideoCanvas;
