#!/usr/bin/env python3

from base64 import b64encode
from flask import Flask
from flask import redirect, url_for, jsonify
import requests
import sys
import os

app = Flask(__name__)
# Obtaining client ID and client secret from env. variables
if os.environ.get('KKBOX_CLIENT_ID') is None:
    print("Missing environment variable 'KKBOX_CLIENT_ID'.")
    sys.exit(-1)
else:
    app.config['client_id'] = os.environ.get('KKBOX_CLIENT_ID')

if os.environ.get('KKBOX_CLIENT_SECRET') is None:
    print("Missing environment variable 'KKBOX_CLIENT_SECRET'.")
    sys.exit(-1)
else:
    app.config['client_secret'] = os.environ.get('KKBOX_CLIENT_SECRET')


@app.route('/')
def index():
    return redirect(url_for('static', filename='index.html'))


@app.route('/token')
def get_token(methods=['GET']):
    auth = b64encode(app.config['client_id'].encode('ascii') +
                     b':' +
                     app.config['client_secret'].encode('ascii'))
    resp = requests.post('https://account.kkbox.com/oauth2/token',
                         headers={'Authorization': 'Basic ' + auth.decode('ascii')},
                         data={'grant_type': 'client_credentials'})
    return jsonify(resp.json())


if __name__ == '__main__':
    app.run(port=8888, debug=True)
