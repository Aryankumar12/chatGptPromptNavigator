// This function is the core of our extension
function createOrUpdateSidebar() {
  const oldSidebar = document.getElementById('prompt-sidebar');
  if (oldSidebar) oldSidebar.remove();

  const allMessages = document.querySelectorAll('div[data-message-author-role]');
  if (allMessages.length === 0) return;

  const sidebar = document.createElement('div');
  sidebar.id = 'prompt-sidebar';
  
  const title = document.createElement('h3');
  title.textContent = '🚀 Prompt Pilot';
  sidebar.appendChild(title);

  const promptList = document.createElement('ul');
  
  allMessages.forEach((messageElement) => {
    if (messageElement.getAttribute('data-message-author-role') === 'user') {
      const textElement = messageElement.querySelector('.break-words > div');
      if (!textElement) return;
      const promptText = textElement.innerText;
      
      const listItem = document.createElement('li');
      const button = document.createElement('button');
      button.textContent = promptText;
      button.title = promptText;

      button.addEventListener('click', () => {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      
      listItem.appendChild(button);
      promptList.appendChild(listItem);
    }
  });

  sidebar.appendChild(promptList);
  
  // --- NEW: Create and add the resize handle ---
  const resizeHandle = document.createElement('div');
  resizeHandle.id = 'resize-handle';
  sidebar.appendChild(resizeHandle);

  document.body.appendChild(sidebar);

  // --- ACTIVATE NEW FEATURES ---
  makeDraggable(sidebar, title);
  makeResizable(sidebar, resizeHandle);
}

// --- FUNCTION TO MAKE AN ELEMENT DRAGGABLE ---
function makeDraggable(element, handle) {
  let isDragging = false;
  let offsetX, offsetY;

  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - element.getBoundingClientRect().left;
    offsetY = e.clientY - element.getBoundingClientRect().top;
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    element.style.left = `${e.clientX - offsetX}px`;
    element.style.top = `${e.clientY - offsetY}px`;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });
}

// --- NEW: FUNCTION TO MAKE AN ELEMENT RESIZABLE ---
function makeResizable(element, handle) {
  let isResizing = false;
  let startX, startY, startWidth, startHeight;

  handle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
    startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const newWidth = startWidth + e.clientX - startX;
    const newHeight = startHeight + e.clientY - startY;
    element.style.width = `${newWidth}px`;
    element.style.height = `${newHeight}px`;
  });
  
  window.addEventListener('mouseup', () => { isResizing = false; });
}

// --- Initial run and MutationObserver to watch for changes ---
setTimeout(createOrUpdateSidebar, 2000);

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      setTimeout(createOrUpdateSidebar, 500);
      break; 
    }
  }
});

const mainChatArea = document.querySelector('main');
if (mainChatArea) {
  observer.observe(mainChatArea, { childList: true, subtree: true });
}