const toggleFilterMenu = () => {
    const filterMenu = document.getElementById('filterMenu');
    if (filterMenu.style.display === 'none' || filterMenu.style.display === '') {
        filterMenu.style.display = 'block';
    } else {
        filterMenu.style.display = 'none';
    }
}

const loadPerhekodit = () => {
    fetch('/data/perhekodit.json')
        .then(response => response.json())
        .then(data => {
            displayPerhekodit(data);
        });
}

const displayPerhekodit = (perhekodit) => {
    const dataContainer = document.getElementById('dataContainer');
    dataContainer.innerHTML = '';

    if (perhekodit.length === 0) {
        dataContainer.innerHTML = '<h2 class="error">Hakutuloksia ei löydy valitsemilla kriteereillä</h2>';
        return;
    }

    const isDateWithinAWeek = (date) => {
        const today = new Date();
        const targetDate = new Date(date);
        const diffTime = Math.abs(targetDate - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    perhekodit.forEach(perhekoti => {
        const familyHomeDiv = document.createElement('div');
        familyHomeDiv.className = 'family-home';

        const img = document.createElement('img');
        img.src = perhekoti.perhekoti_kuva_link || '';
        img.alt = perhekoti.nimi;

        const h3 = document.createElement('h3');
        h3.textContent = perhekoti.nimi;

        const paikkakuntaP = document.createElement('p');
        paikkakuntaP.textContent = perhekoti.sijainti;

        const tilaaP = document.createElement('p');
        const hasFreePlaces = perhekoti.vapaat_paikat > 0;
        /*const isFreeSoon = perhekoti.henkilot.some(henkilo => isDateWithinAWeek(henkilo.henkilo1_varattu.loppupvm));
        if (hasFreePlaces) {
            tilaaP.className = 'tilaa';
            tilaaP.textContent = 'Paikkoja vapaana';
        } else if (isFreeSoon) {
            tilaaP.className = 'vapautumassa';
            tilaaP.textContent = 'Paikkoja vapautumassa';
        } else {
            tilaaP.className = 'ei-tilaa';
            tilaaP.textContent = 'Ei vapaita paikkoja';
        }*/

        tilaaP.textContent = perhekoti.vapaat_paikat > 0 ? 'Paikkoja vapaana' : 'Ei vapaita paikkoja';

        const lueLisaButton = document.createElement('button');
        lueLisaButton.className = 'familyhome-button';
        lueLisaButton.textContent = 'Lue lisää';
        lueLisaButton.onclick = () => openFamilyHomeProfile(perhekoti);

        familyHomeDiv.appendChild(img);
        familyHomeDiv.appendChild(h3);
        familyHomeDiv.appendChild(paikkakuntaP);
        familyHomeDiv.appendChild(tilaaP);
        familyHomeDiv.appendChild(lueLisaButton);

        dataContainer.appendChild(familyHomeDiv);
    });
}

// Vain toinen checkbox voi olla valittuna
document.querySelectorAll('.ei-valia').forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
        const id = event.target.id.replace('-ei-valia', '');
        const relatedCheckbox = document.getElementById(id);
        if (event.target.checked) {
            relatedCheckbox.checked = false;
        }
    });
});

document.querySelectorAll('#esteeton, #elaimet, #lapset, #kotisairaanhoito').forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
        const id = event.target.id + '-ei-valia';
        const relatedCheckbox = document.getElementById(id);
        if (event.target.checked) {
            relatedCheckbox.checked = false;
        }
    });
});

const filterPerhekodit = () => {
    const esteeton = document.getElementById('esteeton').checked;
    const esteetonEiValia = document.getElementById('esteeton-ei-valia').checked;
    const elaimet = document.getElementById('elaimet').checked;
    const elaimetEiValia = document.getElementById('elaimet-ei-valia').checked;
    const lapset = document.getElementById('lapset').checked;
    const lapsetEiValia = document.getElementById('lapset-ei-valia').checked;
    const kotisairaanhoito = document.getElementById('kotisairaanhoito').checked;
    const kotisairaanhoitoEiValia = document.getElementById('kotisairaanhoito-ei-valia').checked;
    const paikkakunnat = Array.from(document.querySelectorAll('.paikkakunta:checked')).map(cb => cb.value);
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    fetch('/data/perhekodit.json')
        .then(response => response.json())
        .then(data => {
            const searchTerms = searchInput.split(' ').filter(term => term !== '' && term !== 'hae perhekotia');

            const filteredPerhekodit = data.filter(perhekoti => {
                const paikkakuntaMatch = paikkakunnat.length === 0 || paikkakunnat.includes(perhekoti.sijainti);
                const searchMatch = searchTerms.length === 0 || searchTerms.every(term => 
                    perhekoti.nimi.toLowerCase().includes(term) ||
                    perhekoti.sijainti.toLowerCase().includes(term) ||
                    perhekoti.osoite.toLowerCase().includes(term) ||
                    (term === 'esteetön' && perhekoti.esteeton) ||
                    (term === 'eläimet' && perhekoti.elaimet) ||
                    (term === 'lapset' && perhekoti.lapset) ||
                    (term === 'kotisairaanhoito' && perhekoti.kotisairaanhoito)
                );

                return (esteetonEiValia || perhekoti.esteeton === esteeton) &&
                       (elaimetEiValia || perhekoti.elaimet === elaimet) &&
                       (lapsetEiValia || perhekoti.lapset === lapset) &&
                       (kotisairaanhoitoEiValia || perhekoti.kotisairaanhoito === kotisairaanhoito) &&
                       paikkakuntaMatch &&
                       searchMatch;
            });
            displayPerhekodit(filteredPerhekodit);
        });
}

const openFamilyHomeProfile = (perhekoti) => {
    document.getElementById('modalTitle').textContent = perhekoti.nimi;
    document.getElementById('modalDescription').textContent = perhekoti.yleisselitys;
    document.getElementById('modalLocation').textContent = `Sijainti: ${perhekoti.sijainti}`;
    document.getElementById('modalAddress').textContent = `Osoite: ${perhekoti.osoite}`;
    document.getElementById('modalCriteria').textContent = `Esteetön: ${perhekoti.esteeton ? 'Kyllä' : 'Ei'}, 
    Eläimiä: ${perhekoti.elaimet ? 'Kyllä' : 'Ei'}, Lapsia: ${perhekoti.lapset ? 'Kyllä' : 'Ei'}, Kotisairaanhoito: ${perhekoti.kotisairaanhoito ? 'Kyllä' : 'Ei'}`;
    document.getElementById('modalImage').src = perhekoti.perhekoti_kuva_link;
    document.getElementById('modalPlaces').textContent = `Vapaat paikat: ${perhekoti.vapaat_paikat}, Kaikki paikat: ${perhekoti.kaikki_paikat}`;
    document.getElementById('familyHomeModal').style.display = 'block';
    window.currentPerhekoti = perhekoti; // Store the current perhekoti for later use
}

const closeModal = () => {
    document.getElementById('familyHomeModal').style.display = 'none';
}

const showReservations = () => {
    const perhekoti = window.currentPerhekoti;
    const reservationsContainer = document.getElementById('reservationsContainer');
    const reservations = perhekoti.henkilot.map(henkilo => 
        `<p class="modal-p">Henkilö: ${henkilo.henkilo_id}, Alku pvm: ${henkilo.henkilo1_varattu.alkupvm}, Loppu pvm: ${henkilo.henkilo1_varattu.loppupvm}</p>`
    ).join('');
    reservationsContainer.innerHTML = reservations;
    reservationsContainer.style.display = 'block';
    document.getElementById('showReservationsButton').style.display = 'none';
    document.getElementById('closeReservationsButton').style.display = 'inline';
}

const closeReservations = () => {
    document.getElementById('reservationsContainer').style.display = 'none';
    document.getElementById('showReservationsButton').style.display = 'inline';
    document.getElementById('closeReservationsButton').style.display = 'none';
}