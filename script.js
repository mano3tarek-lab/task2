$(document).ready(function () {

  // لينك الـ API
  var apiUrl = "https://fakestoreapi.com/products";

  var allProducts = [];   // كل المنتجات اللي جاية من الـ API
  var cart = [];          // المنتجات اللي في السلة
  var currentProductId = null;   // المنتج المفتوح في الـ Modal

  // رجّع السلة المحفوظة (لو موجودة) لما الصفحة تفتح
  var savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  showCart();

  // 1) جلب المنتجات من الـ API باستخدام fetch
  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      allProducts = data;
      $("#loading").hide();
      fillCategories();
      showProducts(allProducts);
    })
    .catch(function () {
      $("#loading").hide();
      $("#errorMsg").removeClass("d-none");
    });

  // 2) ملء قائمة الأقسام
  function fillCategories() {
    var categories = [];
    for (var i = 0; i < allProducts.length; i++) {
      if (categories.indexOf(allProducts[i].category) === -1) {
        categories.push(allProducts[i].category);
      }
    }
    for (var j = 0; j < categories.length; j++) {
      $("#categorySelect").append(
        '<option value="' + categories[j] + '">' + categories[j] + '</option>'
      );
    }
  }

  // 3) عرض المنتجات كـ Cards
  function showProducts(products) {
    var html = "";

    if (products.length === 0) {
      html = '<p class="text-center text-muted">مفيش منتجات مطابقة.</p>';
    }

    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      html +=
        '<div class="col-12 col-sm-6 col-lg-3 mb-4">' +
          '<div class="card h-100">' +
            '<img src="' + p.image + '" class="card-img-top product-img" alt="">' +
            '<div class="card-body d-flex flex-column">' +
              '<h6 class="product-title card-title">' + p.title + '</h6>' +
              '<p class="text-muted small mb-1">' + p.category + '</p>' +
              '<p class="fw-bold text-success mb-3">$' + p.price + '</p>' +
              '<div class="mt-auto d-flex gap-2">' +
                '<button class="btn btn-outline-primary btn-sm flex-fill details-btn" data-id="' + p.id + '">التفاصيل</button>' +
                '<button class="btn btn-primary btn-sm flex-fill add-btn" data-id="' + p.id + '">أضف للسلة</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    $("#productsRow").html(html);
  }

  // 4) البحث + الفلترة
  function filterProducts() {
    var text = $("#searchInput").val().toLowerCase();
    var category = $("#categorySelect").val();
    var result = [];

    for (var i = 0; i < allProducts.length; i++) {
      var p = allProducts[i];
      var matchText = p.title.toLowerCase().indexOf(text) !== -1;
      var matchCategory = (category === "all" || p.category === category);

      if (matchText && matchCategory) {
        result.push(p);
      }
    }
    showProducts(result);
  }

  $("#searchInput").on("keyup", filterProducts);
  $("#categorySelect").on("change", filterProducts);

  // ================= السلة =================

  // إضافة منتج للسلة
  function addToCart(id) {
    // لو المنتج موجود في السلة زوّد الكمية
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id == id) {
        cart[i].qty++;
        saveCart();
        showCart();
        return;
      }
    }

    // لو مش موجود دور عليه وضيفه
    for (var j = 0; j < allProducts.length; j++) {
      if (allProducts[j].id == id) {
        cart.push({
          id: allProducts[j].id,
          title: allProducts[j].title,
          price: allProducts[j].price,
          image: allProducts[j].image,
          qty: 1
        });
        break;
      }
    }
    saveCart();
    showCart();
  }

  // عرض السلة
  function showCart() {
    var html = "";
    var total = 0;
    var count = 0;

    if (cart.length === 0) {
      html = '<p class="text-center text-muted mt-4">السلة فاضية</p>';
    }

    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      total += item.price * item.qty;
      count += item.qty;

      html +=
        '<div class="cart-item">' +
          '<img src="' + item.image + '" alt="">' +
          '<div class="cart-item-info">' +
            '<p class="cart-item-title">' + item.title + '</p>' +
            '<div class="text-success small mb-1">$' + item.price + '</div>' +
            '<div class="qty-box">' +
              '<button class="btn btn-outline-secondary btn-sm minus-btn" data-id="' + item.id + '">-</button>' +
              '<span>' + item.qty + '</span>' +
              '<button class="btn btn-outline-secondary btn-sm plus-btn" data-id="' + item.id + '">+</button>' +
            '</div>' +
          '</div>' +
          '<button class="btn btn-sm btn-outline-danger remove-btn" data-id="' + item.id + '">🗑️</button>' +
        '</div>';
    }

    $("#cartItems").html(html);
    $("#cartTotal").text("$" + total.toFixed(2));
    $("#cartCount").text(count);
  }

  // حفظ السلة في المتصفح
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // زرار أضف للسلة (من الكارت)
  $("#productsRow").on("click", ".add-btn", function () {
    addToCart($(this).data("id"));
  });

  // زرار +
  $("#cartItems").on("click", ".plus-btn", function () {
    var id = $(this).data("id");
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id == id) {
        cart[i].qty++;
      }
    }
    saveCart();
    showCart();
  });

  // زرار -
  $("#cartItems").on("click", ".minus-btn", function () {
    var id = $(this).data("id");
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id == id) {
        cart[i].qty--;
        if (cart[i].qty === 0) {
          cart.splice(i, 1);   // لو الكمية بقت صفر شيل المنتج
        }
        break;
      }
    }
    saveCart();
    showCart();
  });

  // زرار الحذف
  $("#cartItems").on("click", ".remove-btn", function () {
    var id = $(this).data("id");
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id == id) {
        cart.splice(i, 1);
        break;
      }
    }
    saveCart();
    showCart();
  });

  // تفريغ السلة
  $("#clearCartBtn").on("click", function () {
    cart = [];
    saveCart();
    showCart();
  });

  // إتمام الشراء
  $("#checkoutBtn").on("click", function () {
    if (cart.length === 0) {
      alert("السلة فاضية!");
      return;
    }
    alert("تم إتمام الشراء بنجاح ✅ شكراً ليك!");
    cart = [];
    saveCart();
    showCart();
  });

  // ================= الـ Modal =================

  // زرار التفاصيل -> يفتح Modal
  $("#productsRow").on("click", ".details-btn", function () {
    var id = $(this).data("id");

    for (var i = 0; i < allProducts.length; i++) {
      if (allProducts[i].id == id) {
        var p = allProducts[i];
        currentProductId = p.id;
        $("#modalTitle").text(p.title);
        $("#modalImg").attr("src", p.image);
        $("#modalCategory").text(p.category);
        $("#modalDesc").text(p.description);
        $("#modalPrice").text("$" + p.price);
        $("#modalRating").text("⭐ " + p.rating.rate + " (" + p.rating.count + " تقييم)");
        break;
      }
    }

    new bootstrap.Modal($("#productModal")[0]).show();
  });

  // زرار أضف للسلة (من الـ Modal)
  $("#modalAddBtn").on("click", function () {
    addToCart(currentProductId);
  });

});