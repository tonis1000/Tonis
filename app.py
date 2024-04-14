from flask import Flask, render_template, jsonify
import xml.etree.ElementTree as ET
import requests

app = Flask(__name__)

def download_xml(url, local_path):
    # Herunterladen der XML-Datei
    response = requests.get(url)

    # Überprüfen, ob der Download erfolgreich war
    if response.status_code == 200:
        # Speichern der XML-Datei im lokalen Ordner
        with open(local_path, 'wb') as f:
            f.write(response.content)
        print("XML-Datei erfolgreich heruntergeladen und gespeichert.")
    else:
        print("Fehler beim Herunterladen der XML-Datei.")

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
    programs = parse_epg(epg_data)
    return render_template('index.html', programs=programs)

@app.route('/reload-epg')
def reload_epg():
    # Herunterladen und Parsen der XML-Datei
    download_xml('https://github.com/GreekTVApp/epg-greece-cyprus/releases/download/EPG/epg.xml', 'data/epg.xml')
    with open('data/epg.xml', 'r') as f:
        epg_data = f.read()
    # Rückgabe der EPG-Daten im XML-Format
    return epg_data

if __name__ == '__main__':
    app.run(debug=True)
