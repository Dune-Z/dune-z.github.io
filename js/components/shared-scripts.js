// Third-party scripts every page needs (MathJax and friends).

export function appendSharedScripts() {
  if (document.querySelector('script[data-site-script="math-code"]')) {
    return;
  }

  [
    { src: '//yihui.org/js/math-code.js', key: 'math-code' },
    { src: '//mathjax.rstudio.com/latest/MathJax.js?config=TeX-MML-AM_CHTML', key: 'mathjax' },
    { src: '//yihui.org/js/center-img.js', key: 'center-img' }
  ].forEach(function (scriptInfo) {
    var script = document.createElement('script');
    script.defer = true;
    script.src = scriptInfo.src;
    script.dataset.siteScript = scriptInfo.key;
    document.body.appendChild(script);
  });
}
