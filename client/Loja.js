const productsContainer = document.getElementById("productsContainer");

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

            <button onclick="addToCart(${product.id})">
                Adicionar ao carrinho
            </button>

        </div>

        `;

    });

}