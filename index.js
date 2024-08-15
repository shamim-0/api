const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.use('/invoice', express.static(path.join(__dirname, 'invoice')));

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.post('/generate-pdf', async (req, res) => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const url = req.body.url;
    const filename = Date.now();
    const filePath = path.join(__dirname, 'invoice', `${filename}.pdf`);

    try {
        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.pdf({ path: filePath, format: 'A4', printBackground: true });
        res.send({url : `/invoice/${filename}.pdf`});
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('An error occurred while generating the PDF');
    } finally {
        await browser.close();
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
