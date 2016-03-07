function EaseNumber(value, easing) {
  this.value = value;
  this.targetValue = value;
  this.easing = easing;
}


var p = EaseNumber.prototype;


p.getValue = function(value) {
  return this.value;
}


p.setValue = function(value) {
  this.targetValue = value;
}

p.getTargetValue = function() {
  return this.targetValue;
}


p.setTo = function(value) {
  this.targetValue = this.value = value;
}


p.update = function() {
  this.value += (this.targetValue - this.value) * this.easing;
}

export default EaseNumber;
