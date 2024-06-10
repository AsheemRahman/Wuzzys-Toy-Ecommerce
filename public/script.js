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


