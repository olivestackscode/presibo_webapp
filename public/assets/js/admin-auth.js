/**
 * Presibo Admin Security & Authentication Guard
 * Endpoint: https://api.presibo.com/admin/index.php
 * 
 * Actions supported:
 * - get_session_user (GET) - Validates active admin session (Cookie based, credentials: include)
 * - verify_password (POST) - Authenticates Admin ID and password (JSON { email, password }, credentials: include)
 */

(function () {
  const ADMIN_API_URL = (window.CONFIG && window.CONFIG.API_ADMIN_URL)
    ? window.CONFIG.API_ADMIN_URL
    : 'https://api.presibo.com/admin/index.php';

  let currentAdminSession = null;
  let isCheckingSession = true;
  let onAuthSuccessCallbacks = [];

  // Expose global AdminAuth object
  window.AdminAuth = {
    getAdmin: () => currentAdminSession,
    isAuthenticated: () => !!currentAdminSession,
    checkSession,
    login,
    logout,
    onAuthenticated: (fn) => {
      if (currentAdminSession) {
        fn(currentAdminSession);
      } else {
        onAuthSuccessCallbacks.push(fn);
      }
    }
  };

  // Inject CSS styles for Security Lock Overlay
  function injectSecurityStyles() {
    if (document.getElementById('presibo-admin-auth-styles')) return;
    const style = document.createElement('style');
    style.id = 'presibo-admin-auth-styles';
    style.textContent = `
      .presibo-lock-blur {
        filter: blur(14px) opacity(0.15) !important;
        pointer-events: none !important;
        user-select: none !important;
        transition: filter 0.4s ease, opacity 0.4s ease;
      }
      .presibo-modal-animate {
        animation: presiboModalPop 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes presiboModalPop {
        0% { opacity: 0; transform: scale(0.92) translateY(12px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      .presibo-spinner {
        display: inline-block;
        width: 18px;
        height: 18px;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: presiboSpin 0.75s linear infinite;
      }
      @keyframes presiboSpin {
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // Render or get Security Overlay Modal HTML
  function ensureSecurityModal() {
    injectSecurityStyles();
    let modal = document.getElementById('presibo-admin-security-overlay');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'presibo-admin-security-overlay';
      modal.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl transition-all duration-300';
      modal.innerHTML = `
        <div class="w-full max-w-md bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl presibo-modal-animate relative overflow-hidden">
          
          <!-- Top Accent Line -->
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-emerald-500 to-indigo-600"></div>

          <!-- Loading State View -->
          <div id="admin-auth-loading-state" class="py-8 text-center space-y-4">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-purple-400 text-2xl shadow-lg">
              <span class="presibo-spinner text-purple-400"></span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-100">Verifying Security Session</h3>
              <p class="text-xs text-slate-400 mt-1">Connecting to api.presibo.com security endpoint...</p>
            </div>
          </div>

          <!-- Form View (Hidden during initial session check) -->
          <div id="admin-auth-form-state" class="hidden space-y-6">
            
            <div class="text-center space-y-2">
              <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-900 to-slate-800 border border-purple-500/30 flex items-center justify-center text-purple-400 text-2xl shadow-xl">
                <i class="fas fa-shield-halved"></i>
              </div>
              <h2 class="text-xl font-extrabold text-white tracking-tight">Admin Security Lock</h2>
              <p class="text-xs text-slate-400 max-w-xs mx-auto">Authorization required to view device telemetry and access live vital sync data.</p>
            </div>

            <!-- Error Banner -->
            <div id="admin-auth-error-banner" class="hidden p-3.5 rounded-xl bg-red-950/70 border border-red-800/60 text-red-300 text-xs font-medium flex items-start gap-2.5">
              <i class="fas fa-circle-exclamation text-red-400 text-sm mt-0.5 shrink-0"></i>
              <span id="admin-auth-error-text">Unauthorized access. Please log in.</span>
            </div>

            <!-- Login Form -->
            <form id="admin-auth-form" class="space-y-4" onsubmit="return false;">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Admin ID / Email</span>
                  <span class="text-[10px] text-purple-400">Required</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm pointer-events-none">
                    <i class="fas fa-user-shield"></i>
                  </span>
                  <input type="text" id="admin-auth-input-id" autocomplete="username" required
                    class="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                    placeholder="e.g. admin@presibo.com">
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Password</span>
                  <span class="text-[10px] text-purple-400">Required</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm pointer-events-none">
                    <i class="fas fa-lock"></i>
                  </span>
                  <input type="password" id="admin-auth-input-pass" autocomplete="current-password" required
                    class="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                    placeholder="••••••••">
                  <button type="button" id="admin-auth-toggle-pass" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 text-xs">
                    <i class="fas fa-eye" id="admin-auth-eye-icon"></i>
                  </button>
                </div>
              </div>

              <button type="submit" id="admin-auth-submit-btn"
                class="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/40 active:scale-[0.99] transition flex items-center justify-center gap-2">
                <span id="admin-auth-btn-spinner" class="hidden presibo-spinner text-white"></span>
                <span id="admin-auth-btn-text">Authorize Admin Access</span>
              </button>
            </form>

            <div class="pt-2 border-t border-slate-800 text-center">
              <span class="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <i class="fas fa-lock text-emerald-400"></i> Presibo Encrypted Security Guard
              </span>
            </div>

          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Password toggle handler
      const passInput = document.getElementById('admin-auth-input-pass');
      const toggleBtn = document.getElementById('admin-auth-toggle-pass');
      const eyeIcon = document.getElementById('admin-auth-eye-icon');
      if (toggleBtn && passInput) {
        toggleBtn.addEventListener('click', () => {
          if (passInput.type === 'password') {
            passInput.type = 'text';
            eyeIcon.className = 'fas fa-eye-slash';
          } else {
            passInput.type = 'password';
            eyeIcon.className = 'fas fa-eye';
          }
        });
      }

      // Form submit handler
      const form = document.getElementById('admin-auth-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const adminId = document.getElementById('admin-auth-input-id').value.trim();
          const password = document.getElementById('admin-auth-input-pass').value;
          if (!adminId || !password) return;
          await login(adminId, password);
        });
      }
    }
    return modal;
  }

  // Lock / Unlock Page Content
  function setContentLocked(locked) {
    const mainEl = document.querySelector('main') || document.body;
    const overlay = document.getElementById('presibo-admin-security-overlay');
    if (locked) {
      if (mainEl && mainEl !== document.body) mainEl.classList.add('presibo-lock-blur');
      if (overlay) overlay.classList.remove('hidden');
    } else {
      if (mainEl) mainEl.classList.remove('presibo-lock-blur');
      if (overlay) overlay.classList.add('hidden');
    }
  }

  // Update navbar badge with logged in Admin info & logout button
  function renderAdminNavBadge(sessionData) {
    const adminId = sessionData ? (sessionData.admin_id || sessionData.email || 'Admin') : '';
    
    // Check header right controls container
    const headerControls = document.querySelector('header div.flex.items-center.space-x-3') ||
                           document.querySelector('.brand-header-bar');
    
    if (!headerControls) return;

    let badge = document.getElementById('presibo-admin-user-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'presibo-admin-user-badge';
      badge.className = 'flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm';
      headerControls.insertBefore(badge, headerControls.firstChild);
    }

    badge.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="truncate max-w-[130px]" title="${adminId}">Admin: <strong>${adminId}</strong></span>
      <button onclick="window.AdminAuth.logout()" class="ml-1 text-slate-400 hover:text-red-400 transition" title="Logout Session">
        <i class="fas fa-right-from-bracket"></i>
      </button>
    `;
  }

  // Perform session check (action=get_session_user)
  async function checkSession() {
    ensureSecurityModal();
    setContentLocked(true);

    const loadingState = document.getElementById('admin-auth-loading-state');
    const formState = document.getElementById('admin-auth-form-state');
    const errorBanner = document.getElementById('admin-auth-error-banner');

    if (loadingState) loadingState.classList.remove('hidden');
    if (formState) formState.classList.add('hidden');

    try {
      const response = await fetch(`${ADMIN_API_URL}?action=get_session_user`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data && (data.admin_id || data.message === "Session valid")) {
        // Valid active session!
        currentAdminSession = data;
        isCheckingSession = false;
        setContentLocked(false);
        renderAdminNavBadge(data);
        
        // Dispatch authentication event
        onAuthSuccessCallbacks.forEach(fn => fn(data));
        onAuthSuccessCallbacks = [];
        document.dispatchEvent(new CustomEvent('adminAuthenticated', { detail: data }));
        return true;
      } else {
        throw new Error(data.error || "No active session");
      }
    } catch (err) {
      console.warn("Presibo Admin Auth session check:", err.message);
      currentAdminSession = null;
      isCheckingSession = false;

      if (loadingState) loadingState.classList.add('hidden');
      if (formState) formState.classList.remove('hidden');
      if (errorBanner) {
        errorBanner.classList.remove('hidden');
        document.getElementById('admin-auth-error-text').innerText = "Unauthorized access. Please log in with your Admin ID.";
      }
      return false;
    }
  }

  // Perform login authentication (action=verify_password)
  async function login(adminId, password) {
    const btnSpinner = document.getElementById('admin-auth-btn-spinner');
    const btnText = document.getElementById('admin-auth-btn-text');
    const submitBtn = document.getElementById('admin-auth-submit-btn');
    const errorBanner = document.getElementById('admin-auth-error-banner');
    const errorText = document.getElementById('admin-auth-error-text');

    if (submitBtn) submitBtn.disabled = true;
    if (btnSpinner) btnSpinner.classList.remove('hidden');
    if (btnText) btnText.innerText = "Authenticating...";
    if (errorBanner) errorBanner.classList.add('hidden');

    try {
      const response = await fetch(`${ADMIN_API_URL}?action=verify_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: adminId, // PHP endpoint expects 'email' key as admin_id
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && (data.session_created || data.admin_id || data.message)) {
        currentAdminSession = {
          admin_id: data.admin_id || adminId,
          user_id: data.user_id,
          message: data.message
        };

        setContentLocked(false);
        renderAdminNavBadge(currentAdminSession);

        onAuthSuccessCallbacks.forEach(fn => fn(currentAdminSession));
        onAuthSuccessCallbacks = [];
        document.dispatchEvent(new CustomEvent('adminAuthenticated', { detail: currentAdminSession }));
        return true;
      } else {
        throw new Error(data.error || "Invalid Admin ID or password");
      }
    } catch (err) {
      if (errorBanner) {
        errorBanner.classList.remove('hidden');
        errorText.innerText = err.message || "Failed to verify credentials. Please try again.";
      }
      return false;
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnSpinner) btnSpinner.classList.add('hidden');
      if (btnText) btnText.innerText = "Authorize Admin Access";
    }
  }

  // Logout session
  async function logout() {
    currentAdminSession = null;
    const badge = document.getElementById('presibo-admin-user-badge');
    if (badge) badge.remove();

    try {
      await fetch(`${ADMIN_API_URL}?action=logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {}

    checkSession();
  }

  // Automatically initiate session check when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkSession);
  } else {
    checkSession();
  }
})();
