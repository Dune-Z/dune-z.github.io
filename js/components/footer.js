import { site } from '../site-config.js';
import { escapeHtml } from '../utils/dom.js';

export function renderFooter() {
  return [
    '<hr/>',
    '© <span class="site-footer__email">[' + escapeHtml(site.email) + ']</span>'
  ].join('');
}
