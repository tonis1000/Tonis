# app.py

from flask import Flask, render_template, send_from_directory, request
import xml.etree.ElementTree as ET
from download_xml import download_xml

app = Flask(__name__)

def parse_epg(xml_data):
    programs = []
    root = ET.fromstring(xml_data)
    channels = {channel.get('id'): channel.find('display-name').text for channel in root.findall('.//channel')}
    for programme in root.findall('.//programme'):
        channel_id = programme.get('channel')
        channel_name = channels.get(channel_id, 'Unknown Channel')
        program_title = programme.find('title').text
        programs.append((channel_name, program_title))
    return programs

@app.route('/')
def index():
    # Heruntergeladene XML-Datei verwenden
    download_xml('https://github.com/GreekTVApp/epg-greece-cyprus/releases/download/EPG/epg.xml', 'data/epg.xml')
    with open('data/epg.xml', 'r') as f:
        epg_data = f.read()
    playlist_data = requests.get('https://raw.githubusercontent.com/gluk03/iptvgluk/dd9409c9f9029f6444633267e3031741efedc381/TV.m3u').text
    external_content = requests.get('https://foothubhd.xyz/').text
    programs = parse_epg(epg_data)
    return render_template('index.html', epg_data=epg_data, playlist_data=playlist_data, external_content=external_content, programs=programs)

@app.route('/playlist.m3u')
def serve_playlist():
    return send_from_directory('static', 'playlist.m3u')

if __name__ == '__main__':
    app.run(debug=True)
