/* =========================================
   60DETIK V0.3
========================================= */

let products = [];

let currentProduct = null;

let selectedProduct = null;


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProducts();

        renderProducts();

        renderMarketplace();

        updateStats();

        loadProductFromUrl();

    }
);


/* =========================================
   PAGE NAVIGATION
========================================= */

function showPage(pageId) {

    const pages =
        document.querySelectorAll(".page");


    pages.forEach(function (page) {

        page.classList.remove("active");

    });


    const selected =
        document.getElementById(pageId);


    if (!selected) {
        return;
    }


    selected.classList.add("active");


    updateNavigation(pageId);


    if (pageId === "marketplace") {

        renderMarketplace();

    }


    if (pageId === "dashboard") {

        renderProducts();

        updateStats();

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   NAVIGATION
========================================= */

function updateNavigation(pageId) {

    const ids = [
        "navHome",
        "navCreate",
        "navIdea",
        "navMarketplace"
    ];


    ids.forEach(function (id) {

        const button =
            document.getElementById(id);

        if (button) {

            button.classList.remove(
                "navActive"
            );

        }

    });


    let activeId;


    if (pageId === "home") {

        activeId = "navHome";

    } else if (pageId === "create") {

        activeId = "navCreate";

    } else if (pageId === "idea") {

        activeId = "navIdea";

    } else if (
        pageId === "marketplace" ||
        pageId === "productDetail"
    ) {

        activeId = "navMarketplace";

    }


    if (activeId) {

        const button =
            document.getElementById(
                activeId
            );

        if (button) {

            button.classList.add(
                "navActive"
            );

        }

    }

}


/* =========================================
   GENERATE PRODUCT
========================================= */

function generateProduct() {

    const skill =
        document
            .getElementById("skill")
            .value
            .trim();


    const target =
        document
            .getElementById("target")
            .value
            .trim();


    const type =
        document
            .getElementById("productType")
            .value;


    const price =
        Number(
            document
                .getElementById("productPrice")
                .value
        );


    if (!skill) {

        alert(
            "Tulis dulu keahlian yang kamu punya."
        );

        return;

    }


    if (!target) {

        alert(
            "Tulis siapa yang membutuhkan produk ini."
        );

        return;

    }


    if (price < 0 || isNaN(price)) {

        alert(
            "Masukkan harga yang benar."
        );

        return;

    }


    const title =
        createTitle(
            skill,
            type
        );


    const description =
        createDescription(
            skill,
            target,
            type
        );


    currentProduct = {

        id: createProductId(),

        title: title,

        skill: skill,

        target: target,

        type: type,

        price: price,

        description: description,

        createdAt:
            new Date().toISOString(),

        published: false,

        sales: 0,

        resellerCount: 0

    };


    document.getElementById(
        "resultTitle"
    ).textContent =
        title;


    document.getElementById(
        "resultTitle2"
    ).textContent =
        title;


    document.getElementById(
        "resultTarget"
    ).textContent =
        "Untuk " + target;


    document.getElementById(
        "resultDescription"
    ).textContent =
        description;


    document.getElementById(
        "resultPrice"
    ).textContent =
        formatRupiah(price);


    showPage("result");

}


/* =========================================
   TITLE
========================================= */

function createTitle(
    skill,
    type
) {

    const clean =
        capitalize(skill);


    const titles = {

        Ebook:
            "Panduan " +
            clean +
            " untuk Pemula",

        Panduan:
            "Panduan Praktis " +
            clean,

        Checklist:
            "Checklist " +
            clean +
            " Anti Bingung",

        Template:
            "Template Siap Pakai " +
            clean,

        Worksheet:
            "Worksheet " +
            clean +
            " untuk Pemula"

    };


    return (
        titles[type] ||
        "Panduan " + clean
    );

}


/* =========================================
   DESCRIPTION
========================================= */

function createDescription(
    skill,
    target,
    type
) {

    return (
        type +
        " praktis tentang " +
        skill +
        " yang dibuat untuk " +
        target +
        ". Berisi langkah sederhana, " +
        "tips penting, dan cara mulai " +
        "mempraktikkannya."
    );

}


/* =========================================
   IDEKAN
========================================= */

function generateIdeas() {

    const skill =
        document
            .getElementById("ideaSkill")
            .value
            .trim();


    const results =
        document.getElementById(
            "ideaResults"
        );


    if (!skill) {

        alert(
            "Tulis dulu keahlianmu."
        );

        return;

    }


    const clean =
        capitalize(skill);


    const ideas = [

        {
            title:
                "Panduan " +
                clean +
                " untuk Pemula",

            description:
                "Panduan sederhana dari dasar hingga langkah pertama."
        },

        {
            title:
                "30 Kesalahan dalam " +
                clean +
                " yang Harus Dihindari",

            description:
                "Kumpulan kesalahan umum beserta cara menghindarinya."
        },

        {
            title:
                "Checklist " +
                clean +
                " Siap Pakai",

            description:
                "Checklist praktis agar pengguna bisa mengikuti proses dengan mudah."
        },

        {
            title:
                "Template " +
                clean +
                " untuk Pemula",

            description:
                "Template yang bisa langsung digunakan dan disesuaikan."
        },

        {
            title:
                "7 Hari Belajar " +
                clean,

            description:
                "Rencana belajar sederhana selama tujuh hari."
        }

    ];


    results.innerHTML = "";


    ideas.forEach(
        function (idea) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "ideaCard";


            card.innerHTML = `

                <h3>
                    ${escapeHtml(
                        idea.title
                    )}
                </h3>

                <p>
                    ${escapeHtml(
                        idea.description
                    )}
                </p>

                <button
                    class="secondary full"
                    onclick="useIdea('${escapeAttribute(
                        idea.title
                    )}')"
                >
                    ⚡ BUAT PRODUK INI
                </button>

            `;


            results.appendChild(
                card
            );

        }
    );

}


/* =========================================
   USE IDEA
========================================= */

function useIdea(title) {

    document.getElementById(
        "skill"
    ).value = title;


    document.getElementById(
        "target"
    ).value =
        "pemula";


    showPage("create");

}


/* =========================================
   PUBLISH
========================================= */

function publishProduct() {

    if (!currentProduct) {

        alert(
            "Tidak ada produk."
        );

        return;

    }


    currentProduct.published = true;


    products.push(
        currentProduct
    );


    saveProducts();


    renderProducts();

    renderMarketplace();

    updateStats();


    const link =
        createProductLink(
            currentProduct.id
        );


    document.getElementById(
        "publishedProductName"
    ).textContent =
        currentProduct.title;


    document.getElementById(
        "productLink"
    ).textContent =
        link;


    showPage("published");


    currentProduct = null;

}


/* =========================================
   MARKETPLACE
========================================= */

function renderMarketplace(
    searchTerm = ""
) {

    const container =
        document.getElementById(
            "marketplaceList"
        );


    if (!container) {
        return;
    }


    const query =
        String(searchTerm)
            .toLowerCase()
            .trim();


    let visibleProducts =
        products.filter(
            function (product) {

                if (!product.published) {
                    return false;
                }


                if (!query) {
                    return true;
                }


                const text =
                    (
                        product.title +
                        " " +
                        product.description +
                        " " +
                        product.type +
                        " " +
                        product.target
                    ).toLowerCase();


                return text.includes(query);

            }
        );


    if (
        visibleProducts.length === 0
    ) {

        container.innerHTML = `

            <div class="marketEmpty">

                <div class="emptyIcon">
                    🛒
                </div>

                <h3>
                    Belum ada produk
                </h3>

                <p>
                    Buat produk pertama untuk
                    mengisi marketplace.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    visibleProducts
        .slice()
        .reverse()
        .forEach(
            function (product) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "marketCard";


                card.innerHTML = `

                    <div class="marketCardTop">

                        <div>

                            <span class="marketType">
                                ${escapeHtml(
                                    product.type
                                )}
                            </span>

                            <h3>
                                ${escapeHtml(
                                    product.title
                                )}
                            </h3>

                        </div>

                        <div class="marketPrice">
                            ${formatRupiah(
                                product.price
                            )}
                        </div>

                    </div>

                    <p>
                        ${escapeHtml(
                            product.description
                        )}
                    </p>

                    <button
                        class="primary full"
                        onclick="openProduct(
                            '${escapeAttribute(
                                product.id
                            )}'
                        )"
                    >
                        LIHAT PRODUK
                    </button>

                `;


                container.appendChild(
                    card
                );

            }
        );

}


/* =========================================
   SEARCH
========================================= */

function searchMarketplace() {

    const input =
        document.getElementById(
            "marketSearch"
        );


    renderMarketplace(
        input ? input.value : ""
    );

}


/* =========================================
   OPEN PRODUCT
========================================= */

function openProduct(id) {

    const product =
        products.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!product) {

        alert(
            "Produk tidak ditemukan."
        );

        return;

    }


    selectedProduct =
        product;


    document.getElementById(
        "detailTitle"
    ).textContent =
        product.title;


    document.getElementById(
        "detailTitle2"
    ).textContent =
        product.title;


    document.getElementById(
        "detailTarget"
    ).textContent =
        "Untuk " +
        product.target;


    document.getElementById(
        "detailDescription"
    ).textContent =
        product.description;


    document.getElementById(
        "detailPrice"
    ).textContent =
        formatRupiah(
            product.price
        );


    showPage(
        "productDetail"
    );

}


/* =========================================
   SIMULATE BUY
========================================= */

function simulateBuy() {

    if (!selectedProduct) {

        alert(
            "Produk belum dipilih."
        );

        return;

    }


    alert(
        "DEMO 60DETIK\n\n" +
        "Pembelian belum aktif.\n\n" +
        "Pada versi berikutnya kita akan " +
        "menghubungkan pembayaran dan " +
        "pengiriman produk otomatis."
    );

}


/* =========================================
   RESELLER
========================================= */

function joinReseller() {

    if (!selectedProduct) {

        alert(
            "Produk belum dipilih."
        );

        return;

    }


    selectedProduct.resellerCount =
        Number(
            selectedProduct.resellerCount || 0
        ) + 1;


    saveProducts();


    alert(
        "🚀 MODE RESELLER DEMO\n\n" +
        "Kamu sekarang menjadi reseller " +
        "produk ini.\n\n" +
        "Komisi simulasi: 20%\n\n" +
        "Sistem komisi sungguhan akan " +
        "ditambahkan pada versi berikutnya."
    );

}


/* =========================================
   COPY
========================================= */

function copyProductLink() {

    const link =
        document.getElementById(
            "productLink"
        ).textContent;


    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        navigator.clipboard
            .writeText(link)
            .then(
                function () {

                    alert(
                        "Link berhasil disalin!"
                    );

                }
            )
            .catch(
                function () {

                    fallbackCopy(link);

                }
            );

    } else {

        fallbackCopy(link);

    }

}


function fallbackCopy(text) {

    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.value =
        text;


    document.body.appendChild(
        textarea
    );


    textarea.select();


    try {

        document.execCommand(
            "copy"
        );

        alert(
            "Link berhasil disalin!"
        );

    } catch (error) {

        alert(
            "Silakan salin link secara manual."
        );

    }


    document.body.removeChild(
        textarea
    );

}


/* =========================================
   SHARE
========================================= */

function shareProduct() {

    const link =
        document.getElementById(
            "productLink"
        ).textContent;


    const name =
        document.getElementById(
            "publishedProductName"
        ).textContent;


    const text =
        "Lihat produk digital saya di 60DETIK: " +
        name;


    if (
        navigator.share
    ) {

        navigator.share({

            title: name,

            text: text,

            url: link

        }).catch(
            function () {}
        );

    } else {

        copyProductLink();

    }

}


/* =========================================
   LOCAL STORAGE
========================================= */

function saveProducts() {

    try {

        localStorage.setItem(
            "60detik_products",
            JSON.stringify(products)
        );

    } catch (error) {

        console.error(error);

    }

}


function loadProducts() {

    try {

        const saved =
            localStorage.getItem(
                "60detik_products"
            );


        if (saved) {

            products =
                JSON.parse(saved);

        }

    } catch (error) {

        products = [];

    }

}


/* =========================================
   PRODUCT LIST
========================================= */

function renderProducts() {

    const container =
        document.getElementById(
            "productList"
        );


    if (!container) {
        return;
    }


    if (products.length === 0) {

        container.innerHTML = `

            <div class="empty">

                <div class="emptyIcon">
                    📦
                </div>

                <h3>
                    Belum ada produk
                </h3>

                <p>
                    Buat produk pertamamu sekarang.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    products
        .slice()
        .reverse()
        .forEach(
            function (product) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "productCard";


                card.innerHTML = `

                    <div class="productCardTop">

                        <div>

                            <h3>
                                ${escapeHtml(
                                    product.title
                                )}
                            </h3>

                            <span class="productType">
                                ${escapeHtml(
                                    product.type
                                )}
                            </span>

                        </div>

                        <div class="productPrice">
                            ${formatRupiah(
                                product.price
                            )}
                        </div>

                    </div>

                    <div class="productStatus">

                        <span>
                            ✓ Terbit
                        </span>

                        <span>
                            Terjual:
                            ${product.sales || 0}
                        </span>

                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );

}


/* =========================================
   STATS
========================================= */

function updateStats() {

    const count =
        products.length;


    const sales =
        products.reduce(
            function (
                total,
                product
            ) {

                return (
                    total +
                    Number(
                        product.sales || 0
                    )
                );

            },
            0
        );


    const income =
        products.reduce(
            function (
                total,
                product
            ) {

                return (
                    total +
                    Number(
                        product.price || 0
                    ) *
                    Number(
                        product.sales || 0
                    )
                );

            },
            0
        );


    const countElement =
        document.getElementById(
            "productCount"
        );


    const salesElement =
        document.getElementById(
            "salesCount"
        );


    const incomeElement =
        document.getElementById(
            "income"
        );


    if (countElement) {

        countElement.textContent =
            count;

    }


    if (salesElement) {

        salesElement.textContent =
            sales;

    }


    if (incomeElement) {

        incomeElement.textContent =
            formatRupiah(
                income
            );

    }

}


/* =========================================
   HELPERS
========================================= */

function formatRupiah(number) {

    return (
        "Rp" +
        Number(number || 0)
            .toLocaleString(
                "id-ID"
            )
    );

}


function capitalize(text) {

    if (!text) {
        return "";
    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


function createProductId() {

    return (
        Date.now()
            .toString()
            .slice(-8) +
        Math.floor(
            Math.random() * 100
        )
            .toString()
            .padStart(2, "0")
    );

}


function createProductLink(id) {

    return (
        window.location.origin +
        window.location.pathname +
        "?product=" +
        encodeURIComponent(id)
    );

}


function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML;

}


function escapeAttribute(text) {

    return String(text)
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        );

}


/* =========================================
   URL PRODUCT
========================================= */

function loadProductFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get(
            "product"
        );


    if (!id) {
        return;
    }


    const product =
        products.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!product) {
        return;
    }


    openProduct(id);

       }
