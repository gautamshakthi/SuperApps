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

// CONFIGURATION
const MY_UPI_ID = "9003705725@ybl"; 
const MY_PHONE = "919003705725";  
const CAFE_NAME = "Thirumagal Coffee House";

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


__________________________________________________________________________________

// THE FIXED CHECKOUT LOGIC
function processCheckout() {
    const total = document.getElementById('total-price').innerText.replace('₹', '');
    if (total == "0") {
        alert("Oops! Your tray is empty. ☕ Please add a delicious drink!");
        return;
    }
    showPaymentModal(total);
}

function showPaymentModal(amount) {
    const overlay = document.createElement('div');
    overlay.className = "payment-overlay";
    overlay.id = "paymentOverlay";
    
    const upiLink = `upi://pay?pa=${MY_UPI_ID}&pn=${encodeURIComponent(CAFE_NAME)}&am=${amount}&cu=INR&tn=CafeOrder`;

    overlay.innerHTML = `
        <div class="payment-card">
            <div id="step-pay">
                <div class="payment-icon">💸</div>
                <h3>Ready to Pay?</h3>
                <p>Total: <strong style="color:#27ae60; font-size: 24px;">₹${amount}</strong></p>
                <div class="button-group">
                    <a href="${upiLink}" class="pay-btn" onclick="handlePayClick('${amount}')">
                        Confirm & Open UPI Apps
                    </a>
                    <button onclick="closeModal()" class="cancel-btn">Cancel</button>
                </div>
            </div>
            <div id="step-verify" style="display:none;">
                <div class="payment-icon">⏳</div>
                <h3>Verifying...</h3>
                <p>Finished paying? Click below for receipt.</p>
                <button onclick="generateFinalSuccess('${amount}')" class="receipt-btn" style="background:#27ae60; color:white; padding:15px; border-radius:12px; width:100%; border:none; font-weight:bold;">
                   I Have Paid - Get Receipt
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);
}

function handlePayClick(amount) {
    // Switch UI after a short delay so the app launch isn't interrupted
    setTimeout(() => {
        document.getElementById('step-pay').style.display = 'none';
        document.getElementById('step-verify').style.display = 'block';
    }, 2000);
}

function generateFinalSuccess(amount) {
    const orderID = "CF" + Math.floor(Math.random() * 9000 + 1000);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=OrderID:${orderID}`;

    const card = document.querySelector('.payment-card');
    card.innerHTML = `
        <div class="success-ui">
            <div class="check-icon">✨ ✅ ✨</div>
            <h2 style="color: #2e7d32;">Order Placed!</h2>
            <p>Order <b>#${orderID}</b> is being prepared.</p>
            <img src="${qrUrl}" class="qr-code">
            <button onclick="sendWhatsAppReceipt('${orderID}', '${amount}')" class="pay-btn">
                Send Receipt to WhatsApp
            </button>
            <button onclick="location.reload()" class="close-link">Back to Menu</button>
        </div>
    `;
}

function sendWhatsAppReceipt(id, amt) {
    const msg = `🔖 *CAFE RECEIPT* %0a------------------%0aOrder ID: ${id}%0aAmount: ₹${amt}%0aStatus: ✅ PAID%0a------------------%0aSee you at the counter! 🙏`;
    window.open(`https://wa.me/${MY_PHONE}?text=${msg}`, '_blank');
}

function closeModal() {
    const overlay = document.getElementById('paymentOverlay');
    const card = document.querySelector('.payment-card');
    card.innerHTML = `
        <div class="failure-ui">
            <div class="payment-icon">☕</div>
            <h3>No Problem!</h3>
            <p>Ready whenever you are!</p>
        </div>
    `;
    setTimeout(() => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }, 1500);
}