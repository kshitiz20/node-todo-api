const {ObjectId}= require('mongodb')
const {TodoModel}= require('./../../model/todo');
const {UserModel}= require('./../../model/user');
const jwt= require('jsonwebtoken');


var userOneId= new ObjectId();
var userTwoId= new ObjectId();
var todos=[{
    _id: new ObjectId(),
    text:"First Test Todo",
    _creator:userOneId
},{
    _id: new ObjectId(),
    text:"Second Test todo",
    completed:true,
    completedAt:333,
    _creator:userTwoId
}]



var users=[{
    _id: userOneId,
    email:"Kshitiz@example.com",
    password:"useOnePass",
    "tokens":[{
        access:'auth',
        token: jwt.sign({id:userOneId,access:'auth'},'abc123').toString()
    }]
},{
    _id:userTwoId,
    email:"user2@example.com",
    password:"userTwoPass",
    "tokens":[{
        access:'auth',
        token: jwt.sign({id:userTwoId,access:'auth'},'abc123').toString()
    }]
}]


var populateTodos=(done)=>{
    // Todo.remove({}).then(()=>{
    //     done();
    // })
    TodoModel.remove({}).then(()=>{
        return TodoModel.insertMany(todos);
    }).then(()=>done());
}

var populateUsers= (done)=>{

    UserModel.remove({}).then(()=>{
        var user1= new UserModel(users[0]).save();
        var user2= new UserModel(users[1]).save();

    return Promise.all([user1,user2]);
    }).then(()=>done());
    
}

module.exports={
    todos, populateTodos, users,populateUsers
}