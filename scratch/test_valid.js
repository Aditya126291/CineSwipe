async function test() {
  const keys = ['KPLWWIOCOOQ', 'giYeaKsXnsI', 'rlR4PJn8b8I', 'BIpJrYx3g50', 'BpJynZe_a1s'];
  for (const key of keys) {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${key}`;
    try {
      const res = await fetch(url);
      if (res.status === 200) {
        const data = await res.json();
        console.log(`Key: ${key} -> YES! Title: "${data.title}"`);
      } else {
        console.log(`Key: ${key} -> NO (Status: ${res.status})`);
      }
    } catch (e) {
      console.log(`Key: ${key} -> ERROR: ${e.message}`);
    }
  }
}
test();
