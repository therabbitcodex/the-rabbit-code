// TUTOR DO COELHO — assistente IA do The Rabbit Code
// Usa Pollinations.ai (gratuito, sem chave e sem login)

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
        return text.replace(/\s+/g, ' ').slice(0, 2800);
    }

    const SYSTEM_PROMPT =
        'Você é o "Tutor do Coelho", assistente do curso THE RABBIT CODE, uma formação em marketing digital, social media e tráfego pago criada por Vinicius Coelho. ' +
        'Responda SEMPRE em português do Brasil, de forma clara, amigável e prática, como um mentor paciente, em no máximo 120 palavras. ' +
        'Baseie-se principalmente no conteúdo da página atual (fornecido abaixo). Se a pergunta fugir do conteúdo, responda com conhecimento geral de marketing, mas curto. ' +
        'Nunca invente dados do curso.\n\nCONTEÚDO DA PÁGINA ATUAL:\n';

    const history = [];

    let open = false;

    function init() {
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
            const convo = history.slice(-4)
                .map(m => m.role === 'user' ? ('Aluno: ' + m.text) : ('Tutor: ' + m.text))
                .join('\n');
            const prompt = SYSTEM_PROMPT + getContext()
                + (convo ? '\n\nCONVERSA ANTERIOR:\n' + convo + '\n' : '')
                + '\n\nPERGUNTA DO ALUNO: ' + question;
            const url = 'https://text.pollinations.ai/' + encodeURIComponent(prompt)
                + '?model=openai&referrer=' + encodeURIComponent(location.hostname || 'therabbitcode');
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const answer = await resp.text();
            if (!answer || answer.length < 2) throw new Error('vazio');
            history.push({ role: 'user', text: question });
            history.push({ role: 'bot', text: answer });
            typing.innerHTML = formatAnswer(answer);
        } catch (err) {
            typing.innerHTML = 'Não consegui falar com a IA agora 😔 Verifique sua conexão e tente de novo em instantes.';
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
