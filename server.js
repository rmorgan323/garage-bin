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

/// UPDATE ITEM BY ID ///
app.put('/api/v1/items/:items_id', async (request, response) => {
  const { items_id } = request.params;
  const updatedItem = request.body;
  const itemToUpdate = await database('items').where('id', items_id).select();

  if (!itemToUpdate.length) {
    return response.status(422).json({ error: `Item ${items_id} not found` })
  }

  await database('items').where('id', items_id).update(updatedItem)
    .then(() => {
      return response.status(201).send({
        success: `Item ${items_id} updated.`
      })
    })
    .catch(error => {
      return response.status(500).json({ error })
    });
});

/// DELETE ITEM BY ID ///
app.delete('/api/v1/items/:items_id', async (request, response) => {
  const { items_id } = request.params;

  try {
    const deletedItem = await database('items').returning('id').where('id', items_id).delete();

    if (!deletedItem.length) {
      return response.status(422).json({ error: `Item ${items_id} not found.`});
    } else {
      return response.sendStatus(204);
    }
  } catch (error) {
    return response.status(500).json({ error });
  }
});







module.exports = app;