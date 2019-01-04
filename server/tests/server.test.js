const expect= require('expect');
const request=require('supertest');

const {app}= require('./../server');
const {TodoModel}= require('./../model/todo')


var todos=[{
    text:"First Test Todo"
},{
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