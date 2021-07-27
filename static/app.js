const $form = $("form");
const $button = $("button");
const $body = $("body");
const $departure = $("#departure_date");
const $return = $("#return_date");
const URL = "https://127.0.0.1:5000";
// Features to add
// 1. viewed and visited*
// 2. filter viewed and visited*
// 3. watch flights
// 4. build City Name to IATA Code*
// 5. loading screen*
// 6. error*
// 7. convert iata_codes to .json

// LANDING PAGE / FORM
// sets the inital calendar values, min, and max calendar dates

$departure.val(generateDate());
$departure.attr("min", `${augmentDate(0, 0, 0)}`);
$departure.attr("max", `${augmentDate(1, 0, 0)}`);

$return.val(augmentDate());
$return.attr("min", `${augmentDate(0, 0, 1)}`);
$return.attr("max", `${augmentDate(1, 0, 5)}`);

// SET DATE

// validates date, ensures proper month/ year display
function properDate(yyyy, mm, dd) {
  const thirtyOne = [1, 3, 7, 8, 10, 12];
  if (mm === 2 && dd > 28) {
    dd = day - 28;
    mm++;
  } else if (thirtyOne.indexOf(mm) !== -1 && dd > 31) {
    if (mm === 12) {
      dd = dd - 31;
      mm = 1;
      yyyy++;
    } else {
      dd = dd - 31;
      mm++;
    }
  } else if (dd > 30) {
    dd = dd - 30;
    mm++;
  }
  if (dd < 10) {
    dd = `0${dd}`;
  }
  if (mm < 10) {
    mm = `0${mm}`;
  }
  return `${yyyy}-${mm}-${dd}`;
}

// takes a date and modifies it by default 5 days.
function augmentDate(y = 0, m = 0, d = 5) {
  const date =
    $departure.val() === undefined ? generateDate() : $departure.val();
  const dateArr = date.split("-").map((element) => parseInt(element));
  let yyyy, mm, dd;
  [yyyy, mm, dd] = dateArr;
  yyyy += y;
  mm += m;
  dd += d;
  return properDate(yyyy, mm, dd);
}

// generates todays date
function generateDate() {
  const today = new Date();
  let yyyy = parseInt(today.getFullYear());
  let mm = parseInt(today.getMonth() + 1);
  let dd = parseInt(today.getDate());

  return properDate(yyyy, mm, dd);
}

// intelligently augments the reuturn date based on the input departure date
// modifies the min for the reuturn date.
function smartDate() {
  $return.attr("min", `${augmentDate(0, 0, 1)}`);
  return $return.val(augmentDate());
}

$form.on("click", "#return_date", smartDate);

//  DISPLAY QUOTE

// retrieve image from api
async function getImage(str) {
  const response = await axios.post(`${URL}/image`, {
    data: str,
  });
  return response.data;
}

// displays the quote in html
async function displayQuote(obj) {
  $(".quote").html("");
  let destination = obj.flight.Places[0];

  if (obj.input.home === obj.flight.Places[0].IataCode) {
    destination = obj.flight.Places[1];
  }

  let viewed = `<h4>Sign in to Optimize Results</h4>`;

  if (obj.user !== "None") {
    viewed = `<form><button class="go viewed">I've Been There</button></form>`;
  }

  const image = await getImage(destination.CityName);
  const imageURL = image.results[0].urls.regular;
  clicked = true;
  return $(".quote").append(
    `<div class="quote">
        ${viewed}
        <h2 class="destination">${destination.CityName}</h2>
        <h3 class="country">${destination.CountryName}</h3>
        <h3 class="iata">${destination.IataCode}</h3>
        <img src="${imageURL}" alt="" />
        <h2 class="price">${obj.flight.Quotes[0].MinPrice}</h2>
        <h3 class="carrier">${obj.flight.Carriers[0].Name}</h3>
      </div>`
  );
}

// FLIGHT
// gets the flight info from the api
async function getFlight(userInput) {
  const response = await axios.post(`${URL}/flight`, {
    data: userInput,
  });
  return response.data;
}

// VALID QUOTE
// ensures that at least one(1) quote is returned from the api
async function validQuote(obj) {
  let response = await getFlight(obj);
  while (response.flight_data.Quotes.length < 1) {
    response = await getFlight(obj);
  }
  return { flight: response.flight_data, input: obj, user: response.user_data };
}

// VALIDATE FORM DATA
// verifies that the input is valid
function validIataCode(str) {
  // TODO HANDLE INVALID CODES
  return str.split("").length === 3;
}

// verifies date
function handleFormData() {
  const $departureAirport = $("#departure_airport");
  let homeAirport = $departureAirport.val().toUpperCase();
  $departureAirport.val(homeAirport);
  let inputDate = $("#departure_date").val();
  let anytime = $("input:checked").length;
  let inputReturnDate = anytime === 1 ? "anytime" : $("#return_date").val();
  if (validIataCode(homeAirport)) {
    return {
      home: homeAirport,
      start: inputDate,
      end: inputReturnDate,
    };
  }
  return error1("handleFormData");
}

// HANDLE SUBMIT
let clicked = true;

async function handleClick(evt) {
  evt.preventDefault();
  if (clicked === true) {
    clicked = false;
    data = handleFormData();
    const response = await validQuote(data);
    return displayQuote(response);
  }
}
$form.on("click", ".go", handleClick);

// BASIC ERROR
function error1(msg) {
  console.error(msg);
}

// USER PROFILE
