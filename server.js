const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const { dirname } = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Kaikki tiedostot, jotka käyttää js/css jne, public kansioon, jotta
// serveri osaa käyttää niitä.
app.use(express.static("public"));
app.use('/data', express.static('data'));

// Oletussivu, joka avautuu aina palvelimen juuresta
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/etusivu/getStarted.html");
});

// --------------------------------------------------------------------------------------------

// Tiedostojen polut
const USERS_FILE = "data/users.json";
const HOITAJAT_FILE = "data/hoitajat.json";
const PERHEKOTI_FILE = "data/perhekodit.json";

// Lue tiedostot
const readFile = (file) => {
  return JSON.parse(fs.readFileSync(file, "utf8"));
};

// Kirjoita tiedostoon
const writeFile = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
};
// --------------------------------------------------------------------------------------------

// Hae hoitajan profiilitiedot ID:llä
app.get("/hoitaja/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const users = readFile(USERS_FILE).users;
  const hoitajat = readFile(HOITAJAT_FILE).hoitajat;

  const user = users.find((u) => u.Id === id);
  const hoitaja = hoitajat.find((h) => h.Id === id);

  if (user && hoitaja) {
    res.json({ ...user, ...hoitaja });
  } else {
    res.status(404).json({ error: "Hoitajaa ei löydy" });
  }
});
// --------------------------------------------------------------------------------------------
// MUOKKAA HOITAJAN TIEDOT
app.put("/hoitaja/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const users = readFile(USERS_FILE);
  const hoitajat = readFile(HOITAJAT_FILE);
  const { Nimi, Sukupuoli, Ikä, Email, Puhelinnro, Kuvaus, Kielet, Erityisosaaminen, /*Kiertava*/ Profiilikuva_url, Varaukset, /*Perhekoti*/ } = req.body;

  const hoitajaIndex = hoitajat.hoitajat.findIndex(h => h.Id === id);

  if (hoitajaIndex !== -1) {
      hoitajat.hoitajat[hoitajaIndex] = {
          ...hoitajat.hoitajat[hoitajaIndex],
          Nimi,
          Sukupuoli,
          Ikä: parseInt(Ikä, 10),
          Email,
          Puhelinnro,
          Kuvaus,
          Kielet,
          Erityisosaaminen,
          /*Kiertava: typeof Kiertava === 'boolean',*/
          Profiilikuva_url,
          Varaukset: Varaukset || hoitajat.hoitajat[hoitajaIndex].Varaukset,
        //  Perhekoti: parseInt(Perhekoti, 10),
      };

      writeFile(HOITAJAT_FILE, hoitajat);
      res.json({ message: "Tiedot päivitetty onnistuneesti!" });
  } else {
      res.status(404).json({ error: "Hoitajaa ei löydy" });
  }
});
// --------------------------------------------------------------------------------------------
// Poista käyttäjä ID:llä sekä hoitajista että käyttäjistä
app.delete("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const users = readFile(USERS_FILE);
  const hoitajat = readFile(HOITAJAT_FILE);

  // Etsi indeksit molemmista tiedostoista
  const userIndex = users.users.findIndex((u) => u.Id === id);
  const hoitajaIndex = hoitajat.hoitajat.findIndex((h) => h.Id === id);

  if (userIndex === -1 && hoitajaIndex === -1) {
    return res.status(404).json({ error: "Käyttäjää ei löydy" });
  }

  // Poistetaan käyttäjä ja hoitaja, jos ne löytyvät
  if (userIndex !== -1) {
    users.users.splice(userIndex, 1);
    writeFile(USERS_FILE, users);
  }

  // Poistetaan hoitaja, jos se löytyy
  if (hoitajaIndex !== -1) {
    hoitajat.hoitajat.splice(hoitajaIndex, 1);
    writeFile(HOITAJAT_FILE, hoitajat);
  }

  res.json({ message: "Käyttäjä poistettu onnistuneesti!" });
});
// --------------------------------------------------------------------------------------------
// KÄYTTÄJÄN REKISTERÖINTI -->
app.post("/register", (req, res) => {
  try {
    // Luetaan tiedostot
    const users = readFile(USERS_FILE);
    const hoitajat = readFile(HOITAJAT_FILE);

    // Otetaan pyynnöstä tiedot
    const { Username, Email, Password, Nimi, Sukupuoli, Ikä, Puhelinnro, Kuvaus, Kielet, Erityisosaaminen, Profiilikuva_url, /*Perhekoti*/ } = req.body;

    // Tarkistetaan, että kaikki pakolliset kentät on täytetty
    if (!Username || !Email || !Password || !Nimi || !Sukupuoli || !Ikä || !Puhelinnro || !Kuvaus) {
      return res.status(400).json({ error: "Käyttäjänimi, Sähköposti, Salasana, Nimi, Sukupuoli, Ikä, Puhelinnumero, Kuvaus ovat pakollisia!" });
    }

    // Tarkistetaan, onko käyttäjänimi tai sähköposti jo käytössä
    const userExists = users.users.some(user => user.Username === Username);
    const emailExists = users.users.some(user => user.Email === Email);

    // Jos käyttäjänimi tai sähköposti on jo käytössä, palautetaan virhe
    if (userExists) {
      return res.status(400).json({ error: "Käyttäjänimi on jo käytössä. Syötä kelvollinen käyttäjänimi!" });
    }

    if (emailExists) {
      return res.status(400).json({ error: "Sähköposti on jo rekisteröity! Syötä kelvollinen sähköposti, jota ei ole vielä rekistöröity palveluun!" });
    }

    // Tarkistus profiilikuva-url:lle
    const kelvollisetPaatteet = /\.(jpg|jpeg|png|webp)$/i; // hyväksytyt kuvatiedostopäätteet
    const onKelvollinenUrl = Profiilikuva_url && Profiilikuva_url.startsWith("https") && kelvollisetPaatteet.test(Profiilikuva_url);

    if (Profiilikuva_url && !onKelvollinenUrl) {
      return res.status(400).json({ error: "Syötä kelvollinen URL, joka sisältää https ja kuvatiedostopäätteen kuten .jpg, .jpeg, .png, tai .webp." });
    }

    // Luodaan uusi käyttäjä ja hoitaja
    const maxUserId = users.users.length ? Math.max(...users.users.map(u => u.Id)) : 0;
    const newId = maxUserId + 1;

    // Jos profiilikuva_url on tyhjä, käytetään default kuvaa
    let profiilikuvaUrl = Profiilikuva_url || "https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg";

    const newUser = {
      Id: newId,
      Username,
      Email,
      Password,
      Role: 1
    };

    const newHoitaja = {
      Id: newId,
      Nimi,
      Sukupuoli,
      Ikä: parseInt(Ikä, 10) || null,  // Ikä varmistetaan numeroksi
      Email,
      Puhelinnro,
      Kuvaus,
      Kielet: Array.isArray(Kielet) ? Kielet : [],
      Erityisosaaminen: Array.isArray(Erityisosaaminen) ? Erityisosaaminen : [],
      Kiertava: true, // Oletusarvona true
      Profiilikuva_url: profiilikuvaUrl,
      Varaukset: [],
      /*Perhekoti: parseInt(Perhekoti, 10) || null,*/

    };

    // Lisätään uusi käyttäjä ja hoitaja tiedostoon
    users.users.push(newUser);
    hoitajat.hoitajat.push(newHoitaja);

    writeFile(USERS_FILE, users);
    writeFile(HOITAJAT_FILE, hoitajat);

    //  Palautetaan vastaus (201 sekä uudelleenohjauspolku) frontendille:
    res.status(201).json({ success: true, message: "Rekisteröinti onnistui!", redirect: "./login.html" });

  } catch (error) {
    console.error("Virhe rekisteröinnissä:", error);
    res.status(500).json({ error: "Järjestelmävirhe, yritä uudelleen" });
  }
});
// --------------------------------------------------------------------------------------------
// Hae kaikki perhekodit
app.get("/perhekodit", (req, res) => {
  const perhekodit = readFile(PERHEKOTI_FILE);
  res.json(perhekodit);
});
// --------------------------------------------------------------------------------------------
// Hae perhekoti ID:llä
app.get("/perhekoti/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const perhekodit = readFile(PERHEKOTI_FILE);

  const perhekoti = perhekodit.find((p) => p.Id === id);

  if (perhekoti) {
    res.json(perhekoti);
  } else {
    res.status(404).json({ error: "Perhekotia ei löytynyt" });
  }
});
// --------------------------------------------------------------------------------------------
// LISÄÄ PERHEKOTI
app.post("/perhekoti", (req, res) => {
  try {
    // Haetaan perhekotitiedot
    const perhekodit = readFile(PERHEKOTI_FILE) || [];

    // Otetaan pyynnöstä perhekodin tiedot
    const { nimi, sijainti, osoite, esteeton, elaimet, lapset, kotisairaanhoito, perhekoti_kuva_link, vapaat_paikat, kaikki_paikat, yleisselitys } = req.body;

    // Tarkistetaan, että kaikki pakolliset kentät on täytetty
    if (!nimi || !sijainti || !osoite || vapaat_paikat === undefined || kaikki_paikat === undefined || !perhekoti_kuva_link || !yleisselitys) {
      return res.status(400).json({ error: "Kaikki kentät ovat pakollisia!" });
    }

    // Luo uusi perhekoti-objekti
    const newPerhekoti = {
      Id: perhekodit.length + 1, // Perhekodille annetaan ID perhekotien määrän mukaan
      nimi,
      sijainti,
      osoite,
      esteeton: !!esteeton, // Muutetaan true/false arvoiksi
      elaimet: !!elaimet,
      lapset: !!lapset,
      kotisairaanhoito: !!kotisairaanhoito,
      perhekoti_kuva_link,
      vapaat_paikat,
      kaikki_paikat,
      yleisselitys,
      henkilot: [] // Henkilöitä voi lisätä myöhemmin
    };

    // Lisätään uusi perhekoti listaan
    perhekodit.push(newPerhekoti);

    // Tallennetaan tiedot takaisin tiedostoon
    writeFile(PERHEKOTI_FILE, perhekodit);

    // Palautetaan onnistumisviesti
    res.status(201).json({ success: true, message: "Perhekoti lisätty onnistuneesti!" });

  } catch (error) {
    console.error("Virhe perhekodin lisäyksessä:", error);
    res.status(500).json({ error: "Järjestelmävirhe, yritä uudelleen" });
  }
});
// --------------------------------------------------------------------------------------------
// MUOKKAA PERHEKOTI TIEDOT
app.put("/perhekoti/:id", (req, res) => {

  // Tulossa

});
// --------------------------------------------------------------------------------------------
// MUOKKAA KALENTERIN TIEDOT
app.put("/kalenteri/:id", (req, res) => {
s
  // Tulossa ehkä?

});

// --------------------------------------------------------------------------------------------
// Käynnistetään serveri
// Mene osoitteeseen http://localhost:3000/ - näet sivun!
app.listen(PORT, () => {
  console.log(`Serveri käynnissä osoitteessa http://localhost:${PORT}/ (Nyt kaikki sivut toimii ilman Live Serveriä!)`);
});

