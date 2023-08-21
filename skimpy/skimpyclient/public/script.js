

const homePage = document.querySelector('.homepage');

async function fetchData (url){
    try {
        let data = await fetch(url);
        data = await data.json();
        return data
    } catch (error) {
            console.log(error)
    }
}


if(homePage){
    let items = document.querySelector('.items');

    async function renderHome(){
        let products = await fetchData('http://localhost:3002/products')
        console.log(products);

        products.forEach((product)=>{
            let newProduct = productRender(product);

            items.appendChild(newProduct);
        })
    }

    renderHome();
}


//component

function productRender(product){

    let container = document.createElement('div');
    container.className = "productContainer";

    let productImg = document.createElement('img');
    productImg.className = "productImg"
    productImg.src = product.img_sources;

    let productDetails = document.createElement('div');
    productDetails.className = "productDetails";



    let productName = document.createElement('div');
    productName.className = "productName";
    productName.textContent = product.product_name;
    
    let productPrice = document.createElement('div');
    productPrice.className = "productPrice";
    productPrice.textContent = "£" +  product.price;


    productDetails.append(productName,productPrice);

    let productButtons = document.createElement('div');
    productButtons.className = "productButtons"

    let cartBtn = document.createElement('button');
    cartBtn.textContent = "Add to Cart";

    let buyBtn = document.createElement('button');
    buyBtn.textContent = "Buy Now";

    productButtons.append(cartBtn,buyBtn);

    container.append(productImg,productDetails,productButtons)

    return container;
}