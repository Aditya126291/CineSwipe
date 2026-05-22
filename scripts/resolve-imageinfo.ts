async function getWikiImageUrl(fileName: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles=${encodeURIComponent(fileName)}&iiprop=url`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'CineSwipeBot/1.0 (https://github.com/Aditya126291/CineSwipe; contact@cineswipe.com)'
      }
    });
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId && pages[pageId].imageinfo && pages[pageId].imageinfo[0]) {
      return pages[pageId].imageinfo[0].url;
    }
  } catch (e) {
    console.error(`Error resolving ${fileName}:`, e);
  }
  return null;
}

async function main() {
  const files = [
    'File:Pushpa - The Rise (2021 film).jpg',
    'File:URI - New poster.jpg',
    'File:The office US.jpg',
    'File:Family man movie.jpg',
    'File:Stranger Things logo.png'
  ];

  for (const f of files) {
    const url = await getWikiImageUrl(f);
    console.log(`File: "${f}" -> URL: ${url}`);
  }
}

main();
