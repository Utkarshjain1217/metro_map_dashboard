
var TRIP_COUNTS = {"September": 18890041, "October": 17259029, "November": 18373887, "December": 22879985};
function fmt(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,","); }
function switchMonth(month) {
    document.querySelectorAll('.leaflet-control-layers-overlays label').forEach(function(lbl) {
        var txt = lbl.textContent.trim();
        if (!txt.startsWith("OD Flows")) return;
        var cb = lbl.querySelector('input');
        if (!cb) return;
        var want = txt.replace("OD Flows – ","").trim() === month;
        if (cb.checked !== want) cb.click();
    });
    var tc = TRIP_COUNTS[month];
    document.getElementById('trip-count').textContent = tc ? fmt(tc) : '—';
}
window.addEventListener('load', function() {
    setTimeout(function() {
        var sel = document.getElementById('month-select');
        if (sel) switchMonth(sel.value);
    }, 1000);
});


