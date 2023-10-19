function checkForAuthToken() {
    let authToken = localStorage.getItem("authToken");

    if (authToken) {
        // Execute your logic here, for example, make the fetch request with the X-Token header.
        console.log('authToken found:', authToken);

        const lessonIdMatch = window.location.pathname.match(/\/lessons\/(\d+)/);
        fetchLessonData(lessonIdMatch[1], authToken);
    } else {
        setTimeout(checkForAuthToken, 1000);  // Check again after 1 second
    }
}

checkForAuthToken();



function fetchVideoData(entryId) {
    fetch(`https://cdnapisec.kaltura.com/p/2019031/sp/201903100/playManifest/entryId/${entryId}/flavorIds/1_wxu1tfjk,1_jgxm7pwe,1_bbasb88h,1_482rdw82/format/applehttp/protocol/https/a.m3u8?referrer=aHR0cHM6Ly9lZHN0ZW0ub3Jn&playSessionId=33909353-6e46-b418-d6ea-fbfa9d8f0e91&clientTag=html5:v2.101&uiConfId=43123921&responseFormat=jsonp&callback=jQuery111109975076076420597_1697681572609&_=1697681572610`)
        .then(response => response.text())
        .then(text => {
            const durationMatch = text.match(/"duration"\s*:\s*(\d+)/);
            if (durationMatch) {
                const duration = parseInt(durationMatch[1], 10);
                console.log(duration);
            } else {
                console.error("Failed to extract 'duration' from JSONP response.");
            }
        })
        .catch(error => {
            console.error("Error fetching video data:", error);
        });

}


function fetchLessonData(lessonId, authToken) {
    fetch(`https://us.edstem.org/api/lessons/${lessonId}?view=1`, {
        headers: {
            "X-Token": authToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.lesson && data.lesson.slides) {
            for (const slide of data.lesson.slides) {
                if (slide.video_url) {
                    const entryIdMatch = slide.video_url.match(/entry_id=(.*?)(&|$)/);
                    if (entryIdMatch) {
                        console.log(entryIdMatch[1]);
                        fetchVideoData(entryIdMatch[1]);
                    }
                }
            }
        }
    })
    .catch(error => {
        console.error("Error fetching lesson data:", error);
    });
}





