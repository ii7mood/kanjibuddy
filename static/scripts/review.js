async function list_cards(n) {
    let response;
    if (n === null) {
        response = await fetch('/api/cards');
    } else {
        response = await fetch(`/api/cards?limit=${n}`);
    };

    if (!response.ok) {
        window.display_message("Failed to get database records; refer to console logs.", "negative")
        console.log(response.body);
        return [];
    }
    return await response.json();
}

function mulberry32(seed) {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function shuffle(array, seed) {
    const random = typeof seed === 'number' ? mulberry32(seed) : Math.random;
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function toggle_answers() {
    const answers = document.querySelector('.answers');
    answers.classList.toggle('hidden');
};

async function start() {
    window.state.review.cards = await form_deck();
    window.state.review.correct = 0;
    window.state.review.wrong = 0;
    window.state.review.index = 0;
    window.saveSession();
    await render_app("review", "reviewing");
};

async function form_deck() {
    const seedElement = document.querySelector('.seed');
    const seed = seedElement.value.trim() ? parseInt(seedElement.textContent.trim(), 10) : 0;

    let deck = await list_cards(window.config.no_cards);

    if (document.querySelector('#shuffle-checkbox').checked) {
        shuffle(deck, seed);
    }

    return deck;
}

async function next_card() {
    if (window.state.review.index == window.state.review.cards.length-1) {
        window.render_app("review", "post-review");
        return;
    }
    window.state.review.index += 1;
    window.saveSession();
    document.querySelector('.answers').classList.add("hidden"); // not calling the toggle function cuz maybe its hidden when marked
    document.querySelector('#input-prompt-box').value = "";
    await render_app("review");
};

function mark_card(is_correct) {
    if (is_correct) {
        window.state.review.correct += 1;
    } else {
        window.state.review.wrong += 1;
    };
    next_card();
};

document.querySelector('.start-button').addEventListener('click', start);

document.querySelector('.continue-button').addEventListener('click', async () => {
    await render_app("review", "reviewing");
});

document.querySelector('#restart-button').addEventListener('click', async () => {
    window.state.review.index = 0;
    window.state.review.correct = 0;
    window.state.review.wrong = 0;
    await render_app("review", "reviewing");
});

document.querySelector('#show-answer').addEventListener('click', () => toggle_answers());
document.querySelector('#marker-correct').addEventListener('click', () => mark_card(true));
document.querySelector('#marker-incorrect').addEventListener('click', () => mark_card(false));

export function getKeymap(stage) {
    switch (stage) {
        case "pre-review":
            return [
                {
                    key: "Enter",
                    callback: start
                },
                {
                    key: 'c',
                    callback: () => render_app("review", "reviewing")
                }
            ]
        
        case "reviewing":
            return [
                {
                    key: 'Enter',
                    callback: toggle_answers
                },
                {
                    key: 'ArrowUp',
                    callback: () => mark_card(true)
                },
                {
                    key: 'ArrowDown',
                    callback: () => mark_card(false)
                }
            ]
        case "post-review":
            return [
                {
                    key: 'Enter',
                    callback: start
                }
            ]
    };
    window.display_message('Invalid stage keymap selection', "negative");
    return [{key: '', callback: console.log}] // temp solution; guard loadKeymap() later
}