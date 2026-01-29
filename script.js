// script.js
const menuItems = [
    { id: 1, eng: "Tea", tam: "டீ", price: 1, img: "tea.jpg" },
    { id: 2, eng: "Coffee", tam: "காபி", price: 1, img: "coffee.jpg" },
    { id: 3, eng: "Milk", tam: "பால்", price: 1, img: "milk.jpg" },
    { id: 4, eng: "Boost", tam: "பூஸ்ட்", price: 1, img: "boost.jpg" },
    { id: 5, eng: "Horlicks", tam: "ஹார்லிக்ஸ்", price: 1, img: "horlicks.jpg" },
    { id: 6, eng: "Ginger Tea", tam: "இஞ்சி டீ", price: 1, img: "ginger-tea.jpg" },
    { id: 7, eng: "Ginger Milk", tam: "இஞ்சி பால்", price: 1, img: "ginger-milk.jpg" },
    { id: 8, eng: "Black Tea", tam: "பிளாக் டீ", price: 1, img: "black-tea.jpg" },
    { id: 9, eng: "Green Tea", tam: "கிரீன் டீ", price: 1, img: "green-tea.jpg" },
    { id: 10, eng: "Black Coffee", tam: "பிளாக் காபி", price: 1, img: "black-coffee.jpg" }
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

// ==========================================
// CONFIGURATION: SET YOUR DETAILS HERE
// ==========================================
const MY_UPI_ID = "9003705725@ybl"; // <--- ADD YOUR UPI ID HERE (e.g., 9003705725@ybl)
const MY_PHONE = "919003705725";  // <--- ADD YOUR WHATSAPP NUMBER HERE (with country code)
const CAFE_NAME = "Thirumagal Coffee House";
// ==========================================

function processCheckout() {
    const total = document.getElementById('total-price').innerText.replace('₹', '');
    
    if (total == "0") {
        // PLEASING FAILURE MESSAGE
        alert("Oops! Your tray is empty. ☕ Please add a delicious drink to proceed!");
        return;
    }

    // Generate Universal UPI Link
    const upiLink = `upi://pay?pa=${MY_UPI_ID}&pn=${encodeURIComponent(CAFE_NAME)}&am=${total}&cu=INR&tn=CafeOrder`;

    // Show the Payment UI (The "Pay Now" and "Cancel" buttons)
    showPaymentModal(upiLink, total);
}
__________________________________________________________________________________

// Add this QR Code Library to your HTML <head>: 
// <script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"></script>

function showPaymentModal(link, amount) {
    const overlay = document.createElement('div');
    overlay.className = "payment-overlay active";
    overlay.innerHTML = `
        <div class="payment-card">
            <div id="payment-ui">
                <div class="payment-icon">💸</div>
                <h3>Complete Payment</h3>
                <p class="payment-amount">Total: <span>₹${amount}</span></p>
                <div class="button-group">
                    <a href="${link}" class="pay-btn" onclick="showVerificationUI('${amount}')">Pay Now</a>
                    <button onclick="closeModal()" class="cancel-btn">Cancel</button>
                </div>
            </div>
            <div id="verify-ui" style="display:none;">
                <div class="payment-icon">✅</div>
                <h3>Paid Successfully?</h3>
                <p>Once you finish payment in your UPI app, click below to get your receipt.</p>
                <button onclick="generateReceipt('${amount}')" class="receipt-btn">Confirm & Get Receipt</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function showVerificationUI() {
    document.getElementById('payment-ui').style.display = 'none';
    document.getElementById('verify-ui').style.display = 'block';
}


function generateReceipt(amount) {
    const orderID = "CF" + Math.floor(Math.random() * 9000 + 1000);
    
    // PLEASING SUCCESS MESSAGE
    const successHTML = `
        <div class="success-ui">
            <div class="check-icon">✨ ✅ ✨</div>
            <h2 style="color: #2e7d32;">Order Placed!</h2>
            <p>We've received your payment of <b>₹${amount}</b>.</p>
            <p>Your order <b>#${orderID}</b> is now in the kitchen!</p>
            
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${orderID}" class="qr-code">
            
            <button onclick="sendFinalWhatsApp('${orderID}', '${amount}')" class="pay-btn">
                Send Receipt to WhatsApp
            </button>
            <button onclick="closeModal()" class="close-link">Back to Menu</button>
        </div>
    `;
    
    document.querySelector('.payment-card').innerHTML = successHTML;
}

function sendFinalWhatsApp(id, amt) {
    const msg = `🔖 *CAFE RECEIPT* %0a------------------%0aOrder ID: ${id}%0aAmount: ₹${amt}%0aStatus: ✅ PAID%0a------------------%0aThank you! Visit again. 🙏`;
    window.open(`https://wa.me/${MY_PHONE}?text=${msg}`, '_blank');
}

function closeModal() {
    const overlay = document.querySelector('.payment-overlay');
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
}
