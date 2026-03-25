/* ===== PipInstalls PRO - Full Feature App ===== */

let packageQueue = [];
let isFetchingBatch = false; 

// Top packages fallback
const topPackages = ['boto3', 'urllib3', 'requests', 'typing-extensions', 'botocore', 'certifi', 'charset-normalizer', 'setuptools', 'idna', 'wheel', 'cryptography', 'numpy', 'six', 'pip', 's3transfer', 'pyyaml', 'python-dateutil', 'pydantic', 'packaging', 'jinja2', 'awscli', 'attrs', 'pyasn1', 'colorama', 'markupsafe', 'click', 'rsa', 'jmespath', 'importlib-metadata', 'werkzeug', 'zipp', 'pytest', 'pandas', 'flask', 'marshmallow', 'cffi', 'pyjwt', 'tzdata', 'pydantic-core', 'sqlalchemy', 'fastapi', 'pytz', 'greenlet', 'coverage', 'pycparser', 'future', 'toml', 'grpcio', 'protobuf', 'pluggy', 'scipy', 'httpx', 'starlette', 'sniffio', 'anyio', 'isodate'];

// Category classification for known packages
const categoryMap = {
    // Data Science & ML
    'numpy':'data-science','pandas':'data-science','scipy':'data-science','scikit-learn':'data-science',
    'matplotlib':'data-science','seaborn':'data-science','plotly':'data-science','statsmodels':'data-science',
    'torch':'data-science','tensorflow':'data-science','keras':'data-science','xgboost':'data-science',
    'lightgbm':'data-science','transformers':'data-science','datasets':'data-science','tokenizers':'data-science',
    'nltk':'data-science','spacy':'data-science','gensim':'data-science','huggingface-hub':'data-science',
    'safetensors':'data-science','accelerate':'data-science','evaluate':'data-science','catboost':'data-science',
    'polars':'data-science','dask':'data-science','vaex':'data-science','modin':'data-science',
    'pyarrow':'data-science','arrow':'data-science','sympy':'data-science','networkx':'data-science',
    'bokeh':'data-science','altair':'data-science','shap':'data-science','mlflow':'data-science',
    'optuna':'data-science','ray':'data-science','wandb':'data-science','tensorboard':'data-science',
    'jupyter':'data-science','notebook':'data-science','ipykernel':'data-science','ipython':'data-science',
    'jupyterlab':'data-science','nbconvert':'data-science','h5py':'data-science','tables':'data-science',
    // Vision
    'opencv-python':'vision','opencv-contrib-python':'vision','pillow':'vision','scikit-image':'vision',
    'torchvision':'vision','albumentations':'vision','imageio':'vision','mahotas':'vision',
    'pytesseract':'vision','pdf2image':'vision','cairosvg':'vision','svglib':'vision',
    'ultralytics':'vision','detectron2':'vision','mmcv':'vision','timm':'vision',
    // Web & API
    'requests':'web','flask':'web','django':'web','fastapi':'web','starlette':'web',
    'aiohttp':'web','httpx':'web','urllib3':'web','httpcore':'web','uvicorn':'web',
    'gunicorn':'web','tornado':'web','bottle':'web','sanic':'web','quart':'web',
    'sqlalchemy':'web','celery':'web','redis':'web','boto3':'web','botocore':'web',
    'awscli':'web','s3transfer':'web','jinja2':'web','werkzeug':'web','markupsafe':'web',
    'pydantic':'web','pydantic-core':'web','marshmallow':'web','pyjwt':'web',
    'requests-oauthlib':'web','authlib':'web','python-jose':'web','passlib':'web',
    'beautifulsoup4':'web','scrapy':'web','selenium':'web','playwright':'web',
    'websockets':'web','socketio':'web','grpcio':'web','protobuf':'web','graphene':'web',
    'psycopg2':'web','psycopg2-binary':'web','pymongo':'web','motor':'web','asyncpg':'web',
    'alembic':'web','databases':'web','peewee':'web','elasticsearch':'web',
    'streamlit':'web','gradio':'web','dash':'web','panel':'web','nicegui':'web',
    // Dev Tools
    'pytest':'devtools','coverage':'devtools','tox':'devtools','nox':'devtools',
    'black':'devtools','ruff':'devtools','flake8':'devtools','pylint':'devtools','mypy':'devtools',
    'isort':'devtools','autopep8':'devtools','bandit':'devtools','safety':'devtools',
    'setuptools':'devtools','wheel':'devtools','pip':'devtools','build':'devtools','twine':'devtools',
    'poetry':'devtools','flit':'devtools','hatch':'devtools','pdm':'devtools',
    'click':'devtools','typer':'devtools','rich':'devtools','colorama':'devtools','tqdm':'devtools',
    'python-dotenv':'devtools','pyyaml':'devtools','toml':'devtools','tomli':'devtools',
    'attrs':'devtools','cattrs':'devtools','dataclasses-json':'devtools',
    'packaging':'devtools','importlib-metadata':'devtools','zipp':'devtools','pluggy':'devtools',
    'typing-extensions':'devtools','six':'devtools','future':'devtools','decorator':'devtools',
    'certifi':'devtools','charset-normalizer':'devtools','idna':'devtools',
    'cryptography':'devtools','cffi':'devtools','pycparser':'devtools','pyasn1':'devtools','rsa':'devtools',
    'pre-commit':'devtools','commitizen':'devtools','semver':'devtools','bump2version':'devtools',
    'pyinstaller':'devtools','cx-freeze':'devtools','nuitka':'devtools',
    'loguru':'devtools','structlog':'devtools','sentry-sdk':'devtools',
    'faker':'devtools','factory-boy':'devtools','hypothesis':'devtools',
    'docker':'devtools','paramiko':'devtools','fabric':'devtools','invoke':'devtools',
    'jmespath':'devtools','python-dateutil':'devtools','pytz':'devtools','tzdata':'devtools',
    'greenlet':'devtools','anyio':'devtools','sniffio':'devtools','isodate':'devtools',
};

function classifyPackage(name) {
    const lower = name.toLowerCase();
    if (categoryMap[lower]) return categoryMap[lower];
    // Keyword heuristics for unknown packages
    if (lower.includes('torch') || lower.includes('tensor') || lower.includes('sklearn') || lower.includes('ml')) return 'data-science';
    if (lower.includes('cv') || lower.includes('image') || lower.includes('vision') || lower.includes('photo')) return 'vision';
    if (lower.includes('http') || lower.includes('api') || lower.includes('sql') || lower.includes('web') || lower.includes('server') || lower.includes('client')) return 'web';
    return 'devtools';
}

let packageDataMap = new Map();
let cart = new Map(); // pkgName -> version
let activeCategory = 'all';

// ===== DOM =====
const $ = id => document.getElementById(id);
const gridContainer = $('packages-grid');
const fetchForm = $('fetch-form');
const pkgInput = $('pkg-input');
const fetchBtn = $('fetch-btn');
const cartCount = $('cart-count');
const openCartBtn = $('open-cart-btn');
const cartModal = $('cart-modal');
const closeModalBtn = $('close-modal-btn');
const pipCmd = $('pip-command');
const verifyList = $('verification-list');
const clearCartBtn = $('clear-cart-btn');
const downloadReqBtn = $('download-req-btn');
const downloadBatBtn = $('download-bat-btn');
const downloadShBtn = $('download-sh-btn');
const copyCmdBtn = $('copy-cmd-btn');
const themeToggle = $('theme-toggle');
const themeIcon = $('theme-icon');
const themeLabel = $('theme-label');
const pkgCountValue = $('pkg-count-value');
const categoryNav = $('category-nav');
const compareBtn = $('compare-btn');
const compareModal = $('compare-modal');
const closeCompareModal = $('close-compare-modal');
const compareContent = $('compare-content');
const depModal = $('dep-modal');
const depModalTitle = $('dep-modal-title');
const closeDepModal = $('close-dep-modal');
const depTreeContent = $('dep-tree-content');
const venvBtn = $('venv-btn');
const venvModal = $('venv-modal');
const closeVenvModal = $('close-venv-modal');
const venvContent = $('venv-content');

const docsModal = $('docs-modal');
const closeDocsModal = $('close-docs-modal');
const docsTitle = $('docs-modal-title');
const docsContent = $('docs-content');

const reqFileInput = $('req-file-input');
const uploadReqBtn = $('upload-req-btn');
const shareBtn = $('share-btn');
const searchAutocomplete = $('search-autocomplete');

const downloadLockBtn = $('download-lock-btn');
const downloadTomlBtn = $('download-toml-btn');
const downloadDockerBtn = $('download-docker-btn');
const healthReport = $('health-report');

// Utility for file sizes
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// ===== Toast System =====
function toast(message, type = 'info') {
    const icons = { success:'ph-check-circle', info:'ph-info', warn:'ph-warning', error:'ph-x-circle' };
    const container = $('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="ph-duotone ${icons[type]}"></i> ${message}`;
    container.appendChild(el);
    setTimeout(() => { el.style.animation = 'toastOut 0.4s ease forwards'; setTimeout(() => el.remove(), 400); }, 3000);
}

// ===== Theme Toggle =====
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.className = theme === 'dark' ? 'ph-duotone ph-moon' : 'ph-duotone ph-sun';
    themeLabel.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    localStorage.setItem('pipinstalls-theme', theme);
}
themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
    toast(`Switched to ${current === 'dark' ? 'Light' : 'Dark'} Mode`, 'info');
});
// Load saved theme
applyTheme(localStorage.getItem('pipinstalls-theme') || 'dark');

function saveCart() { localStorage.setItem('pipinstalls-cart', JSON.stringify(Array.from(cart.entries()))); }
function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem('pipinstalls-cart'));
        if (saved) { cart = new Map(saved); updateCartIcon(); }
    } catch(e) {}
}

async function syncCartData() {
    loadCart();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('cart')) {
        const paramStr = urlParams.get('cart');
        paramStr.split(',').forEach(item => {
            const [n, v] = item.split('@');
            if (n && v) cart.set(n, v);
            else if (n) cart.set(n, 'latest'); // Will resolve on fetch
        });
        saveCart(); updateCartIcon();
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    const missing = Array.from(cart.keys()).filter(name => !packageDataMap.has(name));
    if (missing.length > 0) {
        toast(`Restoring ${missing.length} pinned packages...`, 'info');
        await Promise.all(missing.map(async name => {
            try {
                const res = await fetch(`https://pypi.org/pypi/${name}/json`);
                if (res.ok) {
                    const data = await res.json();
                    packageDataMap.set(data.info.name, processPackageData(data));
                }
            } catch(e) {}
        }));
        renderGrid();
        updateModal();
    }
}

// ===== PyPI Helper =====
function extractDetails(info) {
    let author = info.author || info.maintainer || '';
    if (!author || author.trim() === 'UNKNOWN') author = 'Community';
    author = author.length > 22 ? author.substring(0, 19) + '...' : author;

    let license = info.license || '';
    if (!license || license.length > 30 || license.trim() === 'UNKNOWN') {
        const cls = (info.classifiers || []).find(c => c.startsWith('License ::'));
        license = cls ? cls.split('::').pop().trim() : 'Unspecified';
    }
    license = license.length > 22 ? license.substring(0, 19) + '...' : license;

    const python = info.requires_python || 'Any';
    let link = info.home_page || '#';
    if (info.project_urls) link = info.project_urls['Source'] || info.project_urls['Homepage'] || link;

    return { author, license, python, link };
}

function checkVulnerable(name, version) {
    const pkg = packageDataMap.get(name);
    return pkg && pkg.vulnerabilities && pkg.vulnerabilities.length > 0;
}

function getBestFileUrl(pkg, version) {
    const files = (pkg.releases[version] || []);
    const best = files.find(f => f.filename.endsWith('.whl')) || files[0];
    return best ? best.url : '#';
}

function processPackageData(data, cat = null) {
    const versions = Object.keys(data.releases).filter(v => data.releases[v].length > 0).reverse();
    const d = extractDetails(data.info);
    
    // Auto-classify if no category provided
    if (!cat) cat = classifyPackage(data.info.name);
    
    let osMatrix = { win: false, mac: false, lin: false, any: false };
    const latestFiles = data.releases[data.info.version] || [];
    latestFiles.forEach(f => {
        const lower = f.filename.toLowerCase();
        if (lower.includes('win_') || lower.includes('win32')) osMatrix.win = true;
        if (lower.includes('macosx')) osMatrix.mac = true;
        if (lower.includes('manylinux') || lower.includes('musllinux')) osMatrix.lin = true;
        if (lower.includes('none-any')) osMatrix.any = true;
    });

    return {
        name: data.info.name, cat, latestVersion: data.info.version,
        summary: data.info.summary || 'No description.', ...d,
        versions, releases: data.releases,
        requires_dist: data.info.requires_dist || [],
        vulnerabilities: data.vulnerabilities || [],
        downloads: 0,
        osMatrix,
        description: data.info.description || '',
        descType: data.info.description_content_type || ''
    };
}

async function populateStats(name) {
    try {
        const pkg = packageDataMap.get(name);
        if (pkg && pkg.downloads === 0) {
            const res = await fetch(`https://pypistats.org/api/packages/${name}/recent`);
            if (res.ok) {
                const data = await res.json();
                pkg.downloads = data.data.last_month;
                renderGrid(); // re-render to show stats
            }
        }
    } catch(e) {}
}

// ===== Fetch / Infinite Scroll Logic =====
async function bootInfiniteScroll() {
    gridContainer.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading global package directory...</p></div>';
    try {
        const res = await fetch('https://hugovk.github.io/top-pypi-packages/top-pypi-packages-30-days.min.json');
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        packageQueue = data.rows.map(r => r.project);
        packageQueue = packageQueue.filter(p => !cart.has(p)); 
    } catch(e) {
        packageQueue = [...topPackages];
    }
    
    await fetchNextBatch(18); // First visible batch
    await syncCartData();
    setupScrollObserver(); // ALWAYS setup, regardless of path
}

async function fetchNextBatch(count = 12) {
    if (isFetchingBatch || packageQueue.length === 0) return;
    isFetchingBatch = true;
    
    const sentinel = $('scroll-sentinel');
    if (sentinel) sentinel.style.opacity = '1';
    
    // Clear the initial loading spinner if this is the very first load
    const loadingState = gridContainer.querySelector('.loading-state');
    if (loadingState) loadingState.remove();
    
    const batchList = packageQueue.splice(0, count);
    const newPackages = [];
    
    await Promise.all(batchList.map(async (name) => {
        if (packageDataMap.has(name)) return;
        try {
            const res = await fetch(`https://pypi.org/pypi/${name}/json`);
            if (!res.ok) return;
            const data = await res.json();
            const pkg = processPackageData(data);
            packageDataMap.set(data.info.name, pkg);
            newPackages.push(pkg);
            populateStats(data.info.name);
        } catch(e) {}
    }));
    
    // APPEND new cards to the grid without clearing existing ones
    newPackages.forEach(pkg => appendCardToGrid(pkg));
    animateCounter();
    
    if (sentinel) sentinel.style.opacity = '0';
    isFetchingBatch = false;
}

function appendCardToGrid(pkg) {
    const currentVersion = cart.get(pkg.name) || pkg.latestVersion;
    const isSelected = cart.has(pkg.name);
    const isVuln = pkg.vulnerabilities && pkg.vulnerabilities.length > 0;
    const opts = pkg.versions.slice(0, 30).map(v =>
        `<option value="${v}" ${v === currentVersion ? 'selected' : ''}>${v}</option>`
    ).join('');

    const osFlags = [];
    if (pkg.osMatrix && pkg.osMatrix.any) osFlags.push('<span title="Universal">\u{1F310}</span>');
    else if (pkg.osMatrix) {
        if (pkg.osMatrix.win) osFlags.push('<span title="Windows">\u{1FA9F}</span>');
        if (pkg.osMatrix.mac) osFlags.push('<span title="MacOS">\u{1F34F}</span>');
        if (pkg.osMatrix.lin) osFlags.push('<span title="Linux">\u{1F427}</span>');
    }
    const osHtml = osFlags.length > 0 ? `<div style="font-size:1.1rem;letter-spacing:4px;margin-top:5px;">${osFlags.join('')}</div>` : '';

    const card = document.createElement('div');
    card.className = `package-card ${isSelected ? 'selected' : ''} animate-in`;
    card.id = `card-${pkg.name}`;
    card.style.animationDelay = `${(gridContainer.querySelectorAll('.package-card').length % 12) * 0.04}s`;
    card.innerHTML = `
        ${isVuln ? '<div class="vuln-flag" title="PyPI Registered Vulnerability!"><i class="ph-duotone ph-warning"></i> CVE Found</div>' : ''}
        <div class="card-header">
            <div>
                <h3 class="card-title" title="${pkg.name}" style="margin-bottom:2px;">${pkg.name}</h3>
                ${osHtml}
            </div>
            <select class="version-select" onchange="onVersionChange('${pkg.name}', this.value)" id="sel-${pkg.name}">${opts}</select>
        </div>
        <p class="card-desc">${pkg.summary}</p>
        <div class="card-meta">
            <span><i class="ph-duotone ph-user"></i> ${pkg.author}</span>
            <span><i class="ph-duotone ph-scales"></i> ${pkg.license}</span>
            <span style="color:var(--green)"><i class="ph-duotone ph-code"></i> ${pkg.python}</span>
            ${pkg.downloads > 0 ? `<span style="color:var(--accent)" title="Monthly Downloads"><i class="ph-duotone ph-trend-up"></i> ${(pkg.downloads/1000000).toFixed(1)}M/mo</span>` : ''}
            <a href="${pkg.link}" target="_blank"><i class="ph-duotone ph-arrow-square-out"></i> Source</a>
        </div>
        <div class="card-actions" style="flex-wrap: wrap;">
            <a href="${getBestFileUrl(pkg, currentVersion)}" target="_blank" class="card-btn dl" id="dl-${pkg.name}">
                <i class="ph-duotone ph-download-simple"></i> Download
            </a>
            <button class="card-btn pin" onclick="togglePin('${pkg.name}')">
                ${isSelected ? '<i class="ph-duotone ph-check-circle"></i> Pinned' : '<i class="ph-duotone ph-push-pin"></i> Pin'}
            </button>
            <button class="card-btn dep" onclick="showDeps('${pkg.name}')">
                <i class="ph-duotone ph-tree-structure"></i> Deps
            </button>
            <button class="card-btn" onclick="showDocs('${pkg.name}')" style="background: rgba(var(--accent-raw, 189, 157, 255), 0.06); color: var(--accent-2);">
                <i class="ph-duotone ph-book-open-text"></i> Docs
            </button>
        </div>
    `;
    gridContainer.appendChild(card);
}

function setupScrollObserver() {
    const sentinel = $('scroll-sentinel');
    if (!sentinel) return;
    
    // IntersectionObserver approach
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isFetchingBatch) {
            if (activeCategory === 'all' && !pkgInput.value.trim()) {
                fetchNextBatch(12);
            }
        }
    }, { rootMargin: '600px' });
    observer.observe(sentinel);
    
    // ALSO add a classic scroll listener as backup guarantee
    window.addEventListener('scroll', () => {
        if (isFetchingBatch || packageQueue.length === 0) return;
        const scrollBottom = window.innerHeight + window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        if (scrollBottom >= docHeight - 800) {
            if (activeCategory === 'all' && !pkgInput.value.trim()) {
                fetchNextBatch(12);
            }
        }
    });
}

async function fetchPackage(name) {
    name = name.toLowerCase().trim();
    if (!name) return;
    fetchBtn.disabled = true;
    fetchBtn.innerHTML = '<i class="ph ph-spinner"></i>';
    try {
        const res = await fetch(`https://pypi.org/pypi/${name}/json`);
        if (!res.ok) throw new Error('Package not found');
        const data = await res.json();
        const pd = processPackageData(data);
        pd.isSearched = true; // flag this so it pops to the top of the grid UI
        packageDataMap.set(data.info.name, pd);
        pkgInput.value = '';
        if (searchAutocomplete) searchAutocomplete.style.display = 'none';
        animateCounter();
        populateStats(data.info.name);
        renderGrid();
        toast(`Fetched ${data.info.name} v${data.info.version}`, 'success');
        return data.info.name;
    } catch(e) { toast(e.message, 'error'); }
    finally { fetchBtn.disabled = false; fetchBtn.textContent = 'Fetch'; }
}

// ===== Animated Counter =====
function animateCounter() {
    const target = packageDataMap.size;
    const current = parseInt(pkgCountValue.textContent) || 0;
    if (current === target) return;
    let val = current;
    const step = Math.max(1, Math.ceil((target - current) / 10));
    const interval = setInterval(() => {
        val += step;
        if (val >= target) { val = target; clearInterval(interval); }
        pkgCountValue.textContent = val;
    }, 40);
    // Update footer counter too
    const footerCount = document.getElementById('footer-pkg-count');
    if (footerCount) footerCount.textContent = target;
}

// ===== Category Filter =====
categoryNav.addEventListener('click', e => {
    const btn = e.target.closest('.category-btn');
    if (!btn) return;
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.category;
    renderGrid();
});

// ===== Render Grid (with empty state) =====
function renderGrid() {
    if (packageDataMap.size === 0) return;
    gridContainer.innerHTML = '';

    const pkgArr = Array.from(packageDataMap.values());
    pkgArr.sort((a,b) => (b.isSearched ? 1 : 0) - (a.isSearched ? 1 : 0));

    // Filter by active category
    const filtered = pkgArr.filter(pkg => activeCategory === 'all' || pkg.cat === activeCategory);

    // Show empty state if no packages match the category
    if (filtered.length === 0) {
        const catIcons = { 'data-science':'ph-brain', 'vision':'ph-camera', 'web':'ph-globe-hemisphere-west', 'devtools':'ph-wrench' };
        const catNames = { 'data-science':'Data Science', 'vision':'Vision', 'web':'Web & API', 'devtools':'Dev Tools' };
        const icon = catIcons[activeCategory] || 'ph-squares-four';
        const name = catNames[activeCategory] || activeCategory;
        gridContainer.innerHTML = `
            <div class="empty-state">
                <i class="ph-duotone ${icon} empty-state-icon"></i>
                <h3>No ${name} packages loaded yet</h3>
                <p>Scroll down on "All Packages" to load more, or search for a specific ${name.toLowerCase()} package using the search bar above.</p>
            </div>
        `;
        return;
    }

    let idx = 0;
    filtered.forEach(pkg => {

        const isSelected = cart.has(pkg.name);
        const currentVersion = cart.get(pkg.name) || pkg.latestVersion;
        const isVuln = checkVulnerable(pkg.name, currentVersion);

        const opts = pkg.versions.slice(0, 50).map(v =>
            `<option value="${v}" ${v === currentVersion ? 'selected' : ''}>${v}</option>`
        ).join('');

        const osFlags = [];
        if (pkg.osMatrix.any) osFlags.push('<span title="Universal OS Wheel / Pure Python">🌐</span>');
        else {
            if (pkg.osMatrix.win) osFlags.push('<span title="Windows Wheel Available">🪟</span>');
            if (pkg.osMatrix.mac) osFlags.push('<span title="MacOS Wheel Available">🍏</span>');
            if (pkg.osMatrix.lin) osFlags.push('<span title="Linux Wheel Available">🐧</span>');
        }
        const osHtml = osFlags.length > 0 ? `<div style="font-size: 1.1rem; letter-spacing: 4px; margin-top: 5px;">${osFlags.join('')}</div>` : '';

        const card = document.createElement('div');
        card.className = `package-card ${isSelected ? 'selected' : ''} animate-in`;
        card.style.animationDelay = `${(idx++) * 0.04}s`;
        card.innerHTML = `
            ${isVuln ? '<div class="vuln-flag" title="PyPI Registered Vulnerability!"><i class="ph-duotone ph-warning"></i> CVE Found</div>' : ''}
            <div class="card-header">
                <div>
                    <h3 class="card-title" title="${pkg.name}" style="margin-bottom:2px;">${pkg.name}</h3>
                    ${osHtml}
                </div>
                <select class="version-select" onchange="onVersionChange('${pkg.name}', this.value)" id="sel-${pkg.name}">${opts}</select>
            </div>
            <p class="card-desc">${pkg.summary}</p>
            <div class="card-meta">
                <span><i class="ph-duotone ph-user"></i> ${pkg.author}</span>
                <span><i class="ph-duotone ph-file-text"></i> ${pkg.license}</span>
                <span style="color:var(--green)"><i class="ph-duotone ph-code"></i> ${pkg.python}</span>
                ${pkg.downloads > 0 ? `<span style="color:var(--accent)" title="Monthly Downloads"><i class="ph-duotone ph-trend-up"></i> ${(pkg.downloads/1000000).toFixed(1)}M/mo</span>` : ''}
                <a href="${pkg.link}" target="_blank"><i class="ph-duotone ph-link"></i> Source</a>
            </div>
            <div class="card-actions" style="flex-wrap: wrap;">
                <a href="${getBestFileUrl(pkg, currentVersion)}" target="_blank" class="card-btn dl" id="dl-${pkg.name}">
                    <i class="ph-duotone ph-download-simple"></i> Download
                </a>
                <button class="card-btn pin" onclick="togglePin('${pkg.name}')">
                    ${isSelected ? '<i class="ph-duotone ph-check-circle"></i> Pinned' : '<i class="ph-duotone ph-push-pin"></i> Pin'}
                </button>
                <button class="card-btn dep" onclick="showDeps('${pkg.name}')">
                    <i class="ph-duotone ph-tree-structure"></i> Deps
                </button>
                <button class="card-btn" onclick="showDocs('${pkg.name}')" style="background: rgba(var(--accent-raw, 189, 157, 255), 0.06); color: var(--accent-2);">
                    <i class="ph-duotone ph-book-open-text"></i> Docs
                </button>
            </div>
        `;
        gridContainer.appendChild(card);
    });

    if (gridContainer.innerHTML === '') {
        gridContainer.innerHTML = '<div class="loading-state"><p>No packages match this filter.</p></div>';
    }
    updateCompareBtn();
}

// ===== Pin / Cart =====
window.togglePin = (name) => {
    if (cart.has(name)) { cart.delete(name); toast(`Removed ${name}`, 'warn'); }
    else {
        const sel = $(`sel-${name}`);
        cart.set(name, sel ? sel.value : packageDataMap.get(name).latestVersion);
        toast(`Pinned ${name}`, 'success');
    }
    updateCartIcon(); renderGrid(); saveCart();
};

window.onVersionChange = (name, ver) => {
    if (cart.has(name)) { cart.set(name, ver); saveCart(); }
    const pkg = packageDataMap.get(name);
    const dlBtn = $(`dl-${name}`);
    if (pkg && dlBtn) dlBtn.href = getBestFileUrl(pkg, ver);

    if (checkVulnerable(name, ver)) toast(`⚠ ${name} v${ver} has known vulnerabilities!`, 'error');
};

function updateCartIcon() {
    cartCount.textContent = cart.size;
    cartCount.style.transform = 'scale(1.3)';
    setTimeout(() => cartCount.style.transform = 'scale(1)', 200);
}

// ===== Compare =====
function updateCompareBtn() { compareBtn.disabled = cart.size < 2; }

compareBtn.addEventListener('click', () => {
    const entries = Array.from(cart.entries()).slice(0, 2);
    const [a, b] = entries.map(([n]) => packageDataMap.get(n));
    if (!a || !b) return toast('Pin at least 2 packages to compare', 'warn');

    const rows = [
        ['Version', a.latestVersion, b.latestVersion],
        ['Downloads / Month', a.downloads > 0 ? a.downloads.toLocaleString() : 'N/A', b.downloads > 0 ? b.downloads.toLocaleString() : 'N/A'],
        ['Author', a.author, b.author],
        ['License', a.license, b.license],
        ['Python', a.python, b.python],
        ['Dependencies', (a.requires_dist||[]).length, (b.requires_dist||[]).length],
        ['Release Files', (a.releases[a.latestVersion]||[]).length, (b.releases[b.latestVersion]||[]).length],
        ['Vulnerability', checkVulnerable(a.name, a.latestVersion) ? '⚠ Yes' : '✅ No', checkVulnerable(b.name, b.latestVersion) ? '⚠ Yes' : '✅ No']
    ];

    compareContent.innerHTML = `<table class="compare-table">
        <thead><tr><th>Property</th><th>${a.name}</th><th>${b.name}</th></tr></thead>
        <tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody>
    </table>`;
    compareModal.classList.add('active');
});

// ===== Dependency Tree =====
window.showDeps = async (name) => {
    depModalTitle.textContent = `${name} Dependencies`;
    depTreeContent.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Fetching...</p></div>';
    depModal.classList.add('active');

    const pkg = packageDataMap.get(name);
    const deps = pkg?.requires_dist || [];
    if (deps.length === 0) {
        depTreeContent.innerHTML = '<p style="color:var(--text-secondary); text-align:center;">No dependencies listed for this package.</p>';
        return;
    }

    const cleanDeps = deps.map(d => {
        const parts = d.split(';');
        const nameVer = parts[0].trim().replace(/\s*\(.*\)\s*/, '');
        const extra = parts[1] ? `<span style="color:var(--text-secondary); font-size:0.8rem;" title="${parts[1].trim()}"> (Env)</span>` : '';
        const rawNameMatch = nameVer.match(/^([a-zA-Z0-9_\.-]+)/);
        const rawName = rawNameMatch ? rawNameMatch[1] : nameVer;

        return `<details class="dep-details" onsubmit="event.preventDefault()">
            <summary onclick="loadSubDeps(this, '${rawName}')">${nameVer}${extra}</summary>
            <div class="sub-deps"></div>
        </details>`;
    });
    depTreeContent.innerHTML = `<div class="dep-tree" style="text-align: left;">${cleanDeps.join('')}</div>`;
};

window.loadSubDeps = async (summaryEl, name) => {
    const details = summaryEl.parentElement;
    const subDepsContainer = details.querySelector('.sub-deps');
    if (details.open || subDepsContainer.innerHTML !== '') return;
    
    subDepsContainer.innerHTML = '<div class="spinner" style="width:14px;height:14px;margin:5px 0 0 15px;display:inline-block"></div>';
    try {
        const res = await fetch(`https://pypi.org/pypi/${name}/json`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const deps = data.info.requires_dist || [];
        if (deps.length === 0) {
            subDepsContainer.innerHTML = '<div style="margin-left:15px;color:var(--text-secondary);font-size:0.8rem;padding: 4px 0;">No sub-dependencies.</div>';
            return;
        }
        const cleanDeps = deps.map(d => {
            const parts = d.split(';');
            const nameVer = parts[0].trim().replace(/\s*\(.*\)\s*/, '');
            const rawNameMatch = nameVer.match(/^([a-zA-Z0-9_\.-]+)/);
            const rawName = rawNameMatch ? rawNameMatch[1] : nameVer;
            return `<details class="dep-details" style="margin-left: 15px;">
                <summary onclick="loadSubDeps(this, '${rawName}')">${nameVer}</summary>
                <div class="sub-deps"></div>
            </details>`;
        });
        subDepsContainer.innerHTML = `<div class="dep-tree" style="padding: 4px 0;">${cleanDeps.join('')}</div>`;
    } catch(e) {
        subDepsContainer.innerHTML = '<div style="margin-left:15px;color:var(--red);font-size:0.8rem;padding: 4px 0;">Failed to trace.</div>';
    }
};

// ===== Venv Script Generator =====
venvBtn.addEventListener('click', () => {
    const pkgList = cart.size > 0 ? Array.from(cart.entries()).map(([n, v]) => `${n}==${v}`).join(' ') : '<your-packages>';

    venvContent.innerHTML = `
    <div class="venv-block"><h4><i class="ph ph-windows-logo"></i> Windows (CMD / PowerShell)</h4>
    <div class="code-box"><code>python -m venv .venv && .venv\\Scripts\\activate && pip install ${pkgList}</code>
    <button class="copy-btn" onclick="copyText(this.previousElementSibling.textContent)"><i class="ph ph-copy"></i></button></div></div>

    <div class="venv-block"><h4><i class="ph ph-linux-logo"></i> Linux / macOS</h4>
    <div class="code-box"><code>python3 -m venv .venv && source .venv/bin/activate && pip install ${pkgList}</code>
    <button class="copy-btn" onclick="copyText(this.previousElementSibling.textContent)"><i class="ph ph-copy"></i></button></div></div>

    <div class="venv-block"><h4><i class="ph ph-note"></i> With requirements.txt</h4>
    <div class="code-box"><code>pip install --require-hashes -r requirements.txt</code>
    <button class="copy-btn" onclick="copyText(this.previousElementSibling.textContent)"><i class="ph ph-copy"></i></button></div></div>
    `;
    venvModal.classList.add('active');
});

// ===== Cart Modal & Health Check =====
function updateModal() {
    if (cart.size === 0) {
        pipCmd.textContent = 'pip install ';
        verifyList.innerHTML = '<div class="empty-state-text">Your workspace is empty.</div>';
        healthReport.innerHTML = '<div class="empty-state-text">Add packages to analyze workspace safety.</div>';
        return;
    }
    const parts = [];
    cart.forEach((v, n) => parts.push(`"${n}==${v}"`));
    pipCmd.textContent = `pip install ${parts.join(' ')}`;

    verifyList.innerHTML = '';
    
    // Health Variables
    const licenses = {};
    const requirements = [];

    cart.forEach((version, name) => {
        const pkg = packageDataMap.get(name);
        if (!pkg) return;
        
        // Health: Count Licenses
        const lic = pkg.license && pkg.license !== 'Unspecified' ? pkg.license : 'Unknown';
        licenses[lic] = (licenses[lic] || 0) + 1;
        
        // Health: Collect reqs
        (pkg.requires_dist || []).forEach(req => requirements.push({ source: name, req }));

        const files = pkg.releases[version] || [];
        const hashes = files.map(f => {
            const date = new Date(f.upload_time).toLocaleDateString();
            return `<div class="hash-value">
                <div style="display:flex; justify-content:space-between; color:var(--text-secondary); margin-bottom: 2px;">
                    <span>${f.filename}</span>
                    <span>${formatBytes(f.size)} • ${date}</span>
                </div>
                <div style="font-family: 'Fira Code', monospace; font-size:0.8rem; color:var(--accent); word-break: break-all;">
                    SHA256: ${f.digests.sha256}
                </div>
            </div>`;
        }).join('');
        
        const item = document.createElement('div');
        item.className = 'verify-item';
        item.style.marginBottom = '15px';
        item.innerHTML = `<div class="verify-header" style="border-bottom: 1px solid var(--border); padding-bottom: 5px; margin-bottom: 8px;">
            <span class="verify-title" style="font-weight: 600;">${name} == ${version}</span>
            <span style="font-size:0.8rem;color:var(--text-secondary)">${files.length} artifacts</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">${hashes || '<div class="empty-state-text">No artifacts for this version.</div>'}</div>`;
        verifyList.appendChild(item);
    });

    // Render Health Check
    const conflictWarns = [];
    requirements.forEach(r => {
        const match = r.req.match(/^([a-zA-Z0-9_\.-]+)/);
        if (match) {
            const reqName = match[1].toLowerCase();
            if (cart.has(reqName) && r.req.match(/[<>=!]/)) {
                conflictWarns.push(`<li style="margin-bottom: 4px;"><strong>${r.source}</strong> explicitly restricts <strong>${reqName}</strong> <code>${r.req.replace(match[1],'').trim()}</code></li>`);
            }
        }
    });

    const lCount = Object.keys(licenses).map(l => {
        const isBad = l.toLowerCase().includes('gpl') && !l.toLowerCase().includes('lgpl');
        return `<span style="display:inline-block; margin: 4px 8px 0 0; border: 1px solid var(--border); padding: 2px 6px; border-radius: 4px; color:${isBad ? 'var(--red)' : 'var(--text-secondary)'}">${licenses[l]}x ${l === 'Unknown' ? 'Unspecified' : l}</span>`;
    }).join('');

    healthReport.innerHTML = `
        <div style="margin-bottom: 12px;">
            <strong style="color:var(--text);"><i class="ph ph-file-text"></i> Stack Licenses Detected:</strong><br>
            <div style="margin-top:4px;">${lCount || 'None'}</div>
        </div>
        <div>
            <strong style="color:var(--text);"><i class="ph ph-warning-circle"></i> Potential Version Matrix Conflicts:</strong><br>
            ${conflictWarns.length > 0 ? `<ul style="color:var(--red); padding-left:15px; margin:5px 0 0 0; font-family:'Fira Code', monospace; font-size: 0.8rem;">${conflictWarns.slice(0,4).join('')}${conflictWarns.length>4?'<li>... and more</li>':''}</ul>` : '<div style="color:var(--green); margin-top:4px;">✅ No obvious severe constraints found.</div>'}
        </div>
    `;
}

// ===== Documentation Modal =====
window.showDocs = (name) => {
    const pkg = packageDataMap.get(name);
    docsTitle.textContent = `${name} Documentation`;
    if (!pkg.description || pkg.description.trim() === 'UNKNOWN') {
        docsContent.innerHTML = '<div class="empty-state-text">No documentation found in PyPI metadata.</div>';
    } else if ((pkg.descType === 'text/markdown' || pkg.description.startsWith('#')) && typeof marked !== 'undefined') {
        docsContent.innerHTML = `<div class="markdown-body" style="background:transparent; color:var(--text);">${marked.parse(pkg.description)}</div>`;
        // Quick style fix for links in markdown
        docsContent.querySelectorAll('a').forEach(a => { a.style.color = 'var(--accent)'; a.target = '_blank'; });
    } else {
        docsContent.innerHTML = `<div style="white-space: pre-wrap; font-family: 'Fira Code', monospace; font-size: 0.9rem;">${pkg.description}</div>`;
    }
    docsModal.classList.add('active');
};

closeDocsModal.addEventListener('click', () => docsModal.classList.remove('active'));
docsModal.addEventListener('click', e => { if(e.target === docsModal) docsModal.classList.remove('active'); });

// ===== Download Generators =====
async function buildLockfile() {
    toast('Generating recursive lockfile... This might take some time.', 'info');
    gridContainer.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Resolving universal dependency graph...</p></div>';
    
    const lockMap = new Map();
    const queue = Array.from(cart.entries()).map(([n, v]) => ({ name: n, ver: v }));
    
    // Safety break counter
    let iters = 0;
    
    while (queue.length > 0 && iters < 800) {
        iters++;
        const { name, ver } = queue.shift();
        if (lockMap.has(name)) continue;
        
        let pkg = packageDataMap.get(name);
        if (!pkg || ver !== pkg.latestVersion) {
            try {
                const res = await fetch(`https://pypi.org/pypi/${name}/${ver !== 'latest' && ver ? ver + '/' : ''}json`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                pkg = processPackageData(data);
            } catch(e) { continue; }
        }
        
        const lockedVer = pkg.latestVersion;
        const files = pkg.releases[lockedVer] || [];
        const hashes = files.map(f => `--hash=sha256:${f.digests.sha256}`);
        
        lockMap.set(name, { version: lockedVer, hashes });
        
        (pkg.requires_dist || []).forEach(req => {
            const clean = req.split(';')[0].trim();
            const match = clean.match(/^([a-zA-Z0-9_\.-]+)/);
            if (match) {
                const reqName = match[1].toLowerCase();
                if (!lockMap.has(reqName)) {
                    const verMatch = clean.match(/==([\d\.]+)/);
                    queue.push({ name: reqName, ver: verMatch ? verMatch[1] : 'latest' });
                }
            }
        });
    }
    
    renderGrid();
    return lockMap;
}

if (downloadLockBtn) {
    downloadLockBtn.addEventListener('click', async () => {
        if (cart.size === 0) return toast('No packages pinned!', 'warn');
        try {
            const lockMap = await buildLockfile();
            const lines = ['# pip install --require-hashes -r requirements.lock\n'];
            lockMap.forEach((data, name) => {
                let block = `${name}==${data.version}`;
                if (data.hashes.length > 0) block += ' \\\n    ' + data.hashes.join(' \\\n    ');
                lines.push(block);
            });
            downloadFile(lines.join('\n\n') + '\n', 'requirements.lock');
            toast(`Locked ${lockMap.size} dependencies!`, 'success');
        } catch(e) {
            renderGrid();
            toast('Failed to resolve lockfile tree.', 'error');
        }
    });
}

function generateReqTxt() {

    const lines = [];
    cart.forEach((ver, name) => {
        const pkg = packageDataMap.get(name);
        const files = pkg?.releases[ver] || [];
        let block = `${name}==${ver}`;
        files.forEach(f => { block += ` \\\n    --hash=sha256:${f.digests.sha256}`; });
        lines.push(block);
    });
    return `# requirements.txt - PipInstalls PRO\n# pip install --require-hashes -r requirements.txt\n\n${lines.join('\n\n')}\n`;
}

function downloadFile(content, filename) {
    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast(`Downloaded ${filename}`, 'success');
}

downloadReqBtn.addEventListener('click', () => {
    if (cart.size === 0) return toast('No packages pinned!', 'warn');
    downloadFile(generateReqTxt(), 'requirements.txt');
});

if (downloadTomlBtn) {
    downloadTomlBtn.addEventListener('click', () => {
        if (cart.size === 0) return toast('No packages pinned!', 'warn');
        const lines = [];
        cart.forEach((ver, name) => lines.push(`"${name}" = "==${ver}"`));
        const content = `[tool.poetry]\nname = "pipinstalls-pro-workspace"\nversion = "0.1.0"\ndescription = "Generated by PipInstalls PRO"\nauthors = ["Developer"]\n\n[tool.poetry.dependencies]\npython = "^3.9"\n${lines.join('\n')}\n\n[build-system]\nrequires = ["poetry-core"]\nbuild-backend = "poetry.core.masonry.api"\n`;
        downloadFile(content, 'pyproject.toml');
    });
}

if (downloadDockerBtn) {
    downloadDockerBtn.addEventListener('click', () => {
        if (cart.size === 0) return toast('No packages pinned!', 'warn');
        const content = `# Generated by PipInstalls PRO\nFROM python:3.11-slim\n\nWORKDIR /app\n\n# Ensure security updates\nRUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*\n\n# Secure Requirements Install\nCOPY requirements.txt .\nRUN pip install --no-cache-dir --upgrade pip \\\n    && pip install --no-cache-dir --require-hashes -r requirements.txt\n\nCOPY . .\nCMD ["python", "main.py"]\n`;
        downloadFile(content, 'Dockerfile');
        toast('Downloaded! Make sure to download requirements.txt as well.', 'info');
    });
}

downloadBatBtn.addEventListener('click', () => {
    if (cart.size === 0) return toast('No packages pinned!', 'warn');
    const pkgs = [];
    cart.forEach((v, n) => pkgs.push(`${n}==${v}`));
    const script = `@echo off\nREM PipInstalls PRO - Windows Install Script\necho Creating virtual environment...\npython -m venv .venv\ncall .venv\\Scripts\\activate.bat\necho Installing packages...\npip install ${pkgs.join(' ')}\necho.\necho Done! All packages installed.\npause\n`;
    downloadFile(script, 'install.bat');
});

downloadShBtn.addEventListener('click', () => {
    if (cart.size === 0) return toast('No packages pinned!', 'warn');
    const pkgs = [];
    cart.forEach((v, n) => pkgs.push(`${n}==${v}`));
    const script = `#!/bin/bash\n# PipInstalls PRO - Linux/Mac Install Script\necho "Creating virtual environment..."\npython3 -m venv .venv\nsource .venv/bin/activate\necho "Installing packages..."\npip install ${pkgs.join(' ')}\necho "Done! All packages installed."\n`;
    downloadFile(script, 'install.sh');
});

// ===== Copy =====
window.copyText = (text) => {
    navigator.clipboard.writeText(text).then(() => toast('Copied!', 'success'));
};

copyCmdBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(pipCmd.textContent).then(() => {
        toast('Command copied!', 'success');
        const i = copyCmdBtn.querySelector('i');
        i.className = 'ph ph-check'; i.style.color = 'var(--green)';
        setTimeout(() => { i.className = 'ph ph-copy'; i.style.color = ''; }, 2000);
    });
});

// ===== Modal Controls =====
function openModal(modal) { modal.classList.add('active'); }
function closeModal(modal) { modal.classList.remove('active'); }

openCartBtn.addEventListener('click', () => { updateModal(); openModal(cartModal); });
closeModalBtn.addEventListener('click', () => closeModal(cartModal));
cartModal.addEventListener('click', e => { if(e.target === cartModal) closeModal(cartModal); });

closeCompareModal.addEventListener('click', () => closeModal(compareModal));
compareModal.addEventListener('click', e => { if(e.target === compareModal) closeModal(compareModal); });

closeDepModal.addEventListener('click', () => closeModal(depModal));
depModal.addEventListener('click', e => { if(e.target === depModal) closeModal(depModal); });

closeVenvModal.addEventListener('click', () => closeModal(venvModal));
venvModal.addEventListener('click', e => { if(e.target === venvModal) closeModal(venvModal); });

clearCartBtn.addEventListener('click', () => {
    cart.clear(); updateCartIcon(); renderGrid(); updateModal(); saveCart();
    toast('Workspace cleared', 'info');
});

// ===== Form =====
fetchForm.addEventListener('submit', e => { e.preventDefault(); fetchPackage(pkgInput.value); });

// ===== Live Search Autocomplete =====
let searchTimeout;
pkgInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const q = e.target.value.toLowerCase().trim();
    if (!q) { searchAutocomplete.style.display = 'none'; return; }
    
    searchTimeout = setTimeout(() => {
        const matches = Array.from(packageDataMap.values())
            .filter(p => p.name.toLowerCase().includes(q))
            .slice(0, 6);
        
        if (matches.length > 0) {
            searchAutocomplete.innerHTML = matches.map(m => {
                // Highlight matching substring
                const idx = m.name.toLowerCase().indexOf(q);
                const before = m.name.substring(0, idx);
                const match = m.name.substring(idx, idx + q.length);
                const after = m.name.substring(idx + q.length);
                const catLabels = { 'data-science':'ML', 'vision':'CV', 'web':'WEB', 'devtools':'DEV' };
                const catLabel = catLabels[m.cat] || '';
                return `<div class="ac-item" onclick="selectAutocomplete('${m.name}')">
                    <i class="ph-duotone ph-package" style="color:var(--accent);font-size:1.1rem"></i>
                    <span class="ac-name">${before}<span class="ac-match">${match}</span>${after}</span>
                    <span class="ac-ver">v${m.latestVersion}</span>
                    ${catLabel ? `<span class="ac-cat">${catLabel}</span>` : ''}
                </div>`;
            }).join('');
            searchAutocomplete.style.display = 'block';
        } else {
            searchAutocomplete.innerHTML = '<div class="ac-empty"><i class="ph-duotone ph-magnifying-glass"></i> Press Fetch to search PyPI...</div>';
            searchAutocomplete.style.display = 'block';
        }
    }, 200);
});

window.selectAutocomplete = (name) => {
    pkgInput.value = name;
    searchAutocomplete.style.display = 'none';
    const cards = document.querySelectorAll('.package-card .card-title');
    for (let c of cards) {
        if (c.title === name) {
            c.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const card = c.closest('.package-card');
            card.style.boxShadow = '0 0 15px var(--accent)';
            setTimeout(() => card.style.boxShadow = '', 2000);
            return;
        }
    }
};

document.addEventListener('click', e => {
    if (!e.target.closest('.search-box')) searchAutocomplete.style.display = 'none';
});

// ===== Requirements.txt Import =====
uploadReqBtn.addEventListener('click', () => reqFileInput.click());

reqFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
        const lines = ev.target.result.split('\n');
        const reqs = [];
        lines.forEach(line => {
            line = line.trim().split('#')[0];
            if (!line || line.startsWith('--')) return;
            const match = line.match(/^([a-zA-Z0-9_\.-]+)(?:==(.+))?/);
            if (match) reqs.push({ name: match[1], ver: match[2] || 'latest' });
        });
        if (reqs.length === 0) return toast('No valid requirements found.', 'warn');
        toast(`Importing ${reqs.length} packages...`, 'info');
        let added = 0;
        gridContainer.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Importing packages from file...</p></div>';
        for (const r of reqs) {
            if (!packageDataMap.has(r.name)) await fetchPackage(r.name);
            if (packageDataMap.has(r.name)) {
                const availableVersions = packageDataMap.get(r.name).versions;
                const vToSet = (r.ver !== 'latest' && availableVersions.includes(r.ver)) ? r.ver : packageDataMap.get(r.name).latestVersion;
                cart.set(r.name, vToSet);
                added++;
            }
        }
        saveCart(); updateCartIcon(); renderGrid();
        toast(`Successfully imported ${added} packages!`, 'success');
        reqFileInput.value = '';
    };
    reader.readAsText(file);
});

// ===== Share Cart =====
shareBtn.addEventListener('click', () => {
    if (cart.size === 0) return toast('Cart is empty. Pin packages first!', 'warn');
    const items = Array.from(cart.entries()).map(([n,v]) => `${n}@${v}`).join(',');
    const url = new URL(window.location.href);
    url.searchParams.set('cart', items);
    navigator.clipboard.writeText(url.toString()).then(() => {
        toast('Share link copied to clipboard!', 'success');
    });
});

// ===== Boot =====
bootInfiniteScroll();
