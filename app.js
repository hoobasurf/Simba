function jouer() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("carte").classList.remove("cache");
}

function ouvrir(monde) {

    switch(monde){

        case "savane":
            window.location.href = "jeux/savane.html";
        break;

        case "foret":
            window.location.href = "jeux/foret.html";
        break;

        case "ferme":
            window.location.href = "jeux/ferme.html";
        break;

        case "ocean":
            window.location.href = "jeux/ocean.html";
        break;

        case "espace":
            window.location.href = "jeux/espace.html";
        break;

    }

}
