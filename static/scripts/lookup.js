export async function add_card() {
    let card = document.querySelectorAll('.card-input-box'); // returns a NodeList (a list of all objects that match the class)
    card = Array.from(card); // turns the NodeList into an array and now we can use Array-specific methods like .map()
    const [ kanji, meaning, onyomi, kunyomi ] = card.map(i => i.value);
    // ^ Deconstructed every value in the array `card` and assigned it (respectively) to the aforementioned variables
    
    if (!kanji.trim()) {
        console.log("'Kanji' Field is empty!");
        window.display_message("'Kanji' field is empty!", "error");
        return;
    } else if (!meaning.trim()) {
        console.log("'Meaning' field is empty!")
        window.display_message("'Meaning' field is empty!", "error")
        return;
    } else if (!onyomi.trim() && !kunyomi.trim()) {
        console.log("Both 'Onyomi' & 'Kunyomi' fields are empty!")
        window.display_message("'Onyomi' & 'Kunyomi' fields are empty!", "error")
        return;
    }

    const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({kanji, meaning, onyomi, kunyomi})
    });

    if (!response.ok) {
        console.log(response.body);
        window.display_message("Failed to add card; refer to console logs.");
        return;
    };
    return 0; // ok
};

export async function delete_card() {
    const ids = [];
    const checked_boxes = document.querySelectorAll('.select-checkbox:checked');
    checked_boxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const idCell = row.querySelector('td:nth-child(2)');
        const id = idCell.textContent.trim();
        ids.push(id);
    });

    const response = await fetch('/api/cards', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ ids }) // the same as {'ids': ids}
    });

    if (!response.ok) {
        console.log(response.body);
        window.display_message("Failed to delete card; refer to console logs.")
        return;
    };
    return; // ok
};

export async function toggle_save_mode(button) {
    const row = button.closest('tr');
    const id = row.querySelector('td:nth-child(2)').textContent.trim()

    if (button.classList.contains('save-mode')) {  // already in save-mode meaning we gotta update and return to normal view
        const editable_cells = row.querySelectorAll('.edit-box');
        const [ kanji, meaning, onyomi, kunyomi ] = Array.from(editable_cells).map(i => i.value);
        const response = await fetch(`/api/cards/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ kanji, meaning, onyomi, kunyomi})
        });
        if (response.status != 204) {
            console.log(response.body);
            window.display_message("Failed to update card; refer to console logs.")
            return;
        };

        editable_cells.forEach(cell => {
            const value = cell.value.trim();
            const td = cell.closest('td');
            td.textContent = value;
        });

        return 0;
    };

    // not in save-mode - make everythine editable and update button to '💾'
    const cells = row.querySelectorAll('td');
    for (let i = 2; i < cells.length - 1; i++ + 1) { // ignore the first two cells (checkbox and id) and the last one (modify button)
        const cell_value = cells[i].textContent.trim();
        cells[i].innerHTML = `<input class="edit-box" value="${cell_value}">`;
    };
    button.textContent = '💾';
    button.classList.add('save-mode');
    return 1;
}

const add_card_button = document.querySelector("button.add-card");
add_card_button.addEventListener('click', async () => {
    await add_card();
    await window.render_app('lookup'); // gotta re-render to show changes happening in the db
});

const delete_records_button = document.querySelector("button.delete-card");
delete_records_button.addEventListener('click', async () => { // have to be async since we're chaining two async functions
    await delete_card();  
    await window.render_app('lookup')
});

document.addEventListener('click', async (e) => {
    const button = e.target.closest('.modify-record-button');
    if (!button) {
        return;
    }
    const code = await toggle_save_mode(button); 
    // returns 0 if something was updated in DB, returns 1 if entered save-mode, otherwise errors 
    if (code === 0) {
        window.display_message("Updated!", "success")
        await window.render_app('lookup'); // have to re-render to show updated change in the database.
    }
});

let lastCheckedIndex = null;

function handlePossibleShiftSelection(e) {
    const boxes = Array.from(document.querySelectorAll('.select-checkbox'));
    const currentIndex = boxes.indexOf(e.target);

    if (e.shiftKey && lastCheckedIndex !== null) {
        const [start, end] = [lastCheckedIndex, currentIndex].sort((a, b) => a - b);
        // array.sort() takes a comparison function that returns a number.U+
        // The sign of that number determines the order:
        //   negative → a comes before b
        //   positive → a comes after b
        //   zero     → order stays the same
        for (let i = start; i <= end; i++) {
            boxes[i].checked = e.target.checked;
        }
    }

    lastCheckedIndex = currentIndex;
}

export function lookup_post_process() {
    const boxes = document.querySelectorAll('.select-checkbox');
    boxes.forEach(box => {
        box.addEventListener('click', handlePossibleShiftSelection);
    });
}
