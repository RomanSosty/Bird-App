window.addEventListener("load", function (event) {
  text = this.document.getElementById("fetchData");
  detail = this.document.getElementById("detail");
  inputElement = this.document.getElementById("search");

  var startButton = this.document.getElementById("start");

  if (localStorage.getItem("ulozenaData") === null) {
    loadAllCzechBird();
  }

  const ulozenaDataJSON = localStorage.getItem("ulozenaData");

  inputElement.addEventListener("input", function () {
    searchText = inputElement.value;
  });

  startButton.addEventListener("click", () => {
    console.log(ulozenaDataJSON);
  });
});

function displayData() {}

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
