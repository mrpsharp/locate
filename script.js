function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById("grid-reference").innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    const latLng = { lat: position.coords.latitude, lng: position.coords.longitude};
    const accuracy = position.coords.accuracy;
    const accuracyStr = accuracy.toLocaleString(undefined, {maximumFractionDigits: 0});
    const osGridRef = convertToOSGridRef(latLng);
    const gridRefText = `Based on an accuracy of ${accuracyStr}m, your grid reference is ${osGridRef}`
    const osLink = `https://explore.osmaps.com/pin?lat=${latLng.lat}&lon=${latLng.lng}&zoom=16`;
    document.getElementById("grid-reference").innerHTML = gridRefText;
    console.log(accuracy);
    document.getElementById("osmaps-link").innerHTML = "Open location in OsMaps";
    document.getElementById("osmaps-link").setAttribute('href', osLink);
    // document.getElementById("latlong").innerHTML = `${latLng.lat}, ${latLng.lng}`;
    var shareLink = document.getElementById("share-link")
    shareLink.innerHTML = "Share location";
    shareLink.addEventListener("click", shareLocation)
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById("grid-reference").innerHTML = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById("grid-reference").innerHTML = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            document.getElementById("grid-reference").innerHTML = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById("grid-reference").innerHTML = "An unknown error occurred.";
            break;
    }
}

function convertToOSGridRef(latLng) {
    proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs');
    const eaNo = os.Transform.fromLatLng(latLng);
    const gridRef = os.Transform.toGridRef(eaNo);
    return gridRef.text;
}

function shareLocation() {
    const shareText = `${document.getElementById("grid-reference").innerHTML}
    
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
    messageBlock = document.getElementById("alt-share");
    messageBlock.innerHTML = shareText;
    if (navigator.clipboard) {
        let button = document.createElement("button");
        button.innerText = copyButtonLabel;
        messageBlock.appendChild(button);
        button.addEventListener("click", async () => {
            await navigator.clipboard.writeText(shareText);
        });
    }
}