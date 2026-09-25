import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const cardsPath = path.join(process.cwd(), 'data', 'card-comparison.json');
const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
const keywords = [
  'chatgpt', 'netflix', 'midjourney', 'spotify', 'github',
  'apple pay', 'google pay', 'steam', 'amazon', 'figma',
  'adobe', 'canva', 'booking', 'airbnb', 'uber',
  'discord', 'telegram', 'notion', 'trello', 'slack'
];

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

async function scanCard(card) {
  const domain = getDomain(card.website);
  const urlsToCheck = [
    `https://${domain}`,
    `https://${domain}/pricing`,
    `https://${domain}/faq`,
    `https://${domain}/features`
  ];
  const foundKeywords = new Set();

  for (const url of urlsToCheck) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
      });

      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);
        const bodyText = $('body').text().toLowerCase();
        const metaDescription = $('meta[name="description"]').attr('content')?.toLowerCase() || '';
        const fullText = `${bodyText} ${metaDescription}`;

        for (const keyword of keywords) {
          if (fullText.includes(keyword)) foundKeywords.add(keyword);
        }

        if (foundKeywords.size > 0) break;
      }
    } catch {
      // Continue to the next candidate URL when a site blocks or times out.
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    name: card.name,
    domain,
    status: foundKeywords.size > 0 ? '✅ Найдены совпадения' : '⚠️ Требуется ручная проверка',
    found: Array.from(foundKeywords).join(', ') || 'нет',
    currentSupported: card.supportedServices || []
  };
}

async function main() {
  console.log('🚀 Начинаем автоматическую проверку 30 сайтов...\n');
  const results = [];

  for (const card of cards) {
    try {
      results.push(await scanCard(card));
    } catch {
      results.push({
        name: card.name,
        domain: getDomain(card.website),
        status: '⚠️ Требуется ручная проверка',
        found: 'нет',
        currentSupported: card.supportedServices || []
      });
    }
  }

  console.log('📊 РЕЗУЛЬТАТЫ ПРОВЕРКИ:\n');
  console.log('='.repeat(100));
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}`);
    console.log(`   Домен: ${result.domain}`);
    console.log(`   Статус: ${result.status}`);
    console.log(`   Найденные ключевые слова: ${result.found}`);
    console.log(`   Текущие supportedServices: ${result.currentSupported.length > 0 ? result.currentSupported.join(', ') : 'пусто'}`);
    console.log('-'.repeat(100));
  });

  console.log('\n💡 РЕКОМЕНДАЦИИ:');
  console.log('1. Совпадения ключевых слов — повод проверить доступность сервиса вручную; это не подтверждение оплаты.');
  console.log('2. Сайты без совпадений или доступных страниц требуют ручной проверки.');
  console.log('3. supportedServices обновляется вручную в data/card-comparison.json после подтверждения.');
}

main().catch((error) => {
  console.error('Compatibility check failed:', error.message);
  process.exitCode = 1;
});
