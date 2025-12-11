const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());

// 📌 Ajoute ça pour servir index.html
app.use(express.static(__dirname));

let SOURCE_URL = 'https://n01darts.com/n01/online/n01_view.html?scid=scid_bJL5umHq_1765443480237';

let browser;
let page;

// Fonction pour démarrer Puppeteer une fois
async function initBrowser() {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    page = await browser.newPage();
    await page.goto(SOURCE_URL, { waitUntil: 'domcontentloaded' });
}

initBrowser();

app.get('/scores', async (req, res) => {
    try {
        const data = await page.evaluate(() => {

            const p1_name = document.querySelector('#p1_name .name_text')?.textContent.trim() || 'Joueur 1';
            const p2_name = document.querySelector('#p2_name .name_text')?.textContent.trim() || 'Joueur 2';
            const p1_score = document.getElementById('p1left_big')?.textContent.trim() || '';
            const p2_score = document.getElementById('p2left_big')?.textContent.trim() || '';

            let p1_legs = '0', p2_legs = '0';
            const legsTd = document.getElementById('legs')?.textContent || '';
            const match = legsTd.match(/\d+\s*-\s*\d+/);
            if(match){
                [p1_legs, p2_legs] = match[0].split('-').map(s => s.trim());
            }

            let currentPlayer = '';
            const p1Div = document.querySelector('.score_input.p1score.input_area');
            const p2Div = document.querySelector('.score_input.p2score.input_area');
            if (p1Div?.classList.contains('loding')) currentPlayer = p1_name;
            else if (p2Div?.classList.contains('loding')) currentPlayer = p2_name;

            const titleText = document.getElementById('title')?.textContent || '';

            const parens = [...titleText.matchAll(/\(([^)]+)\)/g)];
            const firstTo = parens.length > 0 ? parens[parens.length - 1][1] : '';

            let cleanTitle = titleText.replace(/\([^)]*\)/g, "").trim();
            cleanTitle = cleanTitle.replace(/\s+/g, " ").trim();

            return { p1_name, p2_name, p1_score, p2_score, p1_legs, p2_legs, currentPlayer, firstTo, cleanTitle };
        });

        res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Impossible de récupérer les scores' });
    }
});

app.get('/set-url', async (req, res) => {
    const newUrl = req.query.url;
    if (!newUrl) return res.status(400).json({ error: "URL manquante" });

    try {
        SOURCE_URL = newUrl;
        await page.goto(SOURCE_URL, { waitUntil: 'domcontentloaded' });

        // Redirige vers index.html à la racine
        return res.redirect("/index.html");

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Impossible de charger la nouvelle URL" });
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
