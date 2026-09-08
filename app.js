/* =====================================================
   60DETIK V0.4
   SUPABASE + CREATOR + MARKETPLACE
   ===================================================== */


/* =====================================================
   1. SUPABASE CONFIG
   ===================================================== */

const SUPABASE_URL = "https://crbobpsgaryhqcinfeow.supabase.co";

const SUPABASE_KEY = "sb_publishable_35Owtv9UK_5i7MCeN2jnFQ_agbwLkkh";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =====================================================
   2. GLOBAL STATE
   ===================================================== */

let currentUser = null;
let products = [];
let authMode = "login";


/* =====================================================
   3. START APP
   ===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  await checkUser();

  await loadMarketplace();

  updateUI();

});


/* =====================================================
   4. CHECK LOGIN
   ===================================================== */

async function checkUser() {

  const {
    data,
    error
  } = await supabaseClient.auth.getUser();

  if (error) {

    console.log(error);

    currentUser = null;

    return;
  }

  currentUser = data.user || null;
}


/* =====================================================
   5. AUTH MODE
   ===================================================== */

function openAuth() {

  authMode = "login";

  updateAuthUI();

  openPage("auth");
}


function toggleAuthMode() {

  authMode =
    authMode === "login"
      ? "register"
      : "login";

  updateAuthUI();
}


function updateAuthUI() {

  const title =
    document.getElementById("authTitle");

  const subtitle =
    document.getElementById("authSubtitle");

  const name =
    document.getElementById("authName");

  const submit =
    document.getElementById("authSubmit");

  const toggle =
    document.getElementById("authToggle");


  if (authMode === "login") {

    title.textContent = "Masuk";

    subtitle.textContent =
      "Masuk ke akun Creator kamu.";

    name.classList.add("hidden");

    submit.textContent = "Masuk";

    toggle.textContent =
      "Belum punya akun? Daftar";

  } else {

    title.textContent = "Daftar";

    subtitle.textContent =
      "Buat akun Creator 60DETIK.";

    name.classList.remove("hidden");

    submit.textContent = "Buat Akun";

    toggle.textContent =
      "Sudah punya akun? Masuk";
  }

}


/* =====================================================
   6. LOGIN / REGISTER
   ===================================================== */

async function submitAuth() {

  const email =
    document.getElementById("authEmail")
      .value
      .trim();

  const password =
    document.getElementById("authPassword")
      .value;

  const name =
    document.getElementById("authName")
      .value
      .trim();


  if (!email || !password) {

    alert("Email dan password wajib diisi.");

    return;
  }


  if (authMode === "register") {

    if (!name) {

      alert("Masukkan nama kamu.");

      return;
    }


    if (password.length < 6) {

      alert("Password minimal 6 karakter.");

      return;
    }


    const {
      data,
      error
    } = await supabaseClient.auth.signUp({

      email: email,

      password: password

    });


    if (error) {

      alert(error.message);

      return;
    }


    if (!data.user) {

      alert(
        "Pendaftaran berhasil. Silakan cek email untuk verifikasi."
      );

      return;
    }


    await createProfile(
      data.user.id,
      name
    );


    currentUser = data.user;


    alert("Akun berhasil dibuat.");

    updateUI();

    openPage("dashboard");

  } else {


    const {
      data,
      error
    } = await supabaseClient.auth.signInWithPassword({

      email: email,

      password: password

    });


    if (error) {

      alert(error.message);

      return;
    }


    currentUser = data.user;

    updateUI();

    await loadMyProducts();

    openPage("dashboard");
  }

}


/* =====================================================
   7. CREATE PROFILE
   ===================================================== */

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

      username:
        name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 30),

      display_name: name

    });


  if (error) {

    console.log(
      "Profile error:",
      error
    );
  }

}


/* =====================================================
   8. LOGOUT
   ===================================================== */

async function logout() {

  await supabaseClient.auth.signOut();

  currentUser = null;

  products = [];

  updateUI();

  openPage("home");

}


/* =====================================================
   9. UI USER
   ===================================================== */

function updateUI() {

  const authButton =
    document.getElementById("authButton");


  const loginRequired =
    document.getElementById("loginRequired");

  const createForm =
    document.getElementById("createForm");


  if (currentUser) {

    authButton.textContent = "Keluar";

    authButton.onclick = logout;

    loginRequired.classList.add("hidden");

    createForm.classList.remove("hidden");

  } else {

    authButton.textContent = "Masuk";

    authButton.onclick = openAuth;

    loginRequired.classList.remove("hidden");

    createForm.classList.add("hidden");
  }

}


/* =====================================================
   10. PAGE NAVIGATION
   ===================================================== */

function openPage(pageId) {

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove("active");

    });


  const page =
    document.getElementById(pageId);


  if (page) {

    page.classList.add("active");

    window.scrollTo(0,0);
  }


  if (pageId === "marketplace") {

    loadMarketplace();

  }


  if (pageId === "dashboard") {

    if (!currentUser) {

      openAuth();

      return;
    }

    loadMyProducts();

  }

}


/* =====================================================
   11. SAVE PRODUCT
   ===================================================== */

async function saveProduct(publish) {

  if (!currentUser) {

    alert("Silakan masuk terlebih dahulu.");

    openAuth();

    return;
  }


  const skill =
    document.getElementById("skill")
      .value
      .trim();

  const target =
    document.getElementById("target")
      .value
      .trim();

  const type =
    document.getElementById("productType")
      .value;

  const price =
    Number(
      document.getElementById("price")
        .value
    );

  const title =
    document.getElementById("title")
      .value
      .trim();

  const description =
    document.getElementById("description")
      .value
      .trim();


  if (!skill ||
      !target ||
      !title ||
      !description) {

    alert(
      "Lengkapi semua informasi produk."
    );

    return;
  }


  if (!price || price < 0) {

    alert("Masukkan harga yang valid.");

    return;
  }


  const {
    data,
    error
  } = await supabaseClient
    .from("products")
    .insert({

      creator_id:
        currentUser.id,

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

    console.error(error);

    alert(
      "Gagal menyimpan produk: " +
      error.message
    );

    return;
  }


  showResult(data);

  clearCreateForm();

  await loadMarketplace();

  await loadMyProducts();

  openPage("result");

}


/* =====================================================
   12. RESULT
   ===================================================== */

function showResult(product) {

  const container =
    document.getElementById(
      "resultContent"
    );


  container.innerHTML = `

    <div class="success">

      <div class="product-type">
        ${escapeHTML(product.type)}
      </div>

      <h3>
        ${escapeHTML(product.title)}
      </h3>

      <div class="price">
        ${formatRupiah(product.price)}
      </div>

      <p>
        ${
          product.published
            ? "Produk sudah dipublikasikan ke Marketplace."
            : "Produk tersimpan sebagai draft."
        }
      </p>

    </div>

  `;
}


/* =====================================================
   13. CLEAR FORM
   ===================================================== */

function clearCreateForm() {

  document.getElementById("skill").value = "";

  document.getElementById("target").value = "";

  document.getElementById("price").value = "";

  document.getElementById("title").value = "";

  document.getElementById("description").value = "";

}


/* =====================================================
   14. LOAD MARKETPLACE
   ===================================================== */

async function loadMarketplace() {

  const container =
    document.getElementById(
      "marketplaceList"
    );


  if (!container) return;


  container.innerHTML =
    `<div class="loading">
      Memuat marketplace...
    </div>`;


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

    console.error(error);

    container.innerHTML =
      `<div class="loading">
        Gagal memuat marketplace.
      </div>`;

    return;
  }


  products = data || [];

  renderMarketplace(products);

}


/* =====================================================
   15. RENDER MARKETPLACE
   ===================================================== */

function renderMarketplace(
  list
) {

  const container =
    document.getElementById(
      "marketplaceList"
    );


  if (!list.length) {

    container.innerHTML =
      `<div class="loading">
        Belum ada produk.
      </div>`;

    return;
  }


  container.innerHTML =
    list.map(product => `

      <div
        class="product-card"
        onclick="openProduct('${product.id}')"
      >

        <div class="product-type">
          ${escapeHTML(product.type)}
        </div>

        <h3>
          ${escapeHTML(product.title)}
        </h3>

        <p>
          ${escapeHTML(
            product.description
          )}
        </p>

        <div class="price">
          ${formatRupiah(product.price)}
        </div>

        <div class="meta">
          Creator:
          ${
            escapeHTML(
              product.profiles?.display_name ||
              "Creator"
            )
          }
        </div>

      </div>

    `)
    .join("");

}


/* =====================================================
   16. SEARCH
   ===================================================== */

function searchProducts() {

  const keyword =
    document.getElementById(
      "searchInput"
    )
    .value
    .toLowerCase()
    .trim();


  if (!keyword) {

    renderMarketplace(products);

    return;
  }


  const filtered =
    products.filter(product => {

      return (

        product.title
          ?.toLowerCase()
          .includes(keyword)

        ||

        product.description
          ?.toLowerCase()
          .includes(keyword)

        ||

        product.skill
          ?.toLowerCase()
          .includes(keyword)

        ||

        product.target
          ?.toLowerCase()
          .includes(keyword)

      );

    });


  renderMarketplace(filtered);

}


/* =====================================================
   17. OPEN PRODUCT
   ===================================================== */

async function openProduct(id) {

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
    .eq("id", id)
    .single();


  if (error) {

    alert("Produk tidak ditemukan.");

    return;
  }


  const container =
    document.getElementById(
      "productDetailContent"
    );


  container.innerHTML = `

    <div class="detail-box">

      <div class="product-type">
        ${escapeHTML(productType(data))}
      </div>

      <h1>
        ${escapeHTML(data.title)}
      </h1>

      <div class="creator">
        Oleh
        ${
          escapeHTML(
            data.profiles?.display_name ||
            "Creator"
          )
        }
      </div>

      <div class="price">
        ${formatRupiah(data.price)}
      </div>

      <p>
        ${escapeHTML(data.description)}
      </p>

      <div class="meta">
        Keahlian:
        ${escapeHTML(data.skill || "-")}
      </div>

      <div class="meta">
        Untuk:
        ${escapeHTML(data.target || "-")}
      </div>

      <button
        class="primary-btn"
        onclick="simulateBuy('${data.id}')"
      >
        BELI PRODUK
      </button>

      <button
        class="secondary-btn"
        onclick="joinReseller('${data.id}')"
      >
        JUAL PRODUK INI
      </button>

    </div>

  `;


  openPage("productDetail");

}


/* =====================================================
   18. BUY DEMO
   ===================================================== */

function simulateBuy(id) {

  alert(
    "Pembelian belum menggunakan pembayaran nyata.\n\n" +
    "Fitur pembayaran akan kita buat pada tahap berikutnya."
  );

}


/* =====================================================
   19. RESELLER DEMO
   ===================================================== */

function joinReseller(id) {

  alert(
    "Sistem reseller akan kita aktifkan pada V0.8.\n\n" +
    "Untuk sekarang tombol ini masih simulasi."
  );

}


/* =====================================================
   20. MY PRODUCTS
   ===================================================== */

async function loadMyProducts() {

  if (!currentUser) return;


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

    console.error(error);

    return;
  }


  renderMyProducts(
    data || []
  );


  updateStats(
    data || []
  );


  await loadProfile();

}


/* =====================================================
   21. RENDER MY PRODUCTS
   ===================================================== */

function renderMyProducts(
  list
) {

  const container =
    document.getElementById(
      "myProducts"
    );


  if (!list.length) {

    container.innerHTML =
      `<div class="loading">
        Kamu belum membuat produk.
      </div>`;

    return;
  }


  container.innerHTML =
    list.map(product => `

      <div class="product-card">

        <div class="product-type">
          ${escapeHTML(product.type)}
        </div>

        <h3>
          ${escapeHTML(product.title)}
        </h3>

        <div class="price">
          ${formatRupiah(product.price)}
        </div>

        <div class="meta">
          ${
            product.published
              ? "● Published"
              : "○ Draft"
          }
        </div>

        <div class="meta">
          Penjualan:
          ${product.sales || 0}
        </div>

      </div>

    `)
    .join("");

}


/* =====================================================
   22. STATS
   ===================================================== */

function updateStats(
  list
) {

  document.getElementById(
    "statProducts"
  ).textContent =
    list.length;


  document.getElementById(
    "statPublished"
  ).textContent =
    list.filter(
      p => p.published
    ).length;


  document.getElementById(
    "statSales"
  ).textContent =
    list.reduce(
      (total, p) =>
        total + (p.sales || 0),
      0
    );

}


/* =====================================================
   23. PROFILE
   ===================================================== */

async function loadProfile() {

  if (!currentUser) return;


  const {
    data,
    error
  } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq(
      "id",
      currentUser.id
    )
    .maybeSingle();


  if (error) {

    console.log(error);

    return;
  }


  const profileInfo =
    document.getElementById(
      "profileInfo"
    );


  if (data) {

    profileInfo.textContent =
      data.display_name ||
      currentUser.email;

  } else {

    profileInfo.textContent =
      currentUser.email;
  }

}


/* =====================================================
   24. HELPERS
   ===================================================== */

function formatRupiah(
  value
) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(value || 0);

}


function escapeHTML(
  value
) {

  if (value === null ||
      value === undefined) {

    return "";

  }


  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function productType(
  product
) {

  return product.type || "Produk";

}


/* =====================================================
   END
   ===================================================== */
