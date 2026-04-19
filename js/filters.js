
// ===================================================
// INTERACTIVE PASSENGER FLOW RANGE FILTER
// ===================================================

// Map from polyline color -> range key (matches folium generated colors)
var _COLOR_TO_RANGE = {
    '#607d8b': 'lt500',
    '#00b4d8': 'r500_2k',
    '#48cae4': 'r2k_5k',
    '#f9c74f': 'r5k_15k',
    '#f3722c': 'r15k_50k',
    '#e63946': 'gt50k'
};

// Original opacity per range (from folium output)
var _RANGE_OPACITY = {
    'lt500':    0.18,
    'r500_2k':  0.45,
    'r2k_5k':   0.60,
    'r5k_15k':  0.75,
    'r15k_50k': 0.85,
    'gt50k':    0.92
};

var _activeFlow = {
    'lt500':true,'r500_2k':true,'r2k_5k':true,
    'r5k_15k':true,'r15k_50k':true,'gt50k':true
};

function _getODGroups() {
    return [
        feature_group_cb7909cc52e5faace3e7d409ec94e98e,
        feature_group_2538e4bc70192d33d0df28df8ef805c2,
        feature_group_fdbae0b7e1135223e882f9009ea7d046,
        feature_group_e0bba19770ba1d889c798f2542fd1aed
    ];
}

function applyFlowFilter() {
    _getODGroups().forEach(function(fg) {
        fg.eachLayer(function(layer) {
            var color = layer.options && layer.options.color;
            var rk = _COLOR_TO_RANGE[color];
            if (!rk) return;
            if (_activeFlow[rk]) {
                layer.setStyle({opacity: _RANGE_OPACITY[rk], stroke: true, fillOpacity: 0.2});
            } else {
                layer.setStyle({opacity: 0, stroke: false, fillOpacity: 0});
            }
        });
    });
}

function toggleFlowRange(rangeKey, el) {
    _activeFlow[rangeKey] = !_activeFlow[rangeKey];
    var on = _activeFlow[rangeKey];
    el.querySelector('.fr-check').innerHTML = on ? '&#x2713;' : '&#x2717;';
    el.querySelector('.fr-check').style.color = on ? '#4fc3f7' : '#f3722c';
    if (on) { el.classList.remove('fr-off'); } else { el.classList.add('fr-off'); }
    applyFlowFilter();
}

function flowFilterAll(on) {
    Object.keys(_activeFlow).forEach(function(k){ _activeFlow[k] = on; });
    document.querySelectorAll('.flow-range-row').forEach(function(el) {
        el.querySelector('.fr-check').innerHTML = on ? '&#x2713;' : '&#x2717;';
        el.querySelector('.fr-check').style.color = on ? '#4fc3f7' : '#f3722c';
        if (on) { el.classList.remove('fr-off'); } else { el.classList.add('fr-off'); }
    });
    applyFlowFilter();
}

// ===================================================
// INTERACTIVE AVG FLOW / DAY RANGE FILTER (4-map view)
// ===================================================

var _AVG_COLOR_TO_RANGE = {
    '#607d8b': 'avg_lt10',
    '#00b4d8': 'avg_10_50',
    '#48cae4': 'avg_50_200',
    '#f9c74f': 'avg_200_500',
    '#f3722c': 'avg_500_2k',
    '#e63946': 'avg_gt2k'
};

var _AVG_OPACITY = {
    'avg_lt10':0.22,'avg_10_50':0.55,'avg_50_200':0.68,
    'avg_200_500':0.80,'avg_500_2k':0.88,'avg_gt2k':0.95
};

var _activeAvg = {
    'avg_lt10':true,'avg_10_50':true,'avg_50_200':true,
    'avg_200_500':true,'avg_500_2k':true,'avg_gt2k':true
};

function applyAvgFilter() {
    if (!window._avgMapObjects) return;
    Object.values(window._avgMapObjects).forEach(function(m) {
        m.eachLayer(function(layer) {
            if (!layer.setStyle || !layer.options || !layer.options.color) return;
            var rk = _AVG_COLOR_TO_RANGE[layer.options.color];
            if (!rk) return;
            if (_activeAvg[rk]) {
                layer.setStyle({opacity: _AVG_OPACITY[rk], stroke: true});
            } else {
                layer.setStyle({opacity: 0, stroke: false});
            }
        });
    });
}

function toggleAvgRange(rangeKey, el) {
    _activeAvg[rangeKey] = !_activeAvg[rangeKey];
    var on = _activeAvg[rangeKey];
    el.querySelector('.fr-check').innerHTML = on ? '&#x2713;' : '&#x2717;';
    el.querySelector('.fr-check').style.color = on ? '#4fc3f7' : '#f3722c';
    if (on) { el.classList.remove('fr-off'); } else { el.classList.add('fr-off'); }
    applyAvgFilter();
}

function avgFilterAll(on) {
    Object.keys(_activeAvg).forEach(function(k){ _activeAvg[k] = on; });
    document.querySelectorAll('.avg-range-row').forEach(function(el) {
        el.querySelector('.fr-check').innerHTML = on ? '&#x2713;' : '&#x2717;';
        el.querySelector('.fr-check').style.color = on ? '#4fc3f7' : '#f3722c';
        if (on) { el.classList.remove('fr-off'); } else { el.classList.add('fr-off'); }
    });
    applyAvgFilter();
}



// ===== INTERACTIVE PASSENGER FLOW RANGE FILTER =====
var _C2R = {
    '#607d8b':'lt500','#00b4d8':'r500_2k','#48cae4':'r2k_5k',
    '#f9c74f':'r5k_15k','#f3722c':'r15k_50k','#e63946':'gt50k'
};
var _ROP = {
    'lt500':0.18,'r500_2k':0.45,'r2k_5k':0.60,
    'r5k_15k':0.75,'r15k_50k':0.85,'gt50k':0.92
};
var _AF = {
    'lt500':true,'r500_2k':true,'r2k_5k':true,
    'r5k_15k':true,'r15k_50k':true,'gt50k':true
};

function applyFlowFilter() {
    [feature_group_cb7909cc52e5faace3e7d409ec94e98e,
     feature_group_2538e4bc70192d33d0df28df8ef805c2,
     feature_group_fdbae0b7e1135223e882f9009ea7d046,
     feature_group_e0bba19770ba1d889c798f2542fd1aed
    ].forEach(function(fg) {
        fg.eachLayer(function(layer) {
            var rk = _C2R[layer.options && layer.options.color];
            if (!rk) return;
            if (_AF[rk]) {
                layer.setStyle({opacity:_ROP[rk],stroke:true,fillOpacity:0.2});
            } else {
                layer.setStyle({opacity:0,stroke:false,fillOpacity:0});
            }
        });
    });
}

function toggleFlowRange(rk, el) {
    _AF[rk] = !_AF[rk];
    var on = _AF[rk];
    el.querySelector('.fr-check').innerHTML = on ? '&#x2713;' : '&#x2717;';
    el.querySelector('.fr-check').style.color = on ? '#4fc3f7' : '#f3722c';
    on ? el.classList.remove('fr-off') : el.classList.add('fr-off');
    applyFlowFilter();
}

function flowFilterAll(on) {
    Object.keys(_AF).forEach(function(k){ _AF[k]=on; });
    document.querySelectorAll('.flow-range-row').forEach(function(el) {
        el.querySelector('.fr-check').innerHTML = on ? '&#x2713;' : '&#x2717;';
        el.querySelector('.fr-check').style.color = on ? '#4fc3f7' : '#f3722c';
        on ? el.classList.remove('fr-off') : el.classList.add('fr-off');
    });
    applyFlowFilter();
}

// ===== AVG FLOW / DAY RANGE FILTER (4-map view) =====
var _AC2R = {
    '#607d8b':'avg_lt10','#00b4d8':'avg_10_50','#48cae4':'avg_50_200',
    '#f9c74f':'avg_200_500','#f3722c':'avg_500_2k','#e63946':'avg_gt2k'
};
var _AOP = {
    'avg_lt10':0.22,'avg_10_50':0.55,'avg_50_200':0.68,
    'avg_200_500':0.80,'avg_500_2k':0.88,'avg_gt2k':0.95
};
var _AA = {
    'avg_lt10':true,'avg_10_50':true,'avg_50_200':true,
    'avg_200_500':true,'avg_500_2k':true,'avg_gt2k':true
};

function applyAvgFilter() {
    if (!window._avgMapObjects) return;
    Object.values(window._avgMapObjects).forEach(function(m) {
        m.eachLayer(function(layer) {
            if (!layer.setStyle||!layer.options||!layer.options.color) return;
            var rk = _AC2R[layer.options.color];
            if (!rk) return;
            if (_AA[rk]) {
                layer.setStyle({opacity:_AOP[rk],stroke:true});
            } else {
                layer.setStyle({opacity:0,stroke:false});
            }
        });
    });
}

function toggleAvgRange(rk, el) {
    _AA[rk] = !_AA[rk];
    var on = _AA[rk];
    el.querySelector('.fr-check').innerHTML = on ? '&#x2713;' : '&#x2717;';
    el.querySelector('.fr-check').style.color = on ? '#4fc3f7' : '#f3722c';
    on ? el.classList.remove('fr-off') : el.classList.add('fr-off');
    applyAvgFilter();
}

function avgFilterAll(on) {
    Object.keys(_AA).forEach(function(k){ _AA[k]=on; });
    document.querySelectorAll('.avg-range-row').forEach(function(el) {
        el.querySelector('.fr-check').innerHTML = on ? '&#x2713;' : '&#x2717;';
        el.querySelector('.fr-check').style.color = on ? '#4fc3f7' : '#f3722c';
        on ? el.classList.remove('fr-off') : el.classList.add('fr-off');
    });
    applyAvgFilter();
}


