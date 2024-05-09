from flask import Flask, render_template, jsonify, send_from_directory
import os
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

@app.route('/')
def index():
    with open('data/epg.xml', 'r') as f:
        epg_data = f.read()
    return render_template('index.html')

@app.route('/reload-epg')
def reload_epg():
    # Herunterladen und Speichern der XML-Datei
    download_xml('https://ext.greektv.app/epg/epg.xml', 'data/epg.xml')
    return send_from_directory(os.path.join(app.root_path, 'data'), 'epg.xml')

if __name__ == '__main__':
    app.run(debug=True)
