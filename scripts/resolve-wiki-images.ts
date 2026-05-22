async function getWikiImage(title: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(title)}&piprop=original`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'CineSwipeBot/1.0 (https://github.com/Aditya126291/CineSwipe; contact@cineswipe.com)'
      }
    });
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId && pages[pageId].original) {
      return pages[pageId].original.source;
    }
  } catch (e) {
    console.error(`Error fetching image for ${title}:`, e);
  }
  return null;
}

async function main() {
  const titles = [
    'Pushpa: The Rise',
    'Uri: The Surgical Strike',
    'Stranger Things',
    'The Office (American TV series)',
    'Ahsoka (TV series)',
    'Squid Game'
  ];

  for (const t of titles) {
    const imgUrl = await getWikiImage(t);
    console.log(`Title: "${t}" -> URL: ${imgUrl}`);
  }
}

main();
