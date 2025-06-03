function calcLocalTime() {

    const timeElements = document.querySelectorAll(".time");


    timeElements.forEach(function (element) {
        let time = new Date(new Date(element.textContent))
        element.textContent = time.toLocaleTimeString('en-US', {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            hour: 'numeric',
            minute: '2-digit'
        });
    });
}


window.onload = function () {

    loadData()


    calcLocalTime();
};

async function loadData() {


    const res = await fetch("./data/showcases.json")
    const text = await res.text()

    let data = JSON.parse(text);

    data = data.sort(function (a, b) {
        return new Date(a.datetime) - new Date(b.datetime);
    });

    for (let i = 0; i < data.length; i++) {

        let date = new Date(data[i].datetime)


        let div = document.createElement("div");
        div.className = "box"
        div.style.backgroundImage = `linear-gradient(to bottom, rgba(255, 255, 255, 0.0), rgba(0, 0, 0, 0.75)), url(${data[i].background})`

        let dateSpan = document.createElement("span");
        dateSpan.className = "date";

        let monthSpan = document.createElement("span");
        monthSpan.className = "month";

        let monthTextP = document.createElement("p");
        monthTextP.className = "monthText";

        monthTextP.innerText = monthNumToText(date.toLocaleString('en-US', {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            month: '2-digit',
        }));

        monthSpan.appendChild(monthTextP);
        dateSpan.appendChild(monthSpan);

        let daySpan = document.createElement("span");
        daySpan.className = "day";

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
        timeSpan.className = "time";

        timeSpan.innerText = date.toLocaleTimeString('en-US', {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            hour: 'numeric',
            minute: '2-digit'
        });

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

//<div className="box" style="background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.0), rgba(0, 0, 0, 0.75)), url('https://cms-assets.unrealengine.com/AiKUh5PQCTaOFnmJDZJBfz/resize=width:900/output=format:webp/cm7dh2rnj0u4q07obay9n6lle')">
//    <span className="date">
//        <span className="month">
//            <p className="monthText">JUN</p>
//        </span>
//        <span className="day">3</span>
//    </span>
//    <span className="time">2025/06/03 13:30:00 +0000</span>
//    <span className="showcaseName">State of Unreal</span>
//    <div className="links">
//        <a className="youtube" href="https://youtube.com"></a>
//    </div>
//</div>