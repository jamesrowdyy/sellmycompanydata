const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

test('public copy does not promise universal eligibility, anonymity, deletion or deadlines', () => {
  const pages = ['index.html','buyers/index.html','refer/index.html','r/index.html','data-valuation/index.html','data-licensing/index.html','llms.txt','llms-full.txt'];
  for (const file of pages) {
    const text = read(file);
    for (const claim of ['labs are not currently buying','Your company is not named','Not when it is done properly','Buyers delete their copies at the end','Originals deleted after processing','Buyers make an offer within one to two weeks','Delivery runs two to three weeks','Typical delivery runs two to three weeks','has a buyer.','the range buyers are paying','Rights cleared per supplying company']) {
      assert.ok(!text.includes(claim), `${file}: ${claim}`);
    }
  }
  assert.match(read('index.html'), /not a market valuation/);
  assert.match(read('index.html'), /introductions to specialist licensing partners/);
  assert.match(read('index.html'), /does not guarantee anonymity or establish licensing rights/);
  assert.match(read('data-licensing/index.html'), /Renewal or resale is not automatic/);
  assert.match(read('data-valuation/index.html'), /manual review/);
});

test('seller FAQ structured data stays in sync with visible answers', () => {
  const html = read('index.html');
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const answers = [...html.matchAll(/<details(?: open)?><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/g)];
  const plain = s => s.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&');
  const faq = schema['@graph'].find(x=>x['@type']==='FAQPage');
  assert.equal(answers.length, faq.mainEntity.length);
  for (const [,question,answer] of answers) {
    assert.equal(faq.mainEntity.find(x=>x.name===plain(question)).acceptedAnswer.text, plain(answer));
  }
});
