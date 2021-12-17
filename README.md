# Nodejs-Integration-Refresh

This is a Node.js example on how to generate an integrations access token for Cisco Webex and continually refresh it. This then allows you to use the access token to perform integration tasks against your Webex Org.

# Getting Started
First, you will need to create an app (create an integration) here:
https://developer.webex.com/my-apps

1. For most of the fields, like name, icon and description enter any values.

   a. For Redirect URI(s), enter: https://localhost:3000/oauth
      (or the url where you intend to deploy this code.  The app expects the url to end in ``/oauth``)

   b. For scopes, select only ``spark:all``
      (or the scopes you intend to use for your integration)
      If you do not select ``spark:all``, ``spark:people_read`` is required for this demo.

   c. Scroll to the bottom and click Add Integration.

# Running the Code
Requirements:
1. npm install
2. npm start

Environment Variables:
Please review the ``env.sample`` file and **edit the values to include the integration client_id and secret from the Getting Started step.**  If you used a different redirect_uri or scopes from the Getting Started step, then you'll need to edit those values here as well, or set them as environment variables via your preferred method. Then rename the ``env.sample`` to ``.env`` and run the app using ``npm start``
 


# About the App
Once the app is running...
1. Navigate to https://localhost:3000/oauth in your browser (your redirect_uri, which should end in oauth for this demo).
2. Sign into your integration with a valid Webex Teams account.<br>
   a. You will be redirected back to your local app server.<br>
3. You app will now refresh the token using a cron job everyday at midnight. You can always modify the code to use the time remaining for the access token expiry time to calculate the best time to refresh the toke for your Webex Org settings.

# Developer Info
1. In thea app.js file is a commented explanation about how to test the refresh right at app start.
2. This demo prints sensitive information like access tokens to the terminal.  This is not advised for a real application.
3. This demo stores tokens in app memory, which is not helpful if the application is restarted.  For this reason, a database would be recommended instead.
