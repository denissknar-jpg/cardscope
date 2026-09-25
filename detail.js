const hero = document.getElementById('detailHero');
const content = document.getElementById('detailContent');

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function getRank() {
  return new URLSearchParams(window.location.search).get('rank');
}

function renderNotFound(message) {
  hero.innerHTML = `<a class="back-link" href="index.html#compare">← Назад к сравнению</a><div class="detail-error"><h1>Сервис не найден</h1><p>${escapeHtml(message)}</p></div>`;
  content.innerHTML = '';
}

function yesNo(value) {
  return value === 'Да / Да' ? 'Apple Pay и Google Pay' : value === 'Да / Нет' ? 'Apple Pay' : value === 'Нет / Да' ? 'Google Pay' : 'Не указано';
}

function getInitials(name) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function getLogo(card) {
  const domain = new URL(card.website).hostname;
  const logoUrl = `https://logo.clearbit.com/${domain}`;
  const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  return `<span class="service-logo detail-logo" aria-label="Логотип ${escapeHtml(card.name)}"><span>${escapeHtml(getInitials(card.name))}</span><img src="${logoUrl}" alt="" loading="lazy" onerror="this.onerror=function(){this.remove()};this.src='${fallbackUrl}'"></span>`;
}

function renderHero(card) {
  hero.innerHTML = `
    <div class="detail-shell">
      <div class="detail-breadcrumbs"><a href="index.html">Главная</a><span>/</span><a href="index.html#compare">Виртуальные карты</a><span>/</span><strong>${escapeHtml(card.name)}</strong></div>
      <a class="back-link" href="index.html#compare">← Назад к сравнению</a>
      <div class="detail-heading">
        <div class="detail-title-row">${getLogo(card)}<div><span class="eyebrow">Виртуальная карта · позиция №${card.rank}</span><h1>${escapeHtml(card.name)}</h1><p>${escapeHtml(card.features)}</p></div></div>
        <div class="detail-hero-actions"><div class="detail-rating"><strong>${escapeHtml(card.rating)}</strong><span>${card.reviews} отзывов</span></div><a class="hero-official-button" href="${escapeHtml(card.website)}" target="_blank" rel="noreferrer">Официальный сайт ↗</a></div>
      </div>
      <div class="detail-hero-copy"><h2>${escapeHtml(card.name)} для онлайн-платежей и цифровых сервисов</h2><p>На этой странице собраны доступные сведения о выпуске, обслуживании, пополнении, сроке действия и поддерживаемых валютах. Условия нужно сверить на официальном сайте перед заказом.</p></div>
      <div class="detail-stats"><div><strong>${escapeHtml(card.issue)}</strong><span>стоимость выпуска</span></div><div><strong>${escapeHtml(card.service)}</strong><span>обслуживание</span></div><div><strong>${escapeHtml(card.topup)}</strong><span>пополнение</span></div><div><strong>${escapeHtml(card.validity)}</strong><span>срок действия</span></div></div>
      <div class="detail-chips"><span>✓ ${escapeHtml(card.currencies)}</span><span>✓ ${escapeHtml(yesNo(card.wallets))}</span><span>✓ ${escapeHtml(card.binCountry)}</span></div>
    </div>`;
}

function renderContent(card) {
  const officialLink = escapeHtml(card.website);
  content.innerHTML = `
    <div class="container detail-layout">
      <aside class="detail-sidebar">
        <div class="toc"><strong>Содержание</strong><a href="#about">О сервисе</a><a href="#brief">Кратко</a><a href="#payments">Для чего подходит</a><a href="#wallet">Apple Pay / Google Pay</a><a href="#tariffs">Условия и тарифы</a><a href="#issue">Как оформить</a><a href="#topup">Как пополнить</a><a href="#reviews">Отзывы</a><a href="#faq">FAQ</a></div>
        <div class="order-panel sidebar-order"><span class="eyebrow">Заказ карты</span><h2>Готовы проверить условия?</h2><p>Партнёрская ссылка будет добавлена сюда после её предоставления.</p><button class="order-button" type="button" disabled>Заказать карту</button><small>Сейчас кнопка заказа неактивна, чтобы не направлять пользователя по неподтверждённой партнёрской ссылке.</small></div>
      </aside>
      <div class="detail-main">
        <section class="detail-section" id="about"><span class="eyebrow">О сервисе</span><h2>${escapeHtml(card.name)}: основные сведения</h2><p>Сервис находится в рейтинге виртуальных карт. В исходной таблице он отмечен как «${escapeHtml(card.features)}». Ниже показаны только сведения, переданные в Rate.xlsx; дополнительные параметры не предполагаются без отдельной проверки.</p><div class="source-note">Источник: Rate.xlsx · текущий статус публикации: данные требуют проверки.</div></section>
        <section class="detail-section" id="brief"><span class="eyebrow">Кратко</span><h2>Что важно знать</h2><div class="pros-cons-grid"><div><h3>Преимущества по таблице</h3><ul class="check-list"><li>Выпуск: ${escapeHtml(card.issue)}</li><li>Обслуживание: ${escapeHtml(card.service)}</li><li>Поддерживаемые валюты: ${escapeHtml(card.currencies)}</li><li>Срок действия: ${escapeHtml(card.validity)}</li></ul></div><div><h3>Что нужно уточнить</h3><ul class="check-list warning-list"><li>Актуальную комиссию за пополнение</li><li>Ограничения по операциям и регионам</li><li>Требования к регистрации и идентификации</li><li>Условия возврата и поддержки</li></ul></div></div></section>
        <section class="detail-section" id="payments"><span class="eyebrow">Сценарии</span><h2>Для чего может подойти карта</h2><p>Назначение зависит от правил сервиса и конкретного продавца. Перед оплатой проверьте ограничения на официальном сайте.</p><div class="scenario-grid"><div><strong>Онлайн-покупки</strong><span>Цифровые товары и интернет-магазины, если операция разрешена.</span></div><div><strong>Подписки</strong><span>Регулярные платежи в совместимых зарубежных сервисах.</span></div><div><strong>Путешествия</strong><span>Оплата за рубежом при наличии соответствующего сценария использования.</span></div><div><strong>Рабочие сервисы</strong><span>Программы, облачные продукты и другие цифровые инструменты.</span></div></div></section>
        <section class="detail-section" id="wallet"><span class="eyebrow">Кошельки</span><h2>Apple Pay и Google Pay</h2><div class="wallet-card"><strong>${escapeHtml(yesNo(card.wallets))}</strong><span>Исходное значение в таблице: ${escapeHtml(card.wallets)}. Поддержка может зависеть от тарифа, региона и устройства.</span></div></section>
        <section class="detail-section" id="tariffs"><span class="eyebrow">Условия и тарифы</span><h2>Стоимость использования</h2><div class="tariff-list"><div><span>Выпуск карты</span><strong>${escapeHtml(card.issue)}</strong><small>по исходной таблице</small></div><div><span>Обслуживание</span><strong>${escapeHtml(card.service)}</strong><small>по исходной таблице</small></div><div><span>Пополнение</span><strong>${escapeHtml(card.topup)}</strong><small>комиссия требует проверки</small></div><div><span>Срок действия</span><strong>${escapeHtml(card.validity)}</strong><small>по исходной таблице</small></div></div></section>
        <section class="detail-section" id="issue"><span class="eyebrow">Как оформить</span><h2>Порядок заказа карты</h2><div class="steps"><div><b>1</b><span>Изучите условия и ограничения на официальном сайте.</span></div><div><b>2</b><span>Выберите подходящий тариф или тип продукта.</span></div><div><b>3</b><span>Заполните данные и пройдите предусмотренную проверку.</span></div><div><b>4</b><span>Получите реквизиты карты по правилам сервиса.</span></div></div></section>
        <section class="detail-section" id="topup"><span class="eyebrow">Пополнение</span><h2>Как пополнять карту</h2><p>Комиссия пополнения в исходной таблице указана как «${escapeHtml(card.topup)}». Способ пополнения, курс конвертации, лимиты и сроки зачисления необходимо сверить перед операцией.</p><div class="notice">Не пополняйте карту, пока не проверили конечную сумму комиссии и реквизиты в личном кабинете сервиса.</div></section>
        <section class="detail-section" id="reviews"><span class="eyebrow">Отзывы</span><h2>Рейтинг пользователей</h2><div class="review-summary"><strong>${escapeHtml(card.rating)}</strong><span>из 5 · ${card.reviews} отзывов в исходной таблице</span></div><div class="review-placeholder">Отзывы будут добавлены после подключения собственной формы и модерации. Мы не переносим тексты и персональные данные с чужих сайтов.</div></section>
        <section class="detail-section" id="faq"><span class="eyebrow">FAQ</span><h2>Частые вопросы</h2><div class="faq-list"><details><summary>Какая стоимость выпуска?</summary><p>В таблице указано: ${escapeHtml(card.issue)}. Перед заказом проверьте актуальную цену.</p></details><details><summary>Есть ли ежемесячное обслуживание?</summary><p>В исходных данных указано: ${escapeHtml(card.service)}. Условия могут меняться.</p></details><details><summary>Какая комиссия за пополнение?</summary><p>В таблице указано: ${escapeHtml(card.topup)}. Точную комиссию и способ расчёта нужно уточнить у сервиса.</p></details><details><summary>Поддерживаются ли Apple Pay и Google Pay?</summary><p>${escapeHtml(yesNo(card.wallets))}. Проверьте совместимость тарифа и устройства.</p></details></div></section>
      </div>
    </div>`;
}

async function init() {
  const rank = getRank();
  if (!rank) return renderNotFound('В URL не указан номер сервиса.');
  try {
    const response = await fetch('data/card-comparison.json');
    if (!response.ok) throw new Error('Catalog unavailable');
    const cards = await response.json();
    const card = cards.find((item) => String(item.rank) === String(rank));
    if (!card) return renderNotFound('Проверьте ссылку и вернитесь к рейтингу.');
    document.title = `${card.name} — CardScope`;
    renderHero(card);
    renderContent(card);
  } catch (error) {
    renderNotFound('Каталог временно недоступен. Откройте страницу через локальный сервер.');
  }
}

init();
