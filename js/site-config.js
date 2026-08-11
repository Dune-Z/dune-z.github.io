// Site identity and navigation. Edit here to change the header/footer.

export var site = {
  name: 'Yifei Zuo',
  email: 'yifeizuo2029@u.northwestern.edu',
  scholarUrl: 'https://scholar.google.com/citations?user=fWUxfTEAAAAJ&hl=en&oi=ao'
};

export var navItems = [
  { href: '/', label: 'About', key: 'about' },
  { href: site.scholarUrl, label: 'Scholar', key: 'scholar', external: true },
  { href: 'https://github.com/Yifei-Zuo', label: 'GitHub', key: 'github', external: true },
  { href: 'https://x.com/YifeiZuoX', label: '𝕏', key: 'x', external: true, ariaLabel: 'X' }
];
