const expect= require('expect');
const request=require('supertest');
const {ObjectId}= require('mongodb')

const {app}= require('./../server');
const {TodoModel}= require('./../model/todo')


var todos=[{
    _id: new ObjectId(),
    text:"First Test Todo"
},{
    _id: new ObjectId(),
    text:"Second Test todo"
}]

beforeEach((done)=>{
    // Todo.remove({}).then(()=>{
    //     done();
    // })
    TodoModel.remove({}).then(()=>{
        return TodoModel.insertMany(todos);
    }).then(()=>done());
})

describe('POST/todos',()=>{
    it('should create a new todo',(done)=>{
        var text= 'Test todo post';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res)=>{
                expect(res.body.text).toBe(text);
            })
            .end((err, res)=>{
                if(err) return done(err);

                TodoModel.find({text}).then((result) => {
                    expect(result.length).toBe(1);
                    expect(result[0].text).toBe(text);
                    done();
                }).catch((err) => {
                    done(e);
                });
            })
            
    })



    it('should not create a new todo',(done)=>{
        var text= 'Test todo post';

        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res)=>{
                if(err) return done(err);

                TodoModel.find().then((result) => {
                    expect(result.length).toBe(2);
                    // expect(result[0].text).toBe(text);
                    done();
                }).catch((err) => {
                    done(e);
                });
            })
            
    })
})


describe('Get /todos',()=>{

    it('should return list of all todos', (done)=>{

        request(app)
            .get('/todos')
            .expect(200)
            .expect((res)=>{
                expect(res.body.length).toBe(2);
            })
            .end(done);
    })
})

describe('Get /todos/:id',()=>{

    it('should return a todo based on id', (done)=>{

        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res)=>{
                expect(res.body.text).toBe(todos[0].text);
            })
            .end(done);
    })

    it('should return a 404 when id not found in DB',(done)=>{
        var testID= new ObjectId();
        request(app)
            .get(`/todos/${testID.toHexString}`)
            .expect(404)
            .end(done);
    })

    it('should return a 404 for non object IDs', (done)=>{

        request(app)
            .get(`/todos/123abc`)
            .expect(404)
            .end(done)
    })
}) 


describe('Delete /todos/:id',()=>{

    it('should delete a todo based on id', (done)=>{

        request(app)
            .delete(`/todos/${todos[1]._id.toHexString()}`)
            .expect(200)
            .expect((res)=>{
                expect(res.body._id).toBe(todos[1]._id.toHexString());
            })
            .end(done);
    })

    it('should return a 404 when id not found in DB',(done)=>{
        var testID= new ObjectId();
        request(app)
            .delete(`/todos/${testID.toHexString}`)
            .expect(404)
            .end(done);
    })

    it('should return a 404 for non object IDs', (done)=>{

        request(app)
            .delete(`/todos/123abc`)
            .expect(404)
            .end(done)
    })
}) 