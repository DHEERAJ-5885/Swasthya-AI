const fs = require('fs');
const files = ['en.json', 'hi.json', 'te.json'];
const updates = {
  'en.json': {
    nav: {
      mainMenu: "Main Menu",
      accountSettings: "Account Settings"
    }
  },
  'hi.json': {
    nav: {
      mainMenu: "मुख्य मेनू",
      accountSettings: "खाता सेटिंग"
    }
  },
  'te.json': {
    nav: {
      mainMenu: "ప్రధాన మెను",
      accountSettings: "ఖాతా సెట్టింగ్‌లు"
    }
  }
};
files.forEach(f => {
  const path = 'src/i18n/locales/' + f;
  let data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.nav = data.nav || {};
  Object.assign(data.nav, updates[f].nav);
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
});
