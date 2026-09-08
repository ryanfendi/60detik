// =====================================================
// 60DETIK V0.5 - FINAL COMPATIBLE
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


// =====================================================
// HELPERS
// =====================================================

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

function productEmoji(type) {
  const t = String(type || "").toLowerCase();

  if (t.includes("ebook")) return "📘";
  if (t.includes("panduan")) return "📚";
  if (t.includes("checklist")) return "✅";
  if (t.includes("template")) return "📄";
  if (t.includes("worksheet")) return "📝";

  return "💡";
}


// =====================================================
// NAVIGATION
// =====================================================

function openPage(pageId) {
  document
    .querySelectorAll(".page")
    .forEach(page => {
      page.classList.remove("active");
    });

  const page = $(pageId);

  if (page) {
    page.classList.add("active");
    window.scrollTo(0, 0);
  }

  updateUI();
}


// =====================================================
// AUTH
// =====================================================

async function checkUser() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  currentUser = session?.user || null;

  updateUI();

  if (currentUser) {
    await loadProfile();
    await loadMarketplace();
    await loadMyProducts();
  }
}

supabaseClient.auth.onAuthStateChange(
  (_event, session) => {
    currentUser = session?.user || null;
    updateUI();
  }
);

function updateUI() {
  const button = $("authButton");

  if (!button) return;

  if (currentUser) {
    button.textContent = "Keluar";
    button.onclick = logout;
  } else {
    button.textContent = "Masuk";
    button.onclick = openAuth;
  }

  const createForm = $("createForm");
  const loginRequired = $("loginRequired");

  if (createForm && loginRequired) {
    if (currentUser) {
      createForm.classList.remove("hidden");
      loginRequired.classList.add("hidden");
    } else {
      createForm.classList.add("hidden");
      loginRequired.classList.remove("hidden");
    }
  }
}

function openAuth() {
  openPage("auth");

  const title = $("authTitle");

  if (title) {
    title.textContent =
      authMode === "login"
        ? "Masuk"
        : "Daftar";
  }
}

function toggleAuthMode() {
  authMode =
    authMode === "login"
      ? "register"
      : "login";

  const title = $("authTitle");
  const subtitle = $("authSubtitle");
  const name = $("authName");
  const button = $("authSubmit");
  const toggle = $("authToggle");

  if (authMode === "login") {

    if (title)
      title.textContent = "Masuk";

    if (subtitle)
      subtitle.textContent =
        "Masuk ke akun Creator kamu.";

    if (name)
      name.classList.add("hidden");

    if (button)
      button.textContent = "Masuk";

    if (toggle)
      toggle.textContent =
        "Belum punya akun? Daftar";

  } else {

    if (title)
      title.textContent = "Daftar";

    if (subtitle)
      subtitle.textContent =
        "Buat akun Creator 60DETIK.";

    if (name)
      name.classList.remove("hidden");

    if (button)
      button.textContent = "Daftar";

    if (toggle)
      toggle.textContent =
        "Sudah punya akun? Masuk";
  }
}

async function submitAuth() {

  const email =
    $("authEmail")?.value.trim();

  const password =
    $("authPassword")?.value;

  const name =
    $("authName")?.value.trim() ||
    "Creator";

  if (!email || !password) {
    alert(
      "Email dan password wajib diisi."
    );
    return;
  }

  // ================= REGISTER =================

  if (authMode === "register") {

    const {
      data,
      error
    } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      alert(
        "Gagal daftar: " +
        error.message
      );
      return;
    }

    if (data.user) {
      await createProfile(
        data.user.id,
        name
      );
    }

    if (!data.session) {

      alert(
        "Akun berhasil dibuat.\n\n" +
        "Jika verifikasi email aktif, " +
        "silakan verifikasi email lalu masuk."
      );

      authMode = "login";
      toggleAuthMode();

      return;
    }

    currentUser = data.user;

    updateUI();

    await loadProfile();

    openPage("home");

    return;
  }


  // ================= LOGIN =================

  const {
    data,
    error
  } = await supabaseClient.auth
    .signInWithPassword({
      email,
      password
    });

  if (error) {
    alert(
      "Gagal masuk: " +
      error.message
    );
    return;
  }

  currentUser = data.user;

  updateUI();

  await loadProfile();
  await loadMarketplace();
  await loadMyProducts();

  openPage("home");
}


async function createProfile(
  userId,
  name
) {

  const {
    error
  } = await supabaseClient
    .from("profiles")
    .upsert({
      id: userId,
      display_name:
        name || "Creator"
    });

  if (error) {
    console.log(
      "Profile error:",
      error.message
    );
  }
}


async function logout() {

  await supabaseClient.auth.signOut();

  currentUser = null;

  updateUI();

  openPage("home");
}


// =====================================================
// PROFILE
// =====================================================

async function loadProfile() {

  if (!currentUser) return;

  const {
    data,
    error
  } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .maybeSingle();

  if (error) {
    console.log(error);
    return;
  }

  const name =
    data?.display_name ||
    currentUser.email
      ?.split("@")[0] ||
    "Creator";

  const profileInfo =
    $("profileInfo");

  if (profileInfo) {
    profileInfo.textContent =
      name +
      " • " +
      (currentUser.email || "");
  }
}


// =====================================================
// CREATE PRODUCT
// =====================================================

async function saveProduct(
  publish
) {

  const {
    data: {
      session
    }
  } = await supabaseClient.auth
    .getSession();

  const user =
    session?.user;

  if (!user) {

    alert(
      "Silakan masuk terlebih dahulu."
    );

    openAuth();

    return;
  }

  const skill =
    $("skill")?.value.trim();

  const target =
    $("target")?.value.trim();

  const type =
    $("productType")?.value;

  const price =
    Number(
      $("price")?.value || 0
    );

  const title =
    $("title")?.value.trim();

  const description =
    $("description")
      ?.value.trim();

  if (!skill) {
    alert("Keahlian wajib diisi.");
    return;
  }

  if (!title) {
    alert("Judul produk wajib diisi.");
    return;
  }

  if (price < 0) {
    alert("Harga tidak valid.");
    return;
  }

  const {
    data,
    error
  } = await supabaseClient
    .from("products")
    .insert({
      creator_id: user.id,
      title: title,
      skill: skill,
      target: target,
      type: type,
      price: price,
      description: description,
      published: publish,
      sales: 0,
      reseller_count: 0
    })
    .select()
    .single();

  if (error) {

    alert(
      "Gagal menyimpan produk: " +
      error.message
    );

    console.log(error);

    return;
  }

  currentProduct = data;

  await loadMarketplace();
  await loadMyProducts();

  showResult(
    data,
    publish
  );
}


function showResult(
  product,
  published
) {

  const content =
    $("resultContent");

  if (content) {

    content.innerHTML = `
      <div class="card">
        <h3>
          ${published
            ? "🚀 Produk berhasil dipublikasikan!"
            : "💾 Draft berhasil disimpan!"}
        </h3>

        <p>
          <strong>
            ${escapeHTML(product.title)}
          </strong>
        </p>

        <p>
          Harga:
          <strong>
            ${rupiah(product.price)}
          </strong>
        </p>

        <p>
          Status:
          <strong>
            ${published
              ? "Published"
              : "Draft"}
          </strong>
        </p>
      </div>
    `;
  }

  openPage("result");
}


// =====================================================
// MARKETPLACE
// =====================================================

async function loadMarketplace() {

  const {
    data,
    error
  } = await supabaseClient
    .from("products")
    .select(`
      *,
      profiles (
        display_name
      )
    `)
    .eq("published", true)
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (error) {

    console.log(
      "Marketplace:",
      error.message
    );

    return;
  }

  renderMarketplace(
    data || []
  );
}


function renderMarketplace(
  products
) {

  const list =
    $("marketplaceList");

  if (!list) return;

  if (!products.length) {

    list.innerHTML = `
      <div class="loading">
        Belum ada produk.
      </div>
    `;

    return;
  }

  list.innerHTML =
    products.map(p => `

      <div
        class="product-card"
        onclick="openProduct('${p.id}')"
      >

        <div class="product-cover">
          ${productEmoji(p.type)}
        </div>

        <div class="product-info">

          <small>
            ${escapeHTML(p.type)}
          </small>

          <h3>
            ${escapeHTML(p.title)}
          </h3>

          <p>
            ${escapeHTML(
              p.profiles?.display_name ||
              "Creator"
            )}
          </p>

          <div class="product-price">
            ${rupiah(p.price)}
          </div>

          <small>
            ${p.sales || 0} terjual
          </small>

        </div>

      </div>

    `).join("");
}


function searchProducts() {

  const input =
    $("searchInput");

  const query =
    input?.value
      .toLowerCase()
      .trim() || "";

  document
    .querySelectorAll(
      ".product-card"
    )
    .forEach(card => {

      card.style.display =
        card.textContent
          .toLowerCase()
          .includes(query)
          ? ""
          : "none";

    });
}


// =====================================================
// PRODUCT DETAIL
// =====================================================

async function openProduct(
  productId
) {

  const {
    data,
    error
  } = await supabaseClient
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

    alert(
      "Produk tidak ditemukan."
    );

    return;
  }

  currentProduct = data;

  const detail =
    $("productDetailContent");

  if (!detail) return;

  detail.innerHTML = `

    <div class="product-detail">

      <div class="product-cover large">
        ${productEmoji(data.type)}
      </div>

      <small>
        ${escapeHTML(data.type)}
      </small>

      <h1>
        ${escapeHTML(data.title)}
      </h1>

      <p>
        Creator:
        <strong>
          ${escapeHTML(
            data.profiles?.display_name ||
            "Creator"
          )}
        </strong>
      </p>

      <h2>
        ${rupiah(data.price)}
      </h2>

      <p>
        ${escapeHTML(
          data.description ||
          "Produk digital 60DETIK."
        )}
      </p>

      <p>
        ${data.sales || 0} terjual
      </p>

      <button
        class="primary-btn full"
        onclick="simulateBuy()"
      >
        🛒 Beli Produk
      </button>

      <button
        class="secondary-btn full"
        onclick="joinReseller()"
      >
        💰 Jual Produk Ini
      </button>

    </div>

  `;

  openPage("productDetail");
}


// =====================================================
// BUY / ORDER
// =====================================================

async function simulateBuy() {

  if (!currentProduct) {
    alert(
      "Produk belum dipilih."
    );
    return;
  }

  const {
    data: {
      session
    }
  } = await supabaseClient.auth
    .getSession();

  const buyer =
    session?.user;

  if (!buyer) {

    alert(
      "Silakan masuk terlebih dahulu."
    );

    openAuth();

    return;
  }

  if (
    buyer.id ===
    currentProduct.creator_id
  ) {

    alert(
      "Kamu tidak bisa membeli produk milik sendiri."
    );

    return;
  }

  const amount =
    Number(
      currentProduct.price || 0
    );

  const creatorAmount =
    Math.floor(
      amount * 0.70
    );

  const resellerAmount = 0;

  const platformAmount =
    amount -
    creatorAmount;

  const {
    data,
    error
  } = await supabaseClient
    .from("orders")
    .insert({
      product_id:
        currentProduct.id,

      buyer_id:
        buyer.id,

      reseller_id:
        null,

      amount:
        amount,

      creator_amount:
        creatorAmount,

      reseller_amount:
        resellerAmount,

      platform_amount:
        platformAmount,

      status:
        "pending"
    })
    .select()
    .single();

  if (error) {

    alert(
      "Gagal membuat order: " +
      error.message
    );

    console.log(error);

    return;
  }

  alert(
    "ORDER BERHASIL DIBUAT! 🎉\n\n" +
    "Nomor Order:\n" +
    data.id +
    "\n\n" +
    "Total: " +
    rupiah(amount) +
    "\n\n" +
    "Status: MENUNGGU PEMBAYARAN"
  );
}


// =====================================================
// RESELLER
// =====================================================

async function joinReseller() {

  if (!currentProduct) {
    alert(
      "Produk belum dipilih."
    );
    return;
  }

  const {
    data: {
      session
    }
  } = await supabaseClient.auth
    .getSession();

  const user =
    session?.user;

  if (!user) {

    alert(
      "Silakan masuk terlebih dahulu."
    );

    openAuth();

    return;
  }

  if (
    user.id ===
    currentProduct.creator_id
  ) {

    alert(
      "Creator tidak perlu menjadi reseller produknya sendiri."
    );

    return;
  }

  const shareUrl =
    window.location.origin +
    window.location.pathname +
    "?product=" +
    encodeURIComponent(
      currentProduct.id
    ) +
    "&ref=" +
    encodeURIComponent(
      user.id
    );

  try {

    await navigator.clipboard.writeText(
      shareUrl
    );

    alert(
      "LINK RESELLER BERHASIL DIBUAT! 🚀\n\n" +
      "Link sudah disalin.\n\n" +
      shareUrl
    );

  } catch {

    alert(
      "Link reseller kamu:\n\n" +
      shareUrl
    );
  }
}


// =====================================================
// CREATOR STUDIO
// =====================================================

async function loadMyProducts() {

  if (!currentUser)
    return;

  const {
    data,
    error
  } = await supabaseClient
    .from("products")
    .select("*")
    .eq(
      "creator_id",
      currentUser.id
    )
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (error) {

    console.log(
      "My products:",
      error.message
    );

    return;
  }

  renderMyProducts(
    data || []
  );

  updateStats(
    data || []
  );
}


function renderMyProducts(
  products
) {

  const box =
    $("myProducts");

  if (!box) return;

  if (!products.length) {

    box.innerHTML = `
      <div class="loading">
        Belum ada produk.
      </div>
    `;

    return;
  }

  box.innerHTML =
    products.map(p => `

      <div
        class="product-card"
        onclick="openProduct('${p.id}')"
      >

        <div class="product-cover">
          ${productEmoji(p.type)}
        </div>

        <div class="product-info">

          <small>
            ${p.published
              ? "PUBLISHED"
              : "DRAFT"}
          </small>

          <h3>
            ${escapeHTML(p.title)}
          </h3>

          <div class="product-price">
            ${rupiah(p.price)}
          </div>

        </div>

      </div>

    `).join("");
}


function updateStats(
  products
) {

  const total =
    products.length;

  const published =
    products.filter(
      p => p.published
    ).length;

  const sales =
    products.reduce(
      (sum, p) =>
        sum +
        Number(p.sales || 0),
      0
    );

  if ($("statProducts"))
    $("statProducts")
      .textContent = total;

  if ($("statPublished"))
    $("statPublished")
      .textContent = published;

  if ($("statSales"))
    $("statSales")
      .textContent = sales;
}


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await checkUser();

    await loadMarketplace();

    const params =
      new URLSearchParams(
        window.location.search
      );

    const productId =
      params.get("product");

    if (productId) {
      await openProduct(
        productId
      );
    }

  }
);
