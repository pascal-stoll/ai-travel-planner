import L from 'leaflet';

const RecenterControl = L.Control.extend({
  options: {
    position: 'bottomright',
  },
  onAdd: function (map) {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    container.style.backgroundColor = 'white';
    container.style.width = '30px';
    container.style.height = '30px';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.cursor = 'pointer';
    container.style.marginRight = '16px';
    container.style.marginBottom = '16px';
    container.innerHTML = '&#x2316;'; // simbolo di reticolo
    container.title = 'Recenter';
    L.DomEvent.on(container, 'click', () => {
      if (this._bounds) {
        map.fitBounds(this._bounds, { padding: [20, 20] });
      }
    });
    return container;
  },
  setBounds: function (bounds) {
    this._bounds = bounds;
  }
});

export default RecenterControl;
