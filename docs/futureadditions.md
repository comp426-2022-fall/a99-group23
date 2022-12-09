## Future Additions
At the moment, our application allows a user to select a common pantry item that they may have and want to use, and then presents them with a single recipe for inspiration. In the future, it would make sense for the application to:
* Allow the user to select multiple pantry items at the same time
* Generate multiple recipes for the user to select from
* Save recipes the user may want to use later
* Include more ingredients and recipes, overall
* Implemented a new page that would let a user view their user info.
    * We would have implemented this by creating a new API endpoint which accessed the data and displayed the user information on the screen.
    * app.post('/account-history', async (req, res) => { });
* Implemented a new page that would let a user update their user info.
    * We would have implemented this by creating a new API endpoint which accessed the user data and allowed the user to change their information.
    * app.post('/update', async (req, res) => { });
* Let user delete their account that they no longer need.
    * We would have implemented this by creating a new API endpoint which deleted the user data.
    * app.post('/delete-info', async (req, res) => { });
