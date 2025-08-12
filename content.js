// This function is the core of our extension
function createOrUpdateSidebar() {
  // --- 1. Find the main chat area ---
  // Note: ChatGPT's class names can change. This is the selector as of mid-2025.
  // You might need to update this if the extension breaks!
  const allMessages = document.querySelectorAll('div[data-message-author-role]');
  
  // If we can't find any messages, stop.
  if (allMessages.length === 0) {
    return;
  }

  // --- 2. Remove the old sidebar if it exists to avoid duplicates ---
  const oldSidebar = document.getElementById('prompt-sidebar');
  if (oldSidebar) {
    oldSidebar.remove();
  }

  // --- 3. Create the new sidebar ---
  const sidebar = document.createElement('div');
  sidebar.id = 'prompt-sidebar';
  
  const title = document.createElement('h3');
  title.textContent = '🚀 Quick Prompts';
  sidebar.appendChild(title);

  const promptList = document.createElement('ul');
  
  // --- 4. Find all USER prompts and create buttons for them ---
  allMessages.forEach((messageElement, index) => {
    // We only want the user's prompts
    if (messageElement.getAttribute('data-message-author-role') === 'user') {
      // Find the actual text inside the message container
      const textElement = messageElement.querySelector('.break-words > div');
      if (!textElement) return; // Skip if we can't find the text

      const promptText = textElement.innerText;
      
      const listItem = document.createElement('li');
      const button = document.createElement('button');
      
      button.textContent = promptText;
      // Add a tooltip for the full prompt text on hover
      button.title = promptText;

      // This is the magic! Add a click event to scroll to the prompt
      button.addEventListener('click', () => {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      
      listItem.appendChild(button);
      promptList.appendChild(listItem);
    }
  });

  // --- 5. Add the finished list to the sidebar and the sidebar to the page ---
  sidebar.appendChild(promptList);
  document.body.appendChild(sidebar);
}

// --- Run the function for the first time ---
// We wait a couple of seconds for the page to load its content initially.
setTimeout(createOrUpdateSidebar, 2000);


// --- Use a MutationObserver to automatically update the sidebar ---
// ChatGPT loads new messages dynamically, so we need to "watch" for changes.
const observer = new MutationObserver((mutations) => {
  // We check if nodes were added, which usually means new messages.
  for (const mutation of mutations) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // A small delay to let the new message fully render before we update.
      setTimeout(createOrUpdateSidebar, 500);
      // We can stop observing after the first relevant change and let the timeout handle it.
      // This is a simple way to avoid firing the update function too many times in a row.
      break; 
    }
  }
});

// Start observing the main chat container for new messages being added.
// Find the element that holds all the messages. This selector might also change.
const mainChatArea = document.querySelector('main');
if (mainChatArea) {
    observer.observe(mainChatArea, { childList: true, subtree: true });
}