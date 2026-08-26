// THE RABBIT CODE — conta do aluno (local, neste navegador)
(function () {
    const KEY = 'trc_user';
    const PFX = location.pathname.indexOf('/modulos/') > -1 ? '../' : '';

    const get = () => {
        try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
    };
    const set = u => localStorage.setItem(KEY, JSON.stringify(u));
    const clear = () => localStorage.removeItem(KEY);
    window.TRCUser = { get, set, clear };

    let wrapEl = null;

    function render() {
        if (!wrapEl) return;
        const u = get();
        wrapEl.querySelector('.account-chip-label').textContent = u ? u.name.trim().split(' ')[0] : 'Entrar';
    }

    function buildChip() {
        const navInner = document.querySelector('.nav-inner');
        if (!navInner || document.getElementById('accountWrap')) return;

        wrapEl = document.createElement('div');
        wrapEl.id = 'accountWrap';
        wrapEl.className = 'account-wrap';
        wrapEl.innerHTML =
            '<button class="account-chip" type="button">' +
                '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4"/></svg>' +
                '<span class="account-chip-label">Entrar</span>' +
            '</button>' +
            '<div class="account-pop" hidden></div>';
        navInner.appendChild(wrapEl);

        wrapEl.querySelector('.account-chip').addEventListener('click', togglePop);
        document.addEventListener('click', e => {
            if (!wrapEl.contains(e.target)) hidePop();
        });
        render();
    }

    function hidePop() {
        const pop = wrapEl && wrapEl.querySelector('.account-pop');
        if (pop) pop.hidden = true;
    }

    function togglePop() {
        const pop = wrapEl.querySelector('.account-pop');
        const u = get();
        if (!u) { openLogin(); return; }
        pop.innerHTML =
            '<div class="account-pop-head"><strong>' + esc(u.name) + '</strong>' +
            (u.email ? '<span>' + esc(u.email) + '</span>' : '') + '</div>' +
            '<a href="' + PFX + 'certificado.html">🎓 Meu certificado</a>' +
            '<a href="' + PFX + 'finalizacao.html">🏁 Tela de conclusão</a>' +
            '<button type="button" id="accountLogout">Sair da conta</button>';
        pop.hidden = false;
        pop.querySelector('#accountLogout').addEventListener('click', () => {
            clear(); hidePop(); render();
        });
    }

    function openLogin() {
        const ov = document.createElement('div');
        ov.className = 'trc-overlay';
        ov.innerHTML =
            '<div class="trc-box">' +
                '<h3>Criar minha conta</h3>' +
                '<p>Salva seu nome para o certificado e o atendimento no direct.</p>' +
                '<label>Nome completo<input id="accName" type="text" maxlength="80" placeholder="Ex.: Marina Souza"></label>' +
                '<label>E-mail (opcional)<input id="accMail" type="email" placeholder="voce@email.com"></label>' +
                '<div class="trc-btn-row">' +
                    '<button type="button" class="trc-cancel">Cancelar</button>' +
                    '<button type="button" id="accSave" class="btn btn-primary">Criar conta</button>' +
                '</div>' +
                '<small>Sua conta fica salva <strong>neste navegador</strong> — sem senha, sem servidor.</small>' +
            '</div>';
        document.body.appendChild(ov);
        ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
        ov.querySelector('.trc-cancel').addEventListener('click', () => ov.remove());
        ov.querySelector('#accSave').addEventListener('click', () => {
            const name = ov.querySelector('#accName').value.trim();
            const email = ov.querySelector('#accMail').value.trim();
            if (name.length < 3) { ov.querySelector('#accName').classList.add('err'); return; }
            set({ name: name, email: email, since: new Date().toISOString().slice(0, 10) });
            ov.remove(); render();
        });
        ov.querySelector('#accName').focus();
    }

    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildChip);
    } else {
        buildChip();
    }
})();
