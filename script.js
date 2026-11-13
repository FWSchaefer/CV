document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

const places = [
  { id: 'munich', name: 'Munich', country: 'Germany', type: 'work', coordinates: [48.1372, 11.5756], detail: 'BearingPoint GmbH / 2024 - present', logo: 'BearingPoint', logoSrc: 'assets/logos/bearingpoint.svg' },
  { id: 'muenster', name: 'Münster', country: 'Germany', type: 'education', coordinates: [51.9607, 7.6261], detail: 'FH Münster / 2022 - 2024', logo: 'FH', logoClass: 'school-mark' },
  { id: 'burghausen', name: 'Burghausen', country: 'Germany', type: 'education', coordinates: [48.1689, 12.831], detail: 'Campus Burghausen / 2017 - 2021', logo: 'CB', logoClass: 'school-mark' },
  { id: 'krakow', name: 'Kraków', country: 'Poland', type: 'education', coordinates: [50.0647, 19.945], detail: 'Kraków University of Economics / 2023', logo: 'UEK', logoClass: 'school-mark' },
  { id: 'salzburg', name: 'Salzburg', country: 'Austria', type: 'work', coordinates: [47.8095, 13.055], detail: 'Porsche Austria / 2021', logo: 'Porsche', logoSrc: 'assets/logos/porsche.svg' },
  { id: 'vienna', name: 'Vienna', country: 'Austria', type: 'work', coordinates: [48.2082, 16.3738], detail: 'Austrian Airlines / 2019 - 2020', logo: 'Austrian Airlines', logoSrc: 'assets/logos/austrian.svg' },
];

if (window.L) {
  const map = L.map('leaflet-map', { scrollWheelZoom: false, zoomControl: false }).setView([49.4, 12.8], 5);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map);

  const markers = new Map();
  const markerIcon = (type) => L.divIcon({
    className: 'place-marker-wrap',
    html: `<span class="place-marker place-marker--${type}"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const setActivePlace = (place, fly = true) => {
    document.querySelectorAll('.place-card').forEach((card) => card.classList.toggle('is-active', card.dataset.place === place.id));
    markers.forEach((marker, id) => marker.getElement()?.classList.toggle('is-selected', id === place.id));
    if (fly) map.flyTo(place.coordinates, 7, { duration: 0.8 });
    markers.get(place.id).openPopup();
  };

  places.forEach((place) => {
    const popupLogo = place.logoSrc
      ? `<img class="map-logo" src="${place.logoSrc}" alt="${place.logo} logo">`
      : `<span class="${place.logoClass} map-school-mark">${place.logo}</span>`;
    const marker = L.marker(place.coordinates, { icon: markerIcon(place.type), title: `${place.name}, ${place.country}` })
      .bindPopup(`<div class="map-popup">${popupLogo}<span>${place.type === 'work' ? 'WORK' : 'EDUCATION'}</span><strong>${place.name}, ${place.country}</strong><p>${place.detail}</p></div>`, { offset: [0, -4] })
      .addTo(map)
      .on('click', () => setActivePlace(place, false));
    markers.set(place.id, marker);
  });

  document.querySelectorAll('.place-card').forEach((card) => {
    card.addEventListener('click', () => setActivePlace(places.find((place) => place.id === card.dataset.place)));
  });

  document.querySelectorAll('.map-filter').forEach((filter) => {
    filter.addEventListener('click', () => {
      const category = filter.dataset.filter;
      document.querySelectorAll('.map-filter').forEach((button) => button.classList.toggle('is-active', button === filter));
      places.forEach((place) => {
        const visible = category === 'all' || place.type === category;
        const marker = markers.get(place.id);
        marker.getElement()?.classList.toggle('is-filtered-out', !visible);
        document.querySelector(`[data-place="${place.id}"]`).classList.toggle('is-filtered-out', !visible);
      });
      const selected = category === 'all' ? places : places.filter((place) => place.type === category);
      map.fitBounds(selected.map((place) => place.coordinates), { padding: [48, 48], maxZoom: 6, animate: true });
    });
  });

  setActivePlace(places[0], false);
}
