async function test() {
  const items = [
    { id: 1396, title: 'Breaking Bad', key: 'HhesaQXLuRY' },
    { id: 66732, title: 'Stranger Things', key: 'b9EkMc79ZSU' },
    { id: 82068, title: 'Mirzapur', key: 'ZNeGF-PvRHY' },
    { id: 82856, title: 'The Mandalorian', key: 'aOC8E8z_ifw' },
    { id: 92446, title: 'The Family Man', key: 'XatRGut65VI' },
    { id: 299534, title: 'Avengers: Endgame', key: 'TcMBFSGVi1c' },
    { id: 579974, title: 'RRR', key: 'NgBoMJy386M' }
  ];
  
  for (const item of items) {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${item.key}`;
    try {
      const res = await fetch(url);
      if (res.status === 200) {
        const data = await res.json();
        console.log(`✅ ID: ${item.id} | Title: "${item.title}" | Key: ${item.key} -> YES! Title: "${data.title}"`);
      } else {
        console.log(`❌ ID: ${item.id} | Title: "${item.title}" | Key: ${item.key} -> NO (Status: ${res.status})`);
      }
    } catch (e) {
      console.log(`❌ ID: ${item.id} | Title: "${item.title}" | Key: ${item.key} -> ERROR: ${e.message}`);
    }
  }
}
test();
