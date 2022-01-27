// CONFIG
const URL = "http://127.0.0.1:5000";
let iataCodes;
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

let FLIGHT = Object.assign({}, INTIAL_FLIGHT);

// INDEX.HTML ELEMENTS
const $prompt = $("#prompt");
const $form = $("#inputdata");
const $departureIata = $("#departure_iata");
const $departureIataMsg = $("#departure_iata_msg");
const $departureDate = $("#departure_date");
const $departureDateMsg = $("#departure_date_msg");
const $returnDate = $("#return_date");
const $returnDateMsg = $("#return_date_msg");

// make API call to obtain iata_code.json information, assign to iataCodes.
(async () => {
  const { data } = await axios.get(`${URL}/request/iata`);
  iataCodes = data;
  previousData();
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

// LANDING PAGE
/**
 * On page load: Local Storage is queried, if data is there and valid - the form is completed with Local Storage data.
 * On page load: if Local Storage data is missing, or invalid - setDates and its helper functions update the displayed
 * dates to display today's date.
 * On departure date change: the return date is automatically set to a future date.
 *
 * On submit: the IATA code is validated, the departure date is validated, and the return date is validated.
 * On submit: If the data is valid - Local Storage data is updated.
 * On submit: If the data is valid - a POST request is made to the API requesting a random flight.
 * On submit: If the request is successful - the user is redirected to the Flight page.
 */

// LANDING PAGE / ON PAGE LOAD
// LANDING PAGE / ON PAGE LOAD / Helper function - validates proper date, ensures consistant day, month, year display.
function properDate(yyyy, mm, dd) {
  const thirtyOne = new Set([1, 3, 7, 8, 10, 12]);
  if (dd > 31) {
    mm++;
    dd = dd - 31;
  }
  if (mm > 12) {
    yyyy++;
    mm = mm - 12;
  }
  if (mm === 2 && dd > 28) {
    dd = dd - 28;
    mm++;
  } else if (thirtyOne.has(mm) && dd > 31) {
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
function setDates(lsDeparture, lsReturn) {
  const departureDateVal = lsDeparture ? lsDeparture : generateDate();
  $departureDate.val(departureDateVal);
  $departureDate.attr("min", `${augmentDate(0, 0, 0)}`);
  $departureDate.attr("max", `${augmentDate(0, 6, 0)}`);

  const returnDateVal = lsReturn ? lsReturn : augmentDate();
  $returnDate.val(returnDateVal);
  $returnDate.attr("min", `${augmentDate(0, 0, 1)}`);
  $returnDate.attr("max", `${augmentDate(0, 6, 5)}`);
}

// LANDING PAGE / ON PAGE LOAD / Fires setDates function in order to display current dates.
// setDates();

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
    localStorage.removeItem("departure");
    return false;
  } else {
    $departureDate.removeClass("is-danger");
    $departureDate.addClass("is-success");
    $departureDateMsg.removeClass("is-danger");
    $departureDateMsg.addClass("is-success");
    $departureDateMsg.text("Valid Departure Date");
  }

  if (inputDeparture > inputReturn) {
    // Return date is before Departure date
    $returnDate.removeClass("is-success");
    $returnDate.addClass("is-danger");
    $returnDateMsg.removeClass("is-success");
    $returnDateMsg.addClass("is-danger");
    $returnDateMsg.text("Return date must be after Departure date");
    localStorage.removeItem("return");
    return false;
  } else {
    $returnDate.removeClass("is-danger");
    $returnDate.addClass("is-success");
    $returnDateMsg.removeClass("is-danger");
    $returnDateMsg.addClass("is-success");
    $returnDateMsg.text("Valid Return Date");
  }
  localStorage.setItem("departure", inputDeparture);
  localStorage.setItem("return", inputReturn);
  FLIGHT.date.start = $departureDate.val();
  FLIGHT.date.end = $returnDate.val();

  return true;
}

// LANDING PAGE / ON PAGE LOAD / Helper function - queries Local Storage, validates data and updates FLIGHT information.
function previousData() {
  const lsIata = localStorage.getItem("iata");
  const lsDeparture = localStorage.getItem("departure");
  const lsReturn = localStorage.getItem("return");

  // if the data exists, it is validated, if valid, LIGHT is updated
  // if the data is missing or invalid the data is removed from local storage
  if (lsIata && iataCodes[lsIata]) {
    $departureIata.val(lsIata);
    FLIGHT.departure.iata = lsIata;
  }
  if (lsDeparture && lsReturn) {
    const lsDepartureFormatted = properDate(
      +lsDeparture.slice(0, 4),
      +lsDeparture.slice(4, 6),
      +lsDeparture.slice(6, 8)
    );

    const lsReturnFormatted = properDate(
      +lsReturn.slice(0, 4),
      +lsReturn.slice(4, 6),
      +lsReturn.slice(6, 8)
    );
    setDates(lsDepartureFormatted, lsReturnFormatted);
    if (smartDate()) {
      FLIGHT.date.start = lsDeparture;
      FLIGHT.date.end = lsReturn;
    } else {
      setDates();
      smartDate();
    }
  } else {
    setDates();
    $departureIata.val("");
  }
  return;
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
    localStorage.setItem("iata", iata);
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

  console.log(data);
  return (window.location.href = `${URL}/flight/${data.departure.iata}/${data.destination.iata}/${data.date.start}/${data.date.end}/`);
}

function handleChange(e) {
  e.preventDefault();
  console.log(e.target);
  const { name, value } = e.target;
  console.log(name, value);
}
// LANDING PAGE / ON FORM SUBMIT / Event handler - handles submit, makes API call on success, returns error message on failure
function handleSubmit(e) {
  e.preventDefault();
  // show spinner, remove error messages
  $("#go").toggleClass("is-loading");
  $prompt.css("color", "black");
  $prompt.text("Loading...");

  // Reset the FLIGHT object
  FLIGHT = Object.assign({}, INTIAL_FLIGHT);

  // Validate data
  if (validateIataCode() && smartDate()) {
    $prompt.text("Searching...");
    return generateFlight(FLIGHT);
  }

  // Error handling for unexpected errors.
  $("#go").toggleClass("is-loading");
  return $prompt.text("An unexpected error occured. Please try again.");
}

// LANDING PAGE / ON FORM SUBMIT / Event handler
$form.on("click", "#go", handleSubmit);
$form.on("submit", handleSubmit);

// $(document).on("keypress", function (e) {
//   e.preventDefault();
//   if (e.which == 13) {
//     return handleSubmit(e);
//   }
//   return handleChange(e);
// });

document.getElementById("row");

// Mobile Devices
function toggleActive(evt) {
  $(".navbar-burger").toggleClass("is-active");
  $(".navbar-menu").toggleClass("is-active");
  return;
}
$(".navbar-burger").on("click", toggleActive);
