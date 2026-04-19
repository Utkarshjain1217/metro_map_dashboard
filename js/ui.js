
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


// ===== OD QUERY LOGIC =====
var _odStations = {}; // Code -> Full Name
var _originCode = null;
var _destCode = null;
var _odHighlightLine = null;

window.addEventListener('load', function() {
    setTimeout(function() {
        if (typeof map_945935b7a94eee1b0ce96a1f4ff7f327 !== 'undefined') {
            map_945935b7a94eee1b0ce96a1f4ff7f327.eachLayer(function(layer) {
                if (layer instanceof L.CircleMarker) {
                    var tt = layer.getTooltip();
                    if (tt) {
                        var m = tt.getContent().match(/<b>(.*?)<\/b>\s*\((\w+)\)/);
                        if (m) {
                            var name = m[1].trim();
                            var code = m[2];
                            _odStations[code] = name;
                            layer.on('click', function(e) {
                                handleStationClick(code, name);
                            });
                        }
                    }
                }
            });
            
            var sortedCodes = Object.keys(_odStations).sort(function(a,b){ return _odStations[a].localeCompare(_odStations[b]); });
            var oSel = document.getElementById('od-origin');
            var dSel = document.getElementById('od-dest');
            if(oSel && dSel) {
                sortedCodes.forEach(function(c) {
                    oSel.add(new Option(_odStations[c], c));
                    dSel.add(new Option(_odStations[c], c));
                });
                oSel.addEventListener('change', function() { _originCode = this.value; checkOD(); });
                dSel.addEventListener('change', function() { _destCode = this.value; checkOD(); });
            }
        }
    }, 2500); // Wait for map groups to load
});

function handleStationClick(code, name) {
    var oSel = document.getElementById('od-origin');
    var dSel = document.getElementById('od-dest');
    
    if (!_originCode) {
        _originCode = code;
        if(oSel) oSel.value = code;
    } else if (!_destCode && code !== _originCode) {
        _destCode = code;
        if(dSel) dSel.value = code;
        checkOD();
    } else {
        _originCode = code;
        _destCode = null;
        if(oSel) oSel.value = code;
        if(dSel) dSel.value = "";
    }
    checkOD();
}

function checkOD() {
    var resPanel = document.getElementById('od-result');
    if (!_originCode || !_destCode) {
        if(resPanel) resPanel.style.display = 'none';
        if (_odHighlightLine) {
            _odHighlightLine.remove();
            _odHighlightLine = null;
        }
        return;
    }
    
    var totalTrips = 0;
    var totalDays = 0;
    
    var fgs = [];
    if (typeof feature_group_cb7909cc52e5faace3e7d409ec94e98e !== 'undefined') fgs.push({fg: feature_group_cb7909cc52e5faace3e7d409ec94e98e, days: 30, key: 'sep'});
    if (typeof feature_group_2538e4bc70192d33d0df28df8ef805c2 !== 'undefined') fgs.push({fg: feature_group_2538e4bc70192d33d0df28df8ef805c2, days: 31, key: 'oct'});
    if (typeof feature_group_fdbae0b7e1135223e882f9009ea7d046 !== 'undefined') fgs.push({fg: feature_group_fdbae0b7e1135223e882f9009ea7d046, days: 30, key: 'nov'});
    if (typeof feature_group_e0bba19770ba1d889c798f2542fd1aed !== 'undefined') fgs.push({fg: feature_group_e0bba19770ba1d889c798f2542fd1aed, days: 31, key: 'dec'});
    
    var nameA = _odStations[_originCode];
    var nameB = _odStations[_destCode];
    
    var re1 = new RegExp("<b>" + nameA + " ↔ " + nameB + "</b>");
    var re2 = new RegExp("<b>" + nameB + " ↔ " + nameA + "</b>");
    
    var monthTotals = {sep: 0, oct: 0, nov: 0, dec: 0};
    
    fgs.forEach(function(m) {
        m.fg.eachLayer(function(layer) {
            var tt = layer.getTooltip ? layer.getTooltip() : null;
            if(!tt) return;
            var html = tt.getContent();
            if (re1.test(html) || re2.test(html)) {
                var match = html.match(/([\d,]+) trips/);
                if (match) {
                    var t = parseInt(match[1].replace(/,/g, ''));
                    totalTrips += t;
                    monthTotals[m.key] += t;
                }
            }
        });
        totalDays += m.days;
    });
    
    var avg = totalDays > 0 ? Math.round(totalTrips / totalDays) : 0;
    
    if(resPanel) resPanel.style.display = 'block';
    
    var valEl = document.getElementById('od-flow-val');
    if(valEl) valEl.innerText = avg.toLocaleString() + ' pax/day';
    
    var elSep = document.getElementById('od-sep-val'); if(elSep) elSep.innerText = monthTotals.sep.toLocaleString() + ' (' + Math.round(monthTotals.sep/30) + '/day)';
    var elOct = document.getElementById('od-oct-val'); if(elOct) elOct.innerText = monthTotals.oct.toLocaleString() + ' (' + Math.round(monthTotals.oct/31) + '/day)';
    var elNov = document.getElementById('od-nov-val'); if(elNov) elNov.innerText = monthTotals.nov.toLocaleString() + ' (' + Math.round(monthTotals.nov/30) + '/day)';
    var elDec = document.getElementById('od-dec-val'); if(elDec) elDec.innerText = monthTotals.dec.toLocaleString() + ' (' + Math.round(monthTotals.dec/31) + '/day)';
    
    drawODLine(_originCode, _destCode, avg);
}

function drawODLine(oCode, dCode, avg) {
    if (_odHighlightLine) {
        _odHighlightLine.remove();
        _odHighlightLine = null;
    }
    
    var S = window._metroStops; 
    if (!S || !S[oCode] || !S[dCode]) return;
    var a = S[oCode], b = S[dCode];
    
    // Fallback if avgFlowStyle isn't accessible
    var getStyle = typeof avgFlowStyle === 'function' ? avgFlowStyle : function(v) {
        if(v < 10) return {color:'#607d8b', weight:1, opacity:0.8};
        if(v < 50) return {color:'#00b4d8', weight:2, opacity:0.8};
        if(v < 200) return {color:'#48cae4', weight:3, opacity:0.8};
        if(v < 500) return {color:'#f9c74f', weight:4, opacity:0.8};
        if(v < 2000) return {color:'#f3722c', weight:6, opacity:0.8};
        return {color:'#e63946', weight:8, opacity:0.8};
    };
    
    var style = getStyle(avg);
    style.opacity = 0.95;
    if (avg === 0) {
        style = {color: '#888', weight: 1, opacity: 0.5, dashArray: '5,5'};
    }
    
    if (typeof map_945935b7a94eee1b0ce96a1f4ff7f327 !== 'undefined') {
        _odHighlightLine = L.polyline([a, b], style).addTo(map_945935b7a94eee1b0ce96a1f4ff7f327);
        // Bring to front
        if (_odHighlightLine.bringToFront) {
            _odHighlightLine.bringToFront();
        }
        
        // Also fit bounds
        map_945935b7a94eee1b0ce96a1f4ff7f327.fitBounds(_odHighlightLine.getBounds(), {padding: [50, 50]});
    }
}
