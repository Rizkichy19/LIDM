function initVolume3D(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 400;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFDF8F0);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 6, 10);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.maxPolarAngle = Math.PI / 2;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(8, 12, 8);
    scene.add(dirLight);

    // Grid
    const grid = new THREE.GridHelper(12, 12, 0xD4A017, 0xe8dcc8);
    grid.position.y = -0.01;
    scene.add(grid);

    // Materials
    const cubeMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, transparent: true, opacity: 0.85 });
    const cubeEdgeMat = new THREE.LineBasicMaterial({ color: 0xD4A017 });
    const balokMat = new THREE.MeshStandardMaterial({ color: 0x2E7D32, transparent: true, opacity: 0.85 });
    const balokEdgeMat = new THREE.LineBasicMaterial({ color: 0x4CAF50 });

    // State
    let kubusSisi = 3;
    let balokP = 5, balokL = 3, balokT = 2;
    let kubusGroup, balokGroup;

    function createShape(w, h, d, material, edgeMaterial) {
        const group = new THREE.Group();
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, material);
        mesh.position.y = h / 2;
        group.add(mesh);

        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, edgeMaterial);
        line.position.y = h / 2;
        group.add(line);

        return group;
    }

    function addDimensionLabel(text, x, y, z, group) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 48;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.roundRect(0, 0, 128, 48, 6);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, 64, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
        sprite.position.set(x, y, z);
        sprite.scale.set(1.5, 0.6, 1);
        group.add(sprite);
    }

    function buildShapes() {
        if (kubusGroup) scene.remove(kubusGroup);
        if (balokGroup) scene.remove(balokGroup);

        // Kubus
        kubusGroup = createShape(kubusSisi, kubusSisi, kubusSisi, cubeMat, cubeEdgeMat);
        kubusGroup.position.x = -3.5;
        addDimensionLabel(`s=${kubusSisi}`, 0, kubusSisi + 0.8, 0, kubusGroup);
        addDimensionLabel(`V=${Math.round(kubusSisi ** 3)}`, 0, -0.5, 0, kubusGroup);
        scene.add(kubusGroup);

        // Balok
        balokGroup = createShape(balokP, balokT, balokL, balokMat, balokEdgeMat);
        balokGroup.position.x = 3.5;
        addDimensionLabel(`${balokP}×${balokL}×${balokT}`, 0, balokT + 0.8, 0, balokGroup);
        addDimensionLabel(`V=${Math.round(balokP * balokL * balokT)}`, 0, -0.5, 0, balokGroup);
        scene.add(balokGroup);
    }

    buildShapes();

    // Expose update function for sliders
    window.updateVolume3D = function(type, value) {
        value = parseFloat(value);
        if (type === 'kubus-s') kubusSisi = value;
        if (type === 'balok-p') balokP = value;
        if (type === 'balok-l') balokL = value;
        if (type === 'balok-t') balokT = value;
        buildShapes();

        // Update display values
        const volKubus = document.getElementById('vol-kubus');
        const volBalok = document.getElementById('vol-balok');
        if (volKubus) volKubus.textContent = Math.round(kubusSisi ** 3);
        if (volBalok) volBalok.textContent = Math.round(balokP * balokL * balokT);
    };

    // Animation
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Resize
    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight || 400;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
}

// Lazy init: wait until the container is actually visible (inside x-show tab)
function waitForVisible(id, callback) {
    const el = document.getElementById(id);
    if (!el) return;

    // If already visible, init immediately
    if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        callback(id);
        return;
    }

    // Otherwise observe for visibility
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.offsetWidth > 0) {
                observer.disconnect();
                callback(id);
            }
        });
    }, { threshold: 0.1 });
    observer.observe(el);

    // Also poll as fallback (x-show may not trigger IntersectionObserver reliably)
    const poll = setInterval(() => {
        if (el.offsetWidth > 0 && el.offsetHeight > 0) {
            clearInterval(poll);
            observer.disconnect();
            callback(id);
        }
    }, 300);
}

waitForVisible('volume-3d', initVolume3D);
