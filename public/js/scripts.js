$(document).ready(() => {
  displayItems();
})

const getItems = async () => {
  const items = await fetch('/api/v1/items');
  const jsonItems = await items.json();

  return jsonItems;
}

const postItem = async (name, reason) => {
  const newItem = await fetch('/api/v1/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name,
      reason: reason
    })
  })
  const jsonNewItem = await newItem.json();

  return jsonNewItem;
}

const removeItem = async (id) => {
  const response = await fetch(`/api/v1/items/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (response.status === 204) {
    return 'success'
  } else {
    console.log(`error: failed to delete item ${id}`)
  }
}

const updateItem = async (id, body) => {
  const response = await fetch(`/api/v1/items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}

const displayItems = async () => {
  const items = await getItems();

  displayMe(items);
}

const addItem = async () => {
  const name = $('.name-input').val();
  const reason = $('.reason-input').val();
  const cleanliness = displayCleanlinessText(2);
  const cleanlinessValue = 2;
  const id = await postItem(name, reason);

  appendItem(id, name, reason, cleanliness, cleanlinessValue);
  updateItemCount(findCurrentItemCount() + 1)
  updateItemsByCondition();
}

const updateItemsByCondition = () => {
  let typeObject = {rancid: 0, dusty: 0, sparkling: 0};
  [].slice.call($('.item-holder .item-cleanliness')).forEach(item => {
    if ($(item).attr('data-value') === "1") {
      typeObject.rancid += 1;
    } else if ($(item).attr('data-value') === "2") {
      typeObject.dusty += 1;
    } else {
      typeObject.sparkling += 1;
    }
  })
  updateTypesInDom(typeObject);
}

const updateTypesInDom = (obj) => {
  $('.rancid-item-count').text(obj.rancid);
  $('.dusty-item-count').text(obj.dusty);
  $('.sparkling-item-count').text(obj.sparkling);
}

const displayCleanlinessText = (val) => {
  const cleanlinessArray = [null, 'Rancid', 'Dusty', 'Sparkling']
  return cleanlinessArray[val]
}

const updateItemCount = (num) => {
  $('.items').attr('data-items', num)
  $('.item-count').text(num)
} 

const findCurrentItemCount = () => {
  return parseInt($('.items').attr('data-items'));
}

const compareDescending = (a,b) => {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}

const compareAscending = (a,b) => {
  if (b.name < a.name)
    return -1;
  if (b.name > a.name)
    return 1;
  return 0;
}

const displayMe = (itemsArray, sort = 'descending') => {
  updateItemCount(itemsArray.length);

  if (sort === 'descending') {
    itemsArray = itemsArray.sort(compareDescending);
  } else {
    itemsArray = itemsArray.sort(compareAscending);
  }

  itemsArray.forEach(item => {
    const itemId = item.id;
    const itemName = item.name;
    const itemReason = item.reason;
    const itemCleanliness = displayCleanlinessText(item.cleanliness);
    const itemCleanlinessValue = item.cleanliness;

    appendItem(itemId, itemName, itemReason, itemCleanliness, itemCleanlinessValue);
  })
  updateItemsByCondition();
}

const appendItem = (itemId, itemName, itemReason, itemCleanliness, itemCleanlinessValue) => {
  $('.items').append(`
    <div class="item-holder" data-id="${itemId}">
      <h3 class="item-name">${itemName}</h3>
      <div class="item-body-holder garage-display-none">
        <p class="item-reason">${itemReason}</p>
        <h4 class="item-cleanliness" data-value="${itemCleanlinessValue}">Cleanliness: <span class="left-arrow">&#8678;</span>${itemCleanliness}<span class="right-arrow">&#8680;</span></h4>
        <button class="delete-item-button">DELETE</button>
      </div>
    </div>
  `)
}

const updateBodyBuilder = (name, reason, cleanlinessValue) => {
  let body = {};

  name ? body.name = name : null;
  reason ? body.reason = reason : null;
  cleanlinessValue ? body.cleanliness = cleanlinessValue : null;

  return body;
}

async function deleteItem() {
  const id = $(this).closest('.item-holder').attr('data-id');
  const response = await removeItem(id);

  if (response === 'success') {
    $(this).closest('.item-holder').remove();
    updateItemCount(findCurrentItemCount() - 1)
  }
}

async function updateCleanliness() {
  const id = $(this).closest('.item-holder').attr('data-id');
  const currentCleanliness = parseInt($(this).closest('.item-cleanliness').attr('data-value'));
  let direction;
  $(this).attr('class') === 'left-arrow' ? direction = 'down' : direction = 'up';

  let newCleanliness;
  if (currentCleanliness > 1 && direction === 'down') {
    newCleanliness = currentCleanliness - 1;
  } else if (currentCleanliness < 3 && direction === 'up') {
    newCleanliness = currentCleanliness + 1;
  } else {
    newCleanliness = currentCleanliness;
  }

  if (currentCleanliness !== newCleanliness) {
    updateItem(id, updateBodyBuilder(null, null, newCleanliness))
    
    $(this).closest('.item-cleanliness').replaceWith(`<h4 class="item-cleanliness" data-value="${newCleanliness}">Cleanliness: <span class="left-arrow">&#8678;</span>${displayCleanlinessText(newCleanliness)}<span class="right-arrow">&#8680;</span></h4>`)
  }
  updateItemsByCondition();
}

const toggleGarage = () => {
  $('.items').toggleClass('garage-display-none')
}

function toggleItemBody() {
  $(this).siblings('.item-body-holder').toggleClass('garage-display-none')
}

const sortAscending = async () => {
  const items = await getItems();
  $('.item-holder').remove();


  displayMe(items, 'ascending')
}

const sortDescending = async () => {
  const items = await getItems();
  $('.item-holder').remove();

  displayMe(items, 'descending')
}

///  EVENT LISTENERS  ///

$('.submit-item-button').on('click', function(event) {
  event.preventDefault();
  addItem();
});
$('.items').on('click', '.delete-item-button', deleteItem)
$('.items').on('click', '.left-arrow', updateCleanliness)
$('.items').on('click', '.right-arrow', updateCleanliness)
$('.toggle-garage-button').on('click', toggleGarage)
$('.items').on('click', '.item-name', toggleItemBody)
$('.sort-ascending').on('click', sortAscending)
$('.sort-descending').on('click', sortDescending)

















