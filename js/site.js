// Entry point loaded by every page via <script type="module" src="/js/site.js">.
// Each concern lives in its own module under js/components/.

import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { appendSharedScripts } from './components/shared-scripts.js';
import { initLinkHighlight } from './components/link-highlight.js';
import { initLinkPreviews } from './components/link-preview.js';
import { initFigureAnimations } from './components/figure.js';

function init() {
  var pageKey = document.body.dataset.page || '';
  var header = document.getElementById('site-header');
  var footer = document.getElementById('site-footer');

  if (header) {
    header.innerHTML = renderHeader(pageKey);
  }

  if (footer) {
    footer.innerHTML = renderFooter();
  }

  appendSharedScripts();
  initLinkHighlight();
  initLinkPreviews();
  initFigureAnimations();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
