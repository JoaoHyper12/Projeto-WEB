const productsContainer = document.getElementById("productsContainer");

let products = [];

// Carregar jogadores da API e mapear para produtos (uso de placeholder para imagens)
fetch('https://www.balldontlie.io/api/v1/players?per_page=24')
    .then((response) => response.json())
    .then((data) => {
        products = data.data.map((player) => ({
            id: `player-${player.id}`,
            name: `${player.first_name} ${player.last_name}`,
            price: 9.99,
            image: '/images/placeholder-player.webp',
        }));

        showProducts(products);
    })
    .catch(() => {
        products = [];
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