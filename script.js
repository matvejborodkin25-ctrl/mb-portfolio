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

// Пример обработчика отправки формы
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Находим кнопку отправки для анимации и блокировки от повторных кликов
    const submitBtn = form.querySelector('.my-btn');
    const btnText = form.querySelector('.my-btn-text');
    const originalText = btnText ? btnText.textContent : 'Обсудить проект';

    // Собираем данные из полей по атрибутам name
    const formData = {
      name: form.querySelector('[name="name"]').value.trim(),
      contact: form.querySelector('[name="contact"]').value.trim(),
      service: form.querySelector('[name="service"]').value
    };

    // Состояние загрузки
    if (submitBtn) submitBtn.style.pointerEvents = 'none';
    if (btnText) btnText.textContent = 'Отправка...';

    try {
      const response = await fetch('/api/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Спасибо! Заявка успешно отправлена.');
        form.reset();
      } else {
        console.error('Ошибка сервера:', result);
        alert('Не удалось отправить заявку. Попробуйте еще раз или свяжитесь со мной напрямую.');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      alert('Произошла ошибка при отправке. Проверьте подключение к интернету.');
    } finally {
      // Возвращаем кнопку в исходное состояние
      if (submitBtn) submitBtn.style.pointerEvents = 'auto';
      if (btnText) btnText.textContent = originalText;
    }
  });
});
