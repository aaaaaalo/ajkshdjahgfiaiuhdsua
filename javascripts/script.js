const urlInput = document.querySelector(".urlInput"),
      suggestionsMenu = document.querySelector(".suggestions");

const frame = document.querySelector('iframe');

const corsUrl = 'https://cors-anywhere.herokuapp.com/';

urlInput.addEventListener("input", () => {
    document.querySelector('.dropdownOptions').style.display = 'none';
    suggestionsMenu.style.display = 'flex';
    const e = urlInput.value.trim();
    if (e == "") {
        suggestionsMenu.style.display = 'none';
        document.querySelector('.dropdownOptions').style.display = 'flex';
    }
    if (e.startsWith('https') || e.startsWith('http')) suggestionsMenu.style.display = 'none';
    let debounceTimeout;
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        getSearchSuggestions(e)
            .then((e) => {
                suggestionsMenu.innerHTML = "";
                if (e.length) {
                    suggestionsMenu.innerHTML = e
                        .map((el) => `<li><a>${el}</a></li>`)
                        .join("");
                    suggestionsMenu.querySelectorAll('li a')
                        .forEach(a => {
                            a.addEventListener(
                                "click",
                                (e) => {
                                    e.preventDefault();

                                    frameLoad(`https://www.google.com/search?q=${encodeURIComponent(e.target.textContent.trim())}`);
                                }
                            );
                        });
                }
            })
            .catch((error) => console.error(error));
    }, 300);
});

const getSearchSuggestions = (e) =>
    fetch(`https://corsproxy.io/?https://clients1.google.com/complete/search?hl=en&output=toolbar&q=${encodeURIComponent(
                e
            )}`, {
        mode: "cors",
        method: "GET",
    })
    .then((res) => {
        if (!res.ok) throw Error(`Unable to find a match: ${res.status} - ${res.statusText}`);
        return res.text();
    })
    .then((data) => {
        let parser = new DOMParser(),
            xmlDoc = parser.parseFromString(data, "text/xml"),
            suggestions = [];

        for (let i = 0; i < xmlDoc.getElementsByTagName("suggestion").length; i++) suggestions.push(xmlDoc.getElementsByTagName("suggestion")[i].getAttribute("data"));

        return suggestions.slice(0, 10);
    })
    .catch((error) => (console.error(error), []));

async function frameLoad(url) {
    await fetch(corsUrl + url)
        .then((res) => res.text())
        .then((text) => {
            document.write(text);
        })
        .catch((err) => console.error(err));

    document.querySelector('head').insertAdjacentHTML('afterbegin', `<base href="https://corsproxy.io/?${encodeURIComponent('https://www.google.com')}">`);
    document.querySelector('.jfN4p').src = 'https://corsproxy.io/?https%3A%2F%2Fwww.google.com%2Fimages%2Fbranding%2Fgooglelogo%2F2x%2Fgooglelogo_color_92x30dp.png';
    window.onbeforeunload = () => 1; /* Makes the page single-use */

    updateATags();
};

function updateATags() {
    document.querySelectorAll('a')
        .forEach((a) => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                fetch(corsUrl + a.href)
                    .then((res) => res.text())
                    .then((text) => {
                        document.documentElement.innerHTML = text;
                        if (a.href.includes('google.com')) {
                            document.querySelector('head').insertAdjacentHTML('afterbegin', `<base href="https://corsproxy.io/?${encodeURIComponent(a.href)}">`);
                        } else {
                            document.querySelector('head').insertAdjacentHTML('afterbegin', `<base href="${a.href}">`);
                        }
                        updateATags();
                    })
                    .catch((err) => console.error(err));
            });
        });
}