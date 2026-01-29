// ==========================================
// 1. CONFIGURATION & SOUND
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
        oscillator.start(); oscillator.stop(context.currentTime + 0.5);
    } catch (e) { console.log("Sound blocked"); }
}

// ==========================================
// 2. MENU DATA
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
        <div class="item-names"><h3>${item.eng}</h3><p>${item.tam}</p></div>
        <div class="qty-controller">
            <button class="btn-qty" onclick="updateQty(${item.id}, -1)">−</button>
            <span id="qty-${item.id}">0</span>
            <button class="btn-qty" onclick="updateQty(${item.id}, 1)">+</button>
        </div>`;
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
    menuItems.forEach(item => { if (cart[item.id]) { total += cart[item.id] * item.price; count += cart[item.id]; } });
    document.getElementById('total-price').innerText = `₹${total}`;
    document.getElementById('item-count').innerText = `${count} Items`;
}

// ==========================================
// 3. PAYMENT FLOW
// ==========================================
function processCheckout() {
    const total = document.getElementById('total-price').innerText.replace('₹', '');
    if (total === "0") { alert("Oops! Your tray is empty. ☕"); return; }
    window.location.href = `upi://pay?pa=${MY_UPI_ID}&pn=${encodeURIComponent(CAFE_NAME)}&am=${total}&cu=INR&tn=Order`;
    setTimeout(() => { showStatusOverlay(total); }, 2000);
}

function showStatusOverlay(amount) {
    const overlay = document.createElement('div');
    overlay.className = "payment-overlay active";
    overlay.id = "statusOverlay";
    overlay.innerHTML = `
        <div class="payment-card">
            <div id="verify-area">
                <div class="payment-icon">⌛</div>
                <h3>Verify Your Payment</h3>
                <p>Returning from UPI app? Please confirm below.</p>
                <button onclick="finalizeOrder('${amount}')" class="checkout-btn" style="width:100%">I Have Paid Successfully</button>
                <button onclick="handleFailure()" class="close-link">Payment Failed / Cancel</button>
            </div>
            <div id="result-area" style="display:none;"></div>
        </div>`;
    document.body.appendChild(overlay);
}

function handleFailure() {
    // Safety catch to prevent accidental clicks
    const confirmed = confirm("Wait! If you already completed the payment, please click 'Cancel' and then 'I Have Paid Successfully' to get your receipt. Do you still want to report a failure?");
    if (!confirmed) return;

    const area = document.getElementById('verify-area');
    area.innerHTML = `
        <div class="failure-ui">
            <div class="payment-icon" style="color:#d32f2f">☕</div>
            <h2 style="color:#d32f2f">Order Not Completed</h2>
            <div style="text-align:left; background:#fff5f5; padding:15px; border-radius:15px; border-left:5px solid #ff5252; margin:15px 0; font-size:14px;">
                <p><strong>We're sorry for the trouble.</strong><br><br>
                If money was debited, it will be <b>refunded automatically</b> within <b>7 working days</b>.<br><br>
                Please try ordering again!</p>
            </div>
            <button onclick="location.reload()" class="checkout-btn" style="width:100%; background:#666">Back to Menu</button>
        </div>`;
}

function finalizeOrder(amount) {
    playSuccessSound();
    const orderID = "CF" + Math.floor(Math.random() * 9000 + 1000);
    let itemHtml = ""; let rawList = "";
    menuItems.forEach(item => {
        const qty = cart[item.id] || 0;
        if (qty > 0) {
            itemHtml += `<div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:5px;"><span>${item.eng} x ${qty}</span><b>₹${item.price * qty}</b></div>`;
            rawList += `• ${item.eng} x ${qty}%0a`;
        }
    });

    const qrData = `ID:${orderID}|Total:${amount}|Items:${rawList.replace(/%0a/g, ',')}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    
    document.getElementById('verify-area').style.display = 'none';
    const res = document.getElementById('result-area');
    res.style.display = 'block';
    res.innerHTML = `
        <div class="success-ui">
            <div class="check-icon">✨ ✅ ✨</div>
            <h2 style="color:#27ae60">Payment Verified!</h2>
            <div style="background:#fff; padding:10px; border-radius:15px; border:2px dashed #27ae60; display:inline-block; margin-bottom:15px;">
                <img src="${qrUrl}" style="width:150px;">
            </div>
            <div style="background:#f9f9f9; padding:15px; border-radius:15px; text-align:left; margin-bottom:15px;">
                <p style="margin:0 0 10px; font-weight:bold; color:#666;">ORDER #${orderID}</p>
                ${itemHtml}
                <hr style="border:0; border-top:1px solid #ddd; margin:10px 0;">
                <p style="display:flex; justify-content:space-between; margin:0;"><b>Total Paid:</b> <b style="color:#27ae60">₹${amount}</b></p>
            </div>
            <button onclick="sendWhatsAppReceipt('${orderID}', '${amount}', '${rawList}')" class="pay-btn" style="width:100%">Share to WhatsApp</button>
            <button onclick="location.reload()" class="close-link">Back to Menu</button>
        </div>`;
    
    setTimeout(() => { sendWhatsAppReceipt(orderID, amount, rawList); }, 2000);
}

function sendWhatsAppReceipt(id, amt, items) {
    const msg = `🔖 *NEW PAID ORDER*%0a------------------%0a*ID:* #${id}%0a*Items:*%0a${items}------------------%0a*Total Paid: ₹${amt}*%0a✅ Verified`;
    window.open(`https://wa.me/${MY_PHONE}?text=${msg}`, '_blank');
}