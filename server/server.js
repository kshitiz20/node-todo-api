var express=require('express');
var bodyParser= require('body-parser');

var {mongoose}= require('./db/mongoose.js');
var {TodoModel}= require('./model/todo');
var {UserModel}= require('./model/user');
var {ObjectID}= require('mongodb');

const port= process.env.PORT||3000;

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

app.get('/todos/:id',(req, res)=>{
    var id= req.params.id;

    TodoModel.findById(id).then((todos)=>{
        if(todos===null){
            res.status(404).send("Id not found")
            return console.log('Id not found in DB');
        }

        res.send(todos);
        console.log(todos);
    }).catch(e=>{
        res.status(404).send(e);
        console.log('Invalid Id', e);
    })
})

app.delete('/todos/:id',(req, res)=>{
    var id= req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send('Invalid Id format');
    }

    TodoModel.findOneAndDelete({_id:id}).then((todos)=>{

       if(todos==null){
           return res.status(404).send("No such item");
       }
        console.log("Item removed successfully", todos);
        return res.send(todos);
    }).catch(e=>{
        res.status(404).send(e);
    })
})



module.exports={app};




app.listen(3000,()=>{
    console.log('Sun raha hai na tu, Ro raha hu me at port 3000');
})





