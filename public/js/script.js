// No need to import anything
const socket = io();

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error(error); // Use console.error directly
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}

const map = L.map("map").setView([0,0], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution : "@Shailesh_Bothe"
}).addTo(map);


// Initialize the map
// const map = L.map("map").setView([51.505, -0.09], 13); // Example coordinates (London)

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
// }).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    // Check if map is defined and latitude/longitude are valid
    if (map && typeof latitude === "number" && typeof longitude === "number") {
        map.setView([latitude, longitude]);
    } else {
        console.error("Invalid map or coordinates:", data);
    }

    if(markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    }
    else{
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
    if(markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
