//console.log("i'm here");


const hamburger = document.querySelector('.hamburger');
const menu = document.querySelector('.nav-menu');
hamburger.addEventListener('click', () => {
    menu.classList.toggle('active');
});