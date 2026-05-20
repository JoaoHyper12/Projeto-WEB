const productsContainer =
document.getElementById("productsContainer");

let products = [];

fetch("products.json")
.then(response => response.json())
.then(data => {

    products = data;

    showProducts(products);

});

function showProducts(productsArray){

    productsContainer.innerHTML = "";

    productsArray.forEach(product => {

        productsContainer.innerHTML += `

        <div class="product">

            <img src="${product.image}">

            <h3>${product.name}</h3>

            <p>${product.price}€</p>

        </div>

        `;

    });

}

const searchInput =
document.getElementById("searchInput");

searchInput.addEventListener("input", filterProducts);

document
.getElementById("categoryFilter")
.addEventListener("change", filterProducts);

function filterProducts(){

    const searchValue =
    searchInput.value.toLowerCase();

    const categoryValue =
    document.getElementById("categoryFilter").value;

    const filtered = products.filter(product => {

        const matchesSearch =
        product.name.toLowerCase().includes(searchValue);

        const matchesCategory =
        categoryValue === "all" ||
        product.category === categoryValue;

        return matchesSearch && matchesCategory;

    });

    showProducts(filtered);

}