var express=require('express');
var bodyParser= require('body-parser');

var {mongoose}= require('./db/mongoose.js');
var {TodoModel}= require('./model/todo');
var {UserModel}= require('./model/user');



const app= express();

app.use(bodyParser.json());

app.post('/todos',(req, res)=>{
    var newTodo= new TodoModel(req.body);
    newTodo.save().then((result) => {
        console.log("New Todo Successfully save");
        res.send(result)
    }).catch((err) => {
        console.log(err);
        res.status(400).send(err);
    });
})


app.get('/todos',(req, res)=>{
    TodoModel.find({}).then((todos)=>{
        console.log(todos);
        res.send(todos);
    }).catch(err=>{
        res.status(400).send(err);
        console.log(err);
    })
})



module.exports={app};




app.listen(3000,()=>{
    console.log('Sun raha hai na tu, Ro raha hu me at port 3000');
})





