function toFullRes(url: string): string {
  if (!url) return url;
  return url.replace(/(?<!external-)preview\.redd\.it/g, 'i.redd.it');
}

function fixImage(img: HTMLImageElement): void {
  if (!img.src || !img.src.includes('preview.redd.it') || img.src.includes('external-preview.redd.it')) return;
  
  img.src = toFullRes(img.src);
  
  if (img.srcset) {
    img.srcset = img.srcset.split(',').map(entry => {
      return entry.replace(/(?<!external-)preview\.redd\.it/g, 'i.redd.it');
    }).join(',');
  }
  
  if (!img.hasAttribute('data-fixed')) {
    img.setAttribute('data-fixed', 'true');
    img.style.cursor = 'pointer';
    img.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(img.src, '_blank');
    };
  }
}

function processNode(node: Node): void {
  if (node.nodeType !== 1) return;
  
  const element = node as Element;
  
  const isInPost = element.closest('shreddit-post') || 
                   element.closest('[data-testid="post-container"]') ||
                   element.tagName === 'SHREDDIT-POST';
  
  if (!isInPost) return;
  
  const images = element.querySelectorAll('img[src*="preview.redd.it"]:not([src*="external-preview"])');
  images.forEach(img => fixImage(img as HTMLImageElement));
}


chrome.storage.sync.get('enabled', data => {
  if (data.enabled === false) return;
  
  document.querySelectorAll('shreddit-post, [data-testid="post-container"]').forEach(post => {
    post.querySelectorAll('img[src*="preview.redd.it"]:not([src*="external-preview"])').forEach(img => {
      fixImage(img as HTMLImageElement);
    });
  });
  
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(processNode);
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
});