var pullCommits = []
var pullReqInfor = []
var commits = []
var reviews = []
var summary = []
var pullReview = []
var userInfo = {};

(async function () {
  await fetch('http://127.0.0.1:3000/javascripts/data.json')
    .then((res) => res.text())
    .then(async function (data) {
      userInfo = JSON.parse(data)
      // console.log(userInfo)
      try {
        // User's details
        var res = await fetch(`https://api.github.com/user?access_token=${userInfo.accessToken}`)

        const userName = await res.json()
        userInfo.username = userName.login
        // console.log(userInfo.username)

        // repository pulls
        var res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/pulls?state=closed&access_token=${userInfo.accessToken}`)

        const closedPulls = await res.json()

        // loop through closed pull requests
        // console.log('closed pull number:' + (closedPulls).length)
        for (var i = 0; i < (closedPulls).length; i++) {
          // commits per pull request
          var res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/pulls/${closedPulls[i].number}/commits?&access_token=${userInfo.accessToken}`)
          commits[i] = await res.json()
          res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/pulls/${closedPulls[i].number}/reviews?state=all&access_token=${userInfo.accessToken}`)
          reviews[i] = await res.json()

          summary[i] = {
            'Pull Request': closedPulls[i].number,
            'User': closedPulls[i].user.login,
            'Merge Date': closedPulls[i].merged_at,
            'Message': closedPulls[i].body
          }

          // an array of arrays of commits per pull request
          pullCommits[i] = []
          for (var j = 0; j < (commits[i]).length; ++j) {
            //  console.log( ((commits[i])[j]).commit.message)
            (pullCommits[i])[j] = {
              'Date': ((commits[i])[j]).commit.committer.date,
              'Message': ((commits[i])[j]).commit.message
            }
          }
          // if the code was reviewed
          if ((reviews[i]).length != 0) {
            for (var k = 0; k < (reviews[i]).length; ++k) {
            //  console.log((reviews[i])[k].user.login)
            }
          } else {
            // if not reviewed
          }
          /*
            // pull request object
            pullReview[i]={
              "Pull Request": closedPulls[i].number,
              "Reviewer": ((reviews[i])[0]).user.login,
              "Reviewee": closedPulls[i].user.login,
              "Date": ((reviews[i])[0]).submitted_at,
              "Status": ((reviews[i])[0]).state,
              "Review Message": ((reviews[i])[0]).body
            }
            */
        }
        // console.log('Done fetching all the information')
        // console.log(reviews)
      }
      // console.log(summary)
      // console.log(pullReview)

      catch (err) { console.log(err) }
    })
  return false
})()

// href functions
$(document).ready(function () {
  $('#overview').click(function () {
    console.log('It works!!')
    return false
  })
  $('#sprints').click(function () {
  // handlebar code
    var quoteInfo = document.getElementById('quote-template').innerHTML

    var template = Handlebars.compile(quoteInfo)
    // 2b. Passing the array data
    var quoteData = template({
      name: 'Sprints',
      quotes: [
        {quote: "If you don't know where you are going, you might wind up someplace else."},
        {quote: "You better cut the pizza in four pieces because I'm not hungry enough to eat six."},
        {quote: 'I never said most of the things I said.'},
        {quote: "Nobody goes there anymore because it's too crowded."}
      ]
    })
    // end of handlebar code
    document.getElementById('quoteData').innerHTML = quoteData
    return false
  })

  $('#pullOverview').click(async function () {
    var tableInfor = document.getElementById('table_heading_template').innerHTML
    var template = Handlebars.compile(tableInfor)
    var info = template({
      title: 'Pull Request Overview'
    })
    document.getElementById('theading').innerHTML = info
    await genSummaryTable(summary)
    return false
  })
  $('#pullreview').click(async function () {
    var tableInfor = document.getElementById('table_heading_template').innerHTML
    var template = Handlebars.compile(tableInfor)
    var info = template({
      title: 'Pull Request Reviews'
    })
    document.getElementById('theading').innerHTML = info
    await genReviewTable(pullReview)

    return false
  })
  $('#pullCommits').click(async function () {
    await genPullCommitsTable(pullCommits)
    return false
  })
})

function genSummaryTable (data) {
  function tabulate (data, columns) {
    d3.select('table').remove()
    var table = d3.select('#summary').append('table')
    var thead = table.append('thead')
    var tbody = table.append('tbody')

    // append the header row
    thead.append('tr')
      .selectAll('th')
      .data(columns).enter()
      .append('th')
      .text(function (column) { return column })

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
      .data(data)
      .enter()
      .append('tr')

    // create a cell in each row for each column
    var cells = rows.selectAll('td')
      .data(function (row) {
        return columns.map(function (column) {
          return {column: column, value: row[column]}
        })
      })
      .enter()
      .append('td')
      .text(function (d) { return d.value })

    return table
  }

  // render the tables
  tabulate(data, ['Pull Request', 'User', 'Merge Date', 'Message']) // 2 column table
}

function genReviewTable (data) {
  function tabulate (data, columns) {
    d3.select('table').remove()
    var table = d3.select('#summary').append('table')
    var thead = table.append('thead')
    var tbody = table.append('tbody')

    // append the header row
    thead.append('tr')
      .selectAll('th')
      .data(columns).enter()
      .append('th')
      .text(function (column) { return column })

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
      .data(data)
      .enter()
      .append('tr')

    // create a cell in each row for each column
    var cells = rows.selectAll('td')
      .data(function (row) {
        return columns.map(function (column) {
          return {column: column, value: row[column]}
        })
      })
      .enter()
      .append('td')
      .text(function (d) { return d.value })

    return table
  }

  // render the tables
  tabulate(data, ['Pull Request', 'Reviewer', 'Reviewee', 'Date', 'Status', 'Review Message'])
}
function genPullCommitsTable (stats) {
  d3.select('table').remove()
  for (var i = 0; i < stats.length; ++i) {
    var data = stats[i]

    function tabulate (data, columns) {
      var table = d3.select('#summary').append('table')
      var thead = table.append('thead')
      var tbody = table.append('tbody')

      // append the header row
      thead.append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .text(function (column) { return column })

      // create a row for each object in the data
      var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr')

      // create a cell in each row for each column
      var cells = rows.selectAll('td')
        .data(function (row) {
          return columns.map(function (column) {
            return {column: column, value: row[column]}
          })
        })
        .enter()
        .append('td')
        .text(function (d) { return d.value })

      return table
    }

    // render the tables
    tabulate(data, ['Date', 'Message'])
  }
}
