process.env.NODE_ENV = 'test';

const chai = require('chai');
// eslint-disable-next-line no-unused-vars
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');
const configuration = require('../knexfile')['test'];
const knex = require('knex')(configuration);

chai.use(chaiHttp);

describe('Client Routes', () => {
  it('should return the homepage', () => {
    return chai.request(server)
    .get('/')
    .then(response => {
      response.should.have.status(200);
      response.should.be.html;
    })
    .catch(error => {
      throw error;
    });
  });
});

describe('API Routes', () => {
  beforeEach((done) => {
    knex.seed.run()
    .then(() => {
      done();
    });
  });

  it('should get all items', () => {
    return chai.request(server)
    .get('/api/v1/items')
    .then(response => {
      response.should.have.status(200);
      response.should.be.json;
      response.body.should.be.a('array');
      response.body.length.should.equal(3);
      response.body[0].should.have.property('id');
      response.body[0].should.have.property('name');
      response.body[0].should.have.property('reason');
      response.body[0].should.have.property('cleanliness');
    });
  });

  it('should add an item', () => {
    return chai.request(server)
    .post('/api/v1/items')
    .send({
      name: 'Old lamp',
      reason: 'Who knows?'
    })
    .then(response => {
      response.should.have.status(201);
      response.should.be.json;
    });
  });

  it('should return a 422 error if params are missing when adding item', () => {
    return chai.request(server)
    .post('/api/v1/items')
    .send({
      name: 'Old lamp'
    })
    .then(response => {
      response.should.have.status(422);
      response.should.be.json;
      response.body.error.should.equal(`Missing required parameter - ${'reason'}`);
    });
  });

  it('should update an item', () => {
    let id;

    return chai.request(server)
    .get('/api/v1/items')
    .then(response => {
      id = response.body[0].id;
    })
    .then(() => {
      return chai.request(server)
      .put(`/api/v1/items/${id}`)
      .send({
        name: 'Here is my new name!'
      })
      .then(response => {
        response.should.have.status(201);
        response.should.be.json;
        response.body.success.should.equal(`Item ${id} updated.`);
      });
    });
  });

  it('should return a 422 error if item to update does not exist', () => {
    return chai.request(server)
    .put('/api/v1/items/0')
    .send({
      name: 'Here is my new name!'
    })
    .then(response => {
      response.should.have.status(422);
      response.should.be.json;
      response.body.error.should.equal('Item 0 not found');
    });
  });

  it('should delete an item', () => {
    let id;

    return chai.request(server)
    .get('/api/v1/items')
    .then(response => {
      id = response.body[0].id;
    })
    .then(() => {
      return chai.request(server)
      .delete(`/api/v1/items/${id}`)
      .then(response => {
        response.should.have.status(204);
      });
    });
  });

  it('should return a 422 error if item to delete does not exist', () => {
    return chai.request(server)
    .delete('/api/v1/items/0')
    .catch(response => {
      response.should.have.status(422);
      response.should.be.json;
      response.body.error.should.equal('Item 0 not found.');
    });
  });

});
