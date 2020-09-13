# -*- coding: utf8 -*-
import jwt
import time
import json
import os
from hyper import HTTPConnection

class ApnsPusher(object):
	def __init__(self, apns_key_id = '', apns_key_name = '.p8', team_id = '', bundle_id = ''):
		self.ALGORITHM = 'ES256'
		self.APNS_KEY_ID = apns_key_id
		self.APNS_AUTH_KEY = os.path.dirname(os.path.realpath(__file__)) + '/' + apns_key_name
		self.TEAM_ID = team_id
		self.BUNDLE_ID = bundle_id

	def push(self, title, body, device_token, isProduction):
		file = open(self.APNS_AUTH_KEY)
		secret = file.read()
		token = jwt.encode({
		            'iss': self.TEAM_ID,
		            'iat': time.time()
		        },
		        secret,
		        algorithm = self.ALGORITHM,
		        headers = {
		            'alg': self.ALGORITHM,
		            'kid': self.APNS_KEY_ID,
		        }
		)
		path = '/3/device/{0}'.format(device_token)
		request_headers = {
	        'apns-expiration': '0',
	        'apns-priority': '10',
	        'apns-topic': self.BUNDLE_ID,
	        'authorization': 'bearer {0}'.format(token.decode('ascii'))
		}
		if isProduction:
			conn = HTTPConnection('api.push.apple.com:443')
		else :
			conn = HTTPConnection('api.development.push.apple.com:443')
		payload_data = {
			'aps': {
				'alert': {
					'title': title,
					'body': body
				},
				'badeg': 1,
				'sound': 'default'
	        }
		}
		payload = json.dumps(payload_data).encode('utf-8')
		conn.request(
	        'POST',
	        path,
	        payload,
	        headers=request_headers
		)

		resp = conn.get_response()
		print(resp.status)
		print(resp.read())
		
#if __name__ == "__main__":
#	apns_key_id = 'DL62494RSF'
#	apns_key_name = 'AuthKey_DL62494RSF.p8'
#	team_id = '53WG8ZJ3KX'
#	bundle_id = 'Artur-Mrowca'
#
#	app = ApnsPusher(apns_key_id = apns_key_id, apns_key_name = apns_key_name, team_id = team_id, bundle_id = bundle_id)
#
#	device_id = "c5ec4e50087baf1da491a2833c774007b6e1691174b2ee9add25177ab771db00"
#	app.push( "Hi du Sackgesicht", "Brutsack", device_id, False)