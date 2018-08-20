var pullCommits = []
var commits = []
var reviews = []
var summary = []
var pullRequestNo = []
var pullReview = []
var contributorClosedPullReq = []
var contributorMergedPullReq = []
var releases = []
var closedPulls = []
var devReleases = []
var closedDevReleases = []
var contributors = []
var repos = []
var repoList = []
var totalHealthyBuilds = 0
var branches = []
var totalCommits = 0
var statusOnMaster = ''
var userInfo = {};

(async function () {
  var rep = await urlParam('repository')
  console.log(urlParam('repository'))
  await fetch('http://127.0.0.1:3000/javascripts/data.json')
    .then((res) => res.text())
    .then(async function (data) {
      userInfo = await JSON.parse(data)
      if (rep) {
        userInfo.repository = rep

        console.log('New Repo: ' + rep)
      }
      console.log(userInfo)
      try {
        var count = 0
        // User's details
        var res = await fetch(`https://api.github.com/user?access_token=${userInfo.accessToken}`)
        const userName = await res.json()
        userInfo.username = userName.login
        // fetches repo list from selected organisation
        res = await fetch(`https://api.github.com/orgs/${userInfo.organisation}/repos?&access_token=${userInfo.accessToken}`)
        repos = await res.json()
        // repository pulls
        res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/pulls?state=closed&access_token=${userInfo.accessToken}`)

        closedPulls = await res.json()
        res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/contributors?access_token=${userInfo.accessToken}`)
        contributors = await res.json()
        // fetch release information
        res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/releases?access_token=${userInfo.accessToken}`)
        releases = getReleaseDateForPie(await res.json())
        // Fetch all the commits of the repo
        res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/commits?per_page=250&access_token=${userInfo.accessToken}`)
        commits = await res.json()
        totalCommits = commits.length

        // fectch branch information
        res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/branches?access_token=${userInfo.accessToken}`)
        branches = await res.json()
        for (let p = 0; p < branches.length; p++) {
          var statusData = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/statuses/${branches[p].commit.sha}?access_token=${userInfo.accessToken}`);
          (branches[p])['statusData'] = await statusData.json()
          var commitData = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/commits?per_page=200&sha=${branches[p].commit.sha}&access_token=${userInfo.accessToken}`);
          (branches[p])['commitData'] = await commitData.json()
        }
        // populate repo list with all the repo names
        for (let i = 0; i < repos.length; i++) {
          repoList.push({
            'repo': (repos[i]).name
          })
        }
        console.log('Started fetching all the information')
        // populate the object that stores the information per developer
        for (var d = contributors.length - 1; d >= 0; d--) {
          contributorClosedPullReq[d] = {
            'name': contributors[d].login,
            'pulls': 0
          }
          contributorMergedPullReq[d] = {
            'name': contributors[d].login,
            'pulls': 0
          }
        }
        // loop through closed pull requests
        // fetches the all the commits per pull request and the reviews
        // This will invert the data
        count = 0
        for (var z = (closedPulls).length - 1; z >= 0; z--) {
          res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/pulls/${closedPulls[z].number}/reviews?state=all&access_token=${userInfo.accessToken}`)
          reviews[count] = await res.json()
          count++
        }
        // This will invert the data
        count = 0
        for (var i = (closedPulls).length - 1; i >= 0; i--) {
          // pull request number
          pullRequestNo[count] = {
            'number': closedPulls[i].number,
            'by': closedPulls[i].user.login
          }

          // pull request per developer

          for (var n = contributorClosedPullReq.length - 1; n >= 0; n--) {
            if (contributorClosedPullReq[n].name == closedPulls[i].user.login) {
              contributorClosedPullReq[n].pulls++
            }
          }
          // populates the merged pull request object called 'summary'
          var mergeDate = 0
          if ((closedPulls[i].merged_at !== null) && (closedPulls[i].base.ref === 'master')) {
            mergeDate = closedPulls[i].merged_at
            summary.push({
              'Pull_Request': closedPulls[i].number,
              'User': closedPulls[i].user.login,
              'Merge_Date': mergeDate,
              'Message': closedPulls[i].body,
              'Total_Commits': 0,
              'Branch': closedPulls[i].head.ref,
              'additions': '',
              'normal_Delitions': '',
              'node_Additions': '',
              'node_Deletions': ''
            })
          }
          count++
        } // closedPulls loop ends here
        // This will invert the data
        count = 0
        // populating pull request review objects
        for (var q = reviews.length - 1; q >= 0; q--) {
          // if the code was reviewed
          if (typeof (reviews[q]).length !== 'undefined' && (reviews[q]).length > 0) {
            for (var k = 0; k < (reviews[q]).length; ++k) {
              pullReview[count] = {
                'Pull Request': closedPulls[q].number,
                'Reviewer': ((reviews[q])[k]).user.login,
                'Reviewee': closedPulls[q].user.login,
                'Date': ((reviews[q])[k]).submitted_at,
                'Status': ((reviews[q])[k]).state,
                'Review Message': ((reviews[q])[k]).body
              }

              count++
            }
          } else {
            // if not reviewed
          }
        }
        // populate the object f  1qor contributor merged pulls
        for (var n = contributorMergedPullReq.length - 1; n >= 0; n--) {
          for (let x = 0; x < summary.length; x++) {
            if (contributorMergedPullReq[n].name == summary[x].User) {
              contributorMergedPullReq[n].pulls++
            }
          }
        }
        // an array of arrays of commits per pull request
        for (var j = 0; j < commits.length; ++j) {
          pullCommits.push({
            'Pull Request': j + 1,
            'Total Commits': (commits[j]).length

          })
        }
        // find out the state of each merge pull request, this loop must only be called if there were shoert lived branches
        for (let h = 0; h < summary.length; h++) {
          for (let r = 0; r < branches.length; r++) {
            if (((summary[h]).Branch === (branches[r]).name) && (((branches[r]).statusData).length !== 0)) {
              if (((branches[r]).statusData[0]).state === 'success') {
                (summary[h])['State'] = ((branches[r]).statusData[0]).state
                totalHealthyBuilds++
              } else if (((branches[r]).statusData[0]).state !== 'success') {
                (summary[h])['State'] = ((branches[r]).statusData[0]).state
              }
            } else if (((summary[h]).Branch === (branches[r]).name) && (((branches[r]).statusData).length === 0)) {
              (summary[h])['State'] = 'NOT_CONF'
            }
          }
        }
        // checks the total commits of the branches
        for (let h = 0; h < summary.length; h++) {
          for (let r = 0; r < branches.length; r++) {
            if (((summary[h]).Branch === (branches[r]).name)) {
              (summary[h]).Total_Commits = (branches[r]).commitData.length
            } else {
            }
          }
        }

        // generate release id and developer pull request per release
        mergedPullPerDev()
        // this function plots the bar graphs under sprints
        pullDetails()
        console.log('Done fetching all the information')
      } catch (err) { console.log(err) }
    })
  return false
})()

function urlParam (name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)')
    .exec(window.location.search)

  return (results !== null) ? results[1] || 0 : false
}

// href functions
$(document).ready(function () {
  $('#quoteData').on('click', 'a', function () {
    console.log($(this).text())
    userInfo.repository = $(this).text()
    window.location.href = `/charts?repository=${userInfo.repository}`
    return false
  })
  $('#overview').click(function () {
    document.getElementById('cards').innerHTML = null

    document.getElementById('3cards').innerHTML = null

    console.log(repoList)
    var quoteInfo = document.getElementById('quote-template').innerHTML

    var template = Handlebars.compile(quoteInfo)
    // 2b. Passing the array data
    var quoteData = template({
      repos: repoList
    })
    // end of handlebar code
    document.getElementById('quoteData').innerHTML = quoteData

    var overViewInfo = document.getElementById('overviewLayout-template').innerHTML
    var template = Handlebars.compile(overViewInfo)
    var sprintNumber = releaseInfo.actualreleaseDates.length - 1
    var overviewData = template({
      title: 'welcome setlaela',
      NumberOfSprint: sprintNumber
    })
    document.getElementById('frontOverview').innerHTML = overviewData
    plotBar(contributionsPerSprint, getNames())
    return false
  })
  $('#sprintsss').click(function () {
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
    document.getElementById('frontOverview').innerHTML = null
    document.getElementById('3cards').innerHTML = null
    document.getElementById('theading').innerHTML = info
    // update the information cards
    var cardInfor = document.getElementById('cards_template').innerHTML
    template = Handlebars.compile(cardInfor)
    var infoCards = template({
      card1: 'Closed Pulls:',
      text1: closedPulls.length,
      card2: 'Merged Pulls:',
      text2: summary.length,
      card3: 'Total Commits:',
      text3: totalCommits,
      card4: 'Healthy Builds',
      text4: totalHealthyBuilds + '/' + summary.length
    })
    document.getElementById('frontOverview').innerHTML = null
    document.getElementById('3cards').innerHTML = null
    document.getElementById('cards').innerHTML = infoCards
    await genSummaryTable(summary)
    return false
  })
  $('#pullreview').click(async function () {
    var tableInfor = document.getElementById('table_heading_template').innerHTML
    var template = Handlebars.compile(tableInfor)
    var info = template({
      title: 'Pull Request Reviews'
    })
    // document.getElementById('pullReqNo').innerHTML =null;
    document.getElementById('theading').innerHTML = info
    var cardInfor = document.getElementById('3cards_template').innerHTML
    template = Handlebars.compile(cardInfor)
    var infoCards = template({
      card1: 'Closed Pulls Analytics',
      card2: 'Closed Pulls Analytics',
      card3: 'Closed Pulls Analytics',
      card4: 'Closed Pulls Analytics'
    })
    document.getElementById('frontOverview').innerHTML = null
    document.getElementById('cards').innerHTML = null
    document.getElementById('3cards').innerHTML = infoCards
    console.log(pullReview)
    await genReviewTable(pullReview)

    return false
  })
  $('#pullCommits').click(async function () {
    var tableInfor = document.getElementById('table_heading_template').innerHTML
    var template = Handlebars.compile(tableInfor)
    var info = template({
      title: 'Pull Request Reviews'
    })
    document.getElementById('theading').innerHTML = info
    var cardInfor = document.getElementById('3cards_template').innerHTML
    template = Handlebars.compile(cardInfor)
    var infoCards = template({
      card1: 'Total Commits',
      text1: totalCommits,
      card2: 'Closed Pulls Analytics',
      card3: 'Closed Pulls Analytics',
      card4: 'Closed Pulls Analytics'
    })
    document.getElementById('frontOverview').innerHTML = null
    document.getElementById('cards').innerHTML = null
    document.getElementById('3cards').innerHTML = infoCards
    await genPullCommitsTable(pullCommits)
    return false
  })
  $('#pullReqNo').on('click', '#pullOption', function () {
    var self = $(this).closest('option')
    var selected = self.find('id').text()
  })
  $('#pullPerDev').click(async function () {
    var tableInfor = document.getElementById('table_heading_template').innerHTML
    var template = Handlebars.compile(tableInfor)
    var info = template({
      title: 'Pull Request Per Developer'
    })
    document.getElementById('theading').innerHTML = info
    var cardInfor = document.getElementById('cards_template').innerHTML
    template = Handlebars.compile(cardInfor)
    var infoCards = template({
      card1: 'Review ANalytics',
      card2: 'Review ANalytics',
      card3: 'Review ANalytics',
      card4: 'Review ANalytics'
    })
    document.getElementById('frontOverview').innerHTML = null
    document.getElementById('3cards').innerHTML = null
    document.getElementById('cards').innerHTML = infoCards

    // await genPieChart(contributorClosedPullReq, '#closedPie')
    // generate statistics for developer pull request table for every release

    var tableData = []

    tableData.push({
      'data': contributionsPerDevPerRelease(mergedPullPerDev()),
      'column': ['Release', 'Total Pull Requests', 'Developer Pull Requests'],
      'div': '#mergedReleasePerDevTable'
    })
    tableData.push({
      'data': contributionsPerDevPerRelease(closedPullPerDev()),
      'column': ['Release', 'Total Pull Requests', 'Developer Pull Requests'],
      'div': '#closedPullsPerDevTable'
    })
    var pieData = []
    pieData.push({
      'data': contributorMergedPullReq,
      'div': '#mergedPie'
    })
    pieData.push({
      'data': contributorClosedPullReq,
      'div': '#closedPie'
    })
    // clear all svg's and tables
    d3.selectAll('svg').remove()
    d3.selectAll('table').remove()
    for (let i = 0; i < tableData.length; i++) {
      await genPieChart(pieData[i], tableData[i])
    }
    return false
  })
})

function contributionsPerDevPerRelease (array) {
  var data = []
  var z = 0
  for (var i = 0; i < releases.length; i++) {
    var contributions = ''
    var total = 0
    for (var j = 0; j < array.length; j++) {
      contributions += array[j].name + '(' + ((array[j].release)[i]).pulls + ') '
      total += ((array[j].release)[i]).pulls
    }
    data[i] = {
      'Release': ((array[i].release)[i]).number,
      'Total Pull Requests': total,
      'Developer Pull Requests': contributions
    }
    z++
  }
  return data
}
function mergedPullPerDev () {
  // populate the object that stores the information per developer
  for (var z = contributors.length - 1; z >= 0; z--) {
    var release = []
    for (var a = 0; a < releases.length; a++) {
      release[a] = {
        'number': a + 1,
        'pulls': 0
      }
    }

    devReleases[z] = {
      'name': contributors[z].login,
      'release': release
    }
  }
  // generate release table
  var pullDates = []
  var g = 0
  // convert data into unix time stamp

  for (var d = 0; d < summary.length; d++) {
    var dummy = (summary[d]).Merge_Date
    if (dummy != null) {
      const date = new Date((dummy).substring(0, 10))
      pullDates[g] = date.getTime()
      g++
    }
  }
  // convert all the dates into integers so that they can be compared
  pullDates.forEach(parseInt)
  releases.forEach(parseInt)
  var prev = 0
  for (var i = 0; i < releases.length; i++) {
    for (var j = 0; j < pullDates.length; j++) {
      if ((pullDates[j] > prev) && (pullDates[j] <= releases[i])) {
        summary[j]['release_id'] = i + 1
        for (var k = 0; k < devReleases.length; k++) {
          if (devReleases[k].name === (summary[j]).User) {
            ((devReleases[k]).release[i]).pulls++
          }
        }
      } else {

      }
    }
    prev = releases[i]
  }
  return devReleases
}
// these two functions need to be combined
function closedPullPerDev () {
  // populate the object that stores the information per developer
  for (var z = contributors.length - 1; z >= 0; z--) {
    var release = []
    for (var a = 0; a < releases.length; a++) {
      release[a] = {
        'number': a + 1,
        'pulls': 0
      }
    }

    closedDevReleases[z] = {
      'name': contributors[z].login,
      'release': release
    }
  }
  // generate release table
  var pullDates = []
  var g = 0
  // convert data into unix time stamp

  for (var d = 0; d < (closedPulls).length; d++) {
    var dummy = closedPulls[d].created_at
    if (dummy != null) {
      const date = new Date((dummy).substring(0, 10))
      pullDates[g] = date.getTime()
      g++
    }
  }
  // convert all the dates into integers so that they can be compared
  pullDates.forEach(parseInt)
  releases.forEach(parseInt)
  var prev = 0
  for (var i = 0; i < releases.length; i++) {
    for (var j = 0; j < pullDates.length; j++) {
      if ((pullDates[j] > prev) && (pullDates[j] <= releases[i])) {
        for (var k = 0; k < closedDevReleases.length; k++) {
          if (closedDevReleases[k].name === closedPulls[j].user.login) {
            ((closedDevReleases[k]).release[i]).pulls++
          }
        }
      } else {

      }
    }
    prev = releases[i]
  }
  return closedDevReleases
}
function genPieChart (pieData, tableData) {
  var data = pieData.data
  var div = pieData.div
  var pie = d3.layout.pie()
    .value(function (d) { return d.pulls })
    .sort(null)

  var w = 300
  var h = 300

  var outerRadius = (w - 2) / 2

  var color = d3.scale.category10()
  // .range(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c']);

  var arc = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(outerRadius)

  var svg = d3.select(div)
    .append('svg')
    .attr({
      width: w,
      height: h,
      class: 'shadow'
    }).append('g')
    .attr({
      transform: 'translate(' + w / 2 + ',' + h / 2 + ')'
    })
  var path = svg.selectAll('path')
    .data(pie(data))
    .enter()
    .append('path')
    .attr({
      d: arc,
      fill: function (d, i) {
        return color(i)
      }
    })
    .style({
      'fill-opacity': 0.15,
      stroke: function (d, i) {
        return color(i)
      },
      'stroke-width': '2px'
    })

  var text = svg.selectAll('text')
    .data(pie(data))
    .enter()
    .append('text')
    .attr('transform', function (d) {
      return 'translate(' + arc.centroid(d) + ')'
    })

    .attr('text-anchor', 'middle')
    .text(function (d) {
      return d.data.name + ' (' + d.data.pulls + ')'
    })
    .style({
      fill: function (d, i) {
        return color(i)
      },
      'font-size': '18px'

    })

    // gen table

  tabulate(tableData.data, tableData.column, tableData.div)
}
function genSummaryTable (data) {
  d3.selectAll('table').remove()
  d3.selectAll('svg').remove()
  // render the tables
  tabulate(data, ['Pull_Request', 'User', 'Branch', 'State', 'Merge_Date', 'Total_Commits', 'Message']) // 2 column table
}

function genReviewTable (data) {
  console.log(data)
  d3.select('svg').remove()
  // render the tables
  d3.selectAll('table').remove()
  d3.selectAll('svg').remove()
  tabulate(data, ['Pull Request', 'Reviewer', 'Reviewee', 'Date', 'Status', 'Review Message'])
}
function genPullCommitsTable (stats) {
  d3.select('svg').remove()
  for (var i = 0; i < stats.length; ++i) {
    var data = stats[i]
    // render the tables
    d3.selectAll('table').remove()
    d3.selectAll('svg').remove()
    tabulate(data, ['Date', 'Message'])
  }
}
// table generating function
function tabulate (data, columns, div = '#summary') {
  var table = d3.select(div).append('table')
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

// James code to be replaced:
function getReleaseDateForPie (releases) {
  var releaseInfo = {
    actualreleaseDates: []
  }
  var j = 0
  for (var i = releases.length - 1; i >= 0; i--) {
    const date = new Date((releases[i].published_at).substring(0, 10))
    releaseInfo.actualreleaseDates[j] = date.getTime()

    j++
  }
  return (releaseInfo).actualreleaseDates
}
