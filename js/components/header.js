import { site, navItems } from '../site-config.js';
import { escapeHtml } from '../utils/dom.js';

export function renderHeader(pageKey) {
  var links = navItems.map(function (item) {
    var classes = ['custom-link'];
    if (item.key === pageKey) {
      classes.push('is-active');
    }
    var attrs = item.external ? ' target="_blank" rel="noopener noreferrer"' : '';
    if (item.ariaLabel) {
      attrs += ' aria-label="' + escapeHtml(item.ariaLabel) + '" title="' + escapeHtml(item.ariaLabel) + '"';
    }
    return '<a href="' + item.href + '" class="' + classes.join(' ') + '"' + attrs + '>' + item.label + '</a>';
  }).join(' ');

  return [
    '<div class="site-header">',
    '  <div class="site-header__brand">' + escapeHtml(site.name) + '</div>',
    '  <nav class="site-header__nav" aria-label="Primary">' + links + '</nav>',
    '</div>'
  ].join('');
}
