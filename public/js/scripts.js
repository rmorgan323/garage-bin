$(document).ready(() => {
  displayItems();
})

const getItems = async () => {
  const items = await fetch('/api/v1/items');
  const jsonItems = await items.json();

  return jsonItems;
}

const displayItems = async () => {
  const items = await getItems();

  displayMe(items);
}

const addItem = async () => {
  const name = $('.name-input').val();
  const reason = $('.reason-input').val();
  const cleanliness = displayCleanlinessText(1);
  const id = await postItem(name, reason);

  appendItem(id, name, reason, cleanliness);
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





const displayCleanlinessText = (val) => {
  const cleanlinessArray = ['Sparkling', 'Dusty', 'Rancid']
  return cleanlinessArray[val]
}

const displayMe = (itemsArray) => {
  itemsArray.forEach(item => {
    const itemId = item.id;
    const itemName = item.name;
    const itemReason = item.reason;
    const itemCleanliness = displayCleanlinessText(item.cleanliness)

    appendItem(itemId, itemName, itemReason, itemCleanliness);
  })
}

const appendItem = (itemId, itemName, itemReason, itemCleanliness) => {
  $('.items').append(`
    <div class="item-holder" data-id="${itemId}">
      <h4 class="item-name">${itemName}</h4>
      <p class="item-reason">${itemReason}</p>
      <h5 class="item-cleanliness">${itemCleanliness}</h5>
      <button class="delete-item-button">DELETE</button>
    </div>
  `)
}

$('.submit-item-button').on('click', function(event) {
  event.preventDefault();
  addItem();
});















