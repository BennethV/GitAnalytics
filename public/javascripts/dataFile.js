$(document).ready(function () {
  $('#sprints').click(function () {
    var tableInfor = document.getElementById('table_heading_template').innerHTML
    var template = Handlebars.compile(tableInfor)
    var info = template({
      title: 'Sprint Overview',
      description: 'The timeline shows the total sprints/releases for the overall project. Click the timeline to see contributions per release.'

    })
    // document.getElementById('pullReqNo').innerHTML =null;
    document.getElementById('theading').innerHTML = info
    d3.selectAll('table').remove()
    d3.selectAll('svg').remove()
    plotTimeline()
    if (grouptValidation) {
      stackedBarDirtyData(dirtyData, getNames(summary))
    }
    var cardInfor = document.getElementById('3cards_template').innerHTML
    template = Handlebars.compile(cardInfor)
    var sprintNumber = releaseInfo.actualreleaseDates.length - 1
    var infoCards = template({
      card3: 'Number Of Sprints',
      text3: sprintNumber,
      card2: 'Average Sprint Length',
      text2: SprintLength,
      card1: 'Start Date',
      text1: startDate
    })
    document.getElementById('cards').innerHTML = infoCards
    document.getElementById('frontOverview').innerHTML = null
    document.getElementById('3cards').innerHTML = null
    document.getElementById('body').style.backgroundColor = 'white'
    document.getElementById('dynamicBarGraph').innerHTML = null
    var sprintButton = document.getElementById('button_template').innerHTML
    document.getElementById('defaulView').innerHTML = sprintButton
    document.getElementById('popupDetail').innerHTML = null
    togglePopup()
    popTrack = 0
    return false
  })
  $('body').on('click', '#myBtn', function () {
    d3.selectAll('table').remove()
    d3.selectAll('svg').remove()
    plotTimeline()
    if (grouptValidation) {
      stackedBarDirtyData(dirtyData, getNames(summary))
    }
    dynamicBarData()
    togglePopup()
    popTrack = 0
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
var dirtyData = []
var popTrack = 0
var grouptValidation = true
// settingup the div for stackedgraphs

// fetches the release information from github
async function getReleases () {
  try {
    const res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/releases?access_token=${userInfo.accessToken}`)
    const rawReleaseInfo = await res.json()
    rawReleaseData = rawReleaseInfo
    getReleaseDates()
  } catch (err) { console.log(err) }
}
// Plotsthe timeline
function plotTimeline () {
  var day = 1000 * 60 * 60 * 24 // this gives a day in milliseconds
  var testData = cleanData()
  const width = 1300
  var height = 300
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
        if (popTrack === 0) {
          togglePopup()
        }
        popTrack++
        var devNames = getNames(summary)
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
    svg.append('text')
      .attr('x', (width / 2))
      .attr('y', 0 - (10 / 2))
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('text-decoration', 'Bold')
      .text('Timeline Of Sprints')
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
  var relInfo = JSON.parse(JSON.stringify(releaseInfo))
  releaseInfo = JSON.parse(JSON.stringify(getexpReleaseDates(relInfo)))

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
function getexpReleaseDates (currentReleaseInfo) {
  const day = 1000 * 60 * 60 * 24
  var daysElapsed = currentReleaseInfo.daysElapsed

  var noOfReleases = currentReleaseInfo.actualreleaseDates.length
  currentReleaseInfo.expreleaseDates[0] = currentReleaseInfo.actualreleaseDates[0]
  for (var i = 1; i < noOfReleases; i++) {
    var nextRelease = daysElapsed
    currentReleaseInfo.expreleaseDates[i] = currentReleaseInfo.expreleaseDates[i - 1] + nextRelease
  }
  SprintLength = (currentReleaseInfo.daysElapsed) / day
  return currentReleaseInfo
}
// Sorts the data for the table on release dates information
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

function plotBar (data, names, divName) {
  var margin = {top: 80, right: 160, bottom: 90, left: 100}
  var width = 550 - margin.left - margin.right
  var height = 310 - margin.top - margin.bottom

  var svg = d3.select('#' + divName)
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
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '-.55em')
    .attr('transform', 'rotate(-45)')

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
    .attr('transform', 'translate(' + (width / 2) + ' ,' + (height + 80) + ')')
    .style('text-anchor', 'middle')
    .text('Release Dates')
  svg.append('text')
    .attr('x', (width / 2))
    .attr('y', 0 - (margin.top / 2))
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .style('text-decoration', 'bold')
    .text('Filtered No. of Lines of Code Added vs Release Dates')
}

function stackedBarDirtyData (data, names) {
  d3.select('#individualTable').remove()
  d3.select('#individualBar').remove()
  d3.select('#cleanBar').remove()
  d3.select('#dirtyBar').remove()
  var margin = {top: 80, right: 160, bottom: 90, left: 100}
  var width = 550 - margin.left - margin.right, height = 310 - margin.top - margin.bottom

  var iDiv = document.createElement('div')
  iDiv.className = 'main'
  var innerDiv = document.createElement('div')
  innerDiv.className = 'row'

  var dirtyDiv = document.createElement('div')
  dirtyDiv.className = 'column'
  dirtyDiv.id = 'dirtyBar'
  // creating a div for the table

  var cleanDiv = document.createElement('div')
  cleanDiv.className = 'column'
  cleanDiv.id = 'cleanBar'

  innerDiv.appendChild(cleanDiv)
  innerDiv.appendChild(dirtyDiv)

  iDiv.appendChild(innerDiv)
  document.getElementsByTagName('body')[0].appendChild(iDiv)

  var svg = d3.select('#dirtyBar')
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
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '-.55em')
    .attr('transform', 'rotate(-45)')
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
    .attr('transform', 'translate(' + (width / 2) + ' ,' + (height + 80) + ')')
    .style('text-anchor', 'middle')
    .text('Release Dates')
  svg.append('text')
    .attr('x', (width / 2))
    .attr('y', 0 - (margin.top / 2))
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .style('text-decoration', 'bold')
    .text('Unfiltered No. of Lines of Code Added vs Release Dates')

  plotBar(contributionsPerSprint, getNames(summary), 'cleanBar')
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
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '-.55em')
    .attr('transform', 'rotate(-45)')

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
    .attr('transform', 'translate(' + (width / 2) + ' ,' + (height + 80) + ')')
    .style('text-anchor', 'middle')
    .text('Release Dates')
}

function colorFunction () {
  var colorArray = ['#e6beff', '#aa6e28', '#808080', '#008080', '#aa6e28', '#46f0f0', '#dd4477', '#66aa00', '#b82e2e', '#316395', '#994499', '#22aa99', '#aaaa11', '#6633cc', '#e67300', '#8b0707', '#651067', '#329262', '#5574a6', '#3b3eac']
  return colorArray
};

function pullDetails (currentPullInfo, currentSummary) {
  for (var i = 0; i < currentPullInfo.length; i++) {
    var additions = 0
    var deletions = 0
    var nodeAdds = 0
    var unfilteredAdds = 0
    var nodeDeletion = 0
    for (var j = 0; j < currentPullInfo[i].length; j++) {
      var filename = ((currentPullInfo[i])[j]).filename
      filename = filename.substring(0, 12)
      unfilteredAdds += ((currentPullInfo[i])[j]).additions
      if (filename !== 'node_modules') {
        additions += ((currentPullInfo[i])[j]).additions
        deletions += ((currentPullInfo[i])[j]).deletions
      } else {
        nodeAdds += ((currentPullInfo[i])[j]).additions
        nodeDeletion += ((currentPullInfo[i])[j]).deletions
      }
    };
    (currentSummary[i]).additions = additions;
    (currentSummary[i]).normal_Delitions = deletions;
    (currentSummary[i]).node_Additions = nodeAdds;
    (currentSummary[i]).node_Deletions = nodeDeletion;
    (currentSummary[i]).all_Additions = unfilteredAdds
  }
  return currentSummary
}

function stackeBarData () {
 releaseDates = releaseInfo.actualreleaseDates
  var data = []
  const names = getNames(summary)
  if (summary.length < releaseDates.length) {
    grouptValidation = false
  } else {
    for (var i = 0; i < releaseDates.length - 1; i++) {
      var obj = {}
      var obj2 = {}
      for (var j = 0; j < names.length; j++) {
        obj[names[j]] = 0
        obj2[names[j]] = 0
      }
      data[i] = obj
      dirtyData[i] = obj2
    }


    for (var i = 0; i < summary.length; i++) {
      var index = ((summary[i]).release_id - 1);

      (data[index])[(summary[i]).User] += (summary[i]).additions;
      (dirtyData[index])[(summary[i]).User] += (summary[i]).all_Additions
 
      var yr = releaseDates[((summary[i]).release_id)];

      (data[((summary[i]).release_id - 1)])['year'] = convertTimestamp(yr);
      (dirtyData[((summary[i]).release_id - 1)])['year'] = convertTimestamp(yr)
    }
    contributionsPerSprint = data

    return data
  }
}

function getNames (currentSummary) {
  var names = []
  for (var i = 0; i < currentSummary.length; i++) {
    names[i] = (currentSummary[i]).User
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
  d3.select('#cleanBar').remove()
  d3.select('#dirtyBar').remove()
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
    .attr('transform', 'rotate(-45)')
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
    .style('text-decoration', 'bold')
    .text('Filtered No. of line of code added vs release dates')
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

// When the user clicks on div, open the popup
/* function myFunction () {
  var popup = document.getElementById('lastTry')
  popup.classList.toggle('show')
}
*/
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
function togglePopup () {
  var popup = document.getElementById('myPopup')
  popup.classList.toggle('show')
}

function pullRequestOverviewTip () {
  var popup1 = document.getElementById('pullPop1')
  popup1.classList.toggle('show')
  var popup2 = document.getElementById('pullPop2')
  popup2.classList.toggle('show')
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
        var commitDate = (new Date(((branches[i].commitData[lastElement]).created_at).substring(0, 10))).getTime()
        var isShortLived = checkBranchLife(((summary[j]).release_id), commitDate)
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
