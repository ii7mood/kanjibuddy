async function saveServerConfig() {
    const res = await fetch('/api/config', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({ port: window.config.port })
    });
    return res.status;
}

const save_button = document.querySelector('.save-button');

save_button.addEventListener("click", () => {
    const no_cards_input = document.querySelector('#no-cards-input');
    const port_input = document.querySelector('#port-input');

    const no_cards = no_cards_input.value.trim() ? parseInt(no_cards_input.value.trim(), 10) : null;
    const port = port_input.value.trim() ? parseInt(port_input.value.trim(), 10) : null;
    if (!no_cards || !port) {
        console.log("Invalid card count or port");
        return;
    };

    window.config.no_cards = no_cards;
    window.config.port = port;
    saveServerConfig();
    window.saveSession();
    window.display_message("Some changes require a restart to take effect!", "success")
});