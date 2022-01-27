const URL = "http://127.0.0.1:5000";
const $share = $("#share");
const $visited = $("#visited");
let $addFavorite = $("#addFavorite");
let $remFavorite = $("#remFavorite");

// SHARE
// COPY LINK TO CLIP BOARD
function copyLink(e) {
  e.preventDefault();
  const url = window.location.href;
  const $temp = $("<input>");
  $share.append($temp);
  $temp.val(url).select();
  document.execCommand("copy");
  $temp.remove();
  return $share.text("Copied To Clipboard");
}

$share.on("click", copyLink);

// ADD VISITED
async function addVisited(e) {
  e.preventDefault();
  // make a post request to create the visited
  const data = await axios.post(`${URL}/request/iata`);
  // if successful show button to generate a new random destination
  // if fail, display error message and details
}

// ADD FAVORITE
async function addFavorite(e) {
  e.preventDefault();
  // make a post request to create favorite
  const data = await axios.post(`${URL}/request/iata`);
  // if successful modify button to show "Remove Favorite"
  // Modify the button id to be "remFavorite"
  // if fail, display error message and details
}

// REMOVE FAVORITE
async function remFavorite(e) {
  e.preventDefault();
  // make a post request to create favorite
  const data = await axios.post(`${URL}/request/iata`);
  // if successful modify button to show "Favorite"
  // Modify the button id to be "addFavorite"
  // if fail, display error message and details
}
