// playlist.js

const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'tonis1000';
const REPO_NAME = 'Tonis';
const GITHUB_TOKEN = process.env.GH_TOKEN; // Zugriff auf das GitHub-Token über Umgebungsvariable

async function fetchUrls() {
    try {
        const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/urls.txt`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        });
        const text = await response.text();
        return text.split('\n').filter(url => url.trim() !== ''); // Filtere leere Zeilen
    } catch (error) {
        console.error('Fehler beim Abrufen der URLs:', error);
        return [];
    }
}

async function addUrl(url) {
    try {
        const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/update-urls.yml/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ref: 'main',
                inputs: {
                    action: 'add',
                    url: url
                }
            })
        });

        if (!response.ok) {
            throw new Error('GitHub Action konnte nicht ausgelöst werden.');
        }

        console.log('URL wurde erfolgreich hinzugefügt.');
    } catch (error) {
        console.error('Fehler beim Hinzufügen der URL:', error);
    }
}

async function deleteUrl(url) {
    try {
        const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/update-urls.yml/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ref: 'main',
                inputs: {
                    action: 'delete',
                    url: url
                }
            })
        });

        if (!response.ok) {
            throw new Error('GitHub Action konnte nicht ausgelöst werden.');
        }

        console.log('URL wurde erfolgreich gelöscht.');
    } catch (error) {
        console.error('Fehler beim Löschen der URL:', error);
    }
}

module.exports = {
    fetchUrls,
    addUrl,
    deleteUrl
};
