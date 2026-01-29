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
    setTimeout(() => { showVerificationModal(total); }, 6000);
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
    playSuccessSound();
    const orderID = "CF" + Math.floor(Math.random() * 9000 + 1000);
    
    let itemHtml = ""; 
    let textList = ""; // This is for the WhatsApp text
    
    menuItems.forEach(item => {
        const qty = cart[item.id] || 0;
        if (qty > 0) {
            itemHtml += `<div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span>${item.eng} x ${qty}</span>
                            <b>₹${item.price * qty}</b>
                         </div>`;
            // We use simple text here; we will encode it later
            textList += `• ${item.eng} x ${qty}\n`; 
        }
    });

    saveOrderToLog(amount, textList, "Success");
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('ID:'+orderID+'|Amt:'+amount)}`;
    
    document.getElementById('verify-area').style.display = 'none';
    const res = document.getElementById('result-area');
    res.style.display = 'block';
    
    // ... (inside finalizeOrder where you set res.innerHTML)
    res.innerHTML = `
        <div class="success-ui" style="text-align:center;">
            <div class="check-icon">✨ ✅ ✨</div>
            <h2 style="color:#27ae60">Payment Verified!</h2>
            
            <div id="popup-tip" style="display:none; background:#fff3cd; color:#856404; padding:10px; border-radius:10px; font-size:13px; margin-bottom:10px; border:1px solid #ffeeba;"></div>

            <img src="${qrUrl}" style="width:140px; margin:10px 0;">
            
            <div style="background:#f9f9f9; padding:15px; border-radius:15px; text-align:left; margin-bottom:15px;">
                <p style="margin:0 0 10px; font-weight:bold;">ORDER #${id}</p>
                ${itemHtml}
                <hr style="border:0; border-top:1px solid #ddd; margin:10px 0;">
                <p style="display:flex; justify-content:space-between; margin:0;">
                    <b>Total Paid:</b> <b style="color:#27ae60">₹${amt}</b>
                </p>
            </div>

            <button onclick="sendWhatsAppReceipt('${id}', '${amt}', ${JSON.stringify(items)})" class="pay-btn" style="width:100%">
                Send Receipt to WhatsApp
            </button>
            <button onclick="location.reload()" class="close-link">Place New Order</button>
        </div>`;

    // Automated trigger after 2.5 seconds
    setTimeout(() => { 
        sendWhatsAppReceipt(orderID, amount, textList); 
    }, 2000);
}

function sendWhatsAppReceipt(id, amt, items) {
    // 1. Construct the message
    const fullMessage = `🔖 *NEW PAID ORDER*\n` +
                        `--------------------------\n` +
                        `*Order ID:* #${id}\n` +
                        `*Items:*\n${items}` +
                        `--------------------------\n` +
                        `*Total Paid: ₹${amt}*\n` +
                        `--------------------------\n` +
                        `✅ Verified at Thirumagal Coffee House`;

    const encodedMsg = encodeURIComponent(fullMessage);
    const waUrl = `https://wa.me/${MY_PHONE}?text=${encodedMsg}`;
    
    // 2. Attempt to open
    const newWindow = window.open(waUrl, '_blank');

    // 3. Detect if Popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        // Show the manual tip if blocked
        const tip = document.getElementById('popup-tip');
        if (tip) {
            tip.style.display = 'block';
            tip.innerHTML = `⚠️ <b>Popup Blocked:</b> Please click the button below to send your receipt!`;
        }
    }
}