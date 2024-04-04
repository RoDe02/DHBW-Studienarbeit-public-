async function startCourse() {    
    promptType = document.getElementById('promptSelect').value
    const dataToSend = {
        category: document.getElementsByClassName('category')[0].innerHTML,
        promptType: promptType
    };
    
    sessionStorage.setItem('promptType', promptType);
    response = await fetch('/initAssistants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    }); 
    window.open("/start-course?courseId=" + courseId + "&categoryId="+ courseCategory, '_blank');
}