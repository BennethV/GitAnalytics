var accessToken = '47e1009b12f43faa9caa90179e1ede7cf7876909'

const getReleases = async () => {
  const result = await fetch(`https://api.github.com/repos/GitAnalytics2018/Group-9-Lab/releases`)
  const releases = await result.json()
  return {releases}
}
// draws the timeline
const dateOfRelease = () => {
  getReleases().then((res) => {
    // const releases = res.releases
    const releases = [{
      published_at: '2018-08-03T00:00:01Z',
      tag_name: 'v5.0'
    },
    {
      published_at: '2018-08-10T00:00:01Z',
      tag_name: 'v6.0'
    },
    {
      published_at: '2018-08-18T00:00:01Z',
      tag_name: 'v7.0'
    },
    {
      published_at: '2018-08-24T00:00:01Z',
      tag_name: 'v8.0'
    },
    {
      published_at: '2018-08-31T00:00:01Z',
      tag_name: 'v9.0'
    }]

    const releaseInfo = getReleaseDates(releases)
    var testData = cleanData(releaseInfo)

    var width = 1000
    var lastDate = (releaseInfo.releaseInfo.actualreleaseDates).length - 1

    function timelineRect () {
      var chart = d3.timeline()
        .beginning(releaseInfo.releaseInfo.actualreleaseDates[0]) // we can optionally add beginning and ending times to speed up rendering a little
        .ending(releaseInfo.releaseInfo.actualreleaseDates[lastDate])
        .showTimeAxisTick() // toggles tick marks
        .stack()
        .rotateTicks(45)
        .margin({left: 70, right: 30, top: 0, bottom: 0})

      var svg = d3.select('#timeline1').append('svg').attr('width', width)
        .datum(testData).call(chart)
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
    releaseDay: ''

  }
  for (var i = 0; i < releases.length; i++) {
    const date = new Date((releases[i].published_at))
    releaseInfo.actualreleaseDates[i] = date.getTime()

    releaseInfo.releaseTags[i] = releases[i].tag_name
    releaseInfo.releaseDays[i] = date.getDay()

    //
    if (i === 1) {
      releaseInfo.daysElapsed = noOfDays(releaseInfo.actualreleaseDates[i - 1], releaseInfo.actualreleaseDates[i])
      releaseInfo.releaseDay = date.getDay()
      console.log('releas day' + releaseInfo.releaseDay)
    }
  }
  console.log(releaseInfo.releaseDays)
  return {releaseInfo}
}

function noOfDays (date1, date2) {
  var diff = date2 - date1
  var days = 1000 * 60 * 60 * 24 // this gives a day in milliseconds
  var noDays = diff
  return noDays
}

function cleanData (data) {
  var releaseTime = []
  getexpReleaseDates(data.releaseInfo)

  const currentData = data.releaseInfo
  var allDates = arrayUnique(currentData.actualreleaseDates, currentData.expreleaseDates) // contains all expected and actual dates in order. itis used for ploting and finding overlaps

  var j = 0
  for (var i = 0; i < allDates.length; i++) {
    var startDate = parseInt(allDates[i - 1])
    var endDate = parseInt(allDates[i])
    var daysElapsed = parseInt(currentData.daysElapsed)
    // should be greater than zero because at zero comparison will be hard
    if ((i > 0) && (endDate - startDate) === daysElapsed) {
      releaseTime[i - 1] = {times: [{'color': 'green', 'label': currentData.releaseTags[j], 'starting_time': allDates[i - 1], 'ending_time': allDates[i]}] }
      j++
    } else if ((i > 0) && ((endDate - startDate) < daysElapsed) && (currentData.releaseDay !== currentData.releaseDays[i - 1])) {
      releaseTime[i - 1] = {times: [{'color': 'red', 'label': 'overlap', 'starting_time': allDates[i - 1], 'ending_time': allDates[i]}] }
    } else if ((i > 0) && ((endDate - startDate) < daysElapsed) && (currentData.releaseDay === currentData.releaseDays[i - 1])) {
      releaseTime[i - 1] = {times: [{'color': 'green', 'label': currentData.releaseTags[j], 'starting_time': allDates[i - 1], 'ending_time': allDates[i]}] }
      j++
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
function arrayUnique (actualDate, predictedDate) {
  var j = 0
  var dates = []
  for (var i = 0; i < actualDate.length; i++) {
    const actual = parseInt(actualDate[i])
    const predict = parseInt(predictedDate[i])
    if (actual === predict) {
      dates[j] = predict
      j++
    } else if ((actual !== predict) && (actual > predict)) {
      dates[j] = predict
      j++
      dates[j] = actual
      j++
    } else if ((actual !== predict) && (actual < predict)) {
      dates[j] = actual
      j++
      dates[j] = predict
      j++
    }
  }
  return dates
}
