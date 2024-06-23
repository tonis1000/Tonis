// playlist.js

const fetch = require('node-fetch');
const fs = require('fs');

const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'tonis1000';
const REPO_NAME = 'Tonis';
const FILE_PATH = 'urls.txt';
const GITHUB_TOKEN = process.env.GH_TOKEN;

async function fetchUrls() {
    const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3.raw'
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch URLs: ${response.statusText}`);
    }
    const text = await response.text();
    return text.split('\n').filter(url => url.trim() !== '');
}

async function updateFile(content) {
    const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Update urls.txt',
            content: Buffer.from(content).toString('base64'),
            sha: await getSha()
        })
    });
    if (!response.ok) {
        throw new Error(`Failed to update file: ${response.statusText}`);
    }
    console.log('File updated successfully.');
}

async function getSha() {
    const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3.raw'
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to get file SHA: ${response.statusText}`);
    }
    const fileData = await response.json();
    return fileData.sha;
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

async function loadUrls() {
    const urls = await fetchUrls();
    console.log('Loaded URLs:');
    urls.forEach(url => console.log(url));
}

// Example usage
// loadUrls();  // Uncomment to load and display URLs
// addUrl('https://example.com');  // Example to add a new URL
// deleteUrl('https://example.com');  // Example to delete a URL
