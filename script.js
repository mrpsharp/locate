var watchID;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.min.js').then(function(registration) {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

function showPosition(position) {
  const latLng = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
  const accuracy = position.coords.accuracy;
  const accuracyStr = accuracy.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
  if (accuracy > 250) {
    showErrorButton("Accuracy is low.");
  } else {
    hideErrorButton();
  }
  const gridRef = convertToOSGridRef(latLng);
  console.log(gridRef);
  var osLink;
  if (gridRef) {
    var gridRefShort = gridRef.letters + " " + String(Math.round(Number(gridRef.eastings)/100)).padStart(3,"0") + " " + String(Math.round(Number(gridRef.northings)/100)).padStart(3,"0");
    var d = new Date(position.timestamp);
    measurementStr = `Measured at ${d.toLocaleTimeString()} on ${d.toLocaleDateString()} with an accuracy of ${accuracyStr}m`;
    infoHTML = `<p>Your grid reference is</p><p class="gridref">${gridRefShort}</p><p>${measurementStr}`;
    infoMessage(infoHTML);
    osLink = `https://explore.osmaps.com/pin?lat=${latLng.lat}&lon=${latLng.lng}&zoom=16`;
    document.getElementById("result-links").style.display = "block";
    document.getElementById("osmaps-link").setAttribute("href", osLink);
    const params = new URLSearchParams(window.location.search);
    if (params.has("testing")) {
      document.getElementById("osmaps-link").style.display = "block";
    }
    var shareLink = document.getElementById("share-link");
    shareLink.addEventListener("click", () =>
      shareLocation(gridRef, measurementStr)
    );
    if (!watchID) {
      var refreshLink = document.getElementById("refresh-link");
      refreshLink.style.display = "block";
      refreshLink.addEventListener("click", () =>
        getLocation()
      );
    }
  }
}

function convertToOSGridRef(latLng) {
  proj4.defs(
    "EPSG:27700",
    "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs"
  );
  var inBounds = os.Transform._checkBounds(latLng);
  if (inBounds.valid) {
    const eaNo = os.Transform.fromLatLng(latLng);
    const gridRef = os.Transform.toGridRef(eaNo);
    var eastNum = Number(gridRef.eastings)/100;
    return gridRef;
  } else {
    showErrorButton(inBounds.message);
    return undefined;
  }
}

function shareLocation(gridRef, measurementStr) {
  const shareText = `My location is ${gridRef.text}. (${measurementStr}). View location online: ${document
    .getElementById("osmaps-link")
    .getAttribute("href")}`;
  if (navigator.share) {
    try {
      navigator.share({ text: shareText });
    } catch (error) {
      alternateShare(shareText);
    }
  } else {
    alternateShare(shareText);
  }
}

function alternateShare(shareText) {
  var p = document.getElementById("share-text");
  var modal = document.getElementById("altShare");
  var shareHeader = document.getElementById("shareHeader");
  modal.style.display = "block";
  p.textContent = shareText;
  var closeBtn = document.getElementById("modalClose");
  // Listen for close click
  closeBtn.onclick = function () {
    modal.style.display = "none";
  }

  // // Listen for outside click
  // window.onclick = function (event) {
  //   if (event.target == modal) {
  //     modal.style.display = "none";
  //   }
  // }
  navigator.clipboard.writeText(shareText).then(function() {
    shareHeader.textContent = "Error sharing, text copied to clipboard";
  }).catch(function(error) {
    console.log("Failed to copy text");
  });
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      showErrorButton("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      showErrorButton("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      showErrorButton("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      showErrorButton("An unknown error occurred.");
      break;
  }
}
function showErrorButton(errorText) {
  errorButton = document.getElementById("error-btn");
  errorButton.style.display = "block";
  errorButton.innerHTML = `${errorText} Tap to refresh`;
  infoHTML =
  'Error finding your grid reference. You may have success with <a href="https://locate.what3words.com">What3Words Locate</a> instead';
  infoMessage(infoHTML);
  errorButton.addEventListener("click", getLocation);
  document.getElementById("result-links").style.display = "None";
}

function hideErrorButton() {
  document.getElementById("error-btn").style.display = "None";
}

function toggleLight(state) {
  var light = document.getElementById("light");
  // If a state is provided ("on" or "off")
  if (state === "on" || state === 1) {
      light.classList.remove("red");
      light.classList.add("green");
  } else if (state === "off" || state === 0) {
      light.classList.remove("green");
      light.classList.add("red");
  } else {
      // No state provided, toggle the current state
      if (light.classList.contains("red")) {
          light.classList.remove("red");
          light.classList.add("green");
      } else {
          light.classList.remove("green");
          light.classList.add("red");
      }
  }
}

function infoMessage(HTML) {
  document.getElementById("info-message").innerHTML = HTML;
}

function getLocation() {
  if (watchID) {
    navigator.geolocation.clearWatch(watchID);
    console.log("Watch cleared");
    toggleLight("off");
  }
  infoMessage("Finding location...");
  if ("geolocation" in navigator) {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
    if ("watchPosition" in navigator.geolocation) {
      watchID = navigator.geolocation.watchPosition(showPosition, showError, options);
      console.log("location watching");
      toggleLight("on");
    } else {
      // Fallback to getCurrentPosition
      navigator.geolocation.getCurrentPosition(showPosition, showError, options);
      toggleLight("off");
    }
  } else {
    infoMessage("Geolocation is not supported by this browser.");
  }
};