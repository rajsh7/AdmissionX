async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/search/colleges?limit=3');
    const data = await res.json();
    console.log(JSON.stringify(data.colleges.map((c: any) => ({ name: c.name, image: c.image })), null, 2));
  } catch(e) { console.error(e); }
}
run();
