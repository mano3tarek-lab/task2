$(document).ready(function () {

  // API link
  var apiUrl = "https://fakestoreapi.com/products";

  var allProducts = [];          // all products coming from the API
  var cart = [];                 // products in the cart
  var currentProductId = null;   // product currently open in the modal

  // Load the saved cart (if any) when the page opens
  var savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  showCart();

  // 1) Get products from the API using fetch
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

  // 2) Fill the categories dropdown
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

  // 3) Show products as cards
  function showProducts(products) {
    var html = "";

    if (products.length === 0) {
      html = '<p class="text-center text-muted">No matching products.</p>';
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
                '<button class="btn btn-outline-primary btn-sm flex-fill details-btn" data-id="' + p.id + '">Details</button>' +
                '<button class="btn btn-primary btn-sm flex-fill add-btn" data-id="' + p.id + '">Add to cart</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    $("#productsRow").html(html);
  }

  // 4) Search + filter
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

  // ================= Cart =================

  // Add a product to the cart
  function addToCart(id) {
    // If the product is already in the cart, increase its quantity
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id == id) {
        cart[i].qty++;
        saveCart();
        showCart();
        return;
      }
    }

    // Otherwise find it in the products list and add it
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

  // Show the cart
  function showCart() {
    var html = "";
    var total = 0;
    var count = 0;

    if (cart.length === 0) {
      html = '<p class="text-center text-muted mt-4">Your cart is empty</p>';
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

  // Save the cart in the browser
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // "Add to cart" button (on the card)
  $("#productsRow").on("click", ".add-btn", function () {
    addToCart($(this).data("id"));
  });

  // "+" button
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

  // "-" button
  $("#cartItems").on("click", ".minus-btn", function () {
    var id = $(this).data("id");
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id == id) {
        cart[i].qty--;
        if (cart[i].qty === 0) {
          cart.splice(i, 1);   // remove the product when quantity reaches zero
        }
        break;
      }
    }
    saveCart();
    showCart();
  });

  // Remove button
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

  // Clear the cart
  $("#clearCartBtn").on("click", function () {
    cart = [];
    saveCart();
    showCart();
  });

  // Checkout
  $("#checkoutBtn").on("click", function () {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    alert("Order placed successfully ✅ Thank you!");
    cart = [];
    saveCart();
    showCart();
  });

  // ================= Modal =================

  // "Details" button -> open the modal
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
        $("#modalRating").text("⭐ " + p.rating.rate + " (" + p.rating.count + " reviews)");
        break;
      }
    }

    new bootstrap.Modal($("#productModal")[0]).show();
  });

  // "Add to cart" button (inside the modal)
  $("#modalAddBtn").on("click", function () {
    addToCart(currentProductId);
  });

});
