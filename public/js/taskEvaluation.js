async function submitFreetextTask() {
    const context = document.getElementsByClassName('active')[0];
    const userInput = context.querySelector('#free-text-input').value;
    const task = context.querySelector('#content-body').textContent;
    const prompt = "Check the correctness and give explanation if necessary. Ensure that your feedback is systematically organized using HTML. Each distinct element of your response, including the initial correctness assessment and the subsequent explanation, should be enclosed within separate <p> tags. This structure will enhance the readability and organization of your feedback, making it more user-friendly and effective for learning purposes. If the characters '<' / '>' are part of the text content, replace them with '&lt;' / '&gt;'";

    const submitBtn = context.querySelector('.submit-answer-btn');
    const chatSendBtn = document.getElementsByClassName('chat-send-btn')[0];

    submitBtn.disabled = true;
    chatSendBtn.disabled = true;
    await addAIResponse("Task: "  + task + "\n\nUser answer: " + userInput + "\n\n" + prompt, "task");
    submitBtn.disabled = false;
    chatSendBtn.disabled = false;
}

async function submitQuizTask() {
    const context = document.getElementsByClassName('active')[0];
    const submitBtn = context.querySelector('.submit-quiz-btn');
    const chatSendBtn = document.getElementsByClassName('chat-send-btn')[0];

    context.querySelector('.quiz-question');
    
    var index = context.id;
    index = index.substring(index.indexOf('-') + 1,index.length); 
    var userAnswer = "";

    var i = 0;
    var quizText = "";
    const questions = context.querySelectorAll('.quiz-question');
    questions.forEach(question => {
        quizText += "Question " + (i+1) + ": " + course.content[index].questions[i].question + "\n";
        quizText += "Option: " + course.content[index].questions[i].options.toString().replace(/,/g, ';') + "\n";
        quizText += "Correct Answer: " + course.content[index].questions[i].answer + "\n";
        
        options = question.querySelectorAll('input');
        options.forEach(opt => {
            if(opt.checked) {
                quizText += "User answer: " + opt.value + "\n\n";
            }
        });      
        i++;    
    });

    const prompt = "As a professional educator, your primary responsibility is to meticulously assess the user's answers to multiple-choice questions. For each response, begin by stating whether the answer is correct or incorrect. In cases where the user's answer is incorrect, provide a comprehensive and detailed explanation, highlighting the reasons for its inaccuracy and elucidating the correct answer. Ensure that your feedback is systematically organized using HTML. Each distinct element of your response, including the initial correctness assessment and the subsequent explanation, should be enclosed within separate <p> tags. This structure will enhance the readability and organization of your feedback, making it more user-friendly and effective for learning purposes";
    
    submitBtn.disabled = true;
    chatSendBtn.disabled = true;
    await addAIResponse(prompt + quizText, "task");
    submitBtn.disabled = false;
    chatSendBtn.disabled = false;
}