// ─── PRUVA Admin Panel — Chart.js Yardımcıları ───
// Dashboard grafikleri için wrapper fonksiyonlar

const chartInstances = {};

// Chart.js'in yüklü olup olmadığını kontrol et
function getChart() {
    return window.Chart || null;
}

// Mevcut chart'ı yok et ve yeni oluştur
function createOrUpdate(canvasId, config) {
    const Chart = getChart();
    if (!Chart) {
        console.warn('Chart.js yüklenmedi');
        return null;
    }
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    // Eski instance varsa yok et
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
        delete chartInstances[canvasId];
    }

    const ctx = canvas.getContext('2d');
    chartInstances[canvasId] = new Chart(ctx, config);
    return chartInstances[canvasId];
}

// ─── Ortak tema renkleri ───
const COLORS = {
    primary: '#38bdf8',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    purple: '#a855f7',
    pink: '#ec4899',
    indigo: '#6366f1',
    teal: '#14b8a6',
    orange: '#f97316',
    gray: '#64748b'
};

const CHART_DEFAULTS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#94a3b8',
                font: { family: 'Inter', size: 11 },
                padding: 16,
                usePointStyle: true,
                pointStyleWidth: 10
            }
        },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            cornerRadius: 10,
            padding: 12,
            titleFont: { family: 'Inter', weight: '600' },
            bodyFont: { family: 'Inter' },
            displayColors: true
        }
    }
};

// ─── Çizgi Grafik (Kullanıcı büyümesi, trend vs.) ───
export function lineChart(canvasId, labels, datasets) {
    return createOrUpdate(canvasId, {
        type: 'line',
        data: {
            labels,
            datasets: datasets.map((ds, i) => ({
                label: ds.label,
                data: ds.data,
                borderColor: ds.color || Object.values(COLORS)[i],
                backgroundColor: (ds.color || Object.values(COLORS)[i]) + '15',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: ds.color || Object.values(COLORS)[i],
                ...ds.options
            }))
        },
        options: {
            ...CHART_DEFAULTS,
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } }
                }
            }
        }
    });
}

// ─── Çubuk Grafik (Günlük teklif sayısı vs.) ───
export function barChart(canvasId, labels, datasets) {
    return createOrUpdate(canvasId, {
        type: 'bar',
        data: {
            labels,
            datasets: datasets.map((ds, i) => ({
                label: ds.label,
                data: ds.data,
                backgroundColor: (ds.color || Object.values(COLORS)[i]) + '40',
                borderColor: ds.color || Object.values(COLORS)[i],
                borderWidth: 1,
                borderRadius: 6,
                maxBarThickness: 40,
                ...ds.options
            }))
        },
        options: {
            ...CHART_DEFAULTS,
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: '#64748b', font: { family: 'Inter', size: 10 }, stepSize: 1 }
                }
            }
        }
    });
}

// ─── Halka/Pasta Grafik (Dağılım vs.) ───
export function doughnutChart(canvasId, labels, data, colors) {
    const chartColors = colors || Object.values(COLORS).slice(0, labels.length);
    return createOrUpdate(canvasId, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: chartColors.map(c => c + '80'),
                borderColor: chartColors,
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            ...CHART_DEFAULTS,
            cutout: '65%',
            plugins: {
                ...CHART_DEFAULTS.plugins,
                legend: {
                    ...CHART_DEFAULTS.plugins.legend,
                    position: 'bottom'
                }
            }
        }
    });
}

// ─── Tüm chart instance'larını yok et ───
export function destroyAll() {
    Object.keys(chartInstances).forEach(key => {
        if (chartInstances[key]) {
            chartInstances[key].destroy();
            delete chartInstances[key];
        }
    });
}

export { COLORS };
