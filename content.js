// WIP - works somewhat, but gets wonky when you try to scroll

function addClickListeners() {
  const elements = document.querySelectorAll('.gmp-entity-item-content');
  elements.forEach(element => {
    element.addEventListener('click', onElementClick);
  });
}

function updateUAVisibility() {
  const checkbox = document.querySelector('#ua-toggle');
  if (!checkbox) return;

  const isChecked = checkbox.checked;
  const accountElements = document.querySelectorAll('.gmp-entity-item-content, .gmp-popup .gmp-before-text');

  accountElements.forEach(el => {
    if (el.textContent.trim().startsWith('UA-')) {
      const listItem = el.closest('.gmp-entity-item-row');
      if (listItem) {
        listItem.style.display = isChecked ? 'none' : '';
      }
    }
  });
}


// Function to add scroll event listeners to all scrollable containers in the popup
function addScrollListeners() {
  const scrollableContainers = document.querySelectorAll('.gmp-popup .cdk-virtual-scroll-viewport'); 

  scrollableContainers.forEach(container => {
    container.addEventListener('scroll', updateUAVisibility);
  });
}

// Call the function to add scroll listeners
addScrollListeners();


// Function to create the checkbox and attach event handlers
function createToggleSwitch() {
  const productTabBar = document.querySelector('.gmp-product-tab-bar .mat-mdc-tab-labels');
  if (productTabBar && !document.querySelector('#ua-toggle')) {
    const toggleTab = document.createElement('div');
    toggleTab.setAttribute('role', 'tab');
    toggleTab.classList.add('mdc-tab');
    toggleTab.style.cssText = 'display: flex; align-items: center; justify-content: center; margin-left: 10px;';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'ua-toggle';

    const label = document.createElement('label');
    label.htmlFor = 'ua-toggle';
    label.textContent = 'Hide UA Accounts';
    label.style.marginLeft = '5px';
    label.style.color = 'black'; // Adjust as needed to match your UI

    toggleTab.appendChild(checkbox);
    toggleTab.appendChild(label);

    checkbox.addEventListener('change', function() {
      localStorage.setItem('hideUA', this.checked);
      updateUAVisibility();
    });

    productTabBar.appendChild(toggleTab); // Append the toggle to the product tab bar

    // Apply the current state of the checkbox to the account list
    updateUAVisibility();
  }
}

// TEST - Function to adjust scrollbar visibility
// this was an attempt to remove the ability to scroll if there is nothing to scroll to (preventing some of the scroll issues)
function adjustScrollbar() {
  const scrollableContainer = document.querySelector('.gmp-popup .cdk-virtual-scroll-viewport');
  if (scrollableContainer) {
    const contentHeight = scrollableContainer.scrollHeight;
    const containerHeight = scrollableContainer.clientHeight;
    scrollableContainer.style.overflowY = contentHeight > containerHeight ? 'auto' : 'hidden';
  }
}

// Observer callback to handle added nodes
function handleMutation(mutations) {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      updateUAVisibility();
      addClickListeners(); // Reapply event listeners to new elements
    }
  });
}

function setupIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        updateUAVisibility(entry.target);
      }
    });
  });

  const accountElements = document.querySelectorAll('.gmp-popup .gmp-before-text');
  accountElements.forEach(el => observer.observe(el));
}

function observePopup() {
  const popupContainer = document.querySelector('body');
  if (!popupContainer) return;

  if (window.popupObserver) window.popupObserver.disconnect();

  window.popupObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if the popup has been added
        const popupAdded = Array.from(mutation.addedNodes).some(node => node.classList && node.classList.contains('gmp-popup'));
        if (popupAdded) {
          createToggleSwitch(); // Recreate the toggle switch
          setupIntersectionObserver(); // Set up the Intersection Observer
        }
      }
    });
  });

  window.popupObserver.observe(popupContainer, { childList: true, subtree: true });
}

// Initialize the toggle switch and observe the popup when the script is loaded
createToggleSwitch();
observePopup();
addClickListeners(); // Reapply event listeners to new elements
