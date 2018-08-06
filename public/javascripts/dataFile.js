window.onload = function () {
  var testData = [
    {times: [{'starting_time': 1533281401000, 'ending_time': 1533627001000}]},
    {times: [{'starting_time': 1533627001000, 'ending_time': 1533972601000}]},
    {times: [{'starting_time': 1533972601000, 'ending_time': 1534318201000}]},
    {times: [{'starting_time': 1534318201000, 'ending_time': 1534663801000}]}
  ]

  var width = 500
  function timelineRect () {
    var chart = d3.timeline()

    var svg = d3.select('#timeline1').append('svg').attr('width', width)
      .datum(testData).call(chart)
  }

  timelineRect()
}
