
// ===== Avg Flow Per Day — Chart Logic =====

var _chartsRendered = false;

function extractODData(fg, days) {
    var pairs = [];
    fg.eachLayer(function(layer) {
        if (!layer.getTooltip) return;
        var tt = layer.getTooltip();
        if (!tt) return;
        var html = tt.getContent();
        // tooltip format: <b>Station A ↔ Station B</b><br>X,XXX trips
        var m = html.match(/<b>(.+?)<\/b><br>([\d,]+) trips/);
        if (!m) return;
        var trips = parseInt(m[2].replace(/,/g, ''));
        pairs.push({ pair: m[1], avg: Math.round(trips / days) });
    });
    pairs.sort(function(a, b) { return b.avg - a.avg; });
    return pairs.slice(0, 15);
}

function renderCharts() {
    if (_chartsRendered) return;
    _chartsRendered = true;

    var months = [
        {
            name: 'September 2025',
            fg:   feature_group_cb7909cc52e5faace3e7d409ec94e98e,
            days: 30,
            id:   'chart-sep',
            color:  'rgba(78,196,255,0.70)',
            border: 'rgba(78,196,255,1)'
        },
        {
            name: 'October 2025',
            fg:   feature_group_2538e4bc70192d33d0df28df8ef805c2,
            days: 31,
            id:   'chart-oct',
            color:  'rgba(255,170,60,0.70)',
            border: 'rgba(255,170,60,1)'
        },
        {
            name: 'November 2025',
            fg:   feature_group_fdbae0b7e1135223e882f9009ea7d046,
            days: 30,
            id:   'chart-nov',
            color:  'rgba(80,220,120,0.70)',
            border: 'rgba(80,220,120,1)'
        },
        {
            name: 'December 2025',
            fg:   feature_group_e0bba19770ba1d889c798f2542fd1aed,
            days: 31,
            id:   'chart-dec',
            color:  'rgba(255,90,100,0.70)',
            border: 'rgba(255,90,100,1)'
        }
    ];

    Chart.defaults.color = '#cce8ff';
    Chart.defaults.font.family = "'Courier New', monospace";

    months.forEach(function(m) {
        var data = extractODData(m.fg, m.days);
        new Chart(document.getElementById(m.id), {
            type: 'bar',
            data: {
                labels: data.map(function(d) { return d.pair; }),
                datasets: [{
                    label: 'Avg Pax/Day',
                    data:  data.map(function(d) { return d.avg; }),
                    backgroundColor: m.color,
                    borderColor:     m.border,
                    borderWidth: 1,
                    borderRadius: 3,
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text:    m.name,
                        color:   '#7ec8e3',
                        font:    { size: 11, weight: 'bold' },
                        padding: { bottom: 8 }
                    },
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                return '  ' + ctx.parsed.x.toLocaleString() + ' pax/day';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#8ab4cc', font: { size: 8 } },
                        grid:  { color: 'rgba(30,58,74,0.5)' },
                        title: { display: true, text: 'Avg Pax / Day', color: '#4a8fa8', font: { size: 9 } }
                    },
                    y: {
                        ticks: { color: '#cce8ff', font: { size: 8 } },
                        grid:  { color: 'rgba(30,58,74,0.25)' }
                    }
                }
            }
        });
    });
}

function toggleCharts() {
    var panel = document.getElementById('chart-panel');
    var btn   = document.getElementById('chart-btn');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        btn.innerHTML = '&#x25BC; AVG FLOW / DAY';
        renderCharts();
    } else {
        panel.style.display = 'none';
        btn.innerHTML = '&#x25B2; AVG FLOW / DAY';
    }
}

// ===== 4 Map Views — Avg Flow Per Day =====

var _avgMapsBuilt = false;
var _avgMapObjects = {};

function avgFlowStyle(avg) {
    if (avg < 10)   return {color:'#607d8b', weight:0.5, opacity:0.22};
    if (avg < 50)   return {color:'#00b4d8', weight:1.2, opacity:0.55};
    if (avg < 200)  return {color:'#48cae4', weight:2.5, opacity:0.68};
    if (avg < 500)  return {color:'#f9c74f', weight:4.0, opacity:0.80};
    if (avg < 2000) return {color:'#f3722c', weight:6.0, opacity:0.88};
    return              {color:'#e63946', weight:9.0, opacity:0.95};
}

function buildAvgMaps() {
    if (_avgMapsBuilt) return;
    _avgMapsBuilt = true;

    var configs = [
        {fg: feature_group_cb7909cc52e5faace3e7d409ec94e98e, days: 30, id: 'avgmap-sep'},
        {fg: feature_group_2538e4bc70192d33d0df28df8ef805c2, days: 31, id: 'avgmap-oct'},
        {fg: feature_group_fdbae0b7e1135223e882f9009ea7d046, days: 30, id: 'avgmap-nov'},
        {fg: feature_group_e0bba19770ba1d889c798f2542fd1aed, days: 31, id: 'avgmap-dec'}
    ];

    configs.forEach(function(cfg) {
        var m = L.map(cfg.id, {
            center: [12.97, 77.59],
            zoom: 11,
            zoomControl: true,
            preferCanvas: true,
            attributionControl: false
        });
        _avgMapObjects[cfg.id] = m;

        L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            {maxZoom: 19, subdomains: 'abcd'}
        ).addTo(m);

        // Metro skeleton — use corrected line topology
        Object.values(window._metroLines).forEach(function(line) {
            for (var i = 0; i < line.stops.length - 1; i++) {
                var a = window._metroStops[line.stops[i]];
                var b = window._metroStops[line.stops[i + 1]];
                if (!a || !b) return;
                L.polyline([a, b], {color: line.color, weight: 3, opacity: 0.80}).addTo(m);
            }
        });

        // OD flows rescaled to avg pax/day
        cfg.fg.eachLayer(function(layer) {
            var ll = layer.getLatLngs();
            var tt = layer.getTooltip();
            if (!tt) return;
            var html  = tt.getContent();
            var match = html.match(/<b>(.+?)<\/b><br>([\d,]+) trips/);
            if (!match) return;
            var trips = parseInt(match[2].replace(/,/g, ''));
            var avg   = trips / cfg.days;
            var style = avgFlowStyle(avg);
            var pl = L.polyline(ll, style);
            pl.bindTooltip(
                '<b>' + match[1] + '</b><br>' +
                Math.round(avg).toLocaleString() + ' pax/day',
                {sticky: true}
            );
            pl.addTo(m);
        });
    });
}

// ===== Metro Skeleton Rebuild (correct line topology) =====
(function() {
    var S = {
        CLGA: [12.8973539, 77.4612877],  KGIT: [12.9079105, 77.4765784],
        MLSD: [12.914689,  77.4878557],  PATG: [12.9242505, 77.4983509],
        BGUC: [12.9354357, 77.5124063],  RRRN: [12.9365996, 77.5196788],
        NYHM: [12.9416715, 77.5251166],  MYRD: [12.9467183, 77.5301588],
        DJNR: [12.9520578, 77.5370122],  AGPP: [12.9618931, 77.5335788],
        VJN:  [12.9709559, 77.5374044],  HSLI: [12.9742933, 77.5456215],
        MIRD: [12.975632,  77.5553523],  BRCS: [12.9758768, 77.5653767],
        KGWA: [12.9757079, 77.5728757],  VSWA: [12.9745197, 77.58422],
        VDSA: [12.9787419, 77.5916385],  CBPK: [12.9809575, 77.5975756],
        MAGR: [12.9755264, 77.6067902],  TTY:  [12.9730218, 77.6170205],
        HLRU: [12.9764992, 77.626686],   IDN:  [12.9783325, 77.6386612],
        SVRD: [12.9859306, 77.644897],   BYPH: [12.9907594, 77.6523612],
        JTPM: [12.9965158, 77.6684619],  KRAM: [12.9999024, 77.6776703],
        MDVP: [12.9965445, 77.6927176],  GDCP: [12.9934505, 77.7036768],
        DKIA: [12.9888029, 77.711326],   VWIA: [12.9808558, 77.7087854],
        KDNH: [12.977594,  77.7155586],  VDHP: [12.9766408, 77.7248845],
        SSHP: [12.9811949, 77.7275361],  ITPL: [12.9876393, 77.7377718],
        KDGD: [12.9856503, 77.7470121],  UWVL: [12.9873426, 77.7538033],
        WHTM: [12.9957428, 77.7579489],
        // Green Line
        BIET: [13.0574214, 77.4728055],  JIDL: [13.0523616, 77.4879154],
        MNJN: [13.0500898, 77.4944461],  NGSA: [13.0479536, 77.5001422],
        DSH:  [13.0432607, 77.5125535],  JLHL: [13.0394104, 77.5197351],
        PYID: [13.0363176, 77.5254924],  PEYA: [13.0330189, 77.533201],
        YPI:  [13.028486,  77.540857],   YPM:  [13.0232678, 77.5498751],
        SSFY: [13.0146544, 77.5539839],  MHLI: [13.0080475, 77.5488066],
        RJNR: [13.0005247, 77.5496568],  KVPR: [12.9985297, 77.5568986],
        SPRU: [12.9965253, 77.5631963],  SPGD: [12.9904629, 77.5707293],
        CKPE: [12.9668974, 77.5745566],  KRMT: [12.9608788, 77.5746578],
        NLC:  [12.9505266, 77.5736898],  LBGH: [12.9465265, 77.580016],
        SECE: [12.9382573, 77.5800556],  JYN:  [12.9295069, 77.5801439],
        RVR:  [12.921331,  77.5802659],  BSNK: [12.9152208, 77.573598],
        JPN:  [12.9074747, 77.5731279],  PUTH: [12.8960498, 77.5701194],
        APRC: [12.8889671, 77.5626665],  KLPK: [12.8846435, 77.5527546],
        VJRH: [12.8774369, 77.5447414],  TGTP: [12.8714097, 77.5383958],
        APTS: [12.8617298, 77.5299545],
        // Yellow Line (Reach 6)
        RVRY: [12.92186,   77.5800478],  RGDT: [12.9170748, 77.5877835],
        JDHP: [12.9167282, 77.5997303],  BTML: [12.916573,  77.6076327],
        SBJT: [12.9164026, 77.620117],   HSRL: [12.9111955, 77.6261256],
        OFDC: [12.9021241, 77.6316985],  MSRN: [12.8903178, 77.6389484],
        CKBR: [12.8811794, 77.6446126],  BSRD: [12.8710849, 77.6521471],
        HOSR: [12.8642294, 77.6575832],  ETCT: [12.8567984, 77.6632379],
        ECTN: [12.8467985, 77.6709184],  HSKR: [12.839432,  77.6771361],
        HBGI: [12.8294441, 77.6812303],  BMSD: [12.8197552, 77.6879957]
    };

    var LINES = {
        purple: {
            color: '#9b59b6', label: 'Purple Line',
            stops: ['CLGA','KGIT','MLSD','PATG','BGUC','RRRN','NYHM','MYRD','DJNR','AGPP',
                    'VJN','HSLI','MIRD','BRCS','KGWA','VSWA','VDSA','CBPK','MAGR','TTY',
                    'HLRU','IDN','SVRD','BYPH','JTPM','KRAM','MDVP','GDCP','DKIA','VWIA',
                    'KDNH','VDHP','SSHP','ITPL','KDGD','UWVL','WHTM']
        },
        green: {
            color: '#2ecc71', label: 'Green Line',
            stops: ['BIET','JIDL','MNJN','NGSA','DSH','JLHL','PYID','PEYA','YPI','YPM',
                    'SSFY','MHLI','RJNR','KVPR','SPRU','SPGD','KGWA','CKPE','KRMT','NLC',
                    'LBGH','SECE','JYN','RVR','BSNK','JPN','PUTH','APRC','KLPK','VJRH',
                    'TGTP','APTS']
        },
        yellow: {
            color: '#f9c500', label: 'Yellow Line',
            stops: ['RVRY','RGDT','JDHP','BTML','SBJT','HSRL','OFDC','MSRN','CKBR','BSRD',
                    'HOSR','ETCT','ECTN','HSKR','HBGI','BMSD']
        }
    };

    function rebuildSkeleton(fg) {
        fg.clearLayers();
        Object.values(LINES).forEach(function(line) {
            for (var i = 0; i < line.stops.length - 1; i++) {
                var a = S[line.stops[i]], b = S[line.stops[i + 1]];
                if (!a || !b) return;
                L.polyline([a, b], {
                    color: line.color, weight: 4, opacity: 0.85,
                    lineCap: 'round', lineJoin: 'round'
                }).bindTooltip('<div>' + line.label + '</div>', {sticky: true})
                  .addTo(fg);
            }
        });
    }

    window.addEventListener('load', function() {
        setTimeout(function() {
            rebuildSkeleton(feature_group_2bb18305074c0e02130a9c913aa68a74);
        }, 300);
    });

    // Expose for avg-map builder to use correct skeleton
    window._metroStops = S;
    window._metroLines = LINES;
})();

function toggleAvgMaps() {
    var panel = document.getElementById('avgmap-panel');
    var btn   = document.getElementById('avgmap-btn');
    if (panel.style.display === 'none') {
        panel.style.display = 'flex';
        btn.innerHTML = '&#x25BC; 4 MAP VIEWS';
        buildAvgMaps();
        // Allow layout to settle then fix tile rendering
        setTimeout(function() {
            Object.values(_avgMapObjects).forEach(function(m) {
                m.invalidateSize();
            });
        }, 150);
    } else {
        panel.style.display = 'none';
        btn.innerHTML = '&#x25B2; 4 MAP VIEWS';
    }
}


