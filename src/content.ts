function toFullRes(url: string): string {
  return url.includes('preview.redd.it')
    ? url.replace('preview.redd.it', 'i.redd.it')
    : url;
}

function fixImage(img: HTMLImageElement): void {
  (['src', 'srcset'] as const).forEach(attr => {
    const value = (img as any)[attr] as string | undefined;
    if (value && value.includes('preview.redd.it')) {
      if (attr === 'src') {
        img.src = toFullRes(img.src);
      } else {
        const candidates = img.srcset.split(',').map(entry => {
          const [url, size] = entry.trim().split(' ');
          return { url: toFullRes(url), size: parseInt(size) || 0 };
        });
        const best = candidates.reduce((a, b) => (a.size > b.size ? a : b), { url: '', size: 0 });
        img.src = best.url;
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
      }
    }
  });

  if (!img.hasAttribute('data-enhanced')) {
    img.setAttribute('data-enhanced', 'true');
    img.style.cursor = 'pointer';
    img.addEventListener('click', e => {
      e.stopPropagation();
      window.open(img.src, '_blank');
    });
  }
}

function fixRedditMediaUrl(url: string): string | null {
  try {
    const media = new URL(url);
    if (media.hostname.includes('reddit.com') && media.pathname === '/media') {
      const encoded = media.searchParams.get('url');
      if (!encoded) return null;
      const decoded = decodeURIComponent(encoded);
      if (!decoded.includes('preview.redd.it')) return null;
      const fullRes = toFullRes(decoded);
      media.searchParams.set('url', encodeURIComponent(fullRes));
      return media.toString();
    }
    return null;
  } catch (e) {
    console.warn('Failed to fix Reddit media URL', e);
    return null;
  }
}

function replaceImagesAndLinks(root: Document | Node = document): void {
  (root as Document).querySelectorAll('a[href*="/media?url="]').forEach(a => {
    const anchor = a as HTMLAnchorElement;
    const fixed = fixRedditMediaUrl(anchor.href);
    if (fixed) anchor.href = fixed;
  });

  (root as Document).querySelectorAll('img[src*="preview.redd.it"], img[srcset*="preview.redd.it"]').forEach(el => {
    fixImage(el as HTMLImageElement);
  });

  (root as Document).querySelectorAll('a[href*="/media?url="] img').forEach(el => {
    fixImage(el as HTMLImageElement);
  });
}

chrome.storage.local.get('enabled', data => {
  if (data.enabled === false) return;
  replaceImagesAndLinks();

  new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) replaceImagesAndLinks(node);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
});