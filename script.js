const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");


// =========================================================
// OPEN / CLOSE MENU
// =========================================================

menuButton.addEventListener("click", function (event) {

    event.stopPropagation();

    mobileMenu.classList.toggle("active");

});


// =========================================================
// CLOSE MENU WHEN CLICKING OUTSIDE
// =========================================================

document.addEventListener("click", function (event) {

    const clickedInsideMenu = mobileMenu.contains(event.target);
    const clickedMenuButton = menuButton.contains(event.target);

    if (!clickedInsideMenu && !clickedMenuButton) {

        mobileMenu.classList.remove("active");

    }

});


// =========================================================
// CLOSE MENU WHEN CLICKING A MENU LINK
// =========================================================

const menuLinks = mobileMenu.querySelectorAll("a");

menuLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        mobileMenu.classList.remove("active");

    });

});