import requests
import os

# URL der XML-Datei
url = 'https://github.com/GreekTVApp/epg-greece-cyprus/releases/download/EPG/epg.xml'

# Pfad, unter dem die XML-Datei gespeichert werden soll
local_path = 'data/epg.xml'

def download_xml(url, local_path):
    # Herunterladen der XML-Datei
    response = requests.get(url)

    # Überprüfen, ob der Download erfolgreich war
    if response.status_code == 200:
        # Speichern der XML-Datei im lokalen Ordner
        with open(local_path, 'wb') as f:
            f.write(response.content)
        
        print("XML-Datei erfolgreich heruntergeladen und gespeichert.")
        print("Gespeichert unter:", os.path.abspath(local_path))  # Absoluten Pfad anzeigen
    else:
        print("Fehler beim Herunterladen der XML-Datei.")

if __name__ == '__main__':
    # Funktion aufrufen, um die XML-Datei herunterzuladen und zu speichern
    download_xml(url, local_path)
