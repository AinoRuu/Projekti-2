// Kalenterin käyttö - kirjautuneena
document.addEventListener('DOMContentLoaded', function () {
    const kalenteriLink = document.querySelector('a[href="../kalenteri/kalenteri.html"]');
    const userprofile  = document.querySelector('a[href="../hoitajaprofiili/nurse.html"]'); // Korjattu URL (yksi ylimääräinen 'l' poistettu)
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close');

    function checkLogin(event) {
        const userLoggedIn = localStorage.getItem('userId'); // Tarkistetaan onko käyttäjä kirjautunut
        if (!userLoggedIn) {
            event.preventDefault(); // Estetään linkin toiminta
            console.warn("Käyttäjä ei ole kirjautunut! Mene kirjautumissivulle.");
            loginModal.style.display = 'block'; // Näytetään kirjautumismodali
        }
    }

    // Lisätään tapahtumakuuntelija molemmille linkeille, jos ne löytyvät
    if (kalenteriLink) {
        kalenteriLink.addEventListener('click', checkLogin);
    }
    if (userprofile) {
        userprofile.addEventListener('click', checkLogin);
    }

    // Tarkistetaan, että sulkemisnappi löytyy ja lisätään siihen tapahtumakuuntelija
    if (closeModal) {
        closeModal.addEventListener('click', function () {
            loginModal.style.display = 'none'; // Suljetaan modaali
        });
    }

    // Estetään modaalin sulkeminen, jos klikataan modaalin ulkopuolelle
    window.onclick = function (event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none'; // Suljetaan modaali, jos klikataan sen ulkopuolelle
        }
    };
});
//---------------------------------------------------