var mongojs=require('mongojs');
var db=mongojs('mydb',['SAFMR']);



function GetHousing(req,res)
{
	//var rent=0;
	var zip=Number(req.query.zipcode);
	
// Get the Housing 
	db.SAFMR.find({zipcode:zip},{area_rent_br0:1,_id:0}).toArray(function(err,result){
			if(err){
				res.send(err);
			}else{
				rent=result[0].area_rent_br0;
				console.log('housing:'+rent);
				res.json('rent for 0 bedroom:'+rent);
			}
		})
}

module.exports=GetHousing;