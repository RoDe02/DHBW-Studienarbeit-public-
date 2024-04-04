// ##### OpenAI-Api #####
async function openAI_Assistants(type, messageText) {
    var response = null;
    var promptType = sessionStorage.getItem('promptType');
    switch (type) {
        case "chat":
            response = await fetch('/chatAssistant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText, promptType: promptType }),
            });            
            break;
        case "task":    
            response = await fetch('/taskAssistant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText, promptType: promptType }),
            });          
            break;
        case "slideGen":    
            response = await fetch('/slideGenAssistant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText, promptType: promptType }),
            });          
            break;
        default:
            break;
    }
    return response;
}