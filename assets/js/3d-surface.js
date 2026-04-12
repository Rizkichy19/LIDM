function initSurface3D(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFDF8F0);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 6, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.maxPolarAngle = Math.PI / 2;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(8, 12, 8);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(12, 12, 0xD4A017, 0xe8dcc8);
    grid.position.y = -0.01;
    scene.add(grid);

    // Face colors for surface area visualization
    const faceColors = [
        0xE53935, // right - red
        0xE53935, // left - red
        0x1E88E5, // top - blue
        0x1E88E5, // bottom - blue
        0x43A047, // front - green
        0x43A047, // back - green
    ];

    let isUnfolded = false;
    let shapeGroup = new THREE.Group();
    let netGroup = new THREE.Group();
    netGroup.visible = false;
    scene.add(shapeGroup);
    scene.add(netGroup);

    const s = 2.5; // cube side length

    function buildCube3D() {
        shapeGroup.clear();

        // Create cube with colored faces
        const geo = new THREE.BoxGeometry(s, s, s);
        const materials = faceColors.map(c =>
            new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: 0.85 })
        );
        const mesh = new THREE.Mesh(geo, materials);
        mesh.position.set(-3.5, s / 2, 0);
        shapeGroup.add(mesh);

        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x333333 }));
        line.position.copy(mesh.position);
        shapeGroup.add(line);

        // Label
        addLabel(`Kubus s=${s}`, -3.5, s + 1, 0, shapeGroup);
        addLabel(`LP = 6×${s}² = ${6 * s * s}`, -3.5, -0.8, 0, shapeGroup);
    }

    function buildBalok3D() {
        const p = 4, l = 2.5, t = 2;
        const geo = new THREE.BoxGeometry(p, t, l);
        const materials = faceColors.map(c =>
            new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: 0.85 })
        );
        const mesh = new THREE.Mesh(geo, materials);
        mesh.position.set(3.5, t / 2, 0);
        shapeGroup.add(mesh);

        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x333333 }));
        line.position.copy(mesh.position);
        shapeGroup.add(line);

        const lp = 2 * (p * l + p * t + l * t);
        addLabel(`Balok ${p}×${l}×${t}`, 3.5, t + 1, 0, shapeGroup);
        addLabel(`LP = ${lp}`, 3.5, -0.8, 0, shapeGroup);
    }

    function buildCubeNet() {
        netGroup.clear();

        // Cube net: cross shape (+)
        // Layout:   [top]
        //    [left] [front] [right] [back]
        //           [bottom]
        const faceGeo = new THREE.PlaneGeometry(s, s);

        const positions = [
            { x: 0, y: 0, color: 0x43A047, label: 'Depan' },         // front (center)
            { x: s, y: 0, color: 0xE53935, label: 'Kanan' },         // right
            { x: -s, y: 0, color: 0xE53935, label: 'Kiri' },         // left
            { x: 2*s, y: 0, color: 0x43A047, label: 'Belakang' },    // back
            { x: 0, y: s, color: 0x1E88E5, label: 'Atas' },          // top
            { x: 0, y: -s, color: 0x1E88E5, label: 'Bawah' },       // bottom
        ];

        positions.forEach(p => {
            const mat = new THREE.MeshStandardMaterial({
                color: p.color,
                transparent: true,
                opacity: 0.85,
                side: THREE.DoubleSide
            });
            const plane = new THREE.Mesh(faceGeo, mat);
            plane.position.set(p.x - 3.5, p.y + s, 0.01);
            plane.rotation.x = -Math.PI / 2 + 0.01; // slight tilt for visibility
            plane.position.y = 0.05;
            plane.position.z = p.y;
            plane.position.x = p.x - 3.5;
            netGroup.add(plane);

            // Edge
            const edgeGeo = new THREE.EdgesGeometry(faceGeo);
            const edge = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: 0x333333 }));
            edge.position.copy(plane.position);
            edge.rotation.copy(plane.rotation);
            netGroup.add(edge);
        });

        addLabel(`Jaring-jaring Kubus`, -3.5, 0.5, s + 1.5, netGroup);
        addLabel(`6 sisi × ${s}² = LP ${6*s*s}`, -3.5, 0.5, -s - 1.5, netGroup);

        // Balok net
        const bP = 4, bL = 2.5, bT = 2;
        const balokFaces = [
            { w: bP, h: bL, x: 0, y: 0, color: 0x43A047, label: 'Alas' },
            { w: bP, h: bT, x: 0, y: bL/2 + bT/2, color: 0x1E88E5, label: 'Depan' },
            { w: bP, h: bT, x: 0, y: -(bL/2 + bT/2), color: 0x1E88E5, label: 'Belakang' },
            { w: bL, h: bT, x: bP/2 + bL/2, y: 0, color: 0xE53935, label: 'Kanan' },
            { w: bL, h: bT, x: -(bP/2 + bL/2), y: 0, color: 0xE53935, label: 'Kiri' },
            { w: bP, h: bL, x: 0, y: bL/2 + bT + bL/2, color: 0x43A047, label: 'Atas' },
        ];

        balokFaces.forEach(f => {
            const geo2 = new THREE.PlaneGeometry(f.w, f.h);
            const mat2 = new THREE.MeshStandardMaterial({
                color: f.color,
                transparent: true,
                opacity: 0.85,
                side: THREE.DoubleSide
            });
            const plane2 = new THREE.Mesh(geo2, mat2);
            plane2.rotation.x = -Math.PI / 2;
            plane2.position.set(f.x + 3.5, 0.05, f.y);
            netGroup.add(plane2);

            const edgeGeo2 = new THREE.EdgesGeometry(geo2);
            const edge2 = new THREE.LineSegments(edgeGeo2, new THREE.LineBasicMaterial({ color: 0x333333 }));
            edge2.position.copy(plane2.position);
            edge2.rotation.copy(plane2.rotation);
            netGroup.add(edge2);
        });

        const lpBalok = 2*(bP*bL + bP*bT + bL*bT);
        addLabel(`Jaring-jaring Balok`, 3.5, 0.5, bL/2 + bT + bL + 1, netGroup);
        addLabel(`LP = ${lpBalok}`, 3.5, 0.5, -(bL/2 + bT + 1), netGroup);
    }

    function addLabel(text, x, y, z, group) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 56;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(44, 24, 16, 0.85)';
        ctx.roundRect(0, 0, 256, 56, 8);
        ctx.fill();
        ctx.fillStyle = '#D4A017';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, 128, 36);

        const texture = new THREE.CanvasTexture(canvas);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
        sprite.position.set(x, y, z);
        sprite.scale.set(2.8, 0.6, 1);
        group.add(sprite);
    }

    buildCube3D();
    buildBalok3D();
    buildCubeNet();

    // Toggle function
    window.toggleSurfaceView = function() {
        isUnfolded = !isUnfolded;
        shapeGroup.visible = !isUnfolded;
        netGroup.visible = isUnfolded;

        const btn = document.getElementById('toggle-net-btn');
        if (btn) {
            btn.textContent = isUnfolded ? '🧊 Tampilkan Bentuk 3D' : '📐 Buka Jaring-jaring';
        }

        // Adjust camera for net view
        if (isUnfolded) {
            camera.position.set(0, 15, 0.1);
            controls.autoRotate = false;
        } else {
            camera.position.set(8, 6, 10);
            controls.autoRotate = true;
        }
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

    if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        callback(id);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.offsetWidth > 0) {
                observer.disconnect();
                callback(id);
            }
        });
    }, { threshold: 0.1 });
    observer.observe(el);

    const poll = setInterval(() => {
        if (el.offsetWidth > 0 && el.offsetHeight > 0) {
            clearInterval(poll);
            observer.disconnect();
            callback(id);
        }
    }, 300);
}

waitForVisible('surface-3d', initSurface3D);
