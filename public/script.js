//sweet alert for delete confirmation
const alertDelete = document.querySelectorAll('.sweet-alert-delete')

alertDelete.forEach(ele => {
  ele.addEventListener('click', event => {
    event.preventDefault()

    Swal.fire({
      title: 'Delete the category',
      text: 'Are you sure you want to delete the category?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DB4444',
      cancelButtonColor: '#D5D2FF',
      confirmButtonText: 'Confirm'
    }).then(res => {
      if (res.isConfirmed) {
        window.location.href = event.target.closest('a').href
      }
    })
  })
})


//--------------------- Add products to cart --------------------------

async function addToCart(productId, price, user) {

  const URL = `/user/add-to-cart/${productId}/?price=${price}`;
  try {
      if (user) {
          const response = await fetch(URL, {
              method: "GET",
              headers: {
                  'Content-Type': 'application/json'
              }
          });
          if (response.ok) {
              const data = await response.json();
              Swal.fire({
                  icon: "success",
                  title: data.message || "Product added to cart",
                  showConfirmButton: false,
                  timer: 700,
              }).then(() => {
                  window.location.reload();
              });
          } else {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to add product to cart");
          }
      }
      else {
          Swal.fire({
              icon: "warning",
              title: "Not logged in",
              text: "Please log in to add products to cart"
          });
      }
  } catch (err) {
      Swal.fire({
          icon: "warning",
          title: err.message,
          text: "Cannot add product to cart"
      });
  }
  }

