const storageKey = 'shoppingList';
let products = [];

function saveData() {
    localStorage.setItem(storageKey, JSON.stringify(products));
    updateCharts();
}

function loadData() {
    const data = localStorage.getItem(storageKey);
    if (data) {
        products = JSON.parse(data);
    }
}

function renderList() {
    const tbody = document.querySelector('#product-table tbody');
    tbody.innerHTML = '';
    products.forEach((p, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" ${p.purchased ? 'checked' : ''} data-index="${index}" class="purchase"></td>
            <td>${p.name}</td>
            <td>${p.quantity}</td>
            <td>${p.category || ''}</td>
            <td class="actions">
                <button class="edit" data-index="${index}" title="Editar"><i class="fa fa-edit"></i></button>
                <button class="delete" data-index="${index}" title="Eliminar"><i class="fa fa-trash"></i></button>
            </td>`;
        tbody.appendChild(row);
    });
}

function addProduct(name, quantity, category) {
    products.push({ name, quantity, category, purchased: false });
    saveData();
    renderList();
}

function deleteProduct(index) {
    if (confirm('¿Eliminar este producto?')) {
        products.splice(index, 1);
        saveData();
        renderList();
    }
}

function editProduct(index) {
    const p = products[index];
    const name = prompt('Producto', p.name);
    if (name === null || name.trim() === '') return;
    const quantity = prompt('Cantidad', p.quantity);
    if (quantity === null || quantity.trim() === '') return;
    const category = prompt('Categoría', p.category);
    products[index] = { name, quantity, category, purchased: p.purchased };
    saveData();
    renderList();
}

function togglePurchased(index, checked) {
    products[index].purchased = checked;
    saveData();
}

function clearList() {
    if (confirm('¿Borrar toda la lista?')) {
        products = [];
        saveData();
        renderList();
    }
}

function updateCharts() {
    const nameCount = {};
    const categoryCount = {};
    products.forEach(p => {
        nameCount[p.name] = (nameCount[p.name] || 0) + 1;
        if (p.category) {
            categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
        }
    });

    updateBarChart(productChart, Object.keys(nameCount), Object.values(nameCount), 'Productos más frecuentes');
    updateBarChart(categoryChart, Object.keys(categoryCount), Object.values(categoryCount), 'Productos por categoría');
}

function updateBarChart(chart, labels, data, label) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].label = label;
    chart.update();
}

function initCharts() {
    const ctx1 = document.getElementById('productChart').getContext('2d');
    const ctx2 = document.getElementById('categoryChart').getContext('2d');
    window.productChart = new Chart(ctx1, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: '', data: [], backgroundColor: '#3498db' }] },
        options: { responsive: true }
    });
    window.categoryChart = new Chart(ctx2, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: '', data: [], backgroundColor: '#2ecc71' }] },
        options: { responsive: true }
    });
    updateCharts();
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initCharts();
    renderList();

    document.getElementById('product-form').addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const quantity = document.getElementById('quantity').value.trim();
        const category = document.getElementById('category').value.trim();
        if (!name || !quantity) {
            alert('Nombre y cantidad son obligatorios');
            return;
        }
        addProduct(name, quantity, category);
        e.target.reset();
    });

    document.querySelector('#product-table tbody').addEventListener('click', e => {
        if (e.target.closest('.delete')) {
            const index = e.target.closest('button').dataset.index;
            deleteProduct(index);
        } else if (e.target.closest('.edit')) {
            const index = e.target.closest('button').dataset.index;
            editProduct(index);
        } else if (e.target.closest('.purchase')) {
            const checkbox = e.target.closest('.purchase');
            const index = checkbox.dataset.index;
            togglePurchased(index, checkbox.checked);
        }
    });

    document.getElementById('clear-list').addEventListener('click', clearList);

    document.getElementById('toggle-mode').addEventListener('click', () => {
        document.body.classList.toggle('dark');
    });
});
