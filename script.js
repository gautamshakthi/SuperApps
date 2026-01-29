// ==========================================
// 1. CONFIGURATION & SOUND LOGIC
// ==========================================
const MY_UPI_ID = "9003705725@ybl"; 
const MY_PHONE = "919003705725";  
const CAFE_NAME = "Thirumagal Coffee House";

function playSuccessSound() {
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, context.currentTime); 
        oscillator.frequency.exponentialRampToValueAtTime(440, context.currentTime + 0.5); 
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.5);
    } catch (e) { console.log("Audio play blocked by browser."); }
}

// ==========================================
// 2. MENU DATA & RENDERING
// ==========================================
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
    let total = 0; let count = 0;
    menuItems.forEach(item => {
        if (cart[item.id]) {
            total += cart[item.id] * item.price;
            count += cart[item.id];
        }
    });
    document.getElementById('total-price').innerText = `₹${total}`;
    document.getElementById('item-count').innerText = `${count} Items`;
}

// ==========================================
// 3. PAYMENT FLOW
// ==========================================
function processCheckout() {
    const total = document.getElementById('total-price').innerText.replace('₹', '');
    if (total === "0" || total === "") {
        alert("Oops! Your tray is empty. ☕");
        return;
    }
    const upiLink = `upi://pay?pa=${MY_UPI_ID}&pn=${encodeURIComponent(CAFE_NAME)}&am=${total}&cu=INR&tn=CafeOrder`;
    
    // Redirect to UPI
    window.location.href = upiLink;

    // Show ONLY the verification prompt when they return
    setTimeout(() => { showVerificationModal(total); }, 2000);
}

function showVerificationModal(amount) {
    const overlay = document.createElement('div');
    overlay.className = "payment-overlay active";
    overlay.id = "statusOverlay";
    overlay.innerHTML = `
        <div class="payment-card status-card">
            <div id="verify-area">
                <div class="payment-icon">⌛</div>
                <h3>Confirm Payment</h3>
                <p>Once you finish payment in GPay/PhonePe, click below to generate your receipt.</p>
                <button onclick="finalizeOrder('${amount}')" class="checkout-btn" style="width:100%">I Have Paid Successfully</button>
                <button onclick="location.reload()" class="close-link">Payment Failed / Cancel</button>
            </div>
            <div id="success-area" style="display:none;"></div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function finalizeOrder(amount) {
    // TRIGGER SOUND ONLY NOW
    playSuccessSound();

    const orderID = "CF" + Math.floor(Math.random() * 9000 + 1000);
    
    // Build Itemized List
    let itemSummary = "";
    let waSummary = "";
    menuItems.forEach(item => {
        if (cart[item.id] > 0) {
            itemSummary += `<div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span>${item.eng} x ${cart[item.id]}</span>
                <span>₹${item.price * cart[item.id]}</span>
            </div>`;
            waSummary += `• ${item.eng} x ${cart[item.id]}%0a`;
        }
    });

    // Build QR Data with IDs and items
    const qrData = `OrderID:${orderID}|Total:${amount}|Items:${waSummary.replace(/%0a/g, ',')}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

    const verifyArea = document.getElementById('verify-area');
    verifyArea.style.display = 'none';
    const successArea = document.getElementById('success-area');
    successArea.style.display = 'block';

    successArea.innerHTML = `
        <div class="success-ui">
            <div class="check-icon">✨ ✅ ✨</div>
            <h2 style="color:#27ae60">Order Successful!</h2>
            <div class="qr-container" style="border: 2px dashed #27ae60; padding: 10px; border-radius: 15px; background: #fff;">
                <img src="${qrUrl}" class="qr-code">
            </div>
            <div class="order-summary" style="background:#f9f9f9; padding:15px; border-radius:15px; margin: 15px 0; text-align: left; font-size:14px;">
                <p><strong>Order ID: #${orderID}</strong></p>
                <hr style="border:0; border-top:1px solid #ddd;">
                ${itemSummary}
                <hr style="border:0; border-top:1px solid #ddd;">
                <p style="display:flex; justify-content:space-between;"><strong>Total Paid:</strong> <strong>₹${amount}</strong></p>
            </div>
            <button onclick="sendWhatsAppReceipt('${orderID}', '${amount}', '${waSummary}')" class="pay-btn">Share Receipt to WhatsApp</button>
            <button onclick="location.reload()" class="close-link">Place New Order</button>
        </div>
    `;

    // AUTO-NOTIFY OWNER
    setTimeout(() => {
        sendWhatsAppReceipt(orderID, amount, waSummary);
    }, 1500);
}

function sendWhatsAppReceipt(id, amt, items) {
    const msg = `🔖 *NEW PAID ORDER*%0a------------------%0aOrder ID: ${id}%0aItems:%0a${items}------------------%0a*Total Paid: ₹${amt}*%0a------------------%0aStatus: ✅ VERIFIED`;
    window.open(`https://wa.me/${MY_PHONE}?text=${msg}`, '_blank');
}