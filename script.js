function getLocation() {
    infoMessage("Finding location...")
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById("waiting").innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    const latLng = { lat: position.coords.latitude, lng: position.coords.longitude};
    const accuracy = position.coords.accuracy;
    const accuracyStr = accuracy.toLocaleString(undefined, {maximumFractionDigits: 0});
    if (accuracy > 250) {
        showErrorButton("Accuracy is low.");
    } else {
        hideErrorButton();
    }
    const osGridRef = convertToOSGridRef(latLng);
    const gridRefHTML = `Based on an accuracy of ${accuracyStr}m, your grid reference is <strong>${osGridRef}</strong>`
    const osLink = `https://explore.osmaps.com/pin?lat=${latLng.lat}&lon=${latLng.lng}&zoom=16`;
    infoMessage(gridRefHTML);
    document.getElementById("result-links").style.display = 'block';
    document.getElementById("osmaps-link").setAttribute('href', osLink);
    // document.getElementById("latlong").innerHTML = `${latLng.lat}, ${latLng.lng}`;
    var shareLink = document.getElementById("share-link")
    shareLink.addEventListener("click", () => shareLocation(osGridRef, accuracyStr));
}

function convertToOSGridRef(latLng) {
    proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs');
    var inBounds=os.Transform._checkBounds(latLng);
    if (inBounds.valid) {
        const eaNo = os.Transform.fromLatLng(latLng);
        const gridRef = os.Transform.toGridRef(eaNo);
        return gridRef.text;
    } else {
        showErrorButton(inBounds.message);
        return undefined;
    }

}

function shareLocation(osGridRef, accuracyStr) {
    const shareText = `My location is currently ${osGridRef}, with an accuracy of ${accuracyStr}.

View location online: ${document.getElementById("osmaps-link").getAttribute("href")}`;
    if(navigator.share) {
        try {
            navigator.share({text: shareText});
        } catch (error) {
            alternateShare(shareText);
        }
    } else {
        alternateShare(shareText);
    }
}

function alternateShare(shareText) {
    const copyButtonLabel = "Copy message";
    altShareDiv = document.getElementById("alt-share-div");
    altShareDiv.style.display = 'block';
    const heading = document.createElement('h4');
    heading.textContent = 'Error sharing, copy text below';
    const p = document.createElement('p');
    p.textContent = shareText;
    altShareDiv.appendChild(heading);
    altShareDiv.appendChild(p);
}

function showError(error) {
    switch(error.code) {
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
    errorButton = document.getElementById('error-btn');
    errorButton.style.display = 'block';
    errorButton.innerHTML = `${errorText} Tap to refresh`
    errorButton.addEventListener("click", getLocation)
}

function hideErrorButton() {
    document.getElementById('error-btn').style.display = 'None';
}

function infoMessage(HTML) {
    document.getElementById("info-message").innerHTML = HTML
}