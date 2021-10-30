# Offhand Jaunt

## by Thomas U.

https://offhandjaunt.herokuapp.com/

A website built to help you explore. Offhand Jaunt provides a convient way to broden you horizons and see amazing parts of the world that you previously haven't thought of.
By using three points of data:

1. Your departure Airport.
2. Your departure Date.
3. Your Return Date.

An Algorithm takes these data points into consideration and returns a flight to a randomly chosen destination. Flight details and an image of the destination are returned to the user. Along with several buttons that allow the user to further refine their search results, share the flight, or actively watch the flight price for updates.

Sight Features Explained

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
   - Wathced flights can be updated to show if the price has gone up or down
   - Watched flights can be removed to no longer watch the flights.

4. Facebook Login

   - Rather than having user's create a new Offfhand Jaunt Profile, Offhand Jaunt uses Facebook login. This allows the user to login seamlessly without having to create a new account and remember yet another password.

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
2.  Upon receiveing a flight Logged In Users are given additional options.
3.  Logged in users can mark a flight as already visited and a new flight will be returned to them.
4.  Additionally Logged in user's can watch specific flights
5.  Logged In users have a viewable profile.
6.  This profile includes a list of Updateable / Removable watched flights that can be easily viewed by the user.
7.  This profile features a list of viewed / visited locations that can be reset by the user.
8.  This profile page includes the option to log out and return to a guest view.

API(s) used

1. Rapid API Skyscanner https://rapidapi.com/skyscanner/api/skyscanner-flight-search/details

- API used to retrieve flight data for users

2. Unsplash Image API https://unsplash.com/developers

- API used to retrieve photos for flight data

3. Facebook Login API https://developers.facebook.com/docs/facebook-login/

- API used to facilitate Facebook Login

Stack Used.
Backend

- Python
- PostgreSQL
- Flask

Front End

- JavaScript
- JQUERY
- AXIOS
- HTML
- BULMA
