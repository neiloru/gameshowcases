
// Refresh every minute to update the showcases
window.onload = function () {

    setInterval(function(){update()}, 60000);
    update();
};

function toggleHeader() {
    document.querySelector(".header").classList.toggle("collapsed");
    document.querySelector(".header-toggle").classList.toggle("collapsed");
    let container = document.querySelector(".container");
    if (document.querySelector(".header").classList.contains("collapsed")) {
        container.style.height = "calc(100vh - 1.6rem)";
    } else {
        container.style.height = "";
    }
}

async function update(){
    loadData()
}

async function loadData() {

    let currentYear = new Date().getFullYear();

    const res = await fetch(`./data/${currentYear}/showcases.json`)
    const text = await res.text()

    let data = JSON.parse(text);

    data = data.sort(function (a, b) {
        return new Date(a.datetime) - new Date(b.datetime);
    });

    document.getElementsByClassName("header")[0].innerHTML = "";

    let liveSection = document.createElement("div");
    liveSection.className = "header-section";
    let liveTitle = document.createElement("h2");
    liveTitle.className = "section-title";
    liveTitle.innerText = "Live ";
    let liveCircle = document.createElement("span");
    liveCircle.className = "live-circle";
    liveTitle.appendChild(liveCircle);
    liveSection.appendChild(liveTitle);
    let liveItems = document.createElement("div");
    liveItems.className = "section-items";
    liveSection.appendChild(liveItems);

    let nextSection = document.createElement("div");
    nextSection.className = "header-section";
    let nextTitle = document.createElement("h2");
    nextTitle.className = "section-title";
    nextTitle.innerText = "Next Up";
    nextSection.appendChild(nextTitle);
    let nextItems = document.createElement("div");
    nextItems.className = "section-items";
    nextSection.appendChild(nextItems);

    let hasLive = false;
    let firstEmbedUrl = null;
    let firstEmbedSite = null;

    for (let i = 0; i < data.length; i++) {

        let isLive = false;

        let date = new Date(data[i].datetime)

        let duration = 30;
        if (data[i].duration) {
            duration = data[i].duration;
        }

        let dateWithDuration = new Date(date.getTime() + duration*60000);
        let dateNow = new Date();

        if (dateWithDuration < dateNow) {
            continue;
        }

        if (dateNow >= date && dateNow <= dateWithDuration) {
            isLive = true;
        }

        // Create the showcase box

        let showcaseDiv = document.createElement("div");
        showcaseDiv.className = getClassName("showcase", isLive);

        let thumbnailDiv = document.createElement("div");
        thumbnailDiv.className = "thumbnail";
        thumbnailDiv.style.backgroundImage = `url(${data[i].thumbnail})`
        thumbnailDiv.style.cursor = "pointer";

        // Find embed URL
        let embedUrl = null;
        let embedSite = null;
        for (let j = 0; j < data[i].links.length; j++) {
            let link = data[i].links[j];
            if (link.embed) {
                embedUrl = link.embed;
                embedSite = link.site;
                break;
            }
        }

        if (embedUrl) {
            if (!firstEmbedUrl) {
                firstEmbedUrl = embedUrl;
                firstEmbedSite = embedSite;
            }
            thumbnailDiv.addEventListener("click", (function(url, site) {
                return function() {
                    openPlayer(url, site);
                };
            })(embedUrl, embedSite));
        }

        showcaseDiv.appendChild(thumbnailDiv);

        let nameSpan = document.createElement("span");
        nameSpan.className = "showcase-name";
        nameSpan.innerText = data[i].name;
        showcaseDiv.appendChild(nameSpan);

        let dateRow = document.createElement("div");
        dateRow.className = "showcase-date-row";

        let dateLabel = document.createElement("span");
        dateLabel.className = "showcase-date";
        dateLabel.innerText = date.toLocaleString(undefined, {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
        dateRow.appendChild(dateLabel);

        if (!isLive && date > new Date()) {
            let countdownSpan = document.createElement("span");
            countdownSpan.className = "showcase-countdown";
            dateRow.appendChild(countdownSpan);

            (function(el, target) {
                function tick() {
                    let now = new Date();
                    let diff = target - now;
                    if (diff <= 0) {
                        return;
                    }
                    let d = Math.floor(diff / 86400000);
                    let h = Math.floor((diff % 86400000) / 3600000);
                    let m = Math.floor((diff % 3600000) / 60000);
                    let s = Math.floor((diff % 60000) / 1000);
                    let parts = [];
                    parts.push("Starts in:");
                    if (d > 0) parts.push(d + "d");
                    if (h > 0) parts.push(h + "h");
                    if (m > 0) parts.push(m + "m");
                    parts.push(s + "s");
                    el.innerText = parts.join(" ");
                    setTimeout(tick, 1000);
                }
                tick();
            })(countdownSpan, date);
        }

        showcaseDiv.appendChild(dateRow);

        let linksContainer = document.createElement("div");
        linksContainer.className = "showcase-links";

        for (let j = 0; j < data[i].links.length; j++) {
            let link = data[i].links[j];
            let linkA = document.createElement("a");
            linkA.className = "showcase-link";
            linkA.href = link.link;
            linkA.target = "_blank";
            linkA.rel = "noopener noreferrer";
            linkA.innerText = link.site + " ↗";
            linksContainer.appendChild(linkA);
        }

        showcaseDiv.appendChild(linksContainer);

        if (isLive) {
            hasLive = true;
            liveItems.appendChild(showcaseDiv);
        } else {
            nextItems.appendChild(showcaseDiv);
        }
    }

    if (hasLive) {
        document.getElementsByClassName("header")[0].appendChild(liveSection);
    }
    if (nextItems.children.length > 0) {
        document.getElementsByClassName("header")[0].appendChild(nextSection);
    }

    if (firstEmbedUrl && !document.querySelector(".player-iframe")) {
        openPlayer(firstEmbedUrl, firstEmbedSite);
    }

    if (!document.querySelector(".player-iframe")) {
        let container = document.getElementsByClassName("container")[0];
        container.innerHTML = "";
        let msg = document.createElement("p");
        msg.className = "no-embed-msg";
        msg.innerText = "😔 No embed found\n Please click any thumbnail to open a showcase\n or the link to open as a new tab";
        container.appendChild(msg);
    }

}

function getClassName(name, live){
    if(live){
        return name + "-live";
    }
    else{
        return name;
    }
}

function monthNumToText(num){

    switch(num){
        case "01": return "JAN"
        case "02": return "FEB"
        case "03": return "MAR"
        case "04": return "APR"
        case "05": return "MAY"
        case "06": return "JUN"
        case "07": return "JUL"
        case "08": return "AUG"
        case "09": return "SEP"
        case "10": return "OCT"
        case "11": return "NOV"
        case "12": return "DEC"
    }
}

function openPlayer(embedUrl, site) {
    let container = document.getElementsByClassName("container")[0];
    container.innerHTML = "";

    let playerWrapper = document.createElement("div");
    playerWrapper.className = "player-wrapper";

    let iframe = document.createElement("iframe");
    iframe.className = "player-iframe";

    if (site == "YouTube")
        iframe.src = embedUrl + "?autoplay=1&mute=1";
    else if(site == "Twitch")
        iframe.src = embedUrl + "&autoplay=1&muted=1";

    iframe.allow = "autoplay; encrypted-media";
    iframe.allowFullscreen = true;
    iframe.frameBorder = "0";
    playerWrapper.appendChild(iframe);

    container.appendChild(playerWrapper);
}
