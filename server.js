import express from 'express'
import database from './db.js'
import { writeFile, readFile } from 'fs/promises';
import { isNumberObject } from 'util/types';

async function saveServerConfig(config) {
  if (typeof config !== 'object' || config === null) throw new Error("Invalid config");  
  // safe guard against writing non-object stuff to the fs ^ 
  await writeFile('config.json', JSON.stringify(config, null, 2), 'utf-8');
}


async function loadServerConfig() {
    return JSON.parse(await readFile('config.json', 'utf-8'));
};

let config;
try {
    config = await loadServerConfig();
} catch (err) {
    config = { port: 3000 }
    await saveServerConfig(config);
};

const app = express()
const PORT = (typeof config.port === 'number' && Number.isFinite(config.port)) ? config.port : 3000;
app.use(express.json())
app.use(express.static("./static"))

app.get('/api/cards', async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : null;
    if (limit != null) {
        return res.send(await database.list_cards(limit)) // returns an array of objects
    };
    return res.send(await database.list_cards());
});

app.get('/api/cards/:id', async (req, res) => {
    res.send(await database.get_card(req.params.id)); // an array containing a single object
});

app.post('/api/cards', async (req, res) => {
    const { kanji, meaning, kunyomi, onyomi } = req.body;
    await database.add_card(kanji, meaning, kunyomi, onyomi);
    res.send('Added new card!')
});

app.delete('/api/cards', async (req, res) => {
    const { ids } = req.body;
    await database.bulk_delete_cards(ids);
    res.sendStatus(204);
});

app.put('/api/cards/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { kanji, meaning, onyomi, kunyomi } = req.body;
  await database.update_card(id, kanji, meaning, onyomi, kunyomi);
  res.sendStatus(204);
});

app.post('/api/config', async (req, res) => {
  try {
    await saveServerConfig(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Failed to save config' });
  }
});

app.get('/api/config', async (req, res) => {
    const config = await loadServerConfig();
    res.json(config);
});

app.get('/', (req, res) => {
    res.sendFile('index.html');
})

app.listen(PORT, () => console.log('Server running at http://localhost:'+PORT))