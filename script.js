(() => {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const bocadoClub = (root.BocadoClub = root.BocadoClub || {});
  const CART_STORAGE_KEY = 'bocado-club-cart';

  const products = [
    { id: 'classic-smash', name: 'La Clásica', category: 'smash', price: 8.90, description: 'Doble smash, cheddar, pepinillos y salsa de la casa.', tag: 'La favorita', extras: ['extra-cheddar', 'bacon', 'salsa-picante'] },
    { id: 'bacon-crush', name: 'Bacon Crush', category: 'smash', price: 10.50, description: 'Doble smash, cheddar, bacon crocante y cebolla dulce.', tag: 'Más pedida', extras: ['extra-cheddar', 'bacon', 'cebolla-dulce'] },
    { id: 'green-room', name: 'Green Room', category: 'smash', price: 9.80, description: 'Smash, queso, lechuga fresca, pepinillos y alioli verde.', tag: 'Fresca', extras: ['extra-cheddar', 'aguacate', 'salsa-verde'] },
    { id: 'club-combo', name: 'Club Combo', category: 'combos', price: 14.90, description: 'La Clásica, papas doradas y bebida fría.', tag: 'Combo completo', extras: ['extra-cheddar', 'bacon'] },
    { id: 'bacon-combo', name: 'Bacon Combo', category: 'combos', price: 16.50, description: 'Bacon Crush, papas doradas y limonada.', tag: 'Para compartir', extras: ['extra-cheddar', 'bacon'] },
    { id: 'golden-fries', name: 'Golden Fries', category: 'sides', price: 4.50, description: 'Papas crujientes con sal de la casa.', tag: 'Crujientes', extras: ['queso-fundido', 'salsa-especial'] },
    { id: 'loaded-fries', name: 'Loaded Fries', category: 'sides', price: 6.90, description: 'Papas, queso fundido, bacon y cebolla dulce.', tag: 'Para mojar', extras: ['bacon', 'salsa-especial'] },
    { id: 'house-lemonade', name: 'Limonada Club', category: 'drinks', price: 3.50, description: 'Limonada fresca con hierbabuena y hielo.', tag: 'Refrescante', extras: ['extra-hielo', 'hierbabuena'] }
  ];

  const extraOptions = {
    'extra-cheddar': { label: 'Extra cheddar', price: 1.20 },
    bacon: { label: 'Bacon', price: 1.50 },
    'salsa-picante': { label: 'Salsa picante', price: 0.50 },
    'cebolla-dulce': { label: 'Cebolla dulce', price: 0.60 },
    aguacate: { label: 'Aguacate', price: 1.40 },
    'salsa-verde': { label: 'Salsa verde', price: 0.50 },
    'queso-fundido': { label: 'Queso fundido', price: 1.00 },
    'salsa-especial': { label: 'Salsa especial', price: 0.50 },
    'extra-hielo': { label: 'Extra hielo', price: 0 },
    hierbabuena: { label: 'Hierbabuena', price: 0.30 }
  };

  const categoryLabels = {
    all: 'Todo',
    smash: 'Smash',
    combos: 'Combos',
    sides: 'Acompañamientos',
    drinks: 'Bebidas'
  };

  const FOCUSABLE_SELECTOR = [
    'a[href]',
    'area[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[contenteditable="true"]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  const currencyFormatter = new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'USD'
  });

  let cart = loadCart();
  let activeProductId = null;
  let productDialogTrigger = null;
  let cartTrigger = null;
  let checkoutDialogTrigger = null;
  let toastTimer = null;
  let heroSceneState = null;

  function getDocument() {
    return root.document || (typeof document !== 'undefined' ? document : null);
  }

  function getElement(id) {
    const documentRef = getDocument();
    return documentRef ? documentRef.getElementById(id) : null;
  }

  function updateHeroStatus(message, mode = 'fallback') {
    const heroStatus = getElement('hero-status');
    const documentRef = getDocument();
    if (!heroStatus) {
      return;
    }

    heroStatus.dataset.heroMode = mode;
    if (!documentRef) {
      heroStatus.textContent = message;
      return;
    }

    const statusDot = documentRef.createElement('span');
    statusDot.className = 'status-dot';
    statusDot.setAttribute('aria-hidden', 'true');
    heroStatus.replaceChildren(statusDot, documentRef.createTextNode(' ' + message));
  }

  function createHeroToonMaterial(THREE, color) {
    const Material = THREE.MeshToonMaterial || THREE.MeshLambertMaterial || THREE.MeshBasicMaterial;
    return new Material({ color });
  }

  function createHeroStandardMaterial(THREE, color, roughness = 0.58) {
    const Material = THREE.MeshStandardMaterial || THREE.MeshLambertMaterial || THREE.MeshBasicMaterial;
    return new Material({ color, roughness, metalness: 0.02 });
  }

  function createWaiter() {
    const THREE = root.THREE;
    if (!THREE) {
      return null;
    }

    const waiter = new THREE.Group();
    waiter.name = 'bocado-waiter';

    const skin = createHeroToonMaterial(THREE, 0xf1b58a);
    const skinShadow = createHeroToonMaterial(THREE, 0xd98762);
    const shirt = createHeroToonMaterial(THREE, 0xfff1d5);
    const apron = createHeroToonMaterial(THREE, 0x7a3f2c);
    const hat = createHeroToonMaterial(THREE, 0xfff8e7);
    const tomato = createHeroToonMaterial(THREE, 0xe94c3d);
    const dark = createHeroToonMaterial(THREE, 0x30231f);
    const shoe = createHeroToonMaterial(THREE, 0x4a2923);
    const trayMaterial = createHeroToonMaterial(THREE, 0xe9b65c);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.58, 1.15, 24), shirt);
    torso.name = 'waiter-torso';
    torso.position.set(0, 0.95, 0);
    torso.scale.z = 0.8;
    waiter.add(torso);

    const apronPanel = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.9, 0.1), apron);
    apronPanel.name = 'waiter-apron';
    apronPanel.position.set(0, 0.87, 0.43);
    waiter.add(apronPanel);

    const neckerchief = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.18, 3), tomato);
    neckerchief.name = 'waiter-neckerchief';
    neckerchief.position.set(0, 1.47, 0.43);
    neckerchief.rotation.x = Math.PI;
    waiter.add(neckerchief);

    const legMaterial = createHeroToonMaterial(THREE, 0x3e3432);
    [-0.22, 0.22].forEach((x, index) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.8, 14), legMaterial);
      leg.name = 'waiter-leg-' + (index + 1);
      leg.position.set(x, 0.22, 0);
      waiter.add(leg);

      const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.58), shoe);
      shoeMesh.name = 'waiter-shoe-' + (index + 1);
      shoeMesh.position.set(x + (index === 0 ? -0.03 : 0.03), -0.22, 0.12);
      shoeMesh.rotation.y = index === 0 ? -0.08 : 0.08;
      waiter.add(shoeMesh);
    });

    const head = new THREE.Group();
    head.name = 'waiter-head';
    head.position.set(0, 1.95, 0.02);

    const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.47, 20, 14), dark);
    hairBack.name = 'waiter-hair';
    hairBack.position.set(0, 0.03, -0.06);
    hairBack.scale.set(1, 0.9, 0.82);
    head.add(hairBack);

    const face = new THREE.Mesh(new THREE.SphereGeometry(0.43, 24, 16), skin);
    face.name = 'waiter-face';
    face.scale.set(0.9, 1, 0.78);
    face.position.z = 0.03;
    head.add(face);

    const earLeft = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), skinShadow);
    earLeft.position.set(-0.39, 0, 0.03);
    head.add(earLeft);

    const earRight = earLeft.clone();
    earRight.position.x = 0.39;
    head.add(earRight);

    const eyes = new THREE.Group();
    eyes.name = 'waiter-eyes';
    eyes.position.set(0, 0.04, 0.36);
    [-0.16, 0.16].forEach((x) => {
      const eye = new THREE.Group();
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 8), hat);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), dark);
      pupil.position.z = 0.075;
      eye.add(white, pupil);
      eye.position.x = x;
      eyes.add(eye);
    });
    head.add(eyes);

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), skinShadow);
    nose.name = 'waiter-nose';
    nose.position.set(0, -0.04, 0.42);
    nose.scale.set(0.82, 0.72, 0.76);
    head.add(nose);

    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.022, 6, 16, Math.PI), dark);
    smile.name = 'waiter-smile';
    smile.position.set(0, -0.16, 0.38);
    smile.rotation.z = Math.PI;
    head.add(smile);

    const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.51, 0.51, 0.1, 24), tomato);
    hatBand.name = 'waiter-hat-band';
    hatBand.position.y = 0.45;
    head.add(hatBand);

    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.56, 0.1, 24), hat);
    hatBrim.name = 'waiter-hat-brim';
    hatBrim.position.y = 0.51;
    head.add(hatBrim);

    const hatCrown = new THREE.Mesh(new THREE.SphereGeometry(0.46, 20, 12), hat);
    hatCrown.name = 'waiter-hat-crown';
    hatCrown.position.y = 0.63;
    hatCrown.scale.set(1, 0.42, 0.82);
    head.add(hatCrown);

    waiter.add(head);

    function createArm(name, x, rotationZ) {
      const arm = new THREE.Group();
      arm.name = name;
      arm.position.set(x, 1.48, 0.02);
      arm.rotation.z = rotationZ;

      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.72, 14), shirt);
      sleeve.name = name + '-sleeve';
      sleeve.position.y = -0.33;
      arm.add(sleeve);

      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 14), tomato);
      cuff.name = name + '-cuff';
      cuff.position.y = -0.72;
      arm.add(cuff);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 10), skin);
      hand.name = name + '-hand';
      hand.position.y = -0.84;
      hand.scale.set(0.9, 1.08, 0.9);
      arm.add(hand);

      return arm;
    }

    const armLeft = createArm('armLeft', -0.5, -0.46);
    const armRight = createArm('armRight', 0.5, 1.05);
    waiter.add(armLeft, armRight);

    const tray = new THREE.Group();
    tray.name = 'serving-tray';
    tray.position.set(0, -0.96, 0.04);
    tray.rotation.z = -armRight.rotation.z;
    tray.userData.baseRotationZ = tray.rotation.z;

    const trayPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.75, 0.08, 40), trayMaterial);
    trayPlate.name = 'serving-tray-plate';
    trayPlate.scale.z = 0.58;
    tray.add(trayPlate);

    const trayRim = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.04, 8, 32), trayMaterial);
    trayRim.name = 'serving-tray-rim';
    trayRim.rotation.x = Math.PI / 2;
    trayRim.scale.z = 0.58;
    trayRim.position.y = 0.05;
    tray.add(trayRim);
    armRight.add(tray);

    waiter.userData = { head, armLeft, armRight, eyes, tray };
    return waiter;
  }

  function createBurgerCheese(THREE, material, name) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.98, -0.58);
    shape.lineTo(0.98, -0.56);
    shape.lineTo(0.84, -0.39);
    shape.lineTo(0.62, -0.48);
    shape.lineTo(0.43, -0.78);
    shape.lineTo(0.18, -0.49);
    shape.lineTo(-0.08, -0.58);
    shape.lineTo(-0.33, -0.82);
    shape.lineTo(-0.55, -0.48);
    shape.lineTo(-0.83, -0.5);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.03,
      bevelThickness: 0.025
    });
    geometry.rotateX(-Math.PI / 2);

    const cheese = new THREE.Mesh(geometry, material);
    cheese.name = name;
    cheese.scale.set(0.98, 1, 0.78);
    return cheese;
  }

  function createBurger() {
    const THREE = root.THREE;
    if (!THREE) {
      return null;
    }

    const burger = new THREE.Group();
    burger.name = 'layered-smash-burger';

    const bun = createHeroStandardMaterial(THREE, 0xd8793f, 0.62);
    const bunLight = createHeroStandardMaterial(THREE, 0xf4b865, 0.5);
    const patty = createHeroStandardMaterial(THREE, 0x44221d, 0.88);
    const pattyEdge = createHeroStandardMaterial(THREE, 0x6f3425, 0.82);
    const cheese = createHeroStandardMaterial(THREE, 0xf4c63f, 0.4);
    const lettuce = createHeroStandardMaterial(THREE, 0x4f9563, 0.7);
    const pickle = createHeroStandardMaterial(THREE, 0xb7c84d, 0.5);
    const sesame = createHeroStandardMaterial(THREE, 0xffe7a0, 0.45);

    const bottomBun = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 1.03, 0.26, 36), bun);
    bottomBun.name = 'burger-bottom-bun';
    bottomBun.position.y = 0.15;
    burger.add(bottomBun);

    const bottomBunHighlight = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.93, 0.08, 36), bunLight);
    bottomBunHighlight.name = 'burger-bottom-bun-highlight';
    bottomBunHighlight.position.set(0, 0.3, 0);
    burger.add(bottomBunHighlight);

    function createLettuceRing(y, rotationY = 0) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.89, 0.12, 8, 36), lettuce);
      ring.name = 'burger-lettuce';
      ring.rotation.x = Math.PI / 2;
      ring.rotation.y = rotationY;
      ring.scale.z = 0.9;
      ring.position.y = y;
      return ring;
    }

    burger.add(createLettuceRing(0.36, 0.08));

    const pattyBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.94, 1, 0.28, 24), patty);
    pattyBottom.name = 'burger-patty-bottom';
    pattyBottom.position.set(0, 0.52, 0);
    pattyBottom.rotation.y = 0.04;
    burger.add(pattyBottom);

    const pattyBottomEdge = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.09, 8, 28), pattyEdge);
    pattyBottomEdge.name = 'burger-patty-bottom-edge';
    pattyBottomEdge.rotation.x = Math.PI / 2;
    pattyBottomEdge.scale.z = 0.91;
    pattyBottomEdge.position.y = 0.63;
    burger.add(pattyBottomEdge);

    const cheeseBottom = createBurgerCheese(THREE, cheese, 'burger-cheese-bottom');
    cheeseBottom.position.y = 0.69;
    cheeseBottom.rotation.y = -0.04;
    burger.add(cheeseBottom);

    const pattyTop = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.01, 0.3, 24), patty);
    pattyTop.name = 'burger-patty-top';
    pattyTop.position.set(0, 0.83, 0);
    pattyTop.rotation.y = -0.05;
    burger.add(pattyTop);

    const pattyTopEdge = new THREE.Mesh(new THREE.TorusGeometry(0.91, 0.09, 8, 28), pattyEdge);
    pattyTopEdge.name = 'burger-patty-top-edge';
    pattyTopEdge.rotation.x = Math.PI / 2;
    pattyTopEdge.scale.z = 0.91;
    pattyTopEdge.position.y = 0.94;
    burger.add(pattyTopEdge);

    const cheeseTop = createBurgerCheese(THREE, cheese, 'burger-cheese-top');
    cheeseTop.position.y = 1;
    cheeseTop.rotation.y = 0.05;
    burger.add(cheeseTop);

    burger.add(createLettuceRing(1.1, -0.06));

    const picklePositions = [
      [-0.52, 1.14, 0.18],
      [-0.12, 1.17, 0.42],
      [0.32, 1.15, 0.2],
      [0.58, 1.14, -0.1]
    ];
    picklePositions.forEach(([x, y, z], index) => {
      const pickleSlice = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 8), pickle);
      pickleSlice.name = 'burger-pickle-' + (index + 1);
      pickleSlice.position.set(x, y, z);
      pickleSlice.scale.set(1, 0.16, 0.76);
      burger.add(pickleSlice);
    });

    const topBunBase = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 1.02, 0.22, 36), bun);
    topBunBase.name = 'burger-top-bun-base';
    topBunBase.position.y = 1.22;
    burger.add(topBunBase);

    const topBun = new THREE.Mesh(new THREE.SphereGeometry(1.04, 32, 18, 0, Math.PI * 2, 0, Math.PI / 2), bunLight);
    topBun.name = 'burger-top-bun';
    topBun.position.y = 1.25;
    topBun.scale.y = 0.56;
    burger.add(topBun);

    const sesamePositions = [
      [-0.55, 1.58, 0.24, -0.3],
      [-0.18, 1.72, 0.52, 0.18],
      [0.18, 1.69, 0.55, -0.12],
      [0.56, 1.57, 0.26, 0.3],
      [-0.01, 1.56, 0.78, 0.1],
      [0.38, 1.64, -0.04, -0.22]
    ];
    sesamePositions.forEach(([x, y, z, rotationZ], index) => {
      const sesameDot = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 6), sesame);
      sesameDot.name = 'burger-sesame-' + (index + 1);
      sesameDot.position.set(x, y, z);
      sesameDot.scale.set(1.8, 0.42, 0.72);
      sesameDot.rotation.z = rotationZ;
      burger.add(sesameDot);
    });

    burger.userData = {
      topBun,
      patty: pattyTop,
      cheese: cheeseTop,
      lettuce,
      pickles: picklePositions.length
    };
    return burger;
  }

  function disposeHeroObject(object) {
    if (!object || typeof object.traverse !== 'function') {
      return;
    }

    const disposedGeometries = new Set();
    const disposedMaterials = new Set();
    object.traverse((child) => {
      if (child.geometry && typeof child.geometry.dispose === 'function' && !disposedGeometries.has(child.geometry)) {
        child.geometry.dispose();
        disposedGeometries.add(child.geometry);
      }

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.filter(Boolean).forEach((material) => {
        if (disposedMaterials.has(material)) {
          return;
        }

        Object.values(material).forEach((value) => {
          if (value && typeof value.dispose === 'function') {
            value.dispose();
          }
        });
        if (typeof material.dispose === 'function') {
          material.dispose();
        }
        disposedMaterials.add(material);
      });
    });
  }

  function resetHeroMotion(state) {
    if (!state) {
      return;
    }

    const { waiter, burger, camera, eyes, armRight, tray } = state;
    if (waiter) {
      waiter.position.y = state.baseWaiterY;
    }
    if (burger) {
      burger.rotation.y = state.baseBurgerRotationY;
      burger.rotation.z = state.baseBurgerRotationZ;
    }
    if (armRight) {
      armRight.rotation.z = state.baseArmRotationZ;
    }
    if (tray) {
      tray.rotation.z = -state.baseArmRotationZ;
    }
    if (eyes) {
      eyes.scale.y = 1;
    }
    if (camera) {
      camera.position.set(state.baseCamera.x, state.baseCamera.y, state.baseCamera.z);
      camera.lookAt(state.cameraTarget);
    }
    state.lastTimestamp = null;
    state.elapsed = 0;
    state.blinkUntil = 0;
    state.nextBlinkAt = 3.1;
  }

  function renderHeroFrame(state) {
    if (state?.renderer && state.scene && state.camera) {
      state.renderer.render(state.scene, state.camera);
    }
  }

  function resizeHeroScene(state) {
    if (!state || !state.container || !state.renderer || !state.camera) {
      return;
    }

    const width = Math.max(1, state.container.clientWidth || state.container.offsetWidth || 640);
    const height = Math.max(1, state.container.clientHeight || state.container.offsetHeight || 560);
    state.renderer.setSize(width, height, false);
    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();
    renderHeroFrame(state);
  }

  function animateScene() {
    const state = heroSceneState;
    if (!state) {
      return null;
    }

    if (state.animationFrame !== null && typeof root.cancelAnimationFrame === 'function') {
      root.cancelAnimationFrame(state.animationFrame);
      state.animationFrame = null;
    }

    if (state.reducedMotion || typeof root.requestAnimationFrame !== 'function') {
      resetHeroMotion(state);
      renderHeroFrame(state);
      return state;
    }

    const renderLoop = (timestamp) => {
      if (heroSceneState !== state) {
        return;
      }

      const currentTimestamp = Number.isFinite(timestamp) ? timestamp : 0;
      if (state.lastTimestamp === null) {
        state.lastTimestamp = currentTimestamp;
      }
      const delta = Math.min(Math.max((currentTimestamp - state.lastTimestamp) / 1000, 0), 0.05);
      state.lastTimestamp = currentTimestamp;
      state.elapsed += delta;

      const time = state.elapsed;
      state.waiter.position.y = state.baseWaiterY + Math.sin(time * 1.35) * 0.035;
      state.waiter.userData.head.rotation.z = Math.sin(time * 1.1) * 0.018;
      state.burger.rotation.y = state.baseBurgerRotationY + Math.sin(time * 0.72) * 0.13;
      state.burger.rotation.z = state.baseBurgerRotationZ + Math.sin(time * 0.58) * 0.014;
      state.armRight.rotation.z = state.baseArmRotationZ + Math.sin(time * 1.15) * 0.035;
      state.tray.rotation.z = -state.armRight.rotation.z;
      state.camera.position.x = state.baseCamera.x + Math.sin(time * 0.32) * 0.055;
      state.camera.position.y = state.baseCamera.y + Math.cos(time * 0.26) * 0.018;
      state.camera.position.z = state.baseCamera.z + Math.sin(time * 0.21) * 0.018;
      state.camera.lookAt(state.cameraTarget);

      if (time >= state.nextBlinkAt) {
        state.eyes.scale.y = 0.12;
        state.blinkUntil = time + 0.12;
        state.nextBlinkAt = time + 3.2 + Math.random() * 1.8;
      }
      if (state.blinkUntil && time >= state.blinkUntil) {
        state.eyes.scale.y = 1;
        state.blinkUntil = 0;
      }

      renderHeroFrame(state);
      state.animationFrame = root.requestAnimationFrame(renderLoop);
    };

    state.animationFrame = root.requestAnimationFrame(renderLoop);
    return state;
  }

  function disposeHeroScene() {
    const state = heroSceneState;
    const hadScene = Boolean(state);
    heroSceneState = null;

    if (state) {
      if (state.animationFrame !== null && typeof root.cancelAnimationFrame === 'function') {
        root.cancelAnimationFrame(state.animationFrame);
      }
      if (state.resizeObserver && typeof state.resizeObserver.disconnect === 'function') {
        state.resizeObserver.disconnect();
      }
      if (state.resizeListener && typeof root.removeEventListener === 'function') {
        root.removeEventListener('resize', state.resizeListener);
      }
      if (state.motionQuery) {
        if (typeof state.motionQuery.removeEventListener === 'function') {
          state.motionQuery.removeEventListener('change', state.motionListener);
        } else if (typeof state.motionQuery.removeListener === 'function') {
          state.motionQuery.removeListener(state.motionListener);
        }
      }
      disposeHeroObject(state.scene);
      if (state.renderer) {
        if (typeof state.renderer.dispose === 'function') {
          state.renderer.dispose();
        }
        if (typeof state.renderer.forceContextLoss === 'function') {
          state.renderer.forceContextLoss();
        }
      }
    }

    const heroScene = getElement('hero-scene');
    if (heroScene) {
      heroScene.replaceChildren();
      heroScene.hidden = true;
      heroScene.setAttribute('aria-hidden', 'true');
    }
    if (hadScene) {
      const heroFallback = getElement('hero-fallback');
      if (heroFallback) {
        heroFallback.hidden = false;
        heroFallback.removeAttribute('aria-hidden');
      }
    }

    return true;
  }

  function showHeroFallback() {
    disposeHeroScene();

    const heroScene = getElement('hero-scene');
    const heroFallback = getElement('hero-fallback');
    if (heroScene) {
      heroScene.hidden = true;
      heroScene.setAttribute('aria-hidden', 'true');
    }
    if (heroFallback) {
      heroFallback.hidden = false;
      heroFallback.removeAttribute('aria-hidden');
    }
    updateHeroStatus('Presentación ilustrada activa · escena 3D no disponible.', 'fallback');
    return heroFallback;
  }

  function initHeroScene() {
    disposeHeroScene();

    const documentRef = getDocument();
    const heroScene = getElement('hero-scene');
    const heroFallback = getElement('hero-fallback');
    const THREE = root.THREE;
    if (!documentRef || !heroScene || !THREE) {
      return showHeroFallback();
    }

    const canvas = documentRef.createElement('canvas');
    let context = null;
    try {
      context = canvas.getContext('webgl', { alpha: true, antialias: true })
        || canvas.getContext('experimental-webgl', { alpha: true, antialias: true });
    } catch (error) {
      context = null;
    }

    if (!context) {
      return showHeroFallback();
    }

    const state = {
      container: heroScene,
      canvas,
      renderer: null,
      scene: null,
      camera: null,
      waiter: null,
      burger: null,
      eyes: null,
      armRight: null,
      tray: null,
      animationFrame: null,
      resizeObserver: null,
      resizeListener: null,
      motionQuery: null,
      motionListener: null,
      reducedMotion: false,
      lastTimestamp: null,
      elapsed: 0,
      blinkUntil: 0,
      nextBlinkAt: 3.1,
      baseWaiterY: -0.96,
      baseBurgerRotationY: 0.08,
      baseBurgerRotationZ: 0,
      baseArmRotationZ: 1.05,
      baseCamera: { x: 0, y: 0.72, z: 7.5 },
      cameraTarget: new THREE.Vector3(-0.12, 0.55, 0)
    };
    heroSceneState = state;

    try {
      heroScene.replaceChildren(canvas);
      heroScene.hidden = false;
      heroScene.removeAttribute('aria-hidden');
      if (heroFallback) {
        heroFallback.hidden = true;
        heroFallback.setAttribute('aria-hidden', 'true');
      }

      state.renderer = new THREE.WebGLRenderer({
        canvas,
        context,
        antialias: true,
        alpha: true
      });
      if (typeof state.renderer.setPixelRatio === 'function') {
        state.renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 2));
      }
      state.renderer.setClearColor(0x000000, 0);
      if (state.renderer.outputEncoding !== undefined && THREE.sRGBEncoding !== undefined) {
        state.renderer.outputEncoding = THREE.sRGBEncoding;
      }

      state.scene = new THREE.Scene();
      state.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      state.camera.position.set(state.baseCamera.x, state.baseCamera.y, state.baseCamera.z);
      state.camera.lookAt(state.cameraTarget);

      const ambientLight = new THREE.AmbientLight(0xffead6, 0.42);
      ambientLight.name = 'warm-ambient-light';
      state.scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffc37e, 1.35);
      keyLight.name = 'warm-key-light';
      keyLight.position.set(-3.5, 5, 5.5);
      state.scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xffe8ba, 0.28);
      fillLight.name = 'soft-fill-light';
      fillLight.position.set(4, 2, 2);
      state.scene.add(fillLight);

      const stageShadow = new THREE.Mesh(
        new THREE.CircleGeometry(2.45, 48),
        new THREE.MeshBasicMaterial({ color: 0x5c3025, transparent: true, opacity: 0.16, depthWrite: false })
      );
      stageShadow.name = 'hero-stage-shadow';
      stageShadow.rotation.x = -Math.PI / 2;
      stageShadow.scale.set(1.15, 0.56, 1);
      stageShadow.position.set(-0.1, -1.05, -0.25);
      state.scene.add(stageShadow);

      state.waiter = createWaiter();
      state.burger = createBurger();
      if (!state.waiter || !state.burger || !state.waiter.userData.tray) {
        throw new Error('Hero primitives could not be created.');
      }

      state.waiter.position.set(-1.28, state.baseWaiterY, 0);
      state.waiter.rotation.y = -0.08;
      state.tray = state.waiter.userData.tray;
      state.armRight = state.waiter.userData.armRight;
      state.eyes = state.waiter.userData.eyes;
      state.burger.position.set(0, 0.14, 0.06);
      state.burger.rotation.y = state.baseBurgerRotationY;
      state.tray.add(state.burger);
      state.scene.add(state.waiter);

      state.reducedMotion = typeof root.matchMedia === 'function'
        ? root.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
      if (typeof root.matchMedia === 'function') {
        state.motionQuery = root.matchMedia('(prefers-reduced-motion: reduce)');
        state.motionListener = (event) => {
          if (heroSceneState !== state) {
            return;
          }
          state.reducedMotion = event.matches;
          animateScene();
        };
        if (typeof state.motionQuery.addEventListener === 'function') {
          state.motionQuery.addEventListener('change', state.motionListener);
        } else if (typeof state.motionQuery.addListener === 'function') {
          state.motionQuery.addListener(state.motionListener);
        }
      }

      const resize = () => resizeHeroScene(state);
      if (typeof root.ResizeObserver === 'function') {
        state.resizeObserver = new root.ResizeObserver(resize);
        state.resizeObserver.observe(heroScene);
      } else if (typeof root.addEventListener === 'function') {
        state.resizeListener = resize;
        root.addEventListener('resize', resize);
      }

      resizeHeroScene(state);
      animateScene();
      updateHeroStatus('Escena 3D lista para servir.', 'scene');
      return state;
    } catch (error) {
      showHeroFallback();
      return null;
    }
  }

  function roundMoney(value) {
    const amount = Number(value);
    return Number.isFinite(amount) ? Math.round((amount + Number.EPSILON) * 100) / 100 : 0;
  }

  function formatCurrency(value) {
    return currencyFormatter.format(roundMoney(value));
  }

  function getProduct(productId) {
    return products.find((product) => product.id === productId) || null;
  }

  function normalizeQuantity(quantity, fallback = 1) {
    const parsed = Number(quantity);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return Math.max(1, Math.trunc(parsed));
  }

  function normalizeExtraIds(product, extras) {
    if (!product || !Array.isArray(extras)) {
      return [];
    }

    return [...new Set(extras)]
      .filter((extraId) => product.extras.includes(extraId) && extraOptions[extraId])
      .sort();
  }

  function getExtraTotal(extraIds) {
    return roundMoney(extraIds.reduce((total, extraId) => total + extraOptions[extraId].price, 0));
  }

  function getCartItemKey(productId, extraIds) {
    return `${productId}::${extraIds.join(',')}`;
  }

  function createCartItem(product, quantity, extras) {
    const normalizedExtras = normalizeExtraIds(product, extras);
    const safeQuantity = normalizeQuantity(quantity);

    return {
      key: getCartItemKey(product.id, normalizedExtras),
      productId: product.id,
      quantity: safeQuantity,
      extras: normalizedExtras
    };
  }

  function normalizeStoredItem(storedItem) {
    if (!storedItem || typeof storedItem !== 'object' || typeof storedItem.productId !== 'string' || !Array.isArray(storedItem.extras)) {
      return null;
    }

    const product = getProduct(storedItem.productId);
    const quantity = Number(storedItem.quantity);
    const normalizedExtras = normalizeExtraIds(product, storedItem.extras);
    const hasValidExtras = product
      && storedItem.extras.length === normalizedExtras.length
      && new Set(storedItem.extras).size === storedItem.extras.length;

    if (!product || !Number.isInteger(quantity) || quantity < 1 || !hasValidExtras) {
      return null;
    }

    return createCartItem(product, quantity, normalizedExtras);
  }

  function persistStoredCart(items) {
    try {
      const storage = root.localStorage;
      if (storage) {
        storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  function loadCart() {
    try {
      const storage = root.localStorage;
      if (!storage) {
        return [];
      }

      const storedValue = storage.getItem(CART_STORAGE_KEY);
      if (storedValue === null || typeof storedValue === 'undefined') {
        return [];
      }

      const parsed = JSON.parse(storedValue);
      if (!Array.isArray(parsed)) {
        persistStoredCart([]);
        return [];
      }

      const restoredItems = parsed.map(normalizeStoredItem);
      if (!restoredItems.every(Boolean)) {
        persistStoredCart([]);
        return [];
      }

      persistStoredCart(restoredItems);
      return restoredItems;
    } catch (error) {
      persistStoredCart([]);
      return [];
    }
  }

  function persistCart() {
    const persistedItems = cart.map((item) => {
      const details = getCartItemDetails(item);
      return details
        ? {
          key: details.key,
          productId: details.product.id,
          quantity: details.quantity,
          extras: details.extras
        }
        : null;
    }).filter(Boolean);

    return persistStoredCart(persistedItems);
  }

  function getCartItemDetails(item) {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const product = getProduct(item.productId);
    if (!product) {
      return null;
    }

    const extras = normalizeExtraIds(product, item.extras);
    const quantity = normalizeQuantity(item.quantity);
    const extraTotal = getExtraTotal(extras);
    const unitPrice = roundMoney(product.price + extraTotal);
    return {
      key: getCartItemKey(product.id, extras),
      product,
      extras,
      quantity,
      extraTotal,
      unitPrice,
      subtotal: roundMoney(unitPrice * quantity)
    };
  }

  function findCartItemByKey(key) {
    return cart.find((item) => item.key === key || getCartItemDetails(item)?.key === key) || null;
  }

  function getCartItemSubtotal(item) {
    const details = getCartItemDetails(item);
    return details ? details.subtotal : 0;
  }

  function getCartTotal() {
    return roundMoney(cart.reduce((total, item) => total + getCartItemSubtotal(item), 0));
  }

  function renderMenu(category = 'all') {
    const menuGrid = getElement('menu-grid');
    const menuStatus = getElement('menu-status');
    const selectedCategory = Object.prototype.hasOwnProperty.call(categoryLabels, category) ? category : 'all';
    const visibleProducts = selectedCategory === 'all'
      ? products
      : products.filter((product) => product.category === selectedCategory);

    const documentRef = getDocument();
    if (documentRef && menuGrid) {
      menuGrid.innerHTML = '';

      visibleProducts.forEach((product) => {
        const card = documentRef.createElement('article');
        card.className = 'menu-card';
        card.dataset.productId = product.id;

        const cardHeader = documentRef.createElement('div');
        cardHeader.className = 'menu-card__header';

        const tag = documentRef.createElement('span');
        tag.className = 'menu-card__tag';
        tag.textContent = product.tag;

        const price = documentRef.createElement('span');
        price.className = 'menu-card__price';
        price.textContent = formatCurrency(product.price);

        cardHeader.append(tag, price);

        const title = documentRef.createElement('h3');
        title.className = 'menu-card__title';
        title.textContent = product.name;

        const description = documentRef.createElement('p');
        description.className = 'menu-card__description';
        description.textContent = product.description;

        const action = documentRef.createElement('button');
        action.className = 'button button--primary menu-card__action';
        action.type = 'button';
        action.dataset.productAction = 'details';
        action.setAttribute('aria-label', `Ver detalle de ${product.name}`);
        action.textContent = 'Ver detalle';

        card.append(cardHeader, title, description, action);
        menuGrid.append(card);
      });
    }

    const categoryButtons = documentRef ? documentRef.querySelectorAll('[data-category]') : [];
    categoryButtons.forEach((button) => {
      const isActive = button.dataset.category === selectedCategory;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    if (menuStatus) {
      const productWord = visibleProducts.length === 1 ? 'producto' : 'productos';
      menuStatus.textContent = `Se muestran ${visibleProducts.length} ${productWord} · ${categoryLabels[selectedCategory]}.`;
    }

    return visibleProducts;
  }

  function getSelectedProductExtras() {
    const productExtras = getElement('product-extras');
    if (!productExtras) {
      return [];
    }

    return [...productExtras.querySelectorAll('input[type="checkbox"]:checked')]
      .map((input) => input.value);
  }

  function updateProductTotal() {
    const product = getProduct(activeProductId);
    const productTotal = getElement('product-total');
    const productQuantity = getElement('product-quantity');

    if (!product || !productTotal) {
      return 0;
    }

    const quantity = normalizeQuantity(productQuantity ? productQuantity.value : 1);
    const extras = normalizeExtraIds(product, getSelectedProductExtras());
    const total = roundMoney((product.price + getExtraTotal(extras)) * quantity);
    productTotal.textContent = formatCurrency(total);
    return total;
  }

  function openProduct(productId) {
    const product = getProduct(productId);
    const productDialog = getElement('product-dialog');
    const productExtras = getElement('product-extras');
    const productQuantity = getElement('product-quantity');
    const documentRef = getDocument();

    if (!product || !productDialog || !documentRef) {
      return false;
    }

    activeProductId = product.id;
    productDialogTrigger = documentRef.activeElement;

    const productName = getElement('product-name');
    const productDescription = getElement('product-description');
    const productPrice = getElement('product-price');

    if (productName) {
      productName.textContent = product.name;
    }
    if (productDescription) {
      productDescription.textContent = product.description;
    }
    if (productPrice) {
      productPrice.textContent = formatCurrency(product.price);
    }
    if (productQuantity) {
      productQuantity.value = '1';
    }

    if (productExtras) {
      productExtras.innerHTML = '';

      const legend = documentRef.createElement('legend');
      legend.textContent = 'Extras';
      productExtras.append(legend);

      const hint = documentRef.createElement('p');
      hint.className = 'dialog-hint';
      hint.textContent = 'Elige tus extras favoritos.';
      productExtras.append(hint);

      product.extras.forEach((extraId) => {
        const extra = extraOptions[extraId];
        if (!extra) {
          return;
        }

        const field = documentRef.createElement('label');
        field.className = 'extra-option';

        const checkbox = documentRef.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'product-extra';
        checkbox.value = extraId;
        checkbox.id = `product-extra-${extraId}`;

        const labelText = documentRef.createElement('span');
        labelText.textContent = `${extra.label} (+${formatCurrency(extra.price)})`;

        field.append(checkbox, labelText);
        productExtras.append(field);
      });
    }

    updateProductTotal();

    if (typeof productDialog.showModal === 'function') {
      if (!productDialog.open) {
        productDialog.showModal();
      }
    } else {
      productDialog.setAttribute('open', '');
      productDialog.open = true;
    }

    return product;
  }

  function isVisibleElement(element) {
    if (!element || typeof element.focus !== 'function' || element.isConnected === false || element.hidden) {
      return false;
    }

    if (typeof element.closest === 'function' && element.closest('[hidden], [aria-hidden="true"]')) {
      return false;
    }

    const style = typeof root.getComputedStyle === 'function' ? root.getComputedStyle(element) : null;
    return !style || (style.display !== 'none' && style.visibility !== 'hidden');
  }

  function getFocusableElements(container) {
    if (!container) {
      return [];
    }

    return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(isVisibleElement);
  }

  function restoreFocus(target, fallbackId) {
    const fallback = getElement(fallbackId);
    const focusTarget = isVisibleElement(target) ? target : fallback;

    if (isVisibleElement(focusTarget)) {
      focusTarget.focus();
    }
  }

  function closeProductDialog() {
    const productDialog = getElement('product-dialog');
    if (!productDialog) {
      return;
    }

    if (typeof productDialog.close === 'function' && productDialog.open) {
      productDialog.close();
      return;
    }

    productDialog.removeAttribute('open');
    productDialog.open = false;
    restoreFocus(productDialogTrigger, 'menu-grid');
  }

  function announceCart(message) {
    const liveRegion = getElement('cart-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }

  function showToast(message) {
    const toastRegion = getElement('toast-region');
    const documentRef = getDocument();
    if (!toastRegion || !documentRef) {
      return;
    }

    if (toastTimer && typeof root.clearTimeout === 'function') {
      root.clearTimeout(toastTimer);
    }

    const toast = documentRef.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    toastRegion.replaceChildren(toast);

    if (typeof root.setTimeout === 'function') {
      toastTimer = root.setTimeout(() => {
        toast.remove();
      }, 2800);
    }
  }

  const checkoutFieldIds = {
    name: 'customer-name',
    phone: 'customer-phone',
    deliveryMode: 'delivery-mode',
    address: 'customer-address',
    paymentMode: 'payment-mode'
  };

  function getCheckoutControl(form, fieldId) {
    if (form) {
      if (form.elements) {
        const namedItem = typeof form.elements.namedItem === 'function'
          ? form.elements.namedItem(fieldId)
          : form.elements[fieldId];
        if (namedItem) {
          return namedItem;
        }
      }

      if (typeof form.querySelector === 'function') {
        const formControl = form.querySelector(`#${fieldId}`);
        if (formControl) {
          return formControl;
        }
      }
    }

    return getElement(fieldId);
  }

  function getCheckoutErrorElement(form, fieldId) {
    if (form && typeof form.querySelector === 'function') {
      const formError = form.querySelector(`[data-error-for="${fieldId}"]`);
      if (formError) {
        return formError;
      }
    }

    const documentRef = getDocument();
    return documentRef ? documentRef.querySelector(`[data-error-for="${fieldId}"]`) : null;
  }

  function setCheckoutError(message) {
    const checkoutError = getElement('checkout-error');
    if (checkoutError) {
      checkoutError.textContent = message || '';
    }
  }

  function renderCheckoutFieldError(form, fieldId, message) {
    const control = getCheckoutControl(form, fieldId);
    const errorElement = getCheckoutErrorElement(form, fieldId);

    if (errorElement) {
      errorElement.textContent = message || '';
    }
    if (control) {
      control.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
  }

  function validateCheckout(form) {
    const nameControl = getCheckoutControl(form, checkoutFieldIds.name);
    const phoneControl = getCheckoutControl(form, checkoutFieldIds.phone);
    const deliveryModeControl = getCheckoutControl(form, checkoutFieldIds.deliveryMode);
    const addressControl = getCheckoutControl(form, checkoutFieldIds.address);
    const paymentModeControl = getCheckoutControl(form, checkoutFieldIds.paymentMode);
    const values = {
      name: typeof nameControl?.value === 'string' ? nameControl.value.trim() : '',
      phone: typeof phoneControl?.value === 'string' ? phoneControl.value.trim() : '',
      deliveryMode: typeof deliveryModeControl?.value === 'string' ? deliveryModeControl.value : '',
      address: typeof addressControl?.value === 'string' ? addressControl.value.trim() : '',
      paymentMode: typeof paymentModeControl?.value === 'string' ? paymentModeControl.value : ''
    };
    const errors = {};

    if (values.name.length < 2) {
      errors.name = 'Escribe tu nombre (mínimo 2 caracteres).';
    }
    if (values.phone.replace(/\D/g, '').length < 7) {
      errors.phone = 'Ingresa un teléfono válido (mínimo 7 dígitos).';
    }
    if (!['delivery', 'pickup'].includes(values.deliveryMode)) {
      errors.deliveryMode = 'Selecciona una modalidad.';
    }
    if (values.deliveryMode === 'delivery' && values.address.length < 5) {
      errors.address = 'Ingresa una dirección válida (mínimo 5 caracteres).';
    }
    if (!['cash', 'card', 'transfer'].includes(values.paymentMode)) {
      errors.paymentMode = 'Selecciona un método de pago.';
    }

    Object.entries(checkoutFieldIds).forEach(([fieldKey, fieldId]) => {
      renderCheckoutFieldError(form, fieldId, errors[fieldKey] || '');
    });
    setCheckoutError(Object.keys(errors).length ? 'Revisa los campos marcados antes de confirmar.' : '');

    return {
      valid: Object.keys(errors).length === 0,
      values,
      errors
    };
  }

  function generateOrderCode() {
    return `BC-${Date.now().toString(36).slice(-5).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  }

  function getOrderLineItems() {
    return cart.map(getCartItemDetails).filter(Boolean).map((details) => ({
      productId: details.product.id,
      name: details.product.name,
      quantity: details.quantity,
      extras: [...details.extras],
      unitPrice: details.unitPrice,
      subtotal: details.subtotal
    }));
  }

  function renderConfirmation(order) {
    const confirmationView = getElement('confirmation-view');
    const confirmationCode = getElement('confirmation-code');
    const confirmationName = getElement('confirmation-name');
    const confirmationTotal = getElement('confirmation-total');
    const confirmationItems = getElement('confirmation-items');
    const confirmationTitle = getElement('confirmation-title');
    const documentRef = getDocument();

    if (!confirmationView) {
      return order;
    }

    if (confirmationCode) {
      confirmationCode.textContent = order?.code || '';
    }
    if (confirmationName) {
      confirmationName.textContent = order?.customerName || '';
    }
    if (confirmationTotal) {
      confirmationTotal.textContent = formatCurrency(order?.total || 0);
    }
    if (confirmationItems) {
      confirmationItems.replaceChildren();
      (order?.items || []).forEach((item) => {
        const listItem = documentRef ? documentRef.createElement('li') : null;
        if (!listItem) {
          return;
        }

        const extraLabels = (item.extras || [])
          .map((extraId) => extraOptions[extraId]?.label)
          .filter(Boolean);
        const extrasText = extraLabels.length ? ` · ${extraLabels.join(', ')}` : '';
        listItem.textContent = `${item.quantity} × ${item.name}${extrasText} — ${formatCurrency(item.subtotal)}`;
        confirmationItems.append(listItem);
      });
    }

    confirmationView.hidden = false;
    if (confirmationTitle && typeof confirmationTitle.focus === 'function') {
      confirmationTitle.setAttribute('tabindex', '-1');
      confirmationTitle.focus();
    }

    return order;
  }

  function submitOrder(form) {
    const lineItems = getOrderLineItems();
    if (!lineItems.length) {
      const message = 'Agrega un producto antes de confirmar el pedido.';
      setCheckoutError(message);
      announceCart(message);
      showToast(message);
      return null;
    }

    const validation = validateCheckout(form || getElement('checkout-form'));
    if (!validation.valid) {
      return null;
    }

    const now = new Date();
    const order = {
      code: generateOrderCode(),
      customerName: validation.values.name,
      deliveryMode: validation.values.deliveryMode,
      items: lineItems,
      total: getCartTotal(),
      createdAt: now.toLocaleString('es-PY')
    };

    const previousCart = cart.map((item) => ({
      ...item,
      extras: Array.isArray(item.extras) ? [...item.extras] : []
    }));
    cart.length = 0;
    const cartPersisted = persistCart();
    if (!cartPersisted) {
      cart.push(...previousCart);
      renderCart();
      const message = 'No pudimos guardar el carrito. Tu pedido no se confirmó; inténtalo de nuevo.';
      setCheckoutError(message);
      announceCart(message);
      showToast(message);
      return null;
    }

    renderCart();
    closeCheckoutDialog();
    closeCart();
    renderConfirmation(order);
    showToast(`Pedido ${order.code} simulado con éxito.`);
    setCheckoutError('');
    return order;
  }

  function updateAddressRequirement() {
    const deliveryMode = getElement(checkoutFieldIds.deliveryMode);
    const address = getElement(checkoutFieldIds.address);
    if (!deliveryMode || !address) {
      return false;
    }

    const requiresAddress = deliveryMode.value === 'delivery';
    address.required = requiresAddress;
    address.setAttribute('aria-required', String(requiresAddress));

    if (!requiresAddress) {
      renderCheckoutFieldError(getElement('checkout-form'), checkoutFieldIds.address, '');
    }

    return requiresAddress;
  }

  function restartFromConfirmation() {
    const confirmationView = getElement('confirmation-view');
    if (confirmationView) {
      confirmationView.hidden = true;
    }

    renderMenu();
    const menu = getElement('menu');
    if (menu && typeof menu.scrollIntoView === 'function') {
      menu.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function commitCartMutation(message) {
    const documentRef = getDocument();
    const activeElement = documentRef ? documentRef.activeElement : null;
    const focusRequest = activeElement && activeElement.dataset?.cartAction && activeElement.dataset?.cartKey
      ? { action: activeElement.dataset.cartAction, key: activeElement.dataset.cartKey }
      : null;

    persistCart();
    renderCart();
    announceCart(message);
    showToast(message);

    if (focusRequest) {
      const cartItems = getElement('cart-items');
      const replacement = cartItems
        ? [...cartItems.querySelectorAll('[data-cart-action]')]
          .find((control) => control.dataset.cartAction === focusRequest.action && control.dataset.cartKey === focusRequest.key)
        : null;
      restoreFocus(replacement, 'cart-close');
    }
  }

  function addToCart(productId, quantity, extras = []) {
    const product = getProduct(productId);
    if (!product) {
      return false;
    }

    const item = createCartItem(product, quantity, extras);
    const existingItem = cart.find((cartItem) => getCartItemDetails(cartItem)?.key === item.key);

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.push(item);
    }

    commitCartMutation(`${product.name} se agregó al carrito.`);
    return item;
  }

  function updateCartItem(key, quantity) {
    const item = findCartItemByKey(key);
    if (!item) {
      return false;
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      return removeCartItem(key);
    }

    item.quantity = Math.trunc(parsedQuantity);
    const product = getProduct(item.productId);
    commitCartMutation(`Cantidad de ${product ? product.name : 'producto'}: ${item.quantity}.`);
    return item;
  }

  function removeCartItem(key) {
    const itemIndex = cart.findIndex((cartItem) => cartItem.key === key || getCartItemDetails(cartItem)?.key === key);
    if (itemIndex === -1) {
      return false;
    }

    const [removedItem] = cart.splice(itemIndex, 1);
    const product = getProduct(removedItem.productId);
    commitCartMutation(`${product ? product.name : 'El producto'} se quitó del carrito.`);
    return removedItem;
  }

  function renderCart() {
    const cartItems = getElement('cart-items');
    const cartEmpty = getElement('cart-empty');
    const cartSubtotal = getElement('cart-subtotal');
    const cartTotal = getElement('cart-total');
    const cartCheckout = getElement('cart-checkout');
    const cartCount = getElement('cart-count');
    const documentRef = getDocument();
    const renderedItems = cart.map(getCartItemDetails).filter(Boolean);
    const itemCount = renderedItems.reduce((total, item) => total + item.quantity, 0);
    const total = getCartTotal();
    const hasItems = renderedItems.length > 0;

    if (cartCount) {
      const productWord = itemCount === 1 ? 'producto' : 'productos';
      cartCount.textContent = String(itemCount);
      cartCount.setAttribute('aria-label', `${itemCount} ${productWord} en el carrito`);
    }

    if (cartSubtotal) {
      cartSubtotal.textContent = formatCurrency(total);
    }
    if (cartTotal) {
      cartTotal.textContent = formatCurrency(total);
    }
    if (cartCheckout) {
      cartCheckout.disabled = !hasItems;
    }
    if (cartEmpty) {
      cartEmpty.hidden = hasItems;
    }
    if (cartItems) {
      cartItems.hidden = !hasItems;
      cartItems.innerHTML = '';
    }

    if (!hasItems || !cartItems || !documentRef) {
      return cart;
    }

    const list = documentRef.createElement('ul');
    list.className = 'cart-list';
    list.setAttribute('aria-label', 'Productos del carrito');

    renderedItems.forEach((details) => {
      const { key, product, extras: selectedExtras, quantity, subtotal: itemSubtotal } = details;
      const listItem = documentRef.createElement('li');
      listItem.className = 'cart-item';
      listItem.dataset.cartKey = key;

      const title = documentRef.createElement('h3');
      title.className = 'cart-item__name';
      title.textContent = product.name;

      const extras = documentRef.createElement('p');
      extras.className = 'cart-item__extras';
      const extraLabels = selectedExtras.map((extraId) => extraOptions[extraId]?.label).filter(Boolean);
      extras.textContent = extraLabels.length ? `Extras: ${extraLabels.join(', ')}` : 'Sin extras';

      const subtotal = documentRef.createElement('p');
      subtotal.className = 'cart-item__subtotal';
      subtotal.textContent = formatCurrency(itemSubtotal);

      const controls = documentRef.createElement('div');
      controls.className = 'cart-item__controls';

      const decrease = documentRef.createElement('button');
      decrease.className = 'icon-button';
      decrease.type = 'button';
      decrease.dataset.cartAction = 'decrease';
      decrease.dataset.cartKey = key;
      decrease.setAttribute('aria-label', `Disminuir cantidad de ${product.name}`);
      decrease.textContent = '−';

      const quantityOutput = documentRef.createElement('output');
      quantityOutput.className = 'cart-item__quantity';
      quantityOutput.id = `cart-quantity-${key.replace(/[^a-z0-9]+/gi, '-')}`;
      quantityOutput.setAttribute('aria-live', 'polite');
      quantityOutput.textContent = String(quantity);

      const increase = documentRef.createElement('button');
      increase.className = 'icon-button';
      increase.type = 'button';
      increase.dataset.cartAction = 'increase';
      increase.dataset.cartKey = key;
      increase.setAttribute('aria-label', `Aumentar cantidad de ${product.name}`);
      increase.textContent = '+';

      const remove = documentRef.createElement('button');
      remove.className = 'text-button';
      remove.type = 'button';
      remove.dataset.cartAction = 'remove';
      remove.dataset.cartKey = key;
      remove.setAttribute('aria-label', `Quitar ${product.name} del carrito`);
      remove.textContent = 'Quitar';

      controls.append(decrease, quantityOutput, increase, remove);
      listItem.append(title, extras, subtotal, controls);

      list.append(listItem);
    });

    cartItems.append(list);
    return cart;
  }

  function openCart() {
    const cartDrawer = getElement('cart-drawer');
    if (!cartDrawer) {
      return;
    }

    const documentRef = getDocument();
    if (documentRef && !cartDrawer.classList.contains('is-open')) {
      cartTrigger = documentRef.activeElement;
    }

    renderCart();
    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');

    const panel = cartDrawer.querySelector('.cart-drawer__panel');
    if (panel && typeof panel.focus === 'function') {
      panel.focus();
      if (typeof root.setTimeout === 'function') {
        root.setTimeout(() => {
          if (cartDrawer.classList.contains('is-open')) {
            panel.focus();
          }
        }, 0);
      }
    }
  }

  function closeCart() {
    const cartDrawer = getElement('cart-drawer');
    if (!cartDrawer) {
      return;
    }

    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    restoreFocus(cartTrigger, 'cart-open');
    cartTrigger = null;
  }

  function handleCartKeydown(event) {
    const cartDrawer = getElement('cart-drawer');
    if (!cartDrawer || !cartDrawer.classList.contains('is-open')) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeCart();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const panel = cartDrawer.querySelector('.cart-drawer__panel');
    if (!panel) {
      return;
    }

    const focusableElements = getFocusableElements(panel);
    if (!focusableElements.length) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const documentRef = getDocument();
    const activeElement = documentRef ? documentRef.activeElement : null;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const focusIsOutsidePanel = !activeElement || !panel.contains(activeElement);

    if (event.shiftKey && (activeElement === firstElement || activeElement === panel || focusIsOutsidePanel)) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && (activeElement === lastElement || activeElement === panel || focusIsOutsidePanel)) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function closeCheckoutDialog() {
    const checkoutDialog = getElement('checkout-dialog');
    if (!checkoutDialog) {
      return;
    }

    if (typeof checkoutDialog.close === 'function' && checkoutDialog.open) {
      checkoutDialog.close();
      return;
    }

    checkoutDialog.removeAttribute('open');
    checkoutDialog.open = false;
    restoreFocus(checkoutDialogTrigger, 'cart-open');
  }

  function openCheckoutFromCart(event) {
    if (!getOrderLineItems().length) {
      announceCart('Agrega un producto antes de continuar al checkout.');
      showToast('Agrega un producto antes de continuar.');
      return;
    }

    const checkoutDialog = getElement('checkout-dialog');
    if (!checkoutDialog) {
      return;
    }

    const documentRef = getDocument();
    checkoutDialogTrigger = event?.currentTarget || (documentRef ? documentRef.activeElement : null) || getElement('cart-checkout');
    closeCart();
    if (typeof checkoutDialog.showModal === 'function') {
      if (!checkoutDialog.open) {
        checkoutDialog.showModal();
      }
    } else {
      checkoutDialog.setAttribute('open', '');
      checkoutDialog.open = true;
    }
  }

  function wireEvents() {
    const documentRef = getDocument();
    if (!documentRef) {
      return;
    }

    documentRef.querySelectorAll('[data-category]').forEach((button) => {
      button.addEventListener('click', () => renderMenu(button.dataset.category));
    });

    const menuGrid = getElement('menu-grid');
    if (menuGrid) {
      menuGrid.addEventListener('click', (event) => {
        const action = event.target.closest('[data-product-action="details"]');
        const card = action ? action.closest('[data-product-id]') : null;
        if (card) {
          openProduct(card.dataset.productId);
        }
      });
    }

    const productDialog = getElement('product-dialog');
    const productDialogContent = getElement('product-dialog-content');
    const productDialogClose = getElement('product-dialog-close');
    const productQuantity = getElement('product-quantity');
    const productExtras = getElement('product-extras');

    if (productDialog) {
      productDialog.addEventListener('close', () => {
        restoreFocus(productDialogTrigger, 'menu-grid');
        productDialogTrigger = null;
        activeProductId = null;
      });
    }
    if (productDialogContent) {
      productDialogContent.addEventListener('submit', (event) => {
        if (event.submitter === productDialogClose) {
          return;
        }

        event.preventDefault();
        const product = getProduct(activeProductId);
        const quantity = productQuantity ? normalizeQuantity(productQuantity.value) : 1;
        const extras = product ? getSelectedProductExtras() : [];
        if (product) {
          addToCart(product.id, quantity, extras);
          closeProductDialog();
        }
      });
    }
    if (productDialogClose) {
      productDialogClose.addEventListener('click', (event) => {
        event.preventDefault();
        closeProductDialog();
      });
    }
    if (productQuantity) {
      productQuantity.addEventListener('input', updateProductTotal);
      productQuantity.addEventListener('change', updateProductTotal);
    }
    if (productExtras) {
      productExtras.addEventListener('change', updateProductTotal);
    }

    const cartOpenButton = getElement('cart-open');
    const cartCloseButton = getElement('cart-close');
    const cartDrawer = getElement('cart-drawer');
    const cartItems = getElement('cart-items');
    const cartCheckout = getElement('cart-checkout');
    const checkoutDialog = getElement('checkout-dialog');
    const checkoutForm = getElement('checkout-form');
    const checkoutSubmit = getElement('checkout-submit');
    const deliveryMode = getElement('delivery-mode');
    const confirmationBackToMenu = getElement('confirmation-back-to-menu');

    if (cartOpenButton) {
      cartOpenButton.addEventListener('click', openCart);
    }
    if (cartCloseButton) {
      cartCloseButton.addEventListener('click', closeCart);
    }
    if (cartDrawer) {
      cartDrawer.querySelectorAll('[data-cart-close]').forEach((closeControl) => {
        closeControl.addEventListener('click', closeCart);
      });
    }
    if (cartItems) {
      cartItems.addEventListener('click', (event) => {
        const control = event.target.closest('[data-cart-action]');
        if (!control) {
          return;
        }

        const key = control.dataset.cartKey;
        const item = findCartItemByKey(key);
        if (!item) {
          return;
        }

        if (control.dataset.cartAction === 'increase') {
          updateCartItem(key, item.quantity + 1);
        } else if (control.dataset.cartAction === 'decrease') {
          updateCartItem(key, item.quantity - 1);
        } else if (control.dataset.cartAction === 'remove') {
          removeCartItem(key);
        }
      });
    }
    if (cartCheckout) {
      cartCheckout.addEventListener('click', openCheckoutFromCart);
    }
    if (checkoutDialog) {
      if (checkoutForm) {
        checkoutForm.noValidate = true;
        checkoutForm.addEventListener('submit', (event) => {
          event.preventDefault();
          submitOrder(checkoutForm);
        });
      }
      checkoutDialog.addEventListener('close', () => {
        restoreFocus(checkoutDialogTrigger, 'cart-open');
        checkoutDialogTrigger = null;
      });
      checkoutDialog.querySelectorAll('button[value="cancel"]').forEach((cancelButton) => {
        cancelButton.addEventListener('click', (event) => {
          event.preventDefault();
          closeCheckoutDialog();
        });
      });
    }
    if (checkoutSubmit && checkoutForm) {
      checkoutSubmit.setAttribute('aria-controls', 'checkout-error');
    }
    if (deliveryMode) {
      deliveryMode.addEventListener('change', updateAddressRequirement);
      updateAddressRequirement();
    }
    if (confirmationBackToMenu) {
      confirmationBackToMenu.addEventListener('click', restartFromConfirmation);
    }

    documentRef.addEventListener('keydown', handleCartKeydown);
  }

  const publicApi = {
    products,
    extraOptions,
    formatCurrency,
    loadCart,
    persistCart,
    getCartTotal,
    renderMenu,
    openProduct,
    updateProductTotal,
    addToCart,
    updateCartItem,
    removeCartItem,
    renderCart,
    openCart,
    closeCart,
    showToast,
    validateCheckout,
    generateOrderCode,
    submitOrder,
    renderConfirmation,
    initHeroScene,
    createWaiter,
    createBurger,
    animateScene,
    showHeroFallback,
    disposeHeroScene
  };

  Object.assign(bocadoClub, publicApi, { bootstrap: true, cart });
  Object.assign(root, publicApi, { cart });

  function initialize() {
    renderMenu();
    renderCart();
    wireEvents();
    initHeroScene();
  }

  const documentRef = getDocument();
  if (documentRef) {
    if (documentRef.readyState === 'loading') {
      documentRef.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
      initialize();
    }
  }
})();
