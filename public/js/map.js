const mapCoords = (typeof coordinates !== 'undefined' && coordinates && coordinates.length === 2) ? coordinates : [77.2090, 28.6139];

const map = new maplibregl.Map({
    container: 'map', 
    style: {
        version: 8,
        sources: {
            // Mam jaisa clean streets aur light-style map load karne ke liye OpenStreetMap tiles
            'osm-streets': {
                type: 'raster',
                tiles: [
                    'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
                ],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap contributors'
            }
        },
        layers: [
            {
                id: 'streets-layer',
                type: 'raster',
                source: 'osm-streets',
                minzoom: 0,
                maxzoom: 19
            }
        ]
    },
    center: mapCoords, 
    zoom: 12 
});

// ==================== 3D FLIP MARKER LOGIC ====================

// 1. Base Element (Map par fixed anchor)
const el = document.createElement('div');
el.className = 'marker-base';
el.style.width = '35px';
el.style.height = '35px';
el.style.cursor = 'pointer';
el.style.perspective = '600px'; 

// 2. Inner Element (Flip Card Container)
const card = document.createElement('div');
card.style.width = '100%';
card.style.height = '100%';
card.style.position = 'relative';
card.style.transformStyle = 'preserve-3d';
card.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'; 

el.appendChild(card);

// Icons URLs
const logoUrl = 'https://cdn-icons-png.flaticon.com/512/2111/2111320.png'; // Website Logo
const normalPinUrl = 'https://cdn-icons-png.flaticon.com/512/684/684908.png'; // Standard Red Pin

// 3. Front Side (Initial Red Pin)
const front = document.createElement('div');
front.style.position = 'absolute';
front.style.width = '100%';
front.style.height = '100%';
front.style.backfaceVisibility = 'hidden'; 
front.style.backgroundImage = `url('${normalPinUrl}')`; front.style.backgroundSize = 'contain';
front.style.backgroundRepeat = 'no-repeat';
front.style.backgroundPosition = 'center';

// 4. Back Side (Website Logo on Hover)
const back = document.createElement('div');
back.style.position = 'absolute';
back.style.width = '100%';
back.style.height = '100%';
back.style.backfaceVisibility = 'hidden';
back.style.backgroundImage = `url('${logoUrl}')`;
back.style.backgroundSize = 'contain';
back.style.backgroundRepeat = 'no-repeat';
back.style.backgroundPosition = 'center';
back.style.transform = 'rotateY(180deg)'; 

card.appendChild(front);
card.appendChild(back);

// 5. Hover Action
el.addEventListener('mouseenter', () => {
    card.style.transform = 'rotateY(180deg)';
});

el.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateY(0deg)';
});

// 6. Popup Config (Exact title dynamically content handled)
const popup = new maplibregl.Popup({ offset: 25 })
    .setHTML("<h4 style='margin: 0 0 5px; color: #ff385c;'>Location Details</h4><p style='margin: 0; font-size: 13px;'>Exact location will be provided after booking!</p>");

// 7. Render Marker
new maplibregl.Marker({ element: el, anchor: 'center' }) 
    .setLngLat(mapCoords)
    .setPopup(popup)
    .addTo(map);