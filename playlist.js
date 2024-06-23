const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'tonis1000';
const REPO_NAME = 'Tonis';

async function fetchUrls() {
    const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/urls.txt`, {
        headers: {
            'Accept': 'application/vnd.github.v3.raw'
        }
    });
    const text = await response.text();
    return text.split('\n').filter(url => url);
}

async function triggerGitHubAction(action, url) {
    const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/update-urls.yml/dispatches`, {
        method: 'POST',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
            ref: 'main',
            inputs: {
                action: action,
                url: url
            }
        })
    });

    if (!response.ok) {
        throw new Error('GitHub Action konnte nicht ausgelöst werden.');
    }
}

async function addUrl() {
    const urlInput = document.getElementById('urlInput').value.trim();
    if (urlInput) {
        await triggerGitHubAction('add', urlInput);
        renderUrls();
    }
}

async function deleteUrl() {
    const urlInput = document.getElementById('urlInput').value.trim();
    if (urlInput) {
        await triggerGitHubAction('delete', urlInput);
        renderUrls();
    }
}

async function renderUrls() {
    const urls = await fetchUrls();
    const playlist = document.getElementById('playlist');
    playlist.innerHTML = '';
    urls.forEach(url => {
        const li = document.createElement('li');
        li.textContent = url;
        li.onclick = () => {
            document.getElementById('urlInput').value = url;
        };
        playlist.appendChild(li);
    });
}

// Initial render
renderUrls();
