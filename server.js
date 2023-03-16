if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const axios = require('axios')
const express = require('express')
const app = express();

app.use(express.json())
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'))

//Construct our Authorization URL
const authorizationURL = "https://webexapis.com/v1/authorize?" +
  "client_id=" + process.env.CLIENT_ID +
  "&response_type=code" +
  "&redirect_uri=" + encodeURIComponent(process.env.REDIRECT_URL) +
  "&scope=" + encodeURIComponent(process.env.SCOPES)


//Store the access and refresh tokens here
let integrationAuthentication

//Homepage for integration, checks if authenticated or not
app.get('/', (req, res) => {
  if (integrationAuthentication == null) {
    res.render(__dirname + '/public' + '/html' + '/home.html');
  } else {
    res.redirect('/refresh_token')
  }
})

//OAuth 
app.get('/oauth', (req, res) => {
  console.log('Code: ' + req.query.code)
  if (integrationAuthentication == null) {
    if (typeof (req.query.code) == 'undefined') {
      res.redirect(authorizationURL)
    } else {
      getAccessToken(req.query.code, res)
    }
  } else {
    res.redirect('/')
  }
})

app.post('/refresh_token', (req, res) => {
  const { refresh_token } = req.body;
  getRefreshAccessToken(refresh_token).then(({ data }) => {
    res.send(data)
  })
})

//This function will get the initial access token
function getAccessToken(code, res) {

  //Create a post to the token URL
  axios.post(process.env.TOKEN_URL, {
    grant_type: "authorization_code",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: code,
    redirect_uri: process.env.REDIRECT_URL
  })
    .then(function (response) {
      if (typeof (response.data.access_token) != 'undefined') {

        //Store the response
        integrationAuthentication = response.data

        res.redirect('/refresh_token')
      }
    })

}


//This function will refresh the existing access token
function getRefreshAccessToken(refresh_token) {

  //Create a HTTP Port to the Token URL with the refresh token
  return axios.post(process.env.TOKEN_URL, {
    grant_type: "refresh_token",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    refresh_token: refresh_token
  })
    .then(function (response) {
      if (typeof (response.data.access_token) != 'undefined') {
        return response;
      }
    })
}

// render the static page to view token details
app.get('/refresh_token', function (req, res) {
  if (integrationAuthentication) {
    const { access_token, expires_in, refresh_token, token_type, scope, refresh_token_expires_in } = integrationAuthentication;

    const access_token_expiration_date = new Date();
    access_token_expiration_date.setSeconds(access_token_expiration_date.getSeconds() + expires_in);

    const refresh_token_expiration_date = new Date();
    refresh_token_expiration_date.setSeconds(refresh_token_expiration_date.getSeconds() + refresh_token_expires_in);


    res.render(__dirname + '/public' + '/html' + '/refresh_token.html', {
      access_token,
      access_token_expiration_date: access_token_expiration_date.toLocaleString(),
      refresh_token_expiration_date: refresh_token_expiration_date.toLocaleString(),
      refresh_token,
      token_type,
      scope
    });
  } else {
    res.redirect('/');
  }
});

app.listen(process.env.PORT, () => {
  console.log(`App listening at http://localhost:${process.env.PORT}`)
})