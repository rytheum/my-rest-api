let id_el_list = "#product-list";

function getDataOnEnter(event) {
    if (event.keyCode == 13) {
        getData(1);
    }
}

function jumpToPage(page) {
    getData(parseInt(page));
}

function getData(toPage = 1) {
    let url = baseUrl + "/api/book";
    $('[name="_page"]').val(toPage);

    let payload = {
        _limit: 8,
        _page: toPage,
    };

    $("._filter").each(function () {
        payload[$(this).attr("name")] = $(this).val();
    });

    // Scroll to top of product list
    $("html, body").animate(
        {
            scrollTop: $(id_el_list).offset().top - 100,
        },
        400
    );

    $(id_el_list).fadeOut(150, function () {
        $(this)
            .html('<div class="text-center w-100 p-5">Loading...</div>')
            .fadeIn(150);
    });
    $("#product-list-pagination").html("");

    axios
        .get(url, { params: payload }, apiHeaders)
        .then(function (response) {
            const products = response.data.products;
            let template = "";

            if (!products || products.length === 0) {
                $(id_el_list).html(
                    `<div class="col-12 text-center text-muted py-5">No products found.</div>`
                );
                $("#products_count_start").text(0);
                $("#products_count_end").text(0);
                $("#products_count_total").text(0);
                return;
            }

            products.forEach((item) => {
                template += `
                    <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                        <div class="single-product-item text-center">
                            <div class="products-images">
                                <a href="/product/${
                                    item.id
                                }" class="product-thumbnail">
                                    <img src="${item.cover}" alt="${
                    item.title
                }" height="300">
                                </a>
                                <div class="product-actions">
                                    <a href="/product/${
                                        item.id
                                    }"><i class="p-icon icon-plus"></i><span class="tool-tip">Quick View</span></a>
                                    <a href="#"><i class="p-icon icon-bag2"></i> <span class="tool-tip">Add to cart</span></a>
                                </div>
                            </div>
                            <div class="product-content">
                                <h6 class="product-title"><a href="/product/${
                                    item.id
                                }">${item.title}</a></h6>
                                <small class="text-color-primary">${
                                    item.author
                                }</small>
                                <div class="product-price"><span class="new-price">IDR ${parseFloat(
                                    item.price
                                ).toLocaleString()}</span></div>
                            </div>
                        </div>
                    </div>`;
            });

            $(id_el_list).fadeOut(100, function () {
                $(this).html(template).fadeIn(200);
            });

            $("#products_count_start").text(
                response.data.products_count_start || response.data.from || 0
            );
            $("#products_count_end").text(
                response.data.products_count_end || response.data.to || 0
            );
            $("#products_count_total").text(
                response.data.products_count_total || response.data.total || 0
            );

            renderPagination(response.data);
        })
        .catch(function (error) {
            console.log("[ERROR] response..", error);
            $(id_el_list).html(
                `<div class="col-12 text-center text-danger py-5">Failed to load products.</div>`
            );

            Swal.fire({
                icon: "error",
                width: 600,
                title: "Error",
                html: error.message,
                confirmButtonText: "Ya",
            });
        });
}

function renderPagination(data) {
    let currentPage = data.filter?._page || 1;
    let totalItems = data.products_count_total || data.total || 0;
    let itemsPerPage = data.filter?._limit || 8;
    let maxPage = Math.ceil(totalItems / itemsPerPage);

    let template = "";

    if (maxPage > 1) {
        if (currentPage > 1) {
            template += `
            <li><a class="prev page-numbers" onclick="getData(1)"><i class="icon-chevron-left"></i> First Page</a></li>`;
        }

        if (currentPage > 1) {
            template += `
            <li><a class="page-numbers" onclick="getData(${currentPage - 1})">${
                currentPage - 1
            }</a></li>`;
        }

        template += `
        <li><a class="current page-numbers text-white bg-primary" onclick="getData(${currentPage})">${currentPage}</a></li>`;

        if (currentPage < maxPage) {
            template += `
            <li><a class="page-numbers" onclick="getData(${currentPage + 1})">${
                currentPage + 1
            }</a></li>`;
        }

        if (currentPage + 1 < maxPage) {
            template += `
            <li><a class="page-numbers" onclick="getData(${currentPage + 2})">${
                currentPage + 2
            }</a></li>`;
        }

        if (currentPage < maxPage) {
            template += `
            <li><a class="next page-numbers" onclick="getData(${maxPage})">Last Page <i class="icon-chevron-right"></i></a></li>`;
        }

        template += `
        <li>
            <select class="page-numbers form-select form-select-sm" id="jumpPageNumber" onchange="jumpToPage(this.value)">
                <option disabled selected>Jump to page</option>`;

        for (let i = 1; i <= maxPage; i++) {
            template += `<option value="${i}" ${
                i === currentPage ? "selected" : ""
            }>${i}</option>`;
        }

        template += `</select>
        </li>`;
    }

    $(id_el_list + "-pagination").html(template);
    $('[name="_page"]').val(currentPage);
}

$(function () {
    getData();
});
