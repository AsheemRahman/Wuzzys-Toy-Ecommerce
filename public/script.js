//sweet alert for delete confirmation
const alertDelete = document.querySelectorAll('.sweet-alert-delete')

alertDelete.forEach(ele => {
  ele.addEventListener('click', event => {
    event.preventDefault()

    Swal.fire({
      title: 'Deactivate the category',
      text: 'Are you sure you want to deactivate the category?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10051F',
      cancelButtonColor: '#D5D2FF',
      confirmButtonText: 'Confirm'
    }).then(res => {
      if (res.isConfirmed) {
        window.location.href = event.target.closest('a').href
      }
    })
  })
})

//edit collection modal view foreach
const editCollection = document.querySelectorAll('#edit-collection-modal')

editCollection.forEach(ele => {
  ele.addEventListener('click', function () {
    const name = this.getAttribute('data-name')
    const id = this.getAttribute('data-id')
    document.getElementById('editCollectionName').value = name
    document.getElementById('editCollectionId').value = id
  })
})

const imageUpload = document.getElementById('image-upload')
const imageUploadPreview = document.getElementById('image-upload-preview')
let cropper
let currentImage
const cropperModalElement = document.getElementById('cropperModal')
const cropperModal = new bootstrap.Modal(
  document.getElementById('cropperModal'),
  {}
)

imageUpload.addEventListener('change', () => {
  imageUploadPreview.innerHTML = ''

  if (imageUpload.files.length != 3) {
    Swal.fire({
      icon: 'error',
      title: 'Oops',
      text: 'Select three Images'
    })

    imageUpload.value = ''
  } else {
    for (let i = 0; i < imageUpload.files.length; i++) {
      let reader = new FileReader()
      let figure = document.createElement('div')
      figure.classList.add('image-preview-box')

      reader.onload = () => {
        let img = document.createElement('img')
        img.classList.add('preview-img')
        img.setAttribute('src', reader.result)
        figure.appendChild(img)

        // Create delete button with class delete-button
        let deleteButton = document.createElement('button')
        deleteButton.textContent = 'Delete'
        deleteButton.classList.add('btn', 'submit-btn', 'delete-button')
        deleteButton.addEventListener('click', () => {
          // Remove the parent div (figure) when the delete button is clicked
          figure.remove()
          imageUpload.value = ''
        })

        figure.appendChild(deleteButton)
        imageUploadPreview.appendChild(figure)

        img.addEventListener('click', () => {
          currentImage = img
          document.getElementById('image-to-crop').src = reader.result
          cropperModal.show()
          cropperModalElement.addEventListener(
            'shown.bs.modal',
            () => {
              if (cropper) cropper.destroy()
              const imageToCrop = document.getElementById('image-to-crop')
              cropper = new Cropper(imageToCrop, {
                aspectRatio: 0,
                viewMode: 0,
                autoCropArea: 0,
                responsive: true,
                background: false
              })
            },
            { once: true }
          )
        })
      }

      reader.readAsDataURL(imageUpload.files[i])
    }
  }
})

// Crop button event listener
document.getElementById('crop-button').addEventListener('click', () => {
  const canvas = cropper.getCroppedCanvas()
  currentImage.src = canvas.toDataURL()
  cropperModal.hide()
  cropper.destroy()
})

// otp timer

const otpTimerBox = document.getElementById('otp-timer-box');
const otpTimer = document.getElementById('otp-timer');
const otpSendedTime = document.getElementById('otp-sended-time');
const submitOtp = document.getElementById('otp-btn');
const otpEmail=document.getElementById('OTP-email')

const checkTimeOut = setInterval(() => {

    // maximum OTP timer is set for two seconds
    let otpMaxTimer = 120000

    // current date in milliseconds
    let currentDate = Date.now()

    // otp sended time from backend that is store in a hidden box in the form
    let otpExpireTime = otpSendedTime.value

    // get the difference between current time and otp sended time
    let timeLeft = currentDate - otpExpireTime

    // difference between the maximum time and time left
    let displayTimer=otpMaxTimer-timeLeft

    // Calculate minutes and seconds
    let minutes = Math.floor((displayTimer % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((displayTimer % (1000 * 60)) / 1000);

    // Format minutes and seconds to display with leading zeros
    let formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Update the timer display
    otpTimer.value = formattedTime;

    // if the maximum time limit of 2 minute which is 120000 seconds
    if (timeLeft > 120000) {
        Swal.fire({
            title: "Timer expired",
            text: "Do you want to resend the OTP?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#10051F",
            cancelButtonColor: "#D5D2FF",
            confirmButtonText: "Yes, resend it!"
        }).then((result) => {

            // if user confirm to resend the otp then using fetch resend the otp
            if (result.isConfirmed) {
                console.log(otpEmail.innerHTML);

                const URL = `/user/resend/${otpEmail.innerHTML}`
                fetch(URL, {
                    method: "GET"
                }).then((response) => {
                    if (response.ok) {
                        Swal.fire({
                            icon: "success",
                            title: "OTP Sended successfully"
                        }).then(()=>{
                            window.location.reload()
                        })
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "Something went wrong!",
                        }).then(() => {
                            window.location = "/user/signup"
                        })
                    }
                })
            }

            // if the user cancel the otp resend request then redirect to signup page
            if (result.isDismissed) {
                window.location = "/user/signup"
            }
        });
        clearInterval(checkTimeOut)
    }

}, 1000);
