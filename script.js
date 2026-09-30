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

  function getDocument() {
    return root.document || (typeof document !== 'undefined' ? document : null);
  }

  function getElement(id) {
    const documentRef = getDocument();
    return documentRef ? documentRef.getElementById(id) : null;
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
    const extraTotal = getExtraTotal(normalizedExtras);
    const unitPrice = roundMoney(product.price + extraTotal);
    const safeQuantity = normalizeQuantity(quantity);

    return {
      key: getCartItemKey(product.id, normalizedExtras),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: safeQuantity,
      extras: normalizedExtras,
      extraTotal,
      unitPrice,
      subtotal: roundMoney(unitPrice * safeQuantity)
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

  function loadCart() {
    try {
      const storage = root.localStorage;
      if (!storage) {
        return [];
      }

      const storedValue = storage.getItem(CART_STORAGE_KEY);
      if (!storedValue) {
        return [];
      }

      const parsed = JSON.parse(storedValue);
      if (!Array.isArray(parsed)) {
        return [];
      }

      const restoredItems = parsed.map(normalizeStoredItem);
      return restoredItems.every(Boolean) ? restoredItems : [];
    } catch (error) {
      return [];
    }
  }

  function persistCart() {
    try {
      const storage = root.localStorage;
      if (storage) {
        storage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  function getCartItemSubtotal(item) {
    const storedSubtotal = Number(item && item.subtotal);
    if (Number.isFinite(storedSubtotal)) {
      return roundMoney(storedSubtotal);
    }

    const product = getProduct(item && item.productId);
    if (!product) {
      return 0;
    }

    const extras = normalizeExtraIds(product, item.extras);
    const unitPrice = roundMoney(product.price + getExtraTotal(extras));
    return roundMoney(unitPrice * normalizeQuantity(item.quantity));
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

  function restoreFocus(target, fallbackId) {
    const fallback = getElement(fallbackId);
    const focusTarget = target && typeof target.focus === 'function' && target.isConnected !== false
      ? target
      : fallback;

    if (focusTarget && typeof focusTarget.focus === 'function') {
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
    const existingItem = cart.find((cartItem) => cartItem.key === item.key);

    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.subtotal = roundMoney(existingItem.unitPrice * existingItem.quantity);
    } else {
      cart.push(item);
    }

    commitCartMutation(`${product.name} se agregó al carrito.`);
    return item;
  }

  function updateCartItem(key, quantity) {
    const item = cart.find((cartItem) => cartItem.key === key);
    if (!item) {
      return false;
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      return removeCartItem(key);
    }

    item.quantity = Math.trunc(parsedQuantity);
    item.subtotal = roundMoney(item.unitPrice * item.quantity);
    commitCartMutation(`Cantidad de ${item.name}: ${item.quantity}.`);
    return item;
  }

  function removeCartItem(key) {
    const itemIndex = cart.findIndex((cartItem) => cartItem.key === key);
    if (itemIndex === -1) {
      return false;
    }

    const [removedItem] = cart.splice(itemIndex, 1);
    commitCartMutation(`${removedItem.name} se quitó del carrito.`);
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
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const total = getCartTotal();
    const hasItems = cart.length > 0;

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

    cart.forEach((item) => {
      const product = getProduct(item.productId);
      const listItem = documentRef.createElement('li');
      listItem.className = 'cart-item';
      listItem.dataset.cartKey = item.key;

      const title = documentRef.createElement('h3');
      title.className = 'cart-item__name';
      title.textContent = item.name;

      const extras = documentRef.createElement('p');
      extras.className = 'cart-item__extras';
      const extraLabels = item.extras.map((extraId) => extraOptions[extraId]?.label).filter(Boolean);
      extras.textContent = extraLabels.length ? `Extras: ${extraLabels.join(', ')}` : 'Sin extras';

      const subtotal = documentRef.createElement('p');
      subtotal.className = 'cart-item__subtotal';
      subtotal.textContent = formatCurrency(getCartItemSubtotal(item));

      const controls = documentRef.createElement('div');
      controls.className = 'cart-item__controls';

      const decrease = documentRef.createElement('button');
      decrease.className = 'icon-button';
      decrease.type = 'button';
      decrease.dataset.cartAction = 'decrease';
      decrease.dataset.cartKey = item.key;
      decrease.setAttribute('aria-label', `Disminuir cantidad de ${item.name}`);
      decrease.textContent = '−';

      const quantityOutput = documentRef.createElement('output');
      quantityOutput.className = 'cart-item__quantity';
      quantityOutput.id = `cart-quantity-${item.key.replace(/[^a-z0-9]+/gi, '-')}`;
      quantityOutput.setAttribute('aria-live', 'polite');
      quantityOutput.textContent = String(item.quantity);

      const increase = documentRef.createElement('button');
      increase.className = 'icon-button';
      increase.type = 'button';
      increase.dataset.cartAction = 'increase';
      increase.dataset.cartKey = item.key;
      increase.setAttribute('aria-label', `Aumentar cantidad de ${item.name}`);
      increase.textContent = '+';

      const remove = documentRef.createElement('button');
      remove.className = 'text-button';
      remove.type = 'button';
      remove.dataset.cartAction = 'remove';
      remove.dataset.cartKey = item.key;
      remove.setAttribute('aria-label', `Quitar ${item.name} del carrito`);
      remove.textContent = 'Quitar';

      controls.append(decrease, quantityOutput, increase, remove);
      listItem.append(title, extras, subtotal, controls);

      if (!product) {
        listItem.setAttribute('aria-label', 'Producto guardado anteriormente');
      }

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

  function openCheckoutFromCart() {
    if (!cart.length) {
      announceCart('Agrega un producto antes de continuar al checkout.');
      showToast('Agrega un producto antes de continuar.');
      return;
    }

    const checkoutDialog = getElement('checkout-dialog');
    if (!checkoutDialog) {
      return;
    }

    checkoutDialogTrigger = getElement('cart-open');
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
        const item = cart.find((cartItem) => cartItem.key === key);
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

    documentRef.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && cartDrawer?.classList.contains('is-open')) {
        event.preventDefault();
        closeCart();
      }
    });
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
    showToast
  };

  Object.assign(bocadoClub, publicApi, { bootstrap: true, cart });
  Object.assign(root, publicApi, { cart });

  function initialize() {
    renderMenu();
    renderCart();
    wireEvents();
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
