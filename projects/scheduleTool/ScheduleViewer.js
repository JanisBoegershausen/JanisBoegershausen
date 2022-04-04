function setup() {
  // Create a canvas fitting into the schedule-canvas element
  var sketchHolder = document.getElementById("schedule-canvas");
  var canvas = createCanvas(sketchHolder.offsetWidth, sketchHolder.offsetHeight);
  canvas.parent("schedule-canvas");
}

function draw() {
  // Resize canvas in case the windows was rezised
  var sketchHolder = document.getElementById("schedule-canvas");
  resizeCanvas(sketchHolder.offsetWidth, sketchHolder.offsetHeight);

  // Clear
  background(20, 22, 25);

  // Draw entries (automate later)
  DrawScheduleEntry(0, 7, 50, 25, 200, "Sleep");
  DrawScheduleEntry(9, 11, 100, 215, 60, "Writing");
  DrawScheduleEntry(11, 13, 130, 0, 155, "Editing");
  DrawScheduleEntry(13, 17, 180, 100, 20, "Game Dev");
  DrawScheduleEntry(17, 19, 50, 165, 255, "Other");
  DrawScheduleEntry(22, 24, 50, 25, 200, "Sleep");

  // Draw time indicators
  for (var i = 0; i < 24; i += 1) {
    var xPos = (i / 24) * width;
    fill(0, 0, 0, 100);
    noStroke();
    rect(xPos, 0, 5, 15);

    fill(0, 0, 0, 150);
    textSize(30);
    noStroke();
    strokeWeight(0);
    text(i, xPos, 35);
  }

  // Get X position of the current time of day
  var currentTimeX = (new Date().getHours() / 24 + new Date().getMinutes() / 60 / 24) * width;

  // Daw a line at the currentTimeX position
  fill(255, 255, 255, 150);
  stroke(0, 0, 0, 150);
  strokeWeight(1);
  rect(currentTimeX - 2, -10, 4, height + 20);
}

function DrawScheduleEntry(startTime, endTime, r, g, b, label) {
  // Convert time to pixels in canvas
  var start = (startTime / 24) * width;
  var end = (endTime / 24) * width;

  // Calculate width and center
  var w = end - start;
  var center = start + w / 2;

  // Check if mouse is hovering this entry
  var isHovered = mouseX < end && mouseX > start && mouseY > 0 && mouseY < height;

  // Draw shadow rect
  noStroke();
  fill(r * 0.75 * (isHovered ? 1.5 : 1), g * 0.75 * (isHovered ? 1.5 : 1), b * 0.75 * (isHovered ? 1.5 : 1));
  rect(start, 0, w, height);

  // Draw actuall bar rect
  noStroke();
  fill(r * (isHovered ? 1.5 : 1), g * (isHovered ? 1.5 : 1), b * (isHovered ? 1.5 : 1));
  rect(start, 0, w, height - 10);

  // Draw label
  textSize(40);
  textAlign(CENTER, CENTER);
  noStroke();
  fill(r * 0.5, g * 0.5, b * 0.5);
  text(label, center, height / 2 - 2.5);
}
