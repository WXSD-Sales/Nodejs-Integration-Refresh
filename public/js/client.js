
const table = document.getElementById('table'); //token table

const refresh_token = table.rows[2].cells[1].innerText.trim();
const access_token = table.rows[1].cells[1].innerText.trim();

const button = document.getElementById('button'); // run button

const notification = document.getElementById('notification');
const notificationContent = document.getElementById('notification-content');

// request to create a meeting
function runRequest() {
  button.classList.add("is-loading");
  fetch('https://webexapis.com/v1/meetings', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`
    },
    body: JSON.stringify({
      start: "2023-03-16T11:30:00", // Make sure this is a valid date
      end: "2023-03-16T12:30:00",   // Make sure this is a valid date
      timezone: "America/Los_Angeles",
      enabledAutoRecordMeeting: true,
      enableAutomaticLock: false,
      allowAnyUserToBeCoHost: true,
      title: "Incident NC102032"
    })
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }).then(({ hostEmail, hostKey, sipAddress, siteUrl, webLink, title, start, end }) => {
    // update the response card content
    document.getElementById('title').innerHTML = title;
    document.getElementById('sipAddress').innerHTML = sipAddress;
    document.getElementById('siteUrl').innerHTML = siteUrl;
    document.getElementById('webLink').innerHTML = webLink;
    document.getElementById('hostEmail').innerHTML = hostEmail;
    document.getElementById('hostKey').innerHTML = hostKey;
    document.getElementById('start').innerHTML = start;
    document.getElementById('end').innerHTML = end;
    button.classList.remove("is-loading");
  }).catch((error) => {
    // render the notification element
    error.json().then((errorRes) => {
      notification.classList.remove('is-hidden');
      notificationContent.innerHTML = errorRes.message;
      button.classList.remove("is-loading");
    })
  })
}

function removeNotification() {
  notification.classList.add('is-hidden');
}

function getTimeRemaining(endtime) {
  const total = Date.parse(endtime) - Date.parse(new Date());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days,
    hours,
    minutes,
    seconds
  };
}

// Initialize the timer
function initializeClock(id, endtime) {
  const clock = document.getElementById(id);
  const daysSpan = clock.querySelector('.days');
  const hoursSpan = clock.querySelector('.hours');
  const minutesSpan = clock.querySelector('.minutes');
  const secondsSpan = clock.querySelector('.seconds');

  function updateClock() {
    const t = getTimeRemaining(endtime);

    daysSpan.innerHTML = t.days;
    hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
    minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
    secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

    if (t.total <= 0) {
      clearInterval(timeinterval);
    }
  }

  updateClock();
  const timeinterval = setInterval(updateClock, 1000);
}


// Set Timer to 10 seconds - First run
const deadline = new Date(Date.parse(new Date()) + 1 * 1 * 1 * 10 * 1000);
initializeClock('clockdiv', deadline);

// Request for a fresh token from a given refresh_token every 10 seconds and update the table content
setInterval(() => {
  fetch('/refresh_token', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token })
  }).then((response) => response.json().then(({ access_token, expires_in, refresh_token, token_type, scope, refresh_token_expires_in }) => {

    const access_token_expiration_date = new Date();
    access_token_expiration_date.setSeconds(access_token_expiration_date.getSeconds() + expires_in);

    const refresh_token_expiration_date = new Date();
    refresh_token_expiration_date.setSeconds(refresh_token_expiration_date.getSeconds() + refresh_token_expires_in);

    // reset the timer to 10 seconds at each run
    const deadline = new Date(Date.parse(new Date()) + 1 * 1 * 1 * 10 * 1000);
    initializeClock('clockdiv', deadline);

    table.rows[1].cells[1].innerText = access_token;
    table.rows[2].cells[1].innerText = refresh_token;
    table.rows[3].cells[1].innerText = access_token_expiration_date.toLocaleString()
    table.rows[4].cells[1].innerText = refresh_token_expiration_date.toLocaleString()
    table.rows[5].cells[1].innerText = scope;

  }));
}, 10000);