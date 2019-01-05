var mongoose= require('mongoose');

mongoose.Promise= global.Promise;

//mongodb://localhost:27017/TodoApp
//mongodb://kshitiz:Kshitiz20@ds027348.mlab.com:27348/node-todo-api
mongoose.connect(process.env.MONGODB_URI);

module.exports={
    mongoose
}