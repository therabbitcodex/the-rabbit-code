// THE RABBIT CODE — interações do site

document.addEventListener('DOMContentLoaded', () => {

    // Navbar com scroll
    const navbar = document.querySelector('.navbar');
    const onScroll = () => {
        if (window.scrollY > 40) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Menu mobile
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(a =>
            a.addEventListener('click', () => {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
            })
        );
    }

    // Animações de entrada
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Barra de progresso de leitura nas páginas de módulo
    const progressBar = document.getElementById('reading-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const doc = document.documentElement;
            const total = doc.scrollHeight - window.innerHeight;
            const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
            progressBar.style.width = pct + '%';
        }, { passive: true });
    }

    // Checklist salvo no navegador
    document.querySelectorAll('.checklist input[type="checkbox"]').forEach(box => {
        const key = 'trc_' + location.pathname + '_' + box.dataset.item;
        if (localStorage.getItem(key) === '1') box.checked = true;
        box.addEventListener('change', () => {
            localStorage.setItem(key, box.checked ? '1' : '0');
        });
    });
});
