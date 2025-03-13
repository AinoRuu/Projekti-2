const DEFAULT_IMAGE = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
    // Globali muuttuja varauksille
    let reservations = [];

    // Renderöi varaukset dynaamisesti
    /*function renderReservations() {
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
            <hr>
          </div>
          `;
        } else {
          varauksetLista.innerHTML += `
          <div id="reservation-${index}" class="varaus">
            <p><strong>Varaus ${index + 1}:</strong></p>
            <p><strong>Aloitus:</strong> ${varaus.aloitus_pvm || ""} ${varaus.aloitus_aika || ""}</p>
            <p><strong>Lopetus:</strong> ${varaus.lopetus_pvm || ""} ${varaus.lopetus_aika || ""}</p>
            <p><strong>Toistuvuus:</strong> ${varaus.toistuvuus ? "Kyllä" : "Ei"}</p>
            <button type="button" onclick="editReservation(${index})">Muokkaa</button>
            <button type="button" onclick="deleteReservation(${index})">Poista</button>
            <hr>
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
    };*/

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

        document.getElementById("Nimi").value = data.Nimi;
        document.getElementById("sukupuoli").value = data.Sukupuoli;
        document.getElementById("ika").value = data.Ikä;
        document.getElementById("email").value = data.Email;
        document.getElementById("puhelin").value = data.Puhelinnro;
        document.getElementById("kuvaus").value = data.Kuvaus;
        document.getElementById("kielet").value = data.Kielet.join(", ");
        document.getElementById("erityisosaaminen").value = data.Erityisosaaminen
          ? data.Erityisosaaminen.join(", ")
          : "";

        const profiilikuvaUrl = data.Profiilikuva_url || DEFAULT_IMAGE;
        document.getElementById("profiilikuva").src = profiilikuvaUrl;
        document.getElementById("profiilikuvanUrl").value = profiilikuvaUrl;

        // Aseta varaukset ja renderöi ne
        /*reservations = data.Varaukset
          ? data.Varaukset.map((r) => ({ ...r, editing: false }))
          : [];
        renderReservations();*/
      } catch (error) {
        console.error(error);
        alert("Virhe haettaessa tietoja");
      }
    });

    // Profiilikuvan URL-muutos päivittää esikatselun
    document.getElementById("profiilikuvanUrl").addEventListener("input", (event) => {
      document.getElementById("profiilikuva").src = event.target.value || DEFAULT_IMAGE;
    });

    // "Poista kuva" -nappi asettaa oletuskuvan
    document.getElementById("poistaKuva").addEventListener("click", () => {
      document.getElementById("profiilikuva").src = DEFAULT_IMAGE;
      document.getElementById("profiilikuvanUrl").value = "";
    });

    // Lisää uusi varaus
    /*document.getElementById("lisaaVaraus").addEventListener("click", () => {
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
    });*/

    // Lähetetään profiili- ja varausmuutokset palvelimelle
    document.getElementById("editForm").addEventListener("submit", async (event) => {
      event.preventDefault();

      // Varmista, että kaikki varaukset ovat tallennettu (ei kesken muokkausta)
      /*if (reservations.some((r) => r.editing)) {
        alert("Ole hyvä ja tallenna tai peru muokkaus käynnissä oleville varauksille.");
        return;
      }*/

      const id = localStorage.getItem("userId");
      if (!id) {
        alert("Virhe: Käyttäjä ID puuttuu - kirjaudu sisään uudelleen.");
        return;
      }

      const updatedData = {
        Nimi: document.getElementById("Nimi").value,
        Sukupuoli: document.getElementById("sukupuoli").value,
        Ikä: parseInt(document.getElementById("ika").value, 10),
        Email: document.getElementById("email").value,
        Puhelinnro: document.getElementById("puhelin").value,
        Kuvaus: document.getElementById("kuvaus").value,
        Kielet: document
          .getElementById("kielet")
          .value.split(",")
          .map((k) => k.trim()),
        Erityisosaaminen: document
          .getElementById("erityisosaaminen")
          .value.split(",")
          .map((e) => e.trim()),
        Profiilikuva_url: document.getElementById("profiilikuvanUrl").value || DEFAULT_IMAGE,
        /*Varaukset: reservations.map((r) => ({
          aloitus_pvm: r.aloitus_pvm,
          aloitus_aika: r.aloitus_aika,
          lopetus_pvm: r.lopetus_pvm,
          lopetus_aika: r.lopetus_aika,
          toistuvuus: r.toistuvuus,
        })),*/
      };

      try {
        const response = await fetch(`http://localhost:3000/hoitaja/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
          alert("Virhe päivitettäessä tietoja - Yritä uudelleen.");
          return;
        }

        alert("Tiedot päivitetty onnistuneesti!");
      } catch (error) {
        console.error(error);
        alert("Virhe päivitettäessä tietoja - Yritä uudelleen.");
      }
    });

    document.getElementById("deleteProfile").addEventListener("click", async () => {
      const id = localStorage.getItem("userId");

      if (!id) {
        alert("Virhe: Käyttäjätunnusta ei löydy. Kirjaudu sisään.");
        return;
      }

      const confirmDelete = confirm("Haluatko varmasti poistaa profiilisi pysyvästi?");
      if (!confirmDelete) return;

      try {
        // Lähetetään poistopyyntö yhdelle reitille, joka poistaa käyttäjän molemmista tiedostoista
        const response = await fetch(`http://localhost:3000/users/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorMessage = await response.json();
          alert("Virhe poistettaessa profiilia: " + errorMessage.error);
          return;
        }

        alert("Profiilisi on poistettu onnistuneesti.");
        localStorage.removeItem("userId");
        window.location.href = "/"; // Ohjaa käyttäjän etusivulle

      } catch (error) {
        console.error("Virhe profiilia poistaessa:", error);
        alert("Jotain meni pieleen. Yritä uudelleen.");
      }
    });

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
    
          document.getElementById("nimi").value = perhekoti.nimi;
          document.getElementById("sijainti").value = perhekoti.sijainti;
          document.getElementById("osoite").value = perhekoti.osoite;
          document.getElementById("esteeton").value = perhekoti.esteeton ? "Kyllä" : "Ei";
          document.getElementById("elaimet").value = perhekoti.elaimet ? "Kyllä" : "Ei";
          document.getElementById("lapset").value = perhekoti.lapset ? "Kyllä" : "Ei";
          document.getElementById("kotisairaanhoito").value = perhekoti.kotisairaanhoito ? "Kyllä" : "Ei";
          document.getElementById("yleisselitys").value = perhekoti.yleisselitys;
          document.getElementById("vapaat_paikat").value = perhekoti.vapaat_paikat;
          document.getElementById("kaikki_paikat").value = perhekoti.kaikki_paikat;

          //document.getElementById("henkilot").value = data.henkilot
          //? perhekoti.henkilot.join(", ")
          //: "";
    
          
    
          const FAMILY_DEFAULT_IMAGE = "https://tjh.com/wp-content/uploads/2023/06/TJH_HERO_TJH-HOME@2x-1.webp";
          
          const perhekotiprofiilikuvaUrl = perhekoti.perhekoti_kuva_link || FAMILY_DEFAULT_IMAGE;
          document.getElementById("perhekoti_kuva").src = perhekotiprofiilikuvaUrl;
          document.getElementById("perhekoti_kuvaURL").value = perhekotiprofiilikuvaUrl;

    
      } catch (error) {
          console.error(error);
          alert("Virhe haettaessa tietoja");
      }
    });