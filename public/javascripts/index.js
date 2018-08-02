var userDetails = {
  userName: 'no_name',
  name: 'null',
  totalPublicRepos: 0,
  dateCreated: '0000-00-00',
  userValidation: '',
  userInfoFound: false,
  userRepos: []
}

exports.searchUsername = function (data) {
  try {
    userDetails.userName = data.login
    userDetails.name = data.name
    userDetails.totalPublicRepos = data.public_repos
    userDetails.dateCreated = data.created_at
    userDetails.userValidation = data.message
    if (data.message !== 'Not Found') {
      userDetails.userInfoFound = true
    }

    // fetchRepos(data.repos_url)
  } catch (err) {
    console.log(err)
  }
}

exports.userDetails = function () {
  return userDetails
}
