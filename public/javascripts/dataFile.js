var accessToken = 'a8bac075ed9f4ea8418be07b09d4b85ef79c8583'
var repoName = 'Group-9-Lab'
var orgName = 'witseie-elen4010'

const getReleases = async () => {
  try {
    const result = await fetch(`https://api.github.com/repos/${orgName}/${repoName}/releases?access_token=${accessToken}`)
    const releases = await result.json()
    return {releases}
  } catch (err) { console.log(err) }
}
// draws the timeline
const dateOfRelease = () => {
  getReleases().then((res) => {
    const releases = res.releases
    console.log(releases)
    const releaseInfo = getReleaseDates(releases)
    var day = 1000 * 60 * 60 * 24 // this gives a day in milliseconds
    var testData = cleanData(releaseInfo)
    const width = 1000
    var lastDate = (releaseInfo.releaseInfo.expreleaseDates).length - 1
    const SprintLength = releaseInfo.releaseInfo.daysElapsed / day
    function timelineRect () {
      var chart = d3.timeline()
        // d3.select('#timeline1').remove()
        .beginning(releaseInfo.releaseInfo.actualreleaseDates[0]) // we can optionally add beginning and ending times to speed up rendering a little
        .ending(releaseInfo.releaseInfo.actualreleaseDates[lastDate])
        .showTimeAxisTick() // toggles tick marks
        .stack()
        .width(width)
        .rotateTicks(45)
        .tickFormat( //
          {format: d3.time.format('%Y-%m-%d'),
            tickTime: d3.time.day,
            tickInterval: SprintLength,
            tickSize: 6})
        .margin({left: 70, right: 30, top: 0, bottom: 0})
        .click(function (d, i, datum) {
          releaseDetais(releaseInfo.releaseInfo, i)
          developerContributions()
        })

      console.log(releaseInfo.releaseInfo.actualreleaseDates[0])
      var svg = d3.select('#timeline1').append('svg').attr('width', 1000).datum(testData).call(chart)
    }
    //  svg.selectAll(".bar").on("click", function(d){location.replace(d.letter+".html");});
    timelineRect()
  })
}

// gets the release dates and stores them
function getReleaseDates (releases) {
  var releaseInfo = {
    actualreleaseDates: [],
    releaseTags: [],
    daysElapsed: '',
    expreleaseDates: [],
    releaseDays: [],
    releaseDay: '',
    releaser: []
  }
  var j = 0
  for (var i = releases.length - 1; i >= 0; i--) {
    const date = new Date((releases[i].published_at).substring(0, 10))
    releaseInfo.actualreleaseDates[j] = date.getTime()
    releaseInfo.releaser[j] = releases[i].author.login
    releaseInfo.releaseTags[j] = releases[i].tag_name
    releaseInfo.releaseDays[j] = date.getDay()

    //
    if (j === 1) {
      releaseInfo.daysElapsed = noOfDays(releaseInfo.actualreleaseDates[j - 1], releaseInfo.actualreleaseDates[j])
      releaseInfo.releaseDay = date.getDay()
      // console.log('releas day' + releaseInfo.releaseDay)
    }
    if (i === 0 && releaseInfo.daysElapsed !== 0) {
      var startDate = releaseInfo.actualreleaseDates[0] - releaseInfo.daysElapsed
      console.log(releaseInfo.actualreleaseDates);
      (releaseInfo.actualreleaseDates).unshift(startDate)
      console.log(releaseInfo.actualreleaseDates)
    }
    j++
  }
  // console.log(releaseInfo.releaser)
  return {releaseInfo}
}

function noOfDays (date1, date2) {
  var diff = date2 - date1

  var noDays = diff
  return noDays
}

function cleanData (data) {
  var releaseTime = []
  getexpReleaseDates(data.releaseInfo)

  const currentData = data.releaseInfo
  const actualDates = currentData.actualreleaseDates
  const expectedDates = currentData.expreleaseDates
  // convert to integers for comparison
  expectedDates.forEach(parseInt)
  actualDates.forEach(parseInt)
  // var allDates = arrayUnique(currentData.actualreleaseDates, currentData.expreleaseDates) // contains all expected and actual dates in order. itis used for ploting and finding overlaps

  for (var i = 1; i <= actualDates.length; i++) {
    // should be greater than zero because at zero comparison will be hard
    if (actualDates[i] === expectedDates[i]) {
      releaseTime[i - 1] = {times: [{'color': 'green', 'label': currentData.releaseTags[i - 1], 'starting_time': currentData.expreleaseDates[i - 1], 'ending_time': currentData.actualreleaseDates[i]}] }
    } else if (actualDates[i] > expectedDates[i]) {
      releaseTime[i - 1] = {times: [{'color': 'green', 'label': currentData.releaseTags[i - 1], 'starting_time': currentData.expreleaseDates[i - 1], 'ending_time': currentData.actualreleaseDates[i]},
        {'color': 'red', 'label': 'Late', 'starting_time': currentData.expreleaseDates[i], 'ending_time': currentData.actualreleaseDates[i] }] }
    } else if (actualDates[i] < expectedDates[i]) {
      releaseTime[i - 1] = {times: [{'color': 'green', 'label': currentData.releaseTags[i - 1], 'starting_time': currentData.expreleaseDates[i - 1], 'ending_time': currentData.actualreleaseDates[i]},
        {'color': 'orange', 'label': 'early', 'starting_time': currentData.actualreleaseDates[i], 'ending_time': currentData.expreleaseDates[i] }] }
    }
  }
  return releaseTime
}

function getexpReleaseDates (releaseInfo) {
  // var days = 1000 * 60 * 60 * 24 // this gives a day in milliseconds
  var daysElapsed = releaseInfo.daysElapsed

  var noOfReleases = releaseInfo.actualreleaseDates.length

  releaseInfo.expreleaseDates[0] = releaseInfo.actualreleaseDates[0]
  for (var i = 1; i < noOfReleases; i++) {
    var nextRelease = daysElapsed
    releaseInfo.expreleaseDates[i] = releaseInfo.expreleaseDates[i - 1] + nextRelease
  }
}
// gets concatenate two arrays to get overlapint days

function releaseDetais (releaseInfo, i) {
  const day = 1000 * 60 * 60 * 24
  var releaser = (releaseInfo.releaser)[i]
  var releaseDate = new Date((releaseInfo.actualreleaseDates[i + 1]))
  var SprintLength = (releaseInfo.daysElapsed) / day

  document.getElementById('releaser').innerHTML = 'Released by:   ' + releaser
  document.getElementById('date').innerHTML = 'Released on:   ' + releaseDate
  document.getElementById('SprintLength').innerHTML = 'Sprint Length(days):   ' + SprintLength
}

const contributions = async () => {
  const res = await fetch(`https://api.github.com/repos/${orgName}/${repoName}/stats/contributors?access_token=${accessToken}`)
  const contributions = await res.json()
  // console.log(contributions)
  return {contributions}
}

const developerContributions = () => {
  var conName = []
  var contributorCommits = []
  var addPerWeek = []
  var weeks = []
  var data = []
  var conData = []
  contributions().then((res) => {
    const contributors = res.contributions

    console.log(contributors)
    console.log(contributors.length)
    var totalAdditions = []
    for (var i = 0; i < (contributors).length; i++) {
      conName[i] = contributors[i].author.login
      contributorCommits[i] = contributors[i].total
      for (var j = 0; j < (contributors[i].weeks).length; j++) {
        data[j] = {
          'Name': conName[i],
          'Week': new Date(contributors[i].weeks[j].w),
          'Aditions_per_Week': contributors[i].weeks[j].a
        }
      }
      conData[i] = JSON.parse(JSON.stringify(data))
    }
    genContributorTable(conData)
    console.log(conData)
  })
}

function genContributorTable (data) {
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
  tabulate(data, ['Name:', 'Week', 'Aditions_per_Week'])
}
