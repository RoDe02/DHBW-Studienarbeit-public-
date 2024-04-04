// Function to add a user message to the chat
function addUserMessage(message) {
    const chatMessages = document.querySelector('.chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'user-message');
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
    addAIResponse(message, "chat");
  }
  
  // Function to add an AI response to the chat
  async function addAIResponse(message, type) {
    document.getElementsByClassName('chat-send-btn')[0].disabled = true;
    const slide = document.querySelector('.active');
    const context = "Context: " + slide.querySelector('#content-body').innerHTML + "\n\n";
    var image = "";    
    if(course.content[currentSlide].image !== undefined) {
      image = "Image on Slide: " + course.content[currentSlide].imageDescription + "\n\n";
    }
    if(type == "chat") {
      message = context + image + "User Message: " + message;
    } else {
      message = image + message;   
    }     

    const aiAnswerRaw = await openAI_Assistants(type, message);
    const aiAnswer = await aiAnswerRaw.json();

    const chatMessages = document.querySelector('.chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'ai-message');
    messageElement.innerHTML = aiAnswer.message;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
    document.getElementsByClassName('chat-send-btn')[0].disabled = false;
  }
  
  // Send message and add AI response
  function sendMessage() {
    const inputField = document.getElementById('chatInput');
    const message = inputField.value.trim();
    
    if (message) {
      addUserMessage(message);
      inputField.value = ''; // Clear the input field
    }
  }
  
  // Attach event listener to the send button
  document.getElementsByClassName('chat-send-btn')[0].addEventListener('click', sendMessage);
  
  // Event listener for the enter key in the input field
  document.getElementsByClassName('chat-input')[0].addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Scroll to the latest message
  function scrollToBottom() {
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }