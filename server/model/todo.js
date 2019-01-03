const mongoose= require('mongoose');



var todoSchema= new mongoose.Schema({
    text:{
        type:String,
        required:true,
        minlength:1,
        trim:true
    },
    completed:{
        type:Boolean,
        default:true
    },
    completedAt:{
        type:Number,
        default:null

    }

})



//Defining models out of Schemas
var TodoModel= mongoose.model('TodoModel', todoSchema);

module.exports={
    TodoModel
}
