import requests

# URL der XML-Datei
url = 'https://github.com/GreekTVApp/epg-greece-cyprus/releases/download/EPG/epg.xml'

# Pfad, unter dem die XML-Datei gespeichert werden soll
local_path = 'data/epg.xml'

def download_xml(url, local_path):
    try:
        # Herunterladen der XML-Datei
        response = requests.get(url)

        # Überprüfen, ob der Download erfolgreich war
        if response.status_code == 200:
            # Speichern der XML-Datei im lokalen Ordner
            with open(local_path, 'wb') as f:
                f.write(response.content)
            print("XML-Datei erfolgreich heruntergeladen und gespeichert.")
        else:
            print("Fehler beim Herunterladen der XML-Datei. Statuscode:", response.status_code)
            with open('download_log.txt', 'a') as log_file:
                log_file.write("Fehler beim Herunterladen der XML-Datei. Statuscode:" + str(response.status_code) + "\n")
    except Exception as e:
        print("Fehler beim Herunterladen der XML-Datei:", str(e))
        with open('download_log.txt', 'a') as log_file:
            log_file.write("Fehler beim Herunterladen der XML-Datei:" + str(e) + "\n")

if __name__ == '__main__':
    # Funktion aufrufen, um die XML-Datei herunterzuladen und zu speichern
    download_xml(url, local_path)
