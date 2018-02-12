const express = require('express');
const app = express();
const bodyParser = require('body-parser');  
const path = require('path');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);  

app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());                                              
app.use(bodyParser.urlencoded({ extended: true }));  

app.listen(app.get('port'), () => {
  console.log(`Garage Bin is running on ${app.get('port')}.`);
});

/// GET ALL ITEMS ///
app.get('/api/v1/items', (request, response) => {
  database('items').select()
    .then(items => {
      response.status(200).json(items);
    })
    .catch(error => {
      response.status(500).json({ error })
    });
});

/// ADD ITEM ///
app.post('/api/v1/items', async (request, response) => {
  const initialCleanliness = 1;
  const newItem = Object.assign({}, request.body, {cleanliness: initialCleanliness});

  for (let requiredParameter of ['name', 'reason']) {
    if(!newItem[requiredParameter]) {
      return response.status(422).json({ error: `Missing required parameter - ${requiredParameter}`})
    }
  }

  database('items').returning('id').insert(newItem)
    .then(id => {
      return response.status(201).json(id)
    })
    .catch(error => {
      return response.status(500).json({ error });
    });
});


