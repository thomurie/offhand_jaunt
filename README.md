## Offhand Jaunt

Live site: https://offhandjaunt.herokuapp.com/

## SITE UNDER MATAINENCE

Offhand Jaunt uses the [Skyscanner API](https://rapidapi.com/skyscanner/api/skyscanner-flight-search) from [Rapid API](https://rapidapi.com/). Skyscanner announced an end of life for public use of the API. This site is currently under maintenance until an alternative API can be found and the application adapted to use this new API.

### Purpose, motivation and description:

A website built to help you explore. Offhand Jaunt provides a convenient way to broaden your horizons and see amazing parts of the world that you previously haven't thought of.
By using three points of data:

1. Your departure Airport.
2. Your departure Date.
3. Your Return Date.

An Algorithm takes these data points into consideration and returns a flight to a randomly chosen destination. All that's left is to book the flight and take the trip

### Data model:

Offhand Jaunt (OJ) uses a [PostgreSQL](https://www.postgresql.org/) relational database to store user and travel data. An argument can be made for a non relational database but ultimately a relational database is used. The specific reason being that there is very little data that needs to be stored. Flight data comes from the [Skyscanner API](https://rapidapi.com/skyscanner/api/skyscanner-flight-search), image data comes from the [Unsplash Image API](https://unsplash.com/developers) and authentication is handled by the [Facebook Login API](https://developers.facebook.com/docs/facebook-login/). The data we need to store is watched and previously seen flights. Because the amount of data being created, viewed, and updated is relatively small, vertical scalability is not seen as a negative for this particular web application.

Additionally PostgreSQL is extensible and expandable. As this application continues to grow and gain users the database will be able to scale with the growth. Additionally by coupling PostgreSQL with a Python backend we set up this data for use with Pandas.

Currently under development is a feature that uses Pandas to analyze a user's previously visited locations and recommend new locations. PostgreSQL will allow us to run complex queries and find the exact data and relationships we need in order to suggest locations to people more efficiently.

#### Please note this feature is still under development but will not be implemented till after we identify a new API.

Given a relational database is used. Data is stored in tables. These tables store the data by category. Associations between the tables and data are made with many to many and one to many relationships. These relationships create meaning and improve the users' experience. Allowing the user to find unique destinations and not view previously seen locations that may not have been of interest.

### API or routing design:

OJ is a site primarily focused around the finding of random trips or offhand jaunts. OJ uses multiple 3rd party APIs.

API(s) used

1. [Rapid API Skyscanner](https://rapidapi.com/skyscanner/api/skyscanner-flight-search/details)

- API used to retrieve flight data for users

2. [Unsplash Image API](https://unsplash.com/developers) is used to retrieve photos for flight data. After a user requests a random location and the location and flight data is received a photo is requested to accompany the flight details.

3. [Facebook Login API](https://developers.facebook.com/docs/facebook-login/) is used to facilitate Facebook Login. This login service allows users to login to OJ with their Facebook information rather than creating an account. Because such little data is collected and stored for these users, allowing a user to use an existing account on our site will make the user's experience better as the user is more likely to sign in to use an existing account.

To connect to and use these 3rd party APIs an API was built using [Flask](https://flask.palletsprojects.com/en/2.0.x/)

### Front-end:

Offjant Jaunt is built using [Flask](https://flask.palletsprojects.com/en/2.0.x/).

Flask was used for several reasons, primarily because Flask offers high scalability for simple applications, database integration is easy, and routing URL is easy. This web application is dependent on the server to obtain data from the server and 3rd party APIs. Flask simplified the development process by providing an easy to use framework that allows simple routes and database connections to be formed with very minimal configuration. Additionally the use of Flask allows us to manage user state. A logged in user can be stored and called upon whenever a call to the API is made.

### Additional Features:

Along with several buttons that allow the user to further refine their search results, share the flight, or actively watch the flight price for updates.

Site Features Explained

1. Share Flight

- Copies the flight information to the user's clipboard allowing the user to easily share the link with others.
- The copied link when visited will return the previously viewed flight to the user along with displaying the most current pricing for the flight.

2. I've Already Been There

- Allows the user to communicate to the site where they have already been.
- Clicking this button returns a new flight to the user using their previously input information.
- Viewed / Visited locations a re displayed in a list on the user's profile. Users have the option to reset this list to once again display the options to the user

3. Watch This Flight

- Allows user to Watch a flight to stay updated on if the pricing is going up or down
- Watched flights are shown on the user's profile
- Watched flights can be updated to show if the price has gone up or down
- Watched flights can be removed to no longer watch the flights.

4. Facebook Login

- Rather than having user's create a new Offhand Jaunt Profile, Offhand Jaunt uses Facebook login. This allows the user to login seamlessly without having to create a new account and remember yet another password.

User Flow:

A. Logged Out Users / Guest Users.

1. Guest users are greeted by a form along with instructions on how to use the sit.
2. The form prompts for three(3) pieces of data: your departure Airport, your departure Date, and your Return Date.
3. The user is then instructed to hit GO!
4. Go! returns a flight to a random location.
5. All Flight Data is returned to the Guest
6. An image of the destination is returned to the Guest user along with the option to share the site with others.
7. Login is not required but strongly suggested. The site features 3 different locations to login

B. Logged In Users.

1.  The logged in user's have the same basic user flow as Guest Users.
2.  Upon receiving a flight Logged In Users are given additional options.
3.  Logged in users can mark a flight as already visited and a new flight will be returned to them.
4.  Additionally Logged in user's can watch specific flights
5.  Logged In users have a viewable profile.
6.  This profile includes a list of Updateable / Removable watched flights that can be easily viewed by the user.
7.  This profile features a list of viewed / visited locations that can be reset by the user.
8.  This profile page includes the option to log out and return to a guest view.

### Styling:

Offjant Jaunt is styled using [BULMA](https://bulma.io/).

Bulma was used because it is a free, open source framework that provides ready-to-use frontend components that you can easily combine to build responsive web interfaces. Using this framework allowed me to build an app with reusable CSS components. Not having to design every single component on the application allowed me to focus on the user's experience. Bulma was chosen over other 3rd party CSS frameworks because it is easy to use, clean, and comparatively smaller than other commonly usd front end frameworks.

<!-- ### Testing: -->

### Deployment and next steps

Offhand Jaunt was deployed as one application using Heroku.

Heroku provides a number of additional features that make it ideal for hosting this project. The primary objective achieved by Offhand Jaunt was performance. Given these requirements Heroku provides an ideal environment where developers can deploy a high performing application without spending lots of money.

By using Heroku we are able to use the same GIT repository. So that as changes are made to the site the site can get updated almost instantaneously. This allows us to fix bugs and push new features to the site often with minimal time dedicated to publishing the site.
