const expect= require('expect');
const request=require('supertest');
const {ObjectId}= require('mongodb')

const {app}= require('./../server');
const {TodoModel}= require('./../model/todo')
const {UserModel}= require('./../model/user')
const {todos, populateTodos, users, populateUsers}= require('./seed/seed.js')


beforeEach(populateUsers);
beforeEach(populateTodos);

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

describe('PUT /todos/:id', ()=>{

    it('should update the value in db',(done)=>{
        var textTOBeUpdated= "Updated test text";
        request(app)
        .put(`/todos/${todos[0]._id.toHexString()}`)
        .send({
            text:textTOBeUpdated,
            completed:true
        })
        .expect(200)
        .expect((res)=>{
            expect(res.body.text).toBe(textTOBeUpdated);
            expect(res.body.completed).toBe(true);
            expect(typeof res.body.completedAt).toBe('number');
        }).end(done);

    })

    it('should clear completedAt if completed is false', (done)=>{
        
        request(app)
            .put(`/todos/${todos[1]._id.toHexString()}`)
            .send({
                completed:false
            })
            .expect(200)
            .expect((res)=>{
                expect(res.body.completed).toBe(false);
                expect(res.body.completedAt).toBe(null)
                
            }).end(done)
    })

})

describe('Get :/users/me',()=>{
    it('should return a user if authenticated',(done)=>{
        console.log("#################################################",users[0].tokens[0].token)
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body._id).toBe(users[0]._id.toHexString());
            }).end(done);

    })

    it('should return 401 if not authenticated',(done)=>{

        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res)=>{
                expect(res.body).toEqual({});
            }).end(done);

    })
})

describe('Post /users',()=>{
    it('should return a user and x-auth token for valid email and password',(done)=>{
        var email= "test@example.com";
        var password="abcd@123";
        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect(res=>{
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toEqual(email);

            }).end(done);
        
    })

    it('should return a validation error when email and password are not valid',(done)=>{
        request(app)
            .post('/users')
            .send({email:'abc', password:"123"})
            .expect(400)
            .end(done);
    })

    it('should return a 400 when email is already in use',(done)=>{
        request(app)
            .post('/users')
            .send({email:users[0].email, password:"Password@123"})
            .expect(400)
            .end(done);
            
    })

})

describe('Post /users/login',()=>{
    it('should return a user when a valid login credentials are passed',(done)=>{
        request(app)
            .post('/users/login')
            .send({email:users[0].email, password:users[0].password})
            .expect(200)
            .expect((res)=>{
                expect(res.body.email).toEqual(users[0].email)
                expect(res.headers['x-auth']).toBeTruthy();
            }).end(done);
    })

    it('should return a 400 bad request when invalid credentials', (done)=>{
        request(app)
            .post('/users/login')
            .send({email:"absbbsb@example.com",password:"abc123!2"})
            .expect(400)
            .end(done);
    })
})

describe('Delete /users/me/token',()=>{
    it('should remove the auth token on logout',(done)=>{

        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, res)=>{
                if(err){
                    done(err);
                }

                UserModel.findById(users[0]._id).then(user=>{
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(e=>{
                    done(err);
                })

            })
    })
})