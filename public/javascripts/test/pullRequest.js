var should = chai.should()
var expect = chai.expect
var assert = chai.assert

describe('Checks if pull request function can extract correct information', function () {
  var newSummary = []
  var dummyClosedPulls = []
  beforeEach(async function () {
    dummyClosedPulls = [
      {
        'number': 63,
        'state': 'closed',
        'locked': false,
        'title': 'Database docs added',
        'user': {
          'login': 'Vorapahct',
          'id': 30504774,
          'node_id': 'MDQ6VXNlcjMwNTA0Nzc0'
        },
        'body': 'According to the required documentation, the mLab login was added so that the database content can be viewed.',
        'created_at': '2018-05-17T19:34:49Z',
        'updated_at': '2018-05-18T06:31:45Z',
        'closed_at': '2018-05-18T06:31:45Z',
        'merged_at': '2018-05-18T06:31:45Z',
        'merge_commit_sha': '879b723d8b049c18278f86ff126a46ad0ce3759a',
        'head': {
          'label': 'witseie-elen4010:Database_docs_added',
          'ref': 'Database_docs_added'
        },
        'base': {
          'label': 'witseie-elen4010:master',
          'ref': 'master',
          'sha': '92afc9648437eafdc21e979fb0de9c2d886b15c3'
        }
      }
    ]
    newSummary = await pullRequestInfo(dummyClosedPulls)
  })

  it('should extract correct pull request number', function () {
    assert.equal(newSummary.Pull_Request, dummyClosedPulls.number)
  })
  it('should extract correct user login name', function () {
    assert.equal(newSummary.User, dummyClosedPulls.login)
  })
  it('should extract correct merge date', function () {
    assert.equal(newSummary[0].Merge_Date, dummyClosedPulls[0].merged_at)
  })
  it('should identify extract correct message', function () {
    assert.equal(newSummary[0].Message, dummyClosedPulls[0].body)
  })
  it('should identify extract correct branch name', function () {
    assert.equal(newSummary[0].Branch, dummyClosedPulls[0].head.ref)
  })
})

describe('Checks if TBD Score is calculated correctly', function () {
  let branchRepeat = []
  let branchArray = [
    {
      'name': 'AddCategoryFeatureSN',
      'commit': {
        'sha': '31463cd04634008c9cdac8f52ca5387ed7df0e84',
        'url': 'https://api.github.com/repos/witseie-elen4010/Group-6-Lab/commits/31463cd04634008c9cdac8f52ca5387ed7df0e84'
      }
    },
    {
      'name': 'AddDeleteFeatureKG',
      'commit': {
        'sha': 'ab1077d8e852664df02342f2564d49a4d4ba197b',
        'url': 'https://api.github.com/repos/witseie-elen4010/Group-6-Lab/commits/ab1077d8e852664df02342f2564d49a4d4ba197b'
      }
    }
  ]
  // an array of objects
  let reviewArray = [
  ]
  let numOfHealthyBuilds = 1
  let dummyClosedPulls = [
    {
      'number': 63,
      'state': 'closed',
      'locked': false,
      'title': 'Database docs added',
      'user': {
        'login': 'Vorapahct',
        'id': 30504774,
        'node_id': 'MDQ6VXNlcjMwNTA0Nzc0'
      },
      'body': 'According to the required documentation, the mLab login was added so that the database content can be viewed.',
      'created_at': '2018-05-17T19:34:49Z',
      'updated_at': '2018-05-18T06:31:45Z',
      'closed_at': '2018-05-18T06:31:45Z',
      'merged_at': '2018-05-18T06:31:45Z',
      'merge_commit_sha': '879b723d8b049c18278f86ff126a46ad0ce3759a',
      'head': {
        'label': 'witseie-elen4010:Database_docs_added',
        'ref': 'Database_docs_added'
      },
      'base': {
        'label': 'witseie-elen4010:master',
        'ref': 'master',
        'sha': '92afc9648437eafdc21e979fb0de9c2d886b15c3'
      }
    }
  ]
  let newSummary = pullRequestInfo(dummyClosedPulls)
  let score = tbdScore(branchRepeat, branchArray, newSummary, reviewArray, numOfHealthyBuilds)


  it('Should cap results at 100%', function () {
    let branchRepeat = []
    let branchArray = [
      {
        'name': 'master',
        'commit': {
          'sha': '31463cd04634008c9cdac8f52ca5387ed7df0e84',
          'url': 'https://api.github.com/repos/witseie-elen4010/Group-6-Lab/commits/31463cd04634008c9cdac8f52ca5387ed7df0e84'
        }
      },
      {
        'name': 'AddCategoryFeatureSN',
        'commit': {
          'sha': 'ab1077d8e852664df02342f2564d49a4d4ba197b',
          'url': 'https://api.github.com/repos/witseie-elen4010/Group-6-Lab/commits/ab1077d8e852664df02342f2564d49a4d4ba197b'
        }
      },
      {
        'name': 'AddDeleteFeatureKG',
        'commit': {
          'sha': 'ab1077d8e852664df02342f2564d49a4d4ba197b',
          'url': 'https://api.github.com/repos/witseie-elen4010/Group-6-Lab/commits/ab1077d8e852664df02342f2564d49a4d4ba197b'
        }
      }
    ]
    // an array of objects
    let reviewArray = [
      {
        'dummy': 'dummy'
      },
      {
        'dummy': 'dummy'
      }
    ]
    let numOfHealthyBuilds = 2

    let newSummary = [
      {
        'Branch': 'AddDeleteFeatureKG',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 1,
        'State': 'NOT_CONF',
        'Total_Commits': 2,
        'User': '1147279',
        'additions': 31,
        'all_Additions': 1913,
        'node_Additions': 1882,
        'node_Deletions': 0,
        'normal_Delitions': 0,
        'release_id': 1
      },
      {
        'Branch': 'CreateListFeatureDB',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 2,
        'State': 'NOT_CONF',
        'Total_Commits': 2,
        'User': '1147279',
        'additions': 31,
        'all_Additions': 1913,
        'node_Additions': 1882,
        'node_Deletions': 0,
        'normal_Delitions': 0,
        'release_id': 1
      }
    ]
    let expectedScore = 100.00
    let score = tbdScore(branchRepeat, branchArray, newSummary, reviewArray, numOfHealthyBuilds)
    assert.equal(score,expectedScore)
  })

  it('Should cap results at 80%', function () {
    let branchRepeat = [
      {
        'repeated': 2
      }
    ]
    let branchArray = [
      {
        'name': 'master'
      },
      {
        'name': '1'
      },
      {
        'name': '2'
      },
      {
        'name': '3'
      },
      {
        'name': '4'
      },
      {
        'name': '5'
      }
    ]
    // an array of objects
    let reviewArray = [
      {
        'dummy': 'dummy'
      },
      {
        'dummy': 'dummy'
      },
      {
        'dummy': 'dummy'
      },
      {
        'dummy': 'dummy'
      },
      {
        'dummy': 'dummy'
      }
    ]
    let numOfHealthyBuilds = 5

    let newSummary = [
      {
        'Branch': 'AddDeleteFeatureKG',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 1,

      },
      {
        'Branch': 'CreateListFeatureDB',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 2,

      },
      {
        'Branch': 'AddDeleteFeatureKG',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 3,

      },
      {
        'Branch': 'CreateListFeatureDB',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 5,

      },
      {
        'Branch': 'CreateListFeatureDB',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 5,

      }
    ]
    let expectedScore = 80.00
    let score = tbdScore(branchRepeat, branchArray, newSummary, reviewArray, numOfHealthyBuilds)
    assert.equal(score,expectedScore)
  })

  it('Should cap results at 60%', function () {
    let branchRepeat = [
      {
        'repeated': 3
      }
    ]
    let branchArray = [
      {
        'name': 'master'
      },
      {
        'name': '1'
      },
      {
        'name': '2'
      },
      {
        'name': '3'
      },
      {
        'name': '4'
      },
      {
        'name': '5'
      }
    ]
    // an array of objects
    let reviewArray = [
      {
        'dummy': '1'
      },
      {
        'dummy': '2'
      },
      {
        'dummy': '3'
      },
      {
        'dummy': '4'
      },
      {
        'dummy': '5'
      }
    ]
    let numOfHealthyBuilds = 5

    let newSummary = [
      {
        'Branch': 'AddDeleteFeatureKG',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 1

      },
      {
        'Branch': 'CreateListFeatureDB',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 2

      },
      {
        'Branch': 'AddDeleteFeatureKG',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 3

      },
      {
        'Branch': 'CreateListFeatureDB',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 5

      },
      {
        'Branch': 'CreateListFeatureDB',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 5

      }
    ]
    let expectedScore = 60.00
    let score = tbdScore(branchRepeat, branchArray, newSummary, reviewArray, numOfHealthyBuilds)
    assert.equal(score,expectedScore)
  })

  it('Should cap results at 40%', function () {
    let branchRepeat = [
      {
        'repeated': 4
      }
    ]
    let branchArray = [
      {
        'name': 'master'
      },
      {
        'name': '1'
      },
      {
        'name': '2'
      },
      {
        'name': '3'
      },
      {
        'name': '4'
      },
      {
        'name': '5'
      }
    ]
    // an array of objects
    let reviewArray = [
      {
        'dummy': '1'
      },
      {
        'dummy': '2'
      },
      {
        'dummy': '3'
      },
      {
        'dummy': '4'
      },
      {
        'dummy': '5'
      }
    ]
    let numOfHealthyBuilds = 5

    let newSummary = [
      {
        'Branch': 'AddDeleteFeatureKG',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 1

      },
      {
        'Branch': 'CreateListFeatureDB',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 2

      },
      {
        'Branch': 'AddDeleteFeatureKG',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 3

      },
      {
        'Branch': 'CreateListFeatureDB',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 5

      },
      {
        'Branch': 'CreateListFeatureDB',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 5

      }
    ]
    let expectedScore = 40.00
    let score = tbdScore(branchRepeat, branchArray, newSummary, reviewArray, numOfHealthyBuilds)
    assert.equal(score,expectedScore)
  })
 
  it('Should cap results at 20%', function () {
    let branchRepeat = [
      {
        'repeated': 5
      }
    ]
    let branchArray = [
      {
        'name': 'master'
      },
      {
        'name': '1'
      },
      {
        'name': '2'
      },
      {
        'name': '3'
      },
      {
        'name': '4'
      },
      {
        'name': '5'
      }
    ]
    // an array of objects
    let reviewArray = [
      {
        'dummy': 'dummy'
      },
      {
        'dummy': 'dummy'
      },
      {
        'dummy': 'dummy'
      },
      {
        'dummy': 'dummy'
      },
      {
        'dummy': 'dummy'
      }
    ]
    let numOfHealthyBuilds = 5

    let newSummary = [
      {
        'Branch': 'AddDeleteFeatureKG',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 1

      },
      {
        'Branch': 'CreateListFeatureDB',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 2

      },
      {
        'Branch': 'AddDeleteFeatureKG',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 3

      },
      {
        'Branch': 'CreateListFeatureDB',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 5

      },
      {
        'Branch': 'CreateListFeatureDB',
        'Merge_Date': '2018-04-25T21:05:44Z',
        'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
        'Pull_Request': 5

      }
    ]
    let expectedScore = 20.00
    let score = tbdScore(branchRepeat, branchArray, newSummary, reviewArray, numOfHealthyBuilds)
    assert.equal(score,expectedScore)
  })

 it('Zero healthy builds', function () {
  let branchRepeat = []
  let branchArray = [
    {
      'name': 'master',
      'commit': {
        'sha': '31463cd04634008c9cdac8f52ca5387ed7df0e84',
        'url': 'https://api.github.com/repos/witseie-elen4010/Group-6-Lab/commits/31463cd04634008c9cdac8f52ca5387ed7df0e84'
      }
    },
    {
      'name': 'AddCategoryFeatureSN',
      'commit': {
        'sha': 'ab1077d8e852664df02342f2564d49a4d4ba197b',
        'url': 'https://api.github.com/repos/witseie-elen4010/Group-6-Lab/commits/ab1077d8e852664df02342f2564d49a4d4ba197b'
      }
    },
    {
      'name': 'AddDeleteFeatureKG',
      'commit': {
        'sha': 'ab1077d8e852664df02342f2564d49a4d4ba197b',
        'url': 'https://api.github.com/repos/witseie-elen4010/Group-6-Lab/commits/ab1077d8e852664df02342f2564d49a4d4ba197b'
      }
    }
  ]
  // an array of objects
  let reviewArray = [
    {
      'dummy': 'dummy'
    },
    {
      'dummy': 'dummy'
    }
  ]
  let numOfHealthyBuilds = 0

  let newSummary = [
    {
      'Branch': 'AddDeleteFeatureKG',
      'Merge_Date': '2018-04-25T21:05:44Z',
      'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
      'Pull_Request': 1,
      'State': 'NOT_CONF',
      'Total_Commits': 2,
      'User': '1147279',
      'additions': 31,
      'all_Additions': 1913,
      'node_Additions': 1882,
      'node_Deletions': 0,
      'normal_Delitions': 0,
      'release_id': 1
    },
    {
      'Branch': 'CreateListFeatureDB',
      'Merge_Date': '2018-04-25T21:05:44Z',
      'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
      'Pull_Request': 2,
      'State': 'NOT_CONF',
      'Total_Commits': 2,
      'User': '1147279',
      'additions': 31,
      'all_Additions': 1913,
      'node_Additions': 1882,
      'node_Deletions': 0,
      'normal_Delitions': 0,
      'release_id': 1
    }
  ]
  let expectedScore = 66.67
  let score = tbdScore(branchRepeat, branchArray, newSummary, reviewArray, numOfHealthyBuilds)
  assert.equal(score,expectedScore)
})

it('Zero reviews in project', function () {
  let branchRepeat = []
  let branchArray = [
    {
      'name': 'master',
      'commit': {
        'sha': '31463cd04634008c9cdac8f52ca5387ed7df0e84',
        'url': 'https://api.github.com/repos/witseie-elen4010/Group-6-Lab/commits/31463cd04634008c9cdac8f52ca5387ed7df0e84'
      }
    },
    {
      'name': 'AddCategoryFeatureSN',
      'commit': {
        'sha': 'ab1077d8e852664df02342f2564d49a4d4ba197b',
        'url': 'https://api.github.com/repos/witseie-elen4010/Group-6-Lab/commits/ab1077d8e852664df02342f2564d49a4d4ba197b'
      }
    },
    {
      'name': 'AddDeleteFeatureKG',
      'commit': {
        'sha': 'ab1077d8e852664df02342f2564d49a4d4ba197b',
        'url': 'https://api.github.com/repos/witseie-elen4010/Group-6-Lab/commits/ab1077d8e852664df02342f2564d49a4d4ba197b'
      }
    }
  ]
  // an array of objects
  let reviewArray = [
  ]
  let numOfHealthyBuilds = 2

  let newSummary = [
    {
      'Branch': 'AddDeleteFeatureKG',
      'Merge_Date': '2018-04-25T21:05:44Z',
      'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
      'Pull_Request': 1,
      'State': 'NOT_CONF',
      'Total_Commits': 2,
      'User': '1147279',
      'additions': 31,
      'all_Additions': 1913,
      'node_Additions': 1882,
      'node_Deletions': 0,
      'normal_Delitions': 0,
      'release_id': 1
    },
    {
      'Branch': 'CreateListFeatureDB',
      'Merge_Date': '2018-04-25T21:05:44Z',
      'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
      'Pull_Request': 2,
      'State': 'NOT_CONF',
      'Total_Commits': 2,
      'User': '1147279',
      'additions': 31,
      'all_Additions': 1913,
      'node_Additions': 1882,
      'node_Deletions': 0,
      'normal_Delitions': 0,
      'release_id': 1
    }
  ]
  let expectedScore = 66.67
  let score = tbdScore(branchRepeat, branchArray, newSummary, reviewArray, numOfHealthyBuilds)
  assert.equal(score,expectedScore)
})

it('No branches were found', function () {
  let branchRepeat = []
  let branchArray = [
    {
      'name': 'master',
      'commit': {
        'sha': '31463cd04634008c9cdac8f52ca5387ed7df0e84',
        'url': 'https://api.github.com/repos/witseie-elen4010/Group-6-Lab/commits/31463cd04634008c9cdac8f52ca5387ed7df0e84'
      }
    }
  ]
  // an array of objects
  let reviewArray = [
    {
      'dummy': 'dummy'
    },
    {
      'dummy': 'dummy'
    }
  ]
  let numOfHealthyBuilds = 2

  let newSummary = [
    {
      'Branch': 'AddDeleteFeatureKG',
      'Merge_Date': '2018-04-25T21:05:44Z',
      'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
      'Pull_Request': 1,
      'State': 'NOT_CONF',
      'Total_Commits': 2,
      'User': '1147279',
      'additions': 31,
      'all_Additions': 1913,
      'node_Additions': 1882,
      'node_Deletions': 0,
      'normal_Delitions': 0,
      'release_id': 1
    },
    {
      'Branch': 'CreateListFeatureDB',
      'Merge_Date': '2018-04-25T21:05:44Z',
      'Message': 'Users can create a shopping list with no items in it. This functionality is tested and it passes.',
      'Pull_Request': 2,
      'State': 'NOT_CONF',
      'Total_Commits': 2,
      'User': '1147279',
      'additions': 31,
      'all_Additions': 1913,
      'node_Additions': 1882,
      'node_Deletions': 0,
      'normal_Delitions': 0,
      'release_id': 1
    }
  ]
  let expectedScore = 66.67
  let score = tbdScore(branchRepeat, branchArray, newSummary, reviewArray, numOfHealthyBuilds)
  assert.equal(score,expectedScore)
})


})
