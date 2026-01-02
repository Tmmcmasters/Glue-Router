console.log("app.js loaded and executed!");

document.querySelector("h1").style.color = "red";
document.querySelector("main").insertAdjacentText("afterend", `External Script from ${location.pathname}`)