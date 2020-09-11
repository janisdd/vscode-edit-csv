

const cookieBoxDisplayVisible = `inline-table`

function toggleDetails() {
	const div = document.querySelector(`.cookie-box .details`) as HTMLDivElement
	const toggleCookieDetailsDiv = document.getElementById(`toggleCookieDetails`) as HTMLDivElement

	const isDisplayed = div.style.display === cookieBoxDisplayVisible

	div.style.display = !isDisplayed ? cookieBoxDisplayVisible : `none`
	toggleCookieDetailsDiv.innerText = !isDisplayed ? `Hide details` : `Show details`
}

const cookieBoxKey = `cookiesBoxKey`
const okString = `ok`
function cookiesOk() {
	localStorage.setItem(cookieBoxKey, okString)
	checkCookieBox()
}


function checkCookieBox() {
	const val = localStorage.getItem(cookieBoxKey)
	if (val === okString) { //hide box
		document.documentElement.style.setProperty(`--cookie-box-display`, `none`)
	}
}
checkCookieBox()