import { getKeymap as getStageKeymap} from "./review.js";
import "./settings.js";
import "./keyboard.js";
import { lookup_post_process } from "./lookup.js";
import { saveSession, loadReviews, clearReviews, loadConfig } from "./session.js";
import { loadKeymap } from "./keyboard.js";

function display_message(message, type = "info") { // types can be info, success, or error
    console.log(`${message} \nType: ${type}`)
  const area = document.getElementById("message-area");
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = message;
  area.appendChild(div);

  setTimeout(() => {
    div.style.opacity = "0";
    div.style.transform = "translateY(-10px)";
    setTimeout(() => div.remove(), 300);
  }, 4000);
};

async function render_review(stage) {
    if (stage && stage != state.review.stage && ["pre-review", "reviewing", "post-review"].includes(stage)) {
        document.querySelector(`section#${state.review.stage}`).classList.add('hidden');
        document.querySelector(`section#${stage}`).classList.remove('hidden');
        state.review.stage = stage;
        loadKeymap(getStageKeymap(stage));
    };

    switch (state.review.stage) {
        case "pre-review":
            const continue_button = document.querySelector('.continue-button');
            if (window.state.review.index == 0) {
                continue_button.disabled = true;
                continue_button.classList.add('disabled');
            } else {
                continue_button.disabled = false;
                continue_button.classList.remove('disabled');
            }
            break;

        case "reviewing":
            const card = state.review.cards[state.review.index]
            document.querySelector('.kanji').textContent = card.kanji;
            document.querySelector('.meaning').textContent = card.meaning;
            document.querySelector('.onyomi').textContent = card.onyomi;
            document.querySelector('.kunyomi').textContent = card.kunyomi;
            document.querySelector('.point-counter').textContent = `${state.review.correct}/${state.review.index}`;
            document.querySelector('.card-counter').textContent = `${state.review.index+1}/${state.review.cards.length}`;
            document.querySelector('#input-prompt-box').focus();
            break;
        
        case "post-review":
            document.querySelector('#final-score').textContent = `Final Score: ${window.state.review.correct}/${window.state.review.cards.length}`;
            
    }
}

async function render_lookup() {
    const table_body = document.querySelector('#card-table tbody');
    table_body.innerHTML = ''; // clear previous rows

    const records = await fetch('/api/cards');
    if (!records.ok) {
        display_message("Network response was not ok; refer to logs.", "error")
        console.log(records.body)
        throw new Error('Network response was not ok');
    }
    const cards = await records.json();

    cards.forEach(card => {
        const row = document.createElement('tr')
        row.innerHTML = `
        <td class="select-cell center-text"> <label> <input type="checkbox" class="select-checkbox"> </label> </td>
        <td class="center-text">${card.id}</td>
        <td class="center-text">${card.kanji}</td>
        <td class="center-text">${card.meaning}</td>
        <td class="center-text">${card.onyomi}</td>
        <td class="center-text">${card.kunyomi}</td>
        <td class="center-text"><button class="markers marker-correct modify-record-button">✏️</button></td>
        `
        table_body.appendChild(row);
    });
}

async function render_lookalike() {
    display_message("Working on it!", "info")
}

async function render_settings() {
    const port_input = document.querySelector('#port-input');
    const no_cards_input = document.querySelector("#no-cards-input");

    port_input.value = window.config.port;
    no_cards_input.value = window.config.no_cards;
}

async function render_app(scene_id, stage = null) {
    if (scene_id != null) { // change scene rather than re-render current scene
        document.querySelector(`section#${state.scene}`).classList.add('hidden');
        document.querySelector(`section#${scene_id}`).classList.remove('hidden');
        state.scene = scene_id;
    };

    // now to actually render request scene
    switch (state.scene) {
        case "review":
            render_review(stage);
            break;
        case "lookup":
            await render_lookup(); 
            lookup_post_process(); // wait for rendering to be done before running post_process
            break;
        case "lookalike":
            render_lookalike();
            break;
        case "settings":
            await render_settings();
            break;
    }
}

const tabs = document.querySelectorAll('.button-tab');
tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
        const prev_scene = document.querySelector('.content > section:not(.hidden)'); 
        // content > section.not... means give me any section elements directly within content (top-level only)
        prev_scene.classList.add('hidden');
        document.querySelector(`#${prev_scene.id}-tab`).classList.remove('active');

        document.querySelector(`section#${tab.id.replace('-tab', '')}`).classList.remove('hidden');
        tab.classList.add('active');      
        await render_app(tab.id.replace('-tab', '')); // switching between tabs should never invoke a change in stage       
    });
});

let state = {
    review: loadReviews(),
    scene: "review",
    clearReviews
};
if (!state.review) {
  state.review = {
      cards: [],
      index: 0,
      correct: 0,
      wrong: 0,
      stage: "pre-review",
    }
};

state.review.stage = "pre-review"; // saved session includes the review stage.. hacky but we'll deal with it later
let config = await loadConfig(); // will handle init if config is empty/corrupted

window.render_app = render_app;
window.state = state;
window.config = config;
window.saveSession = saveSession;
window.addEventListener('beforeunload', window.saveSession);
window.display_message = display_message;
loadKeymap(getStageKeymap(state.review.stage));

window.render_app("review", "pre-review");