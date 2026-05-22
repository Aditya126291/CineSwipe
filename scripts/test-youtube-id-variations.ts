const FAILURES = [
  { id: 1399, title: 'Game of Thrones', key: '8iWRuVBgaVI' },
  { id: 1668, title: 'Friends', key: 'q-9kP_wX54I' },
  { id: 2316, title: 'The Office', key: '525jTjJ985E' },
  { id: 76479, title: 'The Boys', key: '06rueuL3s5o' },
  { id: 80894, title: 'Sacred Games', key: 'D-mG87-3tVs' },
  { id: 93405, title: 'Squid Game', key: 'F6VQV-016E8' },
  { id: 104770, title: 'Scam 1992: The Harshad Mehta Story', key: 'Xh9sMh_yF_w' },
  { id: 114461, title: 'Ahsoka', key: 'Hpk2J1n89H4' },
  { id: 572802, title: 'Aquaman and the Lost Kingdom', key: '2UUx3iw_8Xs' },
  { id: 784606, title: 'K.G.F: Chapter 2', key: 'DCyMTsn2u94' },
  { id: 811656, title: 'Pushpa: The Rise', key: 'Q1Nzs820QdY' }
];

// Helper to generate candidate variations for confusing characters
function getVariations(key: string): string[] {
  const vars: string[] = [key];
  
  // Try swapping I, l, 1
  for (let i = 0; i < key.length; i++) {
    const char = key[i];
    if (char === 'I' || char === 'l' || char === '1') {
      for (const rep of ['I', 'l', '1']) {
        const newKey = key.substring(0, i) + rep + key.substring(i + 1);
        if (!vars.includes(newKey)) vars.push(newKey);
      }
    }
    if (char === 'O' || char === '0') {
      for (const rep of ['O', '0']) {
        const newKey = key.substring(0, i) + rep + key.substring(i + 1);
        if (!vars.includes(newKey)) vars.push(newKey);
      }
    }
  }
  
  // Also try lowercase/uppercase swap for letters
  const results = [...vars];
  for (const v of vars) {
    // Try lowercase last character
    const lastChar = v[v.length - 1];
    if (lastChar >= 'a' && lastChar <= 'z') {
      const uKey = v.substring(0, v.length - 1) + lastChar.toUpperCase();
      if (!results.includes(uKey)) results.push(uKey);
    } else if (lastChar >= 'A' && lastChar <= 'Z') {
      const lKey = v.substring(0, v.length - 1) + lastChar.toLowerCase();
      if (!results.includes(lKey)) results.push(lKey);
    }
  }
  
  return results;
}

async function checkThumbnail(key: string): Promise<boolean> {
  const url = `https://i3.ytimg.com/vi/${key}/hqdefault.jpg`;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.status === 200;
  } catch (e) {
    return false;
  }
}

async function run() {
  console.log('Searching for correct video variations...');
  
  for (const item of FAILURES) {
    console.log(`\nMovie: "${item.title}" (Base Key: ${item.key})`);
    const variations = getVariations(item.key);
    console.log(`  Testing ${variations.length} variations...`);
    
    let resolved = false;
    for (const v of variations) {
      if (await checkThumbnail(v)) {
        console.log(`  🎉 FOUND WORKING VARIATION: "${v}"`);
        resolved = true;
        break;
      }
      await new Promise(r => setTimeout(r, 20));
    }
    
    if (!resolved) {
      console.log(`  ❌ No simple character variations worked for "${item.title}".`);
    }
  }
}

run();
