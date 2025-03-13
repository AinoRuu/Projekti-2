
const DEFAULT_IMAGE = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
// Globali muuttuja varauksille
let reservations = [];

// Renderöi varaukset dynaamisesti
function renderReservations() {
    const varauksetLista = document.getElementById("varaukset-lista");
    varauksetLista.innerHTML = "";
    if (reservations.length === 0) {
        varauksetLista.innerHTML = "<p>Ei varauksia.</p>";
        return;
    }
    reservations.forEach((varaus, index) => {
        if (varaus.editing) {
            varauksetLista.innerHTML += `
  <div id="reservation-${index}" class="varaus">
    <p><strong>Varaus ${index + 1} (muokkaus):</strong></p>
    <label for="aloitus_pvm_${index}">Aloituspäivämäärä:</label>
    <input type="date" class="aloitus_pvm" id="aloitus_pvm_${index}" value="${varaus.aloitus_pvm || ""
                }" required><br>
    <label for="aloitus_aika_${index}">Aloitusaika:</label>
    <input type="time" class="aloitus_aika" id="aloitus_aika_${index}" value="${varaus.aloitus_aika || ""
                }" required><br>
    <label for="lopetus_pvm_${index}">Lopetuspäivämäärä:</label>
    <input type="date" class="lopetus_pvm" id="lopetus_pvm_${index}" value="${varaus.lopetus_pvm || ""
                }" required><br>
    <label for="lopetus_aika_${index}">Lopetusaika:</label>
    <input type="time" class="lopetus_aika" id="lopetus_aika_${index}" value="${varaus.lopetus_aika || ""
                }" required><br>
    <label for="toistuvuus_${index}">Toistuvuus:</label>
    <input type="checkbox" class="toistuvuus" id="toistuvuus_${index}" ${varaus.toistuvuus ? "checked" : ""
                }><br>
    <button type="button" onclick="saveReservation(${index})">Tallenna varaus</button>
    <button type="button" onclick="cancelEditReservation(${index})">Peruuta</button>

  </div>
  `;
        } else {
            varauksetLista.innerHTML += `
  <div id="reservation-${index}" class="varaus">
    <p><strong>Varaus ${index + 1}:</strong></p><br>
    <p><strong>Aloitus:</strong> ${varaus.aloitus_pvm || ""} ${varaus.aloitus_aika || ""}</p><br>
    <p><strong>Lopetus:</strong> ${varaus.lopetus_pvm || ""} ${varaus.lopetus_aika || ""}</p><br>
    <p><strong>Toistuvuus:</strong> ${varaus.toistuvuus ? "Kyllä" : "Ei"}</p><br>
    <button type="button" onclick="editReservation(${index})">Muokkaa</button>
    <button type="button" onclick="deleteReservation(${index})">Poista</button><br>

  </div>
  `;
        }
    });
}

// Varausten muokkaus-/poisto- ja tallennustoiminnot
window.editReservation = function (index) {
    reservations[index].editing = true;
    renderReservations();
};

window.deleteReservation = function (index) {
    if (confirm("Haluatko varmasti poistaa varauksen?")) {
        reservations.splice(index, 1);
        renderReservations();
    }
};

window.saveReservation = function (index) {
    const container = document.getElementById(`reservation-${index}`);
    const aloitus_pvm = container.querySelector(".aloitus_pvm").value;
    const aloitus_aika = container.querySelector(".aloitus_aika").value;
    const lopetus_pvm = container.querySelector(".lopetus_pvm").value;
    const lopetus_aika = container.querySelector(".lopetus_aika").value;
    const toistuvuus = container.querySelector(".toistuvuus").checked;

    // Päivitä varauksen tiedot ja poista editointitila
    reservations[index] = {
        ...reservations[index],
        aloitus_pvm,
        aloitus_aika,
        lopetus_pvm,
        lopetus_aika,
        toistuvuus,
        editing: false,
    };

    renderReservations();
};

window.cancelEditReservation = function (index) {
    // Jos kyseessä on uusi lisäys, peruuta ja poista varaus kokonaan
    if (reservations[index].isNew) {
        reservations.splice(index, 1);
    } else {
        reservations[index].editing = false;
    }
    renderReservations();
};

// Ladataan profiili ja varaukset kun sivu latautuu
document.addEventListener("DOMContentLoaded", async () => {
    const id = localStorage.getItem("userId");
    if (!id) {
        alert("Virhe: Käyttäjätunnusta ei löydy");
        window.location.href = '../etusivu/getStarted.html';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/hoitaja/${id}`);
        if (!response.ok) {
            alert("Hoitajaa ei löytynyt - kirjaudu sisään!");
            return;
        }
        const data = await response.json();

        document.getElementById("Nimi").textContent = data.Nimi;
        document.getElementById("sukupuoli").textContent = data.Sukupuoli;
        document.getElementById("ika").textContent = data.Ikä;
        document.getElementById("email").textContent = data.Email;
        document.getElementById("puhelin").textContent = data.Puhelinnro;
        document.getElementById("kuvaus").textContent = data.Kuvaus;

        const kieletUl = document.getElementById("kielet");
        kieletUl.innerHTML = "";
        data.Kielet.forEach((kieli) => {
            const li = document.createElement("li");
            li.textContent = kieli;
            kieletUl.appendChild(li);
        });

        const erityisosaaminenUl = document.getElementById("erityisosaaminen");
        erityisosaaminenUl.innerHTML = "";
        if (data.Erityisosaaminen) {
            data.Erityisosaaminen.forEach((osaaminen) => {
                const li = document.createElement("li");
                li.textContent = osaaminen;
                erityisosaaminenUl.appendChild(li);
            });
        }

        const profiilikuvaUrl = data.Profiilikuva_url || DEFAULT_IMAGE;
        document.getElementById("Profiilikuva_url").src = profiilikuvaUrl;

        // Aseta varaukset ja renderöi ne
        reservations = data.Varaukset
            ? data.Varaukset.map((r) => ({ ...r, editing: false }))
            : [];
        renderReservations();
    } catch (error) {
        console.error(error);
        alert("Virhe haettaessa tietoja");
    }
});

// Lisää uusi varaus
document.getElementById("lisaaVaraus").addEventListener("click", () => {
    reservations.push({
        aloitus_pvm: "",
        aloitus_aika: "",
        lopetus_pvm: "",
        lopetus_aika: "",
        toistuvuus: false,
        editing: true,
        isNew: true,
    });
    renderReservations();
});


//perhekoti haku
document.addEventListener("DOMContentLoaded", async () => {
  const id = 1; // Fetch the perhekoti with ID 1

  try {
      const response = await fetch('../data/perhekodit.json');
      if (!response.ok) {
          alert("Perhekotia ei löytynyt - kirjaudu sisään!");
          return;
      }
      const data = await response.json();
      const perhekoti = data.find(pk => pk.Id === id);

      if (!perhekoti) {
          alert("Perhekotia ei löytynyt - kirjaudu sisään!");
          return;
      }

      document.getElementById("nimi").textContent = perhekoti.nimi;
      document.getElementById("sijainti").textContent = perhekoti.sijainti;
      document.getElementById("osoite").textContent = perhekoti.osoite;
      document.getElementById("esteeton").textContent = perhekoti.esteeton ? "Kyllä" : "Ei";
      document.getElementById("elaimet").textContent = perhekoti.elaimet ? "Kyllä" : "Ei";
      document.getElementById("lapset").textContent = perhekoti.lapset ? "Kyllä" : "Ei";
      document.getElementById("kotisairaanhoito").textContent = perhekoti.kotisairaanhoito ? "Kyllä" : "Ei";
      document.getElementById("yleisselitys").textContent = perhekoti.yleisselitys;
      document.getElementById("vapaat_paikat").textContent = perhekoti.vapaat_paikat;
      document.getElementById("kaikki_paikat").textContent = perhekoti.kaikki_paikat;

      

      const FAMILY_DEFAULT_IMAGE = "https://tjh.com/wp-content/uploads/2023/06/TJH_HERO_TJH-HOME@2x-1.webp";
      
        const perhekotikuvaUrl = perhekoti.perhekoti_kuva_link || FAMILY_DEFAULT_IMAGE;
        document.getElementById("perhekoti_kuva").src = perhekotikuvaUrl;


        const henkilotUl = document.getElementById("henkilot");
        henkilotUl.innerHTML = "";
        perhekoti.henkilot.forEach((henkilo) => {
          const li = document.createElement("li");
          li.textContent = `Henkilö ID: ${henkilo.henkilo_id}, Varattu: ${henkilo.henkilo_varattu.alkupvm} - ${henkilo.henkilo_varattu.loppupvm}`;
          henkilotUl.appendChild(li);
      });

  } catch (error) {
      console.error(error);
      alert("Virhe haettaessa tietoja");
  }
});