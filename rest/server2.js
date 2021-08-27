,{area_rent_br0:1, area_rent_br1:1,area_rent_br2:1,area_rent_br3:1,area_rent_br4:1,



	SAFMR.find({cbnsmcnm:city_state}).toArray(function(err,result){
			if(err){
				res.send(err);
			}else{
				rents=result[0];
				console.log(result);
				res.json(rents);
			}
		})
}