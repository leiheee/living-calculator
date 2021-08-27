var mongoose=require('mongoose');

var genreSchema=mongoose.Schema({
	name:{
		type:String,
		require: true
	},
	create_date:{
		type:String,
		default: Date.now
	}
});

var Genre=module.exports=
	mongoose.model('Genre',genreSchema);

module.exports.getGenres=function(callback,limit){
	Genre.find(callback).limit(limit);
}