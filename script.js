// script.js
const menuItems = [
    { id: 1, eng: "Tea", tam: "டீ", price: 15, img: "tea.jpg" },
    { id: 2, eng: "Coffee", tam: "காபி", price: 20, img: "coffee.jpg" },
    { id: 3, eng: "Milk", tam: "பால்", price: 15, img: "milk.jpg" },
    { id: 4, eng: "Boost", tam: "பூஸ்ட்", price: 25, img: "boost.jpg" },
    { id: 5, eng: "Horlicks", tam: "ஹார்லிக்ஸ்", price: 25, img: "horlicks.jpg" },
    { id: 6, eng: "Ginger Tea", tam: "இஞ்சி டீ", price: 20, img: "ginger-tea.jpg" },
    { id: 7, eng: "Ginger Milk", tam: "இஞ்சி பால்", price: 20, img: "ginger-milk.jpg" },
    { id: 8, eng: "Black Tea", tam: "பிளாக் டீ", price: 12, img: "black-tea.jpg" },
    { id: 9, eng: "Green Tea", tam: "கிரீன் டீ", price: 25, img: "green-tea.jpg" },
    { id: 10, eng: "Black Coffee", tam: "பிளாக் காபி", price: 18, img: "black-coffee.jpg" }
];

let cart = {};

const container = document.getElementById('menu-container');

// Render Menu
menuItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
        <div class="price-tag">₹${item.price}</div>
        <img src="${item.img}" class="item-img" alt="${item.eng}">
        <div class="item-names">
            <h3>${item.eng}</h3>
            <p>${item.tam}</p>
        </div>
        <div class="qty-controller">
            <button class="btn-qty" onclick="updateQty(${item.id}, -1)">−</button>
            <span id="qty-${item.id}">0</span>
            <button class="btn-qty" onclick="updateQty(${item.id}, 1)">+</button>
        </div>
    `;
    container.appendChild(card);
});

function updateQty(id, change) {
    cart[id] = (cart[id] || 0) + change;
    if (cart[id] < 0) cart[id] = 0;
    
    document.getElementById(`qty-${id}`).innerText = cart[id];
    calculateTotal();
}

function calculateTotal() {
    let total = 0;
    let count = 0;
    menuItems.forEach(item => {
        if (cart[item.id]) {
            total += cart[item.id] * item.price;
            count += cart[item.id];
        }
    });
    document.getElementById('total-price').innerText = `₹${total}`;
    document.getElementById('item-count').innerText = `${count} Items`;
}

function processCheckout() {
    alert("Order Placed Successfully!");
}

__________________________________________________________________________________

function processCheckout() {
    const total = document.getElementById('total-price').innerText.replace('₹', '');
    const upiID = "9003705725@ybl"; // USE YOUR ACTUAL UPI ID HERE
    const name = encodeURIComponent("Thirumagal Coffee House");
    
    // This is the most compatible format for Indian UPI apps
    const upiLink = `upi://pay?pa=${upiID}&pn=${name}&am=${total}&cu=INR&tn=CafeOrder`;

    // 1. Open WhatsApp first
    window.open(`https://wa.me/919876543210?text=OrderTotal:${total}`, '_blank');

    // 2. Show the Payment UI
    showPaymentModal(upiLink, total);
}
__________________________________________________________________________________

function showPaymentModal(link, amount) {
    // Remove existing modal if any
    const existing = document.querySelector('.payment-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = "payment-overlay";
    overlay.innerHTML = `
        <div class="payment-card">
            <div class="payment-icon">💸</div>
            <h3>Complete Payment</h3>
            <p class="payment-amount">Total: <span>₹${amount}</span></p>
            
            <div class="button-group">
                <a href="${link}" class="pay-btn">
                    Pay Now
                </a>
                <button onclick="closeModal()" class="cancel-btn">
                    Cancel
                </button>
            </div>
            <p class="payment-note">Secure UPI Payment</p>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // Smooth fade in
    setTimeout(() => overlay.classList.add('active'), 10);
}

function closeModal() {
    const overlay = document.querySelector('.payment-overlay');
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
}