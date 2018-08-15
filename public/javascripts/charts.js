
  var pullCommits = []
  var pullReqInfor = []
  var commits = []
  var reviews = []
  var summary = []
  var pullRequestNo =[]
  var pullReview = []
  var contributorPullReq =[]
  var releases = []
  var closedPulls = []
  var devReleases = []
  var userInfo ={};

(async function(){
  await fetch('http://127.0.0.1:3000/javascripts/data.json')
  .then((res) => res.text())
  .then(async function (data) {
    userInfo = JSON.parse(data)
    console.log( userInfo )
    try {
        // User's details
        var count = 0;
          var res = await fetch(`https://api.github.com/user?access_token=${userInfo.accessToken}`)

          const userName = await res.json()
          userInfo.username = userName.login
         // console.log(userInfo.username)

          // repository pulls
          var res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/pulls?state=closed&access_token=${userInfo.accessToken}`)

          closedPulls = await res.json()
          console.log(closedPulls)
           res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/contributors?access_token=${userInfo.accessToken}`)

          const contributors = await res.json()
          // fetch release information
          res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/releases?access_token=${userInfo.accessToken}`)
          releases = getReleaseDateForPie( await res.json())

          // populate the object that stores the information per developer
          for (var i = contributors.length - 1; i >= 0; i--) {
            contributorPullReq[i]={
              'name': contributors[i].login,
              'pulls': 0
            } 
            var release =[]
            for (var k =0; k < releases.length ; k++) {
              release[k] ={
                'number':k+1,
                'pulls': 0
              }
            }

            devReleases[i]= {
              'name': contributors[i].login,
              'release': release
            }
          }
          // loop through closed pull requests
          console.log("Started fetching data")
          var g = 0
          for (var i = (closedPulls).length -1; i >=0; i--) {
            // commits per pull request
            var res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/pulls/${closedPulls[i].number}/commits?&access_token=${userInfo.accessToken}`)
            commits[i] = await res.json() 
            res = await fetch(`https://api.github.com/repos/${userInfo.organisation}/${userInfo.repository}/pulls/${closedPulls[i].number}/reviews?state=all&access_token=${userInfo.accessToken}`)
            reviews[i] = await res.json()
            // pull request number
            pullRequestNo[g]=  {
              'number':closedPulls[i].number,
              'by': closedPulls[i].user.login
            }

            // pull request per developer

            for (var n = contributorPullReq.length - 1; n >= 0; n--) {
              if(contributorPullReq[n].name == closedPulls[i].user.login){
                  contributorPullReq[n].pulls++
              }
            }
            var mergeDate = 0;
            if(closedPulls[i].merged_at != null){
              mergeDate = closedPulls[i].merged_at
            }
            else {
              mergeDate = closedPulls[i].closed_at
            }
            summary[g] ={
              "Pull Request": closedPulls[i].number,
              "User":  closedPulls[i].user.login,
              "Merge_Date":mergeDate,
              "Message": closedPulls[i].body
            }
            
            // pull request count per developer
            // an array of arrays of commits per pull request
            pullCommits[g] = []
            for (var j =  0; j < (commits[i]).length; ++j) {
             
            //  console.log( ((commits[i])[j]).commit.message)
                (pullCommits[g])[j]={
                  'Date': ((commits[i])[j]).commit.committer.date,
                  'Message': ((commits[i])[j]).commit.message
                } 
              
           
            }
            // if the code was reviewed
            if((reviews[i]).length != 0){

              for(var k = 0; k < (reviews[i]).length; ++k){
                pullReview[count]={
                  "Pull Request": closedPulls[i].number,
                  "Reviewer": ((reviews[i])[k]).user.login,
                  "Reviewee": closedPulls[i].user.login,
                  "Date": ((reviews[i])[k]).submitted_at,
                  "Status": ((reviews[i])[k]).state,
                  "Review Message": ((reviews[i])[k]).body
                }

                 count++
                 //console.log((reviews[i])[k].user.login)
              }
             
            }
            else{
              // if not reviewed
            }
            g++
          }
           console.log("Done fetching all the information")
           //console.log(pullReview)
           //console.log(contributorPullReq ) 
           //console.log(reviews)

        }
          //console.log(summary)
          //console.log(pullReview)

        catch (err) { console.log(err) }
  })
    return false; 
})()

// href functions
$(document).ready(function(){

  $('#overview').click(function(){
    console.log("It works!!")
    return false; 
  });
  $('#sprintsss').click(function(){
  // handlebar code
  var quoteInfo = document.getElementById("quote-template").innerHTML;

  var template = Handlebars.compile(quoteInfo);
  // 2b. Passing the array data
  var quoteData = template({
    name: "Sprints",
    quotes: [
      {quote: "If you don't know where you are going, you might wind up someplace else."},
      {quote: "You better cut the pizza in four pieces because I'm not hungry enough to eat six."},
      {quote: "I never said most of the things I said."},
      {quote: "Nobody goes there anymore because it's too crowded."}
    ]
  });
//end of handlebar code
  document.getElementById('quoteData').innerHTML = quoteData;
    return false; 
  });

  $('#pullOverview').click( async function(){
    var tableInfor = document.getElementById("table_heading_template").innerHTML;
    var template = Handlebars.compile(tableInfor);
    var info = template({
      title: "Pull Request Overview"
    })
   // document.getElementById('pullReqNo').innerHTML =null;
    document.getElementById('theading').innerHTML =info ;
    await genSummaryTable(summary)
    return false;
  });
 $('#pullreview').click(async function(){

    var tableInfor = document.getElementById("table_heading_template").innerHTML;
    var template = Handlebars.compile(tableInfor);
    var info = template({
      title: "Pull Request Reviews"
    })
   // document.getElementById('pullReqNo').innerHTML =null;
    document.getElementById('theading').innerHTML =info ;
    await genReviewTable(pullReview)

    return false; 
  });
  $('#pullCommits').click(async function(){
    var commitInfor = document.getElementById("commit_template").innerHTML;
    var template = Handlebars.compile(commitInfor);
    var info = template({
      pull: pullRequestNo
    })
     //document.getElementById('theading').innerHTML =null;
    //document.getElementById('pullReqNo').innerHTML =info ;
    await genPullCommitsTable(pullCommits)
    return false; 
  });
  $('#pullReqNo').on('click','#pullOption', function(){
    var self = $(this).closest("option");
    var selected = self.find("id").text();
      console.log("I am here baba")
     console.log(selected)
    })
  $('#pullPerDev').click(async function(){
     var tableInfor = document.getElementById("table_heading_template").innerHTML;
    var template = Handlebars.compile(tableInfor);
    var info = template({
      title: "Pull Request Per Developer"
    })
    //document.getElementById('pullReqNo').innerHTML =null;
    document.getElementById('theading').innerHTML =info ;
    await genPieChart(contributorPullReq)
    // generate release table
    var pullDates =[]
    //console.log(summary)
    var g =0
    // convert data into unix time stamp
    
    for (var i = 0; i < summary.length; i++) {

      var dummy = (summary[i]).Merge_Date
      if(dummy != null){

      const date = new Date((dummy).substring(0, 10))
      pullDates[g] = date.getTime();
      g++
     }
    }
    // convert all the dates into integers so that they can be compared
    pullDates.forEach(parseInt)
    releases.forEach(parseInt)
    var prev = 0
    for( var i =0; i < releases.length; i++ ){
      console.log("Release number : " + (i+1))
      console.log("Prev Date : " + prev + "Current Date : "+ releases[i])
      
      for( var j =0; j < pullDates.length; j++){

        
        if((pullDates[j] > prev) && (pullDates[j]<= releases[i])){
          console.log("we found a match for release : "+ (i+1))
          
          for(var k =0; k< devReleases.length; k++){
            if(devReleases[k].name == (summary[j]).User){
              //console.log("I found a matching name!! "+ devReleases[k].name)
              ((devReleases[k]).release[i]).pulls++
              console.log(((devReleases[k]).release[i]).pulls)
            }
          }
        }
        else{

        }
        
      }
      prev = releases[i]
    }

    console.log(devReleases)
    
    return false
  })
});
function genPieChart(data){
  // remove table
  d3.select('table').remove()
  d3.select('svg').remove()
  // var data = [
  //       { name: 'Male', percent: 40 },
  //       { name: 'Female', percent: 20 },
  //       { name: 'shemale', percent: 20 },
  //       { name: 'James', percent: 20 }
  //   ];

    var pie=d3.layout.pie()
            .value(function(d){return d.pulls})
            .sort(null);

    var w=400,h=400;

    var outerRadius=(w-2)/2;

    var color = d3.scale.category10()
     //.range(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c']);

    var arc=d3.svg.arc()
            .innerRadius(0)
            .outerRadius(outerRadius);

    var svg=d3.select("#figure")
            .append("svg")
            .attr({
                width:w,
                height:h,
                class:'shadow'
            }).append('g')
            .attr({
                transform:'translate('+w/2+','+h/2+')'
            });
    var path=svg.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr({
                d:arc,
                fill:function(d,i){
                    return color(i);
                }
            })
            .style({
                'fill-opacity':.15,
                stroke: function(d,i){
                    return color(i);
                },
                'stroke-width': '2px'
            });


    var text=svg.selectAll('text')
            .data(pie(data))
            .enter()
            .append("text")
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")";
            })

            .attr("text-anchor", "middle")
            .text(function(d){
                return d.data.name+" ("+d.data.pulls+")" ;
            })
            .style({
                fill:function(d,i){
                    return color(i);
                },
                'font-size':'18px',

            });
}
function genSummaryTable(data){
    function tabulate(data, columns) {
     d3.select('table').remove()
     d3.select('svg').remove()
    var table = d3.select('#summary').append('table')
    var thead = table.append('thead')
    var tbody = table.append('tbody');
    // append the header row
    thead.append('tr')
      .selectAll('th')
      .data(columns).enter()
      .append('th')
      .text(function (column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
      .data(data)
      .enter()
      .append('tr')


    // create a cell in each row for each column
    var cells = rows.selectAll('td')
      .data(function (row) {
        return columns.map(function (column) {
          return {column: column, value: row[column]};
        });
      })
      .enter()
      .append('td')
        .text(function (d) { return d.value; });

    return table;
    }


    // render the tables
    tabulate(data, ['Pull Request', 'User','Merge_Date', 'Message']); // 2 column table
}

function genReviewTable(data){
 
    function tabulate(data, columns) {
      d3.select('table').remove()
      d3.select('svg').remove()  
    var table = d3.select('#summary').append('table')
    var thead = table.append('thead')
    var tbody = table.append('tbody');
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
          return {column: column, value: row[column]};
        });
      })
      .enter()
      .append('td')
        .text(function (d) { return d.value; });

    return table;
    }


    // render the tables
    tabulate(data, ['Pull Request','Reviewer', 'Reviewee','Date', 'Status', 'Review Message']);
  
}
function genPullCommitsTable(stats){
  d3.select('table').remove()
  d3.select('svg').remove()
  for(var i =0; i < stats.length; ++i){
    var data = stats[i]
    
     function tabulate(data, columns) {
       
       
    var table = d3.select('#summary').append('table')
    var thead = table.append('thead')
    var tbody = table.append('tbody');

    // append the header row
    thead.append('tr')
      .selectAll('th')
      .data(columns).enter()
      .append('th')
        .text(function (column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
      .data(data)
      .enter()
      .append('tr');

    // create a cell in each row for each column
    var cells = rows.selectAll('td')
      .data(function (row) {
        return columns.map(function (column) {
          return {column: column, value: row[column]};
        });
      })
      .enter()
      .append('td')
        .text(function (d) { return d.value; });

    return table;
    }


    // render the tables
    tabulate(data, ['Date', 'Message']);
  
  }
}

// James code to be replaced:
function getReleaseDateForPie (releases) {
  var releaseInfo = {
    actualreleaseDates: []
  }
  var j = 0
  for (var i = releases.length - 1; i >= 0; i--) {
    const date = new Date((releases[i].published_at).substring(0, 10))
    releaseInfo.actualreleaseDates[j] = date.getTime();

    j++
  }
  // console.log(releaseInfo.releaser)
  return (releaseInfo).actualreleaseDates
}

