window.addEventListener("load", function (event) {
  text = this.document.getElementById("fetchData");
  detail = this.document.getElementById("detail");
  inputElement = this.document.getElementById("search");
  searchText = inputElement.value;
  iframe = this.document.getElementById("myIFrame");
  modal = document.getElementById("myModal");
  searchResults = document.getElementById("searchResults");
  latitude = 49.75;
  longitude = 15.34;

  var buttonNearByMe = this.document.getElementById("findNearByMe");
  var startButton = this.document.getElementById("start");

  radiusInKm = 50;
  initMap();

  if (localStorage.getItem("ulozenaData") === null) {
    loadAllCzechBird();
  }

  ulozenaData = JSON.parse(localStorage.getItem("ulozenaData"));

  inputElement.addEventListener("input", function () {
    searchText = inputElement.value;
  });

  startButton.addEventListener("click", () => {
    marker.remove();
    while (detail.firstChild) {
      detail.removeChild(detail.firstChild);
    }
    if (searchText === "") {
      displayAllData();
    } else {
      displayData();
    }
  });

  buttonNearByMe.addEventListener("click", displayDataNearByME);
});

function find(searchTerm) {
  const cseUrl = `https://www.googleapis.com/customsearch/v1?key=AIzaSyBErxC53Zuc1r94nGqyVYdGrT7i-MUIMRQ&cx=c53838a393dc34cd9&q=${searchTerm}`;
  fetch(cseUrl)
    .then((response) => response.json())
    .then((data) => {
      // Extrahujeme výsledky z dat, která vrátily Google CSE
      const results = data.items;

      // Zobrazíme výsledky v modálním okně
      displayResults(results);
    });
}

function displayResults(results) {
  searchResults.innerHTML = ""; // Vyčistíme předchozí výsledky

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

  modal.style.display = "block"; // Zobrazíme modální okno
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

function displayData() {
  ulozenaData.forEach((bird) => {
    if (bird.comName === searchText) {
      console.log(bird);
      const newItem = document.createElement("li");
      newItem.textContent = bird.comName;
      birdOnMap(bird);
      find(bird.comName + " bird");
      detail.appendChild(newItem);
    }
  });
}

function birdOnMap(bird) {
  marker = L.marker([bird.lat, bird.lng]).addTo(map);
  marker.bindPopup(bird.locName).openPopup();
  map.setView([bird.lat, bird.lng], 9);
}

function displayAllData() {
  ulozenaData.forEach((bird) => {
    const newItem = document.createElement("li");
    newItem.textContent = bird.comName;
    detail.appendChild(newItem);
  });
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

function displayDataNearByME() {
  ulozenaData.forEach((bird) => {
    const distanceInKm = calculateDistanceInKm(
      latitude,
      longitude,
      bird.lat,
      bird.lng
    );

    if (distanceInKm <= radiusInKm) {
      // Objekt je v poloměru, vytvořte marker na mapě
      birdMarker = L.marker([bird.lat, bird.lng]).addTo(map);
      birdMarker.bindPopup(bird.comName);
      birdMarker.on("click", function () {
        birdMarker.openPopup();
      });
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
