document.addEventListener('DOMContentLoaded', () => {
    // Если GSAP не загрузился (CDN недоступен) — сайт всё равно должен работать
    const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.matchMedia('(min-width: 1025px) and (hover: hover)').matches;

    if (hasGsap) {
        gsap.registerPlugin(ScrollTrigger);
    }

    // ==========================================================================
    // 1. ГЕЙМИФИКАЦИЯ И ИНТЕРАКТИВ
    // ==========================================================================
    if (hasGsap && !reduceMotion) {

        // А. Ambient Glow за курсором (только десктоп)
        if (isDesktop) {
            const glow = document.createElement('div');
            glow.className = 'ambient-glow';
            document.body.appendChild(glow);
            gsap.set(glow, { xPercent: -50, yPercent: -50, x: -500, y: -500 });

            const glowX = gsap.quickTo(glow, 'x', { duration: 0.6, ease: 'power2.out' });
            const glowY = gsap.quickTo(glow, 'y', { duration: 0.6, ease: 'power2.out' });

            window.addEventListener('mousemove', (e) => {
                glowX(e.clientX);
                glowY(e.clientY);
            });
        }

        // Б. Искры при клике в любой точке страницы
        window.addEventListener('click', (e) => {
            // На кнопках и ссылках искры не показываем, чтобы не мешать их собственным анимациям
            if (e.target.closest('a, button, .my-btn, input, select, textarea, label')) return;

            for (let i = 0; i < 5; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'click-sparkle';
                document.body.appendChild(sparkle);

                const size = Math.random() * 10 + 6;
                sparkle.style.width = `${size}px`;
                sparkle.style.height = `${size}px`;

                gsap.set(sparkle, {
                    x: e.clientX,
                    y: e.clientY,
                    xPercent: -50,
                    yPercent: -50
                });

                gsap.to(sparkle, {
                    x: e.clientX + (Math.random() - 0.5) * 80,
                    y: e.clientY + (Math.random() - 0.5) * 80,
                    opacity: 0,
                    scale: 0,
                    duration: 0.6 + Math.random() * 0.3,
                    ease: 'power2.out',
                    onComplete: () => sparkle.remove()
                });
            }
        });

        if (isDesktop) {
            // В. 3D-Tilt карточек (+ лёгкое поднятие, которое раньше делал CSS :hover)
            const liftByClass = (card) =>
                card.classList.contains('services-card') ? -8 :
                card.classList.contains('approach-card') ? -6 : 0;

            document.querySelectorAll('.approach-card, .services-card, .card').forEach(card => {
                const lift = liftByClass(card);

                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    gsap.to(card, {
                        rotateX: ((y - centerY) / centerY) * -8,
                        rotateY: ((x - centerX) / centerX) * 8,
                        y: lift,
                        transformPerspective: 1000,
                        duration: 0.2,
                        ease: 'power1.out',
                        overwrite: 'auto'
                    });
                });

                card.addEventListener('mouseleave', () => {
                    gsap.to(card, {
                        rotateX: 0,
                        rotateY: 0,
                        y: 0,
                        duration: 0.5,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                });
            });
        }
    }

    // ==========================================================================
    // 2. ПЛАВНОЕ ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПРИ СКРОЛЛЕ
    // ==========================================================================
    if (hasGsap && !reduceMotion) {

        // А. Hero
        gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } })
            .from('.hero__title', { y: 60, opacity: 0, delay: 0.2 })
            .from('.hero__badge', { scale: 0.8, opacity: 0, rotation: 0 }, '-=0.6')
            .from('.hero__avatar-wrapper', { y: 40, opacity: 0 }, '-=0.6')
            .from('.contacts-group .card', { y: 30, opacity: 0, stagger: 0.2 }, '-=0.6');

        // Голова в Hero: плавное «парение» + поворот вслед за курсором
        const heroAvatar = document.querySelector('.hero__avatar');
        if (heroAvatar) {
            // Лёгкое парение (y и поворот по оси Z)
            gsap.to(heroAvatar, {
                y: -14,
                rotation: 2.5,
                duration: 2.6,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
                delay: 1.2 // после появления Hero
            });

            // Голова «смотрит» на курсор (только десктоп)
            if (isDesktop) {
                gsap.set(heroAvatar, { transformPerspective: 800, transformOrigin: '50% 60%' });
                const rotY = gsap.quickTo(heroAvatar, 'rotationY', { duration: 0.8, ease: 'power3.out' });
                const rotX = gsap.quickTo(heroAvatar, 'rotationX', { duration: 0.8, ease: 'power3.out' });
                const moveX = gsap.quickTo(heroAvatar, 'x', { duration: 0.8, ease: 'power3.out' });

                window.addEventListener('mousemove', (e) => {
                    const nx = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 … 1
                    const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1 … 1
                    rotY(nx * 14);
                    rotX(-ny * 9);
                    moveX(nx * 10);
                });
            }
        }

        // Б. «Подход»: сначала крупный заголовок, затем карточки по одной — в такт скроллу
        const approachSection = document.querySelector('.approach');
        const approachTitle = document.querySelector('.approach__bg-title');
        const approachCards = gsap.utils.toArray('.approach-card');

        if (approachSection && approachTitle && approachCards.length) {
            // Разбиваем заголовок на буквы
            const word = approachTitle.textContent.trim();
            approachTitle.setAttribute('aria-label', word);
            approachTitle.innerHTML = [...word]
                .map(ch => `<span class="approach-letter" aria-hidden="true" style="display:inline-block">${ch}</span>`)
                .join('');

            // Одна и та же последовательность везде: сначала целиком «ПОДХОД», потом карточки строго по одной.
            // Меняется только то, как её двигает скролл (с закреплением секции или без).
            const buildSequence = (scrollTrigger) => {
                const tl = gsap.timeline({ scrollTrigger });

                tl.from('.approach-letter', {
                    yPercent: 110,
                    opacity: 0,
                    rotation: 6,
                    duration: 1.2,
                    stagger: 0.12,
                    ease: 'power4.out'
                })
                .from(approachCards, {
                    y: 90,
                    scale: 0.92,
                    opacity: 0,
                    duration: 1,
                    stagger: 1, // каждая следующая карточка — следующий отрезок скролла
                    ease: 'power3.out'
                }, '+=0.5')
                .to({}, { duration: 0.5 }); // пауза в конце

                return tl;
            };

            const mm = gsap.matchMedia();
            // Закрепляем секцию, только если она целиком помещается в окно браузера
            const needHeight = Math.ceil(approachSection.offsetHeight) + 20;

            // ДЕСКТОП, секция помещается в экран: закрепляем и «проигрываем» по скроллу
            mm.add(`(min-width: 1025px) and (min-height: ${needHeight}px)`, () => {
                buildSequence({
                    trigger: approachSection,
                    start: 'center center',
                    end: '+=3000',      // длина скролла в пикселях: больше — медленнее
                    pin: true,
                    scrub: 0.8,
                    anticipatePin: 1
                });
            });

            // ПЛАНШЕТ / ТЕЛЕФОН / НЕВЫСОКИЙ ЭКРАН: секция тоже закрепляется на весь показ.
            // Карточки выезжают по одной, а когда очередная не помещается в экран — содержимое
            // плавно сдвигается вверх. Когда все карточки показаны, страница едет дальше.
            mm.add(`(max-width: 1024px), (max-height: ${needHeight - 1}px)`, () => {
                const container = approachSection.querySelector('.approach__container');
                const viewH = window.innerHeight;
                const naturalH = approachSection.offsetHeight;

                // Если секция выше экрана — делаем её ровно в высоту экрана (содержимое сдвигаем внутри)
                if (naturalH > viewH) {
                    approachSection.style.height = '100vh';
                    approachSection.style.height = '100svh';
                }

                // Положение элемента внутри секции (не зависит от transform)
                const topInSection = (el) => {
                    let t = 0;
                    while (el && el !== approachSection) {
                        t += el.offsetTop;
                        el = el.offsetParent;
                    }
                    return t;
                };

                // На сколько нужно поднять содержимое, чтобы карточка i целиком была в экране
                const shiftFor = (i) => {
                    const frameH = approachSection.clientHeight;
                    let need = 0;
                    for (let k = 0; k <= i; k++) {
                        const bottom = topInSection(approachCards[k]) + approachCards[k].offsetHeight;
                        need = Math.max(need, bottom + 24 - frameH);
                    }
                    return Math.max(0, need);
                };

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: approachSection,
                        start: 'top top',
                        end: () => '+=' + Math.round(window.innerHeight * 3.5),
                        pin: true,
                        scrub: 0.8,
                        anticipatePin: 1
                    }
                });

                tl.from('.approach-letter', {
                    yPercent: 110,
                    opacity: 0,
                    rotation: 6,
                    duration: 1.2,
                    stagger: 0.12,
                    ease: 'power4.out'
                });

                approachCards.forEach((card, i) => {
                    const label = 'card' + i;
                    tl.addLabel(label, i === 0 ? '+=0.5' : '>');
                    tl.from(card, {
                        y: 90,
                        scale: 0.92,
                        opacity: 0,
                        duration: 1,
                        ease: 'power3.out'
                    }, label);
                    tl.to(container, {
                        y: () => -shiftFor(i),
                        duration: 1,
                        ease: 'power2.out'
                    }, label);
                });

                tl.to({}, { duration: 0.5 });

                // При выходе из режима возвращаем высоту секции
                return () => {
                    approachSection.style.height = '';
                };
            });
        }

        // В. «Услуги»
        gsap.from('.services-card', {
            scrollTrigger: { trigger: '.services__grid', start: 'top 80%' },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out'
        });

        // Г. «Проекты»
        gsap.from('.project-card', {
            scrollTrigger: { trigger: '.works__grid', start: 'top 80%' },
            y: 80,
            opacity: 0,
            duration: 0.9,
            stagger: 0.2,
            ease: 'power3.out'
        });

        // Д. Параллакс.
        // У телевизора в CSS уже стоит rotate(-12deg), поэтому поворот задаём относительно ("-=4"),
        // иначе он «схлопнулся» бы к -4deg и сбил наклон.
        gsap.to('.process__tv-img', {
            scrollTrigger: {
                trigger: '.process',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            },
            y: -40,
            rotation: '-=4'
        });

        gsap.to('.about__avatar', {
            scrollTrigger: {
                trigger: '.about',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            },
            y: -30
        });

        // Е. «Процесс» — поэтапное проявление списка
        gsap.from('.process-item', {
            scrollTrigger: { trigger: '.process__list', start: 'top 80%' },
            x: -40,
            opacity: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power2.out'
        });

        // Пересчитать позиции триггеров после загрузки картинок и шрифтов
        window.addEventListener('load', () => ScrollTrigger.refresh());
    }

    // ==========================================================================
    // 3. МОБИЛЬНОЕ МЕНЮ
    // ==========================================================================
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

    // ==========================================================================
    // 4. КАСТОМНЫЙ КУРСОР НА КАРТОЧКАХ ПРОЕКТОВ
    // left/top, а не GSAP x/y: в CSS у курсора уже есть translate(-50%, -50%) scale(),
    // и GSAP переписал бы этот transform.
    // ==========================================================================
    const projectCursor = document.getElementById('projectCursor');
    const projectCards = document.querySelectorAll('.project-card');

    if (projectCursor && window.innerWidth > 1024) {
        window.addEventListener('mousemove', (e) => {
            projectCursor.style.left = `${e.clientX}px`;
            projectCursor.style.top = `${e.clientY}px`;
        });

        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => projectCursor.classList.add('active'));
            card.addEventListener('mouseleave', () => projectCursor.classList.remove('active'));
        });
    }

    // ==========================================================================
    // 5. FAQ АККОРДЕОН
    // ==========================================================================
    const faqItems = document.querySelectorAll('.faq__item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq__question');
        const answer = item.querySelector('.faq__answer');
        if (!questionBtn || !answer) return;

        questionBtn.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');

            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq__answer');
                    if (otherAnswer) otherAnswer.style.maxHeight = null;
                }
            });

            if (isOpen) {
                item.classList.remove('active');
                answer.style.maxHeight = null;
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }

            // Высота страницы изменилась — обновляем триггеры после CSS-анимации (0.4s)
            if (hasGsap) setTimeout(() => ScrollTrigger.refresh(), 450);
        });
    });

    // ==========================================================================
    // 7. ПРЕВЬЮ ЗА КУРСОРОМ В «ПРОЦЕССЕ» (твоя исходная логика, без изменений)
    // ==========================================================================
    (() => {
        const processItems = document.querySelectorAll('.process-item');
        const previewContainer = document.getElementById('processCursorPreview');
        const previewImg = document.getElementById('processCursorImg');

        if (!previewContainer || !previewImg || processItems.length === 0) return;

        const updatePreviewPosition = (e) => {
            previewContainer.style.left = `${e.clientX}px`;
            previewContainer.style.top = `${e.clientY}px`;
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

            item.addEventListener('mousemove', updatePreviewPosition);

            item.addEventListener('mouseleave', () => {
                previewContainer.classList.remove('active');
            });
        });
    })();
});
