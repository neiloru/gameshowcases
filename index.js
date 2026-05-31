let data = null;
let activeShowcaseId = null;

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

async function fetchShowcases() {
    try {
        const response = await fetch('./data/2026/showcases.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch showcases: ${response.status}`);
        }
        const showcases = await response.json();
        console.log('Showcases loaded:', showcases);
        return showcases;
    } catch (error) {
        console.error('Error loading showcases:', error);
        return [];
    }
}

function createShowcaseId(showcase) {
    const date = new Date(showcase.datetime);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const slug = showcase.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `${yyyy}${mm}${dd}_${slug}`;
}

function getShowcaseStatus(showcase) {
    const now = new Date();
    const start = new Date(showcase.datetime);
    const end = new Date(start.getTime() + parseInt(showcase.duration) * 60000);

    if (now >= end) return 'ended';
    if (now >= start && now < end) return 'live';
    return 'upcoming';
}

function createSectionSeparator(text) {
    const li = document.createElement('li');
    li.classList.add('sidebar-section-title');

    if (text === 'Live') {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        dot.setAttribute('width', '10');
        dot.setAttribute('height', '10');
        dot.setAttribute('viewBox', '0 0 10 10');
        dot.style.marginRight = '8px';
        dot.style.verticalAlign = 'middle';
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '5');
        circle.setAttribute('cy', '5');
        circle.setAttribute('r', '5');
        circle.setAttribute('fill', 'red');
        dot.appendChild(circle);
        li.appendChild(dot);
    }

    li.appendChild(document.createTextNode(text));
    return li;
}

function createSeparator() {
    const li = document.createElement('li');
    li.classList.add('sidebar-separator');
    return li;
}

function renderSidebarTitle(data) {
    const sidebarTitle = document.getElementById('sidebar-title');
    sidebarTitle.textContent = data.year;
}

function createSections(showcasesData) {
    const ended = data.showcases.filter(s => getShowcaseStatus(s) === 'ended');
    const live = data.showcases.filter(s => getShowcaseStatus(s) === 'live');
    const upcoming = data.showcases.filter(s => getShowcaseStatus(s) === 'upcoming');

    const sections = [
        { label: 'Ended', items: ended },
        { label: 'Live', items: live },
        { label: 'Upcoming', items: upcoming },
    ];

    return sections;
}

function renderShowcaseList(data, scrollToLive = true) {
    const list = document.getElementById('showcase-list');
    list.innerHTML = '';

    const sections = createSections(data);

    let scrollTarget = null;

    for (let i = 0; i < sections.length; i++) {

        const section = sections[i];
        if (section.items.length === 0) continue;

        const separator1 = createSeparator();
        list.appendChild(separator1);

        const sectionTitle = createSectionSeparator(section.label);
        list.appendChild(sectionTitle);

        const separator2 = createSeparator();
        list.appendChild(separator2);

        // Scroll to Live if available, otherwise Upcoming
        if (section.label === 'Live' && !scrollTarget) {
            scrollTarget = sectionTitle;
        } else if (section.label === 'Upcoming' && !scrollTarget) {
            scrollTarget = sectionTitle;
        }

        for (let j = 0; j < section.items.length; j++) {

            const showcase = section.items[j];
            const li = document.createElement('li');

            li.classList.add('showcase');
            li.id = createShowcaseId(showcase);

            const thumbnail = document.createElement('img');
            thumbnail.src = showcase.thumbnail;
            thumbnail.alt = showcase.name;
            thumbnail.classList.add('showcase-thumbnail');

            const title = document.createElement('span');
            title.textContent = showcase.name;
            title.classList.add('showcase-title');

            const dateRow = document.createElement('div');
            dateRow.classList.add('showcase-date-row');

            let date = new Date(showcase.datetime)
            const dateSpan = document.createElement('span');
            dateSpan.innerText = date.toLocaleString(undefined, {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
            dateSpan.classList.add('showcase-date');
            dateRow.appendChild(dateSpan);

            if (getShowcaseStatus(showcase) === "upcoming" && date > new Date()) {
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

            let linksRow = document.createElement("div");
            linksRow.className = "showcase-links";

            for (let j = 0; j < showcase.links.length; j++) {
                let link = showcase.links[j];
                let linkA = document.createElement("a");
                linkA.className = "showcase-link";
                linkA.href = link;
                linkA.target = "_blank";
                linkA.rel = "noopener noreferrer";

                let domain = getDomainFromLink(link);

                if (domain === "youtube.com") {
                    linkA.innerText = "YouTube↗";
                }
                else if (domain === "twitch.tv") {
                    linkA.innerText = "Twitch↗";
                }


                linksRow.appendChild(linkA);
            }

            li.appendChild(thumbnail);
            li.appendChild(title);
            li.appendChild(dateRow);
            li.appendChild(linksRow);

            li.addEventListener('click', () => {
                document.querySelectorAll('#showcase-list li:not(.sidebar-separator)').forEach(item => item.classList.remove('active'));
                li.classList.add('active');
                activeShowcaseId = li.id;
                document.getElementById('topbar-showcases-title').textContent = showcase.name;
                document.title = showcase.name;
                openIFrame(showcase);
            });

            list.appendChild(li);

            if (j !== section.items.length - 1) {

                list.appendChild(createSeparator());
            }
        }
    }

    // Scroll the sidebar so the live/upcoming section is at the top
    if (scrollTarget && scrollToLive) {
        requestAnimationFrame(() => {
            scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
}

function openUpcomingShowcase() {

    const sections = createSections(data);

    let upcomingShowcase = null;

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section.label === 'Live' && section.items.length > 0) {
            upcomingShowcase = section.items[0];
            break;
        }
        else if (section.label === 'Upcoming' && section.items.length > 0) {
            upcomingShowcase = section.items[0];
            break;
        }
    }

    if (!upcomingShowcase) return;

    console.log("Upcoming Showcase:", upcomingShowcase);

    let sidebarShowcase = document.getElementById(createShowcaseId(upcomingShowcase));

    if(sidebarShowcase)
        sidebarShowcase.classList.add('active');

    activeShowcaseId = createShowcaseId(upcomingShowcase);
    const sidebarTitle = document.getElementById('topbar-showcases-title');
    sidebarTitle.textContent = upcomingShowcase.name;
    document.title = upcomingShowcase.name;

    openIFrame(upcomingShowcase);

}

function getDomainFromLink(link) {
    const url = new URL(link);
    return url.hostname.replace(/^www\./, '');
}

function buildYouYubeEmbedUrl(link) {
    const url = new URL(link);
    const videoId = url.searchParams.get('v');
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
}

function buildTwitchEmbedUrl(link) {
    const url = new URL(link);
    const channel = url.pathname.split('/')[1];
    const thisDomain = window.location.hostname;
    return `https://player.twitch.tv/?channel=${channel}&parent=${thisDomain}&autoplay=1&muted=1`;
}

function openIFrame(showcase) {

    let playerSection = document.getElementById("player-section");
    playerSection.innerHTML = "";

    let iframe = document.createElement("iframe");
    iframe.className = "player-iframe";

    if (showcase.links.length === 0) {

        let noLinkDiv = document.createElement("div");


        let noLinkText = document.createElement("p");
        noLinkText.className = "no-link";
        noLinkText.textContent = "No links available";
        noLinkDiv.appendChild(noLinkText);

        let sadge = document.createElement("img");
        sadge.src = "./data/resources/sadge.png";
        sadge.alt = "Sadge";
        noLinkDiv.appendChild(sadge);

        playerSection.appendChild(noLinkDiv);
        return;
    }

    let domain = getDomainFromLink(showcase.links[0]);

    if (domain === "youtube.com")
        iframe.src = buildYouYubeEmbedUrl(showcase.links[0]);
    else if (domain === "twitch.tv")
        iframe.src = buildTwitchEmbedUrl(showcase.links[0]);

    iframe.allow = "autoplay; encrypted-media";
    iframe.allowFullscreen = true;
    iframe.frameBorder = "0";

    let wrapper = document.createElement("div");
    wrapper.className = "player-wrapper";
    wrapper.appendChild(iframe);
    playerSection.appendChild(wrapper);
}

document.addEventListener('DOMContentLoaded', async () => {
    data = await fetchShowcases();

    data.showcases.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    renderSidebarTitle(data);
    renderShowcaseList(data);
    openUpcomingShowcase();

    setInterval(async () => {
        const newData = await fetchShowcases();
        if (!newData) return;

        newData.showcases.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        data = newData;

        renderShowcaseList(data, false);

        // Re-apply active state without reloading the player
        if (activeShowcaseId) {
            const el = document.getElementById(activeShowcaseId);
            if (el) {
                el.classList.add('active');
            }
            // If element no longer exists, activeShowcaseId stays set but nothing is highlighted
        }
    }, 60000);
});