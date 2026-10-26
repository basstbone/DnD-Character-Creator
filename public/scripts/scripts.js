
// D&D Character Creator - SRD 5.2.1
// Character creation functionality for levels 1-5.

document.addEventListener("DOMContentLoaded", initializeCharacterCreator);

async function initializeCharacterCreator() {

  const form = document.getElementById("characterForm");
  const loadingScreen = document.getElementById("loadingScreen");

  // Other pages do not contain the character creation form.
  if (!form) {
    return;
  }

  const abilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

  let data;
  let rolledScores = [];

  function getElement(id) {
    return document.getElementById(id);
  }

  function populateSelect(id, options) {

    const dropdown = getElement(id);

    dropdown.replaceChildren();
    dropdown.add(new Option("Select an option", ""));

    for (const name of options) {
      dropdown.add(new Option(name, name));
    }
  }

  async function loadData() {

    const names = [
      "species",
      "classes",
      "backgrounds",
      "rules"
    ];

    const results = await Promise.all(
      names.map(async function (name) {

        const response = await fetch(
          "data/" + name + ".json"
        );

        if (!response.ok) {
          throw new Error(
            "Cannot load data/" + name + ".json"
          );
        }

        return response.json();
      })
    );

    return Object.fromEntries(
      names.map(function (name, index) {
        return [name, results[index]];
      })
    );
  }

  function getScoreMethods() {
    return data.rules.abilityScoreMethods;
  }

  function createLabeledInput(text, input) {

    const group = document.createElement("div");
    group.className = "form-group";

    const label = document.createElement("label");

    label.htmlFor = input.id;
    label.textContent = text;

    group.append(label, input);

    return group;
  }

  function renderScores() {

    const method = getElement("scoreMethod").value;
    const container = getElement("abilityInputs");

    container.replaceChildren();

    getElement("scoreError").textContent = "";

    getElement("rollControls").hidden =
      method !== "rolled";

    getElement("pointBudget").hidden =
      method !== "pointBuy";

    const instructions = {
      standard: "Assign each standard-array score exactly once.",
      pointBuy: "Spend 27 points on ability scores.",
      rolled: "Roll six scores and assign each result once."
    };

    getElement("methodHelp").textContent =
      instructions[method];

    for (const ability of abilities) {

      const input = document.createElement("select");

      input.id = "score" + ability;
      input.required = true;

      if (method === "pointBuy") {

        for (let score = 8; score <= 15; score++) {
          input.add(new Option(score, score));
        }

        input.value = "8";

        input.addEventListener(
          "change",
          updateBudget
        );

      } else {

        let values;

        if (method === "standard") {
          values = getScoreMethods().standard.array;
        } else {
          values = rolledScores;
        }

        if (values.length === 0) {

          input.add(new Option("Roll first", ""));
          input.disabled = true;

        } else {

          input.add(new Option("Choose score", ""));

          values.forEach(function (score, index) {

            input.add(
              new Option(
                score + " (slot " + (index + 1) + ")",
                index
              )
            );
          });
        }
      }

      container.append(
        createLabeledInput(ability, input)
      );
    }

    updateBudget();
  }

  function updateBudget() {

    if (getElement("scoreMethod").value !== "pointBuy") {
      return;
    }

    const settings = getScoreMethods().pointBuy;

    let used = 0;

    for (const ability of abilities) {

      const score = getElement("score" + ability).value;

      used += Number(settings.costs[score]);
    }

    const remaining = settings.budget - used;

    const display = getElement("pointBudget");

    display.textContent =
      "Points remaining: " + remaining +
      " / " + settings.budget;

    if (remaining < 0) {
      display.style.color = "#ff9c9c";
    } else {
      display.style.color = "";
    }
  }

  function rollAbilityScores() {

    rolledScores = [];

    for (let i = 0; i < 6; i++) {

      const dice = [];

      for (let j = 0; j < 4; j++) {

        const roll =
          Math.floor(Math.random() * 6) + 1;

        dice.push(roll);
      }

      dice.sort(function (a, b) {
        return a - b;
      });

      const total =
        dice[1] + dice[2] + dice[3];

      rolledScores.push(total);
    }

    renderScores();

    getElement("rollResults").textContent =
      "Rolled scores: " + rolledScores.join(", ");
  }

  function getBaseScores() {

    const method = getElement("scoreMethod").value;

    const scores = {};

    if (method === "pointBuy") {

      const settings = getScoreMethods().pointBuy;

      let used = 0;

      for (const ability of abilities) {

        const score = Number(
          getElement("score" + ability).value
        );

        scores[ability] = score;

        used += Number(settings.costs[score]);
      }

      if (used !== settings.budget) {

        throw new Error(
          "Point Cost must use exactly " +
          settings.budget + " points."
        );
      }

      return scores;
    }

    let values;

    if (method === "standard") {
      values = getScoreMethods().standard.array;
    } else {
      values = rolledScores;
    }

    if (values.length !== 6) {
      throw new Error("Roll six ability scores first.");
    }

    const slots = [];

    for (const ability of abilities) {

      const value =
        getElement("score" + ability).value;

      if (value === "") {
        throw new Error(
          "Assign a score to every ability."
        );
      }

      slots.push(Number(value));
    }

    if (new Set(slots).size !== 6) {

      throw new Error(
        "Each score slot must be used exactly once."
      );
    }

    for (let i = 0; i < abilities.length; i++) {

      scores[abilities[i]] = values[slots[i]];
    }

    return scores;
  }

  function updateBackground() {

    const backgroundName =
      getElement("background").value;

    const background =
      data.backgrounds[backgroundName];

    const container = getElement("boostChoices");

    container.replaceChildren();

    if (!background) {

      getElement("backgroundInfo").textContent =
        "Choose a background to see its benefits.";

      return;
    }

    getElement("backgroundInfo").textContent =
      "Eligible abilities: " +
      background.abilityOptions.join(", ") +
      ". Origin feat: " +
      background.originFeat +
      ". Skills: " +
      background.skillProficiencies.join(", ") +
      ".";

    const increaseMethod =
      getElement("increaseMethod").value;

    let increases;

    if (increaseMethod === "2-1") {
      increases = [2, 1];
    } else {
      increases = [1, 1, 1];
    }

    increases.forEach(function (increase, index) {

      const select = document.createElement("select");

      select.id = "boost" + index;
      select.required = true;

      select.add(
        new Option("Choose ability", "")
      );

      for (const ability of background.abilityOptions) {

        select.add(
          new Option(ability, ability)
        );
      }

      container.append(
        createLabeledInput(
          "+" + increase + " increase",
          select
        )
      );
    });
  }

  function getAbilityModifier(score) {

    return Math.floor((score - 10) / 2);
  }

  function showCharacterPreview(
    scores,
    level,
    characterClass,
    background
  ) {

    const constitutionModifier =
      getAbilityModifier(scores.CON);

    const hitDie = characterClass.hitDie;

    const fixedGain =
      Math.floor(hitDie / 2) + 1;

    const firstLevelHP =
      Math.max(1, hitDie + constitutionModifier);

    const additionalHP =
      Math.max(1, fixedGain + constitutionModifier);

    const hp =
      firstLevelHP + (level - 1) * additionalHP;

    const preview = getElement("preview");

    preview.replaceChildren();

    const heading = document.createElement("h3");

    heading.textContent =
      getElement("characterName").value +
      " - Level " + level +
      " " + getElement("characterClass").value;

    const summary = document.createElement("p");

    summary.textContent =
      getElement("species").value +
      " | " +
      getElement("background").value +
      " | Proficiency +" +
      data.rules.proficiencyBonus[level] +
      " | HP " + hp;

    const stats = document.createElement("p");

    const statText = [];

    for (const ability of abilities) {

      const modifier =
        getAbilityModifier(scores[ability]);

      let sign = "";

      if (modifier >= 0) {
        sign = "+";
      }

      statText.push(
        ability + ": " +
        scores[ability] +
        " (" + sign + modifier + ")"
      );
    }

    stats.textContent = statText.join(" | ");

    const note = document.createElement("p");

    note.textContent =
      "Origin feat: " + background.originFeat +
      ". Additional class features, spells, " +
      "equipment, and subclasses will be added later.";

    preview.append(
      heading,
      summary,
      stats,
      note
    );

    preview.hidden = false;

    preview.scrollIntoView({
      behavior: "smooth"
    });
  }

  function submitCharacter(event) {

    event.preventDefault();

    const background =
      data.backgrounds[getElement("background").value];

    const characterClass =
      data.classes[getElement("characterClass").value];

    const increaseMethod =
      getElement("increaseMethod").value;

    let increases;

    if (increaseMethod === "2-1") {
      increases = [2, 1];
    } else {
      increases = [1, 1, 1];
    }

    const targets = [];

    for (let i = 0; i < increases.length; i++) {

      targets.push(
        getElement("boost" + i).value
      );
    }

    if (
      targets.includes("") ||
      new Set(targets).size !== targets.length
    ) {

      alert(
        "Choose a different eligible ability " +
        "for each increase."
      );

      return;
    }

    let scores;

    try {

      scores = getBaseScores();

      getElement("scoreError").textContent = "";

    } catch (error) {

      getElement("scoreError").textContent =
        error.message;

      return;
    }

    for (let i = 0; i < targets.length; i++) {

      scores[targets[i]] += increases[i];
    }

    for (const ability of abilities) {

      if (scores[ability] > 20) {

        alert(
          "Ability scores cannot exceed 20 " +
          "from background increases."
        );

        return;
      }
    }

    const level = Number(
      getElement("level").value
    );

    showCharacterPreview(
      scores,
      level,
      characterClass,
      background
    );
  }

  // ***************************************************
  // Load JSON data and initialize form controls.
  // ***************************************************
  try {

    data = await loadData();

    populateSelect(
      "species",
      Object.keys(data.species)
    );

    populateSelect(
      "characterClass",
      Object.keys(data.classes)
    );

    populateSelect(
      "background",
      Object.keys(data.backgrounds)
    );

    const levelSelect = getElement("level");

    levelSelect.replaceChildren();

    for (let level = 1; level <= 5; level++) {

      levelSelect.add(
        new Option("Level " + level, level)
      );
    }

    renderScores();
    updateBackground();

    // Hide loading animation and show the completed form.
    loadingScreen.hidden = true;
    form.hidden = false;

  } catch (error) {

    // Hide the spinner if loading fails.
    loadingScreen.hidden = true;
    form.hidden = false;

    getElement("loadError").textContent =
      "Could not initialize SRD character creator: " +
      error.message;

    form.querySelector(
      'button[type="submit"]'
    ).disabled = true;

    console.error(error);

    return;
  }

  // ***************************************************
  // Event Listeners
  // ***************************************************

  getElement("scoreMethod").addEventListener(
    "change",
    renderScores
  );

  getElement("rollScores").addEventListener(
    "click",
    rollAbilityScores
  );

  getElement("background").addEventListener(
    "change",
    updateBackground
  );

  getElement("increaseMethod").addEventListener(
    "change",
    updateBackground
  );

  form.addEventListener(
    "submit",
    submitCharacter
  );

  form.addEventListener("reset", function () {

    rolledScores = [];

    getElement("preview").hidden = true;

    getElement("rollResults").textContent = "";

    setTimeout(function () {

      renderScores();
      updateBackground();

    }, 0);
  });
}
