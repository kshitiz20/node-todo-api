require('./config/config')

var express=require('express');
var bodyParser= require('body-parser');
var _= require('lodash')
var {mongoose}= require('./db/mongoose.js');
var {TodoModel}= require('./model/todo');
var {UserModel}= require('./model/user');
var {ObjectID}= require('mongodb');
var {authenticate}= require('./middleware/authenticate.js')
const port= process.env.PORT;

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

app.put('/todos/:id',(req, res)=>{

    var id= req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send('Invalid Id format');
    }

    var body= _.pick(req.body,["text","completed"]);

    if(_.isBoolean(req.body.completed)&& req.body.completed==true){
        body.completedAt= new Date().getTime();
    }
    else{
        body.completed=false;
        body.completedAt=null;
    }

    TodoModel.findByIdAndUpdate(id,{$set:body},{new:true}).then((todo)=>{
        if(!todo){
            return res.status(404).send("No such item");
        }
        console.log("Item updated successfully", todo);
        return res.send(todo);
    }).catch(e=>{
        res.status(404).send(e)
    })

})

//**************************USER Requests*********************** */

app.post('/users',(req, res)=>{
    var body= _.pick(req.body,["email","password"]);
    var newUser= new UserModel(body);
    console.log(newUser)
    newUser.save().then(()=>{
            
        console.log('New User Registered', newUser);
       return newUser.generateAuthToken();

    }).then((token)=>{
        res.header("x-auth", token).send(newUser);
    }).catch((err)=>{
        console.log('There is some error', err);
        res.status(400).send(err);
    })

})


app.post('/users/login', (req, res)=>{
    var body= _.pick(req.body,["email","password"]);

    UserModel.findByCredentials(body.email, body.password).then(user=>{
        //res.send(user)
        return user.generateAuthToken().then(token=>{
            res.header("x-auth", token).send(user);
        })
    }).catch((e)=>{
        res.status(400).send(e);
    })
})



app.get('/users/me',authenticate,(req, res)=>{
   res.send(req.user);
})

app.delete('/users/me/token',authenticate,(req,res)=>{
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send();
    },()=>{
        res.status(400).send();
    })
})



module.exports={app};




app.listen(port,()=>{
    console.log(`Sun raha hai na tu, Ro raha hu me at port ${port}`);
})





