// =====================================================
// 60DETIK V0.5
// Supabase + Products + Marketplace + Orders
// =====================================================

const SUPABASE_URL = "https://crbobpsgaryhqcinfeow.supabase.co";
const SUPABASE_KEY = "sb_publishable_35Owtv9UK_5i7MCeN2jnFQ_agbwLkkh";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let currentUser = null;
let currentProduct = null;
let authMode = "login";

const $ = (id) => document.getElementById(id);

function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// =====================================================
// AUTH
// =====================================================

async function checkUser() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.log(error);
    currentUser = null;
    updateUI();
    return;
  }

  currentUser = data.session?.user || null;

  updateUI();

  if (currentUser) {
    await loadProfile();
    await loadMarketplace();
    await loadMyProducts();
  }
}

supabaseClient.auth.onAuthStateChange((_event, session) => {
  currentUser = session?.user || null;
  updateUI();
});

function updateUI() {
  const authBtn = $("authBtn");

  if (authBtn) {
    authBtn.textContent = currentUser ? "Keluar" : "Masuk";
    authBtn.onclick = currentUser ? logout : openAuth;
  }
}

function openAuth() {
  openPage("authPage");
}

function toggleAuthMode() {
  authMode = authMode === "login" ? "register" : "login";

  const title = $("authTitle");
  const button = $("authSubmit");
  const switchText = $("authSwitch");

  if (title) {
    title.textContent =
      authMode === "login"
        ? "Masuk ke 60DETIK"
        : "Buat akun 60DETIK";
  }

  if (button) {
    button.textContent =
      authMode === "login"
        ? "Masuk"
        : "Daftar";
  }

  if (switchText) {
    switchText.innerHTML =
      authMode === "login"
        ? 'Belum punya akun? <button type="button" onclick="toggleAuthMode()">Daftar</button>'
        : 'Sudah punya akun? <button type="button" onclick="toggleAuthMode()">Masuk</button>';
  }
}

async function submitAuth(event) {
  event.preventDefault();

  const email = $("authEmail")?.value.trim();
  const password = $("authPassword")?.value;
  const name = $("authName")?.value.trim() || "Creator";

  if (!email || !password) {
    alert("Email dan password wajib diisi.");
    return;
  }

  if (authMode === "register") {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      alert("Gagal daftar: " + error.message);
      return;
    }

    if (data.user) {
      await createProfile(data.user.id, name);
    }

    alert(
      "Pendaftaran berhasil. Jika diminta verifikasi email, cek email kamu."
    );

    if (data.session) {
      currentUser = data.user;
      updateUI();
      openPage("homePage");
    }

    return;
  }

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    alert("Gagal masuk: " + error.message);
    return;
  }

  currentUser = data.user;
  updateUI();

  await loadProfile();
  await loadMarketplace();
  await loadMyProducts();

  openPage("homePage");
}

async function createProfile(userId, name) {
  const { error } = await supabaseClient
    .from("profiles")
    .upsert({
      id: userId,
      display_name: name || "Creator"
    });

  if (error) {
    console.log("Profile:", error.message);
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  currentUser = null;
  updateUI();
  openPage("homePage");
}


// =====================================================
// NAVIGATION
// =====================================================

function openPage(pageId) {
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));

  const page = $(pageId);

  if (page) {
    page.classList.add("active");
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}


// =====================================================
// CREATE PRODUCT
// =====================================================

async function saveProduct(publish) {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  const user = session?.user;

  if (!user) {
    alert("Sesi login tidak ditemukan. Silakan masuk ulang.");
    openAuth();
    return;
  }

  const title = $("productTitle")?.value.trim();
  const skill = $("productSkill")?.value.trim();
  const target = $("productTarget")?.value.trim();
  const type = $("productType")?.value;
  const price = Number($("productPrice")?.value || 0);
  const description =
    $("productDescription")?.value.trim();

  if (!title) {
    alert("Judul produk wajib diisi.");
    return;
  }

  if (!type) {
    alert("Pilih jenis produk.");
    return;
  }

  if (price < 0) {
    alert("Harga tidak valid.");
    return;
  }

  const { data, error } = await supabaseClient
    .from("products")
    .insert({
      creator_id: user.id,
      title,
      skill,
      target,
      type,
      price,
      description,
      published: publish,
      sales: 0,
      reseller_count: 0
    })
    .select()
    .single();

  if (error) {
    alert("Gagal menyimpan produk: " + error.message);
    console.log(error);
    return;
  }

  currentProduct = data;

  await loadMarketplace();
  await loadMyProducts();

  showResult(data, publish);
}

function showResult(product, published) {
  openPage("resultPage");

  const title = $("resultTitle");
  const text = $("resultText");

  if (title) {
    title.textContent = published
      ? "Produk berhasil dipublikasikan! 🚀"
      : "Draft berhasil disimpan! 💾";
  }

  if (text) {
    text.innerHTML = `
      <strong>${escapeHTML(product.title)}</strong><br>
      ${rupiah(product.price)}<br><br>
      Status:
      <strong>${published ? "Published" : "Draft"}</strong>
    `;
  }
}

function clearCreateForm() {
  [
    "productTitle",
    "productSkill",
    "productTarget",
    "productPrice",
    "productDescription"
  ].forEach((id) => {
    if ($(id)) $(id).value = "";
  });

  if ($("productType")) {
    $("productType").selectedIndex = 0;
  }
}


// =====================================================
// MARKETPLACE
// =====================================================

async function loadMarketplace() {
  const { data, error } = await supabaseClient
    .from("products")
    .select(`
      *,
      profiles (
        display_name
      )
    `)
    .eq("published", true)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.log("Marketplace:", error.message);
    return;
  }

  renderMarketplace(data || []);
}

function renderMarketplace(products) {
  const grid = $("marketplaceGrid");

  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `
      <div class="empty">
        Belum ada produk yang dipublikasikan.
      </div>
    `;
    return;
  }

  grid.innerHTML = products
    .map((p) => `
      <article
        class="product-card"
        onclick="openProduct('${p.id}')"
      >
        <div class="product-cover">
          ${productType(p.type)}
        </div>

        <div class="product-card-body">
          <div class="product-type">
            ${escapeHTML(p.type)}
          </div>

          <h3>
            ${escapeHTML(p.title)}
          </h3>

          <p>
            ${escapeHTML(
              p.profiles?.display_name || "Creator"
            )}
          </p>

          <div class="product-bottom">
            <strong>${rupiah(p.price)}</strong>
            <span>
              ${p.sales || 0} terjual
            </span>
          </div>
        </div>
      </article>
    `)
    .join("");
}

function searchProducts() {
  const q =
    $("marketSearch")?.value.toLowerCase().trim() || "";

  document
    .querySelectorAll(".product-card")
    .forEach((card) => {
      card.style.display =
        card.textContent.toLowerCase().includes(q)
          ? ""
          : "none";
    });
}

function productType(type) {
  const value = String(type || "").toLowerCase();

  if (value.includes("ebook")) return "📘";
  if (value.includes("panduan")) return "📚";
  if (value.includes("checklist")) return "✅";
  if (value.includes("template")) return "📄";
  if (value.includes("worksheet")) return "📝";

  return "💡";
}


// =====================================================
// PRODUCT DETAIL
// =====================================================

async function openProduct(productId) {
  const { data, error } = await supabaseClient
    .from("products")
    .select(`
      *,
      profiles (
        display_name
      )
    `)
    .eq("id", productId)
    .single();

  if (error) {
    alert("Produk tidak ditemukan.");
    console.log(error);
    return;
  }

  currentProduct = data;

  openPage("productPage");

  if ($("detailType")) {
    $("detailType").textContent =
      productType(data.type) + " " + data.type;
  }

  if ($("detailTitle")) {
    $("detailTitle").textContent = data.title;
  }

  if ($("detailCreator")) {
    $("detailCreator").textContent =
      data.profiles?.display_name || "Creator";
  }

  if ($("detailPrice")) {
    $("detailPrice").textContent =
      rupiah(data.price);
  }

  if ($("detailDescription")) {
    $("detailDescription").textContent =
      data.description ||
      "Produk digital berkualitas dari creator 60DETIK.";
  }

  if ($("detailSales")) {
    $("detailSales").textContent =
      `${data.sales || 0} terjual`;
  }

  const buyButton = $("buyButton");

  if (buyButton) {
    buyButton.onclick = simulateBuy;
  }

  const resellerButton = $("resellerButton");

  if (resellerButton) {
    resellerButton.onclick = joinReseller;
  }
}


// =====================================================
// BUY / ORDER
// =====================================================

async function simulateBuy() {
  if (!currentProduct) {
    alert("Produk belum dipilih.");
    return;
  }

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  const buyer = session?.user;

  if (!buyer) {
    alert("Silakan masuk terlebih dahulu untuk membeli.");
    openAuth();
    return;
  }

  if (buyer.id === currentProduct.creator_id) {
    alert("Kamu tidak bisa membeli produk milik sendiri.");
    return;
  }

  const amount = Number(currentProduct.price || 0);

  const creatorAmount = Math.floor(amount * 0.70);
  const resellerAmount = 0;
  const platformAmount = amount - creatorAmount;

  const { data, error } = await supabaseClient
    .from("orders")
    .insert({
      product_id: currentProduct.id,
      buyer_id: buyer.id,
      reseller_id: null,
      amount: amount,
      creator_amount: creatorAmount,
      reseller_amount: resellerAmount,
      platform_amount: platformAmount,
      status: "pending"
    })
    .select()
    .single();

  if (error) {
    alert("Gagal membuat order: " + error.message);
    console.log(error);
    return;
  }

  alert(
    "ORDER BERHASIL DIBUAT! 🎉\n\n" +
    "Nomor Order:\n" +
    data.id +
    "\n\n" +
    "Total: " + rupiah(amount) +
    "\n" +
    "Status: MENUNGGU PEMBAYARAN"
  );

  await loadMyOrders();
}


// =====================================================
// RESELLER
// =====================================================

async function joinReseller() {
  if (!currentProduct) {
    alert("Produk belum dipilih.");
    return;
  }

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session?.user) {
    alert("Silakan masuk terlebih dahulu.");
    openAuth();
    return;
  }

  if (
    session.user.id ===
    currentProduct.creator_id
  ) {
    alert(
      "Kamu adalah creator produk ini."
    );
    return;
  }

  const shareUrl =
    window.location.origin +
    window.location.pathname +
    "?product=" +
    encodeURIComponent(currentProduct.id) +
    "&ref=" +
    encodeURIComponent(session.user.id);

  if (navigator.clipboard) {
    await navigator.clipboard.writeText(shareUrl);

    alert(
      "Link reseller berhasil dibuat! 🚀\n\n" +
      "Link sudah disalin.\n\n" +
      "Bagikan link tersebut kepada calon pembeli."
    );
  } else {
    alert(
      "Link reseller kamu:\n\n" +
      shareUrl
    );
  }
}


// =====================================================
// MY PRODUCTS
// =====================================================

async function loadMyProducts() {
  if (!currentUser) return;

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("creator_id", currentUser.id)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.log("My products:", error.message);
    return;
  }

  renderMyProducts(data || []);
  updateStats(data || []);
}

function renderMyProducts(products) {
  const el = $("myProducts");

  if (!el) return;

  if (!products.length) {
    el.innerHTML = `
      <div class="empty">
        Kamu belum memiliki produk.
      </div>
    `;
    return;
  }

  el.innerHTML = products
    .map((p) => `
      <div class="my-product">
        <div>
          <strong>
            ${escapeHTML(p.title)}
          </strong>

          <small>
            ${rupiah(p.price)}
            · ${p.published ? "Published" : "Draft"}
          </small>
        </div>

        <button
          onclick="openProduct('${p.id}')"
        >
          Lihat
        </button>
      </div>
    `)
    .join("");
}

function updateStats(products) {
  const total = products.length;

  const published =
    products.filter((p) => p.published).length;

  const sales =
    products.reduce(
      (sum, p) => sum + Number(p.sales || 0),
      0
    );

  if ($("statProducts"))
    $("statProducts").textContent = total;

  if ($("statPublished"))
    $("statPublished").textContent = published;

  if ($("statSales"))
    $("statSales").textContent = sales;
}


// =====================================================
// ORDERS
// =====================================================

async function loadMyOrders() {
  if (!currentUser) return;

  const { data, error } = await supabaseClient
    .from("orders")
    .select(`
      *,
      products (
        title
      )
    `)
    .eq("buyer_id", currentUser.id)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.log("Orders:", error.message);
    return;
  }

  renderOrders(data || []);
}

function renderOrders(orders) {
  const el = $("ordersList");

  if (!el) return;

  if (!orders.length) {
    el.innerHTML = `
      <div class="empty">
        Belum ada pesanan.
      </div>
    `;
    return;
  }

  el.innerHTML = orders
    .map((order) => `
      <div class="order-card">
        <div>
          <strong>
            ${escapeHTML(
              order.products?.title ||
              "Produk"
            )}
          </strong>
        </div>

        <div>
          ${rupiah(order.amount)}
        </div>

        <div class="order-status">
          ${escapeHTML(order.status)}
        </div>

        <small>
          ${new Date(
            order.created_at
          ).toLocaleString("id-ID")}
        </small>
      </div>
    `)
    .join("");
}


// =====================================================
// PROFILE
// =====================================================

async function loadProfile() {
  if (!currentUser) return;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .maybeSingle();

  if (error) {
    console.log("Profile:", error.message);
    return;
  }

  const name =
    data?.display_name ||
    currentUser.email?.split("@")[0] ||
    "Creator";

  if ($("profileName")) {
    $("profileName").textContent = name;
  }

  if ($("profileEmail")) {
    $("profileEmail").textContent =
      currentUser.email || "";
  }
}


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

  // Auth form
  const authForm = $("authForm");

  if (authForm) {
    authForm.addEventListener(
      "submit",
      submitAuth
    );
  }

  // Search
  const search = $("marketSearch");

  if (search) {
    search.addEventListener(
      "input",
      searchProducts
    );
  }

  // Buttons
  const draftBtn = $("saveDraftBtn");

  if (draftBtn) {
    draftBtn.onclick = () =>
      saveProduct(false);
  }

  const publishBtn = $("publishBtn");

  if (publishBtn) {
    publishBtn.onclick = () =>
      saveProduct(true);
  }

  const newProductBtn =
    $("newProductBtn");

  if (newProductBtn) {
    newProductBtn.onclick = () => {
      clearCreateForm();
      openPage("createPage");
    };
  }

  const marketplaceBtn =
    $("marketplaceBtn");

  if (marketplaceBtn) {
    marketplaceBtn.onclick = () => {
      loadMarketplace();
      openPage("marketplacePage");
    };
  }

  await checkUser();

  if (currentUser) {
    await loadMyOrders();
  }

  // Buka produk dari URL jika ada
  const params =
    new URLSearchParams(
      window.location.search
    );

  const productId =
    params.get("product");

  if (productId) {
    await openProduct(productId);
  }
});
