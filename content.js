function checkForAuthToken() {
    let authToken = localStorage.getItem("authToken");

    if (authToken) {
        // Execute your logic here, for example, make the fetch request with the X-Token header.

        const lessonIdMatch = window.location.pathname.match(/\/lessons\/(\d+)/);
        fetchLessonData(lessonIdMatch[1], authToken);
    } else {
        setTimeout(checkForAuthToken, 1000);  // Check again after 1 second
    }
}





function fetchVideoData(entryId) {
    return new Promise((resolve, reject) => {
        fetch(`https://cdnapisec.kaltura.com/p/2019031/sp/201903100/playManifest/entryId/${entryId}/flavorIds/1_wxu1tfjk,1_jgxm7pwe,1_bbasb88h,1_482rdw82/format/applehttp/protocol/https/a.m3u8?referrer=aHR0cHM6Ly9lZHN0ZW0ub3Jn&playSessionId=33909353-6e46-b418-d6ea-fbfa9d8f0e91&clientTag=html5:v2.101&uiConfId=43123921&responseFormat=jsonp&callback=jQuery111109975076076420597_1697681572609&_=1697681572610`)
            .then(response => response.text())
            .then(text => {
                const durationMatch = text.match(/"duration"\s*:\s*(\d+)/);
                if (durationMatch) {
                    const duration = parseInt(durationMatch[1], 10);
                    resolve(duration);
                } else {
                    reject("Failed to extract 'duration' from JSONP response.");
                }
            })
            .catch(error => {
                reject(error);
            });
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
              const promises = [];
              const slideNumbers = [];  // To hold the slide numbers in order
              for (const slide of data.lesson.slides) {
                  if (slide.video_url) {
                      const entryIdMatch = slide.video_url.match(/entry_id=(.*?)(&|$)/);
                      if (entryIdMatch) {
                          promises.push(fetchVideoData(entryIdMatch[1]));
                          slideNumbers.push(slide.id);
                      }
                  }
              }
              let totalDuration = 0;

              Promise.all(promises).then(durations => {
                  durations.forEach((duration, index) => {
                      const slideNumber = slideNumbers[index];
                      injectDurationIntoDOM(slideNumber, duration);
                      totalDuration += duration;
                      
                  });
                  injectTotalDurationIntoTitle(totalDuration);
                  
              });
              
          }
      })
      .catch(error => {
          console.error("Error fetching lesson data:", error);
      });
      
    }


function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function injectDurationIntoDOM(slideNumber, duration) {
    const formattedDuration = formatDuration(duration);
    // 1. Find the slide link element using the slide number in its href.
    const slideElem = document.querySelector(`a[href$='/slides/${slideNumber}']`);
    
    if (!slideElem) {
        console.warn(`Slide element for slideNumber ${slideNumber} not found!`);
        return;
    }

    // 2. Check if we already have a duration element for this slide to avoid adding it multiple times.
    let durationElem = slideElem.querySelector('.slide-duration');
    
    if (!durationElem) {
        // If not, create a new span to hold the duration and add a class for potential styling.
        durationElem = document.createElement('span');
        durationElem.className = 'slide-duration';
        durationElem.style.fontSize = '10px';
        
        // Append the duration element to the slide element.
        slideElem.appendChild(durationElem);
    }

    // 3. Set or update the duration text.
    durationElem.textContent = formattedDuration;
}

function injectTotalDurationIntoTitle(totalDuration) {
    const formattedTotalDuration = formatDuration(totalDuration);
    const titleElem = document.querySelector('.lcts-title');

    if (!titleElem) {
        console.warn("Title element not found!");
        return;
    }

    // Check if we already have a total duration element to avoid adding it multiple times.
    let totalDurationElem = titleElem.querySelector('.total-duration');

    if (!totalDurationElem) {
        // If not, create a new span to hold the total duration and add a class for potential styling.
        totalDurationElem = document.createElement('span');
        totalDurationElem.className = 'total-duration';
        totalDurationElem.style.fontSize = '10px';
        totalDurationElem.style.marginLeft = '5px'; // add some space before the total duration

        titleElem.appendChild(totalDurationElem);
    }

    // Set or update the total duration text.
    totalDurationElem.textContent = ` ${formattedTotalDuration}`;
}

const observer = new MutationObserver((mutationsList, observer) => {
    for(let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // Check if the <a> tags exist now
            const slideElem = document.querySelector(`a[href*='/slides/']`);
            if (slideElem) {
                // Stop observing
                observer.disconnect();
                // Now, execute your logic
                checkForAuthToken();
            }
        }
    }
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });