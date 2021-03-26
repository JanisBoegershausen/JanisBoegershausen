/*
Sry for not commenting any of this. I threw this together like 5 months ago during boring school lessons. 
Please don't decide whether or not to hire me based on this, I just needed something for my website,  thanks.
*/

let gpuPowerConsumtion = 1;
let gpuMiningSpeed = 1;
let gpuResearchSpeed = 1;
let gpuCost = 10;
let gpuSize = 5;

let solarProduction = 3;

let currentPower = 0;
let maxPower = 100;
let powerCosts = [1];
let autoSellEnergy = false;

let gpuResearchProportion = 0;

let currentResearchLevel = 0;
let currentResearchXp = 0;

let elements = [];
let allUpgrades = [];
let availableUpgrades = [];
let buttons = [];
let colors = {};

let currentTradingTab = "energy";

let fontRegular;

// Colors: https://coolors.co/2a2b3c-6694cc-44bba4-f1dede-f45b69-3ee091-ecc05b
function preload() {
  fontRegular = loadFont('assets/BebasNeue-Regular.ttf');
}

function setup() {
  textLeading(0);
  textAscent(100);
  colors = {
    "background": color(50, 52, 72),
    "background_darker": color(42, 43, 60),
    "contextMenu": color(59, 60, 84),
    "inactive": color(200, 100, 100),
    "power": color(236, 192, 91),
    "bitCoins": color(86, 227, 159),
    "gpus": color(102, 148, 204),
    "science": color(68, 187, 164),
    "text": color(255, 255, 255),
    "btnDisabled": color(100, 100, 100)
  }
  textFont(fontRegular);
  textStyle(BOLD);

  createCanvas(windowWidth, windowHeight);

  InitializeGame();

  InitializeUI();
}

function InitializeGame() {
  CreateGameData();
}

function InitializeUI() {
  CreateButton(width - 110, 420, 100, 45, "Buy Power", "Buy power.", colors.power, function () {
    if (elements[0].totalAmount >= powerCosts[powerCosts.length - 1] * 10) {
      elements[0].totalAmount -= powerCosts[powerCosts.length - 1] * 10;
      currentPower += 10;
    }
  });

  CreateButton(width - 110, 470, 100, 45, "Sell Power", "Sell 10 power for.", colors.power, function () {
    if (currentPower >= 10) {
      elements[0].totalAmount += powerCosts[powerCosts.length - 1] * 10;
      currentPower -= 10;
    }
  });

  CreateButton(width - 110, 10, 100, 20, "▲", "Upgrade power storage. ", colors.power, function () {
    if (elements[0].totalAmount >= maxPower) {
      elements[0].totalAmount -= maxPower;
      maxPower += 100;
    }
  });

  CreateButton(110, 372.5, 100, 25, "Reroll", "Reroll all upgrades for 1 research point.", colors.science, function () {
    if (currentResearchLevel >= 1) {
      availableUpgrades = [];
      currentResearchLevel--;
    }
  });

  CreateButton(690, 372.5, 100, 25, "Energy", "", colors.power, function () {
    currentTradingTab = "energy";
  });

  CreateButton(800, 372.5, 100, 25, "Etherium", "", color(0, 150, 150), function () {
    currentTradingTab = "etherium";
  });

  CreateButton(910, 372.5, 100, 25, "Gold", "", color(225, 175, 75), function () {
    currentTradingTab = "gold";
  });
}


function draw() {
  if (height != windowHeight || width != windowWidth) {
    resizeCanvas(windowWidth, windowHeight);
  }
  background(colors.background);

  // Update Elements
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    element.Update(i);
    element.totalAmount = min(element.totalAmount, element.maxAmmount);
    element.Draw();
  }

  // Draw Buttons
  for (let i = 0; i < buttons.length; i++) {
    const element = buttons[i];
    DrawButton(element);
  }

  UpdateProduction();
  UpdateStockmarket();
  DrawBar(width - 110, 40, 100, 370, colors.background_darker, colors.power, currentPower / maxPower, "up");

  for (let i = 0; i < 3; i++) {
    if (availableUpgrades.length <= i) {
      upgradeToAdd = allUpgrades[floor(random(0, allUpgrades.length))];
      while (upgradeToAdd == false && availableUpgrades.includes(upgradeToAdd)) {
        upgradeToAdd = allUpgrades[floor(random(0, allUpgrades.length))];
      }
      availableUpgrades.push(upgradeToAdd);
    }
  }

  DrawSciencePanel();
  mouseIsReleased = false;
}

function DrawSciencePanel() {
  fill(colors.background_darker);
  rect(405, 410, 150, 320);
  fill(colors.background);
  rect(410, 415, 140, 310);
  DrawBar(420, 420, 50, 300, colors.background_darker, colors.science, currentResearchXp / (pow(currentResearchLevel + 1, 2) * 100), "up");
  if (RectIsHovered(420, 420, 50, 300)) {
    DisplayContextMenu("Research progress", (ceil(currentResearchXp) + "/" + (pow(currentResearchLevel + 1, 2) * 100)).toString());
  }

  fill(currentResearchLevel == 0 ? colors.background_darker : colors.science);
  rect(480, 420, 60, 60);
  fill(colors.text);
  textAlign(CENTER, CENTER);
  text(FormatResearchLevel(currentResearchLevel), 480 + 30, 420 + 30);

  if (RectIsHovered(480, 420, 60, 60)) {
    DisplayContextMenu("Research Level", "The currency to research upgrades. ")
  }

  if (mouseIsPressed && RectIsHovered(480, 490 - 5, 60, 230 + 10)) {
    gpuResearchProportion = max(0, min(1, 1 - (-(490 - mouseY) / 230)));
  }
  if (RectIsHovered(480, 490, 60, 230)) {
    DisplayContextMenu("GPU Usage",
      "Your GPUs are using \n" +
      round(gpuResearchProportion * 100) + "% on research\n" +
      round((1 - gpuResearchProportion) * 100) + "% on mining. "
    );
  }
  DrawBar(480, 490, 60, 230, colors.background_darker, colors.science, gpuResearchProportion, "up");


  DrawUpgrades();
  DrawTrading();

  DrawContextMenu();
}

function CreateElement(name, max, i, col, update, onClick) {
  e = {};
  e.index = i;
  e.totalAmount = 0;
  e.activeAmmount = 0;
  e.maxAmmount = max;
  e.color = col;

  e.enableSecondaryButton = false;

  e.Update = update;

  e.mainButton = CreateButton(1025, 10 + (i * 120), 100, 100, name, "?", col, onClick);
  e.secondaryButton = CreateButton(1025 + 110, 10 + (i * 120), 45, 45, "10x", "Buy 10.", col, function () {
    for (let i = 0; i < 10; i++) {
      onClick();
    }
  });
  CreateButton(1025 + 110, 10 + (i * 120) + 55, 45, 45, "?", "?", col,);

  e.Draw = function () {
    DrawContainer(this.index * 120, colors.inactive, this.color, this.totalAmount, this.activeAmmount, 20, this.maxAmmount / 20);
  }

  elements.push(e);
}

function CreateUpgrade(title, description, cost, repeating, onUpgrade) {
  u = {};
  u.title = title;
  u.description = description;
  u.cost = cost;

  u.repeating = repeating;

  u.onUpgrade = onUpgrade;

  allUpgrades.push(u);
}

function DrawUpgrades() {
  fill(colors.text);
  textAlign(LEFT, BOTTOM);
  textSize(30);
  text("Research", 10, 405);
  fill(colors.background_darker);
  rect(5, 410, 400, 320);

  for (let i = 0; i < availableUpgrades.length; i++) {
    const element = availableUpgrades[i];
    fill(colors.background);
    rect(10, 415 + (i * 105), 390, 100);
    fill(colors.text);
    textSize(25);
    textAlign(LEFT, TOP);
    text(element.title, 15, 420 + (i * 105));
    textSize(15);
    text(element.description, 15, 450 + (i * 105));

    fill(colors.science);
    rect(390 - 80, 415 + 10 + (i * 105), 80, 80);
    if (RectIsHovered(390 - 80, 415 + 10 + (i * 105), 80, 80) && mouseIsReleased) {
      TryBuyUpgrade(element);
    }

    textAlign(CENTER, CENTER);
    textSize(25);
    fill(colors.text);
    text(FormatResearchLevel(element.cost), 350, 415 + 50 + (i * 105));
  }
}

function DrawTrading() {
  fill(colors.text);
  textAlign(LEFT, BOTTOM);
  textSize(30);
  text("Trading", 600, 405);
  fill(colors.background_darker);
  rect(600 - 5, 410, 400, 320);

  if (currentTradingTab == "energy") {
    DrawStockGraph(600 - 5, 410, 400, 320, powerCosts);
  }
}

function TryBuyUpgrade(u) {
  if (currentResearchLevel >= u.cost) {
    if (!u.repeating) allUpgrades.splice(allUpgrades.findIndex(x => x == u), 1);
    currentResearchLevel -= u.cost;
    u.onUpgrade();
    availableUpgrades.splice(availableUpgrades.findIndex(x => x == u), 1);
  }
}

function UpdateProduction() {
  currentPower = min(currentPower, maxPower);

  if (currentResearchXp >= (pow(currentResearchLevel + 1, 2) * 100)) {
    currentResearchLevel++;
    currentResearchXp = 0;
  }

  if (autoSellEnergy && currentPower >= maxPower * 0.9) {
    if (currentPower >= 10) {
      elements[0].totalAmount += powerCosts[powerCosts.length - 1] * 10;
      currentPower -= 10;
    }
  }
}

function UpdateStockmarket() {
  powerCosts.push(powerCosts[powerCosts.length - 1] + random(-1 * (deltaTime / 1000), 1 * (deltaTime / 1000)));
  powerCosts[powerCosts.length - 1] = max(powerCosts[powerCosts.length - 1], 0);
  if (powerCosts.length > 500) {
    powerCosts.splice(0, 1);
  }
}

function mouseClicked() {
  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    if (btn.enabled && RectIsHovered(btn.pos.x, btn.pos.y, btn.size.x, btn.size.y)) {
      btn.func();
    }
  }
}

let mouseIsReleased = false;
function mouseReleased() {
  mouseIsReleased = true;
}