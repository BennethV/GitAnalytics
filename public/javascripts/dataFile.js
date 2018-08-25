$(document).ready(function () {
  $('#sprints').click(function () {
    var tableInfor = document.getElementById('table_heading_template').innerHTML
    var template = Handlebars.compile(tableInfor)
    var info = template({
      title: 'Timeline of Sprints',
      description: 'The timeline shows the total sprints/releases for the overall project. Click the timeline to see contributions per release.'

    })
    // document.getElementById('pullReqNo').innerHTML =null;
    document.getElementById('theading').innerHTML = info
    d3.selectAll('table').remove()
    d3.selectAll('svg').remove()
    plotTimeline()

    plotBar(contributionsPerSprint, getNames())
    var cardInfor = document.getElementById('3cards_template').innerHTML
    var popUpInfo = document.getElementById('specialPopup').innerHTML
    template = Handlebars.compile(cardInfor)
    var sprintNumber = releaseInfo.actualreleaseDates.length - 1
    var infoCards = template({
      card3: 'Number Of Sprints',
      text3: sprintNumber,
      card2: 'Average Sprint Length',
      text2: sprintNumber,
      card1: 'Start Date',
      text1: startDate
    })
    document.getElementById('cards').innerHTML = infoCards
    document.getElementById('frontOverview').innerHTML = null
    document.getElementById('3cards').innerHTML = null
    document.getElementById('popUpContainer').innerHTML = popUpInfo
    document.getElementById('body').style.backgroundColor = 'white'
    document.getElementById('dynamicBarGraph').innerHTML = null
    var sprintButton = document.getElementById('button_template').innerHTML
    document.getElementById('defaulView').innerHTML = sprintButton
    togglePopUp()
    return false
  })
  $('body').on('click', '#myBtn', function () {
    d3.selectAll('table').remove()
    d3.selectAll('svg').remove()
    plotTimeline()
    plotBar(contributionsPerSprint, getNames())
    dynamicBarData()
    return false
  })
})
// declaring all variables that needs to be updated
var contributionsPerSprint = []
var rawReleaseData = []
var loginDetails = ''
var releaseInfo = {}
var branchNames = []
var branchLife = []
var SprintLength = ''
var startDate = ''
var graphState = []
// fetches the release information from github
async function getReleases () {
  try {
    const res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/releases?access_token=${userInfo.accessToken}`)
    const rawReleaseInfo = await res.json()
    rawReleaseData = rawReleaseInfo
    getReleaseDates()
  } catch (err) { console.log(err) }
}
/*
// draws the timeline
const dateOfRelease = () => {
  getReleases().then((res) => {

  //  cleanBranchInfo()
  })
}
*/

function plotTimeline () {
  var day = 1000 * 60 * 60 * 24 // this gives a day in milliseconds
  var testData = cleanData()
  const width = 850
  var height = 350
  var lastDate = (releaseInfo.expreleaseDates).length - 1
  var endDay = ''
  const actualLastDay = parseInt(releaseInfo.actualreleaseDates[lastDate])
  const expLastDay = parseInt(releaseInfo.expreleaseDates[lastDate])
  if (actualLastDay > expLastDay) {
    endDay = releaseInfo.actualreleaseDates[lastDate]
  } else {
    endDay = releaseInfo.expreleaseDates[lastDate]
  }

  function timelineRect () {
    var chart = d3.timeline()
      //
      .beginning(releaseInfo.actualreleaseDates[0]) // we can optionally add beginning and ending times to speed up rendering a little
      .ending(endDay)
      .showTimeAxisTick() // toggles tick marks
      .stack()
      .width(width)
      .height(height)
      .rotateTicks(45)
      .tickFormat( //
        {format: d3.time.format('%Y-%m-%d'),
          tickTime: d3.time.day,
          tickInterval: 1, // SprintLength,
          tickSize: 6})
      .margin({left: 0, right: 30, top: 0, bottom: 0})
      .click(function (d, i, datum) {
        const relDetails = releaseDetais(i)

        var devNames = getNames()
        var sprintBarInfo = sprintBarData(devNames, contributionsPerSprint, i)

        if ((sprintBarInfo.length !== 0)) {
          sprintBar(sprintBarInfo, relDetails, i)
          var num = releaseInfo.actualreleaseDates.length - 1
          for (var j = 0; j < num; j++) {
            if (i == j) {
              $('.timelineSeries_' + j).css('fill', 'blue')
            } else {
              $('.timelineSeries_' + j).css('fill', 'green')
            }
          }
        }
      })
    var svg = d3.select('#timeline1').append('svg').attr('width', width).datum(testData).call(chart)
  }
  timelineRect()
}
// gets the release dates and stores them
function getReleaseDates () {
  releaseInfo = {
    actualreleaseDates: [],
    releaseTags: [],
    daysElapsed: '',
    expreleaseDates: [],
    releaseDays: [],
    releaseDay: '',
    releaser: []
  }

  var j = 0
  for (var i = rawReleaseData.length - 1; i >= 0; i--) {
    var beginDate = ''
    const date = new Date((rawReleaseData[i].published_at).substring(0, 10))
    releaseInfo.actualreleaseDates[j] = date.getTime()
    releaseInfo.releaser[j] = rawReleaseData[i].author.login
    releaseInfo.releaseTags[j] = rawReleaseData[i].tag_name
    releaseInfo.releaseDays[j] = date.getDay()

    //
    if (j === 1) {
      releaseInfo.daysElapsed = noOfDays(releaseInfo.actualreleaseDates[j - 1], releaseInfo.actualreleaseDates[j])
      releaseInfo.releaseDay = date.getDay()
    }
    if (i === 0 && releaseInfo.daysElapsed !== 0) {
      beginDate = releaseInfo.actualreleaseDates[0] - releaseInfo.daysElapsed;

      (releaseInfo.actualreleaseDates).unshift(beginDate)
      startDate = convertTimestamp(beginDate)
    }
    j++
  }
}

// gets the difference between two dates
function noOfDays (date1, date2) {
  var diff = date2 - date1

  var noDays = diff
  return noDays
}

// modifies data to be in a supported formate for timeline plot
function cleanData () {
  var releaseTime = []
  getexpReleaseDates()

  const currentData = releaseInfo
  const actualDates = currentData.actualreleaseDates
  const expectedDates = currentData.expreleaseDates
  // convert to integers for comparison
  expectedDates.forEach(parseInt)
  actualDates.forEach(parseInt)

  for (var i = 1; i <= actualDates.length; i++) {
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

// gives the expected release Dates
function getexpReleaseDates () {
  const day = 1000 * 60 * 60 * 24
  var daysElapsed = releaseInfo.daysElapsed

  var noOfReleases = releaseInfo.actualreleaseDates.length

  releaseInfo.expreleaseDates[0] = releaseInfo.actualreleaseDates[0]
  for (var i = 1; i < noOfReleases; i++) {
    var nextRelease = daysElapsed
    releaseInfo.expreleaseDates[i] = releaseInfo.expreleaseDates[i - 1] + nextRelease
  }
  SprintLength = (releaseInfo.daysElapsed) / day
}
// sends details to the html file
function releaseDetais (i) {
  const day = 1000 * 60 * 60 * 24
  var releaser = (releaseInfo.releaser)[i]
  var releaseDate = convertTimestamp(releaseInfo.actualreleaseDates[i + 1])

  const actualDates = releaseInfo.actualreleaseDates
  // convert to integers for comparison
  actualDates.forEach(parseInt)
  var clickedSprintLength = (actualDates[i + 1] - actualDates[i]) / day

  var temp = ['Sprint', 'Released by', 'Released on', 'average Sprint Length(days)', 'Selected Sprint Length' ]
  var clickedSprintkeys = ['release Information', 'Details']
  var tempDetails = [releaseInfo.releaseTags[i], releaser, releaseDate, SprintLength, clickedSprintLength]

  var clickedSprintData = []
  for (var j = 0; j < tempDetails.length; j++) {
    clickedSprintData[j] = {'release Information': temp[j],
      'Details': tempDetails[j]
    }
  }
  var obj = {'data': clickedSprintData, 'columns': clickedSprintkeys}
  return obj
  // tabulateSprintInfo(clickedSprintData, clickedSprintkeys, div = '#summary')
}
// fetches weekly contributions from GitHub
const contributions = async () => {
  const res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/stats/contributors?access_token=${userInfo.accessToken}`)
  const weeklyContributions = await res.json()
  return {weeklyContributions}
}
// filters the received data for ploting
const developerContributions = () => {
  var conName = []
  var data = []

  contributions().then((res) => {
    const contributors = res.weeklyContributions

    for (var i = 0; i < ((contributors[0]).weeks).length; i++) {
      var k = 0 // this variable will be used to track number of contributors down there
      var obj = {}
      for (var j = 0; j < contributors.length; j++) {
        obj['year'] = convertTimestamp(((contributors[j]).weeks[i]).w)
        obj[contributors[j].author.login] = ((contributors[j]).weeks[i]).a
        // getting the list of all contributors
        if (i === 0) {
          conName[j] = contributors[j].author.login
        }
      }

      for (var n = 0; n < conName.length; n++) {
        if (obj[conName[n]] === 0) {
          k++
        }
      }
      if (k !== conName.length) {
        data[i] = obj
      }
    }
  })
}

// unix timestamp to current date
function convertTimestamp (timestamp) {
  var d = new Date(timestamp), // Convert the passed timestamp to milliseconds
    yyyy = d.getFullYear(),
    mm = ('0' + (d.getMonth() + 1)).slice(-2), // Months are zero based. Add leading 0.
    dd = ('0' + d.getDate()).slice(-2), // Add leading 0.
    hh = d.getHours(),
    h = hh,
    min = ('0' + d.getMinutes()).slice(-2), // Add leading 0.
    ampm = 'AM',
    time

  if (hh > 12) {
    h = hh - 12
    ampm = 'PM'
  } else if (hh === 12) {
    h = 12
    ampm = 'PM'
  } else if (hh == 0) {
    h = 12
  }

  // ie: 2013-02-18, 8:35 AM
  time = yyyy + '-' + mm + '-' + dd

  return time
}

// Ploting A Bar graph
/********************************************************************************/
// Setup svg using Bostock's margin convention

function plotBar (data, names) {
  var margin = {top: 80, right: 160, bottom: 50, left: 70}
  var width = 550 - margin.left - margin.right
  var height = 310 - margin.top - margin.bottom
  var iDiv = document.createElement('div')
  iDiv.className = 'main'
  // iDiv.id = 'stacked1'
  document.getElementsByTagName('body')[0].appendChild(iDiv)

  var svg = d3.select('#stacked1')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  /* Data in strings like it would be if imported from a csv */
  var parse = d3.time.format('%Y-%m-%d').parse
  // Transpose the data into layers
  var dataset = d3.layout.stack()(names.map(function (developer) {
    return data.map(function (d) {
      return {x: parse(d.year), y: +d[developer]}
    })
  }))

  // Set x, y and colors
  var x = d3.scale.ordinal()
    .domain(dataset[0].map(function (d) { return d.x }))
    .rangeRoundBands([10, width - 10], 0.02)

  var y = d3.scale.linear()
    .domain([0, d3.max(dataset, function (d) { return d3.max(d, function (d) { return d.y0 + d.y }) })])
    .range([height, 0])

  var colors = colorFunction()

  // var colors = ['b33040', '#d25c4d', '#f2b447', '#d9d574']

  // Define and draw axes
  var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .ticks(10)
    .tickSize(-width, 0, 0)
    .tickFormat(function (d) { return d })

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .tickFormat(d3.time.format('%Y-%m-%d'))

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  // Create groups for each series, rects for each segment
  var groups = svg.selectAll('g.cost')
    .data(dataset)
    .enter().append('g')
    .attr('class', 'cost')
    .style('fill', function (d, i) { return colors[i] })

  var rect = groups.selectAll('rect')
    .data(function (d) { return d })
    .enter()
    .append('rect')
    .attr('x', function (d) { return x(d.x) })
    .attr('y', function (d) {
      return y(d.y0 + d.y)
    })
    .attr('height', function (d) { return y(d.y0) - y(d.y0 + d.y) })
    .attr('width', x.rangeBand())
    .on('mouseover', function () { tooltip.style('display', null) })
    .on('mouseout', function () { tooltip.style('display', 'none') })
    .on('mousemove', function (d) {
      var xPosition = d3.mouse(this)[0] - 15
      var yPosition = d3.mouse(this)[1] - 25
      tooltip.attr('transform', 'translate(' + xPosition + ',' + yPosition + ')')
      tooltip.select('text').text(d.y)
    })

  // Draw legend
  var legend = svg.selectAll('.legend')
    .data(names)
    .enter().append('g')
    .attr('class', 'legend')
    .attr('transform', function (d, i) { return 'translate(30,' + i * 19 + ')' })

  legend.append('rect')
    .attr('x', width - 18)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', function (d, i) { return colors.slice()[i] })

  legend.append('text')
    .attr('x', width + 5)
    .attr('y', 9)
    .attr('dy', '.35em')
    .style('text-anchor', 'start')
    .text(function (d, i) {
      return names[i]
    })

  // Prep the tooltip bits, initial display is hidden
  var tooltip = svg.append('g')
    .attr('class', 'tooltip')
    .style('display', 'none')

  tooltip.append('rect')
    .attr('width', 30)
    .attr('height', 20)
    .attr('fill', 'white')
    .style('opacity', 0.5)

  tooltip.append('text')
    .attr('x', 15)
    .attr('dy', '1.2em')
    .style('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - (height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Number of lines added')
    // text label for the x axis
  svg.append('text')
    .attr('transform', 'translate(' + (width / 2) + ' ,' + (height + 20 + 20) + ')')
    .style('text-anchor', 'middle')
    .text('Release Dates')
  svg.append('text')
    .attr('x', (width / 2))
    .attr('y', 0 - (margin.top / 2))
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .style('text-decoration', 'underline')
    .text('Number of line of code added vs release dates')
}

// ploting for the overview page
function stackedBarOverview (data, names) {
  var margin = {top: 80, right: 160, bottom: 90, left: 70}
  var width = 550 - margin.left - margin.right
  var height = 350 - margin.top - margin.bottom

  var svg = d3.select('#barGraph')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  /* Data in strings like it would be if imported from a csv */
  var parse = d3.time.format('%Y-%m-%d').parse
  // Transpose the data into layers
  var dataset = d3.layout.stack()(names.map(function (developer) {
    return data.map(function (d) {
      return {x: parse(d.year), y: +d[developer]}
    })
  }))

  // Set x, y and colors
  var x = d3.scale.ordinal()
    .domain(dataset[0].map(function (d) { return d.x }))
    .rangeRoundBands([10, width - 10], 0.02)

  var y = d3.scale.linear()
    .domain([0, d3.max(dataset, function (d) { return d3.max(d, function (d) { return d.y0 + d.y }) })])
    .range([height, 0])

  var colors = colorFunction()
  // var colors = ['b33040', '#d25c4d', '#f2b447', '#d9d574']

  // Define and draw axes
  var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .ticks(10)
    .tickSize(-width, 0, 0)
    .tickFormat(function (d) { return d })

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .tickFormat(d3.time.format('%Y-%m-%d'))

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  // Create groups for each series, rects for each segment
  var groups = svg.selectAll('g.cost')
    .data(dataset)
    .enter().append('g')
    .attr('class', 'cost')
    .style('fill', function (d, i) { return colors[i] })

  var rect = groups.selectAll('rect')
    .data(function (d) { return d })
    .enter()
    .append('rect')
    .attr('x', function (d) { return x(d.x) })
    .attr('y', function (d) {
      return y(d.y0 + d.y)
    })
    .attr('height', function (d) { return y(d.y0) - y(d.y0 + d.y) })
    .attr('width', x.rangeBand())
    .on('mouseover', function () { tooltip.style('display', null) })
    .on('mouseout', function () { tooltip.style('display', 'none') })
    .on('mousemove', function (d) {
      var xPosition = d3.mouse(this)[0] - 15
      var yPosition = d3.mouse(this)[1] - 25
      tooltip.attr('transform', 'translate(' + xPosition + ',' + yPosition + ')')
      tooltip.select('text').text(d.y)
    })

  // Draw legend
  var legend = svg.selectAll('.legend')
    .data(names)
    .enter().append('g')
    .attr('class', 'legend')
    .attr('transform', function (d, i) { return 'translate(30,' + i * 19 + ')' })

  legend.append('rect')
    .attr('x', width - 18)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', function (d, i) { return colors.slice()[i] })

  legend.append('text')
    .attr('x', width + 5)
    .attr('y', 9)
    .attr('dy', '.35em')
    .style('text-anchor', 'start')
    .text(function (d, i) {
      return names[i]
    })

  // Prep the tooltip bits, initial display is hidden
  var tooltip = svg.append('g')
    .attr('class', 'tooltip')
    .style('display', 'none')

  tooltip.append('rect')
    .attr('width', 30)
    .attr('height', 20)
    .attr('fill', 'white')
    .style('opacity', 0.5)

  tooltip.append('text')
    .attr('x', 15)
    .attr('dy', '1.2em')
    .style('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - (height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Number of lines added')
    // text label for the x axis
  svg.append('text')
    .attr('transform', 'translate(' + (width / 2) + ' ,' + (height + margin.top + 20) + ')')
    .style('text-anchor', 'middle')
    .text('Release Dates')
}

function colorFunction () {
  var colorArray = ['#99E6E6', '#CC9999', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF']
  return colorArray
};
/*
const getlinesPerPull = async () => {
  var pullInfo = []
  for (var i = 0; i < summary.length; i++) {
    const pullNo = (summary[i]).Pull_Request
    const result = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/pulls/${pullNo}/files?state=closed&access_token=${userInfo.accessToken}`)
    const data = await result.json()
    pullInfo.push(data)
  }
  return {pullInfo}
}
*/
function pullDetails () {
  for (var i = 0; i < pullInfo.length; i++) {
    var additions = 0
    var deletions = 0
    var nodeAdds = 0
    var nodeDeletion = 0
    for (var j = 0; j < pullInfo[i].length; j++) {
      var filename = ((pullInfo[i])[j]).filename
      filename = filename.substring(0, 12)
      if (filename !== 'node_modules') {
        additions += ((pullInfo[i])[j]).additions
        deletions += ((pullInfo[i])[j]).deletions
      } else {
        nodeAdds += ((pullInfo[i])[j]).additions
        nodeDeletion += ((pullInfo[i])[j]).deletions
      }
    };
    (summary[i]).additions = additions;
    (summary[i]).normal_Delitions = deletions;
    (summary[i]).node_Additions = nodeAdds;
    (summary[i]).node_Deletions = nodeDeletion
  }

  stackeBarData()
}

function stackeBarData () {
  console.log('stacked bar data start')
  releaseDates = releaseInfo.actualreleaseDates
  var data = []
  const names = getNames()
  for (var i = 0; i < releaseDates.length - 1; i++) {
    var obj = {}
    for (var j = 0; j < names.length; j++) {
      obj[names[j]] = 0
    }
    data[i] = obj
  }

  for (var i = 0; i < summary.length; i++) {
    var index = ((summary[i]).release_id - 1);
    (data[index])[(summary[i]).User] += (summary[i]).additions
    var yr = releaseDates[((summary[i]).release_id)];
    (data[((summary[i]).release_id - 1)])['year'] = convertTimestamp(yr)
  }

  contributionsPerSprint = data

  console.log('stacked bar data end')
  return data
}

function getNames () {
  var names = []
  for (var i = 0; i < summary.length; i++) {
    names[i] = (summary[i]).User
  }
  names.removeDuplicates()
  return names
}

Array.prototype.removeDuplicates = function () {
  var input = this
  var hashObject = new Object()

  for (var i = input.length - 1; i >= 0; i--) {
    var currentItem = input[i]

    if (hashObject[currentItem] == true) {
      input.splice(i, 1)
    }

    hashObject[currentItem] = true
  }
  return input
}

// Plots bar graph for each sprint
function sprintBar (barData, tableData, i) {
  var data = barData
  d3.select('#individualTable').remove()
  d3.select('#individualBar').remove()
  var barId = 'individualBar'
  var tableId = 'individualTable'
  var iDiv = document.createElement('div')
  iDiv.className = 'main'
  var innerDiv = document.createElement('div')
  innerDiv.className = 'row'

  var barDiv = document.createElement('div')
  barDiv.className = 'column'
  barDiv.id = barId
  var list = document.getElementById('myList')
  // creating a div for the table

  var tableDiv = document.createElement('div')
  tableDiv.className = 'column'
  tableDiv.id = tableId

  innerDiv.appendChild(barDiv)
  innerDiv.appendChild(tableDiv)

  iDiv.appendChild(innerDiv)
  document.getElementsByTagName('body')[0].appendChild(iDiv)

  var margin = {top: 20, right: 20, bottom: 70, left: 70},
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom

  // set the ranges
  var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.05)

  var y = d3.scale.linear().range([height, 0])

  // define the axis
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .ticks(10)

  // add the SVG element

  var svg = d3.select('#individualBar').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform',
      'translate(' + margin.left + ',' + margin.top + ')')
  // scale the range of the data
  x.domain(data.map(function (d) { return d.Letter }))
  y.domain([0, d3.max(data, function (d) { return d.Freq })])

  // add axis
  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '-.55em')
    .attr('transform', 'rotate(-45)')

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - 50)
    .attr('x', 0 - (height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'end')
  //   tabulate()
  // Add bar chart

  svg.selectAll('bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', function (d) { return x(d.Letter) })
    .attr('width', x.rangeBand())
    .attr('y', function (d) { return y(d.Freq) })
    .attr('height', function (d) { return height - y(d.Freq) })

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - 60)
    .attr('x', 0 - (height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Number of lines added')
    // text label for the x axis
  svg.append('text')
    .attr('transform', 'translate(' + (width / 2) + ' ,' + (height + 40 + 20) + ')')
    .style('text-anchor', 'middle')
    .text('Release Dates')
  svg.append('text')
    .attr('x', (width / 2))
    .attr('y', 0 - (10 / 2))
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .style('text-decoration', 'underline')
    .text('Number of line of code added vs release dates')
  d3.selectAll('table').remove()
  tabulate(tableData.data, tableData.columns, div = tableDiv)
}

function sprintBarData (names, devContributions, index) {
  var cleanSprintData = []
  for (var i = 0; i < names.length; i++) {
    cleanSprintData[i] = {'Letter': names[i],
      'Freq': (devContributions[index])[names[i]]
    }
  }

  return cleanSprintData
}

function togglePopUp () {
  var popup = document.getElementById('popUpContainer')
  popup.classList.toggle('show')
}
// need to sort out the stats
function dynamicBarData () {
  // var trendData = ['Total Commits', 'Total Pull Request', 'Reviewed Pull Request', 'State', 'Commits On master', 'middleAge', 'retired']
  var dynamicGraphData = []
  var numberOfDates = []

  for (var i = 0; i < summary.length; i++) {
    numberOfDates[i] = ((summary[i].Merge_Date).substring(0, 10))
  }
  numberOfDates.removeDuplicates()
  for (var i = 0; i < numberOfDates.length; i++) {
    var overalCommits = 0
    var overallPullReq = 0
    var pullReviewCount = 0
    var buildStatus = 0 // will finish with this
    for (var j = 0; j < summary.length; j++) {
      if (numberOfDates[i] === (summary[j].Merge_Date.substring(0, 10))) {
        overalCommits += summary[j].Total_Commits
        overallPullReq++
      }
      if ((summary[j].State === 'success') && numberOfDates[i] === (summary[j].Merge_Date.substring(0, 10))) {
        buildStatus = 1
      }
    }
    for (var n = 0; n < pullReview.length; n++) {
      if (numberOfDates[i] === (pullReview[n].Date).substring(0, 10)) {
        pullReviewCount++
      }
    }
    var stats = [overalCommits, overallPullReq, pullReviewCount, buildStatus]
    dynamicGraphData[i] = { 'state': numberOfDates[i],
      'stats': stats }
  }

  return dynamicGraphData
}

/*
function getBranchLife () {
  for (var i = 0; i < branches.length; i++) {
    for (var j = 0; j < summary.length; j++) {
      if ((branches[i]).name === (summary[j]).Branch) {
        var lastElement = 0
        if (((branches[i]).commitData.length) !== 0) {
          lastElement = ((branches[i]).commitData.length) - 1
        }
        console.log(lastElement)
        console.log(((branches[i].commitData[lastElement]).created_at))
        var commitDate = (new Date(((branches[i].commitData[lastElement]).created_at).substring(0, 10))).getTime()
        var isShortLived = checkBranchLife(((summary[j]).release_id), commitDate)
        console.log(isShortLived)
        console.log(branches[i].commitData)
        break
      }
    }
  }
}

function checkBranchLife (releaseId, commitDate) {
  var prevRelease = parseInt(releaseInfo.actualreleaseDates[releaseId - 1])
  var convCommitDate = parseInt(commitDate)
  if (convCommitDate > prevRelease) {
    return true
  } else {
    return false
  }
}

// Duplicate

const getBranchInfo = async () => {
  const res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/branches?access_token=${userInfo.accessToken}`)
  const repoBranches = await res.json()
  return {repoBranches}
}
// filters the received data for ploting
const cleanBranchInfo = () => {
  getBranchInfo().then((res) => {
    const branches = res.repoBranches
    for (var i = 0; i < branches.length; i++) {
      branchNames.push((branches[i]).name)
    }
    console.log(branchNames)
  })
}
*/
/*
function makeObjects(){
  var data = []
  for (var i = 0; i < summary.length; i++){
   data[i] = { 'year' : summary[i].

   }
  }
}
*/
/*
// checking modulefiles
function isModules (name) {
  var filename = name.substring(0, 12)
  if (filename === 'node_modules') {
    return true
  } else { return false }
}
Important link
https://api.github.com/repos/witseie-elen4010/Group-4-Lab/commits?per_page=100&sha=06b15544a5cda4eadb6b7bb79cfd6dd09e520675&access_token=95082475007363f3e3d7a9352b9a408fc934f762
*/
