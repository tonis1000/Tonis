import requests

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

if __name__ == '__main__':
    # URL der XML-Datei
    url = 'https://ext.greektv.app/epg/epg.xml'
    # Pfad, unter dem die XML-Datei gespeichert werden soll
    local_path = 'data/epg.xml'
    # Funktion aufrufen, um die XML-Datei herunterzuladen und zu speichern
    download_xml(url, local_path)
