
// App State
let coffeeData = null;
let currentView = 'coffees';
let cart = [];

// Initialization
async function init() {
    try {
        const response = await fetch('data.json');
        coffeeData = await response.json();
        renderGrid('coffees');
        setupEventListeners();
        setupThreeJS();
        lucide.createIcons();
    } catch (error) {
        console.error('Failed to load coffee data:', error);
    }
}

// Render Content Grid
function renderGrid(view, filterText = '') {
    const grid = document.getElementById('content-grid');
    const heroTitle = document.querySelector('.hero h1');
    const heroDesc = document.querySelector('.hero p');

    grid.innerHTML = '';
    currentView = view;

    // Update Hero Text contextually
    const views = {
        coffees: { title: 'Coffee Library', desc: 'Browse our collection of 29 unique coffee origins.' },
        regions: { title: 'Global Origins', desc: 'Travel through the world\'s most prestigious coffee regions.' },
        varieties: { title: 'Plant Varieties', desc: 'Understand the genetics behind your favorite cultivars.' },
        products: { title: 'Coffee Shop', desc: 'Premium beans and equipment for the home barista.' },
        brewing_methods: { title: 'The Art of Brewing', desc: 'Master the techniques to unlock ultimate flavor profiles.' },
        roasters: { title: 'Master Roasters', desc: 'Discover the world\'s leading coffee brands and artisans.' },
        journal: { title: 'Tasting Journal', desc: 'Document your personal coffee journey and flavor notes.' },
        guide: { title: 'Coffee Guide', desc: 'The comprehensive encyclopedia of coffee knowledge.' },
        history: { title: 'Coffee History', desc: 'From ancient legends to the third-wave revolution.' },
        'world-map': { title: 'Interactive World Map', desc: 'Explore global coffee origins in immersive 3D.' }
    };

    if (views[view]) {
        heroTitle.textContent = views[view].title;
        heroDesc.textContent = views[view].desc;
    }

    if (view === 'guide' || view === 'history') {
        renderRichText(view);
        return;
    }

    if (view === 'journal') {
        renderJournal();
        return;
    }

    if (view === 'world-map') {
        renderWorldMap();
        return;
    }

    const items = coffeeData[view] || [];
    const filteredItems = items.filter(item => {
        const name = item.name || item.product_name || item.roaster_name || '';
        return name.toLowerCase().includes(filterText.toLowerCase());
    });

    filteredItems.forEach((item, index) => {
        const card = createCard(view, item);
        card.style.animationDelay = `${index * 0.05}s`;
        grid.appendChild(card);
    });
}

function createCard(view, item) {
    const card = document.createElement('div');
    card.className = 'card';

    let content = '';
    const name = item.name || item.product_name || item.roaster_name || 'Unknown';

    if (view === 'coffees') {
        content = `
            <div class="card-icon"><i data-lucide="coffee"></i></div>
            <div class="label">${item.origin_country || 'Origin'}</div>
            <h3>${name}</h3>
            <div class="stats">
                <span class="stat-item">${item.roast_level || 'Medium'}</span>
                <span class="stat-item">${item.cupping_score ? '★ ' + item.cupping_score : ''}</span>
            </div>
        `;
    } else if (view === 'regions') {
        content = `
            <div class="card-icon"><i data-lucide="map-pin"></i></div>
            <div class="label">${item.country}</div>
            <h3>${name}</h3>
            <div class="stats">
                <span class="stat-item">${item.elevation_min}-${item.elevation_max}m</span>
            </div>
        `;
    } else if (view === 'varieties') {
        content = `
            <div class="card-icon"><i data-lucide="sprout"></i></div>
            <div class="label">${item.species || 'Arabica'}</div>
            <h3>${name}</h3>
            <div class="stats">
                <span class="stat-item">Yield: ${item.yield || 'N/A'}</span>
            </div>
        `;
    } else if (view === 'brewing_methods') {
        content = `
            <div class="card-icon"><i data-lucide="droplet"></i></div>
            <div class="label">${item.category}</div>
            <h3>${name}</h3>
            <div class="stats">
                <span class="stat-item">${item.difficulty_level}</span>
            </div>
        `;
    } else if (view === 'roasters') {
        content = `
            <div class="card-icon"><i data-lucide="award"></i></div>
            <div class="label">${item.country_of_origin}</div>
            <h3>${name}</h3>
            <div class="stats">
                <span class="stat-item">${item.market_segment}</span>
            </div>
        `;
    } else if (view === 'products') {
        const price = item.price || 0;
        content = `
            <div class="card-icon"><i data-lucide="shopping-bag"></i></div>
            <div class="label">${item.coffee_type || 'Package'}</div>
            <h3>${name}</h3>
            <div class="stats" style="margin-top: 1rem; flex-direction: column; gap: 1rem;">
                <span class="stat-item" style="color:var(--accent); font-weight:bold; font-size:1.2rem">$${price}</span>
                <button class="auth-btn" style="padding: 0.6rem 1rem; width: 100%; border-radius: 8px; font-size: 0.8rem;" onclick="event.stopPropagation(); addToCart('${name}', ${price})">Add to Cart</button>
            </div>
        `;
    }

    card.innerHTML = content;
    card.addEventListener('click', () => showDetails(item, view));

    // Re-run lucide icons for dynamic content
    setTimeout(() => lucide.createIcons({ props: card }), 0);

    return card;
}

// Rich Text Rendering (Guide/History)
async function renderRichText(view) {
    const grid = document.getElementById('content-grid');
    grid.innerHTML = '<div class="rich-text-container" style="grid-column: 1/-1; padding: 2rem; background: var(--glass); border-radius: 20px; border: 1px solid var(--glass-border); max-width: 900px; margin: 0 auto;">Loading content...</div>';

    try {
        const fileName = view === 'guide' ? 'coffee_guide.md' : 'coffee_history.md';
        const response = await fetch(fileName);
        let text = await response.text();

        // Simple Markdown-ish to HTML conversion for premium look
        let html = text
            .replace(/^# (.*$)/gim, '<h1 style="font-size:3rem; margin-bottom:2rem; background:linear-gradient(to right, #fff, var(--accent)); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">$1</h1>')
            .replace(/^## (.*$)/gim, '<h2 style="color:var(--accent); margin:2rem 0 1rem; font-size:2rem;">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 style="color:white; margin:1.5rem 0 0.5rem; font-size:1.4rem;">$1</h3>')
            .replace(/\*\*(.*)\*\*/gim, '<strong style="color:var(--accent)">$1</strong>')
            .replace(/^---$/gim, '<hr style="border:0; border-top:1px solid var(--glass-border); margin:3rem 0;">')
            .replace(/!\[.*\]\(.*\)/g, '') // Hide images that might fail paths
            .replace(/\n/g, '<br>');

        grid.innerHTML = `<div class="rich-text-container" style="grid-column: 1/-1; padding: 4rem; background: var(--glass); border-radius: 30px; border: 1px solid var(--glass-border); max-width: 1000px; margin: 0 auto; line-height: 1.8; color: #d1d1d1; animation: fadeInUp 0.8s ease-out;">${html}</div>`;
    } catch (e) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem;">Content file not found. Ensure markdown files are in the expected directory.</div>';
    }
}

// Journal Rendering
function renderJournal() {
    const grid = document.getElementById('content-grid');
    const logs = JSON.parse(localStorage.getItem('coffee_logs') || '[]');

    grid.innerHTML = `
        <div style="grid-column: 1/-1; margin-bottom: 2rem; background: var(--glass); padding: 2.5rem; border-radius: 20px; border: 1px solid var(--glass-border);">
            <h3 style="margin-bottom:1.5rem">New Journal Entry</h3>
            <div style="display:grid; gap:1rem">
                <input type="text" id="j-name" placeholder="Coffee Name (e.g. Yirgacheffe)" style="background:rgba(255,255,255,0.05); border:1px solid var(--glass-border); padding:1rem; border-radius:10px; color:white;">
                <textarea id="j-notes" placeholder="Tasting Notes (Flavor, Aroma, Body...)" style="background:rgba(255,255,255,0.05); border:1px solid var(--glass-border); padding:1rem; border-radius:10px; color:white; height:100px;"></textarea>
                <button onclick="saveJournalEntry()" class="auth-btn" style="width:200px; margin-top:0;">Save Entry</button>
            </div>
        </div>
    `;

    logs.forEach((log, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-icon"><i data-lucide="book"></i></div>
            <div class="label">${log.date}</div>
            <h3>${log.name}</h3>
            <p style="font-size:0.9rem; color:var(--text-muted);">${log.notes}</p>
        `;
        grid.appendChild(card);
    });
    lucide.createIcons();
}

window.saveJournalEntry = function () {
    const name = document.getElementById('j-name').value;
    const notes = document.getElementById('j-notes').value;
    if (!name || !notes) return alert('Please fill both fields.');

    const logs = JSON.parse(localStorage.getItem('coffee_logs') || '[]');
    logs.unshift({ name, notes, date: new Date().toLocaleDateString() });
    localStorage.setItem('coffee_logs', JSON.stringify(logs));
    renderJournal();
};

// World Map Rendering (3D)
function renderWorldMap() {
    const grid = document.getElementById('content-grid');
    grid.innerHTML = `
        <div id="map-container" style="grid-column: 1/-1; height: 70vh; background: var(--glass); border-radius: 30px; border: 1px solid var(--glass-border); position: relative; overflow: hidden;">
            <div id="map-canvas-container" style="width: 100%; height: 100%;"></div>
            <div id="map-info" style="position: absolute; bottom: 2rem; left: 2rem; background: rgba(0,0,0,0.8); padding: 1.5rem; border-radius: 15px; border: 1px solid var(--accent); max-width: 300px; display: none; backdrop-filter: blur(10px); z-index: 10;">
                <h3 id="map-title" style="color: var(--accent); margin-bottom: 0.5rem;"></h3>
                <p id="map-desc" style="font-size: 0.9rem; line-height: 1.4; color: #fff;"></p>
            </div>
            <div style="position: absolute; top: 1rem; right: 1rem; color: var(--text-muted); font-size: 0.8rem; pointer-events: none;">Drag to rotate • Scroll to zoom</div>
        </div>
    `;

    const container = document.getElementById('map-canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Globe Group to rotate everything together
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Realistic Texture Loader
    const loader = new THREE.TextureLoader();
    const earthMap = loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
    const normalMap = loader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
    const specularMap = loader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
    const cloudsMap = loader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');

    // Globe Core (Realistic)
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const material = new THREE.MeshPhongMaterial({
        map: earthMap,
        normalMap: normalMap,
        normalScale: new THREE.Vector2(0.85, 0.85),
        specularMap: specularMap,
        specular: new THREE.Color('grey'),
        shininess: 10
    });
    const globe = new THREE.Mesh(geometry, material);
    globeGroup.add(globe);

    // Dynamic Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(5.1, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
        map: cloudsMap,
        transparent: true,
        opacity: 0.4
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    globeGroup.add(clouds);

    // Realistic Blue Atmosphere Glow
    const atmosGeo = new THREE.SphereGeometry(5.3, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        uniforms: {
            glowColor: { value: new THREE.Color(0x3366ff) },
            viewVector: { value: camera.position }
        },
        vertexShader: `
            uniform vec3 viewVector;
            varying float intensity;
            void main() {
                vec3 vNormal = normalize( normalMatrix * normal );
                vec3 vNormel = normalize( normalMatrix * viewVector );
                intensity = pow( 0.6 - dot(vNormal, vNormel), 6.0 );
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            uniform vec3 glowColor;
            varying float intensity;
            void main() {
                vec3 glow = glowColor * intensity;
                gl_FragColor = vec4( glow, intensity );
            }
        `
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosphere);

    // Sun Lighting
    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    sunLight.position.set(10, 10, 15);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x222222));

    camera.position.z = 15;

    // Convert Lat/Long to Vector3
    function latLongToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    // Add Markers
    const regions = coffeeData.regions || [];
    const markers = [];
    regions.forEach(region => {
        const pos = latLongToVector3(region.latitude, region.longitude, 5.05);
        const markerGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0xD4AF37 });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.position.copy(pos);
        marker.userData = region;
        globeGroup.add(marker);
        markers.push(marker);

        // Glow Ring
        const ringGeo = new THREE.RingGeometry(0.15, 0.2, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xD4AF37, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.lookAt(new THREE.Vector3(0, 0, 0));
        globeGroup.add(ring);
    });

    // Interaction
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    container.onmousedown = (e) => { isDragging = true; };
    window.onmouseup = () => { isDragging = false; };
    container.onmousemove = (e) => {
        const deltaX = e.clientX - previousMouseX;
        const deltaY = e.clientY - previousMouseY;

        if (isDragging) {
            globeGroup.rotation.y += deltaX * 0.01;
            globeGroup.rotation.x += deltaY * 0.01;
        }

        // Raycasting for info
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / container.clientWidth) * 2 - 1,
            -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markers);

        const info = document.getElementById('map-info');
        if (intersects.length > 0) {
            const data = intersects[0].object.userData;
            document.getElementById('map-title').textContent = data.name + ", " + data.country;
            document.getElementById('map-desc').textContent = data.description || "Leading coffee producing region.";
            info.style.display = 'block';
            container.style.cursor = 'pointer';
        } else {
            if (!isDragging) container.style.cursor = 'default';
        }

        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
    };

    // Animation loop
    function animate() {
        if (!document.getElementById('map-canvas-container')) return;
        requestAnimationFrame(animate);

        clouds.rotation.y += 0.0015; // Clouds move independently

        if (!isDragging) {
            globeGroup.rotation.y += 0.002;
        }
        renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Modal Logic
function showDetails(item, view) {
    const overlay = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');
    const name = item.name || item.product_name || item.roaster_name;

    let detailHtml = `<h2>${name}</h2>`;

    if (view === 'coffees') {
        detailHtml += `
            <div class="modal-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
                <div>
                   <p><strong>Origin:</strong> ${item.origin_country} (${item.origin_region})</p>
                   <p><strong>Variety:</strong> ${item.variety}</p>
                   <p><strong>Processing:</strong> ${item.processing_method}</p>
                   <p><strong>Roast:</strong> ${item.roast_level}</p>
                   <p><strong>Flavor Profile:</strong> ${item.flavor_profile}</p>
                   <p><strong>Acidity:</strong> ${item.acidity}</p>
                   <p><strong>Body:</strong> ${item.body}</p>
                </div>
                <div>
                   <p><strong>Tasting Notes:</strong> ${item.tasting_notes}</p>
                   <p><strong>History:</strong> ${item.history}</p>
                   <p><strong>Price Range:</strong> ${item.price_range}</p>
                   <p><strong>Cupping Score:</strong> ${item.cupping_score}/100</p>
                </div>
            </div>
        `;
    } else {
        // Generic fallback for other views
        detailHtml += '<div style="margin-top:2rem">';
        for (let [key, value] of Object.entries(item)) {
            if (key !== 'id' && value) {
                const label = key.replace(/_/g, ' ').toUpperCase();
                detailHtml += `<p style="margin-bottom:0.5rem"><strong>${label}:</strong> ${value}</p>`;
            }
        }
        detailHtml += '</div>';
    }

    body.innerHTML = detailHtml;
    overlay.style.display = 'flex';
}

// Cart Logic
window.addToCart = function (name, price) {
    cart.push({ name, price });
    updateCartIcon();

    // Animation feedback
    const cartBtn = document.getElementById('open-cart');
    gsap.to(cartBtn, { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 });
};

function updateCartIcon() {
    document.getElementById('cart-count').textContent = cart.length;
}

function renderCart() {
    const list = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total');
    list.innerHTML = '';

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement('div');
        div.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 0.8rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--glass-border);";
        div.innerHTML = `
            <div>
                <div style="font-weight: 600;">${item.name}</div>
                <div style="font-size: 0.8rem; color: var(--accent);">$${item.price}</div>
            </div>
            <button onclick="removeFromCart(${index})" style="background: none; border: none; color: #ff5252; cursor: pointer;"><i data-lucide="trash-2"></i></button>
        `;
        list.appendChild(div);
    });

    totalEl.textContent = `$${total.toFixed(2)}`;
    lucide.createIcons();
}

window.removeFromCart = function (index) {
    cart.splice(index, 1);
    updateCartIcon();
    renderCart();
};

// Event Listeners
function setupEventListeners() {
    // Cart Modals
    const openCart = document.getElementById('open-cart');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckout = document.getElementById('close-checkout');
    const btnPay = document.getElementById('btn-pay');

    openCart.onclick = () => {
        if (cart.length === 0) return alert('Your cart is empty!');
        renderCart();
        checkoutModal.style.display = 'flex';
    };

    closeCheckout.onclick = () => {
        checkoutModal.style.display = 'none';
    };

    btnPay.onclick = () => {
        if (cart.length === 0) return;
        btnPay.textContent = "Processing...";
        btnPay.disabled = true;

        setTimeout(() => {
            alert('Payment Successful! Thank you for your purchase.');
            cart = [];
            updateCartIcon();
            checkoutModal.style.display = 'none';
            btnPay.textContent = "Pay Now";
            btnPay.disabled = false;
        }, 2000);
    };

    // Auth Logic
    const authScreen = document.getElementById('auth-screen');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    const btnLogin = document.getElementById('btn-login');
    const btnSignup = document.getElementById('btn-signup');

    switchToSignup.onclick = () => {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    };

    switchToLogin.onclick = () => {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    };

    const handleAuth = () => {
        gsap.to(authScreen, {
            opacity: 0,
            y: -50,
            duration: 0.8,
            ease: "power3.inOut",
            onComplete: () => authScreen.classList.add('hidden')
        });
    };

    btnLogin.onclick = handleAuth;
    btnSignup.onclick = handleAuth;

    // Logout Logic
    document.getElementById('nav-logout').onclick = () => {
        gsap.to(authScreen, {
            display: 'flex',
            opacity: 1,
            y: 0,
            duration: 0.5,
            onStart: () => authScreen.classList.remove('hidden')
        });
    };

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            renderGrid(item.dataset.view);
        });
    });

    // Search
    document.getElementById('global-search').addEventListener('input', (e) => {
        renderGrid(currentView, e.target.value);
    });

    // Modal Close
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('modal-overlay').style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-overlay')) {
            document.getElementById('modal-overlay').style.display = 'none';
        }
    });
}

// 3D Background & Models with Three.js
function setupThreeJS() {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --- PRO PROCEDURAL COFFEE BEAN ---
    const beanGroup = new THREE.Group();

    // Half 1
    const half1Geom = new THREE.SphereGeometry(1, 32, 32);
    half1Geom.scale(0.8, 1.2, 0.6);
    const beanMat = new THREE.MeshPhongMaterial({
        color: 0x3d2b1f,
        shininess: 10,
        flatShading: false
    });
    const half1 = new THREE.Mesh(half1Geom, beanMat);
    half1.position.x = -0.05;

    // Half 2
    const half2 = half1.clone();
    half2.position.x = 0.05;

    // The "Crack" (Coffee bean groove)
    const grooveGeom = new THREE.BoxGeometry(0.1, 2.5, 0.5);
    const grooveMat = new THREE.MeshPhongMaterial({ color: 0x1a110a });
    const groove = new THREE.Mesh(grooveGeom, grooveMat);

    beanGroup.add(half1);
    beanGroup.add(half2);
    beanGroup.add(groove);

    // Position the bean in the hero area (right side)
    beanGroup.position.set(5, 0, -2);
    beanGroup.scale.set(1.5, 1.5, 1.5);
    scene.add(beanGroup);

    // Decorative floating geometry
    const geometry = new THREE.IcosahedronGeometry(2, 0);
    const material = new THREE.MeshPhongMaterial({
        color: 0x4E342E,
        wireframe: true,
        transparent: true,
        opacity: 0.05
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Ambient particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.008,
        color: 0xFFB74D,
        transparent: true,
        opacity: 0.3
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Lights
    const mainLight = new THREE.PointLight(0xffffff, 1);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xffb74d, 0.5);
    fillLight.position.set(-10, -10, 10);
    scene.add(fillLight);

    scene.add(new THREE.AmbientLight(0x404040, 0.5));

    camera.position.z = 8;

    // Responsive position logic
    function updateHeroPosition() {
        const width = window.innerWidth;
        if (width < 1024) {
            beanGroup.position.set(0, -3, -5); // Move under text on mobileish
        } else {
            beanGroup.position.set(width / 300, 0, -2); // Stay on right
        }
    }

    // Animation Loop
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) / 100;
        mouseY = (e.clientY - window.innerHeight / 2) / 100;
    });

    function animate() {
        requestAnimationFrame(animate);

        // Bean rotation
        beanGroup.rotation.y += 0.01;
        beanGroup.rotation.z += 0.005;

        // Smooth parallax based on mouse
        beanGroup.position.x += (mouseX - beanGroup.position.x) * 0.01 + 0.05; // Offset to keep it right
        beanGroup.position.y += (-mouseY - beanGroup.position.y) * 0.01;

        mesh.rotation.y -= 0.001;
        particlesMesh.rotation.y += 0.0002;

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateHeroPosition();
    });

    updateHeroPosition();
    animate();
}

// Start App
init();
