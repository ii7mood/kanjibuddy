import { getKeymap as getStageKeymap } from "./review.js";
import "./settings.js";
import "./keyboard.js";
import { library_post_process } from "./library.js";
import { saveSession, loadReviews, clearReviews, loadConfig } from "./session.js";
import { loadKeymap } from "./keyboard.js";

function display_message(message, type = "neutral") {
  console.log(`${message} \nType: ${type}`);
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
}

async function render_review(stage) {
  if (
    stage &&
    stage != state.review.stage &&
    ["pre-review", "reviewing", "post-review"].includes(stage)
  ) {
    document.querySelector(`section#${state.review.stage}`).classList.add("hidden");
    document.querySelector(`section#${stage}`).classList.remove("hidden");
  }

  switch (state.review.stage) {
    case "pre-review":
      const continue_button = document.querySelector(".continue-button");
      if (window.state.review.index == 0) {
        continue_button.disabled = true;
        continue_button.classList.add("disabled");
      } else {
        continue_button.disabled = false;
        continue_button.classList.remove("disabled");
      }
      break;

    case "reviewing":
      const card = state.review.cards[state.review.index];
      if (card == null) {
        window.display_message(
          "Card is null. (Did you add any cards to your deck?)",
          "negative"
        );
        return;
      }

      document.querySelector(".kanji").textContent = card.kanji;
      document.querySelector(".meaning").textContent = card.meaning;
      document.querySelector(".onyomi").textContent = card.onyomi;
      document.querySelector(".kunyomi").textContent = card.kunyomi;
      document.querySelector(".point-counter").textContent =
        `${state.review.correct}/${state.review.index}`;
      document.querySelector(".card-counter").textContent =
        `${state.review.index + 1}/${state.review.cards.length}`;
      document.querySelector("#input-prompt-box").focus();
      break;

    case "post-review":
      document.querySelector("#final-score").textContent =
        `Final Score: ${window.state.review.correct}/${window.state.review.cards.length}`;
  }
}

async function render_library() {
  const table_body = document.querySelector("#card-table tbody");
  table_body.innerHTML = ""; // clear previous rows

  const records = await fetch("/api/cards");
  if (!records.ok) {
    display_message("Network response was not ok; refer to logs.", "negative");
    console.log(await response.json());
    throw new Error("Network response was not ok");
  }
  const cards = await records.json();

  cards.forEach((card) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td class="select-cell center-text"> <label> <input type="checkbox" class="select-checkbox"> </label> </td>
        <td class="center-text">${card.id}</td>
        <td class="center-text">${card.kanji}</td>
        <td class="center-text">${card.meaning}</td>
        <td class="center-text">${card.onyomi}</td>
        <td class="center-text">${card.kunyomi}</td>
        <td class="center-text"><button class="modify-record-button generic-btn positive">✏️</button></td>
        `;
    table_body.appendChild(row);
  });
}

async function render_settings() {
  const port_input = document.querySelector("#port-input");
  const no_cards_input = document.querySelector("#no-cards-input");

  port_input.value = window.config.port;
  no_cards_input.value = window.config.no_cards;
}

async function render_app(scene_id, stage = null) {
  if (scene_id != null) {
    // change scene rather than re-render current scene i.e scene_id is not null
    document.querySelector(`section#${state.scene}`).classList.add("hidden");
    document.querySelector(`section#${scene_id}`).classList.remove("hidden");
    document.querySelector(`#${state.scene}-tab`).classList.remove("active");
    state.scene = scene_id;
  }
  
  switch (state.scene) {
    case "review":
      document.querySelector("#review-tab").classList.add("active");
      render_review(stage);
      loadKeymap(getStageKeymap(state.review.stage));
      break;
    case "library":
      document.querySelector("#library-tab").classList.add("active");
      await render_library();
      library_post_process(); // wait for rendering to be done before running post_process
      loadKeymap([]); // no defined keymap for this section
      break;
    case "settings":
      document.querySelector("#settings-tab").classList.add("active");
      await render_settings();
      loadKeymap([]);
      break;
  }
}

const tabs = document.querySelectorAll(".sidebar-tab");
tabs.forEach((tab) => {
  tab.addEventListener("click", async () => await render_app(tab.id.replace("-tab", "")));
}); // switching between tabs should never invoke a change in stage

let state = {
  review: loadReviews(),
  scene: "review",
  clearReviews,
};
if (!state.review) {
  state.review = {
    cards: [],
    index: 0,
    correct: 0,
    wrong: 0,
    stage: "pre-review",
  };
}

state.review.stage = "pre-review"; // saved session includes the review stage.. hacky but we'll deal with it later
let config = await loadConfig(); // will handle init if config is empty/corrupted

window.render_app = render_app;
window.state = state;
window.config = config;
window.saveSession = saveSession;
window.addEventListener("beforeunload", window.saveSession);
window.display_message = display_message;
loadKeymap(getStageKeymap(state.review.stage));

window.render_app("review", "pre-review");
