// Kirjautumisen ja uloskirjautumisen hallinta.
// Kirjautumisen yhteydessä tarkistetaan käyttäjän syöttämät tiedot ja kirjataan käyttäjä sisään (localstorage).
// Uloskirjautumisen yhteydessä kirjataan käyttäjä ulos (localstorage).
// Kirjaudu & Kirjaudu ulos napin toiminnallisuus riippuen, onko käyttäjä kirjautunut sisään vai ei.

document.addEventListener('DOMContentLoaded', function () {

    // Tarkistetaan, onko käyttäjä kirjautunut
    const userId = localStorage.getItem('userId');
    const loginButton = document.getElementById('kirjaudu1');

    if (userId) {
        // Käyttäjä on kirjautunut, näytetään "Kirjaudu ulos" -nappi
        loginButton.innerHTML = 'Kirjaudu ulos' + ' (' + localStorage.getItem('Username') + ')';
        loginButton.onclick = function () {
            logout();
        };

    } else {
        // Käyttäjä ei ole kirjautunut, jatketaan "Kirjaudu" -napilla
        loginButton.onclick = function () {
            window.location.href = '../public/kirjautuminen/login.html';
        };
    }
});

// Kirjautuminen - hallinta
document.getElementById('loginBtn')?.addEventListener('click', function () {
    const username = document.getElementById('username').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    // Fetchataan data...
    fetch('../data/users.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch data!');
            }
            return response.json();
        })
        .then(data => {
            const users = data.users;
            let userFound = null;

            for (const user of users) {
                if (user.Username.toLowerCase() === username || user.Email.toLowerCase() === username) {
                    userFound = user;
                    break;
                }
            }
            // Tarkistetaan, onko käyttäjä löytynyt ja onko salasana oikein
            if (userFound && userFound.Password === password) {
                console.log("Kirjautuminen onnistui, käyttäjä löytyi:", userFound);

                // Tarkistetaan, että käyttäjän tiedot ovat oikein
                if (!userFound.Id || !userFound.Username || !userFound.Email) {
                    console.error("Virhe: Käyttäjän tiedot ovat puutteelliset:", userFound);
                    return;
                }

                // Tallennetaan käyttäjän tiedot localStorageen
                localStorage.setItem('userId', userFound.Id);
                localStorage.setItem('Username', userFound.Username);
                localStorage.setItem('Email', userFound.Email);
                localStorage.setItem('Role', userFound.Role);

                // Tulostetaan käyttäjän tiedot konsoliin
                console.log("Tiedot tallennettu localStorageen:",
                    localStorage.getItem('userId'),
                    localStorage.getItem('Username'),
                    localStorage.getItem('Email'),
                    localStorage.getItem('Role')
                );

                // Näytetään onnistumisviesti käyttäjälle
                const errorMessage = document.getElementById('error-message');
                errorMessage.textContent = "Kirjautuminen onnistui! Sinut ohjataan takaisin pääsivulle...";
                errorMessage.style.color = "#2A4A45";
                errorMessage.style.display = "block";

                // Odota 1,6 sekuntia ja ohjaa käyttäjä etusivulle
                setTimeout(() => {
                    window.location.href = '../etusivu/getStarted.html';
                }, 1600);

            } else {
                displayError('Väärä käyttäjänimi tai salasana. Yritä uudelleen!');
            }
        })// Virheiden käsittely
        .catch(error => {
            displayError('Tapahtui odottamaton virhe. Yritä myöhemmin uudelleen.');
            console.error(error);
        });
});

// Kirjaudu ulos - toiminnallisuus
function logout() {

    // Ilmoitus uloskirjautumisesta
    alert("Hei " + localStorage.getItem('Username') + " (" + localStorage.getItem('Email') + ")" + " Olet kirjautunut onnistuneesti ulos järjestelmästä!");

    // Postetaan käyttäjän tiedot localStoragesta
    localStorage.removeItem('userId');
    localStorage.removeItem('Username');
    localStorage.removeItem('Email');
    localStorage.removeItem('Role');

    console.log("Käyttäjä kirjautui ulos");

    // Päivitetään "Kirjaudu" -nappi ja ohjaa kirjautumissivulle
    const loginButton = document.getElementById('kirjaudu1');
    loginButton.innerHTML = 'Kirjaudu';
    loginButton.onclick = function () {
        window.location.href = 'login_register/login.html';
    };
    // Ladataan sivu uudelleen, jotta uloskirjautuminen astuu voimaan
    location.reload();
    window.location.href = '../etusivu/getStarted.html';

}

// Yleinen virheilmoitus
function displayError(message) {
    // Etsi virheilmoitus-elementti
    let errorMessageElement = document.getElementById('error-message');
    // Luo virheilmoitus-elementti, jos sitä ei ole vielä luotu:
    if (!errorMessageElement) {
        errorMessageElement = document.createElement('h3');
        errorMessageElement.id = 'error-message';
        errorMessageElement.style.color = 'red';
        errorMessageElement.style.textAlign = 'center';
        document.querySelector('.container').appendChild(errorMessageElement);
    }
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
}
