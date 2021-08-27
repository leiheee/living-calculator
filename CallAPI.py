import requests
import json
import prettytable
from prettytable import MSWORD_FRIENDLY

headers = {'Content-type': 'application/json'}
data = json.dumps({"seriesid": ['CXUAPPARELLB0503M'],"startyear":"2014", "endyear":"2014"})
p = requests.post('http://api.bls.gov/publicAPI/v2/timeseries/data/', data=data, headers=headers)
json_data = json.loads(p.text)
value=int(json_data['Results']['series'][0]['data'][0]['value'])
