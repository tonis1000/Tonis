from flask import Flask, render_template, send_from_directory, request
import requests

app = Flask(__name__)

@app.route('/')
def index():
    epg_data = requests.get('https://github.com/GreekTVApp/epg-greece-cyprus/releases/download/EPG/epg.xml').text
    playlist_data = requests.get('https://raw.githubusercontent.com/gluk03/iptvgluk/dd9409c9f9029f6444633267e3031741efedc381/TV.m3u').text
    external_content = requests.get('https://foothubhd.xyz/').text
    return render_template('index.html', epg_data=epg_data, playlist_data=playlist_data, external_content=external_content)

@app.route('/playlist.m3u')
def serve_playlist():
    return send_from_directory('static', 'playlist.m3u')

if __name__ == '__main__':
    app.run(debug=True)
