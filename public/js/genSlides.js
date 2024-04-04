function generateContent() {
    const commitBtn = document.getElementsByClassName('commit-btn')[0];
    if(commitBtn.textContent === 'Commit') {
        createContent();
    } else if(commitBtn.textContent === 'Launch') {
        window.open('/genContent', '_blank');
        commitBtn.textContent = 'Commit';
        document.getElementsByClassName('slide-input')[0].value = "";
        document.getElementById('close-section-btn').click();
    }
}

async function createContent() {
    const userInput = document.getElementsByClassName('slide-input')[0].value;    
    const slide = document.querySelector('.active');
    const context = "\n\nContext: " + slide.querySelector('#content-body').innerHTML + "\n\n";
    var image = "";    
    if(course.content[currentSlide].image !== undefined) {
      image = "Image on Slide: " + course.content[currentSlide].imageDescription + "\n\n";
    }
    const commitBtn = document.getElementsByClassName('commit-btn')[0];

    const jsonStruct = "\"content\": \[\{\"type\": \"slide\",\"title\": \"\",\"body\": \"\"\},\{\"type\": \"free-text-task\",\"title\": \"\",\"body\": \"\"\},\{\"type\": \"quiz\",\"title\": \"\",\"questions\": \[\{\"question\": \"\",\"options\": \[\"\", \"\"\],\"answer\": \"\"\}\]\}\]";
    const message = "Json Structure: " + jsonStruct + "\n\nTopic: " + userInput + context + image;

    commitBtn.textContent = "Loading..."
    commitBtn.disabled = true;

    const genSlideRaw = await openAI_Assistants("slideGen", message);
    const genSlide = await genSlideRaw.json();

    var x = genSlide.message;
    x = x.substring(x.indexOf('{'), x.lastIndexOf('}')+1);

    sessionStorage.setItem('genContent', x);
    
    commitBtn.textContent = "Launch"
    commitBtn.disabled = false;
}
