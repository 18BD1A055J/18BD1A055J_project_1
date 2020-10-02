const updateButton = document.querySelector('#updateButton')

updateButton.addEventListener('click', _ => {
    let vid = document.getElementsByName("ventilatorId")
    vid = vid[0].value
    let st = document.getElementsByName("status")
    st = st[0].value
    fetch('/update', {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ventilatorId: vid,
        status: st
      })
    })
    .then(res => {
        if (res.ok) return res.json()
      })
      .then(data => {
        window.location.replace('/ventilators')
      })
  })