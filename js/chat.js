// TUTOR DO COELHO — assistente IA do The Rabbit Code
// Usa Puter.js (IA gratuita, sem chave de API)

(function () {
    const PANEL_HTML = `
    <div class="chat-header">
        <span class="chat-logo"><svg viewBox="0 0 64 64" width="18" height="18"><ellipse cx="25" cy="27" rx="9.5" ry="23" transform="rotate(-12 25 27)" fill="none" stroke="currentColor" stroke-width="3"/><ellipse cx="41" cy="27" rx="9.5" ry="23" transform="rotate(12 41 27)" fill="none" stroke="currentColor" stroke-width="3"/></svg></span>
        <div class="chat-title">
            <strong>Tutor do Coelho</strong>
            <span>tire dúvidas sobre este módulo</span>
        </div>
        <button class="chat-close" aria-label="Fechar">×</button>
    </div>
    <div class="chat-messages" id="chatMessages">
        <div class="msg bot">Olá! Sou o tutor desta página 🐇 Peça resumos, exemplos ou tire dúvidas sobre o que você leu aqui.</div>
    </div>
    <form class="chat-input" id="chatForm">
        <input type="text" id="chatText" placeholder="Escreva sua dúvida..." autocomplete="off">
        <button type="submit" aria-label="Enviar">↑</button>
    </form>`;

    function getContext() {
        const main = document.querySelector('.content') || document.querySelector('main');
        let text = main ? main.innerText : '';
        return text.replace(/\s+/g, ' ').slice(0, 6000);
    }

    const SYSTEM_PROMPT =
        'Você é o "Tutor do Coelho", assistente do curso THE RABBIT CODE, uma formação em marketing digital, social media e tráfego pago criada por Vinicius Coelho. ' +
        'Responda SEMPRE em português do Brasil, de forma clara, amigável e prática, como um mentor paciente. ' +
        'Baseie-se principalmente no conteúdo da página atual (fornecido abaixo). Se a pergunta fugir do conteúdo, responda com conhecimento geral de marketing, mas curto. ' +
        'Nunca invente dados do curso.\n\nCONTEÚDO DA PÁGINA ATUAL:\n';

    let open = false;

    function init() {
        // Só carrega a IA quando servido por http/https (Puter não aceita file://)
        if (location.protocol === 'http:' || location.protocol === 'https:') {
            const s = document.createElement('script');
            s.src = 'https://js.puter.com/v2/';
            document.head.appendChild(s);
        }

        // Botão flutuante
        const fab = document.createElement('button');
        fab.className = 'chat-fab';
        fab.setAttribute('aria-label', 'Abrir tutor IA');
        fab.innerHTML = '<svg viewBox="0 0 64 64" width="24" height="24"><ellipse cx="25" cy="27" rx="9.5" ry="23" transform="rotate(-12 25 27)" fill="none" stroke="currentColor" stroke-width="3"/><ellipse cx="41" cy="27" rx="9.5" ry="23" transform="rotate(12 41 27)" fill="none" stroke="currentColor" stroke-width="3"/></svg>';
        document.body.appendChild(fab);

        // Painel
        const panel = document.createElement('aside');
        panel.className = 'chat-panel';
        panel.innerHTML = PANEL_HTML;
        document.body.appendChild(panel);

        const toggle = () => {
            open = !open;
            panel.classList.toggle('open', open);
            fab.classList.toggle('hidden', open);
            if (open) setTimeout(() => document.getElementById('chatText').focus(), 250);
        };
        fab.addEventListener('click', toggle);
        panel.querySelector('.chat-close').addEventListener('click', toggle);

        const form = panel.querySelector('#chatForm');
        form.addEventListener('submit', e => {
            e.preventDefault();
            const input = panel.querySelector('#chatText');
            const q = input.value.trim();
            if (!q) return;
            input.value = '';
            ask(q);
        });
    }

    function el(html) {
        const div = document.createElement('div');
        div.className = 'msg';
        div.innerHTML = html;
        return div;
    }

    async function ask(question) {
        const box = document.getElementById('chatMessages');
        box.appendChild(el(escapeHTML(question))).classList.add('user');
        scrollBottom();

        const typing = el('<span class="dots"><i></i><i></i><i></i></span>');
        typing.classList.add('bot');
        box.appendChild(typing);
        scrollBottom();

        try {
            if (typeof puter === 'undefined' || !puter.ai) throw new Error('offline');
            const resp = await puter.ai.chat(SYSTEM_PROMPT + getContext(), [
                { role: 'user', content: question }
            ]);
            const answer = typeof resp === 'string'
                ? resp
                : (resp.message && resp.message.content) || (resp.text) || 'Não consegui responder agora.';
            typing.innerHTML = formatAnswer(String(answer));
        } catch (err) {
            if (location.protocol === 'file:') {
                typing.innerHTML = 'O tutor IA precisa do site rodando em um servidor (local ou online). Abra pelo endereço <strong>http://localhost:8000</strong> ou publique o site. 🐇';
            } else {
                typing.innerHTML = 'Não consegui falar com a IA agora 😔 Verifique sua conexão e tente de novo em instantes.';
            }
        }
        scrollBottom();
    }

    function formatAnswer(text) {
        let safe = escapeHTML(text);
        safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        safe = safe.replace(/\n/g, '<br>');
        return safe;
    }

    function escapeHTML(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function scrollBottom() {
        const box = document.getElementById('chatMessages');
        box.scrollTop = box.scrollHeight;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
