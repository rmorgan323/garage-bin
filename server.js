const express = require('express');
const app = express();
const bodyParser = require('body-parser');  
const path = require('path');
const environment = process.env.NODE_ENV || 'development';                      //  Determines the environment to be used and sets initial value to development
const configuration = require('./knexfile')[environment];                       //  Pulls in the knexfile and passes in correct environment
const database = require('knex')(configuration);  

app.set('port', process.env.PORT || 3000);                                      //  Sets port initially to 3000 but allows it to be changed if in a production environment
app.use(express.static(path.join(__dirname, 'public')));                        //  Tells the app where to find static files
app.use(bodyParser.json());                                                     //  Tells the app to use body-parser for json
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
  
})
