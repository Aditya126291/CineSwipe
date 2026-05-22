async function findImages(title: string) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=images&titles=${encodeURIComponent(title)}&imlimit=500`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'CineSwipeBot/1.0 (https://github.com/Aditya126291/CineSwipe; contact@cineswipe.com)'
      }
    });
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId && pages[pageId].images) {
      console.log(`Images for "${title}":`);
      for (const img of pages[pageId].images) {
        console.log(`  - ${img.title}`);
      }
    } else {
      console.log(`No images found for "${title}".`);
    }
  } catch (e) {
    console.error(`Error searching images for ${title}:`, e);
  }
}

async function main() {
  await findImages('The Family Man');
  await findImages('Stranger Things');
}

main();
