const map = L.map('map').setView([54.188, -6.05], 13); // Centered on Ben Crom

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let markers = [];
    let allFeatures = [];

    function getColorByGrade(grade) {
      const gradeScale = [
        "M", "D", "VD", "HVD", "S", "HS", "VS", "HVS",
        "E1", "E2", "E3", "E4",
        "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12"
      ];

      const cleanGrade = grade.split(" ")[0];
      const index = gradeScale.indexOf(cleanGrade);

      if (index >= 0 && index <= 7) return '#33aa33'; // Green
      if (index >= 8 && index <= 11) return '#ff9900'; // Orange
      if (index >= 12 && index <= 16) return '#cc3333'; // Red
      if (index >= 17) return '#000000'; // Black

      return '#999999'; // Unknown
    }

    function updateTable(features) {
      const tbody = document.querySelector("#climb-table tbody");
      tbody.innerHTML = "";
      features.forEach(props => {
        const row = document.createElement("tr");
        const climbers = [props.climber1, props.climber2, props.climber3].filter(c => c).join(", ");
        row.innerHTML = `
          <td>${props.route}</td>
          <td>${climbers}</td>
          <td>${props.year}</td>
          <td>${props.grade}</td>
          <td>${props.crag}</td>
          <td>${props.sector}</td>
          <td>${props.source || ''}</td>
        `;
        tbody.appendChild(row);
      });
    }

    function filterClimbsByYearAndClimber(year, climber) {
      const filtered = markers.filter(marker => {
        const props = marker.feature.properties;
        const matchYear = parseInt(props.year) === parseInt(year);
        const matchClimber = climber === 'all' || [props.climber1, props.climber2, props.climber3].includes(climber);
        return matchYear && matchClimber;
      });

      markers.forEach(m => map.removeLayer(m));
      filtered.forEach(m => m.addTo(map));
      updateTable(filtered.map(m => m.feature.properties));
    }

    fetch('climbs.geojson')
      .then(res => res.json())
      .then(data => {
        allFeatures = data.features;

        let climberSet = new Set();

        allFeatures.forEach(feature => {
          const jitter = () => Math.random() * (0.00009 - 0.000001) + 0.000001;
          const coords = feature.geometry.coordinates;
          const latlng = L.latLng(coords[1] + jitter(), coords[0] + jitter());

          const props = feature.properties;
          [props.climber1, props.climber2, props.climber3].forEach(c => {
            if (c) climberSet.add(c);
          });

          const climbers = [props.climber1, props.climber2, props.climber3].filter(c => c).join('<br>');

          const marker = L.circleMarker(latlng, {
            radius: 12,
            color: getColorByGrade(props.grade),
            fillColor: getColorByGrade(props.grade),
            fillOpacity: 0.7
          }).bindPopup(`
            <strong>${props.route}</strong><br>
            ${climbers}<br>
            Year: ${props.year}<br>
            Grade: ${props.grade}<br>
            Crag: ${props.crag}<br>
            Sector: ${props.sector}
          `);

          marker.feature = feature;
          markers.push(marker);
        });

        // Populate climber dropdown
        const climberDropdown = document.getElementById('climber-filter');
        [...climberSet].sort().forEach(name => {
          const opt = document.createElement('option');
          opt.value = name;
          opt.textContent = name;
          climberDropdown.appendChild(opt);
        });

        updateYear(2025);
      });

    const slider = document.getElementById('year-slider');
    const yearDisplay = document.getElementById('selected-year');
    const btnIncrease = document.getElementById('increase-year');
    const btnDecrease = document.getElementById('decrease-year');
    const climberDropdown = document.getElementById('climber-filter');

    function updateYear(newYear) {
      slider.value = newYear;
      yearDisplay.textContent = newYear;
      filterClimbsByYearAndClimber(newYear, climberDropdown.value);
    }

    slider.addEventListener('input', () => updateYear(slider.value));
    btnIncrease.addEventListener('click', () => {
      let y = parseInt(slider.value);
      if (y < parseInt(slider.max)) updateYear(y + 1);
    });
    btnDecrease.addEventListener('click', () => {
      let y = parseInt(slider.value);
      if (y > parseInt(slider.min)) updateYear(y - 1);
    });
    climberDropdown.addEventListener('change', () => updateYear(slider.value));