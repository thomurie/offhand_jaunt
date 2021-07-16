const $form = $("form");
const $departureDate = $("#departure_date");
const $departureAirport = $("#departure_airport");
const $returnDate = $("#return_date");
const $body = $("body");

// Features to add
// 1. add images
// 2. watch flights
// 3. API doesn't allow incorporation of price
// allow user to watch flight, update user via email if flight
// price is decreasing

// SET DATE
function currentDate() {
  const today = new Date();
  let yyyy = today.getFullYear();
  let mm = today.getMonth() + 1;
  let dd = today.getDate() + 1;
  if (dd < 10) {
    dd = `0${dd}`;
  }
  if (mm < 10) {
    mm = `0${mm}`;
  }
  return `${yyyy}-${mm}-${dd}`;
}

function basicReturnDate() {
  const today = new Date();
  let yyyy = today.getFullYear();
  let mm = today.getMonth() + 1;
  let dd = today.getDate() + 6;
  if (dd < 10) {
    dd = `0${dd}`;
  }
  if (mm < 10) {
    mm = `0${mm}`;
  }
  return `${yyyy}-${mm}-${dd}`;
}

$departureDate.val(currentDate());
$returnDate.val(basicReturnDate());

//  DISPLAY QUOTE
async function displayQuote(obj) {
  // TODO: destination and origin keep switching in response data
  // account for this change by ensuring the origin data is never shown.

  // TODO: query image API, return image URL
  $(".quote").html("");
  return $body.append(
    `<div class="quote">
        <h2 class="destination">${obj.Places[1].CityName}</h2>
        <h3 class="country">${obj.Places[1].CountryName}</h3>
        <h3 class="iata">${obj.Places[1].IataCode}</h3>
        <img src="" alt="" />
        <h2 class="price">${obj.Quotes[0].MinPrice}</h2>
        <h3 class="carrier">${obj.Carriers[0].Name}</h3>
      </div>`
  );
}

// FLIGHT
async function getFlight(userInput) {
  console.log(userInput);
  const options = {
    method: "GET",
    url: `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/${userInput.home}-sky/${userInput.destination}-sky/${userInput.start}`,
    params: { inboundpartialdate: userInput.end },
    headers: {
      "x-rapidapi-key": userInput.key,
      "x-rapidapi-host":
        "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
    },
  };
  const response = await axios.request(options);
  return response.data;
}

// VALID QUOTE
async function validQuote(obj) {
  let response = await getFlight(obj);
  while (response.Quotes.length < 1) {
    response = await getFlight(obj);
  }
  return response;
}

// VALIDATE FORM DATA
function validIataCode(str) {
  // TODO: Query List of IATA Codes
  return str.split("").length === 3;
}

function validDepartureDate(d1) {
  // TODO: error message for invalid date entry
  const today = parseInt(currentDate().split("-").join(""));
  const date1 = parseInt(d1.split("-").join(""));
  if (today <= date1) {
    return true;
  }
  return false;
}
function validDates(d1, d2) {
  // TODO: error message for invalid date entry
  const date1 = validDepartureDate(d1);
  if (date1) {
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
  let homeAirport = $departureAirport.val();
  let inputDate = $departureDate.val();
  let anytime = $("input:checked").length;
  let inputReturnDate = anytime === 1 ? "anytime" : $returnDate.val();
  if (validDates(inputDate, inputReturnDate)) {
    return { home: homeAirport, start: inputDate, end: inputReturnDate };
  }
  return error1("handleFormData");
}

// HANDLE SUBMIT
async function handleClick(evt) {
  evt.preventDefault();
  data = handleFormData();
  validateData = await axios.post(`http://127.0.0.1:5000/validation`, {
    data: data,
  });
  console.log(validateData.data);
  const response = await validQuote(validateData.data);
  console.log(response);
  return displayQuote(response);
}
$form.on("click", ".go", handleClick);

// BASIC ERROR
function error1(msg) {
  console.error(msg);
}
