const PROPOSED: Record<number, { title: string; key: string }> = {
  550: { title: 'Fight Club', key: '_XgQA9Ab0Gw' },
  1399: { title: 'Game of Thrones', key: 's1QUmSi1P-k' },
  1668: { title: 'Friends', key: 'HRXBrrdtiXc' },
  2316: { title: 'The Office', key: 'R9X2k59WjYI' },
  19995: { title: 'Avatar', key: '5PSNL1qE6VY' },
  76479: { title: 'The Boys', key: '06rueu_fh30' },
  80894: { title: 'Sacred Games', key: 'wcP3_Z-j0dY' },
  84958: { title: 'Loki', key: 'nW948Va-l10' },
  93405: { title: 'Squid Game', key: 'oqxA92N9v5k' },
  98114: { title: 'Panchayat', key: 'mojZJ7oeD_g' },
  104770: { title: 'Scam 1992: The Harshad Mehta Story', key: 'gQWYnlfLlds' },
  114461: { title: 'Ahsoka', key: 'JWaYx51T6-E' },
  157336: { title: 'Interstellar', key: '0vxOhd4qlnA' },
  256040: { title: 'Baahubali: The Beginning', key: '3NQRhE772b0' },
  350312: { title: 'Baahubali 2: The Conclusion', key: 'G62HrubdD6o' },
  554600: { title: 'Uri: The Surgical Strike', key: 'VVY3do673Zc' },
  572802: { title: 'Aquaman and the Lost Kingdom', key: '2UUU5SHbbQE' },
  693134: { title: 'Dune: Part Two', key: 'Way9Dexny3w' },
  784606: { title: 'K.G.F: Chapter 2', key: 'yGgYtNOhT2w' },
  811656: { title: 'Pushpa: The Rise', key: 'Q1NTPgP-H0A' }
};

async function run() {
  console.log('Validating final resolved YouTube keys...');
  let successCount = 0;
  
  for (const [id, info] of Object.entries(PROPOSED)) {
    const embedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${info.key}`;
    try {
      const res = await fetch(embedUrl);
      if (res.status === 200) {
        const metadata: any = await res.json();
        console.log(`✅ ID: ${id} | Title: "${info.title}" | Key: ${info.key} -> YT Title: "${metadata.title}"`);
        successCount++;
      } else {
        console.log(`❌ ID: ${id} | Title: "${info.title}" | Key: ${info.key} -> Status: ${res.status}`);
      }
    } catch (e: any) {
      console.log(`❌ ID: ${id} | Title: "${info.title}" | Key: ${info.key} -> Error: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 100)); // be nice to YT
  }
  
  console.log(`\nResult: ${successCount} / ${Object.keys(PROPOSED).length} verified working!`);
}

run();
