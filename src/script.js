var resultList = this.document.getElementById("detail");
var inputElement = this.document.getElementById("search");
var buttonNearByMe = this.document.getElementById("findNearByMe");
var findButton = this.document.getElementById("start");
var kilometers = this.document.getElementById("kilometers");
var iframe = this.document.getElementById("myIFrame");
var modal = this.document.getElementById("myModal");
var searchResults = this.document.getElementById("searchResults");

var latitude = 49.75;
var longitude = 15.34;
var showList = false;

initMap();

if (localStorage.getItem("ulozenaData") === null) {
  loadAllCzechBird();
}

var ulozenaData = JSON.parse(localStorage.getItem("ulozenaData"));

findButton.addEventListener("click", showBirdList);

buttonNearByMe.addEventListener("click", displayDataNearByME);

function showBirdList() {
  cleanResultList();

  searchText = inputElement.value;

  if (searchText === "" && !showList) {
    displayAllData();
  } else {
    displayData();
  }
  showList = !showList;
}

function find(searchTerm) {
  const cseUrl = `https://www.googleapis.com/customsearch/v1?key=AIzaSyBErxC53Zuc1r94nGqyVYdGrT7i-MUIMRQ&cx=c53838a393dc34cd9&q=${searchTerm}`;
  fetch(cseUrl)
    .then((response) => response.json())
    .then((data) => {
      const results = data.items;
      displayResults(results);
    });
}

function displayResults(results) {
  searchResults.innerHTML = "";

  if (results.length === 0) {
    searchResults.innerHTML = "Žádné výsledky nenalezeny";
  } else {
    results.forEach(function (result) {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = result.link;
      link.textContent = result.title;
      li.appendChild(link);
      searchResults.appendChild(li);
    });
  }

  modal.style.display = "block";
}

function displayData() {
  ulozenaData.forEach((bird) => {
    if (bird.comName === searchText) {
      const newItem = document.createElement("li");
      newItem.textContent = bird.comName;
      birdOnMap(bird);
      find(bird.comName + " bird");
      resultList.appendChild(newItem);
    }
  });

  searchText = "";
  inputElement.value = "";
}

function birdOnMap(bird) {
  marker = L.marker([bird.lat, bird.lng]).addTo(map);
  marker
    .bindPopup("Druh: " + bird.comName + " <br> Lokace: " + bird.locName)
    .openPopup();
  marker.on("click", () => {
    find(bird.comName + " bird");
  });
  map.setView([bird.lat, bird.lng], 9);
}

function displayAllData() {
  ulozenaData.forEach((bird) => {
    const newItem = document.createElement("li");

    newItem.textContent = bird.comName;
    newItem.style.cursor = "pointer";
    newItem.addEventListener("click", function () {
      cleanResultList();
      searchText = newItem.textContent;
      displayData();
      showList = !showList;
    });
    resultList.appendChild(newItem);
  });
}

function displayDataNearByME() {
  cleanResultList();
  var radiusInKm = kilometers.value;

  ulozenaData.forEach((bird) => {
    const distanceInKm = calculateDistanceInKm(
      latitude,
      longitude,
      bird.lat,
      bird.lng
    );

    if (distanceInKm <= radiusInKm) {
      birdOnMap(bird);
    }
  });
}

function calculateDistanceInKm(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;

  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function loadAllCzechBird() {
  const apiUrl = "https://ebird.org/ws2.0/data/obs/CZ/recent";
  const apiKey = "poh6j9mfho45";

  const headers = new Headers({
    "X-eBirdApiToken": apiKey,
  });

  const requestOptions = {
    method: "GET",
    headers: headers,
  };

  fetch(apiUrl, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("ulozenaData", JSON.stringify(data));
      console.log("Data načtena v pořádku, a uložena do localStorage");
    })
    .catch((error) => {
      console.error("Chyba při načítání dat z eBird API:", error);
    });
}

function initMap() {
  map = L.map("map").setView([49.75, 15.34], 9);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  marker = L.marker([49.75, 15.34]);

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(zobrazAktualniPolohu, zobrazChybu);
  } else {
    console.log("Geolokace není podporována v tomto prohlížeči.");
  }
}

function zobrazChybu(error) {
  console.log(`Chyba: ${error.message}`);
}

function zobrazAktualniPolohu(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;

  myPos = L.marker([latitude, longitude], {
    icon: L.divIcon({
      className: "custom-icon",
      html: "<div></div>",
      iconSize: [20, 20],
    }),
  }).addTo(map);
  map.setView([latitude, longitude], 9);
  myPos.bindPopup("Vaše aktuální poloha").openPopup();
}

function cleanResultList() {
  marker.remove();

  while (resultList.firstChild) {
    resultList.removeChild(resultList.firstChild);
  }

  searchResults.innerHTML = "";
}
