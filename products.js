// 初始化数据库（首次加载时写入mock数据）
function initDatabase() {
    if (!localStorage.getItem('products')) {
        fetch('data/mock-data.json')
            .then(res => res.json())
            .then(data => {
                // 注意：如果 mock-data.json 里的图片路径也是带文件夹的，这里可能需要处理
                // 但通常建议统一为只存文件名
                localStorage.setItem('products', JSON.stringify(data.products));
                localStorage.setItem('orders', JSON.stringify([]));
                localStorage.setItem('users', JSON.stringify([
                    { id: 1, email: 'user@test.com', password: 'Pass123!', name: '测试用户' }
                ]));
            })
            .catch(() => {
                // 备用初始化数据 - 假设图片直接在根目录
                const defaultData = [
                    { id: 1, title: "有机苹果", price: 12.5, category: "fruits",
                      description: "山东红富士，无农药残留", image: "apple.png" },
                    { id: 2, title: "新鲜菠菜", price: 8.0, category: "vegetables",
                      description: "当日采摘，有机种植", image: "spinach.png" }
                ];
                localStorage.setItem('products', JSON.stringify(defaultData));
            });
    }
}

// 加载所有商品
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    renderProducts(products);
}

// 渲染商品列表 (首页)
function renderProducts(products) {
    const container = document.getElementById('product-container');
    if (!container) return;

    container.innerHTML = products.map(product => `
        <div class="product-card">
            <!-- 【修改点1】直接使用 product.image，不再添加 assets/images/products/ 前缀 -->
            <img src="${product.image}"
                 alt="${product.title}" class="product-img">
            <div class="product-info">
                <div class="product-title">${product.title}</div>
                <div class="product-desc">${product.description}</div>
                <div class="product-price">¥${product.price.toFixed(2)}</div>
                <button class="btn" onclick="addToCart(${product.id})">加入购物车</button>
            </div>
        </div>
    `).join('');
}

// 搜索商品
function searchProducts() {
    const keyword = document.getElementById('search-input').value.trim().toLowerCase();
    if (!keyword) return loadProducts();

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const results = products.filter(p =>
        p.title.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword)
    );

    renderProducts(results);
}

// 商品管理功能（管理后台使用）
function saveProduct() {
    const id = document.getElementById('product-id').value || Date.now();
    const product = {
        id: id,
        title: document.getElementById('product-title').value,
        price: parseFloat(document.getElementById('product-price').value),
        category: document.getElementById('product-category').value,
        description: document.getElementById('product-desc').value,
        // 确保存入的是用户输入的文件名或默认值
        image: document.getElementById('product-image').value || 'default.jpg'
    };

    let products = JSON.parse(localStorage.getItem('products')) || [];
    const index = products.findIndex(p => p.id == id);

    if (index === -1) {
        products.push(product); // 新增
    } else {
        products[index] = product; // 更新
    }

    localStorage.setItem('products', JSON.stringify(products));
    alert('商品保存成功！');
    window.location.href = 'admin.html';
}

function deleteProduct(id) {
    if (confirm('确定删除该商品？此操作不可恢复！')) {
        let products = JSON.parse(localStorage.getItem('products'));
        products = products.filter(p => p.id != id);
        localStorage.setItem('products', JSON.stringify(products));
        loadAdminProducts(); // 重新加载管理页面
    }
}

// 管理后台专用：加载商品列表
function loadAdminProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const container = document.getElementById('admin-products');

    container.innerHTML = products.map(product => `
        <tr>
            <!-- 【修改点2】后台列表缩略图也直接使用文件名 -->
            <td><img src="${product.image}" width="50"></td>
            <td>${product.title}</td>
            <td>¥${product.price.toFixed(2)}</td>
            <td>${product.category}</td>
            <td>
                <button class="btn-edit" onclick="editProduct(${product.id})">编辑</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

// 编辑商品
function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('products'));
    const product = products.find(p => p.id == id);

    document.getElementById('product-id').value = product.id;
    document.getElementById('product-title').value = product.title;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-desc').value = product.description;
    // 【修改点3】回显图片文件名
    document.getElementById('product-image').value = product.image;

    document.getElementById('admin-form').scrollIntoView({ behavior: 'smooth' });
}