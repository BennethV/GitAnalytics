$(document).ready(function () {
  $('#sprints').click(function () {
    var tableInfor = document.getElementById('table_heading_template').innerHTML
    var template = Handlebars.compile(tableInfor)
    var info = template({
      title: 'Timeline of Sprints'
    })
    // document.getElementById('pullReqNo').innerHTML =null;
    document.getElementById('theading').innerHTML = info
    dateOfRelease()
    return false
  })
})
// fetches the release information from github
const getReleases = async () => {
  try {
    await fetch('http://127.0.0.1:3000/javascripts/data.json')
      .then((res) => res.text())
      .then(async function (data) {
        userInfo = JSON.parse(data)
      })
    const result = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/releases?access_token=${userInfo.accessToken}`)
    const releases = await result.json()
    return {releases}
  } catch (err) { console.log(err) }
}
// draws the timeline
const dateOfRelease = () => {
  getReleases().then((res) => {
    const releases = res.releases

    const releaseInfo = getReleaseDates(releases)
    var day = 1000 * 60 * 60 * 24 // this gives a day in milliseconds
    var testData = cleanData(releaseInfo)

    const width = 1000
    var lastDate = (releaseInfo.releaseInfo.expreleaseDates).length - 1
    const SprintLength = releaseInfo.releaseInfo.daysElapsed / day
    var endDay = ''
    const actualLastDay = parseInt(releaseInfo.releaseInfo.actualreleaseDates[lastDate])
    const expLastDay = parseInt(releaseInfo.releaseInfo.expreleaseDates[lastDate])
    if (actualLastDay > expLastDay) {
      endDay = releaseInfo.releaseInfo.actualreleaseDates[lastDate]
    } else {
      endDay = releaseInfo.releaseInfo.expreleaseDates[lastDate]
    }
    developerContributions()
    var contributions = barData(releaseInfo.releaseInfo.actualreleaseDates)
    function timelineRect () {
      var chart = d3.timeline()
        // d3.select('#timeline1').remove()
        .beginning(releaseInfo.releaseInfo.actualreleaseDates[0]) // we can optionally add beginning and ending times to speed up rendering a little
        .ending(endDay)
        .showTimeAxisTick() // toggles tick marks
        .stack()
        .width(width)
        .rotateTicks(45)
        .tickFormat( //
          {format: d3.time.format('%Y-%m-%d'),
            tickTime: d3.time.day,
            tickInterval: 1, // SprintLength,
            tickSize: 6})
        .margin({left: 70, right: 30, top: 0, bottom: 0})
        .click(function (d, i, datum) {
          releaseDetais(releaseInfo.releaseInfo, i)
          var sprintBargraph = sprintBarData(getNames(), contributions, i)
          sprintBar(sprintBargraph)
        })
      d3.select('svg').remove()
      d3.select('table').remove()

      plotBar(contributions, getNames())
      var svg = d3.select('#timeline1').append('svg').attr('width', 1000).datum(testData).call(chart)
    }
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
    }
    if (i === 0 && releaseInfo.daysElapsed !== 0) {
      var startDate = releaseInfo.actualreleaseDates[0] - releaseInfo.daysElapsed;

      (releaseInfo.actualreleaseDates).unshift(startDate)
    }
    j++
  }

  return {releaseInfo}
}

// gets the difference between two dates
function noOfDays (date1, date2) {
  var diff = date2 - date1

  var noDays = diff
  return noDays
}

// modifies data to be in a supported formate for timeline plot
function cleanData (data) {
  var releaseTime = []

  getexpReleaseDates(data.releaseInfo)

  const currentData = data.releaseInfo
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
function getexpReleaseDates (releaseInfo) {
  // console.log(releaseInfo)
  var daysElapsed = releaseInfo.daysElapsed

  var noOfReleases = releaseInfo.actualreleaseDates.length

  releaseInfo.expreleaseDates[0] = releaseInfo.actualreleaseDates[0]
  for (var i = 1; i < noOfReleases; i++) {
    var nextRelease = daysElapsed
    releaseInfo.expreleaseDates[i] = releaseInfo.expreleaseDates[i - 1] + nextRelease
  }
}
// sends details to the html file
function releaseDetais (releaseInfo, i) {
  const day = 1000 * 60 * 60 * 24
  var releaser = (releaseInfo.releaser)[i]
  var releaseDate = new Date((releaseInfo.actualreleaseDates[i + 1]))
  var SprintLength = (releaseInfo.daysElapsed) / day

  const actualDates = releaseInfo.actualreleaseDates
  // convert to integers for comparison
  actualDates.forEach(parseInt)
  var clickedSprintLength = (actualDates[i + 1] - actualDates[i]) / day

  document.getElementById('clickedBar').innerHTML = 'Clicked Bar:   ' + releaseInfo.releaseTags[i]
  document.getElementById('releaser').innerHTML = 'Released by:   ' + releaser
  document.getElementById('date').innerHTML = 'Released on:   ' + releaseDate
  document.getElementById('SprintLength').innerHTML = 'average Sprint Length(days):   ' + SprintLength
  document.getElementById('clickedSprintLength').innerHTML = 'Clicked Sprint Length:   ' + clickedSprintLength
}
// fetches weekly contributions from GitHub
const contributions = async () => {
  const res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/stats/contributors?access_token=${userInfo.accessToken}`)
  const contributions = await res.json()
  return {contributions}
}
// filters the received data for ploting
const developerContributions = () => {
  var conName = []
  var contributorCommits = []
  var addPerWeek = []
  var weeks = []

  var data = []
  var conData = []
  contributions().then((res) => {
    const contributors = res.contributions

    var totalAdditions = []

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
        // s}
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
    // console.log(data)
    // console.log('Names')
    // console.log(conName)
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
  // console.log(data)
  console.log(names)
  console.log(data)
  var margin = {top: 80, right: 160, bottom: 100, left: 70}
  var width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom

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
  svg.append('text')
    .attr('x', (width / 2))
    .attr('y', 0 - (margin.top / 2))
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .style('text-decoration', 'underline')
    .text('Number of line of code added vs release dates')
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

const pullDetails = () => {
  getlinesPerPull().then((res) => {
    const pullInfo = res.pullInfo

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
  })
}

function barData (releaseDates) {
  console.log(releaseDates)
  var data = []
  const names = getNames()
  for (var i = 0; i < releaseDates.length - 1; i++) {
    var obj = {}
    for (var j = 0; j < names.length; j++) {
      obj[names[j]] = 0
    }
    data[i] = obj
    // console.log(data[i])
  }
  // console.log(data)

  // console.log(summary)

  for (var i = 0; i < summary.length; i++) {
    (data[((summary[i]).release_id - 1)])[(summary[i]).User] += (summary[i]).additions
    var yr = releaseDates[((summary[i]).release_id)];
    (data[((summary[i]).release_id - 1)])['year'] = convertTimestamp(yr)
  }
  // console.log(data)
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
function sprintBar (data) {
  var margin = {top: 20, right: 20, bottom: 70, left: 40},
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
  var svg = d3.select('#barGraph').append('svg')
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
    .attr('transform', 'rotate(-90)')

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 5)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('Frequency')

  // Add bar chart
  svg.selectAll('bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', function (d) { return x(d.name) })
    .attr('width', x.rangeBand())
    .attr('y', function (d) { return y(d.Freq) })
    .attr('height', function (d) { return height - y(d.Freq) })
}

function sprintBarData (names, contributions, index) {
  var cleanData = []
  for (var i = 0; i < names.length; i++) {
    cleanData[i] = {'name': names[i],
      'Freq': (contributions[index])[names[i]]
    }
  }

  return cleanData
}

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
*/
