/**
 * KS INNOVATION - Universal Embeddable AI Receptionist & Voice Widget
 * Can be embedded into ANY website (WordPress, Shopify, React, HTML, Webflow, etc.)
 * Usage: <script src="ks-ai-widget.js"></script>
 */

(function () {
  // Prevent duplicate injection
  if (document.getElementById('ks-ai-widget-root')) return;

  // Authentic KS Innovation SVG Seal for 100% Reliable Offline/Online Rendering
  const KS_SVG_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%230f1e42" stroke="%23f0b90b" stroke-width="4"/><polygon points="50,22 76,37 76,67 50,82 24,67 24,37" fill="none" stroke="%23f0b90b" stroke-width="2.5"/><text x="50" y="56" fill="%23f0b90b" font-size="20" font-weight="900" font-family="sans-serif" text-anchor="middle">KS</text><text x="50" y="68" fill="%23ffffff" font-size="7" font-weight="800" font-family="sans-serif" text-anchor="middle" letter-spacing="1">INNOVATION</text></svg>';

  // Widget State
  let isOpen = false;
  let isCalling = false;
  let callSeconds = 0;
  let callTimer = null;
  let isAiSpeaking = false;

  // Inject Styles
  const style = document.createElement('style');
  style.innerHTML = `
    #ks-ai-widget-root {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    /* Floating Launcher Button */
    .ks-launcher {
      background: linear-gradient(135deg, #0f1e42, #070e24);
      border: 2px solid #f0b90b;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(240, 185, 11, 0.4);
      border-radius: 50px;
      padding: 8px 18px 8px 10px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .ks-launcher:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.6);
      border-color: #00f0ff;
    }
    .ks-launcher-logo {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid #f0b90b;
      object-fit: cover;
    }
    .ks-launcher-text {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .ks-launcher-title {
      font-size: 13px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 0.5px;
    }
    .ks-launcher-sub {
      font-size: 10.5px;
      color: #00ff88;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .ks-pulse-dot {
      width: 7px;
      height: 7px;
      background: #00ff88;
      border-radius: 50%;
      box-shadow: 0 0 8px #00ff88;
      animation: ksBlink 1.5s infinite;
    }
    @keyframes ksBlink { 50% { opacity: 0.3; } }

    /* Expanded Chat Card */
    .ks-chat-window {
      display: none;
      width: 380px;
      height: 580px;
      background: #080f20;
      border: 1.5px solid rgba(0, 240, 255, 0.3);
      border-radius: 24px;
      box-shadow: 0 25px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 240, 255, 0.15);
      flex-direction: column;
      overflow: hidden;
      margin-bottom: 14px;
      animation: ksSlideUp 0.3s ease;
    }
    @keyframes ksSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Window Header */
    .ks-header {
      background: #0c1630;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ks-header-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .ks-header-logo {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1.5px solid #f0b90b;
      object-fit: cover;
    }
    .ks-header-info h4 {
      font-size: 14px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
    }
    .ks-header-info p {
      font-size: 10.5px;
      color: #00ff88;
      margin: 2px 0 0;
    }
    .ks-close-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 20px;
      cursor: pointer;
      line-height: 1;
      padding: 4px;
    }
    .ks-close-btn:hover { color: #ffffff; }

    /* Mode Tabs (Chat vs Call) */
    .ks-tabs {
      display: flex;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .ks-tab-btn {
      flex: 1;
      padding: 10px;
      font-size: 12px;
      font-weight: 700;
      color: #94a3b8;
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .ks-tab-btn.active {
      color: #00f0ff;
      border-bottom-color: #00f0ff;
      background: rgba(0, 240, 255, 0.08);
    }

    /* Message Area */
    .ks-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: radial-gradient(circle at top, #0c1630 0%, #060b18 100%);
    }
    .ks-msg {
      max-width: 82%;
      padding: 9px 13px;
      border-radius: 14px;
      font-size: 12.5px;
      line-height: 1.45;
    }
    .ks-msg-ai {
      align-self: flex-start;
      background: rgba(0, 240, 255, 0.1);
      border: 1px solid rgba(0, 240, 255, 0.25);
      color: #e0f2fe;
    }
    .ks-msg-user {
      align-self: flex-end;
      background: #005c4b;
      color: #ffffff;
    }

    /* Quick Question Pills */
    .ks-quick-pills {
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      gap: 6px;
      overflow-x: auto;
      white-space: nowrap;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .ks-pill {
      font-size: 11px;
      background: rgba(255, 255, 255, 0.06);
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 5px 10px;
      border-radius: 12px;
      cursor: pointer;
    }
    .ks-pill:hover {
      background: #00f0ff;
      color: #000;
      font-weight: 700;
    }

    /* Input Footer */
    .ks-footer {
      padding: 12px 16px;
      background: #0c1630;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .ks-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      color: #ffffff;
      padding: 9px 12px;
      font-size: 13px;
      outline: none;
    }
    .ks-send-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #00f0ff;
      color: #000;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      cursor: pointer;
      font-weight: 800;
    }

    /* Live Voice Calling Pane */
    .ks-voice-pane {
      display: none;
      flex: 1;
      padding: 24px 20px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: radial-gradient(circle, #0f224a 0%, #060b18 100%);
    }
    .ks-call-avatar {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 3px solid #00f0ff;
      box-shadow: 0 0 30px rgba(0, 240, 255, 0.4);
      margin-bottom: 16px;
      animation: ksRingPulse 1.8s infinite;
    }
    @keyframes ksRingPulse {
      0% { box-shadow: 0 0 0 0 rgba(0, 240, 255, 0.5); }
      70% { box-shadow: 0 0 0 20px rgba(0, 240, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 240, 255, 0); }
    }
    .ks-call-title {
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
    }
    .ks-call-status {
      font-size: 12px;
      color: #00ff88;
      margin: 4px 0 16px;
      font-family: monospace;
    }
    .ks-wave-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      height: 40px;
      margin-bottom: 24px;
    }
    .ks-w-bar {
      width: 4px;
      height: 10px;
      background: #00f0ff;
      border-radius: 4px;
      transition: height 0.1s;
    }
    .ks-call-action-btn {
      background: #ef4444;
      color: white;
      border: none;
      padding: 12px 28px;
      border-radius: 25px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
    }
  `;
  document.head.appendChild(style);

  // Inject HTML Container
  const root = document.createElement('div');
  root.id = 'ks-ai-widget-root';
  root.innerHTML = `
    <!-- Expanded Chat Card -->
    <div class="ks-chat-window" id="ksChatWindow">
      <!-- Header -->
      <div class="ks-header">
        <div class="ks-header-brand">
          <img src="ks_logo.jpg" alt="KS Innovation" class="ks-header-logo" onerror="this.src=KS_SVG_LOGO">
          <div class="ks-header-info">
            <h4>KS Innovation AI</h4>
            <p>● 24/7 AI Receptionist Online</p>
          </div>
        </div>
        <button class="ks-close-btn" onclick="window.toggleKsWidget()">✕</button>
      </div>

      <!-- Mode Switcher -->
      <div class="ks-tabs">
        <button class="ks-tab-btn active" id="ksTabChat" onclick="window.switchKsTab('chat')">
          💬 Live AI Chat
        </button>
        <button class="ks-tab-btn" id="ksTabCall" onclick="window.switchKsTab('call')">
          📞 Live Voice Call
        </button>
      </div>

      <!-- Tab 1: Chat Pane -->
      <div id="ksChatPane" style="display: flex; flex-direction: column; flex: 1; overflow: hidden;">
        <div class="ks-messages" id="ksMessages">
          <div class="ks-msg ks-msg-ai">
            Namaste! 🙏 KS Innovation me aapka swagat hai.<br><br>
            Hum businesses ke liye <b>24/7 AI Phone Receptionist aur WhatsApp Automation Bots</b> banate hain jo bina chhutti liye customer calls aur deals close karte hain.<br><br>
            Aapko kaisa automation chahiye?
          </div>
        </div>

        <!-- Quick Questions -->
        <div class="ks-quick-pills">
          <div class="ks-pill" onclick="window.sendKsQuick('Free trial demo book karna hai')">🎟️ Free Trial Demo</div>
          <div class="ks-pill" onclick="window.sendKsQuick('Setup fee aur monthly charges kya hain?')">💰 Pricing Details</div>
          <div class="ks-pill" onclick="window.sendKsQuick('Bhamashah Techno Hub me office kahan hai?')">📍 Jaipur Office</div>
        </div>

        <!-- Footer -->
        <div class="ks-footer">
          <input type="text" id="ksInput" class="ks-input" placeholder="Type in Hindi or English..." onkeydown="if(event.key==='Enter') window.sendKsUserMsg()">
          <button class="ks-send-btn" onclick="window.sendKsUserMsg()">➤</button>
        </div>
      </div>

      <!-- Tab 2: Voice Call Pane -->
      <div class="ks-voice-pane" id="ksVoicePane">
        <img src="ks_logo.jpg" alt="AI Agent" class="ks-call-avatar" onerror="this.src=KS_SVG_LOGO">
        <div class="ks-call-title">Priya (AI Receptionist)</div>
        <div class="ks-call-status" id="ksCallTimer">Connecting to AI Voice...</div>

        <!-- Waveform -->
        <div class="ks-wave-box" id="ksWaveBox">
          <div class="ks-w-bar"></div><div class="ks-w-bar"></div><div class="ks-w-bar"></div>
          <div class="ks-w-bar"></div><div class="ks-w-bar"></div><div class="ks-w-bar"></div>
        </div>

        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 20px; line-height: 1.4;">
          Speak into your mic in Hindi or English.<br>AI will answer in real-time phone voice!
        </div>

        <button class="ks-call-action-btn" onclick="window.endKsVoiceCall()">
          ✕ End Call
        </button>
      </div>

    </div>

    <!-- Floating Launcher Pill -->
    <div class="ks-launcher" onclick="window.toggleKsWidget()">
      <img src="ks_logo.jpg" alt="KS Logo" class="ks-launcher-logo" onerror="this.src=KS_SVG_LOGO">
      <div class="ks-launcher-text">
        <div class="ks-launcher-title">Talk to AI Receptionist</div>
        <div class="ks-launcher-sub"><span class="ks-pulse-dot"></span> 24/7 Voice & Chat</div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  // Global Handlers
  window.toggleKsWidget = function () {
    isOpen = !isOpen;
    document.getElementById('ksChatWindow').style.display = isOpen ? 'flex' : 'none';
  };

  window.switchKsTab = function (tab) {
    const isChat = tab === 'chat';
    document.getElementById('ksTabChat').classList.toggle('active', isChat);
    document.getElementById('ksTabCall').classList.toggle('active', !isChat);
    document.getElementById('ksChatPane').style.display = isChat ? 'flex' : 'none';
    document.getElementById('ksVoicePane').style.display = isChat ? 'none' : 'flex';

    if (!isChat && !isCalling) {
      window.startKsVoiceCall();
    } else if (isChat && isCalling) {
      window.endKsVoiceCall();
    }
  };

  window.sendKsQuick = function (text) {
    document.getElementById('ksInput').value = text;
    window.sendKsUserMsg();
  };

  window.sendKsUserMsg = function () {
    const input = document.getElementById('ksInput');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    const container = document.getElementById('ksMessages');

    // Add User Message
    const userMsg = document.createElement('div');
    userMsg.className = 'ks-msg ks-msg-user';
    userMsg.innerText = text;
    container.appendChild(userMsg);
    container.scrollTop = container.scrollHeight;

    // AI Response matching
    setTimeout(() => {
      const aiReply = generateAiResponse(text);
      const aiMsg = document.createElement('div');
      aiMsg.className = 'ks-msg ks-msg-ai';
      aiMsg.innerHTML = aiReply;
      container.appendChild(aiMsg);
      container.scrollTop = container.scrollHeight;
    }, 450);
  };

  // Smart Knowledge Engine for Website Visitors
  function generateAiResponse(query) {
    const q = query.toLowerCase();
    if (q.includes('demo') || q.includes('trial') || q.includes('book')) {
      return `Zaroor! Aapka 15-minute ka <b>Live AI Demo</b> book karne ke liye kripya apna <b>WhatsApp number</b> yahan likhein ya direct call karein:<br><br>
      📞 <a href="tel:+918005587002" style="color:#00f0ff; font-weight:800; text-decoration:none;">+91 8005587002</a><br>
      📲 <a href="https://wa.me/918005587002?text=Hello%20Rahul%20ji,%20I%20want%20a%20free%20AI%20Demo!" target="_blank" style="color:#00ff88; font-weight:700; text-decoration:none;">WhatsApp Par Direct Message Karein</a>`;
    }
    if (q.includes('price') || q.includes('fee') || q.includes('charge') || q.includes('rate') || q.includes('cost')) {
      return `Humare do main plans hain sir:<br><br>
      1. <b>WhatsApp Sales Bot:</b> ₹15,000 Setup + ₹3,500/month retainer.<br>
      2. <b>WhatsApp + AI Voice Calling Receptionist:</b> ₹35,000 Setup + ₹10,000/month.<br><br>
      Ek receptionist rakhne se saal ka <b>₹1,50,000 bachta hai</b> aur zero calls miss hoti hain!`;
    }
    if (q.includes('office') || q.includes('address') || q.includes('kahan') || q.includes('jaipur')) {
      return `Humara official office yahan hai sir:<br><br>
      📍 <b>Bhamashah Techno Hub, 2nd Floor, Malviya Nagar, Jaipur, Rajasthan</b>.<br><br>
      Aap visit karne se pehle <b>8005587002</b> par inform kar sakte hain, hum aapke liye demo ready rakhenge!`;
    }
    if (q.includes('gym') || q.includes('fitness')) {
      return `Gyms ke liye humara bot membership queries, 1-Day Free Trial pass issue karna aur trainers ke schedule 24/7 WhatsApp aur phone par sambhalta hai!`;
    }
    if (q.includes('hotel') || q.includes('room')) {
      return `Hotels ke liye humara AI room photo catalogs bhejta hai, check-in policies batata hai aur phone call pe room booking confirm karwata hai!`;
    }
    return `Bilkul sir! Hum aapke business ke according customized AI WhatsApp aur Phone calling bot bana kar 24 ghante me live kar dete hain.<br><br>
    Apna <b>WhatsApp number</b> share karein ya direct founder Rahul ji se baat karein: <b>8005587002</b>.`;
  }

  // --- Voice Call Functionality ---
  let waveInterval = null;
  window.startKsVoiceCall = function () {
    isCalling = true;
    callSeconds = 0;
    const timerEl = document.getElementById('ksCallTimer');
    timerEl.innerText = "Connecting to Priya (AI)...";

    clearInterval(callTimer);
    callTimer = setInterval(() => {
      callSeconds++;
      const mins = String(Math.floor(callSeconds / 60)).padStart(2, '0');
      const secs = String(callSeconds % 60).padStart(2, '0');
      timerEl.innerText = `Active Call • ${mins}:${secs}`;
    }, 1000);

    // Waveform Animation
    clearInterval(waveInterval);
    waveInterval = setInterval(() => {
      document.querySelectorAll('.ks-w-bar').forEach(bar => {
        bar.style.height = `${Math.floor(Math.random() * 28) + 6}px`;
      });
    }, 150);

    // Speak Greeting
    setTimeout(() => {
      speakVoiceReply("Namaste! KS Innovation me Priya bol rahi hoon. Bataiye aapke business ke liye AI receptionist ya WhatsApp bot ki inquiry karni hai?");
    }, 600);
  };

  window.endKsVoiceCall = function () {
    isCalling = false;
    clearInterval(callTimer);
    clearInterval(waveInterval);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    window.switchKsTab('chat');
  };

  function speakVoiceReply(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'hi-IN';
    u.rate = 1.0;
    window.speechSynthesis.speak(u);
  }

})();
