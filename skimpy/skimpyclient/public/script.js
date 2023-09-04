
import { Post, Get } from "./functions.js";
import { getAccessToken, setAccessToken } from "./tokenService.js";

const homePage = document.querySelector('.homepage');
const notification = document.querySelector('.notification')

let cart = document.querySelector('.cart');

let cartSetter = localStorage.getItem('cart') ? `Cart (${JSON.parse(localStorage.getItem('cart')).length})` : "Cart"


if(cart){
    cart.textContent = cartSetter;

}


let signUpForm = document.querySelector('.body .signUpForm');
let signInForm = document.querySelector('.body .loginForm');

if(signUpForm){
    var firstName = document.getElementById("firstName");
    var lastName = document.getElementById("lastName");
    var email = document.getElementById("email");
    var address = document.getElementById("address");
    var phone = document.getElementById("phone");
    var password = document.getElementById("password");
    var conpassword = document.getElementById("conpassword");
    addFocus('.signUpForm input', notification)


    var regBtn = document.getElementById('regBtn');

    regBtn.addEventListener('click', async (e)=>{
        e.preventDefault();
         // Simple validation)
        if (!firstName.value || !lastName.value || !email.value || !address.value || !phone.value || !password.value) {
            notification.textContent = "All fields required"
            notification.classList.remove('hide') 
            return false;   
        }
        //validate name

        if(!validateName(firstName.value) && !validateName(lastName.value)){
            notification.textContent = "Invalid name pattern"
            notification.classList.remove('hide') 
            return false;   
        }
        //validate email
        if(!validateEmail(email.value)){
            notification.textContent = "Invalid Email pattern"
            notification.classList.remove('hide') 
            return false;   
        }
        //validate phone number
        if(!validatePhoneNumber(phone.value)){
            notification.textContent = "Phone should be 10 digits"
            notification.classList.remove('hide') 
            return false;
        }

        if(password.value < 6){
            notification.textContent = "Password should be atleast 6 characters"
            notification.classList.remove('hide') 
            return false;
        }

        if(password.value !== conpassword.value){
            notification.textContent = "Passwords should be the same"
            notification.classList.remove('hide') 
            return false;
        }

        //verify that user does not exist

        try {
            let checkUser =  await Get(`/users/${email}`)

            

             if(checkUser.success){
                let body = {
                    firstName : firstName.value.trim(),
                    lastName : lastName.value.trim(),
                    email : email.value.trim(),
                    phone : phone.value.trim(),
                    address : address.value.trim(),
                    password : password.value.trim()
                }
              let user =  await Post(`/users`, body)

              if(user.success){
                alert('Account registered, login')

                setTimeout(()=>{
                    window.location = './index.html'
                },1000)
              }


            }else{
                    notification.textContent = checkUser.message
                    notification.classList.remove('hide') 
                    return false;
                    
            }
        } catch (error) {
            console.log(error)
            
        }



    })
    
   
}


if(signInForm){
    //check if user is signed in
   

    addFocus('.loginForm input', notification);
    let email = document.getElementById('email')
    let password = document.getElementById('password')
    let btn = document.getElementById('signInBtn')

    btn.addEventListener('click', async (e)=>{
        e.preventDefault()

        if(!email.value || !password.value){
            notification.textContent = "All fields required"
            notification.classList.remove('hide') 
            return false;
        }

        //validate email
          if(!validateEmail(email.value)){
            notification.textContent = "Wrong email format"
            notification.classList.remove('hide') 
            return false;
        }

        let body = {
            email : email.value,
            password : password.value
        }

        let authenticate = await Post('/login', body)

        if(authenticate.success){
            setAccessToken(authenticate.token)
            setTimeout(()=>{
                location = './home.html'
            },1000)
        }else{
            notification.textContent = authenticate.message
            notification.classList.remove('hide') 
            return false;
            
        }


    })

}


if(homePage){
    let check = await Get();
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

let cartPage = document.querySelector('.body.cart')

if(cartPage){
    let cartItems = JSON.parse(localStorage.getItem('cart'))
    let cartItemsWrapper = document.querySelector('.cartItemsWrapper')
    let cartWrapper = document.querySelector('.cartWrapper');
    function renderCart(){
        if(!cartItems || !cartItems.length){
        cartWrapper.textContent = "You currently have no item in your Cart"
        }else{
            cartItems.forEach((item)=>{
                let ele = cartRender(item, renderCart,cartWrapper);
                cartWrapper.append(ele)
            })
             let checkoutCon = document.createElement('div');
            checkoutCon.className = "checkoutcon";
            let checkoutBtn = document.createElement('button')
            checkoutBtn.textContent = `Check Out(${cartItems.length})`
            checkoutBtn.className = "checkoutbtn";

            checkoutBtn.addEventListener('click', ProcessPayment)
            if(cartItems.length){
                checkoutCon.appendChild(checkoutBtn)

            }
            cartItemsWrapper.appendChild(checkoutCon)
        }
       

         async function ProcessPayment (){
            console.log(cartItems)

            if(!cartItems){
                //do nothing
            }else{
                var pay = await Post('/cart', cartItems);

                 if (pay.success) {

                    this.textContent = 'Processing Order';
                    console.log('success');

                    // Add dots to the button text while processing
                    const intervalId = setInterval(() => {
                        this.textContent += '.';
                    }, 300);

                    setTimeout(() => {
                        // Clear the interval and update the button text and style on success
                        clearInterval(intervalId);
                        this.style.backgroundColor = 'Green';
                        this.textContent = 'Order Successful';
                        this.removeEventListener('click', ProcessPayment)

                        setTimeout(()=>{
                            //cleara cart
                            localStorage.removeItem('cart');
                            location = './home.html'
                        },300)




                    }, 2000);


                }
  
            }


        }

    }
    renderCart();
    
    
}


let ordersPage = document.querySelector('.body.orders')

let orderWrapper = document.querySelector('.body.orders .cartWrapper');

if(ordersPage){
    let myOrders = await Get('/orders');



    if(myOrders.success){
        if(myOrders.message.length){

             myOrders.message.forEach(async (order)=>{
                let orderd = await renderOrders(order);
                console.log(orderd)
                orderWrapper.appendChild(orderd);
             })
            
        }
    }
}
//component

function productRender(product){

    let container = document.createElement('div');
    container.className = "productContainer";

    let productImg = document.createElement('div');
    productImg.className = "productImg"
    productImg.style.backgroundImage = `url(${product.img_sources})`;

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

    cartBtn.addEventListener('click',async (e)=>{
        e.preventDefault();
        if(localStorage.getItem('cart')){
            
            let cart = JSON.parse(localStorage.getItem('cart'));
            if(cart.find((element) => element.id == product.id)){
                cartBtn.textContent = "Already in Cart";

                setTimeout(()=>{
                    cartBtn.textContent = "Add to Cart";
                },2000)
            }else{
                cart.push(product);
            }
            
            
           localStorage.setItem('cart',JSON.stringify(cart));

        }else{
            localStorage.setItem('cart',JSON.stringify([product]))
        }

        cartSetter = JSON.parse(localStorage.getItem('cart')).length;

        cart.textContent = `Cart(${cartSetter})`;
    })


    let buyBtn = document.createElement('button');
    buyBtn.textContent = "Buy Now";

    productButtons.append(cartBtn,buyBtn);

    container.append(productImg,productDetails,productButtons)

    return container;
}

function cartRender(product){

    let container = document.createElement('div');
    container.className = "cartContainer";

   
    let productDetails = document.createElement('div');
    productDetails.className = "cartDetails";



    let productName = document.createElement('div');
    productName.className = "productName";
    productName.textContent = product.product_name;
    
    let productPrice = document.createElement('div');
    productPrice.className = "productPrice";
    productPrice.textContent = "£" +  product.price;


    productDetails.append(productName,productPrice);

    let productButtons = document.createElement('div');
    productButtons.className = "cartButtons"

    let cartBtn = document.createElement('button');
    cartBtn.textContent = "Remove from Cart";

    cartBtn.addEventListener('click',async (e)=>{
        e.preventDefault();
            
            let cart = JSON.parse(localStorage.getItem('cart'));
            let index = cart.findIndex((element) => element.id == product.id)


            if(index === 0){
                cart = cart.slice(1);
            }else{
                cart = cart.slice(0, index).concat(cart.slice(index+1));
            }            
            localStorage.setItem('cart',JSON.stringify(cart));


            cartSetter = JSON.parse(localStorage.getItem('cart')).length;

            cart.textContent = `Cart(${cartSetter})`;

            window.location = "./cart.html";
            
    })  


    

    productButtons.append(cartBtn);

    container.append(productDetails,productButtons)

    return container;
}

async function renderOrders(order){
    const orderDate = new Date(order.order_date);
    const formattedDate = `${orderDate.getDate().toString().padStart(2, '0')}/${
    (orderDate.getMonth() + 1).toString().padStart(2, '0')}/${
    orderDate.getFullYear()}`;
    const allOrders = document.createElement('div');
    allOrders.className = 'allMyorders'
    const orderDiv = document.createElement('div');
    orderDiv.className = 'myOrderContainer';

    const dateDiv = document.createElement('div')
    dateDiv.className = 'dateDiv'

    const dateLabel = document.createElement('div')
    dateLabel.id = 'itemLabel'
    dateLabel.textContent = "Date";

    const date = document.createElement('div');
    date.className = 'itemDate';
    date.textContent = formattedDate;

    dateDiv.append(dateLabel,date);

    const orderNumberDiv = document.createElement('div')
    orderNumberDiv.className = 'orderNumberDiv'

    const orderNumberLabel = document.createElement('div')
    orderNumberLabel.id = 'itemLabel'
    orderNumberLabel.textContent = "Order No.";

    const orderNum = document.createElement('div');
    orderNum.className = 'orderNum';
    orderNum.textContent = order.id;

    orderNumberDiv.append(orderNumberLabel, orderNum);

     const orderstatusDiv = document.createElement('div')
    orderstatusDiv.className = 'orderStatusDiv'

    const orderStatusLabel = document.createElement('div')
    orderStatusLabel.id = 'itemLabel'
    orderStatusLabel.textContent = "Order Status";

    const orderStatus = document.createElement('div');
    orderStatus.className = 'orderStatus';
    orderStatus.textContent = order.order_status;

    orderstatusDiv.append(orderStatusLabel, orderStatus);

     const orderPriceDiv = document.createElement('div')
    orderPriceDiv.className = 'orderPriceDiv'

    const orderPriceLabel = document.createElement('div')
    orderPriceLabel.id = 'itemLabel'
    orderPriceLabel.textContent = "Price";

    const priceNum = document.createElement('div');
    priceNum.className = 'priceNum';
    priceNum.textContent = '£'+ order.total_price;

    orderPriceDiv.append(orderPriceLabel, priceNum);

    const viewOrderBtn = document.createElement('button')
    viewOrderBtn.className = 'viewOrderBtn'
    viewOrderBtn.textContent = 'View'


    orderDiv.append(dateDiv, orderNumberDiv, orderstatusDiv, orderPriceDiv, viewOrderBtn);
    

    //add products;

    const allproducts = document.createElement('div');
    allproducts.className = 'allMyProducts hide';


    try{
            let ord = await Get(`/orders/${order.id}`);

            if(ord.success){
                ord.message.forEach(async (item)=>{
                    let div = await listOrders(item);

                    allproducts.appendChild(div);
                })
            }
        
    }catch(error){
        console.log(error)
    }



    viewOrderBtn.addEventListener('click',async (e)=>{
        e.preventDefault();
        allproducts.classList.toggle('hide')
        allproducts.className == 'allMyProducts hide'? viewOrderBtn.textContent = "View" : viewOrderBtn.textContent = "Hide"


       
       


    })


    allOrders.append(orderDiv, allproducts);


    return allOrders;



}

async function listOrders(product){
    let prod = document.createElement('div');
    prod.className = 'listProd';

    let proPic = document.createElement('img');
    proPic.className = 'propic';
    proPic.src = product.img_sources;

    let proName = document.createElement('div');
    proName.className = 'proName';
    proName.textContent = product.product_name;

    let proPrice = document.createElement('div');
    proPrice.className = 'proPrice';
    proPrice.textContent = `£` + product.price;


    prod.append(proPic, proName, proPrice);

    return prod;

}



async function fetchData (url){
    try {
        let data = await fetch(url);
        data = await data.json();
        return data
    } catch (error) {
            console.log(error)
    }
}


function addFocus(inputs,notification){
    let input = document.querySelectorAll(inputs);

    input.forEach((inp)=>{
        if(inp.type.trim() !== 'button'){
            inp.addEventListener('focus',()=>{
                notification.className = ('notification hide')
                
            })
        }
    })
}

function validateName(name) {
    // Regular expression pattern for a valid name
    var namePattern = /^[a-zA-Z\- ']+$/;

    // Minimum and maximum allowed name lengths
    var minLength = 2;
    var maxLength = 50;

    // Test the input against the pattern and length constraints
    return name.length >= minLength && name.length <= maxLength && namePattern.test(name);
}
function validateEmail(email) {
    // Regular expression pattern for a valid email address
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    // Test the input against the pattern
    return emailPattern.test(email);
}

function validatePhoneNumber(phoneNumber) {
    // Regular expression pattern for a 10-digit phone number
    var phonePattern = /^\d{10}$/;

    // Test the input against the pattern
    return phonePattern.test(phoneNumber);
}

