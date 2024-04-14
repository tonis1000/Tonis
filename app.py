# app.py

from flask import Flask, render_template
import xml.etree.ElementTree as ET
import requests

app = Flask(__name__)

def download_xml(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.text
    else:
        return None

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
    epg_url = 'https://github.com/GreekTVApp/epg-greece-cyprus/releases/download/EPG/epg.xml'
    epg_data = download_xml(epg_url)
    if epg_data:
        programs = parse_epg(epg_data)
    else:
        programs = []
    return render_template('index.html', programs=programs)
