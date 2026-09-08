/* =========================================
   60DETIK V0.2
   APPLICATION
========================================= */


/* =========================================
   DATA
========================================= */

let products = [];

let currentProduct = null;


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProducts();

        renderProducts();

        updateStats();

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


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   NAVIGATION ACTIVE
========================================= */

function updateNavigation(pageId) {

    const buttons = {

        home: "navHome",

        create: "navCreate",

        idea: "navIdea",

        dashboard: "navDashboard"

    };


    Object.values(buttons).forEach(
        function (id) {

            const button =
                document.getElementById(id);

            if (button) {

                button.classList.remove(
                    "navActive"
                );

            }

        }
    );


    let navPage = pageId;


    if (
        pageId === "result" ||
        pageId === "published"
    ) {

        navPage = "dashboard";

    }


    const activeId =
        buttons[navPage];


    if (activeId) {

        const activeButton =
            document.getElementById(activeId);

        if (activeButton) {

            activeButton.classList.add(
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


    if (!price || price < 0) {

        alert(
            "Masukkan harga produk yang benar."
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

        sales: 0

    };


    document.getElementById(
        "resultTitle"
    ).textContent = title;


    document.getElementById(
        "resultTitle2"
    ).textContent = title;


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
   CREATE TITLE
========================================= */

function createTitle(
    skill,
    type
) {

    const cleanSkill =
        capitalize(skill);


    const titles = {

        Ebook:
            "Panduan " +
            cleanSkill +
            " untuk Pemula",

        Panduan:
            "Panduan Praktis " +
            cleanSkill,

        Checklist:
            "Checklist " +
            cleanSkill +
            " Anti Bingung",

        Template:
            "Template Siap Pakai " +
            cleanSkill,

        Worksheet:
            "Worksheet " +
            cleanSkill +
            " untuk Pemula"

    };


    return (
        titles[type] ||
        "Panduan " + cleanSkill
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
        ". " +
        "Berisi langkah sederhana, " +
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


    const cleanSkill =
        capitalize(skill);


    const ideas = [

        {
            title:
                "Panduan " +
                cleanSkill +
                " untuk Pemula",

            description:
                "Panduan sederhana dari dasar " +
                "hingga langkah pertama."
        },


        {
            title:
                "30 Kesalahan dalam " +
                cleanSkill +
                " yang Harus Dihindari",

            description:
                "Kumpulan kesalahan umum " +
                "beserta cara menghindarinya."
        },


        {
            title:
                "Checklist " +
                cleanSkill +
                " Siap Pakai",

            description:
                "Checklist praktis agar pengguna " +
                "bisa mengikuti proses dengan mudah."
        },


        {
            title:
                "Template " +
                cleanSkill +
                " untuk Pemula",

            description:
                "Template yang bisa langsung " +
                "digunakan dan disesuaikan."
        },


        {
            title:
                "7 Hari Belajar " +
                cleanSkill,

            description:
                "Rencana belajar sederhana " +
                "selama tujuh hari."
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


            results.appendChild(card);

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
            "Tidak ada produk yang sedang dibuat."
        );

        return;

    }


    currentProduct.published = true;


    products.push(currentProduct);


    saveProducts();


    renderProducts();


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
   COPY LINK
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


    textarea.value = text;


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


    const shareText =
        "Lihat produk digital saya di 60DETIK: " +
        name +
        "\n" +
        link;


    if (
        navigator.share
    ) {

        navigator.share({

            title: name,

            text: shareText,

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

        console.error(
            "Gagal menyimpan produk:",
            error
        );

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

        console.error(
            "Gagal membaca produk:",
            error
        );

    }

}


/* =========================================
   RENDER PRODUCTS
========================================= */

function renderProducts() {

    const container =
        document.getElementById(
            "productList"
        );


    if (!container) {

        return;

    }


    if (
        !products ||
        products.length === 0
    ) {

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

                            <span
                                class="productType"
                            >
                                ${escapeHtml(
                                    product.type
                                )}
                            </span>

                        </div>

                        <div
                            class="productPrice"
                        >
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
                    (
                        Number(
                            product.price || 0
                        ) *
                        Number(
                            product.sales || 0
                        )
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
            formatRupiah(income);

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

    const time =
        Date.now()
            .toString()
            .slice(-6);


    const random =
        Math.floor(
            Math.random() * 100
        )
            .toString()
            .padStart(
                2,
                "0"
            );


    return (
        time +
        random
    );

}


function createProductLink(id) {

    /*
       Untuk prototype GitHub,
       link dibuat berdasarkan URL
       repository saat ini.

       Nanti pada versi server,
       ini akan diganti menjadi:
       https://60detik.app/p/xxxxx
    */

    const base =
        window.location.origin +
        window.location.pathname
            .replace(
                /\/[^\/]*$/,
                "/"
            );


    return (
        base +
        "?product=" +
        id
    );

}


/* =========================================
   SECURITY HELPERS
========================================= */

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
        )
        .replace(
            /"/g,
            "&quot;"
        );

}


/* =========================================
   DEMO PRODUCT URL
========================================= */

function loadProductFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get(
            "product"
        );


    if (!productId) {

        return;

    }


    const product =
        products.find(
            function (item) {

                return (
                    item.id === productId
                );

            }
        );


    if (!product) {

        return;

    }


    document.getElementById(
        "resultTitle"
    ).textContent =
        product.title;


    document.getElementById(
        "resultTitle2"
    ).textContent =
        product.title;


    document.getElementById(
        "resultTarget"
    ).textContent =
        "Untuk " +
        product.target;


    document.getElementById(
        "resultDescription"
    ).textContent =
        product.description;


    document.getElementById(
        "resultPrice"
    ).textContent =
        formatRupiah(
            product.price
        );


    showPage("result");

}


/* =========================================
   INITIAL URL LOAD
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setTimeout(
            function () {

                loadProductFromUrl();

            },
            100
        );

    }
);
