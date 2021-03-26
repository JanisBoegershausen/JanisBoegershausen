// Returns if the mouse is inside a given rectangle.
function RectIsHovered(x, y, w, h) {
    return mouseX > x && mouseX < x + w &&
        mouseY > y && mouseY < y + h;
}

// Format a number into its roman equivalent (currently not fully correct)
function FormatResearchLevel(level) {
    out = "";
    while (level > 0) {
        if (level >= 10) {
            out += "X";
            level -= 10;
        } else if (level >= 5) {
            out += "V";
            level -= 5;
        } else if (level >= 1) {
            out += "I";
            level -= 1;
        }
    }
    if (out == "") out = "0";
    return out;
}

function FormatToScientific(num) {
    if(num > 100) {
        return num.toExponential(3);
    } else {
        return num;
    }
}