window.onload = function () {

    setInterval(function(){update()}, 60000);

    update();
};

async function update(){
    loadData()
}

async function loadData() {


    const res = await fetch("./data/showcases.json")
    const text = await res.text()

    let data = JSON.parse(text);

    data = data.sort(function (a, b) {
        return new Date(a.datetime) - new Date(b.datetime);
    });

    document.getElementsByClassName("container")[0].innerHTML = "";

    for (let i = 0; i < data.length; i++) {

        let isOld = false;
        let isLive = false;

        let date = new Date(data[i].datetime)

        let duration = 30;
        if (data[i].duration) {
            duration = data[i].duration;
        }

        let dateWith2Weeks = new Date(date.getTime() + duration*60000 + 7 * 24 * 60 * 60 * 1000);
        let dateWithDuration = new Date(date.getTime() + duration*60000);
        let dateNow = new Date();

        if (dateWith2Weeks < dateNow) {
            continue
        }

        if (dateWithDuration < dateNow) {
            isOld = true;
        }
        else if (dateNow >= date && dateNow <= dateWithDuration) {
            isLive = true;
        }


        let div = document.createElement("div");
        div.className = getClassName("box", isLive, isOld);
        div.style.backgroundImage = `linear-gradient(to bottom, rgba(255, 255, 255, 0.0), rgba(0, 0, 0, 0.75)), url(${data[i].background})`
        if(isOld){
            div.style.filter = "grayscale(100%)";
        }

        let dateSpan = document.createElement("span");
        dateSpan.className = getClassName("date", isLive, isOld);

        let monthSpan = document.createElement("span");
        monthSpan.className = getClassName("month", isLive, false);

        let monthTextP = document.createElement("p");
        monthTextP.className = "monthText";

        monthTextP.innerText = monthNumToText(date.toLocaleString('en-US', {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            month: '2-digit',
        }));

        monthSpan.appendChild(monthTextP);
        dateSpan.appendChild(monthSpan);

        let daySpan = document.createElement("span");
        daySpan.className = getClassName("day", isLive, isOld);;

        let num = date.toLocaleString('en-US', {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            day: '2-digit',
        });

        if(num[0] === "0")
            num = num[1];

        daySpan.innerText = num

        dateSpan.appendChild(daySpan);
        div.appendChild(dateSpan);

        let timeSpan = document.createElement("span");
        timeSpan.className = getClassName("time", isLive, isOld);

        if(isLive)
        {
            timeSpan.innerText = "LIVE";
        }
        else
        {
            timeSpan.innerText = date.toLocaleTimeString('en-US', {
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        hour: 'numeric',
                        minute: '2-digit'
                    });
        }

        

        div.appendChild(timeSpan);


        let showcaseNameSpan = document.createElement("span");
        showcaseNameSpan.className = "showcaseName";

        showcaseNameSpan.innerText = data[i].name;

        div.appendChild(showcaseNameSpan);

        let linksDiv = document.createElement("div");
        linksDiv.className = "links";


        let maxLinks = 3;
        if(data[i].links.length < 3)
            maxLinks = data[i].links.length;

        linksDiv.style.marginLeft = 370 - (maxLinks*40) + "px";

        for (let j = 0; j < data[i].links.length; j++) {

            let link = data[i].links[j];
            let linkA = document.createElement("a");
            linkA.target = "_blank";
            linkA.rel = "noopener noreferrer";

            if(link.site === "youtube"){
                linkA.className = "youtube";
            }
            else if(link.site === "twitch"){
                linkA.className = "twitch";
            }

            linkA.href = link.link;
            linksDiv.appendChild(linkA);
        }

        div.appendChild(linksDiv);

        document.getElementsByClassName("container")[0].appendChild(div);
    }

}

function getClassName(name, live, old){
    if(live){
        return name + "live";
    }
    else if(old){
        return name + "old";
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
