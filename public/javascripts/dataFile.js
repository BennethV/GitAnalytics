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
      published_at: '2018-08-03T07:30:01Z',
      tag_name: 'v5.0'
    },
    {
      published_at: '2018-08-10T07:30:01Z',
      tag_name: 'v5.0'
    },
    {
      published_at: '2018-08-17T07:30:01Z',
      tag_name: 'v5.0'
    }]

    const releaseInfo = getReleaseDates(releases)
    var testData = cleanData(releaseInfo)

    var width = 500
    function timelineRect () {
      var chart = d3.timeline()

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
    expreleaseDates: []
  }
  for (var i = 0; i < releases.length; i++) {
    const date = new Date((releases[i].published_at).substring(0, 10))
    releaseInfo.actualreleaseDates[i] = Math.ceil(date.getTime())
    releaseInfo.releaseTags[i] = releases[i].tag_name
    //
    if (i === 1) {
      releaseInfo.daysElapsed = noOfDays(releaseInfo.actualreleaseDates[i - 1], releaseInfo.actualreleaseDates[i])
    }
  }
  return {releaseInfo}
}

function noOfDays (date1, date2) {
  var diff = date2 - date1
  var days = 1000 * 60 * 60 * 24 // this gives a day in milliseconds
  var noDays = diff / days
  return noDays
}

function cleanData (data) {
  var releaseTime = []
  getexpReleaseDates(data.releaseInfo)

  const currentData = data.releaseInfo

  for (var i = 0; i < (currentData.actualreleaseDates).length; i++) {
    if (i > 0) {
      releaseTime[i - 1] = {times: [{'starting_time': currentData.actualreleaseDates[i - 1], 'ending_time': currentData.actualreleaseDates[i]}]}
    }
  }
  return releaseTime
}

function getexpReleaseDates (releaseInfo) {
  var days = 1000 * 60 * 60 * 24 // this gives a day in milliseconds
  var daysElapsed = releaseInfo.daysElapsed

  var noOfReleases = releaseInfo.actualreleaseDates.length

  releaseInfo.expreleaseDates[0] = releaseInfo.actualreleaseDates[0]
  for (var i = 1; i < noOfReleases; i++) {
    var nextRelease = days * daysElapsed
    releaseInfo.expreleaseDates[i] = releaseInfo.expreleaseDates[i - 1] + nextRelease
  }
}

function checkDays (currentDiff, firstDiff) {
  return currentDiff === firstDiff
}
