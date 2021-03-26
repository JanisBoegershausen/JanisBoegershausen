function CreateGameData() {
    CreateElements();
    CreateUpgrades();
}

function CreateUpgrades() {
    CreateUpgrade("GPU Cores", "Add extra cores to the GPUs and make \nthem mine twice as fast. ", 1, true, function () { gpuMiningSpeed *= 2; })
    CreateUpgrade("GPU Seller Deal", "GPUs cost 25% less. ", 2, true, function () { gpuCost *= 0.75; })
    CreateUpgrade("GPU Quantum Computing", "Doubles GPU research speed. ", 3, true, function () { gpuResearchSpeed *= 2; })
    CreateUpgrade("Mining Upgrade", "Ability to mine 10₿ per click. ", 3, false, function () { elements[0].enableSecondaryButton = true; })
    CreateUpgrade("GPU Bulk Buy", "Unlock buying 10 GPUs at once.", 4, false, function () { elements[1].enableSecondaryButton = true; })
    CreateUpgrade("Solar Bulk Buy", "Unlick buying 10 panels at once.", 4, false, function () { elements[2].enableSecondaryButton = true; })
    CreateUpgrade("Auto Sell Energy", "Energy is automatically sold \nif it has reached 90% capacity.", 2, false, function () { autoSellEnergy = true; })
}

function CreateElements() {
    CreateElement("BitCoin", 10 * 200, 0, colors.bitCoins, function (i) {
        this.activeAmmount = this.totalAmount;
        this.mainButton.description = "Click to mine 1 Bitcoin. \nYou currently have: " + floor(this.totalAmount) + "₿";
        this.secondaryButton.enabled = this.enableSecondaryButton;
    }, function () {
        elements[0].totalAmount++;
    });

    CreateElement("GPUs", 20 * 20, 1, colors.gpus, function (i) {
        this.activeAmmount = 0;
        this.mainButton.description = "Click to buy 1 GPU for " + gpuCost + "₿ \nYou currently have: " + floor(this.totalAmount) + " GPUs";
        this.secondaryButton.enabled = this.enableSecondaryButton;
        for (let i = 0; i < this.totalAmount; i++) {
            if (currentPower >= gpuPowerConsumtion * (deltaTime / 1000)) {
                currentPower -= gpuPowerConsumtion * (deltaTime / 1000);
                elements[0].totalAmount += (1 - gpuResearchProportion) * (deltaTime / 1000) * gpuMiningSpeed;
                currentResearchXp += gpuResearchProportion * (deltaTime / 1000) * gpuResearchSpeed;
                this.activeAmmount++;
            }
        }
    }, function () {
        if (elements[0].totalAmount >= gpuCost) {
            elements[0].totalAmount -= gpuCost;
            elements[1].totalAmount++;
        }
    });

    CreateElement("Solar", 20 * 20, 2, colors.power, function (i) {
        this.activeAmmount = this.totalAmount;
        this.mainButton.description = "Click to buy 1 solar panel for " + 100 + "₿ \nYou currently have: " + floor(this.totalAmount) + " panels";
        this.secondaryButton.enabled = this.enableSecondaryButton;
        for (let i = 0; i < this.activeAmmount; i++) {
            currentPower += solarProduction * (deltaTime / 1000);
        }
    }, function () {
        if (elements[0].totalAmount >= 100) {
            elements[0].totalAmount -= 100;
            elements[2].totalAmount++;
        }
    });
}