
// D&D Random Character Generator
// Uses local SRD 5.2.1 JSON data.

document.addEventListener("DOMContentLoaded", initializeRandomGenerator);

async function initializeRandomGenerator() {

    const abilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

    let data;

    function getElement(id) {
        return document.getElementById(id);
    }

    // Choose a random item from an array.
    function randomItem(items) {
        const index = Math.floor(Math.random() * items.length);
        return items[index];
    }

    // Generate a random number between min and max.
    function randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Shuffle an array without changing the original.
    function shuffle(items) {

        const result = [...items];

        for (let i = result.length - 1; i > 0; i--) {

            const j = randomNumber(0, i);

            [result[i], result[j]] = [result[j], result[i]];
        }

        return result;
    }

    // Load JSON files from the data folder.
    async function loadData() {

        const names = [
            "species",
            "classes",
            "backgrounds",
            "rules"
        ];

        const results = await Promise.all(
            names.map(async function(name) {

                const response = await fetch(
                    "data/" + name + ".json"
                );

                if (!response.ok) {
                    throw new Error(
                        "Could not load " + name + ".json"
                    );
                }

                return response.json();
            })
        );

        const loadedData = {};

        names.forEach(function(name, index) {
            loadedData[name] = results[index];
        });

        return loadedData;
    }

    // Add choices to a dropdown.
    function populateDropdown(id, options) {

        const dropdown = getElement(id);

        for (const option of options) {
            dropdown.add(new Option(option, option));
        }
    }

    // Random name suggestions.
    // These are original names, not SRD character data.
    function generateName() {

        const firstNames = [
            "Arin", "Bren", "Cael", "Dara",
            "Eryn", "Finn", "Kael", "Lira",
            "Mira", "Noren", "Riven", "Talia"
        ];

        const lastNames = [
            "Ashford", "Blackwood", "Dawncrest",
            "Emberfall", "Ironwood", "Moonvale",
            "Ravencrest", "Stormwind"
        ];

        return randomItem(firstNames) + " " +
               randomItem(lastNames);
    }

    // Roll 4 six-sided dice and drop the lowest.
    function rollScore() {

        const dice = [];

        for (let i = 0; i < 4; i++) {
            dice.push(randomNumber(1, 6));
        }

        dice.sort(function(a, b) {
            return a - b;
        });

        return dice[1] + dice[2] + dice[3];
    }

    // Generate scores using the selected method.
    function generateScores(method) {

        let values = [];

        if (method === "standard") {

            values = [
                ...data.rules.abilityScoreMethods.standard.array
            ];

        } else if (method === "rolled") {

            for (let i = 0; i < 6; i++) {
                values.push(rollScore());
            }

        } else if (method === "pointBuy") {

            values = generatePointBuyScores();
        }

        values = shuffle(values);

        const scores = {};

        abilities.forEach(function(ability, index) {
            scores[ability] = values[index];
        });

        return scores;
    }

    // Generate a valid 27-point distribution.
    function generatePointBuyScores() {

        const settings =
            data.rules.abilityScoreMethods.pointBuy;

        const costs = settings.costs;

        // Find all possible six-score combinations
        // that spend exactly 27 points.
        const combinations = [];

        function findCombinations(current, start, points) {

            if (current.length === 6) {

                if (points === settings.budget) {
                    combinations.push([...current]);
                }

                return;
            }

            for (let score = start; score <= settings.max; score++) {

                const newPoints =
                    points + Number(costs[score]);

                if (newPoints > settings.budget) {
                    continue;
                }

                current.push(score);

                findCombinations(
                    current,
                    score,
                    newPoints
                );

                current.pop();
            }
        }

        findCombinations([], settings.min, 0);

        if (combinations.length === 0) {
            throw new Error(
                "No valid point-buy combinations found."
            );
        }

        return randomItem(combinations);
    }

    // Apply the background's ability increases.
    function applyBackgroundIncreases(scores, background, method) {

        const eligible = background.abilityOptions;

        const increases = {};

        for (const ability of abilities) {
            increases[ability] = 0;
        }

        if (method === "random") {

            method = randomItem(["2-1", "1-1-1"]);
        }

        if (method === "1-1-1") {

            for (const ability of eligible) {
                increases[ability] = 1;
            }

        } else {

            const chosen = shuffle(eligible);

            increases[chosen[0]] = 2;
            increases[chosen[1]] = 1;
        }

        for (const ability of abilities) {

            scores[ability] += increases[ability];

            // Background increases cannot raise a
            // score above 20.
            if (scores[ability] > 20) {
                scores[ability] = 20;
            }
        }

        return {
            scores: scores,
            increases: increases,
            method: method
        };
    }

    // Calculate an ability modifier.
    function getModifier(score) {
        return Math.floor((score - 10) / 2);
    }

    // Format modifiers with + or - signs.
    function formatModifier(modifier) {

        if (modifier >= 0) {
            return "+" + modifier;
        }

        return String(modifier);
    }

    // Calculate basic hit points using fixed gains.
    function calculateHP(characterClass, level, conModifier) {

        const hitDie = characterClass.hitDie;

        const firstLevelHP = Math.max(
            1,
            hitDie + conModifier
        );

        const fixedGain = Math.floor(hitDie / 2) + 1;

        const additionalHP = Math.max(
            1,
            fixedGain + conModifier
        );

        return firstLevelHP +
               (level - 1) * additionalHP;
    }

    // Create an HTML element containing text.
    function createTextElement(tag, text, className = "") {

        const element = document.createElement(tag);

        element.textContent = text;

        if (className) {
            element.className = className;
        }

        return element;
    }

    // Display the generated character.
    function displayCharacter(character) {

        const output = getElement("characterOutput");

        output.replaceChildren();

        output.append(
            createTextElement("h3", character.name)
        );

        output.append(
            createTextElement(
                "p",
                "Level " + character.level + " " +
                character.species + " " +
                character.className,
                "random-summary"
            )
        );

        output.append(
            createTextElement(
                "p",
                "Background: " + character.backgroundName
            )
        );

        output.append(
            createTextElement(
                "p",
                "Origin Feat: " +
                character.background.originFeat
            )
        );

        output.append(
            createTextElement(
                "p",
                "Proficiency Bonus: +" +
                character.proficiencyBonus
            )
        );

        output.append(
            createTextElement(
                "p",
                "Hit Points: " + character.hp
            )
        );

        output.append(
            createTextElement("h3", "Ability Scores")
        );

        const scoreGrid = document.createElement("div");
        scoreGrid.className = "random-score-grid";

        for (const ability of abilities) {

            const score = character.scores[ability];

            const modifier = getModifier(score);

            const card = document.createElement("div");
            card.className = "random-score-card";

            card.append(
                createTextElement("strong", ability)
            );

            card.append(
                createTextElement(
                    "span",
                    String(score),
                    "random-score-number"
                )
            );

            card.append(
                createTextElement(
                    "span",
                    formatModifier(modifier)
                )
            );

            scoreGrid.append(card);
        }

        output.append(scoreGrid);

        const increaseList = [];

        for (const ability of abilities) {

            const increase = character.increases[ability];

            if (increase > 0) {
                increaseList.push(
                    ability + " +" + increase
                );
            }
        }

        output.append(
            createTextElement(
                "p",
                "Background Increases: " +
                increaseList.join(", ")
            )
        );

        output.append(
            createTextElement(
                "p",
                "Ability Score Method: " +
                character.scoreMethod
            )
        );

        output.append(
            createTextElement(
                "p",
                "Background Skills: " +
                character.background.skillProficiencies.join(", ")
            )
        );

        // Display class features from levels 1 through
        // the character's current level.
        const features = [];

        for (let level = 1; level <= character.level; level++) {

            const levelFeatures =
                character.classData.featuresByLevel[level] || [];

            for (const feature of levelFeatures) {
                features.push("Level " + level + ": " + feature);
            }
        }

        if (features.length > 0) {

            output.append(
                createTextElement("h3", "Class Features")
            );

            const list = document.createElement("ul");
            list.className = "random-feature-list";

            for (const feature of features) {

                const item = document.createElement("li");

                item.textContent = feature;

                list.append(item);
            }

            output.append(list);
        }

        output.append(
            createTextElement(
                "p",
                "This is a basic character preview. " +
                "Some class features, subclass choices, " +
                "spells, equipment, and other decisions " +
                "still need to be completed.",
                "random-note"
            )
        );

        getElement("randomResult").hidden = false;
    }

    // Generate a new random character.
    function generateCharacter() {

        try {

            getElement("randomError").textContent = "";

            const speciesNames = Object.keys(data.species);
            const classNames = Object.keys(data.classes);
            const backgroundNames = Object.keys(data.backgrounds);

            const species =
                getElement("randomSpecies").value ||
                randomItem(speciesNames);

            const className =
                getElement("randomClass").value ||
                randomItem(classNames);

            const backgroundName =
                getElement("randomBackground").value ||
                randomItem(backgroundNames);

            const level =
                Number(getElement("randomLevel").value) ||
                randomNumber(1, 5);

            const scoreMethod =
                getElement("randomScoreMethod").value;

            const increaseMethod =
                getElement("randomIncreaseMethod").value;

            const name =
                getElement("randomName").value.trim() ||
                generateName();

            const classData = data.classes[className];
            const background = data.backgrounds[backgroundName];

            let scores = generateScores(scoreMethod);

            const result = applyBackgroundIncreases(
                scores,
                background,
                increaseMethod
            );

            scores = result.scores;

            const conModifier = getModifier(scores.CON);

            const hp = calculateHP(
                classData,
                level,
                conModifier
            );

            const character = {
                name: name,
                species: species,
                className: className,
                backgroundName: backgroundName,
                level: level,
                scoreMethod: scoreMethod,
                scores: scores,
                increases: result.increases,
                background: background,
                classData: classData,
                hp: hp,
                proficiencyBonus:
                    data.rules.proficiencyBonus[level]
            };

            displayCharacter(character);

        } catch (error) {

            getElement("randomError").textContent =
                error.message;

            console.error(error);
        }
    }

    // Load the data and initialize the generator.
    try {

        data = await loadData();

        populateDropdown(
            "randomSpecies",
            Object.keys(data.species)
        );

        populateDropdown(
            "randomClass",
            Object.keys(data.classes)
        );

        populateDropdown(
            "randomBackground",
            Object.keys(data.backgrounds)
        );

        getElement("randomLoading").hidden = true;
        getElement("generatorControls").hidden = false;

    } catch (error) {

        getElement("randomLoading").hidden = true;

        getElement("randomError").textContent =
            "Could not load SRD data: " + error.message;

        console.error(error);

        return;
    }

    // Button event listeners.
    getElement("generateCharacter").addEventListener(
        "click",
        generateCharacter
    );

    getElement("rerollCharacter").addEventListener(
        "click",
        generateCharacter
    );

    getElement("resetGenerator").addEventListener(
        "click",
        function() {

            getElement("randomName").value = "";
            getElement("randomSpecies").value = "";
            getElement("randomClass").value = "";
            getElement("randomBackground").value = "";
            getElement("randomLevel").value = "";
            getElement("randomScoreMethod").value = "standard";
            getElement("randomIncreaseMethod").value = "random";

            getElement("randomResult").hidden = true;
            getElement("randomError").textContent = "";
        }
    );
}
