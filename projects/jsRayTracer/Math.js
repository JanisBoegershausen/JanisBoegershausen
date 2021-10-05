function random(minV, maxV) {
  var num = Math.random();
  return Remap(0, 1, minV, maxV);
}

function Remap(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) / (out_min - in_min) * (out_max - in_max) + in_max;
}