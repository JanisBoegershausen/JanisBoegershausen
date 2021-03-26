// General code for creating different ui elements

// Create a button that will be drawn untill it is deleted.
function CreateButton(x, y, w, h, txt, description, color, onClick) {
    btn = {};
    btn.pos = createVector(x, y);
    btn.size = createVector(w, h);

    btn.color = color;
    btn.txt = txt;
    btn.description = description;

    btn.enabled = true;

    btn.func = onClick;

    buttons.push(btn);
    return btn;
}

// Draw the given button. 
function DrawButton(btn) {
    if(btn.enabled) {
        if (RectIsHovered(btn.pos.x, btn.pos.y, btn.size.x, btn.size.y)) {
            fill(lerpColor(btn.color, color(0), 0.2));
            rect(btn.pos.x + 5, btn.pos.y + 5, btn.size.x - 10, btn.size.y - 10);
            DisplayContextMenu(btn.txt, btn.description);
        } else {
            fill(btn.color);
            rect(btn.pos.x, btn.pos.y, btn.size.x, btn.size.y);
        }
    } else {
        fill(colors.btnDisabled);
        rect(btn.pos.x, btn.pos.y, btn.size.x, btn.size.y);
    }
    fill(colors.text);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(btn.txt, btn.pos.x + btn.size.x / 2, (btn.pos.y + btn.size.y / 2) - 2);
}

// Draw a bar that is filled by a the fill ammount.
// @param  string  align  The allignment of the bar (currently only "up")
function DrawBar(x, y, w, h, bgCol, fillCol, ammount, align) {
    fill(bgCol);
    rect(x, y, w, h);
    fill(fillCol);
    switch (align) {
        case "up":
            rect(x, (y + h) - (h * ammount), w, h * (ammount));
            break;
    }
}

// Draw a container, that contains a certain annount of dots, and active dots.
function DrawContainer(yPos, colorA, colorB, ammountA, ammountB, rows, columns) {
    noStroke();
    fill(colors.background_darker);
    rect(5, yPos + 5, 200 * 5 + 10, 20 * 5 + 10);

    ammountA = ceil(ammountA);
    ammountB = ceil(ammountB);

    fill(colorA);
    i = 0;
    for (let x = 0; x < columns; x++) {
        if(i+rows <= ammountA) {
            rect(10 + x * 5, yPos + 10, 3, rows*5-2);
            i += rows;
            continue;
        }
        for (let y = 0; y < rows; y++) {
            if (i < ammountA) {
                rect(10 + x * 5, yPos + 10 + y * 5, 3, 3);
            } 
            i++;
        }
    }

    i = 0;
    for (let x = 0; x < columns; x++) {
        if(i+rows <= ammountB) {
            fill(colorB);
            rect(10 + x * 5, yPos + 10, 3, rows*5-2);
            i += rows;
            continue;
        }
        for (let y = 0; y < rows; y++) {
            if (i < ammountB) {
                fill(colors.background_darker);
                rect(10 + x * 5, yPos + 10 + y * 5, 3, 5);
                fill(colorB);
                rect(10 + x * 5, yPos + 10 + y * 5, 3, 3);
            }
            i++;
        }
    }

    if(RectIsHovered(5, yPos + 5, 200 * 5 + 10, 20 * 5 + 10)) {
        DisplayContextMenu(FormatToScientific(floor(ammountA)).toString(), "");
    }
}

function DisplayContextMenu(title, description) {
    _currentContextMenuTitle = title;
    _currentContextMenuDescription = description;
}

let _currentContextMenuTitle = "";
let _currentContextMenuDescription = "";
function DrawContextMenu() {
    if (_currentContextMenuTitle != "") {
        fill(colors.contextMenu);
        if(_currentContextMenuDescription == "") _currentContextMenuDescription = " ";
        titleRect = fontRegular.textBounds(_currentContextMenuTitle.toString());
        descriptionRect = fontRegular.textBounds(_currentContextMenuDescription.toString());
        lineCount = _currentContextMenuDescription.toString().split(/\r\n|\r|\n/).length;
        x = mouseX;
        y = mouseY;
        rectHeight = 22 + titleRect.h + descriptionRect.h * lineCount;
        rectWidth = max(titleRect.w, max(10, descriptionRect.w / (lineCount+1))) + 30;

        if(x + rectWidth > width) {
            x -= rectWidth;
        }
        if(y + rectHeight > height) {
            y -= rectHeight;
        }
        rect(x, y, rectWidth, rectHeight);

        fill(255);
        textAlign(LEFT, TOP);
        textSize(20);
        text(_currentContextMenuTitle, x + 15, y + 10);
        textSize(13);
        text(_currentContextMenuDescription, x + 15, y + 35);

        _currentContextMenuTitle = "";
    }
}

function DrawStockGraph(x, y, w, h, data) {
    fill(colors.background_darker);
    rect(x,y,w,h);

    highestPoint = 0;
    lowestPoint = 100000;
    sum = 0;
    for (let i = 0; i < data.length; i++) {
        const element = data[i];
        if(element > highestPoint) {
            highestPoint = element;
        }
        if(element < lowestPoint) {
            lowestPoint = element;
        }
        sum += element;
    }
    average = sum / data.length;

    stroke(0, 255, 0);
    strokeWeight(3);
    line(x, y+h-(highestPoint / (highestPoint + highestPoint / 10)) * h, 
         x + w, y+h-(highestPoint / (highestPoint + highestPoint / 10)) * h);
    stroke(255, 0, 0);
    line(x, y+h-(lowestPoint / (highestPoint + highestPoint / 10)) * h, 
         x + w, y+h-(lowestPoint / (highestPoint + highestPoint / 10)) * h);
    noStroke();
    stroke(255, 255, 255);
    line(x, y+h-(average / (highestPoint + highestPoint / 10)) * h, 
         x + w, y+h-(average / (highestPoint + highestPoint / 10)) * h);
    noStroke();

    fill(255, 0, 0);
    for (let i = 0; i < data.length; i++) {
        const element = data[i];
        localX = 0;
        localY = (element / (highestPoint + highestPoint / 10)) * h;
        circle(x+(i/(data.length-1))*w, y+h-localY, 5);
    }

    fill(255);
    textAlign(LEFT, CENTER);
    localY = (data[data.length-1] / (highestPoint+ highestPoint / 10)) * h;
    rect(x+w,  y+h-localY - 2, 10, 4);
    text((round(data[data.length-1]*1000)/1000), x+w + 15, y+h-localY-5);
    textAlign(RIGHT, TOP);
    text("0", x-15, y+h)
    textAlign(RIGHT, CENTER);
    if(y+h-(1 / (highestPoint+ highestPoint / 10)) * h > y) {
        rect(x-10,  y+h-(1 / (highestPoint+ highestPoint / 10)) * h, 10, 4);
        text("1", x-15, y+h-(1 / (highestPoint+ highestPoint / 10)) * h)
    }
}