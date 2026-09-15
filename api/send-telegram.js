export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, contact, message } = req.body;

  const BOT_TOKEN = process.env.8739024849:AAGHlH0890NUD8JYXwveY6E8VlYYDixKrrw;
  const CHAT_ID = process.env.903398593;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const text = `📬 *Новая заявка с сайта*\n\n👤 *Имя:* ${name || 'Не указано'}\n📞 *Контакты:* ${contact || 'Не указано'}\n💬 *Сообщение:* ${message || 'Без сообщения'}`;

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${8739024849:AAGHlH0890NUD8JYXwveY6E8VlYYDixKrrw}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: 903398593,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    if (telegramResponse.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: 'Telegram API Error' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}