var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cities=require('cities');

var mongojs=require('mongojs');
var db=mongojs('mydb');
var SAFMR=db.collection('SAFMR');
var foodcost=db.collection('foodcost');
var occup_wage=db.collection('occup_wage');


var request=require('request');




app.use(bodyParser.json());
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// Get

app.get('/', function(req, res) {
  res.send('API is working');
});

app.get('/api/health',CostOfHealth);
app.get('/api/housing',CostOfHousing);
app.get('/api/food',CostOfFood);
app.get('/api/transportation',CostOfTrans);
app.get('/api/miscellaneous',CostOfMis);
app.get('/api/occupation',getSalary);

// Functions 
function CostOfHousing(req,res)
{
	
	var zip=Number(req.query.zipcode);
	var city_state=req.query.city+", "+req.query.state+" ";
	
	if(zip!=0){
		SAFMR.find({zipcode:zip},{area_rent_br0:1, area_rent_br1:1,area_rent_br2:1,area_rent_br3:1,area_rent_br4:1,_id:0}).limit(1).toArray(function(err,result){
			if(err){
				res.send(err);
			}else{
				rents=result[0];
				console.log(rents);
				res.json(rents);
			}
		})

	}
	else{
	SAFMR.find({cbnsmcnm:city_state},{area_rent_br0:1, area_rent_br1:1,area_rent_br2:1,area_rent_br3:1,area_rent_br4:1,_id:0}).limit(1).toArray(function(err,result){
			if(err){
				res.send(err);
			}else{
				rents=result[0];
				console.log(rents);
				res.json(rents);
			}
		})
	}
}


function CostOfFood(req,res)
{	
	region_diff={'Northeast':1.08,'Midwest':0.95,
		'South':0.93,'West':1.11};

	var city_state=req.query.city;
	console.log(city_state);
	var numOfChild=Number(req.query.child);
	var numOfAdult=Number(req.query.adult);
	var childage=req.query.childage;


	SAFMR.find({cbnsmcnm:new RegExp(city_state)},{state:1,_id:0}).toArray(
		function(err,result)
	{
		if(err){
			res.send(err);
		}else{
			state_code=result[0].state;
			region=region_diff[findregion(state_code)];

			foodcost.find({period:'Monthly'}).toArray(function(err,result)
			{
				if(err)
					res.send(err);
				else{
					result=result[0];
					CostByChild=result[childage]*numOfChild;
					CostByAdult=0.5*numOfAdult*(result['M19-50 years']+result['F19-50 years']);
					res.json({Foodcost: CostByChild+CostByAdult});
				}
			})

		}
	})

}



function CostOfHealth(req,res,next){
	
  	var age=req.query.age;
  	age_series={'Under 25 years':'CXUHEALTHLB0402M','25-34 years':'CXUHEALTHLB0403M',
  				'35-44 years':'CXUHEALTHLB0404M','45-54 years':'CXUHEALTHLB0405M',
  				'55-64 years':'CXUHEALTHLB0406M','65 years and older':'CXUHEALTHLB0407M'};

  	request({
  	"url":"http://api.bls.gov/publicAPI/v2/timeseries/data/",
  	"method":"POST",
  	"headers":{"Content-Type":"application/json"},
  	"body":'{"seriesid":["'+age_series[age]+'"], "startyear":"2014", "endyear":"2014","registrationKey":"982a3340a6dc4b849ef5dea03d712b97" }'}, function(err, response, body){
    if(!err && response.statusCode < 400){
      var parseBody=JSON.parse(body);
      var healthcost=parseBody.Results.series[0].data[0].value;
      res.json({healthcost:healthcost});
    } else {
      if(response){
        console.log(response.statusCode);
      }
      next(err);
    }
  })
};

function findregion(state_code)
{
	states_region={'Northeast':[9,23,25,33,44
							,50,34,36,42],
				'Midwest':[18,17,26,39,55,19
						,20,27,29,31,38,46],
				'South':[10,11,12,13,24,37,45,51,54,01,21,28
						,47,05,22,40,48],
				'West':[4,8,16,35,30,49,32,56,02,6,15,41,53],

			};
	for (key in states_region)
	{
		if (states_region[key].indexOf(state_code)>-1)
			console.log(key);
			return key;
	}
}

function CostOfTrans(req,res,next){
	
  	var income=req.query.income;
  	var seriesid='';
  
  	switch(true){
  		case (income<=5000):
  			seriesid='CXUTRANSLB0202M';
  			break;
  		case (income>5000 && income<=9999):
  			seriesid='CXUTRANSLB0203M';
  			break;
  		case (income>9999 && income<=14999):
  			seriesid='CXUTRANSLB0204M';
  			break;
  		case (income>14999 && income<=19999):
  			seriesid='CXUTRANSLB0205M';
  			break;
  		case (income>19999 && income<=29999):
  			seriesid='CXUTRANSLB0206M';
  			break;
  		case (income>29999 && income<=39999):
  			seriesid='CXUTRANSLB0207M';
  			break;
  		case (income>39999 && income<=49999):
  			seriesid='CXUTRANSLB0208M';
  			break;
  		case (income>49999 && income<=69999):
  			seriesid='CXUTRANSLB0209M';
  			break;
  		case (income>69999):
  			seriesid='CXUTRANSLB0210M';
  			break;
		}

  	request({
  	"url":"http://api.bls.gov/publicAPI/v2/timeseries/data/",
  	"method":"POST",
  	"headers":{"Content-Type":"application/json"},
  	"body":'{"seriesid":["'+seriesid+'"], "startyear":"2014","endyear":"2014","registrationKey":"982a3340a6dc4b849ef5dea03d712b97" }'}
  	, function(err, response, body){
    if(!err && response.statusCode < 400){
    	var parseBody=JSON.parse(body);
      	var transcost=parseBody.Results.series[0].data[0].value;
      	console.log(transcost);
     	res.json({transportation:transcost});
    } else {
      if(response){
        console.log(response.statusCode);
      }
      next(err);
    }
  })
};

// Cost of Miscellaneous
function CostOfMis(req,res,next){
	
  	var household_size=Number(req.query.child)
  							+Number(req.query.adult);
  	
  
  	switch(true){
  		case (household_size==1):
  			series=["CXUAPPARELLB0502M","CXUHKPGSUPPLB0502M","CXUPERSCARELB0502M","CXUREADINGLB0502M","CXUMISCLB0502M"];
  			break;
  		case (household_size==2):
  			series=["CXUAPPARELLB0504M","CXUHKPGSUPPLB0504M","CXUPERSCARELB0504M",
  						"CXUREADINGLB0504M","CXUMISCLB0504M"];
  			break;
  		case (household_size>2):
  			series=["CXUAPPARELLB0503M","CXUHKPGSUPPLB0503M","CXUPERSCARELB0503M",
  						"CXUREADINGLB0503M","CXUMISCLB0503M"];
  			break;
		}
	//console.log(series);
  	request({
  	"url":"http://api.bls.gov/publicAPI/v2/timeseries/data/",
  	"method":"POST",
  	"headers":{"Content-Type":"application/json"},
  	"body":'{"seriesid":["'+series[0]+'","'+series[1]+'","'+series[2]+'","'+series[3]+'","'+series[4]+'"],"startyear":"2014","endyear":"2014","registrationKey":"982a3340a6dc4b849ef5dea03d712b97" }'}
  	,function(err, response, body){
    if(!err && response.statusCode < 400){
    	var parseBody=JSON.parse(body);
    	//console.log(parseBody.Results.series.length)
      	var mis_cost=0;
      	for(i=0;i<parseBody.Results.series.length;i++)
      		{	
      			//console.log(parseBody.Results.series[i].data[0].value);
      			mis_cost+=Number(parseBody.Results.series[0].data[0].value);
      		}
      	console.log(mis_cost);
     	res.json({miscellaneous:mis_cost});
    } else {
      if(response){
        console.log(response.statusCode);
      }
      next(err);
    }
  })
};

function getSalary(req,res){
	var job_title=req.query.jobtitle;

	var city=req.query.city;
	var state=req.query.state;
	console.log(state);
	if (city!=""){
	occup_wage.find({area_title:new RegExp(city),occ_title:new RegExp(job_title),group:"detail"},{a_mean:1,_id:0}).toArray(function(err,result){
			if(err){
				res.send(err);
			}else{
				//console.log(result);
				salary=result[0].a_mean;
				salary=Number(salary.split(',').join(''));
				console.log(salary);
				res.json({Salary:salary});
			}
		})
	}else{
		occup_wage.find({area_title:new RegExp(state),occ_title:new RegExp(job_title),group:"detail"},{a_mean:1,_id:0}).toArray(function(err,result){
			if(err){
				res.send(err);
			}else{
				//console.log(result);
				salary=result[0].a_mean;
				salary=Number(salary.split(',').join(''));
				console.log(salary);
				res.json({Salary:salary});
			}
		})

	}

}



// Server 
var server = app.listen(3000, function(){
    console.log('listening on port ', server.address().port)
})