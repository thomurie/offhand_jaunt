// CONFIG
const URL = "http://127.0.0.1:5000";
let iataCodes;

// INDEX.HTML ELEMENTS
const $prompt = $("#prompt");
const $departureIata = $("#departure_iata");
const $departureIataMsg = $("#departure_iata_msg");
const $departureDate = $("#departure_date");
const $departureDateMsg = $("#departure_date_msg");
const $returnDate = $("#return_date");
const $returnDateMsg = $("#return_date_msg");

const $form = $("#inputdata");
const $button = $("button");
const $quote = $("#quote");

const $departure = $("#departure_date");
const $return = $("#returnDate");
const $section = $("#header");
const $watched = $("#watched");

// QUOTE
const $homeCity = $("#home_city");
const $homeIata = $("#home_iata");
const $homeCountry = $("#home_country");
const $startDate = $("#start_date");
const $destCity = $("#dest_city");
const $destIata = $("#dest_iata");
const $destCountry = $("#dest_country");
const $endDate = $("#end_date");
const $price = $("#price");
const $carrier = $("#carrier");
const $buttons = $("#buttons");

let userFlightData = null;

// make API call to obtain iata_code.json information, assign to iataCodes.
(async () => {
  const { data } = await axios.get(`${URL}/request/iata`);
  iataCodes = data;
})();

/**
 * User Flow
 * page loads, a form appears.
 * the form requires a departure date, set by default today's date.
 * the form requires a return date, set by default 5 days from today's date.
 *
 * The user inputs there departure IATA code
 * The user hits submit
 * On sumbit the iata code is validated.
 * if the iata code is valid a random generation is generated
 * a flight to the destination is generated
 * the user is reqirected to a flight page
 * the flight data is displayed
 * a photo of the destination is displayed
 */

const INTIAL_FLIGHT = {
  img: { url: "", info: "" },
  departure: {
    iata: "",
    name: "",
    country: "",
  },
  destination: {
    iata: "",
    name: "",
    country: "",
  },
  date: {
    start: "",
    end: "",
  },
  flight: {
    price: "",
    carrier: "",
  },
};

const user = "";

let FLIGHT;

// LANDING PAGE
/**
 * On page load setDates and its helper functions update the displayed dates to display today's date
 * On departure date change the return date is automatically set to a future date
 *
 * On submit the IATA code is validated, the departure date is validated, and the return date is validated.
 * If the data is valid, a POST request is made to the API requesting a random flight
 * If the request is successful the user is redirected to the Flight Info page.
 */

// LANDING PAGE / ON PAGE LOAD
// LANDING PAGE / ON PAGE LOAD / Helper function - validates proper date, ensures consistant day, month, year display.
function properDate(yyyy, mm, dd) {
  if (dd > 31) {
    mm++;
    dd = dd - 31;
  }
  if (mm > 12) {
    yyyy++;
    mm = mm - 12;
  }
  const thirtyOne = [1, 3, 7, 8, 10, 12];
  if (mm === 2 && dd > 28) {
    dd = dd - 28;
    mm++;
  } else if (thirtyOne.indexOf(mm) !== -1 && dd > 31) {
    dd = dd - 31;
    if (mm === 12) {
      mm = 1;
      yyyy++;
    } else {
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

// LANDING PAGE / ON PAGE LOAD / Helper function - generates today's date.
function generateDate() {
  const today = new Date();
  let yyyy = parseInt(today.getFullYear());
  let mm = parseInt(today.getMonth() + 1);
  let dd = parseInt(today.getDate());

  return properDate(yyyy, mm, dd);
}

// LANDING PAGE / ON PAGE LOAD / Helper function - takes a date and modifies it by d (default 5) days.
function augmentDate(y = 0, m = 0, d = 5) {
  const date =
    $departureDate.val() === undefined ? generateDate() : $departureDate.val();
  const dateArr = date.split("-").map((element) => parseInt(element));
  let yyyy, mm, dd;
  [yyyy, mm, dd] = dateArr;
  yyyy += y;
  mm += m;
  dd += d;
  return properDate(yyyy, mm, dd);
}

// LANDING PAGE / ON PAGE LOAD / Primary function - Sets the departure and return dates. Updates min, max calendar dates.
function setDates() {
  $departureDate.val(generateDate());
  $departureDate.attr("min", `${augmentDate(0, 0, 0)}`);
  $departureDate.attr("max", `${augmentDate(0, 6, 0)}`);

  $returnDate.val(augmentDate());
  $returnDate.attr("min", `${augmentDate(0, 0, 1)}`);
  $returnDate.attr("max", `${augmentDate(0, 6, 5)}`);
}

// LANDING PAGE / ON PAGE LOAD / Fires setDates function in order to display current dates.
setDates();

// LANDING PAGE / ON FORM CHANGE
// LANDING PAGE / ON FORM CHANGE / Error Handler - Verifies that return date is in the future.
function smartDate() {
  today = generateDate().split("-").join("");
  inputDeparture = +$departureDate.val().split("-").join("");
  inputReturn = +$returnDate.val().split("-").join("");

  if (inputDeparture < today) {
    // Departure Date cannot be in past
    $departureDate.removeClass("is-success");
    $departureDate.addClass("is-danger");
    $departureDateMsg.removeClass("is-success");
    $departureDateMsg.addClass("is-danger");
    $departureDateMsg.text("Departure date must be after today's date");
    return false;
  } else {
    $departureDate.removeClass("is-danger");
    $departureDate.addClass("is-success");
    $departureDateMsg.removeClass("is-danger");
    $departureDateMsg.addClass("is-success");
    $departureDateMsg.text("Valid Date");
  }

  if (inputDeparture > inputReturn) {
    // Return date is before Departure date
    $returnDate.removeClass("is-success");
    $returnDate.addClass("is-danger");
    $returnDateMsg.removeClass("is-success");
    $returnDateMsg.addClass("is-danger");
    $returnDateMsg.text("Return date must be after Departure date");
    return false;
  } else {
    $returnDate.removeClass("is-danger");
    $returnDate.addClass("is-success");
    $returnDateMsg.removeClass("is-danger");
    $returnDateMsg.addClass("is-success");
    $returnDateMsg.text("Valid Date");
  }

  FLIGHT.date.start = $departureDate.val();
  FLIGHT.date.end = $returnDate.val();

  return true;
}

// LANDING PAGE / ON FORM SUBMIT /
/**
 * TODO
 * If invalid, display error message
 * If valid handle sumbit, make request to API
 */
// LANDING PAGE / ON FORM SUBMIT / Helper function - Validates input Iata Code is valid
function validateIataCode() {
  let iata = $departureIata.val().toUpperCase();
  let airport = iataCodes[iata];
  // verify iata code length is 3 &  verifty that iata code is in iataCodes
  if (iata.length === 3 && airport) {
    FLIGHT.departure.iata = iata;
    FLIGHT.departure.name = airport;
    $departureIata.removeClass("is-danger");
    $departureIata.addClass("is-success");

    $departureIataMsg.removeClass("is-danger");
    $departureIataMsg.addClass("is-success");
    $departureIataMsg.text(
      `Valid IATA Code for ${airport} International Airport`
    );
    return true;
  }
  $departureIata.removeClass("is-success");
  $departureIata.addClass("is-danger");

  $departureIataMsg.removeClass("is-success");
  $departureIataMsg.addClass("is-danger");
  $departureIataMsg.text("Invalid IATA Code");
  return false;
}

// LANDING PAGE / ON FORM SUBMIT / Helper function - makes call to API using user input data.
async function generateFlight(flightData) {
  const { data } = await axios.post(`${URL}/request/flight`, {
    data: flightData,
  });

  if (data.error.status) {
    $prompt.text(data.error.msg);
    $("#go").toggleClass("is-loading");
    $prompt.css("color", "red");
    return;
  }

  return window.location.replace(
    `${URL}/flight/${data.departure.iata}/${data.destination.iata}/${data.date.start}/${data.date.end}/`
  );
}

// LANDING PAGE / ON FORM SUBMIT / Event handler - handles submit, makes API call on success, returns error message on failure
function handleSubmit(e) {
  e.preventDefault();
  $("#go").toggleClass("is-loading");
  $prompt.css("color", "black");
  FLIGHT = Object.assign({}, INTIAL_FLIGHT);

  if (validateIataCode() && smartDate()) {
    $prompt.text("Searching...");
    return generateFlight(FLIGHT);
  }
  $("#go").toggleClass("is-loading");
  return $prompt.text("An unexpected error occured. Please try again.");
}

// LANDING PAGE / ON FORM SUBMIT / Event handler
$form.on("click", "#go", handleSubmit);

//  DISPLAY FLIGHT DATA
// retrieve image from api
async function getImage(str) {
  const response = await axios.post(`${URL}/image`, {
    data: str,
  });
  return response.data;
}

// displays the quote in html
async function displayQuote(obj) {
  // $quote.html("");
  // let destination =
  //   obj.input.home === obj.flight.Places[0].IataCode
  //     ? obj.flight.Places[1]
  //     : obj.flight.Places[0];

  // let home =
  //   obj.input.home === obj.flight.Places[0].IataCode
  //     ? obj.flight.Places[0]
  //     : obj.flight.Places[1];

  let viewed = `disabled`;
  let watched = `disabled`;
  let loggedOut = `<a href="${URL}/fb-login" class="button is-primary is-fullwidth mb-3">Login to Optimize Result</a>`;

  if (FLIGHT.user.name !== "Guest") {
    viewed = ``;
    watched = ``;
    loggedOut = ``;
  }

  // const image = await getImage(destination.CityName);
  // const using_image = image.results[3];
  // $section.css("background-image", `url('${using_image.urls.regular}')`);
  $section.css("background-image", `url('${FLIGHT.img.url}')`);

  // OLD WAY
  // $homeCity.text(home.CityName);
  // $homeIata.html(`<i class="fas fa-plane-departure"></i> ${home.IataCode}`);
  // $homeCountry.text(home.CountryName);
  // $startDate.text(obj.input.start);
  // $destCity.text(destination.CityName);
  // $destIata.html(
  //   `<i class="fas fa-plane-arrival"></i> ${destination.IataCode}`
  // );
  // $destCountry.text(destination.CountryName);
  // $endDate.text(obj.input.end);
  // $price.text(`$${obj.flight.Quotes[0].MinPrice}`);
  // $carrier.text(`by: ${obj.flight.Carriers[0].Name}`);
  // $prompt.hide();
  // loading();
  // clicked = true;

  // ABSTRACTED
  $homeCity.text(FLIGHT.departure.name);
  $homeIata.html(
    `<i class="fas fa-plane-departure"></i> ${FLIGHT.departure.iata}`
  );
  $homeCountry.text(FLIGHT.departure.country);
  $startDate.text(FLIGHT.date.start);
  $destCity.text(FLIGHT.destination.name);
  $destIata.html(
    `<i class="fas fa-plane-arrival"></i> ${FLIGHT.destination.iata}`
  );
  $destCountry.text(FLIGHT.destination.country);
  $endDate.text(FLIGHT.date.end);
  $price.text(`$${FLIGHT.flight.price}`);
  $carrier.text(`by: ${FLIGHT.flight.carrier}`);
  $prompt.hide();
  loading();
  clicked = true;

  // return $buttons.html(
  //   `<button class="button is-link is-fullwidth mb-3" id="share" data-link="${URL}/share/${obj.input.home}/${destination.IataCode}/${obj.input.start}/${obj.input.end}">
  //       Share Flight
  //      </button>
  //      <button id="viewed" class="button is-info is-fullwidth mb-3" ${viewed}>
  //        I've Been There
  //      </button>
  //      <button id="watch" data-clicked="false" class="button is-light is-fullwidth mb-3" ${watched}>
  //        Watch this Flight
  //      </button>
  //      ${loggedOut}
  //      <p class="subtitle" id="artist">Photo by
  //       <a href="${using_image.user.links.html}?utm_source=offhand_jaunt&utm_medium=referral">
  //         ${using_image.user.name}
  //       </a>
  //       on
  //       <a href="https://unsplash.com/?utm_source=offhand_jaunt&utm_medium=referral">
  //       Unsplash
  //       </a>
  //     </p>
  //   `
  // );

  return $buttons.html(
    `<button class="button is-link is-fullwidth mb-3" id="share" data-link="${URL}/share/${obj.input.home}/${destination.IataCode}/${obj.input.start}/${obj.input.end}">
        Share Flight
       </button>
       <button id="viewed" class="button is-info is-fullwidth mb-3" ${viewed}>
         I've Been There
       </button>
       <button id="watch" data-clicked="false" class="button is-light is-fullwidth mb-3" ${watched}>
         Watch this Flight
       </button>
       ${loggedOut}
    `
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
  if (response.error == false) {
    while (
      !response.flight_data.Quotes ||
      response.flight_data.Quotes.length < 1
    ) {
      response = await getFlight(obj);
    }
    return {
      flight: response.flight_data,
      input: obj,
      user: response.user_data,
    };
  }
  return false;
}

// VALIDATE FORM DATA
// verifies that the input is valid
function validIataCode(str) {
  const $help = $("#da");
  if (str.split("").length === 3) {
    if ($help.attr("class") === "help is-success") {
      $help.toggleClass("is-success");
    }
    if ($help.attr("class") === "help is-danger") {
      $help.toggleClass("is-danger");
    }
    $help.toggleClass("is-success");
    $help.text(`Valid IATA Code`);
    return true;
  }
  return false;
}

// verifies date
function handleFormData() {
  $("#go").toggleClass("is-loading");
  const $departureAirport = $("#departure_airport");
  let homeAirport = $departureAirport.val().toUpperCase();
  $departureAirport.val(homeAirport);
  let inputDate = $("#departure_date").val();
  let inputReturnDate = $("#returnDate").val();
  if (validIataCode(homeAirport)) {
    return {
      home: homeAirport,
      destination: "Random",
      start: inputDate,
      end: inputReturnDate,
    };
  }
  return false;
}

// HANDLE FLIGHT SUBMIT
let clicked = true;

async function handleClick(evt) {
  evt.preventDefault();
  if (clicked === true) {
    clicked = false;
    smartDate();
    data = handleFormData();
    if (data) {
      const response = await validQuote(data);
      if (response) {
        userFlightData = response;
        return displayQuote(response);
      }
    }
    loading();
    clicked = true;
    return error1();
  }
}

// WATCH FLIGHT
async function watchFlight(obj = userFlightData) {
  resp = await axios.post(`${URL}/watchFlight`, obj);
  clicked = true;
  return resp.data;
}

async function clickedWatchFlight(evt) {
  evt.preventDefault();
  const $element = $(evt.target);
  if ($element.attr("data-clicked") === "false") {
    resp = await axios.post(`${URL}/watchFlight`, userFlightData);
    $element.attr("data-clicked", "true");
    return $element.text(resp.data.data);
  }
  return;
}

// REMOVE WATCHED FLIGHT
async function removeWatchedFlight(evt) {
  evt.preventDefault();
  const $element = $(evt.target);
  const id = parseInt($element.attr("data-link"));
  resp = await axios.post(`${URL}/removeWatching`, { data: id });
  return $element.parent().parent().remove();
}

// UPDATE WATCHED FLIGHT
async function updateWatchedFlight(evt) {
  evt.preventDefault();
  const $element = $(evt.target);
  const id = parseInt($element.attr("data-link"));
  // get data for existing watched flight
  resp = await axios.post(`${URL}/watchingData`, { data: id });
  // get new flight data
  update = await getFlight(resp.data.data);
  // update price on existing watched flight
  newPrice = await axios.post(`${URL}/updateWatching`, {
    id: id,
    price: update.flight_data.Quotes[0].MinPrice,
  });
  $element.parent().children("#price").val(`$${newPrice.data.price}`);
  if (newPrice.data.increase) {
    return $element
      .parent()
      .parent()
      .children("#price")
      .toggleClass("is-success");
  }
  return $element.parent().parent().children("#price").toggleClass("is-danger");
}

// COPY LINK TO CLIP BOARD
function copyLink(evt) {
  evt.preventDefault();
  const $element = $(evt.target);
  const $url = $element.attr("data-link");
  const $temp = $("<input>");
  $quote.append($temp);
  $temp.val($url).select();
  document.execCommand("copy");
  $temp.remove();
  return $element.text("Copied");
}

// Mobile Devices
function toggleActive(evt) {
  $(".navbar-burger").toggleClass("is-active");
  $(".navbar-menu").toggleClass("is-active");
  return;
}
$(".navbar-burger").on("click", toggleActive);

// BIND EVENTS
// $form.on("click", "#go", handleClick);
$quote.on("click", "#viewed", handleClick);
$quote.on("click", "#watch", clickedWatchFlight);
$quote.on("click", "#share", copyLink);
$watched.on("click", "#stop-watching", removeWatchedFlight);
$watched.on("click", "#update-price", updateWatchedFlight);
$(".navbar-burger").on("click", toggleActive);

// ERROR
function error1() {
  const $help = $("#da");
  if ($help.attr("class") === "help is-danger") {
    return;
  }
  if ($help.attr("class") === "help is-success") {
    $help.toggleClass("is-success");
  }
  $help.toggleClass("is-danger");
  return $help.text(`Invalid IATA Code`);
}

{
  /* <p class="title" id="cityname">${home.CityName} <i class="fas fa-plane"></i> ${destination.CityName}</p>
      <p class="title" id="cityname">${destination.CityName}</p>
      <p class="subtitle" id="country">${destination.CountryName}</p>
      <p class="title" id="price">$${obj.flight.Quotes[0].MinPrice}</p>
      <p class="subtitle" id="date">
        ${obj.input.start} through ${obj.input.end}
      </p>
      <p class="subtitle" id="iata">
      To: ${destination.IataCode} By: ${obj.flight.Carriers[0].Name}
      </p> */
}

{
  /* <p class="subtitle" id="artist">Photo by
        <a href="${using_image.user.links.html}?utm_source=offhand_jaunt&utm_medium=referral">
          ${using_image.user.name}
        </a>
        on
        <a href="https://unsplash.com/?utm_source=offhand_jaunt&utm_medium=referral">
        Unsplash
        </a>
      </p> */
}

// <!-- SHARE -->
//   <div class="tile is-parent">
//     <article class="tile is-child box justify-content-center">
//       <button class="button is-link is-fullwidth mb-3" id="share" data-link="${URL}/share/${obj.input.home}/${destination.IataCode}/${obj.input.start}/${obj.input.end}">
//         Share Flight
//       </button>
//       <button id="viewed" class="button is-info is-fullwidth mb-3" ${viewed}>
//         I've Been There
//       </button>
//       <button id="watch" data-clicked="false" class="button is-light is-fullwidth mb-3" ${watched}>
//         Watch this Flight
//       </button>
//       ${loggedOut}
//     </article>
//   </div>
