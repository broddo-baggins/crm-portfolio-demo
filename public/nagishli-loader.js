/**
 * Loads the NagishLi accessibility plugin, and the jQuery it needs, on deployed hosts only.
 * An external file instead of inline scripts so the Content-Security-Policy can stay
 * free of 'unsafe-inline', and nothing else on the page depends on jQuery.
 */
(function () {
  var host = location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return;

  // Silence NagishLi's own debug warnings, nothing else
  var originalWarn = console.warn;
  console.warn = function () {
    var message = arguments[0];
    if (
      typeof message === 'string' &&
      (message.indexOf('נגיש לי') !== -1 ||
        message.indexOf('NagishLi') !== -1 ||
        message.indexOf('jQuery not loaded yet for Nagish') !== -1)
    ) {
      return;
    }
    return originalWarn.apply(console, arguments);
  };

  function load(src, attrs, onload) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    for (var key in attrs) script.setAttribute(key, attrs[key]);
    script.onload = onload;
    script.onerror = function () {
      originalWarn.call(console, 'NagishLi accessibility plugin unavailable: failed to load ' + src);
    };
    document.head.appendChild(script);
  }

  load(
    'https://code.jquery.com/jquery-3.7.1.min.js',
    { integrity: 'sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=', crossorigin: 'anonymous' },
    function () {
      load('/nagishli/nagishli_beta.js?v=3.0b', { charset: 'utf-8' });
    },
  );
})();
