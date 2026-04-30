(function () {
  const head = document.head;

  function addCss(href) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    head.appendChild(link);
  }

  function addJS(src) {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    head.appendChild(script);
  }

  // BOOTSTRAP lokalno iz vendor foldera
  addCss("./vendor/bootstrap/bootstrap.min.css");
  addJS("./vendor/bootstrap/bootstrap.bundle.min.js");

  // CSS
  addCss("./css/styles.css");
})();