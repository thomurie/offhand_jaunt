const $form = $("#inputdata");
const $button = $("button");
const $quote = $("#quote");
const $departure = $("#departure_date");
const $return = $("#return_date");
const $watched = $("#watched");
const URL = "https://offhandjaunt.herokuapp.com";
let userFlightData = null;

// LANDING PAGE / FORM
// sets the inital calendar values, min, and max calendar dates
function setDates() {
  $departure.val(generateDate());
  $departure.attr("min", `${augmentDate(0, 0, 0)}`);
  $departure.attr("max", `${augmentDate(0, 6, 0)}`);

  $return.val(augmentDate());
  $return.attr("min", `${augmentDate(0, 0, 1)}`);
  $return.attr("max", `${augmentDate(0, 6, 5)}`);
}

setDates();

$departure.on("click", setDates);

// SET DATE
// validates date, ensures proper month/ year display
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
    dd = day - 28;
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
  inputDeparture = $departure.val().split("-").join("");
  inputReturn = $return.val().split("-").join("");
  if (inputDeparture > inputReturn) {
    $return.attr("min", `${augmentDate(0, 0, 1)}`);
    return $return.val(augmentDate());
  }
}

$form.on("click", "#return_date", smartDate);

// FORM
// toggle loading
function loading() {
  return $("#go").toggleClass("is-loading");
}
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
  $quote.html("");
  let destination =
    obj.input.home === obj.flight.Places[0].IataCode
      ? obj.flight.Places[1]
      : obj.flight.Places[0];

  let viewed = `<h5 class="title is-5">Login to Optimize Results</h5>`;
  let watched = `<h5 class="title is-5">Login to Watch Flights</h5>`;

  if (obj.user !== "Guest") {
    viewed = `<a id="viewed" class="button is-warning">I've Been There</a>`;
    watched = `<a id="watch" data-clicked="false" class="button is-primary">Watch this Flight</a>`;
  }

  const image = await getImage(destination.CityName);
  const using_image = image.results[3];
  clicked = true;
  loading();
  return $quote.append(
    `<div class="tile is-child box">
      <p class="title" id="cityname">${destination.CityName}</p>
      <p class="subtitle" id="country">${destination.CountryName}</p>
      <p class="title" id="price">$${obj.flight.Quotes[0].MinPrice}</p>
      <p class="subtitle" id="date">${obj.input.start} - ${obj.input.end}</p>
      <p class="subtitle" id="iata"> To: ${destination.IataCode} By: ${obj.flight.Carriers[0].Name}</p>
    </div>
    <div class="tile is-child box" id="dimage">
      <figure class="image image is-5by4">
        <a href="${using_image.urls.regular}">
          <img id="location_image" src="${using_image.urls.regular}">
        </a>
      </figure>
      <p class="subtitle" id="artist">Photo by
        <a href="${using_image.user.links.html}?utm_source=offhand_jaunt&utm_medium=referral">
          ${using_image.user.name}
        </a>
        on
        <a href="https://unsplash.com/?utm_source=offhand_jaunt&utm_medium=referral">
        Unsplash
        </a>
      </p>
    </div>
    <div class="tile is-child box" id="dimage">
    <div class="columns is-multiline is-mobile">
    <div class="column">
    <a class="button is-info" id="share" data-link="${URL}/share/${obj.input.home}/${destination.IataCode}/${obj.input.start}/${obj.input.end}">Share Flight</a>
    </div>
    <div class="column">
      ${viewed}
    </div>
    <div class="column">
      ${watched}
    </div>
    </div>
    </div>
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
    while (response.flight_data.Quotes.length < 1) {
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
  let inputReturnDate = $("#return_date").val();
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
  console.log($element.val());
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

// BIND EVENTS
$form.on("click", "#go", handleClick);
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
