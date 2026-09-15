document.addEventListener('DOMContentLoaded', () => {
    // 1. Мобильное меню
    const burgerBtn = document.getElementById('burgerBtn');
    const closeBtn = document.getElementById('closeBtn');
    const mobileNav = document.getElementById('mobileNav');

    if (burgerBtn && mobileNav) {
        burgerBtn.addEventListener('click', () => {
            mobileNav.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeBtn && mobileNav) {
        closeBtn.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    document.querySelectorAll('.mobile-nav__link').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav) {
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // 2. Кастомный курсор для карточек проектов
    const projectCursor = document.getElementById('projectCursor');
    const projectCards = document.querySelectorAll('.project-card');

    if (projectCursor && window.innerWidth > 1024) {
        window.addEventListener('mousemove', (e) => {
            projectCursor.style.left = `${e.clientX}px`;
            projectCursor.style.top = `${e.clientY}px`;
        });

        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                projectCursor.classList.add('active');
            });
            card.addEventListener('mouseleave', () => {
                projectCursor.classList.remove('active');
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const processItems = document.querySelectorAll('.process-item');
    const previewContainer = document.getElementById('processCursorPreview');
    const previewImg = document.getElementById('processCursorImg');

    if (!previewContainer || !previewImg || processItems.length === 0) return;

    let mouseX = 0;
    let mouseY = 0;

    // Обновляем позицию превью за курсором
    const updatePreviewPosition = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        previewContainer.style.left = `${mouseX}px`;
        previewContainer.style.top = `${mouseY}px`;
    };

    processItems.forEach(item => {
        item.addEventListener('mouseenter', (e) => {
            const imgSrc = item.getAttribute('data-preview');
            if (imgSrc) {
                previewImg.src = imgSrc;
                previewContainer.classList.add('active');
                updatePreviewPosition(e);
            }
        });

        item.addEventListener('mousemove', (e) => {
            updatePreviewPosition(e);
        });

        item.addEventListener('mouseleave', () => {
            previewContainer.classList.remove('active');
        });
    });
});

// FAQ Аккордеон
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq__item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq__question');
        const answer = item.querySelector('.faq__answer');

        questionBtn.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');

            // Закрываем все остальные открытые вопросы (опционально)
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq__answer').style.maxHeight = null;
                }
            });

            // Тогглим текущий
            if (isOpen) {
                item.classList.remove('active');
                answer.style.maxHeight = null;
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
});

// Отправка формы в Telegram
const TELEGRAM_BOT_TOKEN = '000';
const TELEGRAM_CHAT_ID = '903398593';

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const contact = formData.get('contact');
        const service = formData.get('service');

        const message = `🚀 <b>Новая заявка с сайта!</b>\n\n` +
                        `👤 <b>Имя:</b> ${name}\n` +
                        `📞 <b>Контакты:</b> ${contact}\n` +
                        `🛠 <b>Услуга:</b> ${service}`;

        try {
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            if (response.ok) {
                alert('Спасибо! Заявка успешно отправлена. Я свяжусь с вами в течение 24 часов.');
                contactForm.reset();
            } else {
                alert('Ошибка при отправке. Попробуйте написать напрямую в Telegram.');
            }
        } catch (error) {
            alert('Ошибка сети. Проверьте подключение.');
        }
    });
}
