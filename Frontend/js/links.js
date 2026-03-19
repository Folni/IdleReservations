(function () {
  const head = document.head;

  function addCss(href) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    head.appendChild(link);
  }

  function addJs(src) {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    head.appendChild(script);
  }

  // BOOTSTRAP (from node_modules)
  addCss("./node_modules/bootstrap/dist/css/bootstrap.min.css");
  addJs("./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js");

  //  CSS
  addCss("./css/styles.css");

})();