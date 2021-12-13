if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const axios = require('axios')
const cron = require('node-cron');
const express = require('express')
const app = express()

//Construct our Authorization URL
const authorizationURL =  "https://webexapis.com/v1/authorize?"+
                          "client_id="+process.env.CLIENT_ID+
                          "&response_type=code"+
                          "&redirect_uri="+ encodeURIComponent(process.env.REDIRECT_URL)+
                          "&scope="+encodeURIComponent(process.env.SCOPES)
                          

//Store the access and refresh tokens here
let integrationAuthentication

//Homepage for integration, checks if authenicated or not
app.get('/', (req, res) => {
  if (integrationAuthentication == null){
    res.send('<a href="/oauth">Click here to authenticate with Webex</a>')
  } else {
    res.send('Integration Authenitcated')
  }
})

//OAuth 
app.get('/oauth', (req, res) => {
  console.log('Code: ' +req.query.code)
  if (integrationAuthentication == null){
    if (typeof(req.query.code) == 'undefined'){
      res.redirect(authorizationURL)
    } else {
      getAccessToken(req.query.code, res)
    }
  } else {
    res.redirect('/')
  }
})

//This function will get the initial access token
function getAccessToken(code, res){

  //Create a post to the token URL
  axios.post(process.env.TOKEN_URL, {
    grant_type: "authorization_code",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: code,
    redirect_uri: process.env.REDIRECT_URL
  })
  .then(function (response) {
    if (typeof(response.data.access_token) != 'undefined'){
      
      //Store the repsonse
      integrationAuthentication = response.data
    
      console.log(integrationAuthentication);

      //Create a scheduled job to refresh the access token daily
      cron.schedule('0 0 0 * * *', () => {
        refreshAccessToken()
        console.log('Freshing token');
      })
      
      res.redirect('/')

      /////////////////////////////////////
      ///// Call your integration code here
      /////////////////////////////////////
    }
  })

}

//This function will refresh the existing access token
function refreshAccessToken(){

  //Create a HTTP Port to the Token URL with the refresh token
  axios.post(process.env.TOKEN_URL, {
    grant_type: "refresh_token",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    refresh_token: integrationAuthentication.refresh_token
  })
  .then(function (response) {
    if(typeof(response.data.access_token) != 'undefined'){
      

      integrationAuthentication = response.data
    
      //console.log(integrationAuthentication)

    }
  })
}


app.listen(process.env.PORT, () => {
  console.log(`App listening at http://localhost:${process.env.PORT}`)
})