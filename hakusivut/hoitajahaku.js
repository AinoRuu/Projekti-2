const toggleFilterMenu = () => {
    const filterMenu = document.getElementById('filterMenu');
    if (filterMenu.style.display === 'none' || filterMenu.style.display === '') {
        filterMenu.style.display = 'block';
    } else {
        filterMenu.style.display = 'none';
    }
}

const loadHoitajat = () => {
    fetch('/data/hoitajat.json')
        .then(response => response.json())
        .then(data => {
            displayHoitajat(data.hoitajat);
        });
}

const displayHoitajat = (hoitajat) => {
    const dataContainer = document.getElementById('dataContainer');
    dataContainer.innerHTML = '';

    if (hoitajat.length === 0) {
        dataContainer.innerHTML = '<h2>Hakutuloksia ei löydy näillä kriteereillä</h2>';
        return;
    }

    hoitajat.forEach(hoitaja => {
        const hoitajaDiv = document.createElement('div');
        hoitajaDiv.className = 'hoitaja';

        const img = document.createElement('img');
        img.src = hoitaja.Profiilikuva_url || '';
        img.alt = hoitaja.Nimi;

        const h3 = document.createElement('h3');
        h3.textContent = hoitaja.Nimi;

        const ikaP = document.createElement('p');
        ikaP.textContent = `Ikä: ${hoitaja.Ikä}`;

        const kieletP = document.createElement('p');
        kieletP.textContent = `Kielet: ${hoitaja.Kielet.join(', ')}`;

        const lueLisaButton = document.createElement('button');
        lueLisaButton.textContent = 'Lue lisää';
        lueLisaButton.onclick = () => openHoitajaProfile(hoitaja);

        hoitajaDiv.appendChild(img);
        hoitajaDiv.appendChild(h3);
        hoitajaDiv.appendChild(ikaP);
        hoitajaDiv.appendChild(kieletP);
        hoitajaDiv.appendChild(lueLisaButton);

        dataContainer.appendChild(hoitajaDiv);
    });
}

const filterHoitajat = () => {
    const sukupuoliNainen = document.getElementById('sukupuoliNainen').checked;
    const sukupuoliMies = document.getElementById('sukupuoliMies').checked;
    const kielet = [];
    if (document.getElementById('kieliSuomi').checked) kielet.push('Suomi');
    if (document.getElementById('kieliEnglanti').checked) kielet.push('Englanti');
    if (document.getElementById('kieliRuotsi').checked) kielet.push('Ruotsi');
    if (document.getElementById('kieliRanska').checked) kielet.push('Ranska');
    if (document.getElementById('kieliSaksa').checked) kielet.push('Saksa');
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    fetch('/data/hoitajat.json')
        .then(response => response.json())
        .then(data => {
            const filteredHoitajat = data.hoitajat.filter(hoitaja => {
                const sukupuoliMatch = (!sukupuoliNainen && !sukupuoliMies) || 
                                       (sukupuoliNainen && hoitaja.Sukupuoli === 'Nainen') || 
                                       (sukupuoliMies && hoitaja.Sukupuoli === 'Mies');
                const kieletMatch = kielet.length === 0 || kielet.some(kieli => hoitaja.Kielet.includes(kieli));
                const searchMatch = hoitaja.Nimi.toLowerCase().includes(searchInput) || 
                                    hoitaja.Kielet.some(kieli => kieli.toLowerCase().includes(searchInput));
                return sukupuoliMatch && kieletMatch && searchMatch;
            });
            displayHoitajat(filteredHoitajat);
        });
}

const openHoitajaProfile = (hoitaja) => {
    alert(`Nimi: ${hoitaja.Nimi}\nIkä: ${hoitaja.Ikä}\nKuvaus: ${hoitaja.Kuvaus}\nKielet: ${hoitaja.Kielet.join(', ')}\nErityisosaaminen: ${hoitaja.Erityisosaaminen.join(', ')}`);
}