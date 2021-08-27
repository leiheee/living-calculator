import pandas as pd 
import numpy as np
import urllib2
import pandas as pd
import xlrd
import requests
import json
import prettytable
from prettytable import MSWORD_FRIENDLY


SAFMR=pd.read_excel('SAFMR.xls')
byage=pd.read_excel('age.xlsx',header=1,index_col=0)
byage=byage.rename(columns={
	'All\nconsumer\nunits': 'All Consumer Units',
	'Under\n25\nyears':'Under 25 years',
	'25-34\nyears':'25-34 years',
	'35-44\nyears':'35-44 years',
	'45-54\nyears':'45-54 years',
	'55-64\nyears':'55-64 years',
	'65 years\nand older':'65 years and older',
	'65-74\nyears':'65-74 years',
	'75 years\nand older':'75 years and older'
	})

#byincome=


def housing_lookup(zipcode):
	area=SAFMR[:][SAFMR['zipcode']==zipcode]
	Zero_BD=area['area_rent_br0'].item()
	One_BD=area['area_rent_br1'].item()
	Two_BD=area['area_rent_br2'].item()
	Three_BD=area['area_rent_br3'].item()
	Four_BD=area['area_rent_br4'].item()

	
	print "Zero Bedroom: $",Zero_BD
	print "One Bedroom: $",One_BD
	print "Two Bedroom: $",Two_BD
	print "Three Bedroom: $",Three_BD
	print "Four Bedroom: $",Four_BD


states_region={'Northeast':[9,23,25,33,44
							,50,34,36,42],
				'Midwest':[18,17,26,39,55,19
						,20,27,29,31,38,46],
				'South':[10,11,12,13,24,37,45,51,54,01,21,28
						,47,05,22,40,48],
				'West':[4,8,16,35,30,49,32,56,02,6,15,41,53]
			}
region_diff={'Northeast':1.08,'Midwest':0.95,'South':0.93,'West':1.11}
foodcost=pd.read_excel("Foodcost.xlsx")



#def find_statecode(zipcode):
	#return SAFMR['state'][SAFMR['zipcode']==zipcode]


def find_region(zipcode):
	state_code=SAFMR['state'][SAFMR['zipcode']==zipcode]
	for region, state in states_region.iteritems():
		if state_code.item() in state:
			return region





def food_cost(zipcode,adult,child=0,child_age=0):
		region=find_region(zipcode)
		if child_age!=0:
			return region_diff[region]*(child*foodcost['Monthly'][child_age]+
				adult*np.mean(foodcost['Monthly']['19-50 years']))
		else:
			return region_diff[region]*adult*np.mean(foodcost['Monthly']['19-50 years'])

def BLS_api(seriesid):
	headers = {'Content-type': 'application/json'}
	data = json.dumps({"seriesid": [seriesid],"startyear":"2014", "endyear":"2014"})
	p = requests.post('http://api.bls.gov/publicAPI/v2/timeseries/data/', data=data, headers=headers)
	json_data = json.loads(p.text)
	value=int(json_data['Results']['series'][0]['data'][0]['value'])

	return value





def health_cost(age,num=1,age_range='25-34 years',seriesid='CXUHEALTHLB0403M'):
	if age<=25:
		age_range='Under 25 years'
		seriesid='CXUHEALTHLB0402M'
	elif 35<age<44:
		age_range='35-44 years'
		seriesid='CXUHEALTHLB0404M'
	elif 45<age<54:
		age_range='45-54 years'
		seriesid='CXUHEALTHLB0405M'
	elif 55<age<64:
		age_range='55-64 years'
		seriesid='CXUHEALTHLB0406M'
	elif age>=65:
		age_range='65 years and older'
		seriesid='CXUHEALTHLB0407M'

	value=BLS_api(seriesid)
	healthcare=(value/byage.loc['People',age_range])*num


	return healthcare



def trans_cost(income):
	if income<=5000:
		seriesid='CXUTRANSLB0202M'
	elif 5000<income<=9999:
		seriesid='CXUTRANSLB0203M'
	elif 10000<=income<=14999:
		seriesid='CXUTRANSLB0204M'
	elif 15000<=income<=19999:
		seriesid='CXUTRANSLB0205M'
	elif 20000<=income<=29999:
		seriesid='CXUTRANSLB0206M'
	elif 30000<=income<=39999:
		seriesid='CXUTRANSLB0207M'
	elif 40000<=income<=49999:
		seriesid='CXUTRANSLB0208M' 
	elif 50000<=income<=69999:
		seriesid='CXUTRANSLB0209M'
	elif income>=70000:
		seriesid='CXUTRANSLB0210M'

	value=BLS_api(seriesid)
	return value

def other_necess(household_size):
	if household_size==1:
		apparel=BLS_api('CXUAPPARELLB0502M')
		housekeeping=BLS_api('CXUHKPGSUPPLB0502M')
		personcare=BLS_api('CXUPERSCARELB0502M')
		reading=BLS_api('CXUREADINGLB0502M')
		miscellaneous=BLS_api('CXUMISCLB0502M')

	elif household_size==2:
		apparel=BLS_api('CXUAPPARELLB0504M')
		housekeeping=BLS_api('CXUHKPGSUPPLB0504M')
		personcare=BLS_api('CXUPERSCARELB0504M')
		reading=BLS_api('CXUREADINGLB0504M')
		miscellaneous=BLS_api('CXUMISCLB0504M')
	elif household_size>2:
		apparel=BLS_api('CXUAPPARELLB0503M')
		housekeeping=BLS_api('CXUHKPGSUPPLB0503M')
		personcare=BLS_api('CXUPERSCARELB0503M')
		reading=BLS_api('CXUREADINGLB0503M')
		miscellaneous=BLS_api('CXUMISCLB0503M')

	return (apparel+housekeeping+personcare+reading+miscellaneous)











