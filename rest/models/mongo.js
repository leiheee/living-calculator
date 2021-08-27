var mongoose    =   require("mongoose");
mongoose.connect('mongodb://localhost/test');
// create instance of Schema

// create schema
var testSchema  = {
    "statename" : String
   };
// create model if not exists.
states = mongoose.model('statenames',testSchema);

module.exports=states;