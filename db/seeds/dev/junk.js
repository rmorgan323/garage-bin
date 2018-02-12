const seedJunk = [
  {
    name: "Baseball Cards",
    reason: "I'm holding on to my youth.",
    cleanliness: 2
  },
  {
    name: "NES",
    reason: "It's still pretty cool.",
    cleanliness: 1
  },
  {
    name: "College Textbooks",
    reason: "They were expensive.",
    cleanliness: 3
  }
]

exports.seed = function(knex, Promise) {
  return knex('items').del()
    .then(() => {
      return Promise.all([
        knex('items').insert(seedJunk)
        .then(() => console.log('Seeding junk complete!'))
        .catch(error => console.log(`Error seeding data: ${error}`))
      ])
    })
    .catch(error => console.log(`Error seeding data: ${error}`));
};