function initBenteng3D(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 400;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFDF8F0);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 8;
    controls.maxDistance = 30;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xD4A017, 0.4, 30);
    pointLight.position.set(-5, 8, 5);
    scene.add(pointLight);

    // Materials
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
    const wallEdgeMaterial = new THREE.LineBasicMaterial({ color: 0xD4A017, linewidth: 2 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x5C2E00, roughness: 0.7 });
    const guardMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D, roughness: 0.7 });
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x5C8A3A, roughness: 0.9 });

    // Helper: add box with edges
    function addBox(w, h, d, x, y, z, material) {
        const geometry = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, wallEdgeMaterial);
        line.position.copy(mesh.position);
        scene.add(line);

        return mesh;
    }

    // Ground
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const ground = new THREE.Mesh(groundGeo, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // === Benteng Fort Willem I (simplified) ===

    // Main building - Balok (rectangular prism) - "Barak Utama"
    addBox(8, 3, 4, 0, 1.5, 0, wallMaterial);

    // Roof of main building
    addBox(8.4, 0.3, 4.4, 0, 3.15, 0, roofMaterial);

    // Left wing - Balok - "Gudang Senjata"
    addBox(3, 2.5, 3, -5.5, 1.25, 0.5, wallMaterial);
    addBox(3.3, 0.3, 3.3, -5.5, 2.65, 0.5, roofMaterial);

    // Right wing - Balok - "Ruang Tahanan"
    addBox(3, 2.5, 3, 5.5, 1.25, 0.5, wallMaterial);
    addBox(3.3, 0.3, 3.3, 5.5, 2.65, 0.5, roofMaterial);

    // Guard post 1 - Kubus - "Pos Jaga Kiri"
    addBox(1.8, 1.8, 1.8, -7.5, 0.9, -3.5, guardMaterial);
    addBox(2, 0.2, 2, -7.5, 1.9, -3.5, roofMaterial);

    // Guard post 2 - Kubus - "Pos Jaga Kanan"
    addBox(1.8, 1.8, 1.8, 7.5, 0.9, -3.5, guardMaterial);
    addBox(2, 0.2, 2, 7.5, 1.9, -3.5, roofMaterial);

    // Front wall - Balok tipis - "Dinding Depan"
    addBox(18, 2, 0.4, 0, 1, -4.5, wallMaterial);

    // Gate opening (overwrite with darker material)
    const gateMaterial = new THREE.MeshStandardMaterial({ color: 0x2C1810 });
    addBox(2.5, 1.8, 0.5, 0, 0.9, -4.5, gateMaterial);

    // Back wall
    addBox(12, 2.5, 0.4, 0, 1.25, 4, wallMaterial);

    // Watchtower - tall Balok - "Menara Pengawas"
    addBox(1.5, 4, 1.5, 0, 2, 4.5, guardMaterial);
    addBox(1.8, 0.2, 1.8, 0, 4.1, 4.5, roofMaterial);

    // Labels
    function addLabel(text, x, y, z) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(44, 24, 16, 0.85)';
        ctx.roundRect(0, 0, 256, 64, 8);
        ctx.fill();
        ctx.fillStyle = '#D4A017';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, 128, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(x, y, z);
        sprite.scale.set(3, 0.75, 1);
        scene.add(sprite);
    }

    addLabel('Barak Utama (Balok)', 0, 4.5, 0);
    addLabel('Gudang (Balok)', -5.5, 4, 0.5);
    addLabel('Pos Jaga (Kubus)', -7.5, 3, -3.5);
    addLabel('Menara (Balok)', 0, 5.5, 4.5);

    // Animation
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight || 400;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
}

const btn_el = document.getElementById('benteng-3d');
if (btn_el) initBenteng3D('benteng-3d');
