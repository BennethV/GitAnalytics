var fs = require('fs')
var reset = {
  'accessToken': '',
  'username': '',
  'organisation': '',
  'repository': ''
}
fs.writeFile(__dirname + '\\..\\..\\public\\javascripts\\data.json', JSON.stringify(reset), function (err) {
  if (err) throw err
  console.log(err)
})
module.exports = {
  'Accessing the dashboard': function (client) {

    client
      .url('http://127.0.0.1:3000/charts')
      .waitForElementVisible('.Orow3', 180000)
      .pause(2000)
      .click('#overview')
      .pause(2000)
      .click('#sprints')
      .assert.containsText('body', 'Sprint Overview')
      .pause(2000)
      .click('button[class=dropdown-btn]')
      .pause(2000)
      .click('#pullOverview')
      .assert.containsText('body', 'Pull Request Overview')
      .pause(2000)
      .click('#pullreview')
      .assert.containsText('body', 'Pull Request Reviews')
      .pause(2000)
      .click('#pullPerDev')
      .pause(2000)
      .moveTo('#dashboard')
      .pause(2000)
      .assert.containsText('body', 'Pull Requests Per Developer')
      .click('#commitsPerDev')
      .pause(2000)
      .moveTo('#dashboard')
      .pause(2000)
      .assert.containsText('body', 'Commits Per Developer')
      .pause(2000)
      .click('#overview')
      .assert.containsText('body', 'Repository')
      .click('#reposListDrop')
      .pause(2000)
      .assert.containsText('body', 'Logout')
      .pause(2000)
      .click('#logout')
      .pause(2000)
      .end()
  },
  'Authorisation Page': function (client) {
    client
      .url('http://127.0.0.1:3000')
      .waitForElementVisible('body', 1000)
      .setValue('input[type=text]', 'Client can input data')
      .pause(2000)
      .assert.containsText('body', 'Authorisation')
      .end()
  }
}
