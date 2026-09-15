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
