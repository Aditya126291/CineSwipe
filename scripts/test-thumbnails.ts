const PROPOSED: Record<number, { title: string; key: string }> = {
  550: { title: 'Fight Club', key: '_XgQA9Ab0Gw' },
  1399: { title: 'Game of Thrones', key: '8iWRuVBgaVI' },
  1668: { title: 'Friends', key: 'q-9kP_wX54I' },
  2316: { title: 'The Office', key: '525jTjJ985E' },
  19995: { title: 'Avatar', key: '5PSNL1qE6VY' },
  76479: { title: 'The Boys', key: '06rueuL3s5o' },
  80894: { title: 'Sacred Games', key: 'D-mG87-3tVs' },
  84958: { title: 'Loki', key: 'nW948Va-l10' },
  93405: { title: 'Squid Game', key: 'F6VQV-016E8' },
  98114: { title: 'Panchayat', key: 'mojZJ7oeD_g' },
  104770: { title: 'Scam 1992: The Harshad Mehta Story', key: 'Xh9sMh_yF_w' },
  114461: { title: 'Ahsoka', key: 'Hpk2J1n89H4' },
  157336: { title: 'Interstellar', key: '0vxOhd4qlnA' },
  256040: { title: 'Baahubali: The Beginning', key: '3NQRhE772b0' },
  350312: { title: 'Baahubali 2: The Conclusion', key: 'G62HrubdD6o' },
  554600: { title: 'Uri: The Surgical Strike', key: 'VVY3do673Zc' },
  572802: { title: 'Aquaman and the Lost Kingdom', key: '2UUx3iw_8Xs' },
  693134: { title: 'Dune: Part Two', key: 'Way9Dexny3w' },
  784606: { title: 'K.G.F: Chapter 2', key: 'DCyMTsn2u94' },
  811656: { title: 'Pushpa: The Rise', key: 'Q1Nzs820QdY' }
};

async function run() {
  console.log('Validating final resolved YouTube keys via Thumbnail CDN...');
  let successCount = 0;
  
  for (const [id, info] of Object.entries(PROPOSED)) {
    const imgUrl = `https://i3.ytimg.com/vi/${info.key}/hqdefault.jpg`;
    try {
      const res = await fetch(imgUrl, { method: 'HEAD' });
      if (res.status === 200) {
        console.log(`✅ ID: ${id} | Title: "${info.title}" | Key: ${info.key} -> Thumbnail: EXISTS`);
        successCount++;
      } else {
        console.log(`❌ ID: ${id} | Title: "${info.title}" | Key: ${info.key} -> Thumbnail: NOT FOUND (Status: ${res.status})`);
      }
    } catch (e: any) {
      console.log(`❌ ID: ${id} | Title: "${info.title}" | Key: ${info.key} -> Error: ${e.message}`);
    }
  }
  
  console.log(`\nResult: ${successCount} / ${Object.keys(PROPOSED).length} verified working!`);
}

run();
