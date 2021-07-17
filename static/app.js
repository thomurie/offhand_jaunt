const $form = $("form");
const $departureDate = $("#departure_date");
const $departureAirport = $("#departure_airport");
const $returnDate = $("#return_date");
const $body = $("body");

// Features to add
// 2. watch flights
// 3. API doesn't allow incorporation of price
// allow user to watch flight, update user via email if flight
// price is decreasing

// SET DATE
function generateDate(int) {
  const today = new Date();
  let yyyy = today.getFullYear();
  let mm = today.getMonth() + 1;
  let dd = today.getDate() + int;
  if (dd < 10) {
    dd = `0${dd}`;
  }
  if (mm < 10) {
    mm = `0${mm}`;
  }
  return `${yyyy}-${mm}-${dd}`;
}

$departureDate.val(generateDate(1));
$returnDate.val(generateDate(6));

//  DISPLAY QUOTE
async function getImage(str) {
  const response = await axios.post(`http://127.0.0.1:5000/image`, {
    data: str,
  });
  return response.data;
}

async function displayQuote(obj) {
  // TODO: query image API, return image URL
  $(".quote").html("");
  let destination = obj.flight.Places[0];

  if (obj.input.home === obj.flight.Places[0].IataCode) {
    destination = obj.flight.Places[1];
  }

  const image = await getImage(destination.CityName);
  const imageURL = image.results[0].urls.regular;
  return $body.append(
    `<div class="quote">
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
async function getFlight(userInput) {
  const response = await axios.post(`http://127.0.0.1:5000/flight`, {
    data: userInput,
  });
  return response.data;
}

// VALID QUOTE
async function validQuote(obj) {
  let response = await getFlight(obj);
  while (response.Quotes.length < 1) {
    response = await getFlight(obj);
  }
  return { flight: response, input: obj };
}

// VALIDATE FORM DATA
function validIataCode(str) {
  // TODO HANDLE INVALID CODES
  return str.split("").length === 3;
}

function validDates(d1, d2) {
  // TODO: error message for invalid date entry
  const today = parseInt(generateDate(0).split("-").join(""));
  const date1 = parseInt(d1.split("-").join(""));
  if (today <= date1) {
    if (d2 === "anytime") {
      return true;
    }
    const date2 = parseInt(d2.split("-").join(""));
    return date1 < date2;
  }
  return false;
}

function handleFormData() {
  // TODO: handle invalid dates.
  let homeAirport = $departureAirport.val().toUpperCase();
  $departureAirport.val(homeAirport);
  let inputDate = $departureDate.val();
  let anytime = $("input:checked").length;
  let inputReturnDate = anytime === 1 ? "anytime" : $returnDate.val();
  if (validDates(inputDate, inputReturnDate) && validIataCode(homeAirport)) {
    return {
      home: homeAirport,
      start: inputDate,
      end: inputReturnDate,
    };
  }
  return error1("handleFormData");
}

// HANDLE SUBMIT
async function handleClick(evt) {
  // TODO: prevent multiple requests
  evt.preventDefault();
  data = handleFormData();
  const response = await validQuote(data);
  return displayQuote(response);
}
$form.on("click", ".go", handleClick);

// BASIC ERROR
function error1(msg) {
  console.error(msg);
}
