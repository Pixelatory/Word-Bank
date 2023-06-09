import { clearFormInputs } from './utils.js';

// Registering all important web elements as js variables
let addWordForm = document.getElementById("add_word_form");
let wordTextField = document.getElementById("word_txt_field");

let screens = [
    document.getElementById("settings_screen"),
    document.getElementById("vocabulary_screen"),
    document.getElementById("add_word_screen"),
    document.getElementById("main_screen")
];


let menuButtons = [
    document.getElementById("settings_button"),
    document.getElementById("vocabulary_button"),
    document.getElementById("add_word_button")
];

let backButtons = document.getElementsByClassName("back_button");

// Functions section
function setAttributes(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}

function get_vocabulary() {
    chrome.storage.local.get("words").then((result) => {
      alert("Value currently is " + result.key);
    });
}

function cleanup_add_word_screen() {
    let submitButton = addWordForm.querySelector('input[type="submit"]');
    while(addWordForm.querySelector('input[type="radio"]') != null) {
        let radioButton = addWordForm.querySelector('input[type="radio"]');
        radioButton.remove();
    }

    while(addWordForm.querySelector('label') != null) {
        let label = addWordForm.querySelector('label');
        label.remove();
    }

    let newDefinitionInput = document.getElementById("new_definition_txt_input");
    if(newDefinitionInput) {
        newDefinitionInput.remove();
    }

    let addWordInfoText = document.getElementById("add_word_info_txt");
    if(addWordInfoText) {
        addWordInfoText.remove();
    }

    submitButton.setAttribute("value", "Search");
}

function show_add_word_definition(definition, id_count) {
    let submitButton = addWordForm.querySelector('input[type="submit"]');
    let newRadio = document.createElement("input");
    let newLabel = document.createElement("label");
    //newLabel.prepend(newRadio);
    let radioId = "def" + id_count.toString();
    setAttributes(newRadio, {"type": "radio", "name": "definition", "id": radioId});
    newRadio.style.display = "none";
    setAttributes(newLabel, {"for": radioId, "class": "block"});
    newLabel.innerText = definition;
    addWordForm.insertBefore(newRadio, submitButton);
    addWordForm.insertBefore(newLabel, submitButton);
}

function displayScreen(screen_id) {
    // set all screens to invisible and clear any form inputs
    screens.forEach(element => {
        element.style.display = "none";
        clearFormInputs(element);
    });

    if (screen_id === "vocabulary_screen") {
        get_vocabulary();
    }

    cleanup_add_word_screen();

    // set only 1 screen as visible
    screens.forEach(element => {
        if(element.getAttribute('id') === screen_id) {
            element.style.display = "block";
        }
    });
}

async function gatherDefinitions(word) {
    /*
        Fetches definitions from api.dictionaryapi.dev, and
        gathers them into an array which is then returned.
    */
    let response = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word);

    let definitions = [];

    if(response.status == 200) {
        // Response is good!
        let jsonData = await response.json();

        let definitionsCount = 0;
        for(var i = 0; i < jsonData[0]['meanings'].length; i++) {
            let tmp = jsonData[0]['meanings'][i];
            for (var j = 0; j < tmp['definitions'].length; j++) {
                definitions.push(tmp['definitions'][j]['definition']);
            }
        }
    }

    return definitions;
}

// Create event listeners for the buttons
for (var i = 0; i < menuButtons.length; i++) {
    // get associated screen id from button id
    let associatedScreenName = menuButtons[i].getAttribute('id').split("_");
    associatedScreenName[associatedScreenName.length - 1] = "screen";
    associatedScreenName = associatedScreenName.join("_");

    menuButtons[i].addEventListener("click", function() {
        displayScreen(associatedScreenName);
    });
}

for (var i = 0; i < backButtons.length; i++) {
    backButtons[i].addEventListener("click", function() {
        displayScreen("main_screen");
        cleanup_add_word_screen();
    });
}

// Add event listener to add word form
addWordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let submittedWord = addWordForm.querySelector('input[name="word"]').value;
    let submitButton = addWordForm.querySelector('input[type="submit"]');

    if (submitButton.getAttribute("value") === "Search") {
        let id_count = 0;
        gatherDefinitions(submittedWord).then((definitions) => {
            // Handling of definitions
            console.log(definitions.length);
            definitions.forEach((def) => {
                show_add_word_definition(def, id_count++);
            });

            // No definitions (could not be a word, or no definitions from API)
            if(definitions.length == 0) {
                let infoText = document.createElement("p");
                infoText.innerText = "No definitions found for this word";
                setAttributes(infoText, {"id": "add_word_info_txt"})
                addWordForm.insertBefore(infoText, submitButton);
            }

            let newDefinitionInput = document.createElement("input");
            setAttributes(newDefinitionInput, {"type": "text", "placeholder": "Make new definition", "name": "new_definition", "id": "new_definition_txt_input"});
            addWordForm.insertBefore(newDefinitionInput, submitButton);
        });
        submitButton.setAttribute("value", "Add Word");
    } else {
        chrome.storage.local.get("words").then((result) => {
            //console.log(result);
            //console.log(Object.keys(result).length);
            //chrome.storage.local.set({"words"})
        });
        submitButton.setAttribute("value", "Search");
        cleanup_add_word_screen();
    }
}, true);

wordTextField.addEventListener("input", () => {
    console.log("tttt");
    cleanup_add_word_screen();
});
