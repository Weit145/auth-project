// Presentation enhancements kept separate from the API and authentication logic.
(() => {
    const hero = document.querySelector(".hero");
    document.querySelector(".hero-copy h1").innerHTML = 'Ваш auth-flow.<br><em>Всё под контролем.</em>';
    document.querySelector(".hero-copy > p").textContent = "От первого письма до активной сессии. Проверяйте каждый шаг, исследуйте ответы и держите API под рукой.";
    document.querySelector(".hero-copy").insertAdjacentHTML("beforeend",
        '<div class="hero-links"><a class="button primary" href="#register-card">Начать проверку ↗</a><span class="hero-note">Один workspace. Весь цикл.</span></div>');
    document.querySelector(".health-grid").insertAdjacentHTML("beforebegin",
        '<div class="flow-map" aria-label="Схема запросов: клиент, gateway, auth"><div class="map-node"><b>⌘</b><span>CLIENT</span></div><div class="map-line" aria-hidden="true"></div><div class="map-node central"><b>K</b><span>GATEWAY</span></div><div class="map-line" aria-hidden="true"></div><div class="map-node"><b>↳</b><span>AUTH</span></div></div>');
    hero.insertAdjacentHTML("afterend",
        '<div class="workspace-metrics" aria-label="Статистика текущего сеанса"><div class="workspace-metric"><strong>10</strong><span>AUTH<br>ENDPOINTS</span></div><div class="workspace-metric"><strong id="metric-requests">0</strong><span>ЗАПРОСОВ<br>В ИСТОРИИ</span></div><div class="workspace-metric"><strong id="metric-success">—</strong><span>УСПЕШНЫХ<br>ОТВЕТОВ</span></div><div class="workspace-metric"><strong id="metric-latency">—</strong><span>СРЕДНЕЕ<br>ВРЕМЯ, MS</span></div></div>');
    const tabs = document.querySelector(".tabs");
    const bar = document.createElement("div");
    bar.className = "workspace-bar";
    tabs.before(bar);
    bar.append(tabs);
    bar.insertAdjacentHTML("beforeend", '<span class="workspace-caption">WORKSPACE / AUTHENTICATION</span>');
    const cards = [...document.querySelectorAll(".steps > .card")];
    const ids = ["register-card", "confirm-card", "complete-card", "login-card", "password-reset-card"];
    const labels = ["01 Письмо", "02 Подтверждение", "03 Пароль", "04 Вход", "05 Восстановление"];
    const nav = document.createElement("nav");
    nav.className = "quick-nav";
    nav.setAttribute("aria-label", "Быстрый переход к шагу");
    cards.forEach((card, i) => {
        card.id = ids[i];
        const link = document.createElement("a");
        link.href = "#" + card.id;
        link.textContent = labels[i];
        nav.append(link);
    });
    document.querySelector("#tab-flow").prepend(nav);
    document.querySelector(".shell").insertAdjacentHTML("beforeend",
        '<footer class="workspace-footer"><span>KLoad / Developer workspace</span><span>AUTH · SESSIONS · REQUESTS</span></footer>');

    document.querySelectorAll('input[type="password"]').forEach((input) => {
        const wrapper = document.createElement("div");
        wrapper.className = "password-wrap";
        input.before(wrapper);
        wrapper.append(input);
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "password-toggle";
        toggle.textContent = "Показать";
        toggle.setAttribute("aria-label", "Показать пароль");
        toggle.setAttribute("aria-pressed", "false");
        toggle.setAttribute("aria-controls", input.id);
        toggle.addEventListener("click", () => {
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            toggle.textContent = show ? "Скрыть" : "Показать";
            toggle.setAttribute("aria-label", show ? "Скрыть пароль" : "Показать пароль");
            toggle.setAttribute("aria-pressed", String(show));
        });
        wrapper.append(toggle);
    });

    function updateMetrics() {
        const requests = state.requests;
        document.querySelector("#metric-requests").textContent = requests.length;
        document.querySelector("#metric-success").textContent = requests.length
            ? Math.round(requests.filter((r) => r.status >= 200 && r.status < 300).length / requests.length * 100) + "%"
            : "—";
        document.querySelector("#metric-latency").textContent = requests.length
            ? Math.round(requests.reduce((total, r) => total + r.duration, 0) / requests.length)
            : "—";
    }
    new MutationObserver(updateMetrics).observe(document.querySelector("#history-list"), { childList:true });
    updateMetrics();

    tabs.querySelectorAll(".tab").forEach((tab) => {
        const sync = () => tab.setAttribute("aria-current", tab.classList.contains("active") ? "page" : "false");
        new MutationObserver(sync).observe(tab, { attributes:true, attributeFilter:["class"] });
        sync();
    });
    if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("entering");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold:0.06 });
        document.querySelectorAll(".card").forEach((card) => observer.observe(card));
    }
})();
