export default async function handler(req, res) {
  // Разрешаем CORS, чтобы запросы не блокировались локально
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, contact, service } = req.body || {};

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ error: 'Переменные окружения TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не найдены в Vercel.' });
    }

    const text = `📬 *Новая заявка с сайта*\n\n👤 *Имя:* ${name || 'Не указано'}\n📞 *Контакты:* ${contact || 'Не указано'}\n🛠 *Услуга:* ${service || 'Не выбрана'}`;

    // Добавляем контроллер таймаута на 8 секунд
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'Markdown',
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseData = await telegramResponse.json();

    if (telegramResponse.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: 'Ошибка Telegram API', details: responseData });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Внутренняя ошибка сервера' });
  }
}
