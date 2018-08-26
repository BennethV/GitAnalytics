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
var commitsPerContributor = []
var comPerDev = []
var statusOnMaster = ''
var acquiredData = false
var pullInfo = []
var generalRepoData = []
var userInfo = {}
var trackHoverPopUp = 0;

(async function () {
  // show loading gif when starting to acquire data
  // document.getElementById('loader').style.display = 'block'

  var rep = await urlParam('repository')
  await fetch('http://127.0.0.1:3000/javascripts/data.json')
    .then((res) => res.text())
    .then(async function (data) {
      userInfo = await JSON.parse(data)
      if (rep) {
        userInfo.repository = rep

        console.log('New Repo: ' + rep)
      }
      console.log(userInfo)
      getReleases()
      try {
        var count = 0
        // User's details
        var res = await fetch(`https://api.github.com/user?access_token=${userInfo.accessToken}`)
        const userName = await res.json()
        userInfo.username = userName.login
        // fetches repo list from selected organisation
        res = await fetch(`https://api.github.com/orgs/${userInfo.organisation}/repos?per_page=250&access_token=${userInfo.accessToken}`)
        repos = await res.json()
        // repository pulls
        res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/pulls?per_page=250&state=closed&access_token=${userInfo.accessToken}`)

        closedPulls = await res.json()
        res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/contributors?per_page=250&access_token=${userInfo.accessToken}`)
        contributors = await res.json()
        // fetch release information
        res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/releases?per_page=250&access_token=${userInfo.accessToken}`)
        releases = getReleaseDateForPie(await res.json())
        // Fetch all the commits of the repo
        res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/commits?per_page=250&access_token=${userInfo.accessToken}`)
        commits = await res.json()
        res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}?access_token=${userInfo.accessToken}`)
        generalRepoData = await res.json()
        // fectch branch information
        res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/branches?per_page=250&access_token=${userInfo.accessToken}`)
        branches = await res.json()
        for (let p = 0; p < branches.length; p++) {
          var statusData = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/statuses/${branches[p].commit.sha}?per_page=250&access_token=${userInfo.accessToken}`);
          (branches[p])['statusData'] = await statusData.json()
          var commitData = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/commits?per_page=250&sha=${branches[p].commit.sha}&access_token=${userInfo.accessToken}`);
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
          res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/commits?author=${contributors[d].login}&per_page=250&access_token=${userInfo.accessToken}`)
          var array = await res.json()
          commitsPerContributor.push({
            'name': contributors[d].login,
            commits: array
          })
        }
        console.log(commitsPerContributor)
        // loop through closed pull requests
        // fetches the all the commits per pull request and the reviews
        // This will invert the data
        // count = 0
        // for (var z = (closedPulls).length - 1; z >= 0; z--) {

        //   res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/pulls/${closedPulls[z].number}/reviews?state=all&access_token=${userInfo.accessToken}`)
        //   reviews[count] = await res.json()
        //   count++
        // }
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
            res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/pulls/${closedPulls[i].number}/reviews?per_page=250&state=all&access_token=${userInfo.accessToken}`)
            reviews.push(await res.json())
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
              'node_Deletions': '',
              'all_Additions': ''
            })
          }
          count++
        } // closedPulls loop ends here
        // populating pull request review objects
        for (var q = 0; q < reviews.length; q++) {
          // if the code was reviewed
          if (typeof (reviews[q]).length !== 'undefined' && (reviews[q]).length > 0) {
            var reviewer = ''
            var date = ''
            var status = ''
            var revMessage = ''

            for (var k = 0; k < (reviews[q]).length; ++k) {
              reviewer = ((reviews[q])[k]).user.login
              date = ((reviews[q])[k]).submitted_at
              status += ((reviews[q])[k]).state + '|==> '
              revMessage += ((reviews[q])[k]).body + '|==> '
            }
            pullReview.push({
              'Pull Request': summary[q].Pull_Request,
              'Reviewer': reviewer,
              'Reviewee': closedPulls[q].user.login,
              'Date': date,
              'Status': status,
              'Review Message': revMessage
            })
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
            if ((branches[r]).name === 'master') {
              statusOnMaster = ((branches[r]).statusData[0]).state
            } else if (((summary[h]).Branch === (branches[r]).name) && (((branches[r]).statusData).length !== 0)) {
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

        for (var i = 0; i < summary.length; i++) {
          const pullNo = (summary[i]).Pull_Request
          const result = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/pulls/${pullNo}/files?state=closed&access_token=${userInfo.accessToken}`)
          const data = await result.json()
          pullInfo.push(data)
        }

        // generate release id and developer pull request per release
        await mergedPullPerDev()

        // this function plots the bar graphs under sprints
        await pullDetails()
        console.log('Done fetching all the information')
        acquiredData = true
      } catch (err) { console.log(err) }
      document.getElementById('loader').style.display = 'none'
      $('#overview').trigger('click')
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
  $('#frontOverview').on('click', 'a', function () {
    // console.log($(this).text())
    userInfo.repository = $(this).text()
    window.location.href = `/charts?repository=${userInfo.repository}`
    return false
  })
  $('body').on('click', '#logout', function () {
    window.location.href = `/`
    return false
  })

  $('#overview').click(function () {
    document.getElementById('body').style.backgroundColor = 'grey'

    document.getElementById('cards').innerHTML = null
    document.getElementById('theading').innerHTML = null
    document.getElementById('3cards').innerHTML = null
    document.getElementById('defaulView').innerHTML = null
    document.getElementById('dynamicBarGraph').innerHTML = null
    document.getElementById('popupDetail').innerHTML = null
    var overViewInfo = document.getElementById('overviewLayout-template').innerHTML
    var template = Handlebars.compile(overViewInfo)
    var sprintNumber = releaseInfo.actualreleaseDates.length - 1
    var names = getNames()
    var overviewData = template({
      title: 'welcome to ' + userInfo.repository + ' Repository Statistics',
      NumberOfSprint: sprintNumber,
      totalCommits: totalCommits(),
      repos: repoList,
      statusOnMaster: statusOnMaster,
      names: names,
      language: generalRepoData.language,
      tbdScore: tbdScore()
    })
    document.getElementById('frontOverview').innerHTML = overviewData
    d3.selectAll('table').remove()
    d3.selectAll('svg').remove()
    overviewPie()
    if (grouptValidation) {
      stackedBarOverview(contributionsPerSprint, getNames())
    } else {
      alert('This group has missing information.\n' +
        'POSSIBLE REASONS:\n' +
        '                  - Master has been Renamed\n' +
        '                  - Branches are deleted\n' +
        '                  - Pull requests are much leass than releases\n(master released multiple times with no changes)\n')
    }

    return false
  })

  $('#pullOverview').click(async function () {
    document.getElementById('body').style.backgroundColor = 'white'
    var tableInfor = document.getElementById('table_heading_template').innerHTML

    var template = Handlebars.compile(tableInfor)
    var info = template({
      title: 'Pull Request Overview',
      description: 'The table shows the merged pull requests that were merged with master. Use the graph at the bottom to compare trends over time.'

    })
    document.getElementById('theading').innerHTML = info
    // update the information cards
    var cardInfor = document.getElementById('cards_template').innerHTML
    var dynamicBar = document.getElementById('dynamicChart').innerHTML
    template = Handlebars.compile(cardInfor)
    var infoCards = template({
      card1: 'Closed Pulls:',
      text1: closedPulls.length,
      card2: 'Merged Pulls:',
      text2: summary.length,
      card3: 'Total Commits:',
      text3: totalCommits(),
      card4: 'Healthy Builds',
      text4: totalHealthyBuilds + '/' + summary.length
    })

    document.getElementById('dynamicBarGraph').innerHTML = dynamicBar
    document.getElementById('frontOverview').innerHTML = null
    document.getElementById('3cards').innerHTML = null
    document.getElementById('defaulView').innerHTML = null
    document.getElementById('cards').innerHTML = infoCards
    document.getElementById('popupDetail').innerHTML = null
    await genSummaryTable(summary)
    dynamicChart()
    return false
  })
  $('#pullreview').click(async function () {
    document.getElementById('body').style.backgroundColor = 'white'
    var tableInfor = document.getElementById('table_heading_template').innerHTML
    var template = Handlebars.compile(tableInfor)
    var info = template({
      title: 'Pull Request Reviews',
      description: 'The table shows the reviewed pull requests. Use the graph at the bottom to compare trends over time.'

    })
    // document.getElementById('pullReqNo').innerHTML =null;
    document.getElementById('theading').innerHTML = info
    var cardInfor = document.getElementById('3cards_template').innerHTML
    template = Handlebars.compile(cardInfor)
    var infoCards = template({
      card1: 'Total Sprints',
      text1: (releases.length),
      card2: 'Number of Contributors',
      text2: ((getNames()).length),
      card3: 'Total Pull Requests Reviewed',
      text3: (pullReview.length + '/' + summary.length)
    })
    document.getElementById('frontOverview').innerHTML = null
    document.getElementById('cards').innerHTML = null
    document.getElementById('defaulView').innerHTML = null

    document.getElementById('3cards').innerHTML = infoCards

    var dynamicBar = document.getElementById('dynamicChart').innerHTML
    document.getElementById('dynamicBarGraph').innerHTML = dynamicBar
    document.getElementById('popupDetail').innerHTML = null
    await genReviewTable(pullReview)
    dynamicChart()
    return false
  })
  $('#commitsPerDev').click(async function () {
    document.getElementById('body').style.backgroundColor = 'white'
    var tableInfor = document.getElementById('table_heading_template').innerHTML
    var template = Handlebars.compile(tableInfor)
    var commitsInfo = template({
      title: 'Commits Per Developer',
      description: 'The histogram shows the total commits made by each developer. ' +
                'The pie chart shows the contribution of commits per release.'
    })
    document.getElementById('theading').innerHTML = commitsInfo
    var cardInfor = document.getElementById('cards_template').innerHTML
    var popUpInfor = document.getElementById('popUp_template').innerHTML
    template = Handlebars.compile(cardInfor)
    var infoCards = template({
      card1: 'Total Commits',
      text1: totalCommits(),
      card2: 'Total Merged Pulls',
      text2: summary.length,
      card3: 'Total Releases',
      text3: releases.length,
      card4: 'Average Commits Per Developer',
      text4: averageCommits()
    })
    document.getElementById('frontOverview').innerHTML = null
    document.getElementById('3cards').innerHTML = null
    document.getElementById('defaulView').innerHTML = null
    document.getElementById('popupDetail').innerHTML = popUpInfor

    document.getElementById('cards').innerHTML = infoCards
    // clear all svg's and tables
    d3.selectAll('svg').remove()
    d3.selectAll('table').remove()

    var freqData = []
    var releaseArray = []
    var info = commitsPerDev()
    for (let t = 0; t < info.length; t++) {
      var releaseData = info[t].release
      var obj = {}
      var total = 0
      for (let f = 0; f < releaseData.length; f++) {
        obj['release' + releaseData[f].number] = releaseData[f].commits
        total += releaseData[f].commits
      }
      freqData.push({
        State: info[t].name,
        freq: obj,
        total: total
      })
    }
    for (let r = 0; r < releases.length; r++) {
      releaseArray.push('release' + (r + 1))
    }
    console.log(freqData)
    console.log(releaseArray)
    trackHoverPopUp = 0
    pullRequestOverviewTip()
    dashboard('#dashboard', freqData, releaseArray, 'Commits Per Developer')
    return false
  })

  $('#pullReqNo').on('click', '#pullOption', function () {
    document.getElementById('body').style.backgroundColor = 'white'
    var self = $(this).closest('option')
    var selected = self.find('id').text()
  })
  $('#pullPerDev').click(async function () {
    var tableInfor = document.getElementById('table_heading_template').innerHTML
    var popUpInfor = document.getElementById('popUp_template').innerHTML
    var template = Handlebars.compile(tableInfor)
    var info = template({
      title: 'Pull Request Per Developer',
      description: 'Information about the pull request contributions per developer is given.' +
                 'The pie chart shows the total pull requests per release.' +
                  'The histogram shows the pull request contribution of each developer.' +
                   'Both are interactive. The tables show how much each developer contributed for each release.'

    })
    document.getElementById('theading').innerHTML = info
    var cardInfor = document.getElementById('3cards_template').innerHTML
    template = Handlebars.compile(cardInfor)
    var infoCards = template({
      card1: 'Total Releases',
      text1: (releases.length),
      card2: 'Number of Contributors',
      text2: ((getNames()).length),
      card3: 'Average Pull Request Per Dev',
      text3: (summary.length / contributors.length)

    })
    document.getElementById('body').style.backgroundColor = 'white'
    document.getElementById('frontOverview').innerHTML = null
    document.getElementById('popupDetail').innerHTML = popUpInfor
    document.getElementById('3cards').innerHTML = null
    document.getElementById('dynamicBarGraph').innerHTML = null
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

    // clear all svg's and tables
    d3.selectAll('svg').remove()
    d3.selectAll('table').remove()
    var freqData = []
    var releaseArray = []
    var info = mergedPullPerDev()
    for (let t = 0; t < info.length; t++) {
      var releaseData = info[t].release
      var obj = {}
      var total = 0
      for (let f = 0; f < releaseData.length; f++) {
        obj['release' + releaseData[f].number] = releaseData[f].pulls
        total += releaseData[f].pulls
      }
      freqData.push({
        State: info[t].name,
        freq: obj,
        total: total
      })
    }
    for (let r = 0; r < releases.length; r++) {
      releaseArray.push('release' + (r + 1))
    }
    dashboard('#dashboard', freqData, releaseArray, 'Pull Requests Per Developer')
    for (let i = 0; i < tableData.length; i++) {
      await tabulate(tableData[i].data, tableData[i].column, tableData[i].div)
    }
    trackHoverPopUp = 0
    pullRequestOverviewTip()
    return false
  })
})
function averageCommits () {
  var total = 0
  for (let i = 0; i < commitsPerContributor.length; i++) {
    total += ((commitsPerContributor[i]).commits).length
  }
  return (total / commitsPerContributor.length)
}

function totalCommits () {
  var total = 0
  for (var i = 0; i < commitsPerContributor.length; i++) {
    total += ((commitsPerContributor[i]).commits).length
  }
  return total
}
function tbdScore () {
  var codeReviewed = ((reviews.length) / (summary.length)) * (100 / 3)
  var successBuild = (totalHealthyBuilds / summary.length) * (100 / 3)
  var branchesVsMerges = (branches.length / summary.length) * (100 / 3)
  var total = codeReviewed + successBuild + branchesVsMerges
  console.log('TBD Score: ')
  console.log('codeReviewed = ' + codeReviewed + '%')
  console.log('successBuild = ' + successBuild + '%')
  console.log('branchesVsMerges = ' + branchesVsMerges + '%')
  console.log('total = ' + total + '%')

  return (total.toFixed(2))
}

function overviewPie () {
  var data = contributorMergedPullReq
  var div = '#overviewPie'
  var pie = d3.layout.pie()
    .value(function (d) { return d.pulls })
    .sort(null)

  var w = 400
  var h = 400

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
}
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
function commitsPerDev () {
  // populate the object that stores the information per developer
  for (var z = contributors.length - 1; z >= 0; z--) {
    var release = []
    for (var a = 0; a < releases.length; a++) {
      release[a] = {
        'number': a + 1,
        'commits': 0
      }
    }

    comPerDev[z] = {
      'name': contributors[z].login,
      'release': release
    }
  }

  // convert data into unix time stamp
  var datesPerDev = []
  for (var d = 0; d < commitsPerContributor.length; d++) {
    var com = commitsPerContributor[d].commits
    var dates = []
    for (let h = 0; h < com.length; h++) {
      var dummy = (((com[h]).commit).author).date
      if (dummy !== null) {
        const date = new Date((dummy).substring(0, 10))
        dates.push(date.getTime())
      }
    }
    datesPerDev.push({
      'name': commitsPerContributor[d].name,
      'date': dates
    })
  }
  // console.log(datesPerDev)
  // generate release table

  for (var i = 0; i < datesPerDev.length; i++) {
    var pullDates = datesPerDev[i].date
    // convert all the dates into integers so that they can be compared
    pullDates.forEach(parseInt)
    releases.forEach(parseInt)

    for (var j = 0; j < pullDates.length; j++) {
      var prev = 0
      for (let v = 0; v < releases.length; v++) {
        if ((pullDates[j] > prev) && (pullDates[j] <= releases[v])) {
          for (var k = 0; k < comPerDev.length; k++) {
            if (comPerDev[k].name === (datesPerDev[i]).name) {
              console.log(comPerDev[k].name);
              ((comPerDev[k]).release[v]).commits++
            }
          }
        } else {

        }
        prev = releases[v]
      }
    }
  }
  return comPerDev
}
function genSummaryTable (data) {
  d3.selectAll('table').remove()
  d3.selectAll('svg').remove()
  // render the tables
  tabulate(data, ['Pull_Request', 'User', 'Branch', 'State', 'Merge_Date', 'Total_Commits', 'Message']) // 2 column table
}

function genReviewTable (data) {
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
function dashboard (id, fData, releaseArray, heading) {
  var barColor = 'steelblue'
  // Assign colours for each of the pie segments
  function color_google (n) {
    var colores_g = ['#3366cc', '#dc3912', '#ff9900', '#109618', '#990099', '#0099c6', '#dd4477', '#66aa00', '#b82e2e', '#316395', '#994499', '#22aa99', '#aaaa11', '#6633cc', '#e67300', '#8b0707', '#651067', '#329262', '#5574a6', '#3b3eac']
    return colores_g[n % colores_g.length]
  }
  // Assign colours for each of the pie segments
  function segColor (c) {
    var obj = {}
    for (var i = 0; i < releaseArray.length; i++) {
      obj[releaseArray[i]] = color_google(i)
    }
    return obj[c]
  }

  // compute total for each state.@@@@@ you removed code

  // function to handle histogram.
  function histoGram (fD) {
    var hG = {}, hGDim = {t: 60, r: 0, b: 100, l: 100}
    hGDim.w = 600 - hGDim.l - hGDim.r,
    hGDim.h = 400 - hGDim.t - hGDim.b

    // create svg for histogram.
    var hGsvg = d3.select(id).append('svg')
      .attr('width', hGDim.w + hGDim.l + hGDim.r)
      .attr('height', hGDim.h + hGDim.t + hGDim.b).append('g')
      .attr('transform', 'translate(' + hGDim.l + ',' + hGDim.t + ')')

    hGsvg.append('text')
      .attr('x', (hGDim.w / 2))
      .attr('y', 0 - (hGDim.t / 2))
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('text-decoration', 'underline')
      .text(heading)
      // create function for x-axis mapping.
    var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
      .domain(fD.map(function (d) { return d[0] }))

      // Add x-axis to the histogram svg.
    hGsvg.append('g').attr('class', 'x axis')
      .attr('transform', 'translate(0,' + hGDim.h + ')')
      .style('font-size', '16px')
      .call(d3.svg.axis().scale(x).orient('bottom'))

      // Create function for y-axis map.
    var y = d3.scale.linear().range([hGDim.h, 0])
      .domain([0, d3.max(fD, function (d) { return d[1] })])

      // Create bars for histogram to contain rectangles and freq labels.
    var bars = hGsvg.selectAll('.bar').data(fD).enter()
      .append('g').attr('class', 'bar')

      // create the rectangles.
    bars.append('rect')
      .attr('x', function (d) { return x(d[0]) })
      .attr('y', function (d) { return y(d[1]) })
      .attr('width', x.rangeBand())
      .attr('height', function (d) { return hGDim.h - y(d[1]) })
      .attr('fill', barColor)
      .on('mouseover', mouseover)// mouseover is defined below.
      .on('mouseout', mouseout)// mouseout is defined below.

      // Create the frequency labels above the rectangles.
    bars.append('text').text(function (d) { return d3.format(',')(d[1]) })
      .attr('x', function (d) { return x(d[0]) + x.rangeBand() / 2 })
      .attr('y', function (d) { return y(d[1]) - 5 })
      .attr('text-anchor', 'middle')

    function mouseover (d) { // utility function to be called on mouseover.
      // filter for selected state.
      var st = fData.filter(function (s) { return s.State == d[0] })[0],
        nD = d3.keys(st.freq).map(function (s) { return {type: s, freq: st.freq[s]} })
      if (trackHoverPopUp == 0) {
        pullRequestOverviewTip()
        trackHoverPopUp++
      }

      // call update functions of pie-chart and legend.
      pC.update(nD)
      leg.update(nD)
    }

    function mouseout (d) { // utility function to be called on mouseout.
      // reset the pie-chart and legend.
      pC.update(tF)
      leg.update(tF)
    }

    // create function to update the bars. This will be used by pie-chart.
    hG.update = function (nD, color) {
      // update the domain of the y-axis map to reflect change in frequencies.
      y.domain([0, d3.max(nD, function (d) { return d[1] })])

      // Attach the new data to the bars.
      var bars = hGsvg.selectAll('.bar').data(nD)

      // transition the height and color of rectangles.
      bars.select('rect').transition().duration(500)
        .attr('y', function (d) { return y(d[1]) })
        .attr('height', function (d) { return hGDim.h - y(d[1]) })
        .attr('fill', color)

      // transition the frequency labels location and change value.
      bars.select('text').transition().duration(500)
        .text(function (d) { return d3.format(',')(d[1]) })
        .attr('y', function (d) { return y(d[1]) - 5 })
    }
    hGsvg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - 60)
      .attr('x', 0 - (hGDim.h / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Quantity')
    // text label for the x axis
    hGsvg.append('text')
      .attr('transform', 'translate(' + (hGDim.w / 2) + ' ,' + (hGDim.h + 40 + 20) + ')')
      .style('text-anchor', 'middle')
      .text('Developer Names')
    return hG
  }

  // function to handle pieChart.
  function pieChart (pD) {
    var pC = {}, pieDim = {w: 350, h: 350}

    pieDim.r = Math.min(pieDim.w, pieDim.h) / 2

    // create svg for pie chart.
    var piesvg = d3.select(id).append('svg')
      .attr('width', pieDim.w).attr('height', pieDim.h).append('g')
      .attr('transform', 'translate(' + pieDim.w / 2 + ',' + pieDim.h / 2 + ')')

      // create function to draw the arcs of the pie slices.
    var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0)

    // create a function to compute the pie slice angles.
    var pie = d3.layout.pie().sort(null).value(function (d) { return d.freq })

    // Draw the pie slices.

    piesvg.selectAll('path')
      .data(pie(pD))
      .enter()
      .append('path')
      .attr('d', arc)

      .each(function (d) { this._current = d })
      .style('fill', function (d) {
        return segColor(d.data.type)
      })
      .on('mouseover', mouseover).on('mouseout', mouseout)

      // create function to update pie-chart. This will be used by histogram.
    pC.update = function (nD) {
      piesvg.selectAll('path').data(pie(nD)).transition().duration(500)
        .attrTween('d', arcTween)
    }
    // Utility function to be called on mouseover a pie slice.
    function mouseover (d) {
      // call the update function of histogram with new data.
      hG.update(fData.map(function (v) {
        return [v.State, v.freq[d.data.type]]
      }), segColor(d.data.type))
      if (trackHoverPopUp === 0) {
        pullRequestOverviewTip()
        trackHoverPopUp++
      }
    }
    // Utility function to be called on mouseout a pie slice.
    function mouseout (d) {
      // call the update function of histogram with all data.
      hG.update(fData.map(function (v) {
        return [v.State, v.total]
      }), barColor)
    }
    // Animating the pie-slice requiring a custom function which specifies
    // how the intermediate paths should be drawn.
    function arcTween (a) {
      var i = d3.interpolate(this._current, a)
      this._current = i(0)
      return function (t) { return arc(i(t)) }
    }
    return pC
  }

  // function to handle legend.
  function legend (lD) {
    var leg = {}

    // create table for legend.
    var legend = d3.select(id).append('table').attr('class', 'legend')

    // create one row per segment.
    var tr = legend.append('tbody').selectAll('tr').data(lD).enter().append('tr')

    // create the first column for each segment.
    tr.append('td').append('svg').attr('width', '16').attr('height', '16').append('rect')
      .attr('width', '16').attr('height', '16')
      .attr('fill', function (d) { return segColor(d.type) })

      // create the second column for each segment.
    tr.append('td').text(function (d) { return d.type })

    // create the third column for each segment.
    tr.append('td').attr('class', 'legendFreq')
      .text(function (d) { return d3.format(',')(d.freq) })

      // create the fourth column for each segment.
    tr.append('td').attr('class', 'legendPerc')
      .text(function (d) { return getLegend(d, lD) })

      // Utility function to be used to update the legend.
    leg.update = function (nD) {
      // update the data attached to the row elements.
      var l = legend.select('tbody').selectAll('tr').data(nD)

      // update the frequencies.
      l.select('.legendFreq').text(function (d) { return d3.format(',')(d.freq) })

      // update the percentage column.
      l.select('.legendPerc').text(function (d) { return getLegend(d, nD) })
    }

    function getLegend (d, aD) { // Utility function to compute percentage.
      return d3.format('%')(d.freq / d3.sum(aD.map(function (v) { return v.freq })))
    }

    return leg
  }

  // calculate total frequency by segment for all state.

  var tF = releaseArray.map(function (d) {
    return {type: d, freq: d3.sum(fData.map(function (t) { return t.freq[d] }))}
  })

  // calculate total frequency by state for all segment.
  var sF = fData.map(function (d) { return [d.State, d.total] })

  var hG = histoGram(sF), // create the histogram.
    pC = pieChart(tF), // create the pie-chart.
    leg = legend(tF) // create the legend.
}
