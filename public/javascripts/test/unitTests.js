var should = chai.should()
var expect = chai.expect
var assert = chai.assert
// testing if the function returns the correct data

describe('Calculates the expected release date for ploting thetimeline', function () {
  it('should retun true if the expected date array size is equal to the actual dates array size', function (done) {
  	releaseInformation = {
    actualreleaseDates: [11534809600,535155200,1535500800,1535846400],
    daysElapsed: 345600,
    expreleaseDates: []
  }
    var numberOfDates = getexpReleaseDates (releaseInformation).expreleaseDates.length
   	var ActualNumberOfDays = releaseInformation.actualreleaseDates.length
   	expect(numberOfDates).to.equal(ActualNumberOfDays)
    done()
  })
})

describe('converts Unix timesamp to normal date', function () {
  it('should return true if the date is correctly converted', function (done) { 	
    var testDate = 1534809600000
    var convertedDate = convertTimestamp (testDate)
    expect(convertedDate).to.equal('2018-08-21')
    done()
  })
})

describe('Creates the same new object in all browsers', function () {
  it('should have equal dates if the created object is correct', function (done) { 	
    var testDate = (new Date('2018-08-21')).getTime()
    var testUnixDate = 1534809600000
    expect(testUnixDate).to.equal(testDate)
    done()
  })
})


describe('Returns correct number of lines added', function () {
  it('Should return true is the value of normal additions is returned as expected', function (done) { 	
	testSummary = [{additions: '',
              normal_Delitions: '',
              node_Additions: '',
              node_Deletions: '',
              all_Additions: '',
              User: "Test User",
              release_id: 1
            }] 
    var pullinformaion = [[{additions:7,
						deletions:3,
						filename:"config/database.js"},
						{additions:4,
						deletions:2,
						filename:"config/database.js"},
						{additions:1,
						deletions:7,
						filename:"config/database.js"}]]
	testSummary = pullDetails (pullinformaion, testSummary)
	assert.equal((testSummary[0]).additions, 12)
	assert.equal((testSummary[0]).node_Additions, 0)
    done()
  })
})

describe('Returns correct number of lines From Node modules', function () {
  it('Should return true is the value of the nole additions is returned as expected', function (done) { 	
	testSummary = [{additions: '',
              normal_Delitions: '',
              node_Additions: '',
              node_Deletions: '',
              all_Additions: '',
              User: "Test User",
              release_id: 1
            }] 
    var pullinformaion = [[{additions:7,
						deletions:3,
						filename:"node_modules/database.js"},
						{additions:4,
						deletions:2,
						filename:"node_modules/database.js"},
						{additions:7,
						deletions:9,
						filename:"config/database.js"}]]
						//console.log(pullinformaion)
	testSummary = pullDetails (pullinformaion, testSummary)
	//console.log(testSummary)
	assert.equal((testSummary[0]).additions, 7)
	assert.equal((testSummary[0]).node_Additions, 11)
    done()
  })
})


describe('Returns correc4 number of collaborators', function () {
  it('Should return true is the value of the nole additions is returned as expected', function (done) { 	
	testSummary = [{User: "Test User 1"}, {User: "Test User 2"},
             		{User: "Test User 3"},{User: "Test User 4"}] 		
    expect(getNames(testSummary).length).to.equal(4)
    done()
  })
})

describe('Duplicate Names of collaborators are correctly returned', function () {
  it('Should return true if the repeated collaborators are removed', function (done) { 	
	testSummary = [{User: "Test User 1"}, {User: "Test User 2"},
             		{User: "Test User 2"},{User: "Test User 1"}] 		
    expect(getNames(testSummary).length).to.equal(2)
    done()
  })
})