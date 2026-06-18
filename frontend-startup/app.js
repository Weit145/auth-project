const API_BASE = "/api";
const STORAGE_KEY = "kload-testing-session";

const endpoints = [
    { method: "GET", path: "/_health", label: "Health check", body: "" },
    { method: "POST", path: "/auth/register", label: "Register", body: '{\n  "name": "Test User",\n  "email": "",\n  "password": "Test12345"\n}' },
    { method: "POST", path: "/auth/repeat-email", label: "Repeat email", body: '{\n  "email": ""\n}' },
    { method: "POST", path: "/auth/confirm-email", label: "Confirm email", body: '{\n  "token": "",\n  "userId": ""\n}' },
    { method: "POST", path: "/auth/login", label: "Login", body: '{\n  "email": "",\n  "password": "Test12345"\n}' },
    { method: "POST", path: "/auth/refresh-token", label: "Refresh token", body: "" },
    { method: "POST", path: "/auth/change-password", label: "Change password", body: '{\n  "old_password": "Test12345",\n  "new_password": "Changed12345"\n}', auth: true },
    { method: "POST", path: "/auth/password-reset/request", label: "Password reset request", body: '{\n  "email": ""\n}' },
    { method: "POST", path: "/auth/password-reset/confirm", label: "Password reset confirm", body: '{\n  "token": "",\n  "userId": "",\n  "password": "Changed12345"\n}' },
    { method: "POST", path: "/auth/logout", label: "Logout", body: "", auth: true },
];

const state = {
    accessToken: "",
    user: null,
    requests: [],
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadSession() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        state.accessToken = saved.accessToken || "";
        state.user = saved.user || null;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
    }
}

function saveSession() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        accessToken: state.accessToken,
        user: state.user,
    }));
}

function generateTestUser() {
    const suffix = Date.now().toString().slice(-8);
    $("#register-email").value = `test${suffix}@mail.ru`;
    $("#login-email").value = $("#register-email").value;
    $("#repeat-email").value = $("#register-email").value;
    $("#password-request-email").value = $("#register-email").value;
    $("#register-password").value = "Test12345";
    $("#login-password").value = "Test12345";
    $("#old-password").value = "Test12345";
    $("#new-password").value = "Changed12345";
    $("#password-confirm-password").value = "Changed12345";
}

function setBusy(button, busy) {
    if (!button) return;
    button.disabled = busy;
    if (busy) {
        button.dataset.label = button.textContent;
        button.textContent = "Отправка...";
    } else if (button.dataset.label) {
        button.textContent = button.dataset.label;
    }
}

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    $("#toast-region").append(toast);
    setTimeout(() => toast.remove(), 4200);
}

function decodeJWT(token) {
    try {
        const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(decodeURIComponent(atob(payload).split("").map((char) =>
            `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`
        ).join("")));
    } catch {
        return null;
    }
}

function setSession(data) {
    if (!data?.access_token) return;
    state.accessToken = data.access_token;
    state.user = data.user || state.user;
    saveSession();
    renderSession();
}

function clearSession() {
    state.accessToken = "";
    state.user = null;
    saveSession();
    renderSession();
}

function renderSession() {
    const active = Boolean(state.accessToken);
    $("#empty-session").classList.toggle("hidden", active);
    $("#session-data").classList.toggle("hidden", !active);
    $("#session-dot").classList.toggle("active", active);
    $("#jwt-card").classList.toggle("hidden", !active);

    if (!active) return;

    const user = state.user || {};
    const payload = decodeJWT(state.accessToken);
    const name = user.name || payload?.name || "Authorized user";
    $("#user-name").textContent = name;
    $("#user-email").textContent = user.email || payload?.email || "—";
    $("#user-role").textContent = user.role || payload?.role || "user";
    $("#user-id").textContent = user.id || payload?.sub || "—";
    $("#user-avatar").textContent = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    $("#access-token").value = state.accessToken;
    $("#jwt-payload").textContent = payload ? JSON.stringify(payload, null, 2) : "Не удалось декодировать payload.";
    $("#token-expiry").textContent = payload?.exp
        ? new Date(payload.exp * 1000).toLocaleString("ru-RU")
        : "не указано";
}

async function apiRequest({ method = "GET", path, body, auth = false }) {
    const startedAt = performance.now();
    const headers = { Accept: "application/json" };
    if (body !== undefined && body !== null && body !== "") headers["Content-Type"] = "application/json";
    if (auth && state.accessToken) headers.Authorization = `Bearer ${state.accessToken}`;

    const requestBody = typeof body === "string" ? body : body ? JSON.stringify(body) : undefined;
    let status = 0;
    let responseBody;

    try {
        const response = await fetch(`${API_BASE}${path}`, {
            method,
            headers,
            body: requestBody,
            credentials: "include",
        });
        status = response.status;
        const text = await response.text();
        try {
            responseBody = text ? JSON.parse(text) : null;
        } catch {
            responseBody = text;
        }

        addRequestLog({ method, path, status, requestBody, responseBody, duration: performance.now() - startedAt });
        if (!response.ok) {
            const message = responseBody?.error || responseBody?.status || `HTTP ${status}`;
            throw new Error(message);
        }
        setSession(responseBody);
        return responseBody;
    } catch (error) {
        if (!status) {
            addRequestLog({ method, path, status: "NET", requestBody, responseBody: error.message, duration: performance.now() - startedAt });
        }
        throw error;
    }
}

function addRequestLog(entry) {
    state.requests.unshift({ ...entry, id: crypto.randomUUID(), time: new Date() });
    state.requests = state.requests.slice(0, 50);
    renderHistory();
}

function renderHistory() {
    $("#request-count").textContent = state.requests.length;
    const container = $("#history-list");
    container.replaceChildren();

    if (!state.requests.length) {
        const empty = document.createElement("div");
        empty.className = "history-empty";
        empty.textContent = "Здесь появятся выполненные запросы.";
        container.append(empty);
        return;
    }

    state.requests.forEach((request) => {
        const item = document.createElement("article");
        item.className = "history-item";
        const success = Number(request.status) >= 200 && Number(request.status) < 300;
        const details = document.createElement("div");
        details.className = "history-details";

        const requestPanel = document.createElement("div");
        const requestLabel = document.createElement("span");
        requestLabel.textContent = "REQUEST BODY";
        const requestPre = document.createElement("pre");
        requestPre.textContent = formatJSON(request.requestBody) || "No body";
        requestPanel.append(requestLabel, requestPre);

        const responsePanel = document.createElement("div");
        const responseLabel = document.createElement("span");
        responseLabel.textContent = "RESPONSE";
        const responsePre = document.createElement("pre");
        responsePre.textContent = formatJSON(request.responseBody) || "No body";
        responsePanel.append(responseLabel, responsePre);
        details.append(requestPanel, responsePanel);

        const summary = document.createElement("button");
        summary.type = "button";
        summary.className = "history-summary";
        const method = document.createElement("span");
        method.className = `method ${request.method.toLowerCase()}`;
        method.textContent = request.method;
        const path = document.createElement("strong");
        path.textContent = request.path;
        const code = document.createElement("span");
        code.className = `status-code ${success ? "" : "error"}`;
        code.textContent = request.status;
        const meta = document.createElement("span");
        meta.textContent = `${Math.round(request.duration)} ms · ${request.time.toLocaleTimeString("ru-RU")}`;
        summary.append(method, path, code, meta);
        summary.addEventListener("click", () => item.classList.toggle("open"));

        item.append(summary, details);
        container.append(item);
    });
}

function formatJSON(value) {
    if (value === undefined || value === null || value === "") return "";
    if (typeof value === "string") {
        try {
            return JSON.stringify(JSON.parse(value), null, 2);
        } catch {
            return value;
        }
    }
    return JSON.stringify(value, null, 2);
}

async function checkHealth() {
    $("#health-time").textContent = "проверка...";
    try {
        const data = await apiRequest({ path: "/_health" });
        const services = data?.services || [];
        const cards = services.map((service) => {
            const card = document.createElement("div");
            const healthy = service.status === "success" && (!service.db || service.db === "success");
            card.className = `health-card ${healthy ? "" : "error"}`;
            const name = document.createElement("span");
            name.textContent = service.db ? `${service.name} + db` : service.name;
            const status = document.createElement("strong");
            status.textContent = healthy ? "работает" : `ошибка${service.db ? ` · db: ${service.db}` : ""}`;
            card.append(name, status);
            return card;
        });
        $("#health-grid").replaceChildren(...cards);
        $("#health-time").textContent = `проверено ${new Date().toLocaleTimeString("ru-RU")}`;
    } catch (error) {
        const card = document.createElement("div");
        card.className = "health-card error";
        card.innerHTML = "<span>gateway</span><strong>нет соединения</strong>";
        $("#health-grid").replaceChildren(card);
        $("#health-time").textContent = error.message;
    }
}

function parseConfirmationURL(value, notify = true) {
    try {
        const url = new URL(value, window.location.origin);
        const token = url.searchParams.get("token");
        const userId = url.searchParams.get("userId");
        if (!token || !userId) throw new Error("В ссылке нужны token и userId");
        $("#confirmation-url").value = url.href;
        $("#confirm-token").value = token;
        $("#confirm-user-id").value = userId;
        $("#password-reset-url").value = url.href;
        $("#password-confirm-token").value = token;
        $("#password-confirm-user-id").value = userId;
        switchTab("flow");
        $("#confirm-card").scrollIntoView({ behavior: "smooth", block: "center" });
        if (notify) showToast("Данные подтверждения заполнены");
        return true;
    } catch (error) {
        if (notify) showToast(error.message, "error");
        return false;
    }
}

function parsePasswordResetURL(value, notify = true) {
    try {
        const url = new URL(value, window.location.origin);
        const token = url.searchParams.get("token");
        const userId = url.searchParams.get("userId");
        if (!token || !userId) throw new Error("В ссылке нужны token и userId");
        $("#password-reset-url").value = url.href;
        $("#password-confirm-token").value = token;
        $("#password-confirm-user-id").value = userId;
        switchTab("flow");
        $("#password-reset-card").scrollIntoView({ behavior: "smooth", block: "center" });
        if (notify) showToast("Данные reset-ссылки заполнены");
        return true;
    } catch (error) {
        if (notify) showToast(error.message, "error");
        return false;
    }
}

function switchTab(name) {
    $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === name));
    $$(".tab-page").forEach((page) => page.classList.toggle("active", page.id === `tab-${name}`));
}

function renderEndpoints() {
    const list = $("#endpoint-list");
    endpoints.forEach((endpoint) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "endpoint";
        const method = document.createElement("span");
        method.className = `method ${endpoint.method.toLowerCase()}`;
        method.textContent = endpoint.method;
        const text = document.createElement("div");
        const path = document.createElement("strong");
        path.textContent = endpoint.path;
        const label = document.createElement("span");
        label.textContent = endpoint.label;
        text.append(path, label);
        button.append(method, text);
        button.addEventListener("click", () => {
            $("#console-method").value = endpoint.method;
            $("#console-path").value = endpoint.path;
            $("#console-body").value = endpoint.body;
            $("#console-auth").checked = Boolean(endpoint.auth);
        });
        list.append(button);
    });
}

function bindForm(formSelector, handler) {
    $(formSelector).addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = event.submitter;
        setBusy(button, true);
        try {
            await handler(new FormData(event.currentTarget));
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setBusy(button, false);
        }
    });
}

function bindEvents() {
    $$(".tab").forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));
    $("#generate-user").addEventListener("click", generateTestUser);
    $("#health-refresh").addEventListener("click", checkHealth);
    $("#parse-confirmation").addEventListener("click", () => parseConfirmationURL($("#confirmation-url").value));
    $("#parse-password-reset").addEventListener("click", () => parsePasswordResetURL($("#password-reset-url").value));
    $("#clear-history").addEventListener("click", () => { state.requests = []; renderHistory(); });
    $("#clear-session").addEventListener("click", () => { clearSession(); showToast("Локальная сессия очищена"); });
    $("#copy-token").addEventListener("click", async () => {
        await navigator.clipboard.writeText(state.accessToken);
        showToast("Access token скопирован");
    });
    $("#refresh-token").addEventListener("click", async (event) => {
        setBusy(event.currentTarget, true);
        try {
            await apiRequest({ method: "POST", path: "/auth/refresh-token" });
            showToast("Access token обновлён");
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setBusy(event.currentTarget, false);
        }
    });
    $("#logout").addEventListener("click", async (event) => {
        setBusy(event.currentTarget, true);
        try {
            await apiRequest({ method: "POST", path: "/auth/logout", auth: true });
            clearSession();
            showToast("Сессия завершена");
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setBusy(event.currentTarget, false);
        }
    });

    bindForm("#register-form", async (data) => {
        await apiRequest({ method: "POST", path: "/auth/register", body: Object.fromEntries(data) });
        $("#login-email").value = data.get("email");
        $("#repeat-email").value = data.get("email");
        $("#password-request-email").value = data.get("email");
        $("#login-password").value = data.get("password");
        $("#old-password").value = data.get("password");
        showToast("Аккаунт создан. Проверьте письмо для подтверждения.");
    });
    bindForm("#repeat-email-form", async (data) => {
        await apiRequest({ method: "POST", path: "/auth/repeat-email", body: Object.fromEntries(data) });
        showToast("Повторное письмо отправлено");
    });
    bindForm("#confirm-form", async (data) => {
        await apiRequest({ method: "POST", path: "/auth/confirm-email", body: Object.fromEntries(data) });
        showToast("Email подтверждён, сессия создана");
    });
    bindForm("#login-form", async (data) => {
        await apiRequest({ method: "POST", path: "/auth/login", body: Object.fromEntries(data) });
        $("#old-password").value = data.get("password");
        showToast("Вход выполнен");
    });
    bindForm("#password-request-form", async (data) => {
        await apiRequest({ method: "POST", path: "/auth/password-reset/request", body: Object.fromEntries(data) });
        showToast("Письмо для восстановления отправлено");
    });
    bindForm("#password-confirm-form", async (data) => {
        await apiRequest({ method: "POST", path: "/auth/password-reset/confirm", body: Object.fromEntries(data) });
        $("#login-password").value = data.get("password");
        $("#old-password").value = data.get("password");
        showToast("Пароль изменён через reset");
    });
    bindForm("#change-password-form", async (data) => {
        await apiRequest({ method: "POST", path: "/auth/change-password", body: Object.fromEntries(data), auth: true });
        $("#login-password").value = data.get("new_password");
        $("#old-password").value = data.get("new_password");
        clearSession();
        showToast("Пароль изменён, локальная сессия очищена");
    });
    bindForm("#console-form", async () => {
        const method = $("#console-method").value;
        const rawBody = $("#console-body").value.trim();
        if (rawBody) JSON.parse(rawBody);
        const response = await apiRequest({
            method,
            path: $("#console-path").value.trim(),
            body: rawBody || undefined,
            auth: $("#console-auth").checked,
        });
        showToast(`Получен ответ: ${response?.status || "success"}`);
        switchTab("requests");
    });
}

function init() {
    loadSession();
    generateTestUser();
    renderSession();
    renderEndpoints();
    renderHistory();
    bindEvents();

    const params = new URLSearchParams(window.location.search);
    if (params.has("token") && params.has("userId")) parseConfirmationURL(window.location.href, false);

    checkHealth();
    setInterval(checkHealth, 30000);
}

init();
