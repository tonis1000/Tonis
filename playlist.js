const fetch = require('node-fetch');

const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'tonis1000'; // Dein GitHub Benutzername
const REPO_NAME = 'Tonis'; // Name deines Repositories
const FILE_PATH = 'urls.txt'; // Pfad zur Datei in deinem Repository

const GITHUB_TOKEN = process.env.GH_TOKEN; // Dein GitHub Access Token

async function fetchUrls() {
    const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3.raw'
        }
    });
    const text = await response.text();
    return text.split('\n').filter(url => url);
}

async function updateFile(content) {
    const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`
        }
    });
    const fileData = await response.json();
    const updatedContent = Buffer.from(content).toString('base64');

    await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Update urls.txt',
            content: updatedContent,
            sha: fileData.sha
        })
    });
}

async function addUrl(url) {
    const urls = await fetchUrls();
    urls.push(url);
    await updateFile(urls.join('\n'));
}

async function deleteUrl(url) {
    const urls = await fetchUrls();
    const updatedUrls = urls.filter(u => u !== url);
    await updateFile(updatedUrls.join('\n'));
}

module.exports = { fetchUrls, addUrl, deleteUrl };
