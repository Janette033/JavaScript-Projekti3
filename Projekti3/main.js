// Hakee teatterit Finnkinon API:sta ja täyttää pudotusvalikon
// Suoritetaan AJAX-pyyntö jQueryllä
function etsiTeattereita() {
    $.ajax({
        url: "https://www.finnkino.fi/xml/TheatreAreas/", // Osoite, josta tiedot haetaan
        type: 'GET', // Pyynnön tyyppi
        dataType: 'xml', // Data XML 
        success: function(data) {  // Tarkistetaan onnistuiko pyyntö 
            const theaters = $(data).find('TheatreArea'); // Haetaan Finnkinon teatterit XML-datasta jQueryn avulla
            const theaterSelect = document.getElementById('teatteriSelect'); // Haetaan pudotusvalikko html-tiedostosta
    
            // Lisää teatterit pudotusvalikkoon
            theaters.each(function() { // Käydään läpi kaikki teatterit, "this" viittaa käsiteltäviin elementteihin
                const vaihtoehto = document.createElement('option'); // Luodaan vaihtoehto elementti
                vaihtoehto.value = $(this).find('ID').text(); // Asetetaan arvo etsimällä ID ja lukemalla sen tekstisisältö
                vaihtoehto.textContent = $(this).find('Name').text(); // Asetetaan tekstisisältö etsimällä nimi ja lukemalla sen tekstisisältö
                theaterSelect.appendChild(vaihtoehto); // Laitetaan vaihtoehdot pudotusvalikkoon
            });

            // Lisätään tapahtumakuuntelija teatterivalitsimelle
            $('#teatteriSelect').on('change', etsiElokuvat);
        }
    });
}

// Lataa teatterit, kun sivu avataan
etsiTeattereita();

let kaikkiElokuvat = []; // Lista kaikista elokuvista 

// Hakee elokuvat valitusta teatterista ja/tai hakusanan perusteella
function etsiElokuvat() {
    const theaterID = $('#teatteriSelect').val(); // Haetaan valittu teatteri ID jQueryllä
    const hakusana = $('#searchInput').val().toLowerCase(); // Haetaan hakusana ja muutetaan pieniksi kirjaimiksi

    // Haku URL
    const aikatauluUrl = 'https://www.finnkino.fi/xml/Schedule/'; // Haetaan Finnkinon API-aikatauluosoitteesta aikataulutiedot
    const url = `${aikatauluUrl}?area=${theaterID}`; // Rakennetaan haku-URL valitun teatterin perusteella

    // Suoritetaan AJAX-pyyntö jQueryllä
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'xml',
        success: function(data) {
            const shows = $(data).find('Show'); // Haetaan show-elementit XML-datasta

            kaikkiElokuvat = []; // Tyhjennä aiemmat elokuvatulokset

            // Käy läpi elokuvanäytökset
            shows.each(function() {
                const title = $(this).find('Title').text().toLowerCase(); // Haetaan elokuvan nimi ja muutetaan pieniksi kirjaimiksi
                const imageUrl = $(this).find('EventLargeImagePortrait').text(); // Haetaan elokuvan kuva-URL
                const startTime = $(this).find('dttmShowStart').text(); // Haetaan alkamisajankohta
                const duration = $(this).find('LengthInMinutes').text(); // Haetaan kesto minuuteissa

                // Tarkista, että elokuvan nimi vastaa hakusanaa
                if (hakusana && !title.includes(hakusana)) {
                    return; // Ohita, jos elokuvan nimi ei vastaa hakua
                }

                // Lisätään listaan tiedot
                kaikkiElokuvat.push({
                    title: title,
                    imageUrl: imageUrl,
                    startTime: new Date(startTime).toLocaleString('fi-FI'),
                    duration: duration,
                });
            });

            // Kutsutaan funktiota, joka näyttää haetut elokuvat
            näytäElokuvat(kaikkiElokuvat);
        }
    });
}

// Funktio elokuvien näyttämiseen
function näytäElokuvat(elokuvat) {
    const elokuvaContainer = $('#elokuvaContainer');
    elokuvaContainer.empty(); // Tyhjennä aiemmat elokuvanäytöt
                
    // Luo uusi elokuvanäkymä jokaiselle elokuvalle
    elokuvat.forEach(movie => { // Käydään javaScript taulukko läpi forEachilla
        const elokuvaDiv = $('<div></div>').addClass('movie-item border p-2 mb-3 d-flex align-items-center'); // Luodaan div elementti ja lisätään classit
        elokuvaDiv.hide();
        elokuvaDiv.html( // Käytetään Template literalsia +-operaattorin sijaan
            `<img src="${movie.imageUrl}" alt="${movie.title}" style="width: 100px; height: auto; margin-right: 20px;">
            <div>
                <h3>${movie.title}</h3>
                <p>Näytöksen ajankohta: ${movie.startTime}</p>
                <p>Kesto: ${movie.duration} minuuttia</p>
            </div>`
        );
        elokuvaContainer.append(elokuvaDiv); // Lisätään elokuvaDiviin
        elokuvaDiv.fadeIn(600);
    });

    // Jos elokuvia ei löytynyt
    if (elokuvat.length === 0) {
        elokuvaContainer.html("<p>Ei löytynyt elokuvia haun mukaan.</p>"); // Lisätään teksti sivulle
        elokuvaContainer.css('color', 'white'); // Aseta tekstin väri valkoiseksi jQueryllä
    }
}

// Haetaan syöttökenttä ja lisätään tapahtumakuuntelija jQueryllä
$('#searchInput').on('keydown', function(event) { // Lisätään tapahtumakuuntelija
    if (event.key === 'Enter') { // Kun painetaan enteriä
        event.preventDefault();
        etsiElokuvat(); // Kutsu elokuvien hakufunktiota
    }
});


// Funktio, joka palauttaa sivun alkuperäiseen tilaan, kun otsikkoa painaa
function palauta() {
    $('#teatteriSelect').val("1029"); // Palautetaan valittu arvo "1029"
    $('#searchInput').val(''); // Tyhjennetään hakukenttä

    // Animaatio, jonka avulla elokuvat haalistuu pois
    $('#elokuvaContainer').children().each(function() {
        $(this).fadeOut(600);
    });

    // Tyhjennetään elokuvakontainerin sisältö, kun animaatio on valmis
    setTimeout(function() {
        $('#elokuvaContainer').empty(); // Tyhjennetään elokuvakontainerin sisältö
    }, 600); // Varmistetaan, että tyhjennys tapahtuu animaation jälkeen
}









